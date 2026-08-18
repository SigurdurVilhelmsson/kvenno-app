#!/usr/bin/env node
/** .xlsx -> YAML. Normalises, validates, refuses stale workbooks, prints a diff. */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import ExcelJS from 'exceljs';

import { CONTENT_DIR, loadCategory } from './load.mjs';
import { diffSummary, readSheet, renderYaml, yamlHeader } from './review.mjs';
import { fromRows } from './rows.mjs';

const file = process.argv[2];
const dryRun = process.argv.includes('--dry-run');
const force = process.argv.includes('--force');
if (!file || file.startsWith('--')) {
  console.error('usage: pnpm islenskubraut:import <file.xlsx> [--dry-run] [--force]');
  process.exit(1);
}

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(file);

const meta = new Map();
workbook
  .getWorksheet('_meta')
  ?.eachRow((row) => meta.set(String(row.getCell(1).value), String(row.getCell(2).value)));

const problems = [];
const notes = [];
const changed = [];

// Compared NFC-normalised: these names carry Icelandic characters, and a sheet
// name that came back decomposed would fall through to be parsed as content.
const NON_DATA_SHEETS = new Set(['Leiðbeiningar', '_meta'].map((n) => n.normalize('NFC')));

for (const sheet of workbook.worksheets) {
  if (sheet.state === 'veryHidden' || NON_DATA_SHEETS.has(sheet.name.normalize('NFC'))) continue;

  const { categoryId, rows, problems: found, notes: comments } = readSheet(sheet);
  problems.push(...found);
  notes.push(...comments);
  if (!categoryId) {
    problems.push({ message: `sheet "${sheet.name}" has no data rows`, fatal: true });
    continue;
  }

  let before;
  let beforeYaml;
  try {
    before = loadCategory(categoryId);
    beforeYaml = readFileSync(resolve(CONTENT_DIR, `${categoryId}.yaml`), 'utf8');
  } catch (error) {
    problems.push({
      message: `sheet "${sheet.name}": no category "${categoryId}" in content/islenskubraut — ${error.message}`,
      fatal: true,
    });
    continue;
  }

  const expected = meta.get(`hash.${categoryId}`);
  const actual = createHash('sha256').update(beforeYaml).digest('hex');
  if (expected && expected !== actual && !force) {
    problems.push({
      message:
        `${categoryId}: the repo changed since this workbook was exported. ` +
        `Re-export, or pass --force to overwrite.`,
      fatal: true,
    });
    continue;
  }

  // fromRows rejects unrecognised keys by throwing; turn that into a reported
  // problem so every sheet is checked before the run gives up, rather than the
  // first bad key aborting with a stack trace.
  let after;
  try {
    after = fromRows(categoryId, rows, before);
  } catch (error) {
    problems.push({ message: `${categoryId}: ${error.message}`, fatal: true });
    continue;
  }

  if (JSON.stringify(after) === JSON.stringify(before)) continue;
  changed.push({ categoryId, before, after, beforeYaml });
}

if (problems.length > 0) {
  console.error('Problems found:\n' + problems.map((p) => `  - ${p.message}`).join('\n'));
  if (problems.some((p) => p.fatal)) {
    console.error('\nRefusing to write. Fix the above, or pass --force where appropriate.');
    process.exit(1);
  }
}

for (const { categoryId, before, after, beforeYaml } of changed) {
  console.log(`\n${categoryId}:\n${diffSummary(before, after)}`);
  if (dryRun) continue;
  writeFileSync(
    resolve(CONTENT_DIR, `${categoryId}.yaml`),
    renderYaml(after, yamlHeader(beforeYaml)),
    'utf8'
  );
}

if (notes.length > 0 && !dryRun) {
  const month = new Date().toISOString().slice(0, 7);
  const path = resolve(CONTENT_DIR, `_athugasemdir-${month}.md`);
  const md = [
    `# Athugasemdir úr yfirlestri — ${month}`,
    '',
    'Sjálfkrafa úr athugasemdadálki Excel-skjalsins. Hver lína bíður ákvörðunar.',
    '',
    ...notes.map((n) => `- **${n.lykill}** — «${n.islenska}»\n  - ${n.note}`),
  ].join('\n');
  writeFileSync(path, `${md}\n`, 'utf8');
  console.log(
    `\nwrote ${path.replace(`${CONTENT_DIR}/`, 'content/islenskubraut/')} — ${notes.length} note(s)`
  );
}

if (changed.length === 0) console.log('No content changes.');
else if (dryRun) console.log('\n(dry run — nothing written)');
else console.log('\nNow run: pnpm islenskubraut:build');
