import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import ExcelJS from 'exceljs';
import { afterAll, describe, expect, it } from 'vitest';

import { loadCategories } from '../load.mjs';
import { toRows } from '../rows.mjs';

const dir = mkdtempSync(join(tmpdir(), 'isl-'));
const file = join(dir, 'review.xlsx');
const script = resolve(__dirname, '../export-xlsx.mjs');

execFileSync(process.execPath, [script, '--out', file], { cwd: resolve(__dirname, '../../..') });

afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe('export', () => {
  it('opens on the guidance tab, then one sheet per category', async () => {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(file);
    const visible = wb.worksheets.filter((s) => s.state !== 'veryHidden');
    expect(visible.map((s) => s.name)).toEqual([
      'Leiðbeiningar',
      ...loadCategories().map((c) => c.name),
    ]);
  });

  it('explains every column on the guidance tab', async () => {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(file);
    const guide = wb.getWorksheet('Leiðbeiningar')!;
    const labels: string[] = [];
    guide.eachRow((row) => labels.push(String(row.getCell(1).value ?? '')));
    for (const column of ['lykill', 'gerð', 'stig', 'samhengi', 'íslenska', 'athugasemd']) {
      expect(labels, `column ${column}`).toContain(column);
    }
  });

  it('preserves every string exactly, including Icelandic characters', async () => {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(file);
    for (const category of loadCategories()) {
      const sheet = wb.getWorksheet(category.name)!;
      const written: string[] = [];
      sheet.eachRow((row, n) => {
        if (n > 4) written.push(String(row.getCell(5).value ?? ''));
      });
      expect(written, category.id).toEqual(toRows(category).map((r) => r.islenska));
    }
  });

  it('freezes the instruction block and the header', async () => {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(file);
    // Not worksheets[0] — that is now the Leiðbeiningar tab.
    expect(wb.getWorksheet('Dýr')!.views[0]).toMatchObject({ state: 'frozen', ySplit: 4 });
  });

  it('lets the reviewer add, remove and reorder rows', async () => {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(file);
    // A protected sheet forbids all three by default, which would contradict the
    // instructions printed at the top of every sheet.
    expect(wb.getWorksheet('Dýr')!.sheetProtection).toMatchObject({
      sheet: true,
      insertRows: true,
      deleteRows: true,
      sort: true,
    });
  });

  it('unlocks the text, comment and key columns and nothing else', async () => {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(file);
    const firstDataRow = wb.getWorksheet('Dýr')!.getRow(5);
    const unlocked = [1, 2, 3, 4, 5, 6].filter(
      (col) => firstDataRow.getCell(col).protection?.locked === false
    );
    expect(unlocked).toEqual([1, 5, 6]);
  });
});
