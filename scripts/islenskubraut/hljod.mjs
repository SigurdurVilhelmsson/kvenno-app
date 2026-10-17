/**
 * "Hlustaðu": a recording of every word, frame and worked example on the cards (docs/research/
 * islenskubraut-additions/, item 5), so a student who cannot yet read Icelandic can hear it.
 *
 * The clips are synthesised, not recorded, by `scripts/islenskubraut/hljod/talgerving.py` on a
 * machine with the voice installed (see content/islenskubraut/hljod/README.md), into
 * `apps/islenskubraut/public/hljod/<name>.mp3`, named by a hash of the text so an edited text gets
 * a new clip. `content/islenskubraut/hljod/hljod.yaml` lists every clip and whether a person has
 * listened to it; **only approved clips play for students**, and one marked `rangt` is never
 * approved until it is made again.
 *
 * Pure: `hljod-check.mjs` and `build.mjs` do the reading and writing.
 */
import { createHash } from 'node:crypto';

import { LEVELS } from './load.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(`hljod: ${message}`);
}

/**
 * Every text on the cards a student can listen to, with where it appears: the chips at every
 * level, the vocabulary page's words, the frames and the worked examples. A Map from the text
 * exactly as printed to a list of places `{ category, level, where }`, in content order. `level`
 * is null for the vocabulary page, which is the same at every level.
 */
export function textsToVoice(categories) {
  const texts = new Map();
  const add = (text, category, level, where) => {
    if (!texts.has(text)) texts.set(text, []);
    texts.get(text).push({ category, level, where });
  };
  for (const c of categories) {
    for (const s of c.subCategories) for (const o of s.options) add(o, c.id, null, s.name);
    for (const q of c.guidingQuestions) {
      for (const level of LEVELS) {
        const options = q.answers.find((a) => a.level === level)?.options ?? [];
        for (const o of options) add(o, c.id, level, q.question);
      }
    }
    for (const f of c.sentenceFrames) for (const x of f.frames) add(x, c.id, f.level, 'rammi');
    for (const e of c.examples) add(e.text, c.id, e.level, 'dæmi');
  }
  return texts;
}

/** A place as one line: `dyr A1: Hvernig lítur það út?`. */
export function placeLabel({ category, level, where }) {
  return `${category}${level ? ` ${level}` : ''}: ${where}`;
}

/** The clip's file name: a hash of the text, so editing a text needs a new clip. */
export function clipName(text) {
  return `${createHash('sha256').update(text, 'utf8').digest('hex').slice(0, 16)}.mp3`;
}

/**
 * What the voice is given to say for a text as printed. A blank in a frame is a pause, a slash
 * is a choice and is said `eða` (`Hún/Hann er`, `á sjó/vatni`, `rauður/rauð/rautt`), and a word
 * in brackets (`húsdýr (búfénaður)`) is said after a pause.
 */
export function spoken(text) {
  return text
    .replace(/_{2,}/g, '…')
    .replace(/\s*\/\s*/g, ' eða ')
    .replace(/\s*\(([^)]*)\)/g, ', $1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The value in `hljod.yaml` for a clip a teacher heard as wrong: students never hear it (it
 * plays only as a draft, under `?drog` and on the listening page), and a review heard before it
 * was marked cannot approve it. Making the clip again sets it back to `false` (`syncState`). */
export const REJECTED = 'rangt';

/**
 * `hljod.yaml`: the voice the clips were made with, and per text whether a person has listened
 * to it and agrees: `true`, `false` (not yet, or not settled) or `rangt`. Returns
 * `{ voice, clips: Map(text → approved), rejected: Set(text) }`; a `rangt` clip is not approved.
 */
export function readHljod(raw) {
  assert(raw && typeof raw === 'object', 'hljod.yaml must be a map');
  const { voice, clips = {}, ...rest } = raw;
  assert(Object.keys(rest).length === 0, `hljod.yaml has unknown keys: ${Object.keys(rest)}`);
  assert(typeof voice === 'string' && voice.trim() !== '', 'hljod.yaml must name its `voice`');
  assert(
    clips && typeof clips === 'object',
    '`clips` must be a map of text → true, false or rangt'
  );
  const out = new Map();
  const rejected = new Set();
  for (const [text, value] of Object.entries(clips)) {
    assert(
      typeof value === 'boolean' || value === REJECTED,
      `"${text}": write true, false or ${REJECTED}`
    );
    out.set(text, value === true);
    if (value === REJECTED) rejected.add(text);
  }
  return { voice, clips: out, rejected };
}

/** A short hash of a clip's audio, so a verdict given to one recording is not taken for a
 * remade one: the file keeps its name (a hash of the text) when it is made again. */
export function clipVersion(bytes) {
  return createHash('sha256').update(bytes).digest('hex').slice(0, 12);
}

/** A clip's value in `hljod.yaml` as written: `true`, `false` or `rangt`. */
export function valueOf(manifest, text) {
  return manifest.clips.get(text) ? true : manifest.rejected.has(text) ? REJECTED : false;
}

const VALUES = [true, false, REJECTED];

/**
 * `stada.json`, the tools' record of every listed clip with a file: the version of its audio,
 * the value `hljod.yaml` gave it, and when that value was set (`{ v, value, at }`). It is written
 * by `pnpm islenskubraut:hljod --record` and `pnpm islenskubraut:yfirferd --apply`, never by hand.
 * It ties an approval to the audio approved, and lets a person's decision stand against verdicts
 * given before it.
 */
