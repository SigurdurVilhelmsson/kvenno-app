/**
 * Category <-> flat spreadsheet rows.
 *
 * Answer and option lists are replaced WHOLESALE per group, in sheet order. That
 * is what makes add, remove and reorder free for a reviewer: copy a row to add,
 * delete a row to remove, drag a row to reorder. No action column, no per-string
 * ids, nothing to get wrong.
 *
 * The group key repeats on every row because Excel users sort columns, and a
 * layout relying on blank continuation cells breaks the moment someone does.
 */
import { LEVELS } from './load.mjs';

const row = (lykill, gerd, stig, samhengi, islenska) => ({
  lykill,
  gerd,
  stig,
  samhengi,
  islenska,
  athugasemd: '',
});

export function toRows(category) {
  const rows = [row(`${category.id}.description`, 'Lýsing', '', '', category.description)];

  category.subCategories.forEach((sub, i) => {
    const id = `${category.id}.s${i + 1}`;
    rows.push(row(`${id}.name`, 'Undirflokkur', '', '', sub.name));
    for (const option of sub.options)
      rows.push(row(`${id}.options`, 'Valkostur', '', sub.name, option));
  });

  category.sentenceFrames.forEach((frame, i) => {
    const id = `${category.id}.f${i + 1}`;
    for (const text of frame.frames) rows.push(row(id, 'Setningarammi', frame.level, '', text));
  });

  category.guidingQuestions.forEach((q, i) => {
    const id = `${category.id}.q${i + 1}`;
    rows.push(row(id, 'Spurning', '', '', q.question));
    for (const answer of q.answers) {
      for (const option of answer.options) {
        rows.push(row(`${id}.${answer.level}`, 'Svar', answer.level, q.question, option));
      }
    }
  });

  return rows;
}

/** Group rows by lykill, preserving first-appearance order of the groups. */
function group(rows) {
  const out = new Map();
  for (const r of rows) {
    if (!out.has(r.lykill)) out.set(r.lykill, []);
    out.get(r.lykill).push(r);
  }
  return out;
}

function require1(groups, key) {
  const g = groups.get(key);
  if (!g || g.length === 0) throw new Error(`islenskubraut: ${key} has no rows`);
  return g[0].islenska;
}

function requireMany(groups, key) {
  const g = groups.get(key);
  if (!g || g.length === 0)
    throw new Error(`islenskubraut: ${key} has no rows — a group cannot be emptied`);
  return g.map((r) => r.islenska);
}

/**
 * Rebuild a category from rows. `base` supplies the fields the sheet does not
 * carry (id, name, icon, color, and each question's icon), which are structural
 * rather than reviewable prose. Always the real category loaded from YAML in
 * production — never inferred, since a fabricated fallback would hardcode one
 * category's identity into a module that must handle all six.
 */
export function fromRows(categoryId, rows, base) {
  const groups = group(rows);

  const subCount = [...groups.keys()].filter((k) =>
    new RegExp(`^${categoryId}\\.s\\d+\\.name$`).test(k)
  ).length;
  const frameKeys = [...groups.keys()].filter((k) => new RegExp(`^${categoryId}\\.f\\d+$`).test(k));
  const qKeys = [...groups.keys()].filter((k) => new RegExp(`^${categoryId}\\.q\\d+$`).test(k));

  return {
    ...base,
    description: require1(groups, `${categoryId}.description`),
    subCategories: Array.from({ length: subCount }, (_, i) => ({
      name: require1(groups, `${categoryId}.s${i + 1}.name`),
      options: requireMany(groups, `${categoryId}.s${i + 1}.options`),
    })),
    sentenceFrames: frameKeys.map((key) => ({
      level: groups.get(key)[0].stig,
      frames: requireMany(groups, key),
    })),
    guidingQuestions: qKeys.map((key) => {
      const answers = LEVELS.filter((l) => groups.has(`${key}.${l}`)).map((level) => ({
        level,
        options: requireMany(groups, `${key}.${level}`),
      }));
      if (answers.length === 0)
        throw new Error(`islenskubraut: ${key} has no answers at any level`);
      // Icon is looked up by the question's own number (from its key), not by its
      // position within qKeys — qKeys order tracks sheet order, which a reviewer
      // is free to reorder or shorten by deleting a question. Indexing by position
      // would silently reassign icons to the wrong question the moment either happens.
      const n = Number(key.slice(`${categoryId}.q`.length));
      return {
        question: require1(groups, key),
        icon: base.guidingQuestions?.[n - 1]?.icon ?? '❓',
        answers,
      };
    }),
  };
}
