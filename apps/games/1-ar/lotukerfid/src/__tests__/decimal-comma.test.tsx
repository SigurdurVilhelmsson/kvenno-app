import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Level1 } from '../components/Level1';
import { generateQuestions as level2Questions } from '../components/Level2';
import { Level3 } from '../components/Level3';
import { PeriodicTable } from '../components/PeriodicTable';
import { ELEMENTS } from '../data/elements';

/**
 * Every number a student reads in this game is written with the Icelandic
 * decimal comma.
 *
 * **Why this exists.** Until 2026-09-23 every cell of the table printed its
 * mass as `12.0`, Stig 1's element card printed `15.999`, and Stig 2's order
 * explanation printed `(20.2)` — in the same game whose Stig 3 intro writes
 * `12,01`. The platform rule is `formatDecimal` from `@shared/utils`.
 */

const DECIMAL_POINT = /\d\.\d/;

/**
 * Every text node on screen that writes a decimal point. Checked node by node:
 * `body.textContent` runs a sentence's closing `18.` into the next element's
 * `2` and reports a number nobody printed.
 */
function decimalPointsOnScreen(): string[] {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const found: string[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (DECIMAL_POINT.test(node.textContent ?? '')) found.push(node.textContent!);
  }
  return found;
}

function playNext() {
  fireEvent.click(screen.getByRole('button', { name: /Næsta spurning|Sjá niðurstöður/ }));
}

describe('decimal comma', () => {
  it('every cell of the table prints its mass with a comma', () => {
    render(<PeriodicTable interactive={false} />);
    const grid = screen.getByRole('grid', { name: 'Lotukerfið' });
    expect(grid.textContent).not.toMatch(DECIMAL_POINT);

    const carbon = screen.getByRole('button', { name: /\(C\), sætistala 6,/ });
    expect(carbon.textContent).toContain('12,0');
    // Every element's mass is on screen, not just carbon's.
    expect(within(grid).getAllByText(/^\d+,\d$/)).toHaveLength(ELEMENTS.length);
  });

  it('Stig 2 writes no decimal point in a question, option or explanation', () => {
    for (let run = 0; run < 200; run++) {
      for (const q of level2Questions()) {
        for (const text of [q.text, q.explanation, ...q.options]) {
          expect(text).not.toMatch(DECIMAL_POINT);
        }
      }
    }
  });

  it('Stig 1 prints the element card with a comma', () => {
    render(<Level1 onBack={() => {}} onComplete={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja æfingar/ }));

    for (let i = 0; i < 10; i++) {
      const option = document.querySelector<HTMLButtonElement>('div.grid.grid-cols-2 > button');
      if (option) fireEvent.click(option);
      else fireEvent.click(screen.getByRole('button', { name: /\(H\), sætistala 1,/ }));

      const card = screen.getByText(/^Meðalatómmassi:/);
      expect(card.textContent).toMatch(/^Meðalatómmassi: \d+(,\d+)? amu$/);
      expect(decimalPointsOnScreen()).toEqual([]);
      playNext();
    }
  });

  it('Stig 3 shows no decimal point anywhere on a question screen', () => {
    render(<Level3 onBack={() => {}} onComplete={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja æfingar/ }));

    for (let i = 0; i < 8; i++) {
      expect(decimalPointsOnScreen()).toEqual([]);
      const input = screen.queryByPlaceholderText('t.d. 12');
      if (input) {
        fireEvent.change(input, { target: { value: '1' } });
        fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
      } else {
        fireEvent.click(screen.getByRole('button', { name: /\(H\), sætistala 1,/ }));
      }
      expect(decimalPointsOnScreen()).toEqual([]);
      playNext();
    }
  });
});
