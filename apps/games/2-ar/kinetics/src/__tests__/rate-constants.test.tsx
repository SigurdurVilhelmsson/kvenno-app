// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { playLevel2 } from './playthrough';
import { challenges } from '../data/level2-questions';

/**
 * Level 2 printed a stored `correctRateConstant` after every answer, and nothing held it to the
 * table beside it. "Flóknari tilfelli" (2H₂ + 2NO) showed k = 50 M⁻²s⁻¹ while its own rows give
 * 0,005 / (0,1 × 0,1²) = 5 — out by a factor of ten, on the screen that teaches how to get k.
 *
 * k is now derived from the rows. This reads the value the student is shown, parses it the way
 * they read it (decimal comma), and checks it against **every** experiment in the table, so a
 * stored number cannot drift from the data again.
 */
function shownRateConstant(container: HTMLElement): number {
  const match = /Hraðafasti:\s*k = ([\d.,]+)/.exec(container.textContent ?? '');
  if (!match) throw new Error('no rate constant on the result screen');
  return Number(match[1].replace(',', '.'));
}

// Næsta ignores a press within 400 ms of appearing; these tests press it at once.
clockPastNextGuard();

describe('the rate constant shown after each Level 2 challenge', () => {
  it('reproduces every experiment in that challenge’s own table', () => {
    const checked: number[] = [];
    playLevel2('correct', (index, container) => {
      const challenge = challenges[index];
      const k = shownRateConstant(container);
      for (const row of challenge.data) {
        const predicted =
          k *
          row.concentrationA ** challenge.correctOrderA *
          (row.concentrationB > 0 ? row.concentrationB ** challenge.correctOrderB : 1);
        expect(
          Math.abs(predicted - row.initialRate) / row.initialRate,
          `${challenge.title}, tilraun ${row.experiment}: k = ${k}`
        ).toBeLessThan(0.01);
      }
      checked.push(index);
    });
    expect(checked).toHaveLength(challenges.length);
  });

  it('each table is consistent with a single rate law', () => {
    // The data itself, independent of any display: one k must fit all three rows.
    for (const challenge of challenges) {
      const ks = challenge.data.map(
        (row) =>
          row.initialRate /
          (row.concentrationA ** challenge.correctOrderA *
            (row.concentrationB > 0 ? row.concentrationB ** challenge.correctOrderB : 1))
      );
      for (const k of ks) {
        expect(Math.abs(k - ks[0]) / ks[0], challenge.title).toBeLessThan(1e-9);
      }
    }
  });
});
