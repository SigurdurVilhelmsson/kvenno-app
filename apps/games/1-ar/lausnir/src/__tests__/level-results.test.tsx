import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Level0Electrolytes } from '../components/Level0Electrolytes';
import { Level1 } from '../components/Level1';
import { Level2, SCENARIOS } from '../components/Level2';
import { Level3 } from '../components/Level3';
import { CLASSES, SOLUTES, classOf } from '../data/electrolytes';
import type { Problem } from '../types';
import { clockPastNextGuard } from './next-guard-clock';

/**
 * No points anywhere in Lausnir — mobile-pass decision 58 (b), item 1 (b)
 * applied to this game. No running score inside a level, and each level ends
 * with how many the student got right: `N af M rétt`. Stig 1 cannot be got
 * wrong (every challenge ends at the right concentration, and the readout goes
 * green first), so it reports completion instead. Stig 3 no longer holds back
 * "Ljúka stigi" below 5 of 8.
 *
 * Every level here is the real component, played through its buttons.
 */

// Stig 3's problems are random; record each one the real generator makes, so
// the test can look up the answer to the question on screen.
const generated: Problem[] = [];
vi.mock('../utils/problem-generator', async (importOriginal) => {
  const real = await importOriginal<typeof import('../utils/problem-generator')>();
  return {
    ...real,
    generateProblem: (...args: Parameters<typeof real.generateProblem>) => {
      const p = real.generateProblem(...args);
      generated.push(p);
      return p;
    },
  };
});

afterEach(cleanup);
clockPastNextGuard();

/** A running score: "Stig: 300", "300 stig", or a tally tile headed "Stig". */
function expectNoRunningScore(container: HTMLElement) {
  const text = container.textContent ?? '';
  expect(text).not.toMatch(/\bStig:\s*\d/);
  expect(text).not.toMatch(/\d+\s*stig\b/);
  expect(text).not.toMatch(/Heildarstig/);
  // The old header tiles were a number over the bare word "Stig".
  const tiles = [...container.querySelectorAll('div')].filter(
    (d) => d.children.length === 0 && d.textContent === 'Stig'
  );
  expect(tiles).toEqual([]);
}

describe('Stig 0 counts first answers and ends with "N af M rétt"', () => {
  it('counts only the right ones, shows no tally while playing, and reports the count', () => {
    const onComplete = vi.fn();
    const { container } = render(<Level0Electrolytes onComplete={onComplete} onBack={vi.fn()} />);
    const ui = within(container);
    fireEvent.click(ui.getByRole('button', { name: 'Byrja að flokka' }));

    let right = 0;
    SOLUTES.forEach((_, i) => {
      expectNoRunningScore(container);
      expect(container.textContent).not.toMatch(/·\s*\d+ rétt/);
      const formula = container.querySelector('[data-item-start]')?.textContent;
      const solute = SOLUTES.find((s) => s.formula === formula)!;
      const truth = classOf(solute);
      // Every third answered wrong.
      const pick =
        i % 3 === 2
          ? (Object.keys(CLASSES) as (keyof typeof CLASSES)[]).find((c) => c !== truth)!
          : truth;
      if (pick === truth) right++;
      fireEvent.click(ui.getByRole('button', { name: CLASSES[pick].name }));
      fireEvent.click(ui.getByRole('button', { name: /^(Næsta|Ljúka)/ }));
    });

    expect(right).toBeLessThan(SOLUTES.length);
    expect(container.textContent).toContain(`${right} af ${SOLUTES.length} rétt`);
    fireEvent.click(ui.getByRole('button', { name: 'Til baka í valmynd' }));
    expect(onComplete).toHaveBeenCalledWith(right, SOLUTES.length);
  });
});

describe('Stig 1 shows no score', () => {
  it('has no points counter while playing', () => {
    const { container } = render(<Level1 onComplete={vi.fn()} onBack={vi.fn()} />);
    expectNoRunningScore(container);
  });
});

describe('Stig 2 shows no running score and reports a count', () => {
  it('has no points or right-answer tally while playing, and reports right answers', () => {
    const onComplete = vi.fn();
    const { container } = render(<Level2 onComplete={onComplete} onBack={vi.fn()} />);
    let right = 0;
    SCENARIOS.forEach((scenario, i) => {
      expectNoRunningScore(container);
      const correct = i % 2 === 0;
      if (correct) right++;
      const option = scenario.options.find((o) => o.isCorrect === correct)!;
      fireEvent.click(screen.getByText(option.text).closest('button')!);
      fireEvent.click(screen.getByRole('button', { name: 'Staðfesta svar' }));
      expectNoRunningScore(container);
      // The header tile counts how far along, not how many right.
      expect(container.textContent).toContain(`${i + 1}/${SCENARIOS.length}Lokið`);
      fireEvent.click(screen.getByRole('button', { name: /Næsta spurning|Ljúka Stigi 2/ }));
    });
    expect(onComplete).toHaveBeenCalledWith(right, SCENARIOS.length);
  });
});

describe('Stig 3 counts right answers and never gates completion', () => {
  function play(rightAt: (i: number) => boolean) {
    generated.length = 0;
    const onComplete = vi.fn();
    const { container } = render(<Level3 onComplete={onComplete} onBack={vi.fn()} />);
    const ui = within(container);
    for (let i = 0; i < 8; i++) {
      expectNoRunningScore(container);
      // The old header showed "N/8" over "Rétt".
      expect(container.textContent).not.toMatch(/\d\/8Rétt/);
      const question = container.querySelector('p.text-lg')?.textContent;
      const problem = generated.find((p) => p.question === question)!;
      // A wrong answer is a third of the right one: positive and in range, so
      // the field takes it.
      const value = rightAt(i) ? problem.answer : problem.answer / 3;
      const typed = String(value).replace('.', ',');
      fireEvent.change(ui.getByRole('textbox'), { target: { value: typed } });
      fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));
      fireEvent.click(ui.getByRole('button', { name: /Næsta dæmi|Sjá niðurstöður/ }));
    }
    return { onComplete, container, ui };
  }

  it('reports 3 of 8 when three are right', () => {
    const { onComplete, container, ui } = play((i) => i < 3);
    expect(container.textContent).toContain('3 af 8 rétt');
    fireEvent.click(ui.getByRole('button', { name: 'Ljúka stigi →' }));
    expect(onComplete).toHaveBeenCalledWith(3, 8);
  });

  it('offers "Ljúka stigi" at 0 of 8 too, where it used to need 5', () => {
    const { onComplete, container, ui } = play(() => false);
    expect(container.textContent).toContain('0 af 8 rétt');
    fireEvent.click(ui.getByRole('button', { name: 'Ljúka stigi →' }));
    expect(onComplete).toHaveBeenCalledWith(0, 8);
  });
});
