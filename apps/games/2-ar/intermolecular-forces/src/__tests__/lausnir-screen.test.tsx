import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { LausnirScreen, answerOf } from '../components/LausnirScreen';
import { LAUSNIR_ITEMS } from '../data/lausnir';

const startAefa = () => {
  render(<LausnirScreen onBack={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: /Æfa: tíu spurningar/ }));
};
const typed = (n: number) => Number(n.toPrecision(3)).toString().replace('.', ',');
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

describe('Samþynningareiginleikar screen', () => {
  it('opens from the menu with its title focused', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Samþynningareiginleikar/ }));
    expect(document.activeElement?.textContent).toBe('Samþynningareiginleikar');
  });

  it('moves the freezing point twice as far for NaCl as for sucrose', () => {
    render(<LausnirScreen onBack={() => {}} />);
    const reading = () => screen.getByText(/^Agnir í hverju kg/).textContent ?? '';
    expect(reading()).toMatch(/frostmark [−-]1,86 °C/);
    fireEvent.click(screen.getByRole('button', { name: 'NaCl' }));
    expect(reading()).toMatch(/frostmark [−-]3,72 °C/);
  });

  it('plays all ten right and ends with the count', () => {
    startAefa();
    for (const item of LAUSNIR_ITEMS) {
      const key = answerOf(item);
      if (typeof key === 'number') {
        fireEvent.change(screen.getByLabelText(/^Svar í/), { target: { value: typed(key) } });
        fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
      } else {
        fireEvent.click(screen.getByRole('button', { name: key }));
      }
      expect(screen.getByText('Rétt!')).toBeTruthy();
      next();
    }
    expect(screen.getByRole('heading', { name: '10 af 10 rétt' })).toBeTruthy();
  });

  it('names a slip and shows the working', () => {
    startAefa();
    fireEvent.change(screen.getByLabelText(/^Svar í/), { target: { value: '0,036' } });
    fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
    expect(screen.getByText(/^Ekki rétt\. Svarið er 0,142 atm/)).toBeTruthy();
    expect(screen.getByText(/lækkun gufunarþrýstingsins/)).toBeTruthy();
    expect(screen.getByText(/Heimild: kafli 11, „Samþynningareiginleikar“/)).toBeTruthy();
  });
});
