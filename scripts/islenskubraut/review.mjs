/**
 * The pure half of the Excel review round-trip: a reviewed worksheet -> rows,
 * a category -> YAML text, and a human-readable diff between two categories.
 *
 * Kept out of `import-xlsx.mjs` for the same reason `rows.mjs` is kept out of
 * `export-xlsx.mjs`: this is the logic worth testing, and a test cannot reach
 * code that only runs when a CLI parses argv. The CLI stays thin.
 */
import ExcelJS from 'exceljs';
import { stringify } from 'yaml';

import { findInvisible, isFlattened, normalizeText } from './text.mjs';

/**
 * Cell types whose text we trust. Excel silently coerces what a reviewer types:
 * a date, a formula or an error renders as something plausible through `.text`
 * ("Sun Mar 01 2026 00:00:00 GMT+0000") while carrying none of the intended
 * string. Accepting those is the silent-corruption failure this whole pipeline
 * exists to prevent, so they are refused rather than repaired.
 */
const ACCEPTED_TYPES = new Set([
  ExcelJS.ValueType.Null,
  ExcelJS.ValueType.String,
  ExcelJS.ValueType.SharedString,
  ExcelJS.ValueType.RichText,
  ExcelJS.ValueType.Number,
]);

const TYPE_NAMES = Object.fromEntries(
  Object.entries(ExcelJS.ValueType).map(([name, value]) => [value, name])
);

/**
 * `cell.text`, never `String(cell.value)`. A cell holding text pasted from Word
 * comes back as `{ richText: [...] }`, which stringifies to "[object Object]" —
 * a non-empty string that passes every validator and reaches a student's card.
 */
const text = (row, column) => row.getCell(column).text ?? '';

const problem = (message, fatal) => ({ message, fatal });

/** Find the header row by locating `lykill`, so the instruction block can grow. */
export function headerRowNumber(sheet) {
  for (let n = 1; n <= 20; n += 1) {
    if (text(sheet.getRow(n), 1).trim() === 'lykill') return n;
  }
  throw new Error(`sheet "${sheet.name}": no header row containing "lykill"`);
}

/**
 * The category a sheet belongs to, by majority of its keys rather than by the
 * first row: one typo in the top key would otherwise send the whole sheet at the
 * wrong category and fail with a missing-file error instead of naming the typo.
 */
function categoryIdOf(rows) {
  const counts = new Map();
  for (const r of rows) {
    const id = r.lykill.split('.')[0];
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  let best = null;
  for (const [id, n] of counts) if (!best || n > counts.get(best)) best = id;
  return best;
}

/**
 * Read one reviewed worksheet. Returns the rows `fromRows` consumes, every
 * problem found, and the reviewer's comments.
 */
export function readSheet(sheet) {
  const header = headerRowNumber(sheet);
  const rows = [];
  const problems = [];
  const notes = [];

  sheet.eachRow((row, n) => {
    const where = `${sheet.name} row ${n}`;
    const lykill = text(row, 1).trim();
    const raw = text(row, 5);

    if (n <= header) return;
    // A wholly blank row is Excel padding and carries no intent. A row with text
    // but no key is a reviewer who added a line without copying the key down —
    // dropping it silently would lose exactly the string they sat down to write.
    if (!lykill) {
      if (raw.trim())
        problems.push(
          problem(`${where}: "${raw.trim()}" has no lykill — copy the key from the row above`, true)
        );
      return;
    }

    for (const column of [1, 2, 3, 5, 6]) {
      const type = row.getCell(column).type;
      if (!ACCEPTED_TYPES.has(type)) {
        problems.push(
          problem(
            `${where}: ${lykill} — cell ${column} is a ${TYPE_NAMES[type] ?? type}, not text. ` +
              `Excel converted what was typed; retype it and format the cell as text.`,
            true
          )
        );
        return;
      }
    }

    const islenska = normalizeText(raw);
    if (!islenska) {
      problems.push(
        problem(`${where}: ${lykill} — empty text (delete the row to remove it)`, false)
      );
      return;
    }
    for (const cp of findInvisible(raw)) {
      problems.push(problem(`${where}: ${lykill} — stripped ${cp} from "${raw}"`, false));
    }
    if (isFlattened(islenska)) {
      problems.push(problem(`${where}: ${lykill} — "${islenska}" looks ASCII-flattened`, true));
    }

    const note = normalizeText(text(row, 6));
    if (note) notes.push({ lykill, islenska, note });
    rows.push({ lykill, gerd: text(row, 2), stig: text(row, 3), islenska });
  });

  return { categoryId: categoryIdOf(rows), rows, problems, notes };
}

/** Same YAML shape the migration produced. Ids are positional and get renumbered. */
export function toYamlShape(category) {
  return {
    id: category.id,
    name: category.name,
    icon: category.icon,
    description: category.description,
    color: category.color,
    subCategories: category.subCategories.map((s, i) => ({
      id: `s${i + 1}`,
      name: s.name,
      options: s.options,
    })),
    sentenceFrames: category.sentenceFrames.map((f, i) => ({
      id: `f${i + 1}`,
      level: f.level,
      frames: f.frames,
    })),
    guidingQuestions: category.guidingQuestions.map((q, i) => ({
      id: `q${i + 1}`,
      question: q.question,
      icon: q.icon,
      answers: Object.fromEntries(q.answers.map((a) => [a.level, a.options])),
    })),
  };
}

/**
 * A category as YAML file text. `header` carries any leading comment block from
 * the file being replaced, so a hand-written header survives an import.
 */
export function renderYaml(category, header = '') {
  return `${header}${stringify(toYamlShape(category), { lineWidth: 0, defaultStringType: 'PLAIN' })}`;
}

/** The leading comment block of a YAML file, empty when there is none. */
export function yamlHeader(source) {
  return source.slice(0, source.indexOf('\nid:') + 1);
}

function flatten(category) {
  const out = new Map();
  out.set(`${category.id}.description`, [category.description]);
  category.subCategories.forEach((s, i) =>
    out.set(`${category.id}.s${i + 1}`, [s.name, ...s.options])
  );
  category.sentenceFrames.forEach((f, i) => out.set(`${category.id}.f${i + 1}`, f.frames));
  category.guidingQuestions.forEach((q, i) => {
    out.set(`${category.id}.q${i + 1}`, [q.question]);
    for (const a of q.answers) out.set(`${category.id}.q${i + 1}.${a.level}`, a.options);
  });
  return out;
}

/**
 * Added and removed strings, per key. Keys are positional, so deleting a whole
 * group shifts the ones after it and shows as a run of +/- pairs; the written
 * YAML is unaffected.
 */
export function diffSummary(before, after) {
  const a = flatten(before);
  const b = flatten(after);
  const lines = [];
  for (const [key, next] of b) {
    const prev = a.get(key) ?? [];
    for (const value of next) if (!prev.includes(value)) lines.push(`  + ${key}: ${value}`);
    for (const value of prev) if (!next.includes(value)) lines.push(`  - ${key}: ${value}`);
  }
  return lines.length > 0 ? lines.join('\n') : '  (no change)';
}
