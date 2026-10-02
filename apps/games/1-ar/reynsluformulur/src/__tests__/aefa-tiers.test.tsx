// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { AefaScreen, subscriptHint } from '../components/AefaScreen';
import { PROBLEMS } from '../data/problems';
import { deriveEmpirical } from '../engine/empirical';

/**
 * Æfa answers a wrong column in two tiers (decisions item 46, option b).
 *
 * It printed `rétt: x` beside every wrong cell on the first try and left the inputs open,
 * so entering zeros and copying what it printed passed every column of every compound. The
 * first wrong try now marks which cells are wrong and gives the column's hint; only a second
 * wrong try on the same column shows the values. The Vísitala hint is built from the
 * compound on screen: it said `1,5 námundað í 2` for all of them, Kalíumdíkrómat's 3,5
 * included, and nothing at all where no multiplier was needed.
 *
 * Queries are scoped to the rendered container (vitest `retry: 2`, no RTL auto-cleanup).
 */

clockPastNextGuard();
beforeEach(() => {
  window.scrollBy = vi.fn() as unknown as typeof window.scrollBy;
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});
afterEach(cleanup);

function fillZeros(container: HTMLElement) {
  for (const input of container.querySelectorAll<HTMLInputElement>('input')) {
    fireEvent.change(input, { target: { value: '0' } });
  }
}

describe('Æfa: a wrong column', () => {
  it('marks the wrong cells first and shows the right values only on a second try', () => {
    const { container } = render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    const ui = within(container);

    fillZeros(container);
    fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));
    expect(container.textContent).not.toMatch(/rétt:/);
    expect(container.textContent).toMatch(/merktir ✗ eru rangir/);
    expect(container.textContent).toMatch(/Mundu að deila, ekki margfalda/);

    fireEvent.click(ui.getByRole('button', { name: 'Reyna aftur' }));
    fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));
    expect(container.textContent).toMatch(/rétt: \d/);
    expect(container.textContent).toMatch(/Rétt gildi eru sýnd/);
  });

  it('starts the next column back at the first tier', () => {
    const { container } = render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    const ui = within(container);
    const derived = deriveEmpirical(
      Object.fromEntries(PROBLEMS[0].percentages.map((p) => [p.element, p.percent]))
    );
    // Two wrong tries on Mól, then the right moles.
    fillZeros(container);
    fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));
    fireEvent.click(ui.getByRole('button', { name: 'Reyna aftur' }));
    fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));
    derived.rows.forEach((r) => {
      fireEvent.change(ui.getByLabelText(`Mól fyrir ${r.element}`), {
        target: { value: r.moles.toFixed(3).replace('.', ',') },
      });
    });
    fireEvent.click(ui.getByRole('button', { name: 'Reyna aftur' }));
    fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));
    fireEvent.click(ui.getByRole('button', { name: 'Næsta súla' }));

    fillZeros(container);
    fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));
    expect(container.textContent).not.toMatch(/rétt:/);
  });
});

describe('Æfa: the Vísitala hint', () => {
  const derivedOf = (name: string) => {
    const p = PROBLEMS.find((x) => x.name === name)!;
    return deriveEmpirical(Object.fromEntries(p.percentages.map((q) => [q.element, q.percent])));
  };

  it("names the compound's own ratio, so Kalíumdíkrómat's is 3,5", () => {
    const hint = subscriptHint(derivedOf('Kalíumdíkrómat'));
    expect(hint).toMatch(/3,5 námundað í 4/);
    expect(hint).not.toMatch(/1,5 námundað/);
  });

  it('says something for every compound, with or without a multiplier', () => {
    for (const p of PROBLEMS) {
      const derived = deriveEmpirical(
        Object.fromEntries(p.percentages.map((q) => [q.element, q.percent]))
      );
      const hint = subscriptHint(derived);
      expect(hint.length, p.name).toBeGreaterThan(20);
      if (derived.multiplier > 1)
        expect(hint, p.name).toMatch(new RegExp(`${derived.multiplier} dugar`));
      else expect(hint, p.name).toMatch(/þegar heilar tölur/);
    }
  });
});
