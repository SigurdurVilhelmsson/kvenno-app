// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import App from '../App';
import { clockPastNextGuard } from './next-guard-clock';
import { playLevel1, playLevel2, playLevel3, type Pick } from './playthrough';
import { challenges as level1 } from '../data/level1-questions';
import { challenges as level2 } from '../data/level2-questions';
import { challenges as level3 } from '../data/level3-questions';

/**
 * No running score inside a level, and `N af M rétt` at its end (mobile-pass decision 1 (b),
 * ruled platform-wide). Every level used to show `N stig` beside its challenge counter, at 20
 * points a right answer, and the menu and the completion screen showed points and a
 * `Heildarstig` total.
 *
 * Each level is played through the real buttons with some answers wrong and every screen read
 * on the way. No level offers a retry, so a right answer is a right first answer, and a hint
 * never changes the count (decision 2 (b); `hint-cost.test.tsx` plays Stig 1 both ways, and
 * Stig 2 and 3 open every hint here).
 */

// Næsta ignores a press within 400 ms of appearing; these tests press it at once.
clockPastNextGuard();

beforeEach(() => localStorage.clear());

/**
 * A running score: `Stig: 3`, `60 stig`. Not `1. stig`, the order buttons in the graph, and
 * case-sensitive, since the text runs the order buttons `012` straight into `Stig í [B]:`.
 */
const RUNNING_SCORE = [/\bStig:\s*\d/, /\d+\s*stig\b/];

/** Wrong on every third challenge (0, 3, 6, …), right on the rest. */
const mixed = (i: number): Pick => (i % 3 === 0 ? 'wrong' : 'correct');
const expectedRight = (n: number) =>
  Array.from({ length: n }, (_, i) => i).filter((i) => mixed(i) === 'correct').length;

describe('each level reports its right answers and shows no score on the way', () => {
  const levels = [
    ['Stig 1', () => playLevel1(mixed, { useHints: true }), level1.length],
    ['Stig 2', () => playLevel2(mixed), level2.length],
    ['Stig 3', () => playLevel3(mixed), level3.length],
  ] as const;
  for (const [name, play, total] of levels) {
    it(name, () => {
      const run = play();
      expect(run).toMatchObject({ correct: expectedRight(total), total });
      for (const pattern of RUNNING_SCORE) expect(run.text).not.toMatch(pattern);
    });
  }
});

describe('the menu and the completion screen', () => {
  const KEY = 'kinetics-progress';
  const noScore = (text: string) => {
    for (const pattern of [...RUNNING_SCORE, /Heildarstig\b/, /Leikir spilaðir/]) {
      expect(text).not.toMatch(pattern);
    }
  };

  it('show each level as "N af M rétt", with no points and no total', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        level1Completed: true,
        level1Correct: 4,
        level1Total: 6,
        level2Completed: true,
        level2Correct: 5,
        level2Total: 6,
        level3Completed: false,
      })
    );
    const { container, unmount } = render(<App />);
    expect(container.textContent).toContain('✓ 4 af 6 rétt');
    expect(container.textContent).toContain('✓ 5 af 6 rétt');
    expect(container.textContent).toContain('2 af 3 stigum lokið');
    noScore(container.textContent!);
    unmount();
  });

  it('show a level finished under the old points format as "Lokið", never as a count', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        level1Completed: true,
        level1Score: 100,
        level2Completed: false,
        level2Score: 0,
        level3Completed: false,
        level3Score: 0,
        totalGamesPlayed: 1,
      })
    );
    const { container, unmount } = render(<App />);
    expect(container.textContent).toContain('✓ Lokið');
    expect(container.textContent).not.toMatch(/100/);
    noScore(container.textContent!);
    unmount();
  });

  it('the completion screen lists each level by its count', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        level1Completed: true,
        level1Correct: 4,
        level1Total: 6,
        level2Completed: true,
        level2Score: 100,
        level3Completed: false,
      })
    );
    const { container, unmount } = render(<App />);
    const ui = within(container);
    fireEvent.click(ui.getByText(/^Stig 3:/));
    fireEvent.click(ui.getByRole('button', { name: /Byrja æfingar/ }));
    for (const challenge of level3) {
      const correct = challenge.options.find((o) => o.correct)!.text;
      const button = Array.from(container.querySelectorAll('button')).find(
        (b) =>
          b.textContent
            ?.trim()
            .replace(/^[a-d]\.\s*/, '')
            .replace(/[✓✗]/g, '')
            .trim() === correct
      )!;
      fireEvent.click(button);
      fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
      const next = ui.queryByRole('button', { name: 'Næsta þraut' });
      fireEvent.click(next ?? ui.getByRole('button', { name: 'Ljúka stigi 3' }));
    }
    expect(container.textContent).toContain('Þú hefur lokið öllum stigum');
    expect(container.textContent).toContain('4 af 6 rétt');
    expect(container.textContent).toContain('Lokið');
    expect(container.textContent).toContain(`${level3.length} af ${level3.length} rétt`);
    noScore(container.textContent!);
    unmount();
  });
});
