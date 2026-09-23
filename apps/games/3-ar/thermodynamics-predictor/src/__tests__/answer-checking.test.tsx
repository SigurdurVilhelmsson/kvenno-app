import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { answer, openProblem, setTemperature, VERDICT } from './play-helpers';
import App from '../App';
import { calculateDeltaG } from '../utils/thermo-calculations';

/**
 * Checking an answer, and what the screen says about it afterwards.
 *
 * **Why this exists.** Each of these was wrong at 2026-09-23 and each was found by playing:
 * - a half-right answer was boxed in green, because the box looked for "Rétt" and the
 *   half-right messages say "Rétt svar: …";
 * - "Spurning N" was the stored count of *correct* answers plus one, so it stood still on a
 *   wrong answer and did not start at 1 on a return visit;
 * - after one timed-out Keppnishamur run the clock stayed at 0 and the time-out, which did
 *   not check the mode, marked every Æfingarhamur problem "Tíminn rann út!" before it could
 *   be answered; a second run also inherited the first run's remaining seconds;
 * - the ΔG° grader's flat ±3 kJ/mol accepted `0` for a ΔG° of −2,9;
 * - the worked solution called |ΔG°| = 1 equilibrium while the grader did not;
 * - Könnun called ΔG = 0 "Ekki sjálfgengt — ΔG > 0".
 */

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  Element.prototype.scrollIntoView = () => {};
  // jsdom has no canvas; the graph and the particle panels cope with a missing context.
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const box = () => screen.getByRole('alert');
const questionNumber = () =>
  screen.getByText('Spurning').parentElement!.querySelector('.text-xl')!.textContent;

describe('the feedback box is green only for a right answer', () => {
  // Id 3, 2H₂O₂ → 2H₂O + O₂, is spontaneous at every temperature.
  it('right verdict, wrong ΔG°: red', () => {
    openProblem(3);
    answer('12345', VERDICT.spontaneous);
    expect(box().textContent).toMatch(/^Sjálfgengi er rétt en ΔG er rangt/);
    expect(box().className).toContain('border-red-500');
    expect(box().className).not.toContain('border-green-500');
  });

  it('right ΔG°, wrong verdict: red', () => {
    openProblem(3);
    answer('-233,5', VERDICT['non-spontaneous']);
    expect(box().textContent).toMatch(/^ΔG er rétt en sjálfgengi er rangt/);
    expect(box().className).toContain('border-red-500');
  });

  it('both right: green', () => {
    openProblem(3);
    answer('-233,5', VERDICT.spontaneous);
    expect(box().textContent).toMatch(/^Rétt!/);
    expect(box().className).toContain('border-green-500');
  });
});

describe('"Spurning N" counts the questions of this run', () => {
  it('rises on a wrong answer too', () => {
    openProblem(3);
    expect(questionNumber()).toBe('1');
    answer('12345', VERDICT.equilibrium);
    fireEvent.click(screen.getByRole('button', { name: /Næsta spurning/ }));
    expect(questionNumber()).toBe('2');
  });

  it('starts at 1 whatever was stored from earlier visits, and again on a new run', () => {
    localStorage.setItem(
      'thermodynamics-predictor-progress',
      JSON.stringify({ score: 700, highScore: 700, bestStreak: 4, problemsCompleted: 7 })
    );
    openProblem(3);
    expect(questionNumber()).toBe('1');
    answer('-233,5', VERDICT.spontaneous);
    fireEvent.click(screen.getByRole('button', { name: /Næsta spurning/ }));
    expect(questionNumber()).toBe('2');

    fireEvent.click(screen.getByRole('button', { name: '← Til baka' }));
    fireEvent.click(screen.getByRole('button', { name: /Keppnishamur/ }));
    expect(questionNumber()).toBe('1');
  });
});

describe('the Keppnishamur clock', () => {
  function tick(seconds: number) {
    for (let i = 0; i < seconds; i++) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }
  }
  const clock = () =>
    screen.getByText('Tími').parentElement!.querySelector('.text-xl')!.textContent;

  it('a timed-out run does not time out Æfingarhamur', () => {
    vi.useFakeTimers();
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Keppnishamur/ }));
    tick(91);
    expect(box().textContent).toMatch(/^Tíminn rann út!/);

    fireEvent.click(screen.getByRole('button', { name: '← Til baka' }));
    tick(1);
    fireEvent.click(screen.getByRole('button', { name: /Æfingarhamur/ }));
    tick(3);
    expect(screen.queryByText('Tíminn rann út!')).toBeNull();
    expect(screen.getByRole('button', { name: 'Athuga svar' })).toBeTruthy();
  });

  it('a new run starts with the full 90 seconds', () => {
    vi.useFakeTimers();
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Keppnishamur/ }));
    tick(30);
    expect(clock()).toBe('60s');

    fireEvent.click(screen.getByRole('button', { name: '← Til baka' }));
    tick(1);
    fireEvent.click(screen.getByRole('button', { name: /Keppnishamur/ }));
    expect(clock()).toBe('90s');
  });
});

describe('the ΔG° grader', () => {
  // Id 15, diamond → graphite: ΔG° = −1,9 − 298 × 0,0033 = −2,88 kJ/mol at 298 K.
  it('does not accept 0, half or double for a small ΔG°', () => {
    for (const guess of ['0', '-1,44', '-5,77']) {
      openProblem(15);
      answer(guess, VERDICT.spontaneous);
      expect(box().textContent, guess).toMatch(/^Sjálfgengi er rétt en ΔG er rangt/);
      cleanup();
    }
  });

  it('accepts the answer itself, to one decimal or a whole number', () => {
    for (const guess of ['-2,9', '-3', '-2,88']) {
      openProblem(15);
      answer(guess, VERDICT.spontaneous);
      expect(box().textContent, guess).toMatch(/^Rétt!/);
      cleanup();
    }
  });
});

describe('the worked solution states the grader’s verdict', () => {
  // Id 26, protein unfolding: ΔG° = 250 − 332 × 0,75 = 1 kJ/mol exactly at 332 K.
  it('at |ΔG°| = 1 both say "Ekki sjálfgengt"', () => {
    openProblem(26);
    setTemperature(332);
    expect(calculateDeltaG(250, 750, 332)).toBe(1);
    answer('1', VERDICT.equilibrium);
    expect(box().textContent).toMatch(/Rétt svar: Ekki sjálfgengt/);
    expect(screen.getByText(/→ EKKI SJÁLFGENGT/)).toBeTruthy();
    expect(screen.queryByText(/→ JAFNVÆGI/)).toBeNull();
  });
});

describe('Könnun', () => {
  const verdict = () => screen.getByText(/ΔG° = ΔH° − TΔS°/).parentElement!.textContent;

  it('calls ΔG = 0 equilibrium, not "ΔG > 0"', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Könnun/ }));
    fireEvent.change(screen.getByLabelText(/Hitastig:/), { target: { value: '500' } });
    expect(verdict()).toContain('Jafnvægi');
    expect(verdict()).not.toContain('ΔG > 0');
  });

  it('still calls either side of it spontaneous and not', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Könnun/ }));
    fireEvent.change(screen.getByLabelText(/Hitastig:/), { target: { value: '300' } });
    expect(verdict()).toContain('Sjálfgengt — ΔG < 0');
    fireEvent.change(screen.getByLabelText(/Hitastig:/), { target: { value: '900' } });
    expect(verdict()).toContain('Ekki sjálfgengt — ΔG > 0');
  });
});
