// @vitest-environment jsdom
import { render, fireEvent, cleanup, within } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';

import { Level1 } from '../components/Level1';
import { CHALLENGES } from '../data/challenges';
import { toSubscripts } from '../utils/formula-display';

/**
 * Level 1 draws one equation per challenge, with its ΔH in the energy diagram and on the
 * equation card. On challenges 5 and 6 that equation is the one the question asks about,
 * so both printed the answer above the question: `A → D … ΔH = -50 kJ` under "what is ΔH
 * for A → D?". Challenge 5 also printed -110 while its correct option, and the arithmetic
 * of the two equations it gives (-394 + 283), say -111.
 *
 * Queries are scoped to each render's container because the repo runs vitest with
 * `retry: 2`. The state-path panel under the level is a separate worked example and is
 * left out of the scope on purpose.
 */

afterEach(cleanup);

function openChallenge(n: number) {
  const view = render(<Level1 onComplete={() => {}} onBack={() => {}} />);
  const page = within(view.container);
  fireEvent.click(page.getByText('Byrja →'));
  fireEvent.click(page.getByRole('button', { name: String(n) }));
  const card = page.getByText('Lykilhugtak:').closest('.shadow-2xl') as HTMLElement;
  return { page, card };
}

function answer(page: ReturnType<typeof within>, option: string) {
  fireEvent.click(page.getByRole('button', { name: option }));
  fireEvent.click(page.getByRole('button', { name: 'Athuga svar' }));
}

describe('hess-law level 1: the ΔH a question asks for', () => {
  it.each([
    [5, '-111 kJ', /ΔH = -11[01]/],
    [6, '-50 kJ', /ΔH = -50/],
  ] as const)('challenge %i shows ? until the answer is checked', (n, correct, shown) => {
    const { page, card } = openChallenge(n);
    expect(card.textContent).toContain('ΔH = ? kJ');
    expect(card.textContent).not.toMatch(shown);

    answer(page, correct);
    expect(card.textContent).toContain(`ΔH = ${correct}`);
  });

  it('still shows the given equation’s ΔH on the challenges that ask about another one', () => {
    const { card } = openChallenge(2);
    expect(card.textContent).toContain('ΔH = -286 kJ');
    expect(card.textContent).not.toContain('ΔH = ?');
  });

  it('flags exactly the challenges whose drawn equation is the one asked about', () => {
    expect(CHALLENGES.filter((c) => c.asksForShownDeltaH).map((c) => c.id)).toEqual([5, 6]);
  });

  it.each([5, 6])('challenge %i draws the ΔH its correct option gives', (id) => {
    const challenge = CHALLENGES.find((c) => c.id === id)!;
    const correct = challenge.options.find((o) => o.correct)!;
    expect(`${challenge.equation.deltaH} kJ`).toBe(correct.text);
  });
});

/**
 * The state-path panel under every card is a worked example, and its CO₂ example labels its
 * first step `C + ½O₂ → CO` with ΔH = -111: challenge 5's answer, on screen below the
 * question (decisions item 77). Challenge 5 now names that example, and the panel leaves it
 * out, picker button included, until the answer is checked.
 */
describe('hess-law level 1: the state-path panel under challenge 5', () => {
  const CO2_EXAMPLE = 'Myndun CO₂';
  /** The panel, found by its heading: the card's own options also say -111. */
  const panel = (page: ReturnType<typeof within>) =>
    page.getByText(/Ástandsfall: Mismunandi leiðir/).closest('.mt-6') as HTMLElement;

  it('leaves out the example that prints the answer until it is checked', () => {
    const { page } = openChallenge(5);
    expect(page.queryByRole('button', { name: CO2_EXAMPLE })).toBeNull();
    expect(panel(page).textContent).not.toMatch(/-111\b/);
    expect(page.getByRole('button', { name: 'Myndun H₂O' })).toBeTruthy();

    answer(page, '-111 kJ');
    expect(page.getByRole('button', { name: CO2_EXAMPLE })).toBeTruthy();
  });

  it('keeps it on the other challenges, where it answers nothing', () => {
    const { page } = openChallenge(4);
    fireEvent.click(page.getByRole('button', { name: CO2_EXAMPLE }));
    expect(panel(page).textContent).toMatch(/-111\b/);
  });

  it('is named only by challenge 5, and names an example the panel has', () => {
    expect(CHALLENGES.filter((c) => c.answeredByPathExample).map((c) => c.id)).toEqual([5]);
  });
});

describe('toSubscripts', () => {
  it('subscripts the digits inside a formula and leaves a leading coefficient', () => {
    expect(toSubscripts('C2H5OH(l)')).toBe('C₂H₅OH(l)');
    expect(toSubscripts('Fe2O3(s)')).toBe('Fe₂O₃(s)');
    expect(toSubscripts('Ca(OH)2(s)')).toBe('Ca(OH)₂(s)');
    expect(toSubscripts('2Al(s)')).toBe('2Al(s)');
    expect(toSubscripts('S(s)')).toBe('S(s)');
  });
});
