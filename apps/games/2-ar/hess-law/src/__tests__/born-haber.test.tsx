// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Level2 } from '../components/Level2';
import { CSF_CYCLE, CSF_LATTICE, PUZZLES } from '../data/puzzles';

/**
 * Born-Haber as a Hess cycle (year-2 plan, Phase 4; Siggi, 2026-11-15). The book builds the
 * cycle for caesium fluoride in kafli 7 (m68741, „Styrkur jóna- og samgildra tengja“) and gets a
 * lattice energy of 756,9 kJ/mól. These tests hold the two puzzles to the book's numbers and
 * play the first one through the real cards.
 */

afterEach(cleanup);

const bornHaber = PUZZLES.filter((p) => p.source);

describe('the CsF cycle', () => {
  it('uses the book’s five steps', () => {
    expect(CSF_CYCLE).toEqual({
      sublimation: 76.5,
      halfBond: 79.4,
      ionisation: 375.7,
      electronAffinity: -328.2,
      formation: -553.5,
    });
  });

  it('gives the book’s lattice energy', () => {
    expect(CSF_LATTICE).toBe(756.9);
  });

  it('is two puzzles, both citing kafli 7', () => {
    expect(bornHaber.map((p) => p.targetDeltaH)).toEqual([756.9, -328.2]);
    for (const p of bornHaber) expect(p.source).toMatch(/^Kafli 7, .*Born-Haber/);
  });

  it('names each step on its card', () => {
    for (const p of bornHaber) {
      for (const eq of p.availableEquations) expect(eq.step, `${p.id} ${eq.id}`).toBeTruthy();
    }
  });
});

describe('the lattice-energy puzzle, played', () => {
  it('is solved by the four steps forward and formation reversed', () => {
    const puzzle = bornHaber[0];
    const index = PUZZLES.indexOf(puzzle);
    const view = render(<Level2 onComplete={() => {}} onBack={() => {}} />);
    const page = within(view.container);
    fireEvent.click(page.getByRole('button', { name: String(index + 1) }));
    expect(view.container.textContent).toContain('Jónunarorka sesíns');
    const cards = Array.from(view.container.querySelectorAll<HTMLElement>('[data-equation-card]'));
    expect(cards).toHaveLength(5);
    fireEvent.click(within(cards[4]).getByRole('button', { name: 'Snúa við jöfnu' }));
    for (const card of cards) fireEvent.click(card);
    fireEvent.click(page.getByRole('button', { name: 'Athuga lausn' }));
    expect(page.getByText(/✓ Rétt!/)).toBeTruthy();
  });
});
