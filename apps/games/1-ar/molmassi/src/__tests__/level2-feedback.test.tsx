// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';

import { Level2, unreadableAnswerMessage } from '../components/Level2';

/**
 * What Stig 2 shows after Svara.
 *
 * - The worked solution was printed twice after every answer: once in
 *   FeedbackPanel's "Af hverju?", which opens expanded, and again in the
 *   "Útreikningur" box beneath it. CLAUDE.md's rule for exactly this case is
 *   `defaultExpanded: false` where the same text is visible elsewhere.
 * - An answer the parser could not read did nothing at all: no feedback, no
 *   message, the button still live. Stig 3 says `Ógilt gildi`; Stig 2 now does.
 *
 * Queries are scoped to the rendered container (the repo runs `retry: 2`).
 */

afterEach(cleanup);

function start() {
  const rendered = render(<Level2 onBack={vi.fn()} onComplete={vi.fn()} initialProgress />);
  return { ui: within(rendered.container), ...rendered };
}

/** Every worked solution's first line starts with this; the reference box does not. */
const SOLUTION_HEADING = 'Einingagreining:';

function count(text: string, needle: string): number {
  return text.split(needle).length - 1;
}

describe('Stig 2 feedback', () => {
  it('prints the worked solution once, with "Af hverju?" closed', () => {
    const { ui, container } = start();
    fireEvent.change(ui.getByRole('textbox'), { target: { value: '1' } });
    fireEvent.click(ui.getByRole('button', { name: 'Svara' }));

    expect(ui.getByText('Útreikningur:')).toBeTruthy();
    expect(count(container.textContent ?? '', SOLUTION_HEADING)).toBe(1);
    expect(ui.getByRole('button', { name: /Af hverju/ }).getAttribute('aria-expanded')).toBe(
      'false'
    );
  });

  it('says so when an answer cannot be read, instead of doing nothing', () => {
    const { ui, container } = start();
    // Half a power of ten: the parser refuses it rather than grade the mantissa.
    fireEvent.change(ui.getByRole('textbox'), { target: { value: '3,5 × 10' } });
    fireEvent.click(ui.getByRole('button', { name: 'Svara' }));

    expect(container.textContent).toMatch(/Ógilt gildi/);
    expect(ui.queryByText('Útreikningur:')).toBeNull();

    // Typing again clears it.
    fireEvent.change(ui.getByRole('textbox'), { target: { value: '3,5' } });
    expect(container.textContent).not.toMatch(/Ógilt gildi/);
  });

  it('suggests the notation the keyboard can type', () => {
    expect(unreadableAnswerMessage('text')).toContain('2,5e20');
    expect(unreadableAnswerMessage('decimal')).not.toContain('e24');
  });
});
