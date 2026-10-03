import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';

/**
 * The menu's counters and the level-to-level routing must agree with the game
 * the student is playing.
 *
 * Stig 1 and Stig 3 are replaced by stand-ins here: playing them through for
 * real would take the test past what it is about, which is what App does with
 * the result. `level-results.test.tsx` plays the real levels.
 */
vi.mock('../components/Level1', () => ({
  Level1: ({ onComplete }: { onComplete: () => void }) => (
    <button onClick={() => onComplete()}>Áfram í Stig 2 →</button>
  ),
}));
vi.mock('../components/Level3', () => ({
  Level3: ({ onComplete }: { onComplete: (correct: number, total: number) => void }) => (
    <button onClick={() => onComplete(3, 8)}>Ljúka stigi →</button>
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

/** The "Stigum lokið" tile's figure. */
function levelsCompleted(): string {
  const label = screen.getByText('Stigum lokið');
  return label.previousElementSibling?.textContent ?? '';
}

/** Progress as the game saved it before counts replaced points. */
const OLD_FORMAT_ALL_DONE = {
  level0Score: 150,
  level0Completed: true,
  level1Score: 600,
  level1Completed: true,
  level2Score: 1200,
  level2Completed: true,
  level3Score: 8,
  level3Completed: true,
  totalGamesPlayed: 4,
};

describe('the menu counts all four levels', () => {
  it('counts Stig 0 as a level', () => {
    // Stig 0 landed on 2026-09-20; the counter still read "x/3" and ignored it,
    // so a student who had finished Stig 0 was told they had finished nothing.
    localStorage.setItem(
      KEY,
      JSON.stringify({ level0Completed: true, level0Correct: 9, level0Total: 15 })
    );
    render(<App />);
    expect(levelsCompleted()).toBe('1/4');
  });

  it('reads 4/4 only when every level is done', () => {
    localStorage.setItem(KEY, JSON.stringify(OLD_FORMAT_ALL_DONE));
    render(<App />);
    expect(levelsCompleted()).toBe('4/4');
  });
});

describe('the menu shows a count per level, never points (decision 58 (b))', () => {
  it('shows "N af M rétt" on a level played since the change', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ level2Completed: true, level2Correct: 9, level2Total: 12 })
    );
    render(<App />);
    expect(screen.getByRole('button', { name: /Stig 2: Rökstuðningur/ }).textContent).toContain(
      '✓ 9 af 12 rétt'
    );
  });

  it('shows old saved points as "Lokið", with no count and no total', () => {
    localStorage.setItem(KEY, JSON.stringify(OLD_FORMAT_ALL_DONE));
    const { container } = render(<App />);
    const card = screen.getByRole('button', { name: /Stig 2: Rökstuðningur/ });
    expect(card.textContent).toContain('✓ Lokið');
    expect(card.textContent).not.toContain('1200');
    expect(container.textContent).not.toMatch(/Heildarstig|\d+\s*stig\b|Leikir/);
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
    expect(saved.level1Correct).toBeUndefined();
  });
});

describe('the closing screen opens only when all four levels are done', () => {
  it('goes back to the menu when Stig 3 is the only level played', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Stig 3: Útreikningar'));
    fireEvent.click(screen.getByRole('button', { name: 'Ljúka stigi →' }));

    expect(screen.queryByText('Þú hefur lokið öllum stigum!')).toBeNull();
    expect(screen.getByRole('button', { name: /Stig 3: Útreikningar/ }).textContent).toContain(
      '✓ 3 af 8 rétt'
    );
    const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    expect(saved).toMatchObject({ level3Completed: true, level3Correct: 3, level3Total: 8 });
  });

  it('opens when Stig 3 finishes the set, and shows each level with no total', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        level0Completed: true,
        level0Correct: 12,
        level0Total: 15,
        level1Completed: true,
        level2Completed: true,
        level2Correct: 10,
        level2Total: 12,
        level3Completed: false,
      })
    );
    const { container } = render(<App />);
    fireEvent.click(screen.getByText('Stig 3: Útreikningar'));
    fireEvent.click(screen.getByRole('button', { name: 'Ljúka stigi →' }));

    expect(screen.getByText('Þú hefur lokið öllum stigum!')).toBeDefined();
    const text = container.textContent ?? '';
    expect(text).toContain('12 af 15 rétt');
    expect(text).toContain('10 af 12 rétt');
    expect(text).toContain('3 af 8 rétt');
    expect(text).not.toContain('Heildarstig');
  });
});
