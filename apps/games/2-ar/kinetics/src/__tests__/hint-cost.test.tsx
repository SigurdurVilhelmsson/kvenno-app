// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { playLevel1 } from './playthrough';

// Næsta ignores a press within 400 ms of appearing; these tests press it at once.
clockPastNextGuard();

/**
 * CLAUDE.md: "Hint usage is never penalized", and the 2026-08-26 sweep recorded that no game
 * charges for a hint any more. Level 1 of this game still did: its scoring helper (now gone) gave 20 for a
 * correct answer and 10 once "Sýna vísbendingu" had been opened — a real penalty, the same
 * shape as the one `2-ar/hess-law` carried until that sweep.
 *
 * Played through the real buttons, so the test fails whichever way a penalty comes back. Points
 * are gone altogether now (mobile-pass decision 1 (b)); the level reports how many it got right.
 */
describe('Level 1 — a hint costs nothing', () => {
  it('counts six of six right without opening a hint', () => {
    expect(playLevel1('correct')).toMatchObject({ correct: 6, total: 6 });
  });

  it('counts six of six right with every hint opened', () => {
    expect(playLevel1('correct', { useHints: true })).toMatchObject({ correct: 6, total: 6 });
  });

  it('counts none right for six wrong answers, hints or not', () => {
    expect(playLevel1('wrong')).toMatchObject({ correct: 0, total: 6 });
    expect(playLevel1('wrong', { useHints: true })).toMatchObject({ correct: 0, total: 6 });
  });
});
