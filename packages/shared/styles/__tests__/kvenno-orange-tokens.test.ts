// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Every `kvenno-orange-*` shade a class names exists in the theme.
 *
 * **Why this exists.** The theme defines `kvenno-orange` and the shades `-50` … `-900`. The
 * games carried 76 hover states, a focus ring and eight text colours written with a `-dark`
 * shade that was never defined (2026-10-02, `docs/REVIEW-QUEUE.md` D1), and Tailwind emits
 * nothing for a colour it does not know, silently: the buttons never darkened on hover and the
 * text kept whatever colour it inherited. The legacy `tailwind-preset.ts` does have a `dark`,
 * which is likely where the habit came from, but no app's stylesheet reads it.
 */

const repoRoot = join(__dirname, '..', '..', '..', '..');
const ROOTS = ['apps', 'packages/shared'];

function sourceFiles(dir: string): string[] {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries.flatMap((e) => {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      return ['node_modules', 'dist', '__tests__'].includes(e.name) ? [] : sourceFiles(full);
    }
    return /\.(tsx?|html)$/.test(e.name) ? [full] : [];
  });
}

const theme = readFileSync(join(repoRoot, 'packages/shared/styles/theme.css'), 'utf8');
const defined = new Set(
  [...theme.matchAll(/--color-kvenno-orange(?:-([a-z0-9]+))?\s*:/g)].map((m) => m[1] ?? '')
);

// A colour utility followed by the brand name and an optional shade. Built at run time, so
// Tailwind's scan of packages/shared does not read a class out of this file.
const BRAND = ['kvenno', 'orange'].join('-');
const USE = new RegExp(
  `\\b(?:bg|text|border|ring|outline|fill|stroke|from|via|to|decoration|divide|accent|caret|shadow)-${BRAND}(?:-([a-z0-9]+))?\\b`,
  'g'
);

describe('kvenno-orange shades', () => {
  it('reads the theme', () => {
    expect(defined.has('')).toBe(true);
    expect(defined.has('600')).toBe(true);
  });

  it('names only shades the theme defines', () => {
    const files = ROOTS.flatMap((root) => sourceFiles(join(repoRoot, root)));
    expect(files.length).toBeGreaterThan(100);
    const offences: string[] = [];
    for (const file of files) {
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          for (const m of line.matchAll(USE)) {
            const shade = m[1] ?? '';
            // An opacity suffix (`/50`) is not a shade; the regex stops before it.
            if (!defined.has(shade)) {
              offences.push(`${file.slice(repoRoot.length + 1)}:${i + 1} — ${m[0]}`);
            }
          }
        });
    }
    expect(offences, 'Use -600 for a hover or ring, -700 for text on white').toEqual([]);
  });
});
