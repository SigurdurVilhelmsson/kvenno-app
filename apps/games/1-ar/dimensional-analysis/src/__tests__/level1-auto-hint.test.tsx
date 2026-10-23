// @vitest-environment jsdom
/**
 * Stig 1's automatic hint opens after three wrong tries, not after three taps —
 * decisions item 24 (a).
 *
 * Every challenge reported every tap as an attempt, right or wrong, and the
 * level opened the hint on the third. So it could open on a student doing
 * exactly what the screen asks — stepping towards 1 L, or building a fraction
 * and starting again — while the intro promises help to one who "reynir
 * nokkrum sinnum". A challenge now says whether a tap was wrong, and only a
 * wrong one counts. Queries are scoped to this test's container (the repo runs
 * vitest with `retry: 2`).
 */

import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { Level1Conceptual } from '../components/Level1Conceptual';

afterEach(cleanup);
clockPastNextGuard();

function setup() {
  const { container } = render(<Level1Conceptual onComplete={vi.fn()} onBack={vi.fn()} />);
  const ui = within(container);
  fireEvent.click(ui.getByRole('button', { name: /Byrja/ }));
  const press = (name: string) => fireEvent.click(ui.getByRole('button', { name }));
  const hintShown = () => ui.queryByText(/^Vísbending 1:/) !== null;
  return { ui, press, hintShown };
}

describe('C1, the scale: a step towards 1 L is not a wrong try', () => {
  it('stays closed while the student steps up, and opens after three steps that do not help', () => {
    const { press, hintShown } = setup();
    for (let i = 0; i < 3; i++) press('Bæta við 0,1 lítra');
    expect(hintShown()).toBe(false);

    press('Draga frá 1 lítra'); // 0,3 → 0: further from 1 L
    press('Draga frá 1 lítra'); // stays at 0
    expect(hintShown()).toBe(false);
    press('Draga frá 1 lítra'); // the third wrong try
    expect(hintShown()).toBe(true);
  });
});

describe('C2, the fraction: only a finished fraction that is not 1 is wrong', () => {
  it('counts the second block of a wrong fraction, not the first or a fresh start', () => {
    const { ui, press, hintShown } = setup();
    press('Bæta við 1 lítra'); // C1 solved
    fireEvent.click(ui.getByRole('button', { name: /Næsta áskorun/ }));

    press('1000 mL'); // a numerator
    press('500 mL'); // wrong: 1
    press('1 L'); // a fresh fraction
    // Three taps: the old count opened the hint here.
    expect(hintShown()).toBe(false);

    press('500 mL'); // wrong: 2
    press('1 L'); // a fresh fraction
    press('1 L'); // wrong: 3
    expect(hintShown()).toBe(true);
  });
});
