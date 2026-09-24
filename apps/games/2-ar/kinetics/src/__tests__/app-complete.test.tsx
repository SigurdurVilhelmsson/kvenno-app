// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';

import App from '../App';
import { challenges } from '../data/level3-questions';

/**
 * Levels are not gated (Siggi's ruling, 2026-08-29), so a student may play Stig 3 first. The
 * game then sent them to its completion screen — "Til hamingju! Þú hefur lokið öllum stigum!" —
 * with Stig 1 and Stig 2 still at zero. The screen that sums up the run must not claim a run
 * that did not happen.
 */
function playLevel3(container: HTMLElement) {
  const ui = within(container);
  fireEvent.click(ui.getByText(/^Stig 3:/));
  fireEvent.click(ui.getByRole('button', { name: /Byrja æfingar/ }));
  for (const challenge of challenges) {
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
}

const KEY = 'kinetics-progress';

describe('the completion screen', () => {
  beforeEach(() => localStorage.removeItem(KEY));

  it('does not say every level is done when only Stig 3 is', () => {
    const { container, unmount } = render(<App />);
    playLevel3(container);
    expect(container.textContent).not.toContain('Þú hefur lokið öllum stigum');
    // Back on the menu, with Stig 3 marked done.
    expect(within(container).getByText(/^Stig 3:/)).toBeTruthy();
    unmount();
  });

  it('does say so once the last of the three is finished', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        level1Completed: true,
        level1Score: 100,
        level2Completed: true,
        level2Score: 100,
        level3Completed: false,
        level3Score: 0,
        totalGamesPlayed: 2,
      })
    );
    const { container, unmount } = render(<App />);
    playLevel3(container);
    expect(container.textContent).toContain('Þú hefur lokið öllum stigum');
    unmount();
  });
});
