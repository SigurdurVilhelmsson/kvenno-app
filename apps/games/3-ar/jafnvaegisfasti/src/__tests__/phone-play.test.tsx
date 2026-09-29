import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { gradeScientific } from '@shared/utils';

import { AefaScreen } from '../components/AefaScreen';
import { BeitaScreen } from '../components/BeitaScreen';
import { toggleSign } from '../components/ScientificInput';
import { BEITA_PROBLEMS, KP_PROBLEMS } from '../data/problems';

/**
 * What it takes to play this game on a phone, beyond layout.
 *
 * **The sign button matters most.** Every scientific-notation answer here is
 * typed into two fields that
 * raise the decimal keypad, and on an iPhone that keypad has no minus key. Nine
 * of the ten Beita extents and five of the eight Kp answers have a negative
 * power of ten, so without the `±` button a student on an iPhone could type the
 * right digits and not the power the field asks for. These tests play an
 * answer through it.
 *
 * Where the screen lands after each step is `phone-scroll.test.tsx`.
 */

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const SIGN = 'Skipta um formerki á veldisvísi';

/** The typed exponent of `value`, e.g. `-1` for 0,135. */
function powerOf(value: number): number {
  return Math.floor(Math.log10(value));
}

describe('toggleSign', () => {
  it('flips the sign of a typed exponent both ways', () => {
    expect(toggleSign('5')).toBe('-5');
    expect(toggleSign('-5')).toBe('5');
    expect(toggleSign('12')).toBe('-12');
  });

  it('reads a typographic minus as a minus', () => {
    expect(toggleSign('−3')).toBe('3');
  });

  it('starts a negative number from an empty field', () => {
    expect(toggleSign('')).toBe('-');
    expect(toggleSign(toggleSign(''))).toBe('');
  });

  it('produces what the grader reads as a negative power', () => {
    const graded = gradeScientific({ mantissa: '1,35', exponent: toggleSign('1') }, 0.135, 0.03);
    expect(graded.outcome).toBe('rett');
  });
});

describe('a negative power can be entered without a minus key', () => {
  it('in Beita: digits, then the sign button, is marked right', () => {
    const problem = BEITA_PROBLEMS[0];
    const power = powerOf(problem.result.extent);
    expect(power, 'the first extent has a negative power, or this proves nothing').toBeLessThan(0);
    const mantissa = (problem.result.extent / 10 ** power).toFixed(3).replace('.', ',');

    render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByText('Áfram — myndefnin aukast'));
    fireEvent.change(screen.getByLabelText('Tala'), { target: { value: mantissa } });
    // Only digits, as the decimal keypad allows.
    fireEvent.change(screen.getByLabelText('Veldisvísir'), {
      target: { value: String(Math.abs(power)) },
    });
    fireEvent.click(screen.getByRole('button', { name: SIGN }));
    expect((screen.getByLabelText('Veldisvísir') as HTMLInputElement).value).toBe(String(power));

    fireEvent.click(screen.getByText('Athuga'));
    // A correct extent moves straight on to the five-per-cent question.
    expect(screen.getByText(/nálgunin hefði dugað/)).toBeTruthy();
  });

  it('in the Kc→Kp task: the sign button is there and flips the field', () => {
    const negative = KP_PROBLEMS.findIndex((p) => powerOf(p.kp) < 0);
    expect(negative, 'some Kp answer has a negative power').toBeGreaterThanOrEqual(0);

    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByText('Kc yfir í Kp'));
    fireEvent.change(screen.getByLabelText('Veldisvísir'), { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: SIGN }));
    expect((screen.getByLabelText('Veldisvísir') as HTMLInputElement).value).toBe('-4');
  });

  it('is locked with the fields once a Kp answer has been checked', () => {
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByText('Kc yfir í Kp'));
    // A real answer, wrong on purpose: an empty check is not an attempt and
    // leaves the row open (answer-fields.test.tsx).
    fireEvent.change(screen.getByLabelText('Tala'), { target: { value: '9,9' } });
    fireEvent.change(screen.getByLabelText('Veldisvísir'), { target: { value: '9' } });
    fireEvent.click(screen.getByText('Athuga'));
    expect(screen.getByRole('button', { name: SIGN }).hasAttribute('disabled')).toBe(true);
  });
});
