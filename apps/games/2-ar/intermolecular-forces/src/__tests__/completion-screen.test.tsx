// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import App from '../App';

/**
 * Finishing Stig 3 always opened the closing screen, which says "Þú hefur lokið öllum
 * stigum!". Levels are not gated (ruling 2026-08-29), so a student who went straight to Stig 3
 * was told they had finished two levels they had never opened, with 0 against both.
 *
 * The screen now opens only when the level just finished completes the set.
 *
 * Buttons are found by their text rather than `getByRole`, which rebuilds the accessibility
 * tree on every call and made ten questions slow. Queries are scoped to the rendered container
 * because the repo runs vitest with `retry: 2` and no RTL auto-cleanup.
 */

const STORAGE_KEY = 'imf-progress';
const DONE_ALL = 'Þú hefur lokið öllum stigum!';

function click(container: HTMLElement, text: RegExp) {
  const button = [...container.querySelectorAll('button')].find((b) =>
    text.test(b.textContent?.trim() ?? '')
  );
  if (!button) throw new Error(`no button matching ${text}`);
  fireEvent.click(button);
}

/** Answer all ten Stig 3 questions (any option will do) and finish the level. */
function playLevel3(container: HTMLElement) {
  click(container, /Stig 3: Flókin greining/);
  for (let i = 0; i < 10; i++) {
    click(container, /^a\./);
    click(container, /^Athuga svar$/);
    click(container, /^(Næsta spurning|Ljúka stigi 3)$/);
  }
}

beforeEach(() => localStorage.clear());

describe('the closing screen', () => {
  it('does not open after Stig 3 when Stig 1 and 2 were never played', () => {
    const { container } = render(<App />);
    playLevel3(container);

    expect(container.textContent).not.toContain(DONE_ALL);
    // Back on the menu, with Stig 3 now marked done.
    expect(container.textContent).toContain('Stig 1: Greina IMF tegundir');
    expect(container.textContent).toContain('1/3');
  });

  it('opens after Stig 3 when it completes the set', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        level1Completed: true,
        level1Score: 150,
        level2Completed: true,
        level2Score: 150,
        level3Completed: false,
        level3Score: 0,
        totalGamesPlayed: 2,
      })
    );
    const { container } = render(<App />);
    playLevel3(container);

    expect(container.textContent).toContain(DONE_ALL);
  });
});
