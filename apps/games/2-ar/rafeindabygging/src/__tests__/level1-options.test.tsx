// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { Level1 } from '../components/Level1';
import { puzzles } from '../data/quantum-numbers';

/**
 * Stig 1's option cards.
 *
 * - The data lists every valid combination before every invalid one, and the
 *   level drew them in data order, so "tick the first two or three" passed all
 *   eight questions without reading a quantum number. It now shuffles per
 *   question — and grading has to read the shuffled list too, which is the half
 *   a careless fix leaves out (see docs/README.md on kinetics).
 * - mₛ was printed `+0.5` / `-0.5`: a decimal point, which the platform does not
 *   print, beside teaching text that writes +½ and −½ throughout.
 * - A card is a toggle, but its state was only a colour; it now says
 *   `aria-pressed`.
 *
 * Queries are scoped to this render's container: vitest runs with `retry: 2`
 * and no RTL auto-cleanup, so a failed attempt leaves its DOM behind.
 */

clockPastNextGuard();

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
  delete (Element.prototype as Partial<Element>).scrollIntoView;
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

function startPractice() {
  const onComplete = vi.fn();
  const rendered = render(<Level1 onComplete={onComplete} onBack={vi.fn()} />);
  const ui = within(rendered.container);
  for (const step of [/Sjáum dæmi/, /Eitt dæmi til/, /byrja æfingar/]) {
    fireEvent.click(ui.getByRole('button', { name: step }));
  }
  return { onComplete, ui, container: rendered.container };
}

function cards(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll<HTMLButtonElement>('button.quantum-card'));
}

/** Read a card back into numbers, whichever way it prints ½ or a minus sign. */
function readCard(card: HTMLElement): { l: number; ml: number; ms: number } {
  const text = card.textContent!.replace(/−/g, '-');
  const m = /l = (-?\d+),\s*mₗ = (-?\d+),\s*mₛ = ([+-]?)(½|[\d.]+)/.exec(text);
  if (!m) throw new Error(`unreadable card: ${card.textContent}`);
  const magnitude = m[4] === '½' ? 0.5 : Number(m[4]);
  return { l: Number(m[1]), ml: Number(m[2]), ms: m[3] === '-' ? -magnitude : magnitude };
}

/** Whether the combination on this card is valid, looked up in the data. */
function isValidCard(card: HTMLElement, index: number): boolean {
  const { l, ml, ms } = readCard(card);
  const option = puzzles[index].options.find((o) => o.l === l && o.ml === ml && o.ms === ms);
  if (!option) throw new Error(`card not in question ${index + 1}: ${card.textContent}`);
  return option.isValid;
}

/** Play the whole level, ticking the cards `choose` picks; returns the final score. */
function play(choose: (valid: boolean) => boolean, onEachQuestion?: (c: HTMLElement[]) => void) {
  const { onComplete, ui, container } = startPractice();
  puzzles.forEach((_, index) => {
    const shown = cards(container);
    onEachQuestion?.(shown);
    shown.forEach((card) => {
      if (choose(isValidCard(card, index))) fireEvent.click(card);
    });
    fireEvent.click(ui.getByRole('button', { name: /Athuga svar/ }));
    fireEvent.click(ui.getByRole('button', { name: /Næsta spurning|Ljúka stigi/ }));
  });
  expect(onComplete).toHaveBeenCalledTimes(1);
  return onComplete.mock.calls[0][0] as number;
}

describe('the order of the option cards', () => {
  it('is not "every valid card first", which the data order is on all eight questions', () => {
    // Pin the shuffle so the test cannot pass or fail by luck: with random() = 0
    // Fisher–Yates rotates the list left by one, moving a valid first option to
    // the end.
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const { container } = startPractice();
    const validFirstThenInvalid = (flags: boolean[]) =>
      flags.every((v, i) => i === 0 || Number(v) <= Number(flags[i - 1]));
    const flags = cards(container).map((c) => isValidCard(c, 0));
    expect(validFirstThenInvalid(flags)).toBe(false);
  });

  it('holds still while the student works on a question', () => {
    const { container } = startPractice();
    const before = cards(container).map((c) => c.textContent);
    fireEvent.click(cards(container)[0]);
    fireEvent.click(cards(container)[1]);
    expect(cards(container).map((c) => c.textContent)).toEqual(before);
  });
});

describe('grading the shuffled cards', () => {
  it('scores 8 of 8 when exactly the valid cards are ticked', () => {
    expect(play((valid) => valid)).toBe(8);
  });

  it('scores 0 when exactly the invalid cards are ticked', () => {
    expect(play((valid) => !valid)).toBe(0);
  });

  it('marks each card by its own validity after checking', () => {
    const { ui, container } = startPractice();
    const shown = cards(container);
    shown.forEach((card) => {
      if (isValidCard(card, 0)) fireEvent.click(card);
    });
    fireEvent.click(ui.getByRole('button', { name: /Athuga svar/ }));
    expect(container.textContent).toMatch(/Rétt!/);
    for (const card of cards(container)) {
      expect(card.textContent).toContain(isValidCard(card, 0) ? '✓ Gilt' : '✗ Ógilt');
    }
  });
});

describe('what a card says', () => {
  it('writes spin as +½ and −½, never with a decimal point', () => {
    play(
      (valid) => valid,
      (shown) => {
        for (const card of shown) {
          expect(card.textContent).not.toMatch(/\d\.\d/);
          expect(card.textContent).toMatch(/mₛ = ([+−]½|[+−]?\d)$/);
        }
      }
    );
  });

  it('tells assistive technology which cards are ticked', () => {
    const { container } = startPractice();
    const [card] = cards(container);
    expect(card.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(card);
    expect(card.getAttribute('aria-pressed')).toBe('true');
  });
});
