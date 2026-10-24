// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * The site shows the system font on purpose, and only Íslenskubraut shows the brand fonts,
 * which it bundles (`docs/REVIEW-QUEUE.md` D1, fixed 2026-10-24).
 *
 * **Why this exists.** `theme.css` named DM Sans and Plus Jakarta Sans, and landing,
 * lab-reports and every game imported them from Google Fonts. Each `@import url(…)` came after
 * other rules, so the build dropped it, and the CSP in `server/nginx-site.conf` would have
 * refused it anyway: no page but Íslenskubraut ever showed either font, while the code said
 * they did. A remote stylesheet import is refused here, and the shared tokens name no font a
 * page has not bundled.
 */

const repoRoot = join(__dirname, '..', '..', '..', '..');

function cssFiles(dir: string): string[] {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries.flatMap((e) => {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      return ['node_modules', 'dist', 'public'].includes(e.name) ? [] : cssFiles(full);
    }
    return e.name.endsWith('.css') ? [full] : [];
  });
}

const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8');
const BRAND = /DM Sans|Plus Jakarta/;

describe('fonts', () => {
  const files = [...cssFiles(join(repoRoot, 'apps')), ...cssFiles(join(repoRoot, 'packages'))];

  it('finds the stylesheets it scans', () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it('imports no stylesheet from another site', () => {
    const remote = files.filter((f) =>
      /@import\s+url\(\s*['"]?https?:/.test(readFileSync(f, 'utf8'))
    );
    expect(remote.map((f) => relative(repoRoot, f))).toEqual([]);
  });

  it('gives the shared theme and the game base the system font', () => {
    const theme = read('packages/shared/styles/theme.css');
    const tokens = theme.split('\n').filter((line) => /--font-(?:sans|heading)\s*:/.test(line));
    expect(tokens).toHaveLength(2);
    for (const line of tokens) expect(line).not.toMatch(BRAND);
    const families = read('packages/shared/styles/game-base.css')
      .split('\n')
      .filter((line) => /font-family\s*:/.test(line));
    expect(families.length).toBeGreaterThan(0);
    for (const line of families) expect(line).not.toMatch(BRAND);
  });

  it('keeps the brand fonts where they are bundled: Íslenskubraut', () => {
    expect(read('apps/islenskubraut/src/index.css')).toMatch(/--font-sans:\s*'DM Sans'/);
    expect(read('apps/islenskubraut/src/main.tsx')).toMatch(/@fontsource\/dm-sans/);
  });
});
