import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { deltaNGas } from '@shared/engine/equilibrium';

import { BeitaScreen } from '../components/BeitaScreen';
import { BEITA_PROBLEMS } from '../data/problems';

/**
 * Beita serves both unit systems through one screen.
 *
 * **The point of these tests is that a student actually meets ICE in
 * pressures.** The pressure problems existed in the data and in
 * `pressures.test.ts` before the screen read them, and a problem nothing
 * renders is not content — it is a fixture. So these drive the real component
 * and walk it to the problems that are served in atm.
 *
 * They also hold the two labels apart. A screen that says `(M)` over a column
 * of partial pressures is worse than one that says nothing: it asserts a unit
 * the numbers do not carry.
 */

afterEach(cleanup);

/**
 * Commit to a direction, then skip the algebra to the revealed extent.
 *
 * Both direction buttons advance — the screen tells the student which way it
 * really goes afterwards, from Q — and the "show me" escape appears only once
 * an answer has been checked, so the empty check is what opens it.
 */
function revealExtent() {
  fireEvent.click(screen.getByText('Áfram — myndefnin aukast'));
  fireEvent.click(screen.getByText('Athuga'));
  fireEvent.click(screen.getByText('Sýna svarið og halda áfram'));
}

/** Walk the screen to `index` by playing each earlier problem to the end. */
function openProblem(index: number) {
  render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
  for (let i = 0; i < index; i += 1) {
    revealExtent();
    fireEvent.click(screen.getByText(/nálgunin hefði dugað/i));
    fireEvent.click(screen.getByText(/Næsta dæmi|Ljúka/));
  }
}

/** The stage where the table's headers and the constant are on screen. */
function headerText() {
  return screen.getByRole('table').querySelectorAll('th')[1].textContent;
}

describe('the Beita problem set', () => {
  it('serves the concentration problems first and the pressure ones after', () => {
    const units = BEITA_PROBLEMS.map((p) => p.unit);
    expect(units.indexOf('atm')).toBeGreaterThan(units.lastIndexOf('M'));
    expect(units).toContain('M');
    expect(units).toContain('atm');
  });

  it('labels every problem with the symbol its constant is stated in', () => {
    for (const p of BEITA_PROBLEMS) {
      expect(p.constantSymbol, p.id).toBe(p.reaction.constant!.basis === 'Kp' ? 'Kp' : 'K');
      expect(p.expression, p.id).toContain(p.constantSymbol === 'Kp' ? 'Kp =' : 'Kc =');
    }
  });

  it('gives a manometer to the pressure problems and none to the others', () => {
    for (const p of BEITA_PROBLEMS) {
      if (p.unit === 'M') {
        expect(p.totals, p.id).toBeNull();
        continue;
      }
      expect(p.totals, p.id).not.toBeNull();
      // A reading exists exactly where Δn ≠ 0 — see `pressures.test.ts` for
      // the arithmetic behind it.
      expect(p.totals!.equilibrium === null, p.id).toBe(deltaNGas(p.reaction) === 0);
    }
  });
});

describe('the screen reads its unit off the problem', () => {
  it('says M over the first problem', () => {
    openProblem(0);
    expect(BEITA_PROBLEMS[0].unit).toBe('M');
    expect(headerText()).toBe('Upphaf (M)');
    expect(screen.queryByText(/Heildarþrýstingur í upphafi/)).toBeNull();
  });

  it('says atm over the first pressure problem, with its opening reading', () => {
    const index = BEITA_PROBLEMS.findIndex((p) => p.unit === 'atm');
    openProblem(index);
    expect(headerText()).toBe('Upphaf (atm)');
    expect(screen.getByText(/Heildarþrýstingur í upphafi/)).toBeTruthy();
  });

  it('shows the manometer moving once the extent is known', () => {
    const index = BEITA_PROBLEMS.findIndex(
      (p) => p.unit === 'atm' && p.totals!.equilibrium !== null
    );
    openProblem(index);
    revealExtent();
    expect(screen.getByText(/Heildarþrýstingurinn fer úr/)).toBeTruthy();
  });

  it('says the reading cannot move where Δn is zero', () => {
    // The teaching point of the BrCl problem: an instrument that reads the
    // same number all the way through is reporting a fact about the equation.
    const index = BEITA_PROBLEMS.findIndex(
      (p) => p.unit === 'atm' && p.totals!.equilibrium === null
    );
    expect(index).toBeGreaterThanOrEqual(0);
    openProblem(index);
    revealExtent();
    expect(screen.getByText(/stendur í/)).toBeTruthy();
    expect(screen.queryByText(/Heildarþrýstingurinn fer úr/)).toBeNull();
  });

  it('asks about the starting pressure, not the starting concentration', () => {
    // The 5 % rule is stated against whichever quantity the problem is in.
    const index = BEITA_PROBLEMS.findIndex((p) => p.unit === 'atm');
    openProblem(index);
    revealExtent();
    expect(screen.getByText(/upphafsþrýstingnum/)).toBeTruthy();
    expect(screen.queryByText(/% af upphafsstyrknum/)).toBeNull();
  });
});
