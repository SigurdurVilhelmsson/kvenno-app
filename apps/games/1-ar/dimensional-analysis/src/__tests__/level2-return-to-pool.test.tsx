// @vitest-environment jsdom
/**
 * Level 2: a factor sent back to the pool must leave the graded chain.
 *
 * The shared DragDropBuilder gained tap-to-place for phones, and with it a way
 * to take a factor back out of the chain: pick it up, then tap the pool. It
 * reports that through `onRemove`. Level 2 keeps its own mirror of the chain
 * (`zoneState`, from which `selectedFactors` — the path it grades — is
 * derived), so without handling `onRemove` a factor the student had removed
 * stayed in the graded path while the builder showed it back in the pool.
 *
 * These drive the real builder with clicks, which take the same tap-to-place
 * route a finger does.
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
/** Pick a placed item up, then tap the pool to hand it back. */
function returnToPool(text: string) {
  fireEvent.click(itemIn(chain(), text));
  fireEvent.click(pool());
}
function factorsShownAsUsed(): string[] {
  const heading = screen.queryByText('Stuðlar notaðir:');
  if (!heading) return [];
  return within(heading.parentElement as HTMLElement)
    .getAllByRole('button')
    .map((b) => b.textContent ?? '');
}

afterEach(cleanup);

describe('Level 2 — returning a factor to the pool', () => {
  it('takes the factor out of the chain the student sees', () => {
    render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} initialProgress={{ ...STARTED }} />);

    placeInChain(INVERTED);
    placeInChain(CORRECT);
    expect(factorsShownAsUsed()).toEqual([INVERTED, CORRECT]);

    returnToPool(INVERTED);
    expect(factorsShownAsUsed()).toEqual([CORRECT]);
    expect(itemIn(pool(), INVERTED)).toBeTruthy();
  });

  it('grades the chain without the returned factor', () => {
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

    // A wrong first step, corrected by taking it back out. Left in, it would
    // put the right factor second and fail the path check.
    placeInChain(INVERTED);
    placeInChain(CORRECT);
    returnToPool(INVERTED);

    fireEvent.change(screen.getByPlaceholderText('Sláðu inn svar'), { target: { value: '0,5' } });
    fireEvent.click(screen.getByRole('button', { name: /Athuga svar/ }));

    expect(onIncorrect).not.toHaveBeenCalled();
    expect(onCorrect).toHaveBeenCalledTimes(1);
  });

  it('empties the chain when its only factor goes back', () => {
    render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} initialProgress={{ ...STARTED }} />);

    placeInChain(CORRECT);
    fireEvent.change(screen.getByPlaceholderText('Sláðu inn svar'), { target: { value: '0,5' } });
    expect(screen.getByRole('button', { name: /Athuga svar/ })).not.toHaveProperty(
      'disabled',
      true
    );

    returnToPool(CORRECT);
    expect(factorsShownAsUsed()).toEqual([]);
    // Nothing left to grade, so there is nothing to submit.
    expect(screen.getByRole('button', { name: /Athuga svar/ })).toHaveProperty('disabled', true);
  });
});
