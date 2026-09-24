// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { periodicPuzzles } from '../data/periodic-configs';
import { screenAfterLevel, type Progress } from '../utils/progress';

/**
 * The summary screen opens with "Þú hefur lokið öllum stigum!". Levels are not
 * gated (Siggi's ruling, 2026-08-29), and the screen used to follow Stig 3
 * unconditionally — so a student who started with Stig 3 was congratulated on
 * finishing everything, beside two scores of 0. It now opens only when all
 * three are done: after Stig 3 as before, or after whichever level completes
 * the set. The screen also named Stig 3 `Eðalgasstytting`, where the menu card
 * and the level's own header call it `Lotukerfi og rafeindir`.
 *
 * Queries are scoped to this render's container: vitest runs with `retry: 2`
 * and no RTL auto-cleanup, so a failed attempt leaves its DOM behind.
 */

const KEY = 'rafeindabygging-progress';
const NONE: Progress = {
  level1Completed: false,
  level1Score: 0,
  level2Completed: false,
  level2Score: 0,
  level3Completed: false,
  level3Score: 0,
  totalGamesPlayed: 0,
};

beforeEach(() => {
  localStorage.clear();
  Element.prototype.scrollIntoView = vi.fn();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
  delete (Element.prototype as Partial<Element>).scrollIntoView;
  vi.restoreAllMocks();
  localStorage.clear();
  document.body.innerHTML = '';
});

function renderApp(saved: Partial<Progress> = {}) {
  localStorage.setItem(KEY, JSON.stringify({ ...NONE, ...saved }));
  const rendered = render(<App />);
  return { ui: within(rendered.container), container: rendered.container };
}

type Ui = ReturnType<typeof within>;

function playLevel3(ui: Ui, container: HTMLElement) {
  fireEvent.click(ui.getByRole('button', { name: /Stig 3: Lotukerfi og rafeindir/ }));
  fireEvent.click(ui.getByRole('button', { name: /Byrja æfingar/ }));
  for (const puzzle of periodicPuzzles) {
    const option = Array.from(
      container.querySelectorAll<HTMLButtonElement>('button.mc-option')
    ).find((b) => b.textContent === puzzle.fullShorthand)!;
    fireEvent.click(option);
    fireEvent.click(ui.getByRole('button', { name: /Athuga svar/ }));
    fireEvent.click(ui.getByRole('button', { name: /Næsta frumefni|Ljúka stigi/ }));
  }
}

function playLevel1(ui: Ui, container: HTMLElement) {
  fireEvent.click(ui.getByRole('button', { name: /Stig 1: Skammtatölur/ }));
  for (const step of [/Sjáum dæmi/, /Eitt dæmi til/, /byrja æfingar/]) {
    fireEvent.click(ui.getByRole('button', { name: step }));
  }
  for (let i = 0; i < 8; i++) {
    fireEvent.click(container.querySelector<HTMLButtonElement>('button.quantum-card')!);
    fireEvent.click(ui.getByRole('button', { name: /Athuga svar/ }));
    fireEvent.click(ui.getByRole('button', { name: /Næsta spurning|Ljúka stigi/ }));
  }
}

const ALL_DONE = /Þú hefur lokið öllum stigum/;
const MENU = /Hvað er rafeindabygging\?/;

describe('after Stig 3', () => {
  it('returns to the menu when Stig 1 and Stig 2 have not been played', () => {
    const { ui, container } = renderApp();
    playLevel3(ui, container);
    expect(container.textContent).not.toMatch(ALL_DONE);
    expect(container.textContent).toMatch(MENU);
    expect(container.textContent).toMatch(/✓ 8 stig/);
  });

  it('opens the summary when the other two are done, naming Stig 3 as the menu does', () => {
    const { ui, container } = renderApp({
      level1Completed: true,
      level1Score: 6,
      level2Completed: true,
      level2Score: 7,
      totalGamesPlayed: 2,
    });
    playLevel3(ui, container);
    expect(container.textContent).toMatch(ALL_DONE);
    expect(container.textContent).toContain('Stig 3: Lotukerfi og rafeindir');
    expect(container.textContent).not.toContain('Stig 3: Eðalgasstytting');
  });
});

describe('after Stig 1', () => {
  it('opens the summary when it is the level that completes the set', () => {
    const { ui, container } = renderApp({
      level2Completed: true,
      level3Completed: true,
      totalGamesPlayed: 2,
    });
    playLevel1(ui, container);
    expect(container.textContent).toMatch(ALL_DONE);
  });

  it('returns to the menu on a replay once everything was already done', () => {
    const { ui, container } = renderApp({
      level1Completed: true,
      level2Completed: true,
      level3Completed: true,
      totalGamesPlayed: 3,
    });
    playLevel1(ui, container);
    expect(container.textContent).toMatch(MENU);
  });
});

describe('screenAfterLevel', () => {
  const done = (a: boolean, b: boolean, c: boolean): Progress => ({
    ...NONE,
    level1Completed: a,
    level2Completed: b,
    level3Completed: c,
  });

  it('never opens the summary while a level is still unplayed', () => {
    expect(screenAfterLevel(3, done(false, false, false), done(false, false, true))).toBe('menu');
    expect(screenAfterLevel(3, done(true, false, true), done(true, false, true))).toBe('menu');
    expect(screenAfterLevel(1, done(false, false, false), done(true, false, false))).toBe('menu');
  });

  it('opens it after Stig 3 with all done, and after whichever level completes the set', () => {
    expect(screenAfterLevel(3, done(true, true, true), done(true, true, true))).toBe('complete');
    expect(screenAfterLevel(2, done(true, false, true), done(true, true, true))).toBe('complete');
    expect(screenAfterLevel(2, done(true, true, true), done(true, true, true))).toBe('menu');
  });
});
