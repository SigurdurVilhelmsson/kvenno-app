// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { playLevel2 } from './playthrough';
import { Level2 } from '../components/Level2';
import { challenges, rateConstantMatches, rateConstantOf } from '../data/level2-questions';

/**
 * Level 2 printed a stored `correctRateConstant` after every answer, and nothing held it to the
 * table beside it. "Flóknari tilfelli" (2H₂ + 2NO) showed k = 50 M⁻²s⁻¹ while its own rows give
 * 0,005 / (0,1 × 0,1²) = 5 — out by a factor of ten, on the screen that teaches how to get k.
 *
 * k is now derived from the rows. This reads the value the student is shown, parses it the way
 * they read it (decimal comma), and checks it against **every** experiment in the table, so a
 * stored number cannot drift from the data again.
 */
function shownRateConstant(container: HTMLElement): number {
  const match = /Hraðafasti:\s*k = ([\d.,]+)/.exec(container.textContent ?? '');
  if (!match) throw new Error('no rate constant on the result screen');
  return Number(match[1].replace(',', '.'));
}

// Næsta ignores a press within 400 ms of appearing; these tests press it at once.
clockPastNextGuard();

describe('the rate constant shown after each Level 2 challenge', () => {
  it('reproduces every experiment in that challenge’s own table', () => {
    const checked: number[] = [];
    playLevel2('correct', (index, container) => {
      const challenge = challenges[index];
      const k = shownRateConstant(container);
      for (const row of challenge.data) {
        const predicted =
          k *
          row.concentrationA ** challenge.correctOrderA *
          (row.concentrationB > 0 ? row.concentrationB ** challenge.correctOrderB : 1);
        expect(
          Math.abs(predicted - row.initialRate) / row.initialRate,
          `${challenge.title}, tilraun ${row.experiment}: k = ${k}`
        ).toBeLessThan(0.01);
      }
      checked.push(index);
    });
    expect(checked).toHaveLength(challenges.length);
  });

  it('each table is consistent with a single rate law', () => {
    // The data itself, independent of any display: one k must fit all three rows.
    for (const challenge of challenges) {
      const ks = challenge.data.map(
        (row) =>
          row.initialRate /
          (row.concentrationA ** challenge.correctOrderA *
            (row.concentrationB > 0 ? row.concentrationB ** challenge.correctOrderB : 1))
      );
      for (const k of ks) {
        expect(Math.abs(k - ks[0]) / ks[0], challenge.title).toBeLessThan(1e-9);
      }
    }
  });
});

/**
 * "Reikna k" asked the student to compute k and gave nowhere to enter it: Level 2 graded only
 * the two orders (decisions item 82). The challenges that ask for k now carry a field, graded
 * against the k derived from the table, with the decimal comma.
 */
describe('the challenges that ask for k', () => {
  const asking = challenges.filter((c) => c.asksForRateConstant);

  it('are the ones whose card asks for it', () => {
    expect(asking.map((c) => c.title)).toEqual(['Reikna k']);
    for (const c of challenges) {
      expect(/Reikna|hraðafastann k/.test(`${c.title} ${c.description}`), c.title).toBe(
        !!c.asksForRateConstant
      );
    }
  });

  it.each(asking.map((c) => [c.title, c] as const))(
    '%s: rejects 0, double, half and NaN, and accepts k within 2 %',
    (_title, c) => {
      const k = rateConstantOf(c);
      for (const wrong of [0, k * 2, k / 2, NaN]) expect(rateConstantMatches(c, wrong)).toBe(false);
      for (const right of [k, k * 1.019, k * 0.981])
        expect(rateConstantMatches(c, right)).toBe(true);
    }
  );

  function atRateConstantChallenge() {
    const { container, unmount } = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(container);
    fireEvent.click(ui.getByRole('button', { name: /Byrja æfingar/ }));
    const index = challenges.findIndex((c) => c.asksForRateConstant);
    for (let i = 0; i < index; i++) {
      const c = challenges[i];
      const pick = (reactant: 'A' | 'B', order: number) =>
        fireEvent.click(
          within(ui.getByText(`Stig í [${reactant}]:`).parentElement!).getByRole('button', {
            name: String(order),
          })
        );
      pick('A', c.correctOrderA);
      if (c.data.some((d) => d.concentrationB > 0)) pick('B', c.correctOrderB);
      fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
      fireEvent.click(ui.getByRole('button', { name: /Næsta/ }));
    }
    const c = challenges[index];
    const pickOrder = (reactant: 'A' | 'B', order: number) =>
      fireEvent.click(
        within(ui.getByText(`Stig í [${reactant}]:`).parentElement!).getByRole('button', {
          name: String(order),
        })
      );
    pickOrder('A', c.correctOrderA);
    pickOrder('B', c.correctOrderB);
    return { ui, unmount };
  }

  it('waits for k before Athuga, and grades it with the decimal comma', () => {
    const { ui, unmount } = atRateConstantChallenge();
    const check = ui.getByRole('button', { name: 'Athuga svar' }) as HTMLButtonElement;
    expect(check.disabled).toBe(true);
    fireEvent.change(ui.getByLabelText('k ='), { target: { value: '2,0' } });
    expect(check.disabled).toBe(false);
    fireEvent.click(check);
    expect(ui.getByText('Rétt!')).toBeTruthy();
    unmount();
  });

  it('marks the challenge wrong when only k is wrong, and says what k is', () => {
    const { ui, unmount } = atRateConstantChallenge();
    fireEvent.change(ui.getByLabelText('k ='), { target: { value: '0,5' } });
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
    expect(ui.getByText('Rangt')).toBeTruthy();
    expect(ui.getByText('✗ (rétt: 2,0)')).toBeTruthy();
    unmount();
  });
});
