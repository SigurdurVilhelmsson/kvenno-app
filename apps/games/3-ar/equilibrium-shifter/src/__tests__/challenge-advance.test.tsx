import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { equilibria } from '../data/equilibria';
import { calculateShift } from '../utils/le-chatelier';

/**
 * Keppnishamur moves on by itself six seconds after an answer (three after
 * the clock runs out), and «Næsta strax →» moves on at once. The automatic
 * advance used to be a bare setTimeout that nothing cancelled, so:
 *
 * - tapping «Næsta strax →» opened question 2, and six seconds later the game
 *   jumped to question 3 with question 2 unanswered — rounds ended with 7–9 of
 *   10 answered;
 * - leaving for the menu did not stop it either, so it later fired into
 *   whatever the student had opened since, Lærdómshamur included;
 * - it ran the handler from the render that scheduled it, which still held the
 *   score from before the answer, so a round ended by the timer saved one
 *   correct answer too few.
 *
 * Also held here: the «+N stig!» a correct answer shows is the number added to
 * the score (it used to count the streak the answer had just extended, five
 * more than was added), and the countdown text names the delay that applies.
 */

const STORAGE_KEY = 'kvenno-chemistry-equilibrium-shifter';

/** Keppnishamur opens after five completed problems. */
function seedUnlocked(problemsCompleted = 5) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      currentLevel: 0,
      problemsCompleted,
      lastPlayedDate: '2026-01-01T00:00:00.000Z',
      totalTimeSpent: 0,
      levelProgress: {},
    })
  );
}

function savedProblemsCompleted(): number {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}').problemsCompleted;
}

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

const questionLabel = () => screen.getByText(/Spurning \d+ \/ 10/).textContent;

function openChallenge() {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /Keppnishamur/ }));
  advance(300);
}

/** The button for the right answer to what is on screen, given Math.random() = 0. */
function correctButtonName(): RegExp {
  const direction = calculateShift(equilibria[0], equilibria[0].possibleStresses[0]).direction;
  return direction === 'left'
    ? /Til vinstri/
    : direction === 'right'
      ? /Til hægri/
      : /Engin hliðrun/;
}

describe('Keppnishamur moves on once per question', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    // jsdom implements neither scrollIntoView nor scrollTo, nor a canvas.
    Element.prototype.scrollIntoView = vi.fn();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('«Næsta strax →» cancels the automatic advance', () => {
    seedUnlocked();
    openChallenge();
    expect(questionLabel()).toBe('Spurning 1 / 10');

    fireEvent.click(screen.getByRole('button', { name: /Engin hliðrun/ }));
    fireEvent.click(screen.getByRole('button', { name: /Næsta strax/ }));
    expect(questionLabel()).toBe('Spurning 2 / 10');

    // Longer than the six seconds the answer scheduled, shorter than the
    // twenty the new question allows.
    advance(7000);
    expect(questionLabel()).toBe('Spurning 2 / 10');
    expect(screen.getByRole('button', { name: /Engin hliðrun/ })).toBeTruthy();
  });

  it('leaving for the menu cancels the automatic advance', () => {
    seedUnlocked();
    openChallenge();
    fireEvent.click(screen.getByRole('button', { name: /Engin hliðrun/ }));
    fireEvent.click(screen.getByRole('button', { name: /Til baka/ }));
    advance(300);

    fireEvent.click(screen.getByRole('button', { name: /Lærdómshamur/ }));
    advance(300);
    expect(screen.getByText('Veldu álag sem þú vilt beita:')).toBeTruthy();

    // The challenge answer's six seconds run out while the student is in
    // Lærdómshamur. Nothing may happen to the question they are on.
    advance(7000);
    expect(screen.getByText('Veldu álag sem þú vilt beita:')).toBeTruthy();
    expect(screen.queryByText('Álag sem beitt er:')).toBeNull();
  });

  it('a round asks ten questions, and saves and shows the points it added', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    seedUnlocked(5);
    openChallenge();

    const shown: number[] = [];
    for (let n = 1; n <= 10; n++) {
      expect(questionLabel()).toBe(`Spurning ${n} / 10`);
      fireEvent.click(screen.getByRole('button', { name: correctButtonName() }));
      const earned = screen.getByText(/^\+\d+ stig!$/).textContent ?? '';
      shown.push(Number(earned.replace(/\D/g, '')));
      // The last question is left to the automatic advance.
      if (n < 10) fireEvent.click(screen.getByRole('button', { name: /Næsta strax/ }));
    }
    advance(6000);
    advance(300);

    expect(screen.getByText('🏆 Niðurstöður')).toBeTruthy();
    expect(screen.getByText('10 / 10')).toBeTruthy();
    // Every correct answer is saved, the last one included.
    expect(savedProblemsCompleted()).toBe(15);
    // The total is the sum of what each answer said it earned.
    const total = shown.reduce((a, b) => a + b, 0);
    expect(screen.getByText('Heildarstig').previousElementSibling?.textContent).toBe(String(total));

    // Nothing left over fires on the results screen.
    advance(20000);
    expect(screen.getByText('🏆 Niðurstöður')).toBeTruthy();
    expect(savedProblemsCompleted()).toBe(15);
  });

  it('«+N stig!» is the number added to the score', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    seedUnlocked();
    openChallenge();
    expect(screen.getByText('Stig: 0')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: correctButtonName() }));
    const earned = (screen.getByText(/^\+\d+ stig!$/).textContent ?? '').replace(/\D/g, '');
    expect(screen.getByText(`Stig: ${earned}`)).toBeTruthy();
  });

  it('after the clock runs out it says three seconds, and means it', () => {
    seedUnlocked();
    openChallenge();
    for (let s = 0; s < 21; s++) advance(1000);

    expect(screen.getByText('❌ Rangt')).toBeTruthy();
    expect(screen.getByText(/Næsta spurning birtist sjálfkrafa \(3 sek\)/)).toBeTruthy();
    advance(3100);
    expect(questionLabel()).toBe('Spurning 2 / 10');
  });

  it('after an answer it says six seconds', () => {
    seedUnlocked();
    openChallenge();
    fireEvent.click(screen.getByRole('button', { name: /Engin hliðrun/ }));
    expect(screen.getByText(/Næsta spurning birtist sjálfkrafa \(6 sek\)/)).toBeTruthy();
    advance(5900);
    expect(questionLabel()).toBe('Spurning 1 / 10');
    advance(200);
    expect(questionLabel()).toBe('Spurning 2 / 10');
  });
});