export function readState(raw) {
  assert(raw && typeof raw === 'object' && !Array.isArray(raw), 'stada.json must be a map');
  for (const [text, e] of Object.entries(raw)) {
    assert(
      e && typeof e.v === 'string' && VALUES.includes(e.value) && typeof e.at === 'string',
      `stada.json: "${text}" needs v, value and at`
    );
  }
  return raw;
}

/**
 * Bring the record into line with `hljod.yaml` and the files. A clip new to it, or whose value was
 * changed by hand, is stamped `now`. A clip whose audio has changed is a recording nobody has
 * heard, so its value goes back to `false`: an approval or a `rangt` was for the old audio.
 * `version(text)` is the clip's current version, or null when it has no file. Returns
 * `{ state, reset, stamped }`, `reset` being the texts whose `hljod.yaml` value must become false.
 */
export function syncState(manifest, state, version, now) {
  const next = {};
  const reset = [];
  const stamped = [];
  for (const text of [...manifest.clips.keys()].sort()) {
    const v = version(text);
    const value = valueOf(manifest, text);
    const was = state[text];
    if (v === null) {
      if (was) next[text] = was;
    } else if (!was || (was.v === v && was.value !== value)) {
      next[text] = { v, value, at: now };
      stamped.push(text);
    } else if (was.v !== v) {
      next[text] = { v, value: false, at: now };
      if (value !== false) reset.push(text);
    } else {
      next[text] = was;
    }
  }
  return { state: next, reset, stamped };
}

/**
 * Where the record and `hljod.yaml` or the files disagree: a listed clip with a file and no
 * record, a record for other audio, or a value changed since it was recorded. The build refuses
 * all three, so a replaced recording is never approved unheard; `--record` mends them.
 */
export function stateProblems(manifest, state, version) {
  const out = [];
  for (const text of manifest.clips.keys()) {
    const v = version(text);
    if (v === null) continue;
    const was = state[text];
    if (!was) out.push(`"${text}" is not in stada.json`);
    else if (was.v !== v) out.push(`"${text}": its audio has changed since it was recorded`);
    else if (was.value !== valueOf(manifest, text)) {
      out.push(`"${text}": hljod.yaml says ${valueOf(manifest, text)}, recorded ${was.value}`);
    }
  }
  return out;
}

/**
 * Compare the manifest with the content and the files on disk. Returns
 * `{ missing, stale, noFile }`: texts on the cards with no clip yet, clips for texts no longer on
 * the cards, and clips listed with no file. Only `noFile` among approved clips is an error for the
 * build: a missing clip just means no play button, and a stale one plays nowhere.
 */
export function compare(texts, manifest, hasFile) {
  const missing = [...texts.keys()].filter((t) => !manifest.clips.has(t));
  const stale = [...manifest.clips.keys()].filter((t) => !texts.has(t));
  const noFile = [...manifest.clips.keys()].filter((t) => !hasFile(clipName(t)));
  return { missing, stale, noFile };
}

/** The generated module's data: every clip on the cards that has a file, by its text. */
export function clipsForApp(texts, manifest, hasFile) {
  const out = {};
  for (const [text, approved] of manifest.clips) {
    if (!texts.has(text)) continue;
    const file = clipName(text);
    if (!hasFile(file)) {
      assert(!approved, `"${text}" is approved but ${file} is missing`);
      continue;
    }
    out[text] = { file, approved };
  }
  return out;
}

/**
 * `hlustun.json`, what a speech recogniser heard in each clip (`hljod/hlustun.py`): per text,
 * `{ heard, score, v }`, the score the share of letters that differ (0 is a match) and `v` the
 * version of the audio it heard. Optional; a clip with no entry, or an entry for other audio, was
 * simply not checked.
 */
export function readHeard(raw) {
  assert(raw && typeof raw === 'object' && !Array.isArray(raw), 'hlustun.json must be a map');
  for (const [text, entry] of Object.entries(raw)) {
    assert(
      entry &&
        typeof entry.heard === 'string' &&
        typeof entry.score === 'number' &&
        typeof entry.v === 'string',
      `hlustun.json: "${text}" needs heard, score and v`
    );
  }
  return raw;
}

/**
 * The listening page's data: every clip on the cards that has a file, with where it appears,
 * whether it is approved or was heard as wrong, the audio's version (`version(file)`, see
 * `clipVersion`), what the voice was told to say when that is not the text as printed, and what
 * the recogniser heard. In content order.
 */
export function clipsForReview(texts, manifest, hasFile, heard = {}, version = () => '') {
  const out = [];
  for (const [text, places] of texts) {
    const file = clipName(text);
    if (!manifest.clips.has(text) || !hasFile(file)) continue;
    const v = version(file);
    // A reading of other audio says nothing about this recording.
    const h = heard[text]?.v === v ? heard[text] : undefined;
    const say = spoken(text);
    out.push({
      text,
      file,
      v,
      approved: manifest.clips.get(text),
      ...(manifest.rejected?.has(text) ? { rejected: true } : {}),
      places,
      ...(say !== text ? { say } : {}),
      ...(h ? { heard: h.heard, score: h.score } : {}),
    });
  }
  return out;
}
