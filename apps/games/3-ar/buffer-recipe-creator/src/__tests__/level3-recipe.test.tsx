// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { parseStudentNumber } from '@shared/utils';

import Level3 from '../components/Level3';
import { LEVEL3_PUZZLES } from '../data/level3-puzzles';
import { BUFFER_PROBLEMS } from '../data/problems';
import { solveStockRecipe } from '../engine/buffer';

/**
 * Stig 3 grades, hints and explains one derived recipe.
 *
 * **Why this exists.** Until 2026-09-23 the level derived its ratio and moles
 * but graded the volumes against `correctAcidVolume` / `correctBaseVolume`
 * typed into the data, and every hint was typed by hand. The ammonium puzzle
 * had been worked from pKa 9,25 and never redone for Appendix D's 9,26: its
 * hints taught `10^(0,25) = 1,78` beside a topic line quoting 9,26 and 9,50,
 * its worked solution printed `0,0146 mol / 2 M = 7,1 mL` (the division gives
 * 7,3), and a student who entered 7,6 mL — 4 % from the true volume, inside
 * the level's own ±5 % — was marked wrong.
 */

const problemOf = (problemId: number) => BUFFER_PROBLEMS.find((p) => p.id === problemId)!;
const recipeOf = (puzzle: (typeof LEVEL3_PUZZLES)[number]) =>
  solveStockRecipe(problemOf(puzzle.problemId), puzzle);

/** Every number written after `label` in `text`, e.g. `Sýra = 7,74 mL`. */
function numbersAfter(text: string, label: RegExp): number[] {
  return [...text.matchAll(label)].map((m) => parseStudentNumber(m[1]));
}

describe('solveStockRecipe', () => {
  it('works the blood-buffer recipe by hand', () => {
    // 0,1 M × 0,1 L = 0,01 mol; ratio 10^0,20 = 1,585, so acid 0,01 / 2,585.
    const r = recipeOf(LEVEL3_PUZZLES[0]);
    expect(r.totalMoles).toBeCloseTo(0.01, 10);
    expect(r.acidMoles).toBeCloseTo(0.003869, 6);
    expect(r.acidVolume).toBeCloseTo(7.737, 3);
    expect(r.baseVolume).toBeCloseTo(12.263, 3);
    expect(r.waterVolume).toBeCloseTo(80, 6);
  });
});

describe('Level 3 hints agree with the grader', () => {
  for (const puzzle of LEVEL3_PUZZLES) {
    const problem = problemOf(puzzle.problemId);
    const r = recipeOf(puzzle);
    const all = [...Object.values(puzzle.hints), puzzle.explanationIs].join(' ');

    describe(`puzzle ${puzzle.id} (problem ${problem.id})`, () => {
      it('reveals volumes the level then accepts', () => {
        const [acid] = numbersAfter(puzzle.hints.solution, /Sýra = (\d+,\d+) mL/g);
        const [base] = numbersAfter(puzzle.hints.solution, /Basi = (\d+,\d+) mL/g);
        expect(acid, puzzle.hints.solution).toBeCloseTo(r.acidVolume, 2);
        expect(base, puzzle.hints.solution).toBeCloseTo(r.baseVolume, 2);
      });

      it('reveals moles the level then accepts', () => {
        const [acid] = numbersAfter(all, /Sýra: (\d+,\d+) mól/g);
        const [base] = numbersAfter(all, /Basi: (\d+,\d+) mól/g);
        // Three significant figures: within 0,5 %, far inside the level's 10 %.
        expect(Math.abs(acid - r.acidMoles) / r.acidMoles).toBeLessThan(0.005);
        expect(Math.abs(base - r.baseMoles) / r.baseMoles).toBeLessThan(0.005);
      });

      it('quotes the exponent and the ratio the problem actually has', () => {
        const diff = problem.targetPH - problem.pKa;
        // `10^0,26` and `10^(−0,20)`, but not the `7,40` of `10^(7,40-7,20)`.
        const exponents = [...all.matchAll(/10\^\(?([−-]?\d+,\d+)(?=\)|\s|$)/g)].map((m) =>
          parseStudentNumber(m[1].replace('−', '-'))
        );
        for (const e of exponents) expect(e).toBeCloseTo(diff, 2);

        // `10^(…) = 1,58`, `10^0,26 ≈ 1,82`, and the explanations' `hlutfall 1,74`.
        const quoted = [
          ...numbersAfter(all, /10\^\S+ [=≈] (\d+,\d+)/g),
          ...numbersAfter(all, /[Hh]lutfall(?: aðeins)? (\d+,\d+)/g),
        ];
        expect(quoted.length).toBeGreaterThan(0);
        for (const q of quoted) expect(q).toBeCloseTo(r.ratio, 2);
      });

      it('makes the water up to the final volume', () => {
        const [water] = numbersAfter(all, /Vatn = (\d+,\d+) mL/g);
        if (water === undefined) return; // puzzle 1's solution names the stocks only
        expect(water).toBeCloseTo(puzzle.targetVolume - r.acidVolume - r.baseVolume, 1);
      });

      it('stores no answer of its own', () => {
        expect(Object.keys(puzzle)).not.toContain('correctAcidVolume');
        expect(Object.keys(puzzle)).not.toContain('correctBaseVolume');
        expect(Object.keys(puzzle)).not.toContain('correctWaterVolume');
      });
    });
  }
});

// ---------------------------------------------------------------------------
// The component, played through.

