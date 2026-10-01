// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { Level1 } from '../components/Level1';

/**
 * Stig 1 asked `Hvað er oxunartala X í þessari sameind?` of all ten formulas, and three are
 * not molecules: NaCl and CuSO₄ are ionic compounds and Cr₂O₇²⁻ is an ion (decisions item 85).
 * A formula is now an `efnasamband` and an ion a `jón`. Queries are scoped to the rendered
 * container (vitest `retry: 2`, no RTL auto-cleanup).
 */
const t = (key: string, fallback?: string) => fallback ?? key;

clockPastNextGuard();
afterEach(cleanup);

// The ten questions in the order the level serves them, with their answers.
const QUESTIONS: [formula: string, answer: number, noun: string][] = [
  ['NaCl', -1, 'í þessu efnasambandi?'],
  ['H₂O', -2, 'í þessu efnasambandi?'],
  ['CO₂', 4, 'í þessu efnasambandi?'],
  ['Fe₂O₃', 3, 'í þessu efnasambandi?'],
  ['H₂SO₄', 6, 'í þessu efnasambandi?'],
  ['KMnO₄', 7, 'í þessu efnasambandi?'],
  ['NH₃', -3, 'í þessu efnasambandi?'],
  ['HNO₃', 5, 'í þessu efnasambandi?'],
  ['CuSO₄', 2, 'í þessu efnasambandi?'],
  ['Cr₂O₇²⁻', 6, 'í þessari jón?'],
];

describe('Stig 1 names what each formula is', () => {
  it('asks about a compound or an ion, never a molecule', () => {
    const { container } = render(<Level1 t={t} onComplete={vi.fn()} onBack={vi.fn()} />);
    const view = within(container);
    for (let i = 0; i < 5; i++) fireEvent.click(view.getByRole('button', { name: /Næsta/ }));
    fireEvent.click(view.getByRole('button', { name: /Byrja æfingar/ }));

    for (const [formula, answer, noun] of QUESTIONS) {
      expect(container.textContent, formula).toContain(formula);
      expect(container.textContent, formula).toContain(noun);
      expect(container.textContent, formula).not.toContain('í þessari sameind');
      fireEvent.change(view.getByRole('spinbutton', { name: 'Oxunartala' }), {
        target: { value: String(answer) },
      });
      fireEvent.click(view.getByRole('button', { name: 'Athuga svar' }));
      const next = view.queryByRole('button', { name: /Næsta spurning/ });
      if (next) fireEvent.click(next);
    }
  });
});
