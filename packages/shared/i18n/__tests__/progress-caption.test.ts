import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * The menu's progress tile reads `Stigum lokið`, never the nominative.
 *
 * `lokið` governs the dative, so the caption under "2/3" is `Stigum lokið`, as
 * a sentence would be. Fourteen games showed the nominative, and the shared
 * achievements list named its first badge the same way. Siggi's ruling,
 * 2026-10-02 (decisions item 11, option a).
 *
 * The scan covers every game and the shared library, tests excluded, since a
 * test may quote the old caption to explain itself.
 */

const repoRoot = join(__dirname, '..', '..', '..', '..');
const ROOTS = ['apps/games', 'apps/landing/src', 'packages/shared'].map((r) => join(repoRoot, r));

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      return ['node_modules', 'dist', '__tests__'].includes(entry.name) ? [] : sourceFiles(full);
    }
    return /\.(tsx?|html)$/.test(entry.name) ? [full] : [];
  });
}

// A nominative `stig` straight before `lokið`, as a whole word: `Stig lokið` and
// `Fyrsta stig lokið` match; `Stigum lokið` and `stigi lokið` do not.
const NOMINATIVE = /(^|[^a-záéíóúýþæö])stig lokið/i;

describe('the progress caption', () => {
  const files = ROOTS.flatMap(sourceFiles);

  it('finds the files it is meant to scan', () => {
    expect(files.length).toBeGreaterThan(200);
  });

  it('takes the dative after lokið everywhere', () => {
    const hits: string[] = [];
    for (const file of files) {
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (NOMINATIVE.test(line)) hits.push(`${file.slice(repoRoot.length + 1)}:${i + 1}`);
        });
    }
    expect(hits).toEqual([]);
  });

  it('matches the old forms and passes the new ones', () => {
    expect(NOMINATIVE.test('Stig lokið')).toBe(true);
    expect(NOMINATIVE.test('Fyrsta stig lokið')).toBe(true);
    expect(NOMINATIVE.test('Stigum lokið')).toBe(false);
    expect(NOMINATIVE.test('Fyrsta stigi lokið')).toBe(false);
  });
});
