import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

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
 * when it sits below the fold, and takes focus. jsdom lays nothing out and has no
 * `matchMedia`, so it takes the wide-screen path, and the geometry is faked.
 */

const SIGN = 'Skipta um formerki';

const innerHeight = window.innerHeight;
let scrollBy: MockInstance;
let now: MockInstance<() => number>;

beforeEach(() => {
  localStorage.clear();
  scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
  // "Næsta spurning" drops a press within 400 ms of appearing (the double-tap guard); every
  // read of the clock is half a second after the last unless a test sets it.
  let t = 0;
  now = vi.spyOn(performance, 'now').mockImplementation(() => (t += 500));
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

describe('Enter in the ΔG° field', () => {
  it('checks the answer once a verdict is picked, and not before', () => {
    drawBeginner(0);
    startPractice();
    const field = screen.getByLabelText(/ΔG° við/);
    fireEvent.change(field, { target: { value: '99999' } });
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(screen.queryByRole('alert')).toBeNull();

    fireEvent.click(screen.getByRole('radio', { name: /Jafnvægi/ }));
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(screen.getByRole('alert').textContent).toMatch(/^Rangt\./);
  });
});

describe('each screen opens at its top', () => {
  /** The page's top edge sits `scrollY` above the viewport. */
  function scrolledTo(y: number) {
    vi.spyOn(document.documentElement, 'getBoundingClientRect').mockImplementation(
      () => ({ top: -y, bottom: 0, left: 0, right: 0, width: 0, height: 0 }) as DOMRect
    );
  }

  it('leaves the page alone on load, and jumps up on a new mode and a new problem', () => {
    drawBeginner(0);
    render(<App />);
    expect(scrollBy).not.toHaveBeenCalled();

    scrolledTo(900);
    fireEvent.click(screen.getByRole('button', { name: /Æfingarhamur/ }));
    expect(scrollBy).toHaveBeenLastCalledWith({ top: -900, behavior: 'auto' });

    answer('99999', /Jafnvægi/);
    scrollBy.mockClear();
    scrolledTo(1400);
    fireEvent.click(screen.getByRole('button', { name: /Næsta spurning/ }));
    expect(scrollBy).toHaveBeenLastCalledWith({ top: -1400, behavior: 'auto' });

    scrollBy.mockClear();
    scrolledTo(300);
    fireEvent.click(screen.getByRole('button', { name: '← Til baka' }));
    expect(scrollBy).toHaveBeenLastCalledWith({ top: -300, behavior: 'auto' });
  });

  it('moves focus to the problem, the verdict, the next problem and back to the mode', async () => {
    drawBeginner(0);
    render(<App />);
    expect(document.activeElement).toBe(document.body);

    fireEvent.click(screen.getByRole('button', { name: /Æfingarhamur/ }));
    await waitFor(() =>
      expect(document.activeElement).toBe(document.querySelector('[data-item-start]'))
    );
    expect(document.activeElement!.textContent).toBe(PROBLEMS.beginner[0].name);

    answer('99999', /Jafnvægi/);
    const verdict = screen.getByRole('group', { name: /^Rangt\./ });
    await waitFor(() => expect(document.activeElement).toBe(verdict));

    fireEvent.click(screen.getByRole('button', { name: /Næsta spurning/ }));
    expect(document.activeElement).toBe(document.querySelector('[data-item-start]'));

    fireEvent.click(screen.getByRole('button', { name: '← Til baka' }));
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /Æfingarhamur/ }))
    );
  });

  it('drops a press on "Næsta spurning" that comes with the tap on "Athuga svar"', () => {
    now.mockImplementation(() => 1000);
    drawBeginner(0);
    startPractice();
    answer('99999', /Jafnvægi/);
    fireEvent.click(screen.getByRole('button', { name: /Næsta spurning/ }));
    expect(screen.getByRole('button', { name: /Næsta spurning/ })).toBeTruthy();

    now.mockImplementation(() => 1500);
    fireEvent.click(screen.getByRole('button', { name: /Næsta spurning/ }));
    expect(screen.getByRole('button', { name: 'Athuga svar' })).toBeTruthy();
  });
});

describe('the verdict is brought into view after "Athuga svar", on a wide screen', () => {
  /** Place the feedback box `top` px down a 740 px screen. */
  function feedbackAt(top: number) {
    Object.defineProperty(window, 'innerHeight', { value: 740, configurable: true });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement
    ) {
      const y = this.getAttribute('role') === 'group' ? top : 0;
      return { top: y, bottom: y + 200, left: 0, right: 0, width: 0, height: 200, x: 0, y };
    } as () => DOMRect);
  }

  it('scrolls the least that shows it when it sits below the fold', async () => {
    feedbackAt(900);
    drawBeginner(0);
    startPractice();
    answer('99999', /Jafnvægi/);

    await waitFor(() => expect(scrollBy).toHaveBeenCalledTimes(1));
    // Its bottom (1100) onto the bottom of the screen (740), as `block: 'nearest'` did.
    expect(scrollBy).toHaveBeenCalledWith({ top: 360, behavior: 'smooth' });
  });

  it('scrolls back up to it when the student is further down the page', async () => {
    feedbackAt(-160);
    drawBeginner(0);
    startPractice();
    answer('99999', /Jafnvægi/);

    await waitFor(() => expect(scrollBy).toHaveBeenCalledTimes(1));
    expect(scrollBy).toHaveBeenCalledWith({ top: -160, behavior: 'smooth' });
  });

  it('does not scroll when the verdict is already on screen', async () => {
    feedbackAt(200);
    drawBeginner(0);
    startPractice();
    answer('99999', /Jafnvægi/);

    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(scrollBy).not.toHaveBeenCalled();
    // Focus moves all the same (design P3).
    expect(document.activeElement).toBe(screen.getByRole('group', { name: /^Rangt\./ }));
  });
});
