import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { VarmiScreen } from '../components/VarmiScreen';
import { VARMI_PROBLEMS } from '../data/varmi';

const startAefa = () => {
  render(<VarmiScreen onBack={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: /Æfa: tíu dæmi/ }));
};
const answer = (value: string) => {
  fireEvent.change(screen.getByLabelText(/^Svar í/), { target: { value } });
  fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
};
const typed = (n: number) => String(n).replace('.', ',');

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
  let t = 0;
  vi.spyOn(performance, 'now').mockImplementation(() => (t += 500));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Varmamælingar og tengjaorka screen', () => {
  it('opens from the menu with its title focused', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Varmamælingar og tengjaorka/ }));
    expect(document.activeElement?.textContent).toBe('Varmamælingar og tengjaorka');
  });

  it('moves the final temperature with the metal', () => {
    render(<VarmiScreen onBack={() => {}} />);
    const reading = () => screen.getByText(/Lokahitastig:/).textContent;
    const al = reading();
    fireEvent.click(screen.getByRole('button', { name: 'Blý' }));
    expect(screen.getByRole('button', { name: 'Blý' }).getAttribute('aria-pressed')).toBe('true');
    expect(reading()).not.toBe(al);
  });

  it('plays all ten right and ends with the count', () => {
    startAefa();
    for (const p of VARMI_PROBLEMS) {
      answer(typed(p.answer));
      expect(screen.getByText('Rétt!')).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: /Næsta dæmi|Sjá niðurstöðu/ }));
    }
    expect(screen.getByRole('heading', { name: '10 af 10 rétt' })).toBeTruthy();
  });

  it('names the slip of a wrong sign and shows the worked solution', () => {
    startAefa();
    for (let i = 0; i < 4; i++) {
      answer(typed(VARMI_PROBLEMS[i].answer));
      fireEvent.click(screen.getByRole('button', { name: /Næsta dæmi/ }));
    }
    const p = VARMI_PROBLEMS[4];
    answer(typed(-p.answer));
    expect(
      screen.getByText(new RegExp(`Ekki rétt. Svarið er ${p.answerText.replace('+', '\\+')}`))
    ).toBeTruthy();
    expect(screen.getByText(/Formerkið snýst við/)).toBeTruthy();
  });

  it('takes a leading plus sign', () => {
    startAefa();
    for (let i = 0; i < 5; i++) {
      answer(typed(VARMI_PROBLEMS[i].answer));
      fireEvent.click(screen.getByRole('button', { name: /Næsta dæmi/ }));
    }
    answer('+1,33');
    expect(screen.getByText('Rétt!')).toBeTruthy();
  });
});
