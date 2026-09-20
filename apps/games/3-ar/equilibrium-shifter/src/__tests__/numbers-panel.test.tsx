import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { NumbersPanel } from '../components/NumbersPanel';
import { CONSTANTS, STARTING_MIXTURES } from '../data/constants';
import { equilibria } from '../data/equilibria';
import { applyStress } from '../engine/stress';
import type { Stress } from '../types';

/**
 * The panel has to show what it computed, not a picture of the conclusion.
 *
 * That distinction is the whole reason it exists: `QKComparison` drew two bars
 * whose widths came from the answer, so a student could read the shift
 * direction off it and learn nothing about why.
 */

const byId = (id: number) => equilibria.find((e) => e.id === id)!;

function draw(id: number, stress: Stress) {
  const e = byId(id);
  const outcome = applyStress(e, CONSTANTS[id], STARTING_MIXTURES[id], stress)!;
  render(
    <NumbersPanel
      outcome={outcome}
      constant={CONSTANTS[id]}
      order={[...e.reactants.map((m) => m.formula), ...e.products.map((m) => m.formula)]}
    />
  );
  return outcome;
}

afterEach(cleanup);

describe('the numbers panel', () => {
  it('names where the constant came from', () => {
    draw(11, { type: 'add-reactant', target: 'N₂' });
    expect(screen.getByText(/Efnafræði 2e, kafli 13/)).toBeTruthy();
    expect(screen.getByText(/Kc = 0,5/)).toBeTruthy();
  });

  it('says the mixture moved, for a concentration stress', () => {
    draw(11, { type: 'add-reactant', target: 'N₂' });
    expect(screen.getByText(/Álagið færði Q, ekki K/)).toBeTruthy();
    expect(screen.getByText('Q < K')).toBeTruthy();
  });

  it('says K moved, for a temperature stress', () => {
    const out = draw(11, { type: 'increase-temp', target: null });
    expect(screen.getByText(/Hitabreytingin færði K sjálfan/)).toBeTruthy();
    // And the mixture is reported as untouched, every row of it.
    expect(screen.getAllByText('óbreytt').length).toBe(Object.keys(out.before).length);
  });

  it('distinguishes an unmeasurable temperature change from an inert one', () => {
    draw(3, { type: 'increase-temp', target: null });
    expect(screen.getByText(/Hún er ekki núll; hún er ómæld/)).toBeTruthy();
    cleanup();
    draw(3, { type: 'add-catalyst', target: null });
    expect(screen.getByText(/Hvorugt hreyfðist/)).toBeTruthy();
  });

  it('shows a settled new equilibrium rather than a dash', () => {
    draw(11, { type: 'add-reactant', target: 'N₂' });
    // Four species, each with a before / after-stress / new-equilibrium cell;
    // none of the new-equilibrium cells may be the "could not solve" dash.
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows.length).toBe(3);
    for (const row of rows) {
      const cells = row.querySelectorAll('td');
      expect(cells[3].textContent).not.toBe('—');
    }
  });

  it('renders every shipped system and stress without throwing', () => {
    let drawn = 0;
    for (const e of equilibria) {
      const constant = CONSTANTS[e.id];
      const start = STARTING_MIXTURES[e.id];
      if (!constant || !start) continue;
      for (const stress of e.possibleStresses) {
        const outcome = applyStress(e, constant, start, stress);
        if (!outcome) continue;
        render(
          <NumbersPanel
            outcome={outcome}
            constant={constant}
            order={[...e.reactants.map((m) => m.formula), ...e.products.map((m) => m.formula)]}
          />
        );
        // Nothing may render as NaN — the failure mode a log scale invites.
        expect(document.body.textContent, `${e.id} ${stress.type}`).not.toMatch(/NaN/);
        cleanup();
        drawn += 1;
      }
    }
    expect(drawn).toBeGreaterThan(80);
  });
});
