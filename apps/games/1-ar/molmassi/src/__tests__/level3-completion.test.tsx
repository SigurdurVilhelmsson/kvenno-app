// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';

/**
 * Decision 42 (c). Stig 3 marked itself complete as its summary opened, at any
 * score, 0 of 8 included: `next()` called `onComplete` on the last question.
 * It now ends as Stig 1 does, with `Ljúka stigi` at any score beside `Reyna
 * aftur`, behind the same 400 ms double-tap guard, and only that button records
 * the level, with its `N af M rétt` count, and returns to the menu.
 *
 * This drives the real App, with a clock the test moves by hand so the guard
 * can be checked. Queries are scoped to the rendered container (the repo runs
 * vitest with `retry: 2`).
 */

const PROGRESS_KEY = 'molhugtakidProgress';

let now = 0;
/** Half a second on, past the double-tap guard. */
const later = () => (now += 500);

beforeEach(() => {
  localStorage.clear();
  now = 0;
  vi.spyOn(performance, 'now').mockImplementation(() => now);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const saved = () => JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}');

/** Plays Stig 3 to its summary, answering every question wrong. */
function toSummary() {
  const { container } = render(<App />);
  const ui = within(container);
  fireEvent.click(ui.getByRole('button', { name: /Stig 3/ }));
  for (let question = 1; question <= 8; question++) {
    fireEvent.change(ui.getByRole('textbox'), { target: { value: '1' } });
    later();
    fireEvent.click(ui.getByRole('button', { name: 'Svara' }));
    later();
    fireEvent.click(ui.getByRole('button', { name: question < 8 ? /Næsta/ : /Sjá niðurstöðu/ }));
  }
  expect(ui.getByText('Þú svaraðir 0 af 8 rétt')).toBeTruthy();
  return ui;
}

describe('Stig 3 is completed from its summary’s Ljúka stigi', () => {
  it('records nothing on reaching the summary, even at 0 of 8', () => {
    toSummary();
    expect(saved().level3Completed).toBeFalsy();
    expect(saved().level3Total).toBeUndefined();
  });

  it('records the level and its count at any score, then returns to the menu', () => {
    const ui = toSummary();
    later();
    fireEvent.click(ui.getByRole('button', { name: 'Ljúka stigi' }));
    expect(saved()).toMatchObject({ level3Completed: true, level3Correct: 0, level3Total: 8 });
    expect(ui.getByRole('button', { name: /Stig 3/ }).textContent).toContain('0 af 8 rétt');
  });

  it('drops a press within 400 ms of the summary opening, as Stig 1 does', () => {
    const ui = toSummary();
    fireEvent.click(ui.getByRole('button', { name: 'Ljúka stigi' }));
    expect(saved().level3Completed).toBeFalsy();
    expect(ui.getByRole('button', { name: 'Ljúka stigi' })).toBeTruthy();
    later();
    fireEvent.click(ui.getByRole('button', { name: 'Ljúka stigi' }));
    expect(saved().level3Completed).toBe(true);
  });

  it('leaves the level unrecorded when the student goes back instead', () => {
    const ui = toSummary();
    later();
    fireEvent.click(ui.getByRole('button', { name: 'Til baka í valmynd' }));
    expect(ui.getByRole('button', { name: /Stig 3/ })).toBeTruthy();
    expect(saved().level3Completed).toBeFalsy();
  });
});
