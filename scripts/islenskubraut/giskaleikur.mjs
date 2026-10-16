/**
 * "Hvað er þetta?", the information-gap guessing game on each card (docs/research/
 * islenskubraut-additions/, item 3). One student holds a secret card describing a thing in the
 * card's own answer words; the other asks the card's questions until they can name it.
 *
 * `content/islenskubraut/giskaleikur/<flokkur>.yaml` lists the things and, per question, the
 * chips that describe them. This module validates them against the card and resolves each
 * level's game: the things a student at that level knows, described only in that level's words.
 *
 * Pure: `build.mjs` does the reading and writing, and the tests drive this with small fixtures.
 */
import { LEVELS } from './load.mjs';
import { findInvisible, isFlattened } from './text.mjs';

/** A game needs enough things to guess among, and each thing enough to say about it. */
export const MIN_ITEMS = 4;
export const MIN_ANSWERS = 3;

function assert(condition, message) {
  if (!condition) throw new Error(`giskaleikur: ${message}`);
}

function checkText(value, where) {
  assert(typeof value === 'string' && value.trim() !== '', `${where} must be text`);
  assert(findInvisible(value).length === 0, `${where} contains an invisible character`);
  assert(!isFlattened(value), `${where} looks ASCII-flattened — "${value}"`);
}

/** How a question is named in the YAML: its label (`Útlit`), or its context kind (`hvar`). */
export const questionKey = (q) => q.label ?? q.context.kind;

const levelIndex = (level) => LEVELS.indexOf(level);

/** The chips a question offers at a level. */
const chipsAt = (q, level) => q.answers.find((a) => a.level === level)?.options ?? [];

/**
 * One category's file, validated against its card. Returns `{ confirmed, items }`, each item
 * `{ name, from, answers: { [questionKey]: chips } }`.
 */
export function readGiskaleikur(raw, category) {
  const where = `${category.id}.yaml`;
  assert(raw && typeof raw === 'object', `${where} must be a map`);
  const { confirmed = false, items, ...rest } = raw;
  assert(Object.keys(rest).length === 0, `${where} has unknown keys: ${Object.keys(rest)}`);
  assert(typeof confirmed === 'boolean', `${where}: confirmed must be true or false`);
  assert(Array.isArray(items), `${where} must have an \`items\` list`);

  const questions = new Map(category.guidingQuestions.map((q) => [questionKey(q), q]));
  const names = new Set();
  return {
    confirmed,
    items: items.map((item, i) => {
      const at = `${where} items[${i}]${item?.name ? ` (${item.name})` : ''}`;
      assert(item && typeof item === 'object', `${at} must be a map`);
      const { name, from, answers, ...extra } = item;
      assert(Object.keys(extra).length === 0, `${at} has unknown keys: ${Object.keys(extra)}`);
      checkText(name, `${at}.name`);
      assert(!names.has(name), `${at}: ${name} is listed twice`);
      names.add(name);
      assert(LEVELS.includes(from), `${at}.from must be one of ${LEVELS.join(', ')}`);
      assert(answers && typeof answers === 'object', `${at}.answers must be a map`);
      for (const [key, chips] of Object.entries(answers)) {
        const q = questions.get(key);
        assert(q, `${at}.answers.${key}: the card has no question ${key}`);
        assert(Array.isArray(chips) && chips.length > 0, `${at}.answers.${key} must list chips`);
        const offered = new Set(LEVELS.flatMap((l) => chipsAt(q, l)));
        for (const chip of chips) {
          assert(offered.has(chip), `${at}.answers.${key}: "${chip}" is not a chip on the card`);
          // The game is to find the name, so the card must not print it.
          assert(chip !== name, `${at}.answers.${key} gives the answer away: "${chip}"`);
        }
      }
      return { name, from, answers };
    }),
  };
}

/**
 * One level's game: the things introduced by that level, each described only in words the card
 * offers at that level, in the card's question order. Throws if the game cannot be played: too
 * few things, too little to say about one, or two that the card describes identically.
 */
export function gameAt(game, category, level) {
  const items = game.items
    .filter((item) => levelIndex(item.from) <= levelIndex(level))
    .map((item) => ({
      name: item.name,
      answers: category.guidingQuestions
        .map((q) => {
          const offered = chipsAt(q, level);
          const chips = (item.answers[questionKey(q)] ?? []).filter((c) => offered.includes(c));
          return { question: q.question, chips };
        })
        .filter((a) => a.chips.length > 0),
    }));

  const where = `${category.id} ${level}`;
  assert(items.length >= MIN_ITEMS, `${where} has ${items.length} things; it needs ${MIN_ITEMS}`);
  for (const item of items) {
    const said = item.answers.length;
    assert(
      said >= MIN_ANSWERS,
      `${where}: the card says ${said} things about ${item.name}; it needs ${MIN_ANSWERS}`
    );
  }
  const profile = (item) => JSON.stringify(item.answers);
  for (let a = 0; a < items.length; a++) {
    for (let b = a + 1; b < items.length; b++) {
      assert(
        profile(items[a]) !== profile(items[b]),
        `${where}: ${items[a].name} and ${items[b].name} are described the same way`
      );
    }
  }
  return items;
}

/** Every category's game at every level, resolved, for the generated server module. */
export function allGames(games, categories) {
  return Object.fromEntries(
    categories
      .filter((c) => games[c.id])
      .map((c) => [
        c.id,
        {
          confirmed: games[c.id].confirmed,
          levels: Object.fromEntries(LEVELS.map((l) => [l, gameAt(games[c.id], c, l)])),
        },
      ])
  );
}
