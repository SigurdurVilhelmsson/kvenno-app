// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LewisGuidedMode } from '../components/LewisGuidedMode';

/**
 * Level 2's walkthrough ("Opna leiðsögn"), played through its real buttons.
 *
 * Three defects, all found on the one molecule it walks through, H₂O:
 *  - A wrong answer had no way forward. The input vanished, and only a correct
 *    answer ever showed "Næsta skref", so the only exit was skipping the whole
 *    walkthrough — and reopening it started again from step 1.
 *  - Step 4 checked only the total number of pairs, which the button already
 *    fixes by staying disabled until every electron is placed. Both pairs on H
 *    passed as "✓ Rétt!", and step 5 then coloured that H green.
 *  - `parseInt(v) || null` read a typed 0 as an empty field.
 *
 * Buttons are found by their visible text where the old version had no other
 * name, so these run unchanged against it. Queries are scoped to the rendered
 * container, since the suite runs with retries.
 */

const WATER_ATOMS = [
  { symbol: 'O', valenceElectrons: 6, position: 'central' as const },
  { symbol: 'H', valenceElectrons: 1, position: 'surrounding' as const },
  { symbol: 'H', valenceElectrons: 1, position: 'surrounding' as const },
];

function renderGuide() {
  const rendered = render(
    <LewisGuidedMode molecule="H₂O" atoms={WATER_ATOMS} totalElectrons={8} onComplete={vi.fn()} />
  );
  const { container } = rendered;
  const ui = within(container);
  const input = () => container.querySelector('input') as HTMLInputElement | null;
  const type = (value: string) => fireEvent.change(input()!, { target: { value } });
  const click = (name: string | RegExp) => fireEvent.click(ui.getByRole('button', { name }));
  /** "+ Par" / "− Par" buttons in screen order: the central atom's card first, then H. */
  const pairButtons = (glyph: '+' | '−') =>
    [...container.querySelectorAll('button')].filter((b) => b.textContent === `${glyph} Par`);
  return { ui, container, input, type, click, pairButtons };
}

/** Answer steps 1–3 correctly and land on step 4, the distribution. */
function reachDistribution(g: ReturnType<typeof renderGuide>) {
  g.type('8');
  g.click('Athuga');
  g.click('Næsta skref →');
  g.click('Ég skil - áfram!');
  g.click('Næsta skref →');
  g.type('2');
  g.click('Athuga');
  // The bonds are drawn, and their electrons counted, half a second later.
  act(() => {
    vi.advanceTimersByTime(600);
  });
  g.click('Næsta skref →');
  expect(g.ui.getByText('Dreifa eftirstandandi rafeindum')).toBeTruthy();
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('a wrong answer can be tried again', () => {
  it('offers "Reyna aftur" on a wrong count, and the step can then be passed', () => {
    const g = renderGuide();
    g.type('7');
    g.click('Athuga');
    expect(g.ui.getByText('✗ Ekki rétt')).toBeTruthy();
    expect(g.ui.queryByRole('button', { name: 'Næsta skref →' })).toBeNull();

    // Before the fix there was no such button, and no input either.
    g.click('Reyna aftur');
    expect(g.input()).not.toBeNull();
    g.type('8');
    g.click('Athuga');
    expect(g.ui.getByText('✓ Rétt!')).toBeTruthy();
    expect(g.ui.getByRole('button', { name: 'Næsta skref →' })).toBeTruthy();
  });

  it('offers "Reyna aftur" on a wrong bond count too', () => {
    const g = renderGuide();
    g.type('8');
    g.click('Athuga');
    g.click('Næsta skref →');
    g.click('Ég skil - áfram!');
    g.click('Næsta skref →');
    g.type('3');
    g.click('Athuga');
    g.click('Reyna aftur');
    g.type('2');
    g.click('Athuga');
    expect(g.ui.getByText('✓ Rétt!')).toBeTruthy();
  });
});

describe('a typed 0 is an answer', () => {
  it('enables "Athuga" for 0, and grades it', () => {
    const g = renderGuide();
    g.type('0');
    const check = g.ui.getByRole('button', { name: 'Athuga' }) as HTMLButtonElement;
    // Before the fix `parseInt('0') || null` made this null, so the button stayed disabled.
    expect(check.disabled).toBe(false);
    fireEvent.click(check);
    expect(g.ui.getByText('✗ Ekki rétt')).toBeTruthy();
  });

  it('still treats an empty field as no answer', () => {
    const g = renderGuide();
    g.type('');
    expect((g.ui.getByRole('button', { name: 'Athuga' }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('step 4 checks where the pairs went, not only how many', () => {
  it('rejects both pairs on H, says where they belong, and lets the student move them', () => {
    const g = renderGuide();
    reachDistribution(g);

    const [, hPlus] = g.pairButtons('+');
    fireEvent.click(hPlus);
    fireEvent.click(hPlus);
    g.click('Athuga dreifingu');

    // Before the fix: "✓ Rétt!" — the total of 2 pairs was all it compared.
    expect(g.ui.getByText('✗ Ekki rétt')).toBeTruthy();
    expect(g.ui.getByText('Rétt dreifing: O (miðatóm) 2 pör, H 0 pör')).toBeTruthy();

    g.click('Reyna aftur');
    const [, hMinus] = g.pairButtons('−');
    fireEvent.click(hMinus);
    fireEvent.click(hMinus);
    const [oPlus] = g.pairButtons('+');
    fireEvent.click(oPlus);
    fireEvent.click(oPlus);
    g.click('Athuga dreifingu');
    expect(g.ui.getByText('✓ Rétt!')).toBeTruthy();

    // Step 5 then shows each H full at 2 electrons, and O at 8.
    g.click('Næsta skref →');
    // (the electron tracker's own green numbers are left out by the unit)
    const green = [...g.container.querySelectorAll('.font-bold.text-green-600')]
      .map((el) => el.textContent)
      .filter((t) => t?.endsWith('rafeindir'));
    expect(green).toEqual(['8 rafeindir', '2 rafeindir', '2 rafeindir']);
  });

  it('also rejects a pair split between O and H', () => {
    const g = renderGuide();
    reachDistribution(g);
    const [oPlus, hPlus] = g.pairButtons('+');
    fireEvent.click(oPlus);
    fireEvent.click(hPlus);
    g.click('Athuga dreifingu');
    expect(g.ui.getByText('✗ Ekki rétt')).toBeTruthy();
  });
});
