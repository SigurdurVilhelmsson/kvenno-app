import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { Level3 } from '../components/Level3';
import { YIELD_PROBLEMS } from '../data/yieldProblems';

clockPastNextGuard();

/**
 * Stig 3 must be answerable from what it puts on the screen.
 *
 * **The molar masses are the route to the answer here**, so the test reads
 * them off the screen rather than importing them: a level that asks for grams
 * of product while hiding the molar mass of that product is answerable only by
 * someone who has memorised a periodic table. `1-ar/lotukerfid` shipped the
 * mirror of this — masking an answer leak removed the only route to the
 * answer — and the lesson was to check every time.
 */

afterEach(cleanup);

const decimals = (n: number, places = 2) => n.toFixed(places).replace('.', ',');

/** The answer buttons, scoped away from the equation and the molar-mass table. */
const formulaButton = (formula: string) =>
  screen.getAllByRole('button').find((b) => b.textContent?.trim() === formula)!;

/** Which shipped problem is on screen, read off its equation. */
const showing = () => YIELD_PROBLEMS.find((p) => screen.queryByText(p.reaction.equation) !== null)!;

describe('Stig 3', () => {
  it('prints a molar mass for every formula the student has to weigh', () => {
    render(<Level3 onComplete={() => {}} onBack={() => {}} />);
    const problem = showing();
    const table = screen.getByText(/Mólmassar/).parentElement!.textContent ?? '';
    for (const formula of [
      problem.reaction.reactant1.formula,
      problem.reaction.reactant2.formula,
      problem.productFormula,
    ]) {
      expect(table, `${formula} has no molar mass on screen`).toContain(formula);
    }
    expect(table).toMatch(/g\/mól/);
  });

  it('can be played to the end of a problem with correct answers', () => {
    render(<Level3 onComplete={() => {}} onBack={() => {}} />);
    // Identify which problem is showing from the equation on screen.
    const problem = showing();
    expect(problem, 'no shipped problem matches the equation on screen').toBeDefined();
    const { result } = problem;

    fireEvent.click(formulaButton(result.limitingFormula));
    fireEvent.click(screen.getByText('Athuga'));
    expect(
      screen.getByText(new RegExp(`Rétt! ${result.limitingFormula} klárast fyrst`))
    ).toBeTruthy();
    fireEvent.click(screen.getByText('Áfram →'));

    fireEvent.change(screen.getByLabelText('Fræðilegar heimtur í grömmum'), {
      target: { value: decimals(result.theoreticalGrams) },
    });
    fireEvent.click(screen.getByText('Athuga'));
    expect(screen.queryByText('Reyna aftur'), 'theoretical yield rejected').toBeNull();
    fireEvent.click(screen.getByText('Áfram →'));

    fireEvent.change(screen.getByLabelText('Prósentuheimtur'), {
      target: { value: decimals(result.percent, 1) },
    });
    fireEvent.click(screen.getByText('Athuga'));
    expect(screen.queryByText('Reyna aftur'), 'percent yield rejected').toBeNull();
    fireEvent.click(screen.getByText('Áfram →'));

    expect(screen.getByText('Útreikningurinn')).toBeTruthy();
    expect(screen.getByText(/Prósentuheimtur/)).toBeTruthy();
  });

  it('accepts the Icelandic decimal comma, which is the whole point of the input type', () => {
    // A numeric-typed field eats the comma before any code runs, so this is
    // the guard that the field stayed text with a decimal input mode.
    // (Spelling the attribute out here would fail `decimal-input.test.ts`,
    // which scans source without telling a use from a mention — the trap
    // CLAUDE.md records from 2026-09-20.)
    render(<Level3 onComplete={() => {}} onBack={() => {}} />);
    const problem = showing();
    fireEvent.click(formulaButton(problem.result.limitingFormula));
    fireEvent.click(screen.getByText('Athuga'));
    fireEvent.click(screen.getByText('Áfram →'));

    const field = screen.getByLabelText('Fræðilegar heimtur í grömmum') as HTMLInputElement;
    const withComma = problem.result.theoreticalGrams.toFixed(2).replace('.', ',');
    fireEvent.change(field, { target: { value: withComma } });
    expect(field.value).toBe(withComma);
    fireEvent.click(screen.getByText('Athuga'));
    expect(screen.queryByText('Reyna aftur')).toBeNull();
  });

  it('answers a wrong pick according to which reactant was picked', () => {
    // Decision 56 (a). The one sentence it had spoke only to a student who
    // picked the heavier mass; one who picked the lighter is now told that a
    // lighter reactant can be in excess, and one who picked the reactant with
    // fewer moles is told to divide by the coefficient.
    render(<Level3 onComplete={() => {}} onBack={() => {}} />);
    const seen = new Set<string>();
    for (let p = 0; p < YIELD_PROBLEMS.length; p++) {
      const { reaction, result, gramsR1, gramsR2 } = showing();
      const wrongIsFirst = result.limitingFormula !== reaction.reactant1.formula;
      const wrong = wrongIsFirst ? reaction.reactant1.formula : reaction.reactant2.formula;
      const [wrongGrams, rightGrams] = wrongIsFirst ? [gramsR1, gramsR2] : [gramsR2, gramsR1];
      const [wrongMoles, rightMoles] = wrongIsFirst
        ? [result.molesR1, result.molesR2]
        : [result.molesR2, result.molesR1];
      const expected =
        wrongGrams < rightGrams
          ? /minna er af í grömmum/
          : wrongMoles < rightMoles
            ? /Mólfjöldinn einn og sér/
            : /Þyngra hvarfefni getur vel/;
      seen.add(String(expected));

      fireEvent.click(formulaButton(wrong));
      fireEvent.click(screen.getByText('Athuga'));
      expect(screen.getByText(expected)).toBeTruthy();
      fireEvent.click(screen.getByText('Áfram →'));
      for (let step = 0; step < 2; step++) {
        fireEvent.change(document.querySelector('input')!, { target: { value: '1' } });
        fireEvent.click(screen.getByText('Athuga'));
        fireEvent.click(screen.getByText('Áfram →'));
      }
      fireEvent.click(screen.getByText(/Næsta verkefni|Sjá niðurstöður/));
    }
    // The lighter pick is the one the grams guess makes; it must be answered.
    expect(seen).toContain(String(/minna er af í grömmum/));
  });

  it('rejects a wrong limiting reactant rather than waving it through', () => {
    render(<Level3 onComplete={() => {}} onBack={() => {}} />);
    const problem = showing();
    const wrong =
      problem.result.limitingFormula === problem.reaction.reactant1.formula
        ? problem.reaction.reactant2.formula
        : problem.reaction.reactant1.formula;
    fireEvent.click(formulaButton(wrong));
    fireEvent.click(screen.getByText('Athuga'));
    expect(screen.getByText('Reyna aftur')).toBeTruthy();
  });
});
