// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach, beforeAll } from 'vitest';

import { Level1 } from '../components/Level1';

// Level 1 scaled its award by the shared HintSystem's tier multiplier
// (1.0 / 0.8 / 0.6 / 0.4 / 0.4), so revealing all four tiers cut a correct
// answer from 100 points to 40 — a real penalty, unlike Levels 2 and 3, which
// only *claimed* one while awarding a flat 100 and 20 respectively.
//
// The April 2026 restructure's rule is that hint use is never penalised, so
// the multiplier is gone. This drives the real component: reveal every tier,
// answer correctly, and the award must still be the full 100.

// InteractiveGraph draws to a canvas, which jsdom does not implement.
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = (() => null) as never;
});

function startLevel() {
  render(<Level1 onComplete={() => {}} onBack={() => {}} />);
  fireEvent.click(screen.getByText(/Byrja æfingu/));
}

// Options are shuffled at render, so the correct one is found by its text.
// Challenge 1's answer is curve A: strong acid, equivalence at pH 7.
const CORRECT_OPTION = /Kúrfa A: pH byrjar lágt/;

function revealEveryHint() {
  // The tier button is labelled "Vísbending n/4: ...". Four tiers exist, and
  // the button disappears once all are revealed.
  for (let i = 0; i < 4; i++) {
    const button = screen.queryByText(/^Vísbending \d\/4:/);
    if (!button) break;
    fireEvent.click(button);
  }
}

function scoreAfterAnsweringCorrectly({ useHints }: { useHints: boolean }) {
  startLevel();
  if (useHints) revealEveryHint();
  fireEvent.click(screen.getByText(CORRECT_OPTION));
  fireEvent.click(screen.getByText('Staðfesta'));
  return screen.getByText(/^Stig: \d+$/).textContent;
}

describe('ph-titration level 1 hint cost', () => {
  afterEach(cleanup);

  it('awards the full 100 even when every hint tier is revealed', () => {
    const unaided = scoreAfterAnsweringCorrectly({ useHints: false });
    cleanup();
    const hinted = scoreAfterAnsweringCorrectly({ useHints: true });

    expect(unaided).toBe('Stig: 100');
    // Before the fix this was 'Stig: 40' — the tier-4 multiplier of 0.4.
    expect(hinted).toBe(unaided);
  });

  it('shows no running point cost while hints are open', () => {
    startLevel();
    revealEveryHint();

    // HintSystem renders "Stig: <reduced> / <base>" unless showPointCost is off.
    // The level's own header is a bare "Stig: <n>", so the slash distinguishes them.
    expect(screen.queryByText(/Stig: \d+ \/ \d+/)).toBeNull();
  });
});
