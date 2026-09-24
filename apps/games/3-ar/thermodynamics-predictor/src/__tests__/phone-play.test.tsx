import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { PROBLEMS } from '../data';
import { toggleSign } from '../utils/sign';
import { calculateDeltaG } from '../utils/thermo-calculations';

/**
 * What it takes to play this game on a phone, beyond layout.
 *
 * **The sign button.** The ΔG° field raises the decimal keypad, and on an iPhone that keypad
 * has no minus key, while most ΔG° answers here are negative. The `±` button beside the field
 * (touch screens only) flips the sign, so a negative answer can be typed by touch.
 *
 * **Where the screen lands.** The menu and the solution are long on a phone. A new mode and a
 * new problem open at the top, and once an answer is checked the verdict is brought into view
 * when it sits below the fold. jsdom lays nothing out, so the geometry is faked.
 */

const SIGN = 'Skipta um formerki';

const scrollTo = vi.fn();
const scrollIntoView = vi.fn();
const innerHeight = window.innerHeight;

beforeEach(() => {
  localStorage.clear();
  scrollTo.mockClear();
  scrollIntoView.mockClear();
  vi.spyOn(window, 'scrollTo').mockImplementation(scrollTo as unknown as typeof window.scrollTo);
  Element.prototype.scrollIntoView = scrollIntoView;
  // jsdom has no canvas; the graph and the particle panels cope with a missing context.
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  Object.defineProperty(window, 'innerHeight', { value: innerHeight, configurable: true });
});

/** Make `startNewProblem` draw beginner problem `index`. */
function drawBeginner(index: number) {
  vi.spyOn(Math, 'random').mockReturnValue((index + 0.5) / PROBLEMS.beginner.length);
}

/** ΔG° of a problem at its default temperature. */
const deltaGOf = (p: (typeof PROBLEMS.beginner)[number]) =>
  calculateDeltaG(p.deltaH, p.deltaS, p.defaultTemp);

function startPractice() {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /Æfingarhamur/ }));
}

function answer(value: string, verdict: RegExp) {
  fireEvent.change(screen.getByLabelText(/ΔG° við/), { target: { value } });
  fireEvent.click(screen.getByRole('radio', { name: verdict }));
  fireEvent.click(screen.getByRole('button', { name: 'Athuga svar' }));
}

describe('toggleSign', () => {
  it('flips the sign of a typed number both ways', () => {
    expect(toggleSign('33,5')).toBe('-33,5');
    expect(toggleSign('-33,5')).toBe('33,5');
    expect(toggleSign(' 12 ')).toBe('-12');
  });

  it('reads a typographic minus as a minus', () => {
    expect(toggleSign('−8,9')).toBe('8,9');
  });

  it('starts a negative number from an empty field', () => {
    expect(toggleSign('')).toBe('-');
    expect(toggleSign(toggleSign(''))).toBe('');
  });
});

describe('a negative ΔG° can be entered without a minus key', () => {
  const index = PROBLEMS.beginner.findIndex((p) => deltaGOf(p) < -1);
  const problem = PROBLEMS.beginner[index];
  const digits = Math.abs(deltaGOf(problem)).toFixed(1).replace('.', ',');

  it('has a beginner problem with a negative ΔG°, or this proves nothing', () => {
    expect(index).toBeGreaterThanOrEqual(0);
  });

  it('digits, then the sign button, is marked right', () => {
    drawBeginner(index);
    startPractice();
    expect(screen.getByRole('heading', { name: problem.name })).toBeTruthy();

    const field = screen.getByLabelText(/ΔG° við/) as HTMLInputElement;
    // Only what the decimal keypad allows: digits and a comma.
    fireEvent.change(field, { target: { value: digits } });
    fireEvent.click(screen.getByRole('button', { name: SIGN }));
    expect(field.value).toBe(`-${digits}`);

    fireEvent.click(screen.getByRole('radio', { name: /^✓ Sjálfgengt/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Athuga svar' }));
    expect(screen.getByRole('alert').textContent).toMatch(/^Rétt!/);
  });

  it('the same digits without the sign are marked wrong', () => {
    drawBeginner(index);
    startPractice();
    answer(digits, /^✓ Sjálfgengt/);
    expect(screen.getByRole('alert').textContent).not.toMatch(/^Rétt!/);
  });

  it('shows the sign button on touch screens only', () => {
    startPractice();
    const button = screen.getByRole('button', { name: SIGN });
    expect(button.className).toMatch(/(^|\s)hidden(\s|$)/);
    expect(button.className).toContain('pointer-coarse:inline-flex');
  });
});

describe('each screen opens at its top', () => {
  it('leaves the page alone on load, and scrolls up on a new mode and a new problem', () => {
    drawBeginner(0);
    render(<App />);
    expect(scrollTo).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /Æfingarhamur/ }));
    expect(scrollTo).toHaveBeenCalledWith(0, 0);

    answer('99999', /Jafnvægi/);
    scrollTo.mockClear();
    fireEvent.click(screen.getByRole('button', { name: /Næsta spurning/ }));
    expect(scrollTo).toHaveBeenCalledWith(0, 0);

    scrollTo.mockClear();
    fireEvent.click(screen.getByRole('button', { name: '← Til baka' }));
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });
});

describe('the verdict is brought into view after "Athuga svar"', () => {
  /** Place the feedback box `top` px down a 740 px phone screen. */
  function feedbackAt(top: number) {
    Object.defineProperty(window, 'innerHeight', { value: 740, configurable: true });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement
    ) {
      const y = this.getAttribute('role') === 'alert' ? top : 0;
      return { top: y, bottom: y + 200, left: 0, right: 0, width: 0, height: 200, x: 0, y };
    } as () => DOMRect);
  }

  it('scrolls the feedback into view when it sits below the fold', async () => {
    feedbackAt(900);
    drawBeginner(0);
    startPractice();
    answer('99999', /Jafnvægi/);

    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(1));
    expect(scrollIntoView.mock.contexts[0]).toBe(screen.getByRole('alert'));
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', behavior: 'smooth' });
  });

  it('scrolls back up to it when the student is further down the page', async () => {
    feedbackAt(-160);
    drawBeginner(0);
    startPractice();
    answer('99999', /Jafnvægi/);

    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(1));
    expect(scrollIntoView.mock.contexts[0]).toBe(screen.getByRole('alert'));
  });

  it('does not scroll when the verdict is already on screen', async () => {
    feedbackAt(200);
    drawBeginner(0);
    startPractice();
    answer('99999', /Jafnvægi/);

    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
