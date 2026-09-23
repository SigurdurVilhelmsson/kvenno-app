// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, it, expect } from 'vitest';

import App from '../App';

/**
 * Stig 3 has a summary screen — score, percentage, "Reyna aftur" — and no
 * student had ever seen it. On the last question `next()` called `onComplete`,
 * and the App's handler recorded the level *and* switched to the menu, so the
 * summary rendered for no frames at all and the run ended on the menu without
 * a word about how it went.
 *
 * This drives the real App, because the defect was in how the two fit
 * together: Level 3 on its own did show the summary. Queries are scoped to the
 * rendered container (the repo runs vitest with `retry: 2`).
 */

const PROGRESS_KEY = 'molhugtakidProgress';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('Stig 3 ends on its summary', () => {
  it('shows the summary after the last question and records the level', () => {
    const { container } = render(<App />);
    const ui = within(container);

    fireEvent.click(ui.getByRole('button', { name: /Stig 3/ }));

    // Eight questions; a wrong answer still moves the run on.
    for (let question = 1; question <= 8; question++) {
      expect(ui.getByText(`Spurning ${question} af 8`)).toBeTruthy();
      fireEvent.change(ui.getByRole('textbox'), { target: { value: '1' } });
      fireEvent.click(ui.getByRole('button', { name: 'Svara' }));
      fireEvent.click(ui.getByRole('button', { name: question < 8 ? /Næsta/ : /Sjá niðurstöðu/ }));
    }

    expect(ui.getByRole('button', { name: 'Reyna aftur' })).toBeTruthy();
    expect(ui.getByText('0/8')).toBeTruthy();
    // `lokið` takes the dative: `Æfingu lokið`, as `Leik lokið`.
    expect(ui.getByRole('heading', { name: 'Æfingu lokið!' })).toBeTruthy();

    // Completion is still recorded as the summary opens, as it was before.
    expect(JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}').level3Completed).toBe(true);

    // And the summary's own way back still reaches the menu.
    fireEvent.click(ui.getByRole('button', { name: 'Til baka í valmynd' }));
    expect(ui.getByRole('button', { name: /Stig 3/ })).toBeTruthy();
  });
});
