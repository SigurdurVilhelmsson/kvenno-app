import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, it, expect } from 'vitest';

// Levels are not gated — Siggi's ruling, 2026-08-29. Every level is open from
// the menu, and the dead gating vocabulary was stripped from the games' i18n
// files the same day. Stig 1's summary survived that sweep because its strings
// are written inline, not in `i18n.ts`: it told a student who finished the level
// that Stig 2 was now open, and, on a branch no run can reach, that five of six
// were needed to open it.
//
// This scans source rather than rendering, because one of the two strings sat
// on a branch a render test cannot reach. It looks for a level being opened or
// locked, not for the verb alone, so an ordinary "open the menu" stays legal.
// `i18n.ts` carries English and Polish blocks too, so their words for it are
// held as well. Game-scoped: `lausnir`'s i18n still carries its own.

const SRC = join(__dirname, '..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : sourceFiles(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

const GATING = [
  // "Stig 2 er nú opið", "Stig 3 læst"
  /Stig\s+\d[^.\n]{0,30}(opi[ðd]|opna|læst)/i,
  // "til að opna Stig 2", "opnar Stig 3"
  /(opna|opnar|opnast|læs\w*)\s+Stig\s+\d/i,
  // English and Polish
  /unlock/i,
  /odblok\w*/i,
];

describe('dimensional-analysis levels are not gated', () => {
  it.each(sourceFiles(SRC).map((f) => [f.slice(SRC.length + 1), f]))(
    '%s says nothing about a level being opened or locked',
    (_name, file) => {
      const text = readFileSync(file, 'utf8');
      for (const pattern of GATING) {
        expect(text.match(pattern)?.[0], String(pattern)).toBeUndefined();
      }
    }
  );
});
