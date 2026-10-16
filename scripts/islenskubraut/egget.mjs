/**
 * "Ég get…", the can-do statements for each card and level (docs/research/
 * islenskubraut-additions/, item 6): a strip a student rates themselves on, and a class checklist
 * the teacher ticks while a student talks about the card. Nothing is stored and nothing is graded.
 *
 * `content/islenskubraut/egget/<flokkur>.yaml` lists three or four statements per level. This
 * module validates them; `build.mjs` does the reading and writing.
 */
import { LEVELS } from './load.mjs';
import { findInvisible, isFlattened } from './text.mjs';

/** A strip a student can rate in a minute: three or four statements, no more. */
export const MIN_STATEMENTS = 3;
export const MAX_STATEMENTS = 4;

function assert(condition, message) {
  if (!condition) throw new Error(`egget: ${message}`);
}

/** One category's file. Returns `{ confirmed, levels: { A1: [statement, …], … } }`. */
export function readEgget(raw, categoryId) {
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
        const list = levels[level];
        const at = `${where} ${level}`;
        assert(
          Array.isArray(list) && list.length >= MIN_STATEMENTS && list.length <= MAX_STATEMENTS,
          `${at} needs ${MIN_STATEMENTS} to ${MAX_STATEMENTS} statements`
        );
        for (const [i, s] of list.entries()) {
          assert(typeof s === 'string' && s.trim() !== '', `${at}[${i}] must be text`);
          assert(findInvisible(s).length === 0, `${at}[${i}] contains an invisible character`);
          assert(!isFlattened(s), `${at}[${i}] looks ASCII-flattened — "${s}"`);
          // Every statement is something the student can do, said the same way.
          assert(s.startsWith('Ég get '), `${at}[${i}] must start "Ég get …" — "${s}"`);
        }
        assert(new Set(list).size === list.length, `${at} repeats a statement`);
        return [level, list.map((s) => s.trim())];
      })
    ),
  };
}
