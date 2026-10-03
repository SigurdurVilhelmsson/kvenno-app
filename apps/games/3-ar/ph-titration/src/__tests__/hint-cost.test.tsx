// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { Level1 } from '../components/Level1';
import { LEVEL1_CHALLENGES } from '../data/level1-challenges';

// Level 1 scaled its award by the shared HintSystem's tier multiplier
// (1.0 / 0.8 / 0.6 / 0.4 / 0.4), so revealing all four tiers cut a correct
// answer from 100 points to 40 — a real penalty, unlike Levels 2 and 3, which
// only *claimed* one while awarding a flat 100 and 20 respectively. The
// multiplier went in August 2026; the points went in October (mobile-pass
// decision 1 (b)), and the level now reports how many questions were right.
//
// This drives the real component through every question twice, once opening
// every hint tier first, and the two runs must report the same count.

// InteractiveGraph draws to a canvas, which jsdom does not implement.
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = (() => null) as never;
});

beforeEach(() => vi.useFakeTimers());

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const settle = () => act(() => vi.advanceTimersByTime(400));

function revealEveryHint() {
  // The tier button is labelled "Vísbending n/4: ...". Four tiers exist, and
  // the button disappears once all are revealed.
  for (let i = 0; i < 4; i++) {
    const button = screen.queryByText(/^Vísbending \d\/4:/);
    if (!button) break;
    fireEvent.click(button);
  }
}

function playCorrectly({ useHints }: { useHints: boolean }) {
  const onComplete = vi.fn();
  render(<Level1 onComplete={onComplete} onBack={() => {}} />);
  fireEvent.click(screen.getByText(/Byrja æfingu/));
  settle();
  for (const challenge of LEVEL1_CHALLENGES) {
    if (useHints) revealEveryHint();
    // HintSystem renders "Stig: <reduced> / <base>" unless showPointCost is off.
    expect(screen.queryByText(/Stig: \d+ \/ \d+/)).toBeNull();
    // Options are shuffled at render, so the correct one is found by its text.
    fireEvent.click(screen.getByText(challenge.options!.find((o) => o.isCorrect)!.labelIs));
    fireEvent.click(screen.getByText('Staðfesta'));
    settle();
    fireEvent.click(screen.getByRole('button', { name: /Næsta →|Ljúka stigi →/ }));
    settle();
  }
  return onComplete;
}

describe('ph-titration level 1 hint cost', () => {
  it('counts every right answer even when every hint tier is revealed', () => {
    const n = LEVEL1_CHALLENGES.length;
    expect(playCorrectly({ useHints: false })).toHaveBeenCalledWith(n, n);
    cleanup();
    // Before August 2026 the hinted run was worth 40 of 100 a question.
    expect(playCorrectly({ useHints: true })).toHaveBeenCalledWith(n, n);
  });
});
