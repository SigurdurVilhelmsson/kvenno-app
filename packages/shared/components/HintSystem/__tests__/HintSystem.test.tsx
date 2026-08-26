// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';

import { HintSystem } from '../HintSystem';

// HintSystem shows a running "Stig: <reduced> / <base>" indicator once a tier is
// revealed, derived from HINT_MULTIPLIERS (1.0 / 0.8 / 0.6 / 0.4 / 0.4).
//
// That indicator is only honest in a game that actually applies the multiplier it
// reports. Two consumers did not — `3-ar/ph-titration` L1 (fixed by dropping the
// multiplier, since a real penalty conflicts with the restructure) and
// `3-ar/equilibrium-shifter` (which passed `onPointsChange` to a write-only setter,
// so the indicator quoted a price nothing charged). Both now opt out via
// `showPointCost={false}`.
//
// The default must stay `true`: `2-ar/lewis-structures` L1 and
// `3-ar/buffer-recipe-creator` L1/L2/L3 do apply the multiplier, and flipping the
// default would silently stop telling their students what a hint costs.

const HINTS = {
  topic: 'Efnisvísbending',
  strategy: 'Aðferðarvísbending',
  method: 'Formúluvísbending',
  solution: 'Lausnarvísbending',
};

const COST_INDICATOR = /Stig: \d+ \/ \d+/;

function revealFirstTier() {
  fireEvent.click(screen.getByText(/^Vísbending \d\/4:/));
}

describe('HintSystem point-cost indicator', () => {
  afterEach(cleanup);

  it('shows the cost by default, for the games that apply the multiplier', () => {
    render(<HintSystem hints={HINTS} basePoints={100} />);
    expect(screen.queryByText(COST_INDICATOR)).toBeNull(); // nothing revealed yet

    revealFirstTier();

    // Tier 1 is the 0.8 multiplier.
    expect(screen.getByText(COST_INDICATOR).textContent).toBe('Stig: 80 / 100');
  });

  it('hides the cost when showPointCost is false', () => {
    render(<HintSystem hints={HINTS} basePoints={100} showPointCost={false} />);
    revealFirstTier();

    expect(screen.queryByText(COST_INDICATOR)).toBeNull();
  });

  it('still reveals the hint text when the cost is hidden', () => {
    render(<HintSystem hints={HINTS} basePoints={100} showPointCost={false} />);
    revealFirstTier();

    // Suppressing the price must not suppress the help.
    expect(screen.getByText(HINTS.topic)).toBeTruthy();
  });
});
