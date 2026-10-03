import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { formatDecimal } from '@shared/utils';

import App from '../App';
import { clockPastNextGuard } from './next-guard-clock';
import { Level1 } from '../components/Level1';
import { Level3 } from '../components/Level3';
import { YIELD_PROBLEMS } from '../data/yieldProblems';

clockPastNextGuard();

/**
 * No points in Takmarkandi hvarfefni — mobile-pass decision 1 (b), with item
 * 54 (a) for Stig 3. Each level ends with how many were right, `N af M rétt`,
 * and the menu shows that per level.
 *
 * The counting rule: a right answer counts, except one the game had already
 * shown. Stig 3 prints "Rétt svar: …" on a wrong step and then offers
 * "Reyna aftur", so a step put right after that is not counted. It used to
 * pay the same 10 points either way, so anyone reached 150 of 150.
 *
 * These play the real components through their buttons, scoped to each
 * rendered container (vitest runs with `retry: 2` and no RTL auto-cleanup).
 */

afterEach(() => {
  cleanup();
  localStorage.clear();
});

/** A running score: "Stig: 30", "30 stig", "30/30 stig". */
function expectNoPoints(root: HTMLElement) {
  const text = root.textContent ?? '';
  expect(text).not.toMatch(/\bStig:\s*\d/);
  expect(text).not.toMatch(/\d+\s*stig(um)?\b/);
}

const reactantCards = (root: HTMLElement) =>
  within(root)
    .getAllByRole('button')
    .filter((b) => /sameind/.test(b.textContent ?? ''));

/** 0 if the left reactant runs out first, 1 if the right one does. */
function limitingSide(root: HTMLElement): 0 | 1 {
  const [left, right] = reactantCards(root).map((card) => {
    const text = card.textContent ?? '';
    return Number(text.match(/(\d+) sameind/)![1]) / Number(text.match(/Stu.ull: (\d+)/)![1]);
  });
  return left <= right ? 0 : 1;
}

describe('Stig 1', () => {
  it('ends with "N af 8 rétt" and reports the count', () => {
    const onComplete = vi.fn();
    const { container } = render(<Level1 onComplete={onComplete} onBack={() => {}} />);
    fireEvent.click(within(container).getByText(/Byrja æfingar/));
    for (let q = 0; q < 8; q++) {
      expectNoPoints(container);
      const side = limitingSide(container);
      fireEvent.click(reactantCards(container)[q < 3 ? 1 - side : side]);
      expectNoPoints(container);
      fireEvent.click(within(container).getByText(/Næsta spurning|Sjá niðurstöður/));
    }
    expect(container.textContent).toContain('Þú svaraðir 5 af 8 rétt');
    expectNoPoints(container);
    fireEvent.click(within(container).getByText('Ljúka stigi'));
    expect(onComplete).toHaveBeenCalledWith(5, 8);
  });
});

describe('Stig 3', () => {
  const showing = (root: HTMLElement) =>
    YIELD_PROBLEMS.find((p) => within(root).queryByText(p.reaction.equation) !== null)!;
  const comma = (n: number, places: number) => formatDecimal(n, places);

  it('does not count a step put right after its answer was shown', () => {
    const onComplete = vi.fn();
    const { container } = render(<Level3 onComplete={onComplete} onBack={() => {}} />);
    const ui = within(container);

    for (let p = 0; p < YIELD_PROBLEMS.length; p++) {
      const { reaction, result } = showing(container);
      const pick = (formula: string) =>
        fireEvent.click(ui.getAllByRole('button').find((b) => b.textContent?.trim() === formula)!);

      // Step 1 wrong: the answer is printed, then put right.
      const wrong =
        result.limitingFormula === reaction.reactant1.formula
          ? reaction.reactant2.formula
          : reaction.reactant1.formula;
      pick(wrong);
      fireEvent.click(ui.getByText('Athuga'));
      expect(ui.getByText(/Rétt svar:/)).toBeTruthy();
      expectNoPoints(container);
      fireEvent.click(ui.getByText('Reyna aftur'));
      pick(result.limitingFormula);
      fireEvent.click(ui.getByText('Athuga'));
      fireEvent.click(ui.getByText('Áfram →'));

      // Steps 2 and 3 right at once.
      fireEvent.change(ui.getByLabelText('Fræðilegar heimtur í grömmum'), {
        target: { value: comma(result.theoreticalGrams, 2) },
      });
      fireEvent.click(ui.getByText('Athuga'));
      fireEvent.click(ui.getByText('Áfram →'));
      fireEvent.change(ui.getByLabelText('Prósentuheimtur'), {
        target: { value: comma(result.percent, 1) },
      });
      fireEvent.click(ui.getByText('Athuga'));
      fireEvent.click(ui.getByText('Áfram →'));

      // The problem's review: two of three, not "30/30 stig".
      expect(container.textContent).toContain('2 af 3 skrefum rétt');
      expectNoPoints(container);
      fireEvent.click(ui.getByText(/Næsta verkefni|Sjá niðurstöður/));
    }

    const steps = YIELD_PROBLEMS.length * 3;
    const right = YIELD_PROBLEMS.length * 2;
    expect(container.textContent).toContain(`Þú svaraðir ${right} af ${steps} skrefum rétt`);
    expectNoPoints(container);
    fireEvent.click(ui.getByText('Ljúka stigi'));
    expect(onComplete).toHaveBeenCalledWith(right, steps);
  });
});

describe('the menu', () => {
  const KEY = 'takmarkandi-levels-progress';

  it('shows "N af M rétt" per level, and no total', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        level1Completed: true,
        level1Correct: 6,
        level1Total: 8,
        level2Completed: false,
        level3Completed: true,
        level3Correct: 12,
        level3Total: 15,
      })
    );
    const { container } = render(<App />);
    expect(container.textContent).toContain('✓ 6 af 8 rétt');
    expect(container.textContent).toContain('✓ 12 af 15 rétt');
    expect(container.textContent).not.toMatch(/Heildarstig|Leikir spilaðir/);
    expectNoPoints(container);
  });

  it('shows old saved points as "Lokið", with no count', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        level1Completed: true,
        level1Score: 80,
        level2Completed: false,
        level2Score: 0,
        level3BestScore: 120,
        totalGamesPlayed: 2,
      })
    );
    const { container } = render(<App />);
    const lokid = container.textContent?.match(/✓ Lokið/g) ?? [];
    expect(lokid).toHaveLength(2);
    expect(container.textContent).not.toMatch(/80|120/);
    expect(within(container).getByText('Stigum lokið').previousElementSibling?.textContent).toBe(
      '2/3'
    );
  });
});
