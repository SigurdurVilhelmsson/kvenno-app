#!/usr/bin/env node
/** YAML -> .xlsx for review. One sheet per category. */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import ExcelJS from 'exceljs';

import { CATEGORY_ORDER, CONTENT_DIR, loadCategories } from './load.mjs';
import { toRows } from './rows.mjs';

// PLACEHOLDER ICELANDIC — Siggi must review before this reaches a colleague.
const INSTRUCTIONS = [
  'LEIÐBEININGAR — breyttu aðeins gulu dálkunum (íslenska, athugasemd).',
  'Bæta við: afritaðu línuna fyrir ofan og skrifaðu yfir textann. Fjarlægja: eyddu línunni.',
  'Röð: dragðu línuna til. Ekki breyta dálkunum lykill, gerð, stig eða samhengi.',
];
const HEADERS = ['lykill', 'gerð', 'stig', 'samhengi', 'íslenska', 'athugasemd'];
const EDITABLE = { argb: 'FFFFF2CC' };
const HEADER_ROW = 4;

// Shaded yellow to say "edit here"; the lykill column is unlocked too but left
// unshaded, so a reviewer who has to retype a key can, without being invited to.
const SHADED_COLUMNS = [5, 6];
const UNLOCKED_COLUMNS = [1, 5, 6];

// PLACEHOLDER ICELANDIC — Siggi must review. Shown as a cell comment on each
// header and spelled out on the Leiðbeiningar tab.
const COLUMN_HELP = {
  lykill: 'Auðkenni línunnar. Ekki breyta — innflutningur notar það til að finna réttan stað.',
  gerð: 'Hvers konar texti þetta er: Spurning, Svar, Valkostur, Setningarammi, Undirflokkur eða Lýsing.',
  stig: 'Færnistig: A1, A2 eða B1. Tómt þar sem það á ekki við.',
  samhengi: 'Spurningin sem svarið tilheyrir, til upplýsingar. Ekki breyta.',
  íslenska: 'Textinn sem nemandinn sér. Breyttu hér.',
  athugasemd: 'Athugasemd til Sigga. Fer í sérstakt skjal, ekki inn í efnið sjálft.',
};

const outArg = process.argv.indexOf('--out');
if (outArg !== -1 && !process.argv[outArg + 1]) {
  console.error('usage: pnpm islenskubraut:export [--out <file.xlsx>]');
  process.exit(1);
}
const today = new Date().toISOString().slice(0, 10);
const outPath = outArg !== -1 ? process.argv[outArg + 1] : `islenskubraut-yfirlestur-${today}.xlsx`;

/** HEAD, for the metadata sheet only. Informational — import keys off the hashes. */
function headCommit() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: CONTENT_DIR,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    return 'unknown';
  }
}

const workbook = new ExcelJS.Workbook();
const categories = loadCategories();

// Guidance tab, added first so it is the sheet the workbook opens on. Order is
// insertion order: `workbook.worksheets` hands back a sorted copy, so reshuffling
// that array after the fact does nothing.
const guide = workbook.addWorksheet('Leiðbeiningar');
guide.getColumn(1).width = 20;
guide.getColumn(2).width = 96;
guide.addRow(['Yfirlestur á efni Íslenskubrautar']).font = { bold: true, size: 14 };
guide.addRow([]);
for (const line of INSTRUCTIONS) guide.addRow(['', line]);
guide.addRow([]);
guide.addRow(['Dálkar']).font = { bold: true };
for (const [name, help] of Object.entries(COLUMN_HELP)) {
  const r = guide.addRow([name, help]);
  r.getCell(1).font = { bold: true };
  r.getCell(2).alignment = { wrapText: true };
}
guide.addRow([]);
guide.addRow(['', 'Vistaðu skjalið og sendu það til baka. Ekki bæta við eða fjarlægja blöð.']);

for (const category of categories) {
  const sheet = workbook.addWorksheet(category.name);

  INSTRUCTIONS.forEach((text, i) => {
    sheet.getCell(i + 1, 1).value = text;
    sheet.getCell(i + 1, 1).font = { bold: i === 0, italic: i > 0 };
    sheet.mergeCells(i + 1, 1, i + 1, HEADERS.length);
  });

  const headerRow = sheet.getRow(HEADER_ROW);
  headerRow.values = HEADERS;
  headerRow.font = { bold: true };
  HEADERS.forEach((name, i) => {
    headerRow.getCell(i + 1).note = COLUMN_HELP[name];
  });

  for (const row of toRows(category)) {
    const added = sheet.addRow([row.lykill, row.gerd, row.stig, row.samhengi, row.islenska, '']);
    for (const col of SHADED_COLUMNS) {
      added.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: EDITABLE };
    }
    for (const col of UNLOCKED_COLUMNS) {
      added.getCell(col).protection = { locked: false };
    }
  }

  // Instructions and headers stay visible while the reviewer scrolls.
  sheet.views = [{ state: 'frozen', ySplit: HEADER_ROW }];
  sheet.columns = [
    { width: 26 },
    { width: 14 },
    { width: 6 },
    { width: 40 },
    { width: 46 },
    { width: 34 },
  ];
  // insertRows/deleteRows/sort are granted deliberately: adding, removing and
  // reordering rows IS the editing model (see rows.mjs), and a protected sheet
  // forbids all three by default — which would leave the instructions above
  // describing three things Excel refuses to do.
  await sheet.protect('', {
    selectLockedCells: true,
    selectUnlockedCells: true,
    insertRows: true,
    deleteRows: true,
    sort: true,
  });
}

// Metadata sheet: lets import detect a workbook exported before later repo edits.
const meta = workbook.addWorksheet('_meta');
meta.addRow(['schema', 1]);
meta.addRow(['exported', new Date().toISOString()]);
meta.addRow(['commit', headCommit()]);
for (const id of CATEGORY_ORDER) {
  const yaml = readFileSync(resolve(CONTENT_DIR, `${id}.yaml`), 'utf8');
  meta.addRow([`hash.${id}`, createHash('sha256').update(yaml).digest('hex')]);
}
meta.state = 'veryHidden';

await workbook.xlsx.writeFile(outPath);
console.log(`wrote ${outPath} — ${categories.length} sheets`);
