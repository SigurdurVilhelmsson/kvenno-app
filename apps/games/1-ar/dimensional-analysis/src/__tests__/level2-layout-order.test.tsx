// @vitest-environment jsdom
/**
 * Level 2: nothing that changes when a factor is chosen sits above the control
 * that chose it.
 *
 * The "Stuðlar notaðir" panel mounts on the first factor, and the unit
 * visualiser grows and shrinks as it animates. Both used to sit above the
 * factor buttons and the drag builder, so on a portrait phone choosing a factor
 * pushed the button just tapped about 170 px down under the finger, and taking
 * the last one out pulled it back up. They now follow the controls. The
 * browser measurement lives with the mobile pass; this holds the order.
 */

import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { Level2 } from '../components/Level2';
import { level2Problems } from '../data/problems';

const label = (factor: string) => factor.split(' / ').join('');

function renderLevel() {
  render(
    <Level2
      onComplete={vi.fn()}
      onBack={vi.fn()}
      initialProgress={{ problemsCompleted: 0, finalAnswersCorrect: 0, mastered: false }}
    />
  );
}
function precedes(a: Element, b: Element): boolean {
  return (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
}
/** Everything a chosen factor changes. */
function reactiveParts(): Element[] {
  return [screen.getByText('Stuðlar notaðir:'), screen.getByText('Eins einingar strikast út')];
}

afterEach(cleanup);

describe('Level 2 — the chain shows below the controls that build it', () => {
  it('in click mode', () => {
    renderLevel();
    fireEvent.click(screen.getByRole('button', { name: /Skipta í smella-ham/ }));
    const factor = label(level2Problems[0].correctPath[0]);
    const button = screen.getAllByRole('button').find((b) => b.textContent === factor)!;
    fireEvent.click(button);

    // The click-mode grid: the buttons under its instruction line.
    const instruction = screen.getByText(
      (_, el) => el?.tagName === 'P' && /umbreytingarstuð.*:$/.test(el.textContent ?? '')
    );
    const buttons = [...(instruction.nextElementSibling as HTMLElement).querySelectorAll('button')];
    expect(buttons.length).toBeGreaterThan(1);
    for (const part of reactiveParts()) {
      for (const b of buttons) expect(precedes(b, part)).toBe(true);
    }
  });

  it('in drag mode', () => {
    renderLevel();
    const pool = document.querySelector('.items-pool') as HTMLElement;
    const zone = document.querySelector('[data-zone-id="conversion-chain"]') as HTMLElement;
    const factor = label(level2Problems[0].correctPath[0]);
    fireEvent.click(
      [...pool.querySelectorAll('[data-item-id]')].find((el) => el.textContent === factor)!
    );
    fireEvent.click(zone);

    for (const part of reactiveParts()) {
      expect(precedes(pool, part)).toBe(true);
      expect(precedes(zone, part)).toBe(true);
    }
  });
});
