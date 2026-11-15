import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { HeildunScreen, answerOf } from '../components/HeildunScreen';
import { HEILDUN_ITEMS } from '../data/heildun';

const startAefa = () => {
  render(<HeildunScreen onBack={() => {}} />);
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

describe('Heildað hraðalögmál og Arrhenius screen', () => {
  it('opens from the menu with its title focused', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Heildað hraðalögmál og Arrhenius/ }));
    expect(document.activeElement?.textContent).toBe('Heildað hraðalögmál og Arrhenius');
  });

  it('keeps the first-order half-life fixed as [A]₀ moves, and no other', () => {
    render(<HeildunScreen onBack={() => {}} />);
    const reading = () => screen.getByText(/^k = /).textContent;
    const slider = screen.getByLabelText(/Upphafsstyrkur/);
    const first = reading();
    fireEvent.change(slider, { target: { value: '2' } });
    expect(reading()).toBe(first);
    fireEvent.click(screen.getByRole('button', { name: 'Annars stigs' }));
    const second = reading();
    fireEvent.change(slider, { target: { value: '0.5' } });
    expect(reading()).not.toBe(second);
  });

  it('plays all ten right and ends with the count', () => {
    startAefa();
    for (const item of HEILDUN_ITEMS) {
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
    fireEvent.change(screen.getByLabelText(/^Svar í/), { target: { value: '24,3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
    expect(screen.getByText(/^Ekki rétt\. Svarið er 175 s/)).toBeTruthy();
    expect(screen.getByText(/Eftir eru 20 %/)).toBeTruthy();
    expect(screen.getByText(/Heimild: kafli 12, „Heilduð hraðalögmál“/)).toBeTruthy();
  });
});
