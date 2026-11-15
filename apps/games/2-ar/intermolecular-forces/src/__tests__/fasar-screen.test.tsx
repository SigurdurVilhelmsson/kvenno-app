import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { FasarScreen, answerOf } from '../components/FasarScreen';
import { FASAR_ITEMS } from '../data/fasar';

const startAefa = () => {
  render(<FasarScreen onBack={() => {}} />);
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

describe('Fasabreytingar og fasarit screen', () => {
  it('opens from the menu with its title focused', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Fasabreytingar og fasarit/ }));
    expect(document.activeElement?.textContent).toBe('Fasabreytingar og fasarit');
  });

  it('holds the temperature at 0 °C while the ice melts', () => {
    render(<FasarScreen onBack={() => {}} />);
    const slider = screen.getByLabelText(/Varmi bætt við/);
    fireEvent.change(slider, { target: { value: '20' } });
    expect(screen.getByText(/Hitastig:/).textContent).toMatch(/0 °C.*bráðnar/);
    fireEvent.change(slider, { target: { value: '30' } });
    expect(screen.getByText(/Hitastig:/).textContent).toMatch(/0 °C.*bráðnar/);
  });

  it('plays all ten right and ends with the count', () => {
    startAefa();
    for (const item of FASAR_ITEMS) {
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
    fireEvent.change(screen.getByLabelText(/^Svar í/), { target: { value: '65,7' } });
    fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
    expect(screen.getByText(/^Ekki rétt\. Svarið er 415 kJ/)).toBeTruthy();
    expect(screen.getByText(/aðeins hitunina/)).toBeTruthy();
    expect(screen.getByText(/Heimild: kafli 10, „Fasabreytingar“/)).toBeTruthy();
  });

  it('shows the slip of a wrong option', () => {
    startAefa();
    fireEvent.change(screen.getByLabelText(/^Svar í/), { target: { value: '415' } });
    fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
    next();
    fireEvent.click(screen.getByRole('button', { name: 'Hann eykur hreyfiorku sameindanna' }));
    expect(screen.getByText(/Meðalhreyfiorka sameindanna/)).toBeTruthy();
  });
});
