import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import ExcelJS from 'exceljs';
import { afterAll, describe, expect, it } from 'vitest';

import { CATEGORY_ORDER, CONTENT_DIR, loadCategory } from '../load.mjs';
import { readSheet, renderYaml } from '../review.mjs';

const ROOT = resolve(__dirname, '../../..');
const dir = mkdtempSync(join(tmpdir(), 'isl-imp-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

type Run = { stdout: string; stderr: string; status: number };

/** Export a workbook, mutate it, run import, return stdout/stderr/exit code. */
async function importWithEdit(
  mutate: (wb: ExcelJS.Workbook) => void,
  flags: string[] = ['--dry-run']
): Promise<Run> {
  const file = join(dir, `${Math.random().toString(36).slice(2)}.xlsx`);
  execFileSync(process.execPath, [resolve(__dirname, '../export-xlsx.mjs'), '--out', file], {
    cwd: ROOT,
  });
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(file);
  mutate(wb);
  await wb.xlsx.writeFile(file);
  // spawnSync, not execFileSync: the latter returns stdout only, so a run that
  // exits 0 while reporting repairs on stderr would look silent to these tests.
  const run = spawnSync(
    process.execPath,
    [resolve(__dirname, '../import-xlsx.mjs'), file, ...flags],
    { cwd: ROOT, encoding: 'utf8' }
  );
  return { stdout: run.stdout ?? '', stderr: run.stderr ?? '', status: run.status ?? -1 };
}

/** The first category sheet. worksheets[0] is Leiðbeiningar. */
const dyr = (wb: ExcelJS.Workbook) => wb.getWorksheet('Dýr')!;

describe('import', () => {
  it('reports no change for an untouched workbook', async () => {
    const { stdout } = await importWithEdit(() => {});
    expect(stdout).toContain('No content changes.');
  });

  it('reports an edited string as a diff', async () => {
    const { stdout } = await importWithEdit((wb) => {
      dyr(wb).getRow(5).getCell(5).value = 'Breyttur texti um dýr';
    });
    expect(stdout).toContain('+ dyr.description: Breyttur texti um dýr');
  });

  it('writes nothing on a dry run', async () => {
    const { stdout } = await importWithEdit((wb) => {
      dyr(wb).getRow(5).getCell(5).value = 'Breyttur texti um dýr';
    });
    expect(stdout).toContain('(dry run — nothing written)');
  });

  it('strips a pasted soft hyphen and says so', async () => {
    const { stdout, stderr } = await importWithEdit((wb) => {
      dyr(wb).getRow(5).getCell(5).value = 'Orða­forði um dýr';
    });
    expect(stderr + stdout).toMatch(/stripped U\+00AD/);
  });

  it('refuses a workbook exported before the repo changed', async () => {
    const { stderr, status } = await importWithEdit((wb) => {
      const meta = wb.getWorksheet('_meta')!;
      meta.eachRow((row) => {
        if (String(row.getCell(1).value) === 'hash.dyr') row.getCell(2).value = 'stale'.repeat(12);
      });
    });
    expect(stderr).toContain('the repo changed since this workbook was exported');
    expect(status).toBe(1);
  });

  it('accepts a stale workbook under --force', async () => {
    const { stdout, status } = await importWithEdit(
      (wb) => {
        const meta = wb.getWorksheet('_meta')!;
        meta.eachRow((row) => {
          if (String(row.getCell(1).value) === 'hash.dyr')
            row.getCell(2).value = 'stale'.repeat(12);
        });
      },
      ['--dry-run', '--force']
    );
    expect(stdout).toContain('No content changes.');
    expect(status).toBe(0);
  });

  it('refuses a row that carries text but no key', async () => {
    const { stderr, status } = await importWithEdit((wb) => {
      const sheet = dyr(wb);
      sheet.getRow(sheet.rowCount + 1).getCell(5).value = 'Nýr valkostur án lykils';
    });
    expect(stderr).toContain('has no lykill');
    expect(status).toBe(1);
  });

  it('refuses a cell Excel converted to a date', async () => {
    const { stderr, status } = await importWithEdit((wb) => {
      dyr(wb).getRow(5).getCell(5).value = new Date('2026-03-01T00:00:00Z');
    });
    expect(stderr).toMatch(/is a Date, not text/);
    expect(status).toBe(1);
  });
});

describe('readSheet', () => {
  /** Text pasted from Word arrives as rich text, not a string. */
  it('reads rich text as the text the reviewer sees', async () => {
    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet('S');
    sheet.getRow(1).values = ['lykill', 'gerð', 'stig', 'samhengi', 'íslenska', 'athugasemd'];
    sheet.getRow(2).getCell(1).value = 'dyr.description';
    sheet.getRow(2).getCell(5).value = {
      richText: [{ font: { bold: true }, text: 'Orðaforði ' }, { text: 'um dýr' }],
    };
    const { rows, problems } = readSheet(sheet);
    expect(rows[0].islenska).toBe('Orðaforði um dýr');
    expect(problems).toEqual([]);
  });
});

describe('renderYaml', () => {
  it.each(CATEGORY_ORDER)('reproduces %s.yaml byte for byte', (id) => {
    const onDisk = readFileSync(resolve(CONTENT_DIR, `${id}.yaml`), 'utf8');
    expect(renderYaml(loadCategory(id))).toBe(onDisk);
  });
});
