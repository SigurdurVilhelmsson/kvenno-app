// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { playLevel1 } from './playthrough';

// Næsta ignores a press within 400 ms of appearing; these tests press it at once.
clockPastNextGuard();

/**
 * CLAUDE.md: "Hint usage is never penalized", and the 2026-08-26 sweep recorded that no game
 * charges for a hint any more. Level 1 of this game still did: `calculateScore` gave 20 for a
 * correct answer and 10 once "Sýna vísbendingu" had been opened — a real penalty, the same
 * shape as the one `2-ar/hess-law` carried until that sweep.
 *
 * Played through the real buttons, so the test fails whichever way a penalty comes back.
 */
describe('Level 1 — a hint costs nothing', () => {
  it('scores six correct answers at 120 without opening a hint', () => {
    expect(playLevel1('correct').score).toBe(120);
  });

  it('scores six correct answers at 120 with every hint opened', () => {
    expect(playLevel1('correct', { useHints: true }).score).toBe(120);
  });

  it('scores nothing for six wrong answers, hints or not', () => {
    expect(playLevel1('wrong').score).toBe(0);
    expect(playLevel1('wrong', { useHints: true }).score).toBe(0);
  });
});
