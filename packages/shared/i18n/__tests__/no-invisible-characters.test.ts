import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, it, expect } from 'vitest';

/**
 * No invisible characters in student-facing source.
 *
 * **Why this exists, and it is not hypothetical.** Claude introduced a U+00AD
 * soft hyphen into an Icelandic word while writing Stig 0's content on
 * 2026-09-19 — `ónákvæmasta` with a soft hyphen wedged mid-word. It renders
 * invisibly, it survives review, and it breaks search and screen readers.
 *
 * The repo has been here before at much greater cost: until Aug 2026 the
 * Íslenskubraut server copy — the text students read on the printed card — had
 * `Orðaforði` written as `Orda{soft hyphen}fordi`, invisible in an editor, for
 * months. `scripts/islenskubraut/load.mjs` has validated the YAML ever since,
 * but **game and app source was never covered**, which is exactly where the new
 * one landed.
 *
 * Two characters are allowed, both deliberate and both verified:
 *
 *  - **U+200D zero-width joiner** inside an emoji sequence — the man-cook
 *    emoji in `challenges.ts` is one glyph built from two code points and a
 *    joiner, and removing it would print two unrelated emoji. (Described rather
 *    than written here: pasting the emoji into this file would make the test
 *    fail on itself, which is how the rule was checked.)
 *  - **U+00A0 no-break space** inside `numbers.test.ts`, which tests that
 *    `parseStudentNumber` copes with one. The character under test has to be
 *    present in the test.
 */

const repoRoot = join(__dirname, '..', '..', '..', '..');

const SCANNED_ROOTS = [
  'apps/games',
  'apps/landing/src',
  'apps/islenskubraut/src',
  'packages/shared',
  'server/src',
  'content',
];

/** Invisible or near-invisible characters that have no business in source. */
const FORBIDDEN: Record<string, string> = {
  '\u00ad': 'soft hyphen',
  '\u200b': 'zero-width space',
  '\u200c': 'zero-width non-joiner',
  '\u200d': 'zero-width joiner',
  '\ufeff': 'byte-order mark',
  '\u2060': 'word joiner',
  '\u00a0': 'no-break space',
  '\u180e': 'Mongolian vowel separator',
};

/**
 * The two deliberate uses, by file and character. Anything else fails.
 * Keyed by repo-relative path so a copy of the character elsewhere is still caught.
 */
const ALLOWED: Record<string, string[]> = {
  'apps/games/1-ar/dimensional-analysis/src/data/challenges.ts': ['\u200d'],
  'packages/shared/utils/__tests__/numbers.test.ts': ['\u00a0'],
};

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
      if (e.name === 'node_modules' || e.name === 'dist') return [];
      return sourceFiles(full);
    }
    return /\.(tsx?|html|yaml|md)$/.test(e.name) ? [full] : [];
  });
}

const FILES = SCANNED_ROOTS.flatMap((r) => sourceFiles(join(repoRoot, r)));

describe('no invisible characters in student-facing source', () => {
  it('finds files to scan, so it cannot silently cover nothing', () => {
    expect(FILES.length).toBeGreaterThan(200);
  });

  it('every occurrence is one of the two deliberate ones', () => {
    const offences: string[] = [];
    for (const file of FILES) {
      const rel = relative(repoRoot, file).split('\\').join('/');
      const allowed = ALLOWED[rel] ?? [];
      const lines = readFileSync(file, 'utf8').split('\n');
      lines.forEach((line, i) => {
        for (const [ch, name] of Object.entries(FORBIDDEN)) {
          if (!line.includes(ch) || allowed.includes(ch)) continue;
          offences.push(
            `${rel}:${i + 1} — ${name} (U+${ch.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}) in: ${line.trim().slice(0, 90)}`
          );
        }
      });
    }
    expect(
      offences,
      `Invisible characters found. They render as nothing, survive review, and break search:\n${offences.join('\n')}`
    ).toEqual([]);
  });

  it('the allow-list is not stale — each entry still holds its character', () => {
    // An exemption for a character that is gone is a licence nobody asked for.
    for (const [rel, chars] of Object.entries(ALLOWED)) {
      const body = readFileSync(join(repoRoot, rel), 'utf8');
      for (const ch of chars) {
        expect(
          body.includes(ch),
          `${rel} no longer contains its allowed character — drop the entry`
        ).toBe(true);
      }
    }
  });
});
