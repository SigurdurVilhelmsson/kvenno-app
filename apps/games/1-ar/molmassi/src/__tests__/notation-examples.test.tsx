// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import {
  Level2,
  answerInputMode,
  generateAllProblems,
  unreadableAnswerMessage,
} from '../components/Level2';
import { Level3, buildProblem, DESCRIPTORS } from '../components/Level3';
import { parseScientificAnswer } from '../utils/parseAnswer';

/**
 * The examples that show how to write a number must not be answers.
 *
 * Stig 3's field said `t.d. 1,2e24 eða 22,0`, and its help line and its error
 * repeated `1,2e24`. Five of its six mass-to-molecules problems come to
 * 1,20 × 10²⁴ (36 g of water, 88 g of CO₂, 117 g of NaCl, 34 g of NH₃, 64 g of
 * O₂ — two moles each), and CO₂'s particles-to-mass problem comes to 22,0 g. A
 * student who typed the example was graded correct. Both levels grade at 5 %,
 * so an example within 5 % of a key is that key.
 *
 * Queries are scoped to the rendered container (the repo runs `retry: 2`).
 */

afterEach(cleanup);
clockPastNextGuard();

/** Every number written in a line of help text, as the grader reads it. */
function examplesIn(text: string): number[] {
  const written = text.match(/\d+(?:,\d+)?(?:e\d+|\s*×\s*10\^\d+)?/g) ?? [];
  return written.map((w) => {
    const value = parseScientificAnswer(w);
    expect(value, w).not.toBeNull();
    return value as number;
  });
}

function withinFivePercent(value: number, key: number): boolean {
  return Math.abs(value - key) / Math.abs(key) <= 0.05;
}

describe('Stig 3', () => {
  it('shows no example that is the answer to one of its problems', () => {
    const { container } = render(<Level3 onBack={vi.fn()} onComplete={vi.fn()} />);
    const ui = within(container);

    const field = ui.getByRole('textbox');
    const help = ui.getByText(/Hægt að nota vísisrithátt/).textContent ?? '';
    fireEvent.change(field, { target: { value: 'abc' } });
    fireEvent.click(ui.getByRole('button', { name: 'Svara' }));
    const error = ui.getByText(/Ógilt gildi/).textContent ?? '';

    const examples = [field.getAttribute('placeholder') ?? '', help, error].flatMap(examplesIn);
    expect(examples.length).toBeGreaterThan(0);

    for (const d of DESCRIPTORS) {
      const { question, answer } = buildProblem(d);
      for (const example of examples) {
        expect(withinFivePercent(example, answer), `${example} answers "${question}"`).toBe(false);
      }
    }
  });
});

describe('Stig 2', () => {
  it('shows no notation example that a molecule or atom count could equal', () => {
    // The help line and the full-keyboard error are only shown on the
    // Avogadro-scale questions; the third problem of a run is always one.
    const { container } = render(<Level2 onBack={vi.fn()} onComplete={vi.fn()} initialProgress />);
    const ui = within(container);
    for (let i = 0; i < 2; i++) {
      fireEvent.change(ui.getByRole('textbox'), { target: { value: '1' } });
      fireEvent.click(ui.getByRole('button', { name: 'Svara' }));
      fireEvent.click(ui.getByRole('button', { name: /Næsta/ }));
    }
    const help = ui.getByText(/Hægt að nota vísisrithátt/).textContent ?? '';

    const examples = [help, unreadableAnswerMessage('text')].flatMap(examplesIn);
    expect(examples.length).toBeGreaterThan(0);

    for (let run = 0; run < 300; run++) {
      for (const { correctAnswer, questionText } of generateAllProblems()) {
        if (answerInputMode(correctAnswer) !== 'text') continue;
        for (const example of examples) {
          expect(
            withinFivePercent(example, correctAnswer),
            `${example} answers "${questionText}"`
          ).toBe(false);
        }
      }
    }
  });
});
