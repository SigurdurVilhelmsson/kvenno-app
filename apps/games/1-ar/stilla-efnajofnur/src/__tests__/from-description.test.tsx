// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { parseFormula } from '@shared/utils';

import { clockPastNextGuard } from './next-guard-clock';
import {
  DESCRIPTION_ITEMS,
  FromDescription,
  chipsFor,
  equationText,
  judgePick,
} from '../components/FromDescription';
import { DESCRIBED_REACTIONS, label, type Species } from '../data/descriptions';
import { checkBalance } from '../utils/balanceChecker';

clockPastNextGuard();

/**
 * "Frá lýsingu til jöfnu", year-1 plan item 17: the book's word problems
 * (ch04/m68709) with states. The data's coefficients are held to the atoms,
 * every description names each state it asks for, and a run can be played
 * through the real buttons.
 */

const atoms = (s: Species) => s.elements;
const asMolecules = (list: Species[]) =>
  list.map((s) => ({ formula: s.formula, elements: atoms(s), coefficient: s.coefficient }));

describe('the described reactions', () => {
  it('are balanced, in lowest terms, and within the steppers', () => {
    for (const r of DESCRIBED_REACTIONS) {
      const result = checkBalance(
        asMolecules(r.reactants),
        asMolecules(r.products),
        r.reactants.map((s) => s.coefficient),
        r.products.map((s) => s.coefficient)
      );
      expect(result.isBalanced && result.isReduced, r.id).toBe(true);
      for (const s of [...r.reactants, ...r.products]) expect(s.coefficient).toBeLessThanOrEqual(9);
    }
  });

  it('write out the atoms each formula holds', () => {
    for (const r of DESCRIBED_REACTIONS) {
      for (const s of [...r.reactants, ...r.products]) {
        if (s.formula.includes('(')) continue;
        const parsed: Record<string, number> = {};
        for (const e of parseFormula(s.formula))
          parsed[e.symbol] = (parsed[e.symbol] ?? 0) + e.count;
        expect(s.elements, `${r.id}: ${s.formula}`).toEqual(parsed);
      }
    }
  });

  it('say each state they ask for, in words', () => {
    const words = {
      s: /fast|bráð/i,
      l: /fljótandi|bráð|vatn\b/i,
      g: /gas|gufu/i,
      aq: /vatnslausn/i,
    };
    for (const r of DESCRIBED_REACTIONS) {
      for (const s of [...r.reactants, ...r.products]) {
        expect(r.description, `${r.id}: ${label(s.formula, s.state)}`).toMatch(words[s.state]);
      }
    }
  });

  it('offer each right substance beside its likeliest wrong state and a decoy formula', () => {
    for (const r of DESCRIBED_REACTIONS) {
      const all = [...chipsFor(r, 'reactants'), ...chipsFor(r, 'products')];
      for (const s of [...r.reactants, ...r.products])
        expect(all).toContain(label(s.formula, s.state));
      for (const d of r.decoys) expect(all).toContain(label(d.formula, d.state));
    }
  });
});

describe('judging the picked substances', () => {
  const r = DESCRIBED_REACTIONS.find((x) => x.id === 'na-vatn')!;
  const set = (...labels: string[]) => new Set(labels);

  it('passes the right set and names a wrong state by formula alone', () => {
    const reactants = set('Na(s)', 'H₂O(l)');
    expect(judgePick(r, { reactants, products: set('NaOH(aq)', 'H₂(g)') })).toBeNull();
    const wrongState = judgePick(r, { reactants, products: set('NaOH(s)', 'H₂(g)') })!;
    expect(wrongState).toMatch(/hamur NaOH/);
    expect(wrongState).not.toMatch(/\(aq\)/);
    expect(judgePick(r, { reactants, products: set('Na₂O(s)', 'H₂(g)') })).toMatch(/passa ekki/);
  });

  it('prints the balanced equation with its states', () => {
    expect(equationText(r)).toBe('2Na(s) + 2H₂O(l) → 2NaOH(aq) + H₂(g)');
  });
});

describe('the screen', () => {
  it('can be played to a perfect count', () => {
    const onComplete = vi.fn();
    render(<FromDescription onComplete={onComplete} onBack={vi.fn()} />);
    for (let q = 0; q < DESCRIPTION_ITEMS; q++) {
      const text = document.querySelector('[data-item-start] p')!.textContent;
      const r = DESCRIBED_REACTIONS.find((x) => x.description === text)!;
      for (const [side, heading] of [
        ['reactants', 'Hvarfefni (vinstra megin)'],
        ['products', 'Myndefni (hægra megin)'],
      ] as const) {
        const group = screen.getByRole('group', { name: heading });
        for (const s of r[side])
          fireEvent.click(within(group).getByRole('button', { name: label(s.formula, s.state) }));
      }
      fireEvent.click(screen.getByRole('button', { name: 'Athuga efnin' }));
      for (const s of [...r.reactants, ...r.products]) {
        const up = screen.getByRole('button', {
          name: `Hækka stuðul ${label(s.formula, s.state)}`,
        });
        for (let i = 1; i < s.coefficient; i++) fireEvent.click(up);
      }
      fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
      expect(screen.getByRole('group', { name: 'Niðurstaða' }).textContent).toContain(
        equationText(r)
      );
      fireEvent.click(screen.getByRole('button', { name: /Næsta lýsing|Sjá niðurstöður/ }));
    }
    expect(onComplete).toHaveBeenCalledWith(DESCRIPTION_ITEMS, DESCRIPTION_ITEMS);
  });
});
