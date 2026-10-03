// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { LEVEL1_CHALLENGES } from '../data/level1-challenges';

/**
 * What the menu says about a finished level (mobile-pass decision 1 (b)).
 *
 * It said "✓ 600 stig" per level and kept a Heildarstig total and a count of games
 * played. Points are gone. No level here can end with a wrong answer — Næsta waits
 * for a right one, and Stig 1's pH bar names the verdict before the check — so a
 * count would always read "N af N rétt". Each level reports that it is done
 * instead, as Einingakeðjan's Stig 1 does (decision 23).
 */

beforeEach(() => {
  vi.useFakeTimers();
  Element.prototype.scrollIntoView = vi.fn();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const settle = () => act(() => void vi.advanceTimersByTime(400));

function expectNoPoints(where: string) {
  const text = document.body.textContent ?? '';
  expect(text, where).not.toMatch(/Stig:\s*\d/);
  expect(text, where).not.toMatch(/\d+\s*stig\b/);
  expect(text, where).not.toContain('Heildarstig');
  expect(text, where).not.toContain('Leikir spilaðir');
}

describe('the menu', () => {
  it('shows a level saved under the old points format as Lokið', () => {
    localStorage.setItem(
      'buffer-recipe-creator-progress',
      JSON.stringify({
        level1Completed: true,
        level1Score: 540,
        level2Completed: false,
        level2Score: 0,
        level3Completed: false,
        level3Score: 0,
        totalGamesPlayed: 2,
      })
    );
    render(<App />);
    const card = screen.getByRole('button', { name: /Stig 1: Hugmyndafræði/ });
    expect(card.textContent).toContain('✓ Lokið');
    expect(document.body.textContent).toContain('Framvinda: 1 af 3 stigum lokið');
    expectNoPoints('menu');
  });

  it('marks Stig 1 done after it is played through, with no score on the way', () => {
    render(<App />);
    expect(document.body.textContent).not.toContain('Framvinda:');
    fireEvent.click(screen.getByRole('button', { name: /Stig 1: Hugmyndafræði/ }));
    settle();

    const tap = (name: string, times = 1) => {
      for (let i = 0; i < times; i++) fireEvent.click(screen.getByRole('button', { name }));
    };
    // Base molecules to add (+) or remove (−) from the 5 : 5 start of each challenge.
    const SOLVE = [0, 4, -2, 0, 3, 0];
    expect(SOLVE).toHaveLength(LEVEL1_CHALLENGES.length);
    SOLVE.forEach((change, i) => {
      if (change > 0) tap('Bæta við basasameind', change);
      if (change < 0) tap('Fjarlægja basasameind', -change);
      tap('Athuga stuðpúða');
      settle();
      expectNoPoints(`challenge ${i + 1}`);
      tap(i < SOLVE.length - 1 ? 'Næsta verkefni →' : 'Ljúka stigi →');
      settle();
    });
    settle();

    const card = screen.getByRole('button', { name: /Stig 1: Hugmyndafræði/ });
    expect(within(card).getByText('✓ Lokið')).toBeTruthy();
    expect(document.body.textContent).toContain('Framvinda: 1 af 3 stigum lokið');
    expectNoPoints('menu after Stig 1');
    expect(JSON.parse(localStorage.getItem('buffer-recipe-creator-progress')!)).toEqual({
      level1Completed: true,
      level2Completed: false,
      level3Completed: false,
    });
  });
});
