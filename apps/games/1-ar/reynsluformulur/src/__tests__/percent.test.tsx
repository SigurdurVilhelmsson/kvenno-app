// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { PercentScreen } from '../components/PercentScreen';
import { PERCENT_ITEMS } from '../data/percent';

/**
 * Æfa's first part, percent composition (decision 3, 2026-11-15). The three compounds are
 * the book's (`ch03/m68702`), and the numbers it prints must come out of the derived data:
 * ammonia 82,24 % N, iron(III) oxide 69,9 % Fe, aspirin C₉H₈O₄.
 *
 * Queries are scoped to the rendered container (vitest `retry: 2`, no RTL auto-cleanup).
 */

clockPastNextGuard();
beforeEach(() => {
  window.scrollBy = vi.fn() as unknown as typeof window.scrollBy;
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});
afterEach(cleanup);

const comma = (n: number) => n.toFixed(4).replace('.', ',');

function fill(container: HTMLElement, values: number[] | string) {
  container.querySelectorAll<HTMLInputElement>('input').forEach((input, i) => {
    const value = typeof values === 'string' ? values : comma(values[i]);
    fireEvent.change(input, { target: { value } });
  });
}

describe('percent composition data', () => {
  it("reproduces the book's printed results", () => {
    const [ammonia, iron, aspirin] = PERCENT_ITEMS;
    expect(ammonia.rows[0].percent).toBeCloseTo(82.24, 2);
    expect(iron.rows[0].percent).toBeCloseTo(69.9, 1);
    expect(aspirin.formula).toBe('C₉H₈O₄');
  });

  it('sums every compound to 100 %', () => {
    for (const item of PERCENT_ITEMS) {
      const sum = item.rows.reduce((s, r) => s + r.percent, 0);
      expect(sum).toBeCloseTo(100, 6);
    }
  });
});

describe('PercentScreen', () => {
  it('marks wrong cells first and shows the values only on a second wrong try', () => {
    const { container } = render(
      <PercentScreen onComplete={() => {}} onSkip={() => {}} onBack={() => {}} />
    );
    const ui = within(container);

    fill(container, '0');
    fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));
    expect(container.textContent).not.toMatch(/rétt:/);
    expect(container.textContent).toMatch(/merktir ✗ eru rangir/);

    fireEvent.click(ui.getByRole('button', { name: 'Reyna aftur' }));
    fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));
    expect(container.textContent).toMatch(/rétt: \d/);
  });

  it('skips straight to the empirical table', () => {
    const onSkip = vi.fn();
    const { container } = render(
      <PercentScreen onComplete={() => {}} onSkip={onSkip} onBack={() => {}} />
    );
    fireEvent.click(within(container).getByRole('button', { name: 'Beint í reynsluformúluna' }));
    expect(onSkip).toHaveBeenCalledOnce();
  });

  it('runs both columns of all three compounds, then hands on', () => {
    const onComplete = vi.fn();
    const { container } = render(
      <PercentScreen onComplete={onComplete} onSkip={() => {}} onBack={() => {}} />
    );
    const ui = within(container);

    PERCENT_ITEMS.forEach((item, i) => {
      fill(
        container,
        item.rows.map((r) => r.mass)
      );
      fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));
      fireEvent.click(ui.getByRole('button', { name: 'Næsta súla' }));

      fill(
        container,
        item.rows.map((r) => r.percent)
      );
      fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));
      expect(container.textContent).toMatch(/Samtals 100,00 %/);
      const last = i === PERCENT_ITEMS.length - 1;
      fireEvent.click(
        ui.getByRole('button', { name: last ? 'Áfram í reynsluformúluna' : 'Næsta efni' })
      );
    });
    expect(onComplete).toHaveBeenCalledOnce();
  });
});
