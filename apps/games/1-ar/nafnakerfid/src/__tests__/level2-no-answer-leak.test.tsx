import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { Level2, supportLadder } from '../components/Level2';

/**
 * B14: Level 2 printed the finished name twice before asking for it — once at
 * the end of Step 2's worked breakdown, and again in a box labelled "Mundu:"
 * directly above the input. All twelve items, ten points each. It was a typing
 * exercise.
 *
 * The name may only appear once the student has committed an answer.
 */

const t = (_key: string, fallback?: string) => fallback ?? '';

/** Every compound name the twelve items grade against. */
const CORRECT_NAMES = [
  'Kalíumbrómíð',
  'Kalsíumoxíð',
  'Járn(III)klóríð',
  'Kopar(I)oxíð',
  'Natríumsúlfat',
  'Kalíumnítrat',
  'Koldíoxíð',
  'Díniturtetroxíð',
  'Brennisteinshexaflúoríð',
  'Kalsíumnítrat',
  'Blý(IV)oxíð',
  'Fosfórpentaklóríð',
];

function renderLevel() {
  return render(<Level2 t={t} onComplete={() => {}} onBack={() => {}} />);
}

/** Step 1 advances on a 1.5s timer, so the run needs fake ones. */
function pickTypeAndAdvance() {
  const typeButtons = screen
    .getAllByRole('button')
    .filter((b) => b.className.includes('rounded-xl border-2'));
  fireEvent.click(typeButtons[0]);
  act(() => {
    vi.advanceTimersByTime(1600);
  });
}

/** Text of everything on screen, with the formula heading included. */
function screenText(): string {
  return document.body.textContent ?? '';
}

describe('Nafnakerfið Level 2 does not print the name it asks for', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('never shows the answer before the student has typed one', () => {
    renderLevel();

    for (const name of CORRECT_NAMES) {
      // Step 1: pick a type.
      expect(screenText()).not.toContain(name);
      pickTypeAndAdvance();

      // Step 2: the worked breakdown.
      expect(
        screenText(),
        `"${name}" was on screen during Step 2, before the student answered`
      ).not.toContain(name);
      fireEvent.click(screen.getByRole('button', { name: /skrifa nafnið/ }));

      // Step 3: the input. This is where "Mundu:" used to print it.
      const input = screen.getByRole('textbox');
      expect(
        screenText(),
        `"${name}" was on screen during Step 3, above the input asking for it`
      ).not.toContain(name);

      // Answer wrongly on purpose — the name must appear now, and not before.
      fireEvent.change(input, { target: { value: 'rangt svar' } });
      fireEvent.click(screen.getByRole('button', { name: /Athuga svar/ }));
      expect(screenText()).toContain(name);

      fireEvent.click(screen.getByRole('button', { name: /Næsta efnasamband|Ljúka stigi/ }));
    }
  });

  it('withdraws the worked support as each type is revisited', () => {
    // The first item of a type is worked in full, the second blanks the
    // transformations, and any later one gives only the pattern.
    expect(
      supportLadder([
        { type: 'ionic-simple' },
        { type: 'ionic-simple' },
        { type: 'molecular' },
        { type: 'ionic-simple' },
        { type: 'molecular' },
      ])
    ).toEqual(['full', 'partial', 'full', 'none', 'partial']);
  });

  it('fades all four types across the twelve shipped items', () => {
    renderLevel();

    let fullyWorked = 0;
    for (let i = 0; i < CORRECT_NAMES.length; i++) {
      pickTypeAndAdvance();

      // Step 2 always names what to do next, whatever the support level.
      expect(screenText()).toContain('Byggðu nafnið upp eftir reglunni.');
      if (!screenText().includes('Mynstrið fyrir þessa tegund')) fullyWorked++;

      fireEvent.click(screen.getByRole('button', { name: /skrifa nafnið/ }));

      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'x' } });
      fireEvent.click(screen.getByRole('button', { name: /Athuga svar/ }));
      fireEvent.click(screen.getByRole('button', { name: /Næsta efnasamband|Ljúka stigi/ }));
    }

    // Four types, each worked in full once and faded once: eight items keep the
    // parts, four are down to the pattern alone.
    expect(fullyWorked).toBe(8);
  });
});
