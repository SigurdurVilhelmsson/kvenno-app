import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { BeitaScreen } from '../components/BeitaScreen';
import { KannaScreen } from '../components/KannaScreen';
import { MIXING_PROBLEMS } from '../data/problems';

/**
 * Every number a student reads is printed with the Icelandic decimal comma.
 *
 * Kanna printed its slider steps, its bar label and its suppression factor
 * with a full stop (`0.0001`, `Í 0.01 M Cl⁻`, `1.0-falt`), and Beita printed
 * `Q / Ksp = 2.73` — each through `toFixed` or plain interpolation, beside
 * scientific numbers that already used the comma. These render the real
 * screens and read what is on them.
 */

clockPastNextGuard();

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});

function setSlider(root: HTMLElement, step: number) {
  fireEvent.change(within(root).getByRole('slider'), { target: { value: String(step) } });
}

describe('Kanna', () => {
  it('labels the slider steps with a comma', () => {
    const { container } = render(<KannaScreen onComplete={() => {}} onBack={() => {}} />);
    const ticks = container.querySelector('input[type=range]')!.nextElementSibling!;
    expect([...ticks.children].map((t) => t.textContent)).toEqual([
      '0',
      '0,0001',
      '0,001',
      '0,01',
      '0,05',
      '0,1',
    ]);
  });

  it('names the chosen concentration with a comma, on the bar and to a screen reader', () => {
    const { container } = render(<KannaScreen onComplete={() => {}} onBack={() => {}} />);
    setSlider(container, 3);
    expect(within(container).getByText('Í 0,01 M Cl⁻')).toBeTruthy();
    expect(within(container).getByRole('slider').getAttribute('aria-valuetext')).toBe('0,01 M');
  });

  it('prints a small suppression factor with a comma', () => {
    const { container } = render(<KannaScreen onComplete={() => {}} onBack={() => {}} />);
    // PbCl₂ is soluble enough that 0,0001 M chloride barely moves it.
    fireEvent.click(within(container).getByRole('button', { name: 'PbCl₂' }));
    setSlider(container, 1);
    expect(within(container).getByText('1,0-falt')).toBeTruthy();
  });
});

describe('Beita', () => {
  it('prints Q / Ksp with a comma', () => {
    const { container } = render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
    // Walk to the 25 mL against 75 mL problem, where Q / Ksp is below ten and
    // so printed to two decimals.
    const index = MIXING_PROBLEMS.findIndex((p) => p.ratio < 10 && p.ratio > 1);
    expect(index).toBeGreaterThanOrEqual(0);
    for (let i = 0; i <= index; i++) {
      fireEvent.click(within(container).getByRole('button', { name: /Já, Q/ }));
      if (i < index) fireEvent.click(within(container).getByText('Næsta dæmi'));
    }
    const ratio = MIXING_PROBLEMS[index].ratio.toFixed(2).replace('.', ',');
    expect(within(container).getByText(`Q / Ksp = ${ratio}`)).toBeTruthy();
    expect(container.textContent).not.toMatch(/Q \/ Ksp = \d+\.\d/);
  });
});

describe('the source', () => {
  it('no screen prints a fractional number through toFixed alone', () => {
    // toFixed(0) is an integer and has no decimal separator to get wrong.
    const dir = join(__dirname, '../components');
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.tsx'))) {
      const source = readFileSync(join(dir, file), 'utf8');
      expect(source, file).not.toMatch(/\.toFixed\([1-9]\)/);
    }
  });
});
