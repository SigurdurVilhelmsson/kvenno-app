// @vitest-environment jsdom
import { fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { advanceTo, answerAngle, answerCount, check, next, POOL, startLevel2 } from './level2-play';

/**
 * Stig 2's angle step read numbers with `/[\d.]+/` after stripping spaces, so
 * the Icelandic decimal comma split one angle in two (`107,6` → 107 and 6) and
 * a space glued two angles into one (`90 120` → 90120). `109,5` passed only
 * because 109 happens to sit inside the ±2° tolerance. Every angle on screen
 * was printed with a point, and the answer field's placeholder showed the
 * answer to three of the ten molecules.
 *
 * Queries are scoped to the rendered container (the repo runs vitest with
 * `retry: 2` and no RTL auto-cleanup), and the level is unmounted afterwards
 * so the repulsion animation's timers do not leak into the next test.
 */

let unmount: (() => void) | null = null;

beforeEach(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  unmount?.();
  unmount = null;
});

/** Start the level and stop on the angle step of molecule `index`. */
function atAngleStep(index: number) {
  const level = startLevel2();
  unmount = level.unmount;
  const { ui, container } = level;
  advanceTo(ui, container, index);
  const m = POOL[index];
  answerCount(ui, container, m.bondingPairs, m.lonePairs);
  next(ui);
  fireEvent.click(ui.getByRole('button', { name: m.shape }));
  check(ui);
  next(ui);
  return level;
}

const CH4 = POOL.findIndex((m) => m.formula === 'CH₄');
const PCL5 = POOL.findIndex((m) => m.formula === 'PCl₅');

describe('the angle step reads what a student types', () => {
  it('reads the decimal comma as a decimal comma', () => {
    // 107,6 is 1,9° from 109,5, inside the level's ±2°. Read as 107 and 6, it
    // was 2,5° out and marked wrong while 107.6 was marked right.
    const { ui, container } = atAngleStep(CH4);
    answerAngle(ui, container, '107,6');
    expect(ui.getByText(/Rétt! Tengihornið er/)).toBeTruthy();
  });

  it('reads two angles separated by a space', () => {
    const { ui, container } = atAngleStep(PCL5);
    answerAngle(ui, container, '90 120');
    expect(ui.getByText(/Rétt! Tengihornið er 90° og 120°/)).toBeTruthy();
  });

  it('still rejects an angle outside the tolerance', () => {
    const { ui, container } = atAngleStep(CH4);
    answerAngle(ui, container, '104,5');
    expect(ui.getByText(/Rétt svar:/)).toBeTruthy();
  });
});

describe('angles are printed with the decimal comma', () => {
  it('in the feedback, the diagram and the reference table', () => {
    const { ui, container } = atAngleStep(CH4);
    answerAngle(ui, container, '109,5');
    expect(ui.getByText(/Rétt! Tengihornið er 109,5°/)).toBeTruthy();
    expect(container.textContent).not.toMatch(/\d\.\d+\s*°/);
  });
});

describe('the answer field', () => {
  it('does not show an angle in its placeholder', () => {
    // It read "t.d. 109.5° eða 90° og 120°", which is the answer for CH₄,
    // PCl₅ and SF₄.
    for (const index of [CH4, PCL5]) {
      const { container } = atAngleStep(index);
      const field = container.querySelector('input[type=text]') as HTMLInputElement;
      expect(field.placeholder, POOL[index].formula).not.toMatch(/\d/);
      unmount?.();
      unmount = null;
    }
  });
});
