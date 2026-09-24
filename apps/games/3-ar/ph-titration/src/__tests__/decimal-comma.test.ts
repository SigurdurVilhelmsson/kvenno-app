import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, it, expect } from 'vitest';

import { indicators } from '../data/indicators';
import { LEVEL1_CHALLENGES } from '../data/level1-challenges';
import { LEVEL2_PUZZLES } from '../data/level2-puzzles';
import { LEVEL3_CHALLENGES } from '../data/level3-challenges';

/**
 * Every number a student reads in this game is written with the Icelandic
 * decimal comma.
 *
 * **Why this exists.** Level 3's answer field has read a comma since the
 * Aug 2026 B9/B10 pass, but until 2026-09-23 the game printed `0.100 M`,
 * `+0.05 mL`, `Rétt svar: 0.13` and every burette, flask and curve readout
 * with a full stop — so a student was taught one format and asked for
 * another. `play-through.test.tsx` checks the rendered screens; this file
 * covers what a render cannot see (the canvas labels on the curve) and the
 * data a level has not reached yet.
 *
 * The English fields (`question`, `label`, `task`, `hint`, `explanation`,
 * `title`, `description`, `solutionSteps`) keep their full stop — that is
 * English — and nothing renders them.
 */

const DECIMAL_POINT = /\d\.\d/;
const ENGLISH_KEYS = new Set([
  'question',
  'label',
  'task',
  'hint',
  'explanation',
  'title',
  'description',
  'solutionSteps',
]);

/** Every string value in an object, skipping the English-language fields. */
function icelandicStrings(value: unknown, path = ''): { path: string; text: string }[] {
  if (typeof value === 'string') return [{ path, text: value }];
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, v]) =>
      ENGLISH_KEYS.has(key) ? [] : icelandicStrings(v, path ? `${path}.${key}` : key)
    );
  }
  return [];
}

const SRC = join(__dirname, '..');
const components = [
  ...readdirSync(join(SRC, 'components'))
    .filter((f) => f.endsWith('.tsx'))
    .map((f) => join('components', f)),
  'App.tsx',
];

function linesOf(file: string) {
  return readFileSync(join(SRC, file), 'utf8').split('\n');
}

describe('decimal comma', () => {
  const sources = [
    ...LEVEL1_CHALLENGES.map((c) => ({ what: `level 1 challenge ${c.id}`, value: c })),
    ...LEVEL2_PUZZLES.map((p) => ({ what: `level 2 puzzle ${p.id}`, value: p })),
    ...LEVEL3_CHALLENGES.map((c) => ({ what: `level 3 challenge ${c.id}`, value: c })),
  ];

  it('finds text to check', () => {
    expect(sources.flatMap((s) => icelandicStrings(s.value)).length).toBeGreaterThan(100);
    expect(components.length).toBeGreaterThanOrEqual(9);
  });

  it('no Icelandic data string writes a decimal point', () => {
    for (const { what, value } of sources) {
      for (const { path, text } of icelandicStrings(value)) {
        expect(text, `${what} ${path}`).not.toMatch(DECIMAL_POINT);
      }
    }
    for (const { id, name, description } of indicators) {
      expect(`${name} ${description}`, id).not.toMatch(DECIMAL_POINT);
    }
  });

  it('no component formats a number with toFixed', () => {
    // toFixed writes a full stop; formatDecimal from @shared/utils is the
    // route. No allow-list: nothing here uses toFixed for anything but text.
    for (const file of components) {
      linesOf(file).forEach((line, i) => {
        expect(line, `${file}:${i + 1} formats a number with toFixed`).not.toContain('.toFixed(');
      });
    }
  });

  it('no component interpolates a stored number raw', () => {
    // `{titration.analyte.molarity}` renders 0.1 as `0.1`. A prop (`={...}`)
    // is not text, and the given `formula` is not a number.
    const raw =
      /(?<!=)\{(?:titration\.(?:analyte|titrant)\.(?:volume|molarity)|challenge\.givenData\.(?!formula\})\w+|challenge\.correctAnswer)\}/;
    for (const file of components) {
      linesOf(file).forEach((line, i) => {
        expect(line, `${file}:${i + 1} renders a number raw`).not.toMatch(raw);
      });
    }
  });
});
