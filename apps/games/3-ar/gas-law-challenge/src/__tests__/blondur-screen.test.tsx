import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { BlondurScreen, matchSlip } from '../components/BlondurScreen';
import { BLONDUR_PROBLEMS, shownAnswer } from '../data/blondur';
import { within } from '../engine/blondur';

const startAefa = () => {
  render(<BlondurScreen onBack={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: /Æfa: átta dæmi/ }));
};
const answer = (value: string) => {
  fireEvent.change(screen.getByLabelText(/^Svar í/), { target: { value } });
  fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
};
const typed = (n: number) => String(n).replace('.', ',');

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
  // Næsta drops a press within 400 ms of appearing; every read of the clock is later.
  let t = 0;
  vi.spyOn(performance, 'now').mockImplementation(() => (t += 500));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Gasblöndur screen', () => {
  it('opens from the menu with its title focused', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Opna gasblöndur' }));
    const focused = document.activeElement;
    expect(focused?.tagName).toBe('H2');
    expect(focused?.textContent).toBe('Gasblöndur og efnahvörf');
    expect(screen.getByRole('button', { name: /Æfa: átta dæmi/ })).toBeTruthy();
  });

  it('Kanna: adding argon leaves the other partial pressures alone and raises the total', () => {
    render(<BlondurScreen onBack={() => {}} />);
    const total = () => document.querySelector('[data-blondur-total]')?.textContent;
    // 0,35 mól in 10,0 L at 298 K is 0,86 atm.
    expect(total()).toBe('0,86 atm');
    const row = () => screen.getByRole('row', { name: /^N₂/ }).textContent;
    const nitrogen = row();
    fireEvent.change(screen.getByLabelText(/^Argon/), { target: { value: '0.25' } });
    expect(total()).toBe('1,34 atm');
    expect(row()).toContain('0,49 atm');
    expect(row()).not.toBe(nitrogen); // its mole fraction fell
  });

  it('plays all eight right to `8 af 8 rétt`', () => {
    startAefa();
    for (const p of BLONDUR_PROBLEMS) {
      expect(screen.getByRole('heading', { level: 4 }).textContent).toBe(p.name);
      answer(typed(Number(p.answer.toPrecision(4))));
      expect(document.getElementById('gas-blondur-feedback')?.textContent).toMatch(/^Rétt!/);
      fireEvent.click(screen.getByRole('button', { name: /Næsta dæmi|Sjá niðurstöðu/ }));
    }
    expect(screen.getByRole('heading', { level: 4 }).textContent).toBe('8 af 8 rétt');
  });

  it('names the slip and prints the answer on a wrong one', () => {
    startAefa();
    const first = BLONDUR_PROBLEMS[0];
    answer(typed(Number(first.slips[0].value.toPrecision(3))));
    const fb = document.getElementById('gas-blondur-feedback')?.textContent ?? '';
    expect(fb).toContain(`Svarið er ${shownAnswer(first)} atm`);
    expect(fb).toContain('°C');
    expect(fb).toContain('kelvinum');
  });

  it('refuses text that is not a number without spending the attempt', () => {
    startAefa();
    answer('abc');
    expect(screen.getByRole('alert').textContent).toContain('tölu í atm');
    expect(screen.getByRole('button', { name: 'Athuga' })).toBeTruthy();
  });

  it('matchSlip finds no slip for the right answer', () => {
    for (const p of BLONDUR_PROBLEMS) {
      expect(matchSlip(p.answer, p.slips)).toBeNull();
      expect(within(p.answer, p.answer)).toBe(true);
    }
  });
});
