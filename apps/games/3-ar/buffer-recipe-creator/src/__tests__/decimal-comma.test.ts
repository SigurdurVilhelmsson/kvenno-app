import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, it, expect } from 'vitest';

import { LEVEL1_CHALLENGES } from '../data/level1-challenges';
import { LEVEL2_PUZZLES } from '../data/level2-puzzles';
import { LEVEL3_PUZZLES } from '../data/level3-puzzles';
import { BUFFER_PROBLEMS } from '../data/problems';

/**
 * Every number a student reads in this game is written with the Icelandic
 * decimal comma.
 *
 * **Why this exists.** The answer fields have read a comma since the Aug 2026
 * B9/B10 pass, but until 2026-09-22 the game printed `7.40`, `0.100 M` and
 * `4.64 g` everywhere else — task text, hints, worked solutions and every
 * number a component formatted with `toFixed` — so a student was taught one
 * format and asked for another.
 *
 * English fields (`…En`, `hintsEn`) keep their full stop — that is English —
 * and nothing renders them today. Polish, like Icelandic, writes a comma.
 */

const DECIMAL_POINT = /\d\.\d/;

/** Every string value in an object, skipping English-language fields. */
function icelandicStrings(value: unknown, path = ''): { path: string; text: string }[] {
  if (typeof value === 'string') return [{ path, text: value }];
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, v]) =>
      /En$/.test(key) ? [] : icelandicStrings(v, path ? `${path}.${key}` : key)
    );
  }
  return [];
}

describe('decimal comma', () => {
  const sources = [
    ...LEVEL1_CHALLENGES.map((c) => ({ what: `level 1 challenge ${c.id}`, value: c })),
    ...LEVEL2_PUZZLES.map((p) => ({ what: `level 2 puzzle ${p.id}`, value: p })),
    ...LEVEL3_PUZZLES.map((p) => ({ what: `level 3 puzzle ${p.id}`, value: p })),
    ...BUFFER_PROBLEMS.map((p) => ({ what: `problem ${p.id}`, value: p })),
  ];

  it('finds text to check', () => {
    expect(sources.flatMap((s) => icelandicStrings(s.value)).length).toBeGreaterThan(100);
  });

  it('no Icelandic data string writes a decimal point', () => {
    for (const { what, value } of sources) {
      for (const { path, text } of icelandicStrings(value)) {
        expect(text, `${what} ${path}`).not.toMatch(DECIMAL_POINT);
      }
    }
  });

  it('components format numbers through formatDecimal, not toFixed', () => {
    // `toFixed` writes a full stop. The one legitimate use is SVG path
    // geometry, which is coordinates for the browser rather than text for a
    // student — and where a comma would break the path.
    const dir = join(__dirname, '..', 'components');
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.tsx'))) {
      const lines = readFileSync(join(dir, file), 'utf8').split('\n');
      lines.forEach((line, i) => {
        if (!line.includes('.toFixed(')) return;
        expect(line, `${file}:${i + 1} formats a number with toFixed`).toMatch(/[xy]Scale\(/);
      });
    }
  });
});
