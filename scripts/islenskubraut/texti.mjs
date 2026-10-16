/**
 * "Frá tali til texta", the talk-to-write sheet on each card (docs/research/
 * islenskubraut-additions/, item 4). A student says it with the card's frames, reads a short model
 * text with its stages named, fills a gapped copy of the same text, then writes their own.
 *
 * `content/islenskubraut/texti/<flokkur>.yaml` holds one model text per level. This module
 * validates it and makes the gaps: a word is a gap where BÍN reads it as a form of a word the card
 * offers at that level (`feld` for the chip `feldur`), and a phrase is a gap where it is a chip as
 * printed (`á morgnana`). Each word or phrase is a gap once, the first time it appears.
 *
 * Pure: `build.mjs` does the reading and writing, and passes in the saved BÍN lookups.
 */
import { candidateForms, lower } from './bin.mjs';
import { LEVELS } from './load.mjs';
import { findInvisible, isFlattened } from './text.mjs';

/** Too few gaps and step 3 tests nothing; a level's text must give the student this many. */
export const MIN_GAPS = 4;
export const MIN_STAGES = 2;

/** BÍN's word classes for nouns, adjectives and verbs: what a gap is made of. */
const CONTENT_CLASSES = new Set(['no', 'lo', 'so']);

const WORD_RE = /\p{L}+/gu;

function assert(condition, message) {
  if (!condition) throw new Error(`texti: ${message}`);
}

function checkText(value, where) {
  assert(typeof value === 'string' && value.trim() !== '', `${where} must be text`);
  assert(findInvisible(value).length === 0, `${where} contains an invisible character`);
  assert(!isFlattened(value), `${where} looks ASCII-flattened — "${value}"`);
}

/**
 * One category's file. Returns `{ confirmed, levels: { A1: { genre, stages: [{ name, text }] } } }`
 * with every level present.
 */
export function readTexti(raw, categoryId) {
  const where = `${categoryId}.yaml`;
  assert(raw && typeof raw === 'object', `${where} must be a map`);
  const { confirmed = false, ...levels } = raw;
  assert(typeof confirmed === 'boolean', `${where}: confirmed must be true or false`);
  const unknown = Object.keys(levels).filter((k) => !LEVELS.includes(k));
  assert(unknown.length === 0, `${where} has unknown keys: ${unknown}`);
  return {
    confirmed,
    levels: Object.fromEntries(
      LEVELS.map((level) => {
        const at = `${where} ${level}`;
        const entry = levels[level];
        assert(entry && typeof entry === 'object', `${at} is missing`);
        const { genre, stages, ...extra } = entry;
        assert(Object.keys(extra).length === 0, `${at} has unknown keys: ${Object.keys(extra)}`);
        checkText(genre, `${at}.genre`);
        assert(
          Array.isArray(stages) && stages.length >= MIN_STAGES,
          `${at} needs at least ${MIN_STAGES} stages`
        );
        return [
          level,
          {
            genre,
            stages: stages.map((stage, i) => {
              const { name, text, ...more } = stage ?? {};
              assert(Object.keys(more).length === 0, `${at} stages[${i}] has unknown keys`);
              checkText(name, `${at} stages[${i}].name`);
              checkText(text, `${at} stages[${i}].text`);
              return { name, text: text.trim() };
            }),
          },
        ];
      })
    ),
  };
}

/** The saved BÍN entry for a word as written: lower case first, as the BÍN check looks it up. */
function lookup(word, cache) {
  for (const form of candidateForms(word)) if (cache[form]?.found) return cache[form];
  return undefined;
}

/** The chips a card offers at a level, a slashed chip (`fullorðin/fullorðinn`) as each word. */
function chipsAt(category, level) {
  return category.guidingQuestions
    .flatMap((q) => q.answers.find((a) => a.level === level)?.options ?? [])
    .flatMap((chip) => chip.split('/'))
    .map((chip) => chip.trim());
}

