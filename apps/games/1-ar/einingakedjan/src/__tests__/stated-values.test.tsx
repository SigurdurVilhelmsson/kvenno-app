import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ExploreScreen } from '../components/ExploreScreen';
import { PoolCard, RatioFraction } from '../components/RatioCard';
import { SolveTrace } from '../components/SolveTrace';
import { UnitsDisplay } from '../components/UnitsDisplay';
import { problems } from '../data/problems';
import { allRatios, ratioById } from '../data/ratios';
import { solveChain } from '../engine/chain';
import { orient } from '../engine/units';

/**
 * What a student reads must be what the engine computes with.
 *
 * The game never asks for a typed number, but it shows every number it uses: a
 * card states a fact, the worked solution multiplies by it, and a student who
 * checks a step on a calculator must land on the answer printed beside it.
 */

afterEach(() => {
  cleanup();
});

const SUPERSCRIPT_DIGITS: Record<string, string> = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
  '⁻': '-',
};

/** Read a number back the way a student would: decimal comma, `× 10ⁿ` exponent. */
function readBack(printed: string): number {
  const match = printed.match(/^(-?[\d,]+)(?: × 10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+))?$/);
  if (!match) throw new Error(`Not a number as printed: "${printed}"`);
  const mantissa = Number(match[1].replace(',', '.'));
  const exponent = match[2]
    ? Number(
        match[2]
          .split('')
          .map((c) => SUPERSCRIPT_DIGITS[c])
          .join('')
      )
    : 0;
  return mantissa * 10 ** exponent;
}

const relativelyEqual = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.abs(b);

describe('a ratio card prints the value the engine multiplies by', () => {
  it.each(allRatios.map((r) => [r.id, r] as const))('%s', (_id, ratio) => {
    const view = render(<PoolCard equivalence={ratio} onAdd={() => {}} />);
    // SideText renders each side as [number][unit and substance], both held whole.
    const held = Array.from(view.container.querySelectorAll('span.whitespace-nowrap')).map(
      (s) => s.textContent ?? ''
    );
    expect(held).toHaveLength(4);

    const [left, right] = [readBack(held[0]), readBack(held[2])];
    expect(relativelyEqual(left, ratio.left.value), `${held[0]} is not ${ratio.left.value}`).toBe(
      true
    );
    expect(
      relativelyEqual(right, ratio.right.value),
      `${held[2]} is not ${ratio.right.value}`
    ).toBe(true);

    // The accessible name states the same numbers.
    const name = view.getByRole('button').getAttribute('aria-label') ?? '';
    expect(name).toContain(`${held[0]} ${held[1]}`);
    expect(name).toContain(`${held[2]} ${held[3]}`);
  });

  it('prints Avogadro’s number to the four figures it is used at', () => {
    const view = render(<RatioFraction ratio={orient(ratioById('avo-Mg'), 'forward')} />);
    expect(view.container.textContent).toContain('6,022 × 10²³');
  });

  it('agrees with the worked solution a student can check by hand (B3)', () => {
    // 500 mg CaCO₃ → g → mol → mol HCl → L. With the molar mass printed as the
    // card prints it, the hand calculation must land on the printed answer.
    const b3 = problems.find((p) => p.id === 'B3')!;
    const pool = b3.poolIds.map(ratioById);
    const chain = solveChain(
      b3.start,
      [
        { equivalenceId: 'metric-mg-g', orientation: 'flipped' },
        { equivalenceId: 'mm-CaCO3', orientation: 'flipped' },
        { equivalenceId: 'jafna-CaCO3-HCl', orientation: 'flipped' },
        { equivalenceId: 'molstyrkur-HCl-0100', orientation: 'flipped' },
      ],
      pool,
      b3.target
    );
    expect(chain.status).toBe('solved');

    const card = render(<PoolCard equivalence={ratioById('mm-CaCO3')} onAdd={() => {}} />);
    const printedMolarMass = readBack(
      card.container.querySelector('span.whitespace-nowrap')?.textContent ?? ''
    );
    cleanup();

    const byHand = (0.5 / printedMolarMass) * 2 * (1 / 0.1);
    const answer = render(<UnitsDisplay quantity={chain.final} />);
    const printedAnswer = answer.container.querySelector('.tabular-nums')?.textContent ?? '';
    expect(Number(byHand.toPrecision(4))).toBe(readBack(printedAnswer));
  });
});

describe('the starting measurement keeps its trailing zeros everywhere it is shown', () => {
  it.each(problems.map((p) => [p.id, p] as const))(
    '%s: the first step of the worked solution',
    (_id, problem) => {
      // Any card that cancels the start will do; the shortest solution's first card does.
      const pool = problem.poolIds.map(ratioById);
      const first = pool
        .flatMap((e) => (['forward', 'flipped'] as const).map((o) => ({ e, o })))
        .find(
          ({ e, o }) =>
            solveChain(
              problem.start,
              [{ equivalenceId: e.id, orientation: o }],
              pool,
              problem.target
            ).steps[0].cancelCount > 0
        )!;
      const { steps } = solveChain(
        problem.start,
        [{ equivalenceId: first.e.id, orientation: first.o }],
        pool,
        problem.target
      );

      const view = render(
        <SolveTrace
          start={problem.start}
          startLabel={problem.startLabel}
          steps={steps}
          revealed={1}
        />
      );
      const stepOne = view.getByText('Skref 1').closest('li') as HTMLElement;
      const values = Array.from(stepOne.querySelectorAll('.tabular-nums')).map(
        (s) => s.textContent
      );
      // [the quantity going in, the quantity coming out]
      expect(values[0]).toBe(problem.startLabel);
    }
  );

  it('Kanna: what you have before any card is placed', () => {
    const view = render(<ExploreScreen onComplete={() => {}} onBack={() => {}} />);
    const box = view.getByText('Þú ert núna með').parentElement as HTMLElement;
    expect(within(box).getByText('5,00')).toBeTruthy();
  });

  it('Kanna: and the computed value once a card has been placed', () => {
    const view = render(<ExploreScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(
      view
        .getAllByRole('button')
        .find((b) => b.getAttribute('aria-label')?.includes(': 24,31 g Mg'))!
    );
    fireEvent.click(view.getByRole('button', { name: 'Snúa við hlutfalli númer 1' }));
    const box = view.getByText('Þú ert núna með').parentElement as HTMLElement;
    expect(box.querySelector('.tabular-nums')?.textContent).toBe('0,2057');
  });
});

describe('a fraction tells a screen reader which way up it is', () => {
  it('names the fraction bar in a ratio', () => {
    const view = render(<RatioFraction ratio={orient(ratioById('mm-Mg'), 'flipped')} />);
    expect(view.container.textContent?.replace(/\s+/g, ' ')).toBe('1 mol Mg deilt með 24,31 g Mg');
  });

  it('names the fraction bar in a unit with a denominator', () => {
    const quantity = {
      value: 5,
      num: [
        { unit: 'g', species: 'Mg' },
        { unit: 'g', species: 'Mg' },
      ],
      den: [{ unit: 'mol', species: 'Mg' }],
    };
    const view = render(<UnitsDisplay quantity={quantity} unitsOnly />);
    expect(view.container.textContent?.replace(/\s+/g, ' ')).toContain('deilt með mol Mg');
  });

  it('keeps the words out of the visual layout', () => {
    const view = render(<RatioFraction ratio={orient(ratioById('mm-Mg'), 'flipped')} />);
    const words = view.getByText('deilt með');
    expect(words.className).toContain('sr-only');
  });
});
