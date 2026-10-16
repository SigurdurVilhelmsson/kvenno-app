/**
 * "Á þínu máli": a student's own language beside the card's words (docs/research/
 * islenskubraut-additions/, item 8). The research's best-evidenced item, and the one where a wrong
 * word does the most harm, so **only a language a named speaker has approved reaches students**.
 *
 * `content/islenskubraut/glossur/<code>.yaml` is one language: its glosses, shared across cards
 * with per-card overrides for a chip that means something else there (`hátt` is loud on Dýr and
 * tall on Staðir), and optionally a dictionary that looks a word up by URL. A language can be a
 * dictionary alone: Árnastofnun's Icelandic–Polish dictionary has every chip, checked by its
 * editors, so it needs no glosses written here at all.
 *
 * Pure: `build.mjs` does the reading and writing.
 */
import { LEVELS } from './load.mjs';
import { findInvisible } from './text.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(`glossur: ${message}`);
}

/** Every chip a card offers, at any level. */
function chipsOf(category) {
  return new Set(category.guidingQuestions.flatMap((q) => q.answers.flatMap((a) => a.options)));
}

/** The chips a card offers at A1, which an approved language must gloss first. */
function a1Chips(category) {
  return new Set(
    category.guidingQuestions.flatMap((q) => q.answers.find((a) => a.level === LEVELS[0])?.options ?? [])
  );
}

function checkGloss(value, where) {
  assert(typeof value === 'string' && value.trim() !== '', `${where} must be text`);
  assert(findInvisible(value).length === 0, `${where} contains an invisible character`);
}

/**
 * One language's file, checked against the cards. Returns the language with its glosses resolved
 * per category: `{ code, name, dir, approved, approvedBy, dictionary, words: { [categoryId]:
 * { [chip]: gloss } } }`.
 */
export function readGlossur(raw, code, categories) {
  const where = `${code}.yaml`;
  assert(raw && typeof raw === 'object', `${where} must be a map`);
  const {
    name,
    dir = 'ltr',
    approved = false,
    approvedBy = null,
    dictionary = null,
    words = {},
    categories: overrides = {},
    ...rest
  } = raw;
  assert(Object.keys(rest).length === 0, `${where} has unknown keys: ${Object.keys(rest)}`);
  assert(/^[a-z]{2,3}$/.test(code), `${where}: name the file by its language code (pl, uk, ar)`);
  checkGloss(name, `${where}: name`);
  assert(dir === 'ltr' || dir === 'rtl', `${where}: dir must be ltr or rtl`);
  assert(typeof approved === 'boolean', `${where}: approved must be true or false`);
  if (approved) {
    assert(
      typeof approvedBy === 'string' && approvedBy.trim() !== '',
      `${where}: an approved language names who approved it (approvedBy)`
    );
  }
  if (dictionary !== null) {
    assert(
      typeof dictionary === 'string' && dictionary.startsWith('https://') && dictionary.includes('{word}'),
      `${where}: dictionary must be an https address with {word} where the word goes`
    );
  }

  const known = new Set(categories.flatMap((c) => [...chipsOf(c)]));
  for (const [chip, gloss] of Object.entries(words ?? {})) {
    assert(known.has(chip), `${where}: "${chip}" is not a chip on any card`);
    checkGloss(gloss, `${where}: ${chip}`);
  }
  for (const [id, map] of Object.entries(overrides ?? {})) {
    const category = categories.find((c) => c.id === id);
    assert(category, `${where}: categories names no card ${id}`);
    const chips = chipsOf(category);
    for (const [chip, gloss] of Object.entries(map)) {
      assert(chips.has(chip), `${where}: "${chip}" is not a chip on ${id}`);
      checkGloss(gloss, `${where}: ${id} ${chip}`);
    }
  }

  const resolved = Object.fromEntries(
    categories.map((c) => [
      c.id,
      Object.fromEntries(
        [...chipsOf(c)]
          .map((chip) => [chip, overrides?.[c.id]?.[chip] ?? words?.[chip]])
          .filter(([, gloss]) => gloss !== undefined)
      ),
    ])
  );

  // A language with glosses must gloss every A1 chip before students see it; a dictionary alone
  // covers every word by itself.
  const glossed = Object.keys(words ?? {}).length + Object.keys(overrides ?? {}).length > 0;
  assert(glossed || dictionary, `${where} has neither glosses nor a dictionary`);
  if (approved && glossed) {
    const missing = categories.flatMap((c) =>
      [...a1Chips(c)].filter((chip) => !(chip in resolved[c.id])).map((chip) => `${c.id}: ${chip}`)
    );
    assert(missing.length === 0, `${where} is approved but has no gloss for ${missing.join(', ')}`);
  }

  return { code, name, dir, approved, approvedBy, dictionary, words: resolved };
}
