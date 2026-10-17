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

/** The value in `hljod.yaml` for a clip a teacher heard as wrong: it never plays, and
 * `yfirferd-check.mjs --apply` never approves it. Make the clip again, then write `false`. */
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
 * `{ heard, score }`, the score the share of letters that differ (0 is a match). Optional; a clip
 * with no entry was simply not checked.
 */
export function readHeard(raw) {
  assert(raw && typeof raw === 'object' && !Array.isArray(raw), 'hlustun.json must be a map');
  for (const [text, entry] of Object.entries(raw)) {
    assert(
      entry && typeof entry.heard === 'string' && typeof entry.score === 'number',
      `hlustun.json: "${text}" needs heard and score`
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
    const h = heard[text];
    const say = spoken(text);
    out.push({
      text,
      file,
      v: version(file),
      approved: manifest.clips.get(text),
      ...(manifest.rejected?.has(text) ? { rejected: true } : {}),
      places,
      ...(say !== text ? { say } : {}),
      ...(h ? { heard: h.heard, score: h.score } : {}),
    });
  }
  return out;
}
