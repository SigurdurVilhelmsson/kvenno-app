import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { GildiScreen, answerOf, isAnswer } from '../components/GildiScreen';
import { GILDI_ITEMS, type GildiItem } from '../data/gildi';
import { sidesLabel, type Sides } from '../engine/gildi';

const startAefa = () => {
  render(<GildiScreen onBack={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: /Æfa: tíu spurningar/ }));
};

/** The button for an option, by what a student reads or hears. */
const optionButton = (item: GildiItem, value: number | Sides | string) =>
  item.kind === 'lewis'
    ? screen
        .getByRole('img', { name: `${item.symbol}, ${sidesLabel(value as Sides)}` })
        .closest('button')!
    : screen.getByRole('button', { name: String(value) });

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

describe('Gildisrafeindir og jónir screen', () => {
  it('opens from the menu with its title focused', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Gildisrafeindir og jónir/ }));
    expect(document.activeElement?.textContent).toBe('Gildisrafeindir og jónir');
  });

  it('shows the picked element’s symbol, valence and ion', () => {
    render(<GildiScreen onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Súrefni' }));
    expect(screen.getByRole('img', { name: 'O, 6 punktar: tvö pör og tveir stakir' })).toBeTruthy();
    expect(screen.getByText('O²⁻:')).toBeTruthy();
  });

  it('plays all ten right and ends with the count', () => {
    startAefa();
    for (const item of GILDI_ITEMS) {
      fireEvent.click(optionButton(item, answerOf(item)));
      expect(screen.getByText('Rétt!')).toBeTruthy();
      next();
    }
    expect(screen.getByRole('heading', { name: '10 af 10 rétt' })).toBeTruthy();
  });

  it('names the slip of every wrong option', () => {
    for (const [i, item] of GILDI_ITEMS.entries()) {
      for (const wrong of item.options.filter((o) => !isAnswer(item, o.value))) {
        startAefa();
        for (const earlier of GILDI_ITEMS.slice(0, i)) {
          fireEvent.click(optionButton(earlier, answerOf(earlier)));
          next();
        }
        fireEvent.click(optionButton(item, wrong.value));
        expect(screen.getByText(/^Ekki rétt\. Svarið er/)).toBeTruthy();
        expect(screen.getByText(wrong.slip!)).toBeTruthy();
        cleanup();
      }
    }
  });

  it('takes one answer per question', () => {
    startAefa();
    const item = GILDI_ITEMS[0];
    const wrong = item.options.find((o) => !isAnswer(item, o.value))!;
    fireEvent.click(optionButton(item, wrong.value));
    fireEvent.click(optionButton(item, answerOf(item)));
    expect(screen.queryByText('Rétt!')).toBeNull();
  });
});
