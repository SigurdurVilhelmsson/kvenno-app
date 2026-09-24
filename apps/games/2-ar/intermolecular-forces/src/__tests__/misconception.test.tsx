// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Level1 } from '../components/Level1';

/**
 * Stig 1's feedback carries a misconception note, the one line a student who reads nothing
 * else still sees, so it has to name the mistake the student actually made. Two common
 * mistakes fell through to a note about molar mass that answers neither:
 *
 * - choosing hydrogen bonds for chloroform, whose H is bound to C (the H-bond note says
 *   exactly that: "Ef H er bundið við C eða Cl, þá eru engin vetnistengi");
 * - leaving out London forces on a polar molecule (the polar note says London is always there).
 *
 * Buttons are found by their text rather than `getByRole`, which rebuilds the accessibility
 * tree on every call. Queries are scoped to the rendered container because the repo runs
 * vitest with `retry: 2` and no RTL auto-cleanup.
 */

const MOLAR_MASS_NOTE = 'eftir því sem mólmassi eykst';

function click(container: HTMLElement, text: RegExp) {
  const button = [...container.querySelectorAll('button')].find((b) =>
    text.test(b.textContent?.trim() ?? '')
  );
  if (!button) throw new Error(`no button matching ${text}`);
  fireEvent.click(button);
}

/** Open the quiz and answer 'London only' until `formula` is on screen. */
function quizAt(formula: string) {
  const { container } = render(<Level1 onComplete={vi.fn()} onBack={vi.fn()} />);
  click(container, /Hefja æfingar/);
  for (let i = 0; i < 10; i++) {
    if (container.querySelector('.text-4xl')!.textContent === formula) return container;
    click(container, /Veikastur$/);
    click(container, /^Athuga svar$/);
    click(container, /^Næsta sameind$/);
  }
  throw new Error(`${formula} never came up`);
}

describe('Stig 1 misconception note', () => {
  it('names the H-bond rule when a student gives chloroform hydrogen bonds', () => {
    const container = quizAt('CHCl₃');
    for (const force of [/Veikastur$/, /Meðal$/, /Sterkastur$/]) click(container, force);
    click(container, /^Athuga svar$/);

    expect(container.textContent).toContain('Ef H er bundið við C eða Cl');
    expect(container.textContent).not.toContain(MOLAR_MASS_NOTE);
  });

  it('says London is always present when a student leaves it out for water', () => {
    const container = quizAt('H₂O');
    for (const force of [/Meðal$/, /Sterkastur$/]) click(container, force);
    click(container, /^Athuga svar$/);

    expect(container.textContent).toContain('London er ALLTAF til staðar!');
    expect(container.textContent).not.toContain(MOLAR_MASS_NOTE);
  });
});
