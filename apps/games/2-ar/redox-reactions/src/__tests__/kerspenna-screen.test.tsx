import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { KerspennaScreen, answerOf } from '../components/KerspennaScreen';
import { KER_ITEMS } from '../data/kerspenna';

const startAefa = () => {
  render(<KerspennaScreen onBack={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: /Æfa: tíu spurningar/ }));
};
const typed = (n: number, digits: number) => n.toFixed(digits).replace('.', ',');
const next = () =>
  fireEvent.click(screen.getByRole('button', { name: /Næsta spurning|Sjá niðurstöðu/ }));

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
  let t = 0;
  vi.spyOn(performance, 'now').mockImplementation(() => (t += 500));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Kerspenna screen', () => {
  it('opens from the menu with its title focused', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /^Kerspenna/ }));
    expect(document.activeElement?.textContent).toBe('Kerspenna');
  });

  it('puts the katóða at the higher E° whichever half-cell comes first', () => {
    render(<KerspennaScreen onBack={() => {}} />);
    const kanna = within(screen.getByRole('region', { name: /Kannaðu/ }));
    const reading = () => kanna.getByText(/^E°ker =/).textContent;
    const before = reading();
    fireEvent.change(screen.getByLabelText('Hálfker 1'), { target: { value: 'Cu2+/Cu' } });
    fireEvent.change(screen.getByLabelText('Hálfker 2'), { target: { value: 'Zn2+/Zn' } });
    expect(reading()).toBe(before);
    expect(reading()).toContain('+1,10 V');
  });

  it('plays all ten right, typing what a student works out from two decimals', () => {
    startAefa();
    for (const item of KER_ITEMS) {
      const key = answerOf(item);
      if (typeof key === 'number') {
        fireEvent.change(screen.getByLabelText(/^Svar í/), {
          target: { value: typed(key, item.kind === 'ecell' ? 2 : 1) },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
      } else {
        fireEvent.click(screen.getByRole('button', { name: key }));
      }
      expect(screen.getByText('Rétt!')).toBeTruthy();
      next();
    }
    expect(screen.getByRole('heading', { name: '10 af 10 rétt' })).toBeTruthy();
  });

  it('names a reversed subtraction and shows the working', () => {
    startAefa();
    fireEvent.change(screen.getByLabelText(/^Svar í/), { target: { value: '−1,10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
    expect(screen.getByText(/^Ekki rétt\. Svarið er \+1,10 V/)).toBeTruthy();
    expect(screen.getByText(/Formerkið snýst við/)).toBeTruthy();
    expect(screen.getByText(/^E°ker = \+0,337 − \(−0,7618\)/)).toBeTruthy();
  });

  it('names the slip of a wrong half-reaction', () => {
    startAefa();
    for (const item of KER_ITEMS.slice(0, 8)) {
      const key = answerOf(item);
      if (typeof key === 'number') {
        fireEvent.change(screen.getByLabelText(/^Svar í/), {
          target: { value: typed(key, 2) },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
      } else {
        fireEvent.click(screen.getByRole('button', { name: key }));
      }
      next();
    }
    fireEvent.click(screen.getByRole('button', { name: 'MnO₄⁻ + 8H⁺ + 3e⁻ → Mn²⁺ + 4H₂O' }));
    expect(screen.getByText(/hleðslan ekki/)).toBeTruthy();
  });
});