/**
 * The level's text with its gaps. Returns `{ stages: [{ name, parts }], bank }`: each part is
 * `{ text }` or `{ gap }`, and the bank is every gap's word in Icelandic alphabetical order.
 *
 * Throws on a word the saved BÍN lookups do not have — run `pnpm islenskubraut:bin --fetch` —
 * and on a text with fewer than `MIN_GAPS` gaps.
 */
export function gapText(text, category, level, cache) {
  const chips = chipsAt(category, level);
  const phrases = chips
    .filter((c) => c.includes(' '))
    .map(lower)
    .sort((a, b) => b.length - a.length);
  // Each content-word lemma of a one-word chip, by BÍN's id for it. A chip BÍN does not know
  // (`þríhyrningslaga`, ekki-i-bin.yaml) can only be matched as written.
  const lemmas = new Set();
  const unknown = new Set();
  for (const chip of chips.filter((c) => !c.includes(' '))) {
    const entry = lookup(chip, cache);
    if (entry) {
      for (const l of entry.lemmas) if (CONTENT_CLASSES.has(l.ofl)) lemmas.add(l.guid);
    } else {
      assert(
        candidateForms(chip).every((f) => Object.hasOwn(cache, f)),
        `${category.id} ${level}: the chip "${chip}" was never looked up — run pnpm islenskubraut:bin --fetch`
      );
      unknown.add(lower(chip));
    }
  }

  const used = new Set();
  const bank = [];
  const stages = text.stages.map(({ name, text: s }) => {
    const parts = [];
    let plain = '';
    let i = 0;
    const flush = () => {
      if (plain) parts.push({ text: plain });
      plain = '';
    };
    // The bank is in lower case, so a capital does not give away which gap starts a sentence.
    const gap = (word, keys) => {
      flush();
      parts.push({ gap: word });
      bank.push(lower(word));
      for (const key of keys) used.add(key);
    };
    while (i < s.length) {
      const rest = lower(s.slice(i));
      const atWordStart = i === 0 || !/\p{L}/u.test(s[i - 1]);
      const phrase =
        atWordStart &&
        phrases.find(
          (p) => rest.startsWith(p) && !/\p{L}/u.test(rest[p.length] ?? '') && !used.has(p)
        );
      if (phrase) {
        gap(s.slice(i, i + phrase.length), [phrase]);
        i += phrase.length;
        continue;
      }
      WORD_RE.lastIndex = i;
      const m = WORD_RE.exec(s);
      if (!m || m.index !== i) {
        plain += s[i];
        i += 1;
        continue;
      }
      const word = m[0];
      const entry = lookup(word, cache);
      // A word BÍN was asked about and does not know can still be a chip it does not know.
      assert(
        entry || candidateForms(word).every((f) => Object.hasOwn(cache, f)),
        `${category.id} ${level}: "${word}" is not in the saved BÍN lookups — run pnpm islenskubraut:bin --fetch`
      );
      // BÍN can list one word under several lemmas (`þyrla` the noun and the verb); once any of
      // them has been a gap, the word is not one again.
      const matches = (entry?.lemmas ?? []).filter((l) => lemmas.has(l.guid)).map((l) => l.guid);
      if (matches.length > 0 && !matches.some((g) => used.has(g))) gap(word, matches);
      else if (unknown.has(lower(word)) && !used.has(lower(word))) gap(word, [lower(word)]);
      else plain += word;
      i += word.length;
    }
    flush();
    return { name, parts };
  });

  assert(
    bank.length >= MIN_GAPS,
    `${category.id} ${level}: the text has ${bank.length} words from the card; it needs ${MIN_GAPS}`
  );
  return { stages, bank: [...bank].sort((a, b) => a.localeCompare(b, 'is')) };
}

/** Every category's sheet at every level, resolved, for the generated server module. */
export function allTexts(texts, categories, cache) {
  return Object.fromEntries(
    categories
      .filter((c) => texts[c.id])
      .map((c) => [
        c.id,
        {
          confirmed: texts[c.id].confirmed,
          levels: Object.fromEntries(
            LEVELS.map((l) => {
              const t = texts[c.id].levels[l];
              return [l, { genre: t.genre, ...gapText(t, c, l, cache) }];
            })
          ),
        },
      ])
  );
}
