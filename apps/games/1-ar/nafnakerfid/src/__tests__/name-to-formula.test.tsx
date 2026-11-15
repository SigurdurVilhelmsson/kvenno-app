// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { NAME_TO_FORMULA_ITEMS, NameToFormula } from '../components/NameToFormula';
import { COMPOUNDS } from '../data/compounds';
import {
  ANIONS,
  CATIONS,
  NAME_TO_FORMULA_EXCLUDED,
  formulaOf,
  ionLabel,
  lowestCounts,
  nameToFormulaPool,
} from '../data/ions';
import { explainVerdict, ionChoices, judgeFormula } from '../utils/nameToFormula';

clockPastNextGuard();

/**
 * "Frá nafni til formúlu", year-1 plan item 13's third part. The formulas are
 * derived from the two charges and held to the ones `compounds.ts` stores, so
 * the practice cannot disagree with Stig 3 about any compound both show.
 */

const byName = (name: string) => nameToFormulaPool.find((i) => i.compound.name === name)!;

describe('the pool', () => {
  it('is every simple ionic compound in the game, each spelled by one ion pair', () => {
    const ionic = COMPOUNDS.filter(
      (c) =>
        c.type === 'ionic' &&
        c.category !== 'hýdrat' &&
        !NAME_TO_FORMULA_EXCLUDED.includes(c.formula)
    );
    expect(nameToFormulaPool.map((i) => i.compound)).toEqual(ionic);
    expect(nameToFormulaPool.length).toBe(40);
    for (const { compound, cation, anion } of nameToFormulaPool) {
      expect(formulaOf(cation, anion), compound.name).toBe(compound.formula);
    }
  });

  it('brackets a polyatomic ion only when there is more than one', () => {
    expect(byName('Kalsíumhýdroxíð').compound.formula).toBe('Ca(OH)₂');
    expect(byName('Ammóníumsúlfat').compound.formula).toBe('(NH₄)₂SO₄');
    expect(formulaOf(byName('Kalíumnítrat').cation, byName('Kalíumnítrat').anion)).toBe('KNO₃');
  });

  it('has no ion twice, and labels charges as superscripts', () => {
    const ids = [...CATIONS, ...ANIONS].map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ionLabel(CATIONS.find((i) => i.id === 'fe3')!)).toBe('Fe³⁺');
    expect(ionLabel(ANIONS.find((i) => i.id === 'po4')!)).toBe('PO₄³⁻');
    expect(ionLabel(CATIONS.find((i) => i.id === 'na')!)).toBe('Na⁺');
  });
});

describe('grading', () => {
  const item = byName('Járn(III)oxíð');
  const fe2 = CATIONS.find((i) => i.id === 'fe2')!;

  it('marks the lowest whole numbers right and names the first thing wrong otherwise', () => {
    const { cation, anion } = item;
    expect(lowestCounts(cation, anion)).toEqual({ cation: 2, anion: 3 });
    expect(judgeFormula(item, cation, anion, 2, 3)).toBe('right');
    expect(judgeFormula(item, fe2, anion, 1, 1)).toBe('cation');
    expect(judgeFormula(item, cation, ANIONS[0], 2, 3)).toBe('anion');
    expect(judgeFormula(item, cation, anion, 1, 1)).toBe('charge');
    expect(judgeFormula(item, cation, anion, 4, 6)).toBe('lowest');
  });

  it('reads the Roman numeral back as the charge, and never prints the counts for a charge slip', () => {
    expect(explainVerdict('cation', item, 1, 1)).toMatch(/Rómverska talan.*Fe³⁺/);
    const slip = explainVerdict('charge', item, 1, 1);
    expect(slip).toMatch(/samtals \+1/);
    expect(slip).not.toContain('Fe₂O₃');
    expect(slip).not.toMatch(/2 ×/);
  });

  it('offers the same metal at its other charge beside the right one', () => {
    for (let n = 0; n < 20; n++) {
      const ids = ionChoices(item.cation).map((i) => i.id);
      expect(ids).toHaveLength(4);
      expect(ids).toContain('fe3');
      expect(ids).toContain('fe2');
    }
  });
});

