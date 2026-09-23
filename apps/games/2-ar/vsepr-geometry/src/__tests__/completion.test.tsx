// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';

/**
 * The completion screen says "Þú hefur lokið öllum stigum!". It used to follow
 * Stig 3 unconditionally, so a student who played only Stig 3 was told every
 * level was done beside two scores of 0. Levels are not gated (ruling
 * 2026-08-29), so it now follows whichever level completes the set.
 *
 * Queries are scoped to the rendered container (the repo runs vitest with
 * `retry: 2` and no RTL auto-cleanup).
 */

const STORAGE_KEY = 'vsepr-geometry-progress';
const DONE = 'Þú hefur lokið öllum stigum!';
let unmount: (() => void) | null = null;

function seed(progress: Record<string, unknown>) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      level1Completed: false,
      level1Score: 0,
      level2Completed: false,
      level2Score: 0,
      level3Completed: false,
      level3Score: 0,
      totalGamesPlayed: 0,
      ...progress,
    })
  );
}

function start() {
  const rendered = render(<App />);
  unmount = rendered.unmount;
  return { ui: within(rendered.container), container: rendered.container };
}

/** Enter Stig 3 from the menu and answer all twelve questions. */
function playLevel3(ui: ReturnType<typeof within>, container: HTMLElement) {
  fireEvent.click(ui.getByRole('button', { name: /Stig 3: Blendni og skautun/ }));
  for (let q = 0; q < 12; q++) {
    fireEvent.click(container.querySelector('button:has(span.uppercase)') as HTMLElement);
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
    fireEvent.click(ui.getByRole('button', { name: /Næsta spurning|Ljúka stigi 3/ }));
  }
}

/** Enter Stig 1 from the menu, skip the exploring and answer all eight. */
function playLevel1(ui: ReturnType<typeof within>, container: HTMLElement) {
  fireEvent.click(ui.getByRole('button', { name: /Stig 1: VSEPR Kenning/ }));
  fireEvent.click(ui.getByRole('button', { name: /Hefja spurningar/ }));
  for (let q = 0; q < 8; q++) {
    fireEvent.click(container.querySelector('button:has(span.uppercase)') as HTMLElement);
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
    fireEvent.click(ui.getByRole('button', { name: /Næsta spurning|Ljúka stigi 1/ }));
  }
}

beforeEach(() => {
  localStorage.clear();
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  unmount?.();
  unmount = null;
  localStorage.clear();
});

describe('the completion screen', () => {
  it('does not follow Stig 3 when Stig 1 and 2 were never played', () => {
    const { ui, container } = start();
    playLevel3(ui, container);
    expect(container.textContent).not.toContain(DONE);
    expect(ui.getByRole('button', { name: /Stig 3: Blendni og skautun/ })).toBeTruthy();
  });

  it('follows Stig 3 when it completes the set', () => {
    seed({ level1Completed: true, level2Completed: true, totalGamesPlayed: 2 });
    const { ui, container } = start();
    playLevel3(ui, container);
    expect(container.textContent).toContain(DONE);
  });

  it('follows whichever level completes the set', () => {
    seed({ level2Completed: true, level3Completed: true, totalGamesPlayed: 2 });
    const { ui, container } = start();
    playLevel1(ui, container);
    expect(container.textContent).toContain(DONE);
  });
});
