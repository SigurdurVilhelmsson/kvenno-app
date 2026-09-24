import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';

/**
 * The menu's counters and the level-to-level routing must agree with the game
 * the student is playing.
 *
 * Stig 1 is replaced by a stand-in here: playing its six slider challenges
 * through for real would take the test past what it is about, which is what
 * App does with the result.
 */
vi.mock('../components/Level1', () => ({
  Level1: ({ onComplete }: { onComplete: (score: number) => void }) => (
    <button onClick={() => onComplete(600)}>Áfram í Stig 2 →</button>
  ),
}));

const KEY = 'lausnirProgress';

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
});

/** The "Stig lokið" tile's figure. */
function levelsCompleted(): string {
  const label = screen.getByText('Stig lokið');
  return label.previousElementSibling?.textContent ?? '';
}

describe('the menu counts all four levels', () => {
  it('counts Stig 0 as a level', () => {
    // Stig 0 landed on 2026-09-20; the counter still read "x/3" and ignored it,
    // so a student who had finished Stig 0 was told they had finished nothing.
    localStorage.setItem(
      KEY,
      JSON.stringify({
        level0Score: 150,
        level0Completed: true,
        level1Score: null,
        level1Completed: false,
        level2Score: null,
        level2Completed: false,
        level3Score: null,
        level3Completed: false,
        totalGamesPlayed: 1,
      })
    );
    render(<App />);
    expect(levelsCompleted()).toBe('1/4');
  });

  it('reads 4/4 only when every level is done', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        level0Score: 150,
        level0Completed: true,
        level1Score: 600,
        level1Completed: true,
        level2Score: 1200,
        level2Completed: true,
        level3Score: 8,
        level3Completed: true,
        totalGamesPlayed: 4,
      })
    );
    render(<App />);
    expect(levelsCompleted()).toBe('4/4');
  });
});

describe('"Áfram í Stig 2 →" goes to Stig 2', () => {
  it('opens Stig 2 when Stig 1 is finished, and records Stig 1', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Stig 1: Hugtök'));
    fireEvent.click(screen.getByRole('button', { name: 'Áfram í Stig 2 →' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Lausnir - Stig 2' })).toBeDefined();
    const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    expect(saved.level1Completed).toBe(true);
    expect(saved.level1Score).toBe(600);
  });
});
