// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';

/**
 * Finishing Stig 3 always opened the closing screen, which says "Þú hefur lokið öllum stigum!",
 * and listed `Lokið` beside levels never played. Levels are not gated, so a student who went
 * straight to Stig 3 was told they had finished everything (found 2026-11-02). The screen now
 * opens only when the level just finished completes the set, as in Millisameindakraftar and
 * Hvarfhraði.
 *
 * Each level is replaced by a button that reports a result at once: the routing after a level is
 * what is tested here, and each level's own play has its own tests.
 */

vi.mock('../components/Level1', () => ({
  Level1: ({ onComplete }: { onComplete: (correct: number, total: number) => void }) => (
    <button onClick={() => onComplete(4, 6)}>Ljúka prófunarstigi</button>
  ),
}));
vi.mock('../components/Level2', () => ({
  Level2: ({ onComplete }: { onComplete: (correct: number, total: number) => void }) => (
    <button onClick={() => onComplete(4, 6)}>Ljúka prófunarstigi</button>
  ),
}));
vi.mock('../components/Level3', () => ({
  Level3: ({ onComplete }: { onComplete: (correct: number, total: number) => void }) => (
    <button onClick={() => onComplete(4, 6)}>Ljúka prófunarstigi</button>
  ),
}));

const STORAGE_KEY = 'ph-titration-progress';
const DONE_ALL = 'Þú hefur lokið öllum stigum!';

function clickButton(container: HTMLElement, text: string) {
  const button = [...container.querySelectorAll('button')].find((b) =>
    (b.textContent ?? '').includes(text)
  );
  if (!button) throw new Error(`no button containing "${text}"`);
  fireEvent.click(button);
}

async function finishLevel(container: HTMLElement, menuLabel: string) {
  clickButton(container, menuLabel);
  await waitFor(() => clickButton(container, 'Ljúka prófunarstigi'));
}

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('the closing screen', () => {
  it('does not open after Stig 3 when Stig 1 and 2 were never played', async () => {
    const { container } = render(<App />);
    await finishLevel(container, 'Stig 3: Útreikningar');

    await waitFor(() => expect(container.textContent).toContain('Stig 1: Skilningur'));
    expect(container.textContent).not.toContain(DONE_ALL);
  });

  it('opens after Stig 3 when it completes the set', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ level1Completed: true, level2Completed: true, level3Completed: false })
    );
    const { container } = render(<App />);
    await finishLevel(container, 'Stig 3: Útreikningar');

    await waitFor(() => expect(container.textContent).toContain(DONE_ALL));
  });

  it('opens after whichever level completes the set', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ level1Completed: false, level2Completed: true, level3Completed: true })
    );
    const { container } = render(<App />);
    await finishLevel(container, 'Stig 1: Skilningur');

    await waitFor(() => expect(container.textContent).toContain(DONE_ALL));
  });
});
