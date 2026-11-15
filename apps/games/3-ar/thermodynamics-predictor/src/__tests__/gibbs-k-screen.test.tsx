import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { answerOf } from '../components/GibbsKScreen';
import { GIBBS_K_PROBLEMS } from '../data/gibbs-k';

/** "ΔG° og K", played through the menu as a student would. */

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
  // Næsta drops a press within 400 ms of appearing; every read of the clock is later.
  let t = 0;
  vi.spyOn(performance, 'now').mockImplementation(() => (t += 500));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function open() {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /ΔG° og K/ }));
  return screen.getByRole('heading', { name: 'ΔG° og jafnvægisfastinn K' });
}

/** Open the screen and go on to Æfa, with the first problem's name focused. */
async function practise() {
  open();
  fireEvent.click(screen.getByRole('button', { name: /Æfa: sjö dæmi/ }));
  const first = screen.getByRole('heading', { name: GIBBS_K_PROBLEMS[0].name });
  await waitFor(() => expect(document.activeElement).toBe(first));
}

/** Type `value` as the answer to the problem on screen: K in two fields, ΔG° in one. */
function type(value: number) {
  const k = screen.queryByLabelText('Tala');
  if (k) {
    const exponent = Math.floor(Math.log10(value));
    fireEvent.change(k, {
      target: { value: (value / 10 ** exponent).toFixed(3).replace('.', ',') },
    });
    fireEvent.change(screen.getByLabelText('Veldisvísir'), { target: { value: String(exponent) } });
  } else {
    fireEvent.change(screen.getByLabelText('ΔG° í kJ/mól'), {
      target: { value: value.toFixed(2).replace('.', ',') },
    });
  }
  fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
}

describe('ΔG° og K', () => {
  it('opens from the menu with its heading focused', async () => {
    const heading = open();
    await waitFor(() => expect(document.activeElement).toBe(heading));
  });

  it('moves K with the slider: 1 at 0, and on the right side of 1 either way', () => {
    open();
    const slider = screen.getByLabelText(/^ΔG° = /);
    const k = () => document.querySelector('[data-gibbsk-k]')!.textContent;
    fireEvent.change(slider, { target: { value: '0' } });
    expect(k()).toBe('K = 1,0');
    expect(screen.getByText(/K = 1: svipað magn/)).toBeTruthy();
    fireEvent.change(slider, { target: { value: '-60' } });
    expect(k()).toMatch(/× 10¹⁰$/);
    fireEvent.change(slider, { target: { value: '6' } });
    expect(k()).toBe('K = 0,089');
    expect(screen.getByText(/K < 1: meira af hvarfefnum/)).toBeTruthy();
  });

  it('plays all seven right to "7 af 7 rétt", focusing each verdict', async () => {
    await practise();
    for (const p of GIBBS_K_PROBLEMS) {
      expect(screen.getByRole('heading', { name: p.name })).toBeTruthy();
      type(answerOf(p));
      const verdict = screen.getByRole('group', { name: 'Rétt!' });
      await waitFor(() => expect(document.activeElement).toBe(verdict));
      fireEvent.click(screen.getByRole('button', { name: /Næsta dæmi|Sjá niðurstöðu/ }));
    }
    expect(screen.getByRole('heading', { name: '7 af 7 rétt' })).toBeTruthy();
    // Back to the explanation and on again keeps the result where it was.
    fireEvent.click(screen.getByRole('button', { name: 'Skýring og sleði' }));
    expect(screen.getByLabelText(/^ΔG° = /)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Æfa: sjö dæmi/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Byrja aftur' }));
    expect(screen.getByRole('heading', { name: GIBBS_K_PROBLEMS[0].name })).toBeTruthy();
  });

  it('names the slip and shows the working when an answer is wrong', async () => {
    await practise();
    const first = GIBBS_K_PROBLEMS[0];
    type(1 / answerOf(first));
    const verdict = screen.getByRole('group', { name: 'Ekki rétt.' });
    expect(within(verdict).getByText(/Formerkið snerist við/)).toBeTruthy();
    expect(within(verdict).getByText(/0,32/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Næsta dæmi/ }));
    // A wrong answer is not counted.
    for (const p of GIBBS_K_PROBLEMS.slice(1)) {
      type(answerOf(p));
      fireEvent.click(screen.getByRole('button', { name: /Næsta dæmi|Sjá niðurstöðu/ }));
    }
    expect(screen.getByRole('heading', { name: '6 af 7 rétt' })).toBeTruthy();
  });

  it('asks again, without grading, for an empty or unreadable answer', async () => {
    await practise();
    fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
    expect(screen.getByRole('alert').textContent).toMatch(/báða reitina/);
    expect(screen.queryByRole('group', { name: /rétt/ })).toBeNull();
  });

  it('reads joules for kilojoules as its own mistake on a ΔG° problem', async () => {
    await practise();
    for (const p of GIBBS_K_PROBLEMS) {
      if (p.kind === 'G-fra-K') {
        type(answerOf(p) * 1000);
        expect(screen.getByText(/ekki breytt í J\/mól/)).toBeTruthy();
        return;
      }
      type(answerOf(p));
      fireEvent.click(screen.getByRole('button', { name: /Næsta dæmi/ }));
    }
  });
});
