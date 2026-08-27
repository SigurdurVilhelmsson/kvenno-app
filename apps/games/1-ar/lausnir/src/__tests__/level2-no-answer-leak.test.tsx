import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Level2, SCENARIOS } from '../components/Level2';

/**
 * B16: "half of Level 2's items display the answer before the student
 * answers". The concentration scenarios drew the "after" beaker fully — fill,
 * molecules, volume and molarity in words — dimmed to 30% opacity but perfectly
 * legible, before any answer was given.
 *
 * The temperature scenarios never did: `TemperatureComparison` draws its after
 * beaker at the *before* temperature until the answer is in, and that is the
 * behaviour this fix brings to the other half.
 *
 * The review's "half" was measured against a six-scenario level; the cooling
 * harvest has since taken it to twelve, of which five are concentration. The
 * defect was the same in all of them.
 */

const CONCENTRATION_SCENARIOS = SCENARIOS.filter((s) => s.type === 'concentration');

/** The before/after strip, so the assertion is not confused by the options. */
function visual(): HTMLElement {
  const el = document.querySelector('.flex.items-center.justify-center.gap-4.my-4');
  expect(el, 'the before/after visual is not on screen').not.toBeNull();
  return el as HTMLElement;
}

function answerCurrentScenario() {
  const options = screen
    .getAllByRole('button')
    .filter((b) => b.className.includes('rounded-xl border-2'));
  fireEvent.click(options[0]);
  fireEvent.click(screen.getByRole('button', { name: 'Staðfesta svar' }));
}

describe('Lausnir Level 2 does not show the answer before the student answers', () => {
  it('still has concentration scenarios to check', () => {
    expect(CONCENTRATION_SCENARIOS.length).toBe(5);
    expect(SCENARIOS.length).toBe(12);
  });

  it('draws the after beaker as unknown until the answer is in', () => {
    render(<Level2 onComplete={() => {}} onBack={() => {}} />);

    for (const scenario of SCENARIOS) {
      const isConcentration = scenario.type === 'concentration';

      if (isConcentration) {
        const after = scenario.visualAfter;
        const text = visual().textContent ?? '';

        expect(
          text,
          `the resulting molarity ${after.concentration.toFixed(1)} M is on screen before the student answers`
        ).not.toContain(`${after.concentration.toFixed(1)} M`);
        if (after.volumeML !== scenario.visualBefore.volumeML) {
          // Where the volume does not change it is part of the setup, not the
          // answer, and the before beaker legitimately shows it.
          expect(
            text,
            `the resulting volume ${after.volumeML} mL is on screen before the student answers`
          ).not.toContain(`${after.volumeML} mL`);
        }
        expect(text).toContain('? M');
        expect(screen.getByLabelText('Óþekkt')).toBeDefined();
      }

      answerCurrentScenario();

      if (isConcentration) {
        const after = scenario.visualAfter;
        const text = visual().textContent ?? '';
        // Revealed once committed — that is where the checking happens.
        expect(text).toContain(`${after.concentration.toFixed(1)} M`);
        expect(text).toContain(`${after.volumeML} mL`);
        expect(screen.queryByLabelText('Óþekkt')).toBeNull();
      }

      fireEvent.click(screen.getByRole('button', { name: /Næsta spurning|Ljúka Stigi 2/ }));
    }
  });
});
