import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { kcToKp } from '@shared/engine/equilibrium';
import { gradeScientific } from '@shared/utils';

import { clockPastNextGuard } from './next-guard-clock';
import { AefaScreen } from '../components/AefaScreen';
import { KP_PROBLEMS, kpSlip } from '../data/problems';

/**
 * Kc → Kp names the slip a wrong answer came from, when the value says which.
 *
 * **Why this exists.** The `veldisvisir` message ("right digits, wrong power of ten") told the
 * student to check the sign of Δn and that the temperature was in kelvin. Neither slip lands
 * there: each changes the digits too, so it graded `baedi` or `tolustafir` and the advice was
 * never shown to anyone who had made it. Both slips give an exactly computable value, so they
 * are read off the answer instead.
 */

clockPastNextGuard();
afterEach(cleanup);

const SHIFTING = KP_PROBLEMS.filter((p) => p.deltaN !== 0);
const flipped = (p: (typeof KP_PROBLEMS)[number]) => kcToKp(p.kc, -p.deltaN, p.temperatureC);
const celsius = (p: (typeof KP_PROBLEMS)[number]) =>
  p.kc * Math.pow(0.0821 * p.temperatureC, p.deltaN);

describe('the two slips', () => {
  it('has problems where Δn is not zero, so there is something to diagnose', () => {
    expect(SHIFTING.length).toBeGreaterThan(2);
  });

  it.each(SHIFTING.map((p) => [p.id, p] as const))('%s: each slip is named', (_id, p) => {
    expect(kpSlip(p, flipped(p))).toBe('formerki');
    expect(kpSlip(p, celsius(p))).toBe('celsius');
    expect(kpSlip(p, p.kp)).toBeNull();
    expect(kpSlip(p, p.kp * 3)).toBeNull();
  });

  it.each(SHIFTING.map((p) => [p.id, p] as const))(
    '%s: neither slip reads as right digits with the wrong power',
    (_id, p) => {
      for (const value of [flipped(p), celsius(p)]) {
        const e = Math.floor(Math.log10(value));
        const { outcome } = gradeScientific(
          { mantissa: String(value / 10 ** e), exponent: String(e) },
          p.kp
        );
        expect(outcome).not.toBe('veldisvisir');
      }
    }
  );

  it('says nothing when Δn is zero, where neither slip changes the answer', () => {
    for (const p of KP_PROBLEMS.filter((q) => q.deltaN === 0)) {
      expect(kpSlip(p, p.kp)).toBeNull();
    }
  });
});

describe('on screen', () => {
  function answer(value: number) {
    const e = Math.floor(Math.log10(value));
    fireEvent.change(screen.getByLabelText('Tala'), {
      target: { value: (value / 10 ** e).toFixed(3).replace('.', ',') },
    });
    fireEvent.change(screen.getByLabelText('Veldisvísir'), { target: { value: String(e) } });
    fireEvent.click(screen.getByText('Athuga'));
  }

  it('names the Δn slip on the first problem', () => {
    const p = KP_PROBLEMS[0];
    expect(p.deltaN).not.toBe(0);
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByText('Kc yfir í Kp'));
    answer(flipped(p));
    expect(screen.getByText(/fæst með Δn öfugt/)).toBeTruthy();
  });

  it('says what is wrong with an entry it cannot read, rather than asking for both fields', () => {
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByText('Kc yfir í Kp'));
    fireEvent.change(screen.getByLabelText('Tala'), { target: { value: '6,5 × 10' } });
    fireEvent.change(screen.getByLabelText('Veldisvísir'), { target: { value: '0' } });
    fireEvent.click(screen.getByText('Athuga'));
    expect(screen.getByText(/Í fyrri reitinn fer talan sjálf/)).toBeTruthy();
    expect(screen.queryByText(/Fylltu í báða reitina/)).toBeNull();
  });

  it('names the °C slip on the first problem', () => {
    const p = KP_PROBLEMS[0];
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByText('Kc yfir í Kp'));
    answer(celsius(p));
    expect(screen.getByText(/fæst með hitastigið í °C/)).toBeTruthy();
  });
});