describe('the screen', () => {
  it('can be played to a perfect count', () => {
    const onComplete = vi.fn();
    render(<NameToFormula onComplete={onComplete} onBack={vi.fn()} />);
    for (let q = 0; q < NAME_TO_FORMULA_ITEMS; q++) {
      const name = screen.getByText('Nafn:').nextElementSibling!.textContent!;
      const { cation, anion } = byName(name);
      const counts = lowestCounts(cation, anion);
      fireEvent.click(
        within(screen.getByRole('group', { name: 'Katjón' })).getByRole('button', {
          name: ionLabel(cation),
        })
      );
      fireEvent.click(
        within(screen.getByRole('group', { name: 'Anjón' })).getByRole('button', {
          name: ionLabel(anion),
        })
      );
      for (let i = 1; i < counts.cation; i++)
        fireEvent.click(screen.getByRole('button', { name: `Fleiri ${ionLabel(cation)}` }));
      for (let i = 1; i < counts.anion; i++)
        fireEvent.click(screen.getByRole('button', { name: `Fleiri ${ionLabel(anion)}` }));
      expect(screen.getByText(/Heildarhleðsla: 0/)).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
      expect(screen.getByRole('group', { name: 'Niðurstaða' }).textContent).toContain(
        formulaOf(cation, anion)
      );
      fireEvent.click(screen.getByRole('button', { name: /Næsta nafn|Sjá niðurstöður/ }));
    }
    expect(onComplete).toHaveBeenCalledWith(NAME_TO_FORMULA_ITEMS, NAME_TO_FORMULA_ITEMS);
  });

  it('counts a right answer after a charge slip, but not after the answer was printed', () => {
    const onComplete = vi.fn();
    render(<NameToFormula onComplete={onComplete} onBack={vi.fn()} />);
    const play = (q: number) => {
      const name = screen.getByText('Nafn:').nextElementSibling!.textContent!;
      const { cation, anion } = byName(name);
      const counts = lowestCounts(cation, anion);
      fireEvent.click(screen.getByRole('button', { name: ionLabel(cation) }));
      fireEvent.click(
        within(screen.getByRole('group', { name: 'Anjón' })).getByRole('button', {
          name: ionLabel(anion),
        })
      );
      const plus = (ion: typeof cation, n: number) => {
        for (let i = 0; i < n; i++)
          fireEvent.click(screen.getByRole('button', { name: `Fleiri ${ionLabel(ion)}` }));
      };
      if (q === 0) {
        // Doubled: the lowest-ratio verdict names the formula, so it is printed.
        plus(cation, counts.cation * 2 - 1);
        plus(anion, counts.anion * 2 - 1);
        if (counts.cation * 2 <= 4 && counts.anion * 2 <= 4) {
          fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
          fireEvent.click(screen.getByRole('button', { name: 'Reyna aftur' }));
        }
        fireEvent.click(screen.getByRole('button', { name: 'Hreinsa' }));
        fireEvent.click(screen.getByRole('button', { name: ionLabel(cation) }));
        fireEvent.click(
          within(screen.getByRole('group', { name: 'Anjón' })).getByRole('button', {
            name: ionLabel(anion),
          })
        );
      }
      plus(cation, counts.cation - 1);
      plus(anion, counts.anion - 1);
      fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
      fireEvent.click(screen.getByRole('button', { name: /Næsta nafn|Sjá niðurstöður/ }));
      return counts.cation * 2 <= 4 && counts.anion * 2 <= 4;
    };
    const printedFirst = play(0);
    for (let q = 1; q < NAME_TO_FORMULA_ITEMS; q++) play(q);
    const expected = printedFirst ? NAME_TO_FORMULA_ITEMS - 1 : NAME_TO_FORMULA_ITEMS;
    expect(onComplete).toHaveBeenCalledWith(expected, NAME_TO_FORMULA_ITEMS);
  });
});
