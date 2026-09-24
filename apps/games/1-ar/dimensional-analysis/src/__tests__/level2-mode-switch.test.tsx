// @vitest-environment jsdom
/**
 * Level 2: the chain is one chain, whichever way the student builds it.
 *
 * Level 2 offers two ways to build a conversion chain — the shared
 * DragDropBuilder (drag, or tap-to-place) and a click mode of plain buttons —
 * with a toggle between them. They used to keep two different records: click
 * mode appended to `selectedFactors` (the graded path) and never touched
 * `zoneState`, the builder's mirror, while the builder re-derived
 * `selectedFactors` from `zoneState` on every change. So:
 *  - a factor chosen in click mode could not be taken back out (its button was
 *    disabled), and
 *  - switching mode showed a builder that disagreed with the graded chain, and
 *    the builder's next move silently replaced the chain with its own contents.
 *
 * These drive the real builder and the real buttons with clicks, which take
 * the same route a finger does.
 */

import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { Level2 } from '../components/Level2';

// Problem L2-1: 500 mg → g, whose one correct factor is `1 g / 1000 mg`. The
// inverted `1000 mg / 1 g` is always among its distractors.
const CORRECT = '1 g1000 mg';
const INVERTED = '1000 mg1 g';

const STARTED = { problemsCompleted: 0, finalAnswersCorrect: 0, mastered: false };

function pool() {
  return document.querySelector('.items-pool') as HTMLElement;
}
function chain() {
  return document.querySelector('[data-zone-id="conversion-chain"]') as HTMLElement;
}
function itemsIn(container: HTMLElement): string[] {
  return [...container.querySelectorAll<HTMLElement>('[data-item-id]')].map(
    (el) => el.textContent ?? ''
  );
}
function itemIn(container: HTMLElement, text: string): HTMLElement {
  const found = [...container.querySelectorAll<HTMLElement>('[data-item-id]')].find(
    (el) => el.textContent === text
  );
  if (!found) throw new Error(`no item "${text}" here`);
  return found;
}
/** Tap-to-place: pick the item up, then tap the chain. */
function placeInChain(text: string) {
  fireEvent.click(itemIn(pool(), text));
  fireEvent.click(chain());
}
/** Pick a placed item up, then tap the pool's own heading to hand it back. */
function returnToPool(text: string) {
  fireEvent.click(itemIn(chain(), text));
  fireEvent.click(within(pool()).getByText('Tiltæk atriði'));
}
function usedPanel(): HTMLElement | null {
  return screen.queryByText('Stuðlar notaðir:')?.parentElement ?? null;
}
/** The chain as the level shows it, which is also the path it grades. */
function factorsShownAsUsed(): string[] {
  const panel = usedPanel();
  if (!panel) return [];
  return within(panel)
    .getAllByRole('button')
    .map((b) => b.textContent ?? '');
}
/** A click-mode factor button (not its copy in the "Stuðlar notaðir" panel). */
function clickModeButton(text: string): HTMLButtonElement {
  const panel = usedPanel();
  const found = screen
    .getAllByRole('button')
    .find((b) => b.textContent === text && !(panel && panel.contains(b)));
  if (!found) throw new Error(`no click-mode button "${text}"`);
  return found as HTMLButtonElement;
}
function toClickMode() {
  fireEvent.click(screen.getByRole('button', { name: /Skipta í smella-ham/ }));
}
function toDragMode() {
  fireEvent.click(screen.getByRole('button', { name: /Skipta í draga-ham/ }));
}
function submit(answer: string) {
  fireEvent.change(screen.getByPlaceholderText('Sláðu inn svar'), { target: { value: answer } });
  fireEvent.click(screen.getByRole('button', { name: /Athuga svar/ }));
}
function renderLevel() {
  const onCorrect = vi.fn();
  const onIncorrect = vi.fn();
  render(
    <Level2
      onComplete={vi.fn()}
      onBack={vi.fn()}
      initialProgress={{ ...STARTED }}
      onCorrectAnswer={onCorrect}
      onIncorrectAnswer={onIncorrect}
    />
  );
  return { onCorrect, onIncorrect };
}

