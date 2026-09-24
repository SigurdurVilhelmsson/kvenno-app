// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Level3 } from '../components/Level3';

/**
 * Stig 3 rendered its options in data order. The answer sat at b in six of
 * the twelve questions and at d in none, so position alone beat chance. The
 * level now shuffles per question, as Stig 1 already did.
 *
 * The ids double as the visible letters and are reassigned by position, so
 * grading has to look the clicked id up in the shuffled list; a half-done fix
 * that grades against the data order marks the green option "Rangt". These
 * tests read correctness from the screen — the green option — so they hold the
 * verdict and the highlight to each other.
 *
 * Its polarity card also listed "H₂O (beygð) → skautuð" beneath the question
 * "Er vatn (H₂O) skautuð eða óskautuð sameind?"; the example for the molecule
 * on screen is now held back until the question is answered.
 *
 * Queries are scoped to the rendered container (the repo runs vitest with
 * `retry: 2` and no RTL auto-cleanup).
 */

let unmount: (() => void) | null = null;

beforeEach(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

afterEach(() => {
  unmount?.();
  unmount = null;
});

function start() {
  const onComplete = vi.fn();
  const rendered = render(<Level3 onComplete={onComplete} onBack={vi.fn()} />);
  unmount = rendered.unmount;
  return { ui: within(rendered.container), container: rendered.container, onComplete };
}

const optionButtons = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('button')).filter((b) =>
    /^[a-d]\./.test(b.textContent?.trim() ?? '')
  );

/** Answer with the option at `position`; return where the correct one was. */
function answer(ui: ReturnType<typeof within>, container: HTMLElement, position: number) {
  fireEvent.click(optionButtons(container)[position]);
  fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
  const correctAt = optionButtons(container).findIndex((b) =>
    b.className.includes('border-green-500')
  );
  const verdict = ui.getByText(/^(Rétt!|Rangt)$/).textContent;
  return { correctAt, verdict };
}

const advance = (ui: ReturnType<typeof within>) =>
  fireEvent.click(ui.getByRole('button', { name: /Næsta spurning|Ljúka stigi 3/ }));

describe('Stig 3 shuffles its options', () => {
  it('does not keep the answer in one place', () => {
    // Question 1 has its answer at c in the data. The chance that 30 mounts
    // all put it in the same place by luck is 4 × 4^-30.
    const positions = new Set<number>();
    for (let mount = 0; mount < 30; mount++) {
      const { ui, container } = start();
      positions.add(answer(ui, container, 0).correctAt);
      unmount?.();
      unmount = null;
    }
    expect(positions.size).toBeGreaterThan(1);
  });

  it('still labels the buttons a, b, c, d in order', () => {
    const { container } = start();
    expect(optionButtons(container).map((b) => b.textContent!.trim()[0])).toEqual([
      'a',
      'b',
      'c',
      'd',
    ]);
  });
});

describe('grading follows the shuffle', () => {
  it('says Rétt! exactly when the clicked option is the green one, and scores it', () => {
    for (let run = 0; run < 3; run++) {
      const { ui, container, onComplete } = start();
      let right = 0;
      for (let q = 0; q < 12; q++) {
        const position = (q + run) % 4;
        const { correctAt, verdict } = answer(ui, container, position);
        expect(correctAt, `question ${q + 1}`).toBeGreaterThanOrEqual(0);
        expect(verdict, `question ${q + 1}`).toBe(correctAt === position ? 'Rétt!' : 'Rangt');
        if (correctAt === position) right++;
        advance(ui);
      }
      expect(onComplete).toHaveBeenCalledWith(right * 12);
      unmount?.();
      unmount = null;
    }
  });
});

describe('the polarity card', () => {
  it('does not answer the question on screen', () => {
    const { ui, container } = start();
    // Questions 1–4 are hybridization; question 5 asks whether water is polar.
    for (let q = 0; q < 4; q++) {
      answer(ui, container, 0);
      advance(ui);
    }
    expect(ui.getByText(/Er vatn \(H₂O\) skautuð/)).toBeTruthy();
    expect(container.textContent).not.toContain('H₂O (beygð) → skautuð');
    // The other examples stay, and this one returns once answered.
    expect(container.textContent).toContain('CO₂ (línuleg) → óskautuð');
    answer(ui, container, 0);
    expect(container.textContent).toContain('H₂O (beygð) → skautuð');
  });
});