beforeEach(() => {
  vi.useFakeTimers();
  Element.prototype.scrollIntoView = vi.fn();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/** Let an answered step finish fading out, so the next step's fields are the last ones. */
const settle = () => act(() => void vi.advanceTimersByTime(400));

function lastButton(container: HTMLElement, name: string | RegExp) {
  const all = within(container).getAllByRole('button', { name });
  return all[all.length - 1];
}

function fillLast(container: HTMLElement, values: string[]) {
  const fields = Array.from(container.querySelectorAll('input[inputmode="decimal"]'));
  const mine = fields.slice(fields.length - values.length);
  mine.forEach((field, i) => fireEvent.change(field, { target: { value: values[i] } }));
}

const comma = (n: number, dp: number) => n.toFixed(dp).replace('.', ',');

/** Answer the ratio and mole steps of the current puzzle correctly. */
function reachVolumes(container: HTMLElement, puzzle: (typeof LEVEL3_PUZZLES)[number]) {
  const r = recipeOf(puzzle);
  fillLast(container, [comma(r.ratio, 3)]);
  fireEvent.click(lastButton(container, 'Athuga svar'));
  settle();
  fillLast(container, [comma(r.acidMoles, 6), comma(r.baseMoles, 6)]);
  fireEvent.click(lastButton(container, 'Athuga svar'));
  settle();
}

function finishPuzzle(container: HTMLElement) {
  fireEvent.click(lastButton(container, /Næsta verkefni|Ljúka stigi/));
  settle();
}

describe('Level 3 grades volumes against the derived recipe', () => {
  it('accepts volumes 4 % from the derived ones on every puzzle', () => {
    const onComplete = vi.fn();
    const { container } = render(<Level3 onComplete={onComplete} onBack={() => {}} />);
    fireEvent.click(within(container).getByRole('button', { name: /Byrja/ }));

    for (const puzzle of LEVEL3_PUZZLES) {
      const r = recipeOf(puzzle);
      reachVolumes(container, puzzle);
      // Inside the ±5 % the level states. The ammonium puzzle's stored 7,1 mL
      // put 7,6 mL outside it, though 7,6 is 4 % from the true 7,30.
      fillLast(container, [comma(r.acidVolume * 1.04, 2), comma(r.baseVolume * 1.04, 2)]);
      fireEvent.click(lastButton(container, 'Athuga svar'));
      settle();
      expect(within(container).queryByText('Rétt svar!'), `puzzle ${puzzle.id}`).toBeTruthy();
      finishPuzzle(container);
    }
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(500);
  });

  it('rejects volumes 6 % from the derived ones', () => {
    const { container } = render(<Level3 onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(within(container).getByRole('button', { name: /Byrja/ }));
    const r = recipeOf(LEVEL3_PUZZLES[0]);
    reachVolumes(container, LEVEL3_PUZZLES[0]);
    fillLast(container, [comma(r.acidVolume * 1.06, 2), comma(r.baseVolume, 2)]);
    fireEvent.click(lastButton(container, 'Athuga svar'));
    expect(within(container).queryByText('Rétt svar!')).toBeNull();
    expect(container.textContent).toContain('Sýrurúmmál er of hátt');
  });

  it('prints a worked solution whose arithmetic holds', () => {
    const { container } = render(<Level3 onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(within(container).getByRole('button', { name: /Byrja/ }));
    for (const puzzle of LEVEL3_PUZZLES) {
      const r = recipeOf(puzzle);
      reachVolumes(container, puzzle);
      fillLast(container, [comma(r.acidVolume, 2), comma(r.baseVolume, 2)]);
      fireEvent.click(lastButton(container, 'Athuga svar'));
      settle();

      const text = container.textContent ?? '';
      const lines = [
        ...text.matchAll(/(\d+,\d+) mól \/ (\d+(?:,\d+)?) M = (\d+,\d+) L = (\d+,\d+) mL/g),
      ];
      expect(lines, `puzzle ${puzzle.id}`).toHaveLength(2);
      for (const [, mol, conc, litres, ml] of lines) {
        const n = parseStudentNumber(mol);
        const c = parseStudentNumber(conc);
        // Each side as printed, so they agree to the printed precision, not exactly.
        const L = parseStudentNumber(litres);
        expect(Math.abs(L - n / c) / (n / c)).toBeLessThan(0.001);
        expect(Math.abs(parseStudentNumber(ml) - L * 1000) / (L * 1000)).toBeLessThan(0.001);
      }
      finishPuzzle(container);
    }
  });

  it('awards a puzzle once, however fast the check is tapped twice', () => {
    // The answered step fades out for 250 ms and its button stays live, so a
    // quick second tap used to award the puzzle again.
    const { container } = render(<Level3 onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(within(container).getByRole('button', { name: /Byrja/ }));
    const r = recipeOf(LEVEL3_PUZZLES[0]);
    reachVolumes(container, LEVEL3_PUZZLES[0]);
    fillLast(container, [comma(r.acidVolume, 2), comma(r.baseVolume, 2)]);
    const check = lastButton(container, 'Athuga svar');
    fireEvent.click(check);
    fireEvent.click(check);
    expect(within(container).getByText('Stig: 100')).toBeTruthy();

    const next = lastButton(container, /Næsta verkefni/);
    fireEvent.click(next);
    fireEvent.click(next);
    expect(within(container).getByText('2 / 5')).toBeTruthy();
  });
});
