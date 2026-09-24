// @vitest-environment jsdom
/**
 * The unit visualiser must show the right chain cancelling to the right unit.
 *
 * Three defects made Level 2's central picture disagree with the arithmetic:
 *
 * - A compound start unit (`km/klst`, `m/s`, `g/mL` — L2-8, L2-11, L2-15) went
 *   in whole, as one numerator block no factor could ever match. The correct
 *   chain for L2-8 therefore cancelled nothing and ended on
 *   "km/klst · m · klst / km · s".
 * - The animation stopped after the first pair: the parent's flag drops at
 *   1,5 s, before a second pair starts. Every two-factor chain was left
 *   half-cancelled, with no final unit shown.
 * - Units cancelled by name, so every copy of a unit went at once: a chain
 *   holding a factor and its inverse (mg·mg·g / g·mg, which is mg) was shown
 *   as unitless.
 */

import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { formatDecimal } from '@shared/utils';

import { Level2 } from '../components/Level2';
import {
  UnitCancellationVisualizer,
  chainUnits,
  pairUnits,
  splitUnit,
} from '../components/UnitCancellationVisualizer';
import { level2Problems } from '../data/problems';
import { applyFactorPath } from '../utils/grading';

const label = (factor: string) => factor.split(' / ').join('');
const invert = (factor: string) => factor.split(' / ').reverse().join(' / ');

/** "Lokaeining: m / s" → "m/s", to compare with a problem's target unit. */
function finalUnitShown(): string | null {
  const line = screen.queryByText(/^Lokaeining:/);
  return line ? (line.textContent ?? '').replace(/^Lokaeining:\s*/, '').replace(/\s/g, '') : null;
}
function runAnimation() {
  // In steps, so each cancellation's re-render can schedule the next one.
  for (let i = 0; i < 40; i++) {
    act(() => {
      vi.advanceTimersByTime(200);
    });
  }
}
function renderWithChain(index: number, factors: string[]) {
  render(
    <Level2
      onComplete={vi.fn()}
      onBack={vi.fn()}
      initialProgress={{ problemsCompleted: index, finalAnswersCorrect: 0, mastered: false }}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /Skipta í smella-ham/ }));
  const panel = () => screen.queryByText('Stuðlar notaðir:')?.parentElement;
  for (const factor of factors) {
    const button = screen
      .getAllByRole('button')
      .find((b) => b.textContent === label(factor) && !panel()?.contains(b));
    fireEvent.click(button!);
  }
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('the unit algebra', () => {
  it('splits a compound unit across the bar', () => {
    expect(splitUnit('km/klst')).toEqual({ numerator: ['km'], denominator: ['klst'] });
    expect(splitUnit('mg')).toEqual({ numerator: ['mg'], denominator: [] });
    expect(splitUnit('')).toEqual({ numerator: [], denominator: [] });
  });

  it.each(level2Problems.map((p) => [p.id, p] as const))(
    '%s: the correct chain leaves exactly the target unit',
    (_id, problem) => {
      const { numerator, denominator } = chainUnits(problem.startUnit, problem.correctPath);
      const left = pairUnits(numerator, denominator);
      expect({ numerator: left.numerator, denominator: left.denominator }).toEqual(
        splitUnit(problem.targetUnit)
      );
    }
  );

  it('cancels a unit only as often as it appears on both sides', () => {
    // 500 mg × (1000 mg / 1 g) × (1 g / 1000 mg) is 500 mg, not unitless.
    const { numerator, denominator } = chainUnits('mg', ['1000 mg / 1 g', '1 g / 1000 mg']);
    const left = pairUnits(numerator, denominator);
    expect(left.pairs).toHaveLength(2);
    expect(left.numerator).toEqual(['mg']);
    expect(left.denominator).toEqual([]);
  });
});

describe('Level 2 draws the correct chain cancelling to its target unit', () => {
  it.each(level2Problems.map((p, i) => [p.id, i] as const))('%s', (_id, index) => {
    vi.useFakeTimers();
    const problem = level2Problems[index];
    renderWithChain(index, problem.correctPath);
    runAnimation();
    expect(finalUnitShown()).toBe(problem.targetUnit.replace(/\s/g, ''));
    // Nothing is left waiting to cancel.
    expect(screen.queryByText(/í bæði teljara og nefnara/)).toBeNull();

    // And the picture agrees with the grade.
    fireEvent.change(screen.getByPlaceholderText('Sláðu inn svar'), {
      target: { value: formatDecimal(applyFactorPath(problem.startValue, problem.correctPath)) },
    });
    fireEvent.click(screen.getByRole('button', { name: /Athuga svar/ }));
    expect(screen.getByText(/^Rétt! /)).toBeTruthy();
  });

  it('keeps one mg when a factor and its inverse are both in the chain', () => {
    vi.useFakeTimers();
    const right = level2Problems[0].correctPath[0]; // L2-1: 1 g / 1000 mg
    renderWithChain(0, [invert(right), right]);
    runAnimation();
    expect(finalUnitShown()).toBe('mg');
  });
});

describe('the visualiser on its own', () => {
  it('cancels one copy per pair when asked a pair at a time', () => {
    vi.useFakeTimers();
    // mg·mg·g / g·mg: one mg and the g cancel, one mg is left.
    render(
      <UnitCancellationVisualizer
        numeratorUnits={['mg', 'mg', 'g']}
        denominatorUnits={['g', 'mg']}
        showCancelButton
      />
    );
    for (let i = 0; i < 2; i++) {
      fireEvent.click(screen.getByRole('button', { name: /Strika út/ }));
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }
    expect(screen.queryByRole('button', { name: /Strika út/ })).toBeNull();
    expect(finalUnitShown()).toBe('mg');
  });
});

describe('the waiting-to-cancel message', () => {
  it('agrees in number with the units it names', () => {
    render(
      <UnitCancellationVisualizer
        numeratorUnits={['km', 'm', 'klst']}
        denominatorUnits={['klst', 'km', 's']}
      />
    );
    expect(screen.getByText(/í bæði teljara og nefnara/).textContent).toBe(
      'km, klst eru í bæði teljara og nefnara og strikast út!'
    );
    cleanup();
    render(<UnitCancellationVisualizer numeratorUnits={['mg', 'g']} denominatorUnits={['mg']} />);
    expect(screen.getByText(/í bæði teljara og nefnara/).textContent).toBe(
      'mg er í bæði teljara og nefnara og strikast út!'
    );
  });
});
