import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { formatDecimal, parseStudentNumber } from '@shared/utils';

import { clockPastNextGuard } from './next-guard-clock';
import { Level2, SCENARIOS } from '../components/Level2';

// These tests press Næsta at once; step the clock past its 400 ms guard.
clockPastNextGuard();

/**
 * What Stig 2 tells the student after an answer, and what it reports when the
 * level ends, must agree with the scenarios themselves.
 *
 * Two defects this guards, both found in the 2026-09 mobile pass:
 *
 * - **The final score counted the last scenario twice.** `handleSubmit` adds
 *   100 when the answer is checked, and `handleNext` added it again on the way
 *   out, so a perfect 12 of 12 reported 1300.
 * - **Scenario 1's summary contradicted the scenario.** "Samantekt á
 *   breytingum" turns the particle count back into a molarity, and scenario 1
 *   stored 40 particles in 100 mL of what its prose calls 2,0 M — so the panel
 *   said 4,00 M before and 2,00 M after, against options that give 1,0 M.
 */

afterEach(cleanup);

/** Pick an option by whether it is the right one, then check it. */
function answer(scenarioIndex: number, correct: boolean) {
  const option = SCENARIOS[scenarioIndex].options.find((o) => o.isCorrect === correct);
  if (!option) throw new Error(`scenario ${scenarioIndex + 1} has no such option`);
  const button = screen.getByText(option.text).closest('button');
  if (!button) throw new Error(`no button for "${option.text}"`);
  fireEvent.click(button);
  fireEvent.click(screen.getByRole('button', { name: 'Staðfesta svar' }));
}

function next() {
  fireEvent.click(screen.getByRole('button', { name: /Næsta spurning|Ljúka Stigi 2/ }));
}

describe('Stig 2 reports the score the student earned', () => {
  it('a perfect run reports 100 per scenario, not one extra', () => {
    const onComplete = vi.fn();
    render(<Level2 onComplete={onComplete} onBack={() => {}} />);
    SCENARIOS.forEach((_, i) => {
      answer(i, true);
      next();
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(SCENARIOS.length * 100);
  });

  it('a run with only the last scenario right reports 100', () => {
    const onComplete = vi.fn();
    render(<Level2 onComplete={onComplete} onBack={() => {}} />);
    SCENARIOS.forEach((_, i) => {
      answer(i, i === SCENARIOS.length - 1);
      next();
    });
    expect(onComplete).toHaveBeenCalledWith(100);
  });
});

describe('the concentration summary agrees with its scenario', () => {
  const concentration = SCENARIOS.map((s, index) => ({ s, index })).filter(
    ({ s }) => s.type === 'concentration'
  );

  it('still has concentration scenarios to check', () => {
    expect(concentration.length).toBe(5);
  });

  it.each(concentration.map(({ s, index }) => [s.id, index] as const))(
    'scenario %i: the molarity it states is the one the panel shows',
    (_id, index) => {
      const scenario = SCENARIOS[index];
      if (scenario.type !== 'concentration') throw new Error('filtered above');
      // The first molarity the setup names is the starting solution's.
      const stated = scenario.setup.match(/([\d,]+) M\b/);
      expect(stated, scenario.setup).not.toBeNull();
      expect(parseStudentNumber(stated![1])).toBe(scenario.visualBefore.concentration);

      render(<Level2 onComplete={() => {}} onBack={() => {}} />);
      for (let i = 0; i < index; i++) {
        answer(i, true);
        next();
      }
      answer(index, true);

      const heading = screen.getByText('Samantekt á breytingum:');
      const panel = heading.parentElement!.textContent ?? '';
      const before = `${formatDecimal(scenario.visualBefore.concentration, 2)} M`;
      const after = `${formatDecimal(scenario.visualAfter.concentration, 2)} M`;
      expect(panel, `summary: ${panel}`).toContain(before);
      expect(panel, `summary: ${panel}`).toContain(after);
    }
  );
});