afterEach(cleanup);

describe('Level 2 — click mode', () => {
  it('takes a chosen factor back out when it is clicked again', () => {
    const { onCorrect, onIncorrect } = renderLevel();
    toClickMode();

    fireEvent.click(clickModeButton(INVERTED));
    fireEvent.click(clickModeButton(CORRECT));
    expect(factorsShownAsUsed()).toEqual([INVERTED, CORRECT]);

    fireEvent.click(clickModeButton(INVERTED));
    expect(factorsShownAsUsed()).toEqual([CORRECT]);

    // A toggle, so it says whether it is on: the chosen one is pressed.
    expect(clickModeButton(INVERTED).getAttribute('aria-pressed')).toBe('false');
    expect(clickModeButton(CORRECT).getAttribute('aria-pressed')).toBe('true');

    // Left in, the wrong first step would push the right factor to second
    // place and fail the path check.
    submit('0,5');
    expect(onIncorrect).not.toHaveBeenCalled();
    expect(onCorrect).toHaveBeenCalledTimes(1);
  });
});

describe('Level 2 — switching mode keeps one chain', () => {
  it('shows a click-mode chain in the builder, and the next drop adds to it', () => {
    renderLevel();
    toClickMode();
    fireEvent.click(clickModeButton(INVERTED));

    toDragMode();
    expect(itemsIn(chain())).toEqual([INVERTED]);
    expect(itemsIn(pool())).not.toContain(INVERTED);

    placeInChain(CORRECT);
    expect(itemsIn(chain())).toEqual([INVERTED, CORRECT]);
    expect(factorsShownAsUsed()).toEqual([INVERTED, CORRECT]);
  });

  it('survives a round trip drag → click → drag, in order', () => {
    const { onCorrect, onIncorrect } = renderLevel();
    placeInChain(INVERTED);

    toClickMode();
    fireEvent.click(clickModeButton(CORRECT));
    expect(factorsShownAsUsed()).toEqual([INVERTED, CORRECT]);

    toDragMode();
    expect(itemsIn(chain())).toEqual([INVERTED, CORRECT]);

    // Removing one factor in the builder removes that factor, not the whole
    // chain the student built in the other mode.
    returnToPool(INVERTED);
    expect(itemsIn(chain())).toEqual([CORRECT]);
    expect(factorsShownAsUsed()).toEqual([CORRECT]);

    submit('0,5');
    expect(onIncorrect).not.toHaveBeenCalled();
    expect(onCorrect).toHaveBeenCalledTimes(1);
  });

  it('lets click mode remove a factor that was placed by dragging', () => {
    renderLevel();
    placeInChain(INVERTED);

    toClickMode();
    fireEvent.click(clickModeButton(INVERTED));
    expect(factorsShownAsUsed()).toEqual([]);

    toDragMode();
    expect(itemsIn(chain())).toEqual([]);
    expect(itemsIn(pool())).toContain(INVERTED);
    // Nothing left to grade, so there is nothing to submit.
    fireEvent.change(screen.getByPlaceholderText('Sláðu inn svar'), { target: { value: '0,5' } });
    expect(screen.getByRole('button', { name: /Athuga svar/ })).toHaveProperty('disabled', true);
  });
});

describe('Level 2 — the empty chain', () => {
  it('points at the pool, which sits above it', () => {
    renderLevel();
    // The pool comes first in the document at every width (the builder is a
    // column), so the cue must point up, never sideways.
    expect(pool().compareDocumentPosition(chain()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // The builder renders a zone's placeholder only while the zone is empty.
    const placeholder = chain().querySelector('.italic');
    expect(placeholder?.textContent?.trim().startsWith('↑')).toBe(true);
    expect(placeholder?.textContent).not.toMatch(/[←→]/);
  });
});
