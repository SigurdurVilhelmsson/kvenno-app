import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, it, expect } from 'vitest';

/**
 * Every number a student reads in this game is written with the Icelandic
 * decimal comma.
 *
 * **Why this exists.** The question data moved to the comma on 2026-09-22
 * (guarded by `icelandic-text.test.ts`), but the numbers the components format
 * at render time still wrote a full stop: the answer and the difference on the
 * feedback screen, the revealed answer, the simulator's readouts and the given
 * values themselves (`0.26 atm` beside a question that says `0,26 atm`). A
 * student was taught one format and shown another.
 *
 * `toFixed` and bare interpolation of a number both write a full stop, so
 * both are refused here; `formatDecimal` from `@shared/utils` is the route.
 */

const SRC = join(__dirname, '..');

const files = [
  ...readdirSync(join(SRC, 'components'))
    .filter((f) => f.endsWith('.tsx'))
    .map((f) => join('components', f)),
  'App.tsx',
];

function linesOf(file: string) {
  return readFileSync(join(SRC, file), 'utf8').split('\n');
}

describe('decimal comma', () => {
  it('finds the components to check', () => {
    expect(files.length).toBeGreaterThanOrEqual(5);
  });

  it('no component formats a number with toFixed', () => {
    // No allow-list: nothing in these files uses toFixed for anything but text.
    for (const file of files) {
      linesOf(file).forEach((line, i) => {
        expect(line, `${file}:${i + 1} formats a number with toFixed`).not.toContain('.toFixed(');
      });
    }
  });

  it('given values are rendered through formatDecimal, not interpolated raw', () => {
    // `{currentQuestion.given.P.value}` renders 0.26 as `0.26`.
    for (const file of files) {
      linesOf(file).forEach((line, i) => {
        expect(line, `${file}:${i + 1} renders a raw .value`).not.toMatch(/\{[\w.?]+\.value\}/);
      });
    }
  });

  it('the gas constant is rendered through formatDecimal', () => {
    // `R = {R}` renders 0.08206 as `0.08206`.
    for (const file of files) {
      linesOf(file).forEach((line, i) => {
        expect(line, `${file}:${i + 1} renders R raw`).not.toMatch(/\{R\}/);
      });
    }
  });
});
