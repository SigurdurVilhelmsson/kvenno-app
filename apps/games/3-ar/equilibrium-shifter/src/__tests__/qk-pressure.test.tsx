import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { QKComparison } from '../components/QKComparison';
import { equilibria } from '../data/equilibria';
import type { Equilibrium, GasMoles, Stress } from '../types';
import { calculateShift } from '../utils/le-chatelier';

/**
 * The Q vs K panel must agree with its own bars about which way Q moved.
 *
 * **The defect this guards against shipped.** The panel said "Q eykst" for
 * every pressure increase, which is only right when Δn > 0. Compressing a
 * mixture multiplies every concentration by the same factor f, so Q moves by
 * f^Δn — and for the Haber process (Δn = −2) compression makes Q *fall*, which
 * is exactly why the equilibrium shifts right. The bars above the sentence
 * were drawn from the shift direction and were correct, so the panel
 * contradicted itself on screen.
 *
 * It reached students: the panel renders in learning mode and after any wrong
 * answer, and of the 21 equilibria in the pool that offer a pressure stress,
 * 10 have Δn < 0 and 4 have Δn = 0.
 *
 * These tests drive the real component rather than scanning for strings,
 * because the sentence is computed rather than stored.
 */

function panelFor(eq: Equilibrium, stress: Stress) {
  const shift = calculateShift(eq, stress);
  render(
    <QKComparison
      shiftDirection={shift.direction}
      stress={stress}
      isExothermic={eq.thermodynamics.type === 'exothermic'}
      gasMoles={eq.gasMoles}
      animate={false}
    />
  );
  return shift;
}

const increase: Stress = { type: 'increase-pressure', target: null };
const decrease: Stress = { type: 'decrease-pressure', target: null };

const deltaN = (g: GasMoles) => g.products - g.reactants;

afterEach(cleanup);

const withPressure = equilibria.filter((e) =>
  e.possibleStresses.some((s) => s.type === 'increase-pressure')
);

describe('the Q vs K panel under a pressure change', () => {
  it('has pool coverage on both signs of delta-n and on zero', () => {
    // If the pool ever loses one of these cases the tests below would pass
    // vacuously, so assert the shape of the pool itself.
    expect(withPressure.filter((e) => deltaN(e.gasMoles) < 0).length).toBeGreaterThan(0);
    expect(withPressure.filter((e) => deltaN(e.gasMoles) > 0).length).toBeGreaterThan(0);
    expect(withPressure.filter((e) => deltaN(e.gasMoles) === 0).length).toBeGreaterThan(0);
  });

  it('says Q falls when a gas-reducing reaction is compressed', () => {
    // N₂ + 3H₂ ⇌ 2NH₃, Δn = −2. The old code said "Q eykst" here.
    const haber = equilibria.find((e) => e.equation === 'N₂(g) + 3H₂(g) ⇌ 2NH₃(g)')!;
    expect(deltaN(haber.gasMoles)).toBe(-2);
    const shift = panelFor(haber, increase);
    expect(shift.direction).toBe('right');
    expect(screen.getByText('Q minnkar')).toBeTruthy();
    expect(screen.queryByText('Q eykst')).toBeNull();
  });

  it('says Q rises when a gas-producing reaction is compressed', () => {
    // N₂O₄ ⇌ 2NO₂, Δn = +1 — the one case the old code got right.
    const n2o4 = equilibria.find((e) => e.equation === 'N₂O₄(g) ⇌ 2NO₂(g)')!;
    expect(deltaN(n2o4.gasMoles)).toBe(1);
    const shift = panelFor(n2o4, increase);
    expect(shift.direction).toBe('left');
    expect(screen.getByText('Q eykst')).toBeTruthy();
  });

  it('says Q is unchanged when the two sides have equal gas moles', () => {
    const flat = withPressure.find((e) => deltaN(e.gasMoles) === 0)!;
    const shift = panelFor(flat, increase);
    expect(shift.direction).toBe('none');
    expect(screen.getByText('Q er óbreytt')).toBeTruthy();
  });

  it('never contradicts its own bars, on any equilibrium in the pool', () => {
    // This is the property the defect violated. The bars show Q < K when the
    // system shifts right and Q > K when it shifts left; the sentence must say
    // Q moved the matching way.
    for (const eq of withPressure) {
      for (const stress of [increase, decrease]) {
        if (!eq.possibleStresses.some((s) => s.type === stress.type)) continue;
        const shift = panelFor(eq, stress);
        const said = screen.getByText(/^Q (eykst|minnkar|er óbreytt)$/).textContent;
        const expected =
          shift.direction === 'right'
            ? 'Q minnkar'
            : shift.direction === 'left'
              ? 'Q eykst'
              : 'Q er óbreytt';
        expect(said, `${eq.equation} under ${stress.type}`).toBe(expected);
        cleanup();
      }
    }
  });
});
