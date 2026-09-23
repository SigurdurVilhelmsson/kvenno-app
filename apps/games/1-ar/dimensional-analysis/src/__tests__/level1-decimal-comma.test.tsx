// @vitest-environment jsdom
/**
 * Stig 1 prints every non-integer a student reads with the Icelandic decimal
 * comma, as the platform does everywhere else (`formatDecimal` in
 * `@shared/utils`). It printed `0.5`, `+0.1`, `-0.5`, `0.25 L`, `2.0` and
 * `0.005 kg` — and read `Bæta við 0.5 lítra` to a screen reader.
 *
 * Each challenge is driven to the screens that print a fraction of a unit and
 * the whole of what it renders is scanned, visible text and accessible names
 * both. C1's balance scale is left out: it is drawn by `EquivalenceDisplay` in
 * `UnitBlock.tsx`, which Stig 2 shares, so it is held there and not here.
 */

import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CancellationChallenge } from '../components/challenges/CancellationChallenge';
import { EquivalenceChallenge } from '../components/challenges/EquivalenceChallenge';
import { FactorBuildingChallenge } from '../components/challenges/FactorBuildingChallenge';

const DECIMAL_POINT = /\d\.\d/;

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

/** Everything a student reads or hears inside `root`. */
function readable(root: HTMLElement): string {
  const labels = Array.from(root.querySelectorAll('[aria-label]')).map(
    (el) => el.getAttribute('aria-label') ?? ''
  );
  return [root.textContent ?? '', ...labels].join(' | ');
}

function expectCommas(root: HTMLElement, where: string) {
  const text = readable(root);
  expect(text.match(DECIMAL_POINT)?.[0], `${where}: ${text}`).toBeUndefined();
}

const noop = () => {};

describe('Stig 1 prints the decimal comma', () => {
  it('C1: the value, the six step buttons and their accessible names', () => {
    const { container } = render(<EquivalenceChallenge onComplete={noop} onAttempt={noop} />);
    const ui = within(container);
    const controls = ui.getByText('Hversu margir lítrar jafngilda 1000 mL?').parentElement!;
    expectCommas(controls, 'C1 before any tap');

    fireEvent.click(ui.getByRole('button', { name: /^Bæta við 0[.,]5 lítra$/ }));
    expect(controls.textContent).toContain('0,5');
    expectCommas(controls, 'C1 at half a litre');

    const buttons = within(controls)
      .getAllByRole('button')
      .map((b) => b.textContent);
    expect(buttons).toEqual(['-1', '-0,5', '-0,1', '+0,1', '+0,5', '+1']);
  });

  it('C2: the blocks, the fraction and all three verdicts', () => {
    const { container } = render(<FactorBuildingChallenge onComplete={noop} onAttempt={noop} />);
    const ui = within(container);
    const block = (name: RegExp) => fireEvent.click(ui.getByRole('button', { name }));
    const halfLitre = /^0[.,]5 L$/;

    expect(ui.getByRole('button', { name: halfLitre }).textContent).toBe('0,5 L');
    expectCommas(container, 'C2 before any tap');

    block(/^1 L$/);
    block(halfLitre);
    expect(ui.getByText('Sömu einingarnar!')).toBeTruthy();
    expect(container.textContent).toContain('1 L / 0,5 L = 2,0');
    expectCommas(container, 'C2 same unit');

    block(/^1000 mL$/); // a third tap starts a new fraction
    block(halfLitre);
    expect(ui.getByText('Ekki sama rúmmálið!')).toBeTruthy();
    expectCommas(container, 'C2 wrong ratio');

    block(/^500 mL$/);
    block(halfLitre);
    expect(container.textContent).toContain('500 mL og 0,5 L er sama rúmmálið!');
    expectCommas(container, 'C2 solved');
  });

  it('C3: the result and the worked line, at 250 mL', () => {
    // Math.random → 0 draws the first starting value, 250 mL.
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const { container } = render(
      <CancellationChallenge variant="mL-to-L" onComplete={noop} onAttempt={noop} />
    );
    const ui = within(container);
    const correct = ui.getAllByRole('button').find((b) => b.textContent === '1 L1000 mL');
    fireEvent.click(correct!);
    act(() => {
      vi.advanceTimersByTime(1600);
    });
    expect(container.textContent).toContain('0,25 L');
    expectCommas(container, 'C3 solved');
  });

  it('C5: the chain and its final line', () => {
    const { container } = render(
      <CancellationChallenge variant="mg-to-kg" onComplete={noop} onAttempt={noop} />
    );
    const ui = within(container);
    for (const text of ['1 g1000 mg', '1 kg1000 g']) {
      fireEvent.click(ui.getAllByRole('button').find((b) => b.textContent === text)!);
      act(() => {
        vi.advanceTimersByTime(900);
      });
    }
    expect(ui.getByText('Keðjan virkaði!')).toBeTruthy();
    expect(container.textContent).toContain('0,005 kg');
    expectCommas(container, 'C5 solved');
  });
});
