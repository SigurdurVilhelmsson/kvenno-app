import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AefaScreen } from '../components/AefaScreen';
import { toggleSign } from '../components/ScientificInput';
import { SOLUBILITY_PROBLEMS } from '../data/problems';
import { gradeScientific } from '../engine/ksp';

/**
 * What it takes to play this game on a phone, beyond layout.
 *
 * **The sign button matters most.** Æfa's answers are typed as a number and a
 * power of ten, in two fields that raise the decimal keypad — and on an iPhone
 * that keypad has no minus key, while every answer in Æfa has a negative power.
 * Without the `±` button a student on an iPhone could not enter a single
 * answer in the phase. These tests play one through it.
 *
 * Where the screen lands and where focus goes after a tap is in
 * `phone-scroll.test.tsx`.
 */

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  localStorage.clear();
});

const SIGN = 'Skipta um formerki á veldisvísi';

/** The typed exponent of `value`, e.g. `-5` for 1,34 × 10⁻⁵. */
function powerOf(value: number): number {
  return Math.floor(Math.log10(value));
}

/** Type an answer the grader can read and that is wrong for every problem. */
function answerWrongly() {
  fireEvent.change(screen.getByLabelText('Tala'), { target: { value: '9,9' } });
  fireEvent.change(screen.getByLabelText('Veldisvísir'), { target: { value: '-30' } });
}

describe('toggleSign', () => {
  it('flips the sign of a typed exponent both ways', () => {
    expect(toggleSign('5')).toBe('-5');
    expect(toggleSign('-5')).toBe('5');
    expect(toggleSign('17')).toBe('-17');
  });

  it('reads a typographic minus as a minus', () => {
    expect(toggleSign('−3')).toBe('3');
  });

  it('starts a negative number from an empty field', () => {
    expect(toggleSign('')).toBe('-');
    expect(toggleSign(toggleSign(''))).toBe('');
  });

  it('produces what the grader reads as a negative power', () => {
    expect(gradeScientific({ mantissa: '1,34', exponent: toggleSign('5') }, 1.34e-5).outcome).toBe(
      'rett'
    );
  });
});

describe('an Æfa answer can be entered without a minus key', () => {
  it('is needed on every problem: every answer has a negative power of ten', () => {
    for (const p of SOLUBILITY_PROBLEMS) expect(powerOf(p.answer), p.id).toBeLessThan(0);
  });

  it('digits, then the sign button, is marked right', () => {
    // Æfa runs the problems easiest first, in data order within a difficulty.
    const first = SOLUBILITY_PROBLEMS.find((p) => p.difficulty === 'ledd')!;
    const power = powerOf(first.answer);
    const mantissa = (first.answer / 10 ** power).toFixed(2).replace('.', ',');

    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    expect(screen.getAllByText(first.formula).length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Tala'), { target: { value: mantissa } });
    // Only digits, as the decimal keypad allows.
    fireEvent.change(screen.getByLabelText('Veldisvísir'), {
      target: { value: String(Math.abs(power)) },
    });
    fireEvent.click(screen.getByRole('button', { name: SIGN }));
    expect((screen.getByLabelText('Veldisvísir') as HTMLInputElement).value).toBe(String(power));

    fireEvent.click(screen.getByText('Athuga'));
    expect(screen.getByText('Rétt.')).toBeTruthy();
  });

  it('is locked with the fields once the answer has been checked', () => {
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    // A readable answer, so the check counts as an attempt; an empty one
    // leaves the fields open.
    answerWrongly();
    fireEvent.click(screen.getByText('Athuga'));
    expect(screen.getByRole('button', { name: SIGN }).hasAttribute('disabled')).toBe(true);
  });
});
