// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { Level1 } from '../components/Level1';
import { generateProblem, type ConvType } from '../components/Level2';
import { buildProblem, DESCRIPTORS } from '../components/Level3';
import { atomWord } from '../data/atomWords';
import { COMPOUNDS } from '../data/compounds';
import { ELEMENTS } from '../data/elements';

/**
 * Names inside sentences, in the case the sentence needs.
 *
 * Every question template put the compound's label name straight after `af`,
 * which governs the dative, so Stig 2 asked `Hversu mörg mól eru í 445 g af
 * Köfnunarefni (N₂)?` — capital and nominative — and `af Þvottasódi`. Stig 3
 * lower-cased it and was still nominative: `sameindir af vatn`. Stig 1 praised
 * a right answer with `Mólmassi Vatn er`, where `Mólmassi` wants the genitive.
 * And the atoms were built from the element's name, `Súrefni-atóm`, where the
 * word is the compound `súrefnisatóm`.
 *
 * The forms are data (`nameDative`, `nameGenitive`, `atomWords.ts`), because a
 * case in Icelandic is not a string operation — the pattern
 * `3-ar/syrufastinn` set for its acid names.
 */

afterEach(cleanup);
clockPastNextGuard();

const ALL_TYPES: ConvType[] = [
  'mass_to_moles',
  'moles_to_mass',
  'moles_to_particles',
  'particles_to_moles',
  'moles_to_element_atoms',
  'moles_to_gas_volume',
  'gas_volume_to_moles',
];

const byFormula = (formula: string) => COMPOUNDS.find((c) => c.formula === formula)!;

describe('the case forms in the data', () => {
  it.each(COMPOUNDS.map((c) => [c.formula, c] as const))(
    '%s — both forms are lower case, keeping any Roman numeral',
    (_formula, compound) => {
      for (const form of [compound.nameDative, compound.nameGenitive]) {
        expect(form.charAt(0), form).toBe(form.charAt(0).toLowerCase());
        expect(form.match(/\([IVX]+\)/g), form).toEqual(compound.name.match(/\([IVX]+\)/g));
      }
    }
  );

  it('declines the names a student meets most, as the textbook does', () => {
    expect(byFormula('H₂O').nameDative).toBe('vatni');
    expect(byFormula('H₂O').nameGenitive).toBe('vatns');
    expect(byFormula('CO₂').nameDative).toBe('koldíoxíði');
    expect(byFormula('C₆H₁₂O₆').nameDative).toBe('glúkósa');
    expect(byFormula('Na₂CO₃·10H₂O').nameDative).toBe('þvottasóda');
    expect(byFormula('CuSO₄·5H₂O').nameDative).toBe('kopar(II)súlfat pentahýdrati');
  });
});

describe('Stig 2 questions', () => {
  it.each(COMPOUNDS.map((c) => [c.formula, c] as const))(
    '%s — the compound after `af` is in the dative, in lower case',
    (formula, compound) => {
      for (const type of ALL_TYPES) {
        const q = generateProblem(compound, type).questionText;
        expect(q, `${type} on ${formula}`).not.toMatch(/ af [A-ZÁÉÍÓÚÝÞÆÖ]/);
        // `particles_to_moles` does not name the compound; everything else does.
        if (q.includes(`(${formula})`)) {
          expect(q, `${type} on ${formula}`).toContain(`af ${compound.nameDative} (${formula})`);
        }
      }
    }
  );

  it('asks for súrefnisatóm, not Súrefni-atóm', () => {
    const q = generateProblem(byFormula('H₂SO₄'), 'moles_to_element_atoms').questionText;
    expect(q).toMatch(
      /^Hversu mörg súrefnisatóm \(O\) eru í [\d,]+ mól af brennisteinssýru \(H₂SO₄\)\?$/
    );
  });
});

describe('Stig 3 questions', () => {
  it.each(DESCRIPTORS.map((d, i) => [i, d] as const))('problem %i', (_i, d) => {
    const compound = byFormula(d.formula);
    const q = buildProblem(d).question;
    expect(q).toContain(`af ${compound.nameDative} (${d.formula})`);
  });

  it('asks for moles of atoms of every element alike, hydrogen included', () => {
    // `mól af vetni (H)` can fairly be read as moles of H₂, which is half the key.
    for (const d of DESCRIPTORS) {
      if (d.type !== 'mass-to-moles-of-atom') continue;
      expect(buildProblem(d).question).toContain(`mól af ${atomWord(d.element)}um (${d.element})`);
    }
  });
});

describe('the atom words', () => {
  it('has one for every element in any compound', () => {
    for (const compound of COMPOUNDS) {
      for (const { symbol } of compound.elements) {
        expect(() => atomWord(symbol), symbol).not.toThrow();
      }
    }
  });
});

/** Walk Stig 1's three teaching screens and land on the first problem. */
function startPractice() {
  const rendered = render(<Level1 onBack={vi.fn()} onComplete={vi.fn()} />);
  const ui = within(rendered.container);
  fireEvent.click(ui.getByRole('button', { name: /Sjáum dæmi/ }));
  fireEvent.click(ui.getByRole('button', { name: /Eitt dæmi til/ }));
  fireEvent.click(ui.getByRole('button', { name: /byrja æfingar/ }));
  return { ui, ...rendered };
}

/** The compound whose formula is in the headline right now. */
function shownCompound(container: HTMLElement) {
  const formulas = new Set(COMPOUNDS.map((c) => c.formula));
  const headline = Array.from(container.querySelectorAll('div')).find((el) =>
    formulas.has(el.textContent?.trim() ?? '')
  );
  return byFormula(headline!.textContent!.trim());
}

function answer(ui: ReturnType<typeof within>, value: number) {
  fireEvent.change(ui.getByRole('textbox'), { target: { value: String(value) } });
  fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));
}

describe('Stig 1 feedback', () => {
  it('names one atom too many with the compound word, and a right answer in the genitive', () => {
    const { ui, container } = startPractice();

    // One atom of the heaviest element too many — heavy enough to be outside
    // every tolerance — and the diagnosis must name it.
    const first = shownCompound(container);
    const massOf = (symbol: string) => ELEMENTS.find((e) => e.symbol === symbol)!.atomicMass;
    const symbol = first.elements.map((e) => e.symbol).sort((a, b) => massOf(b) - massOf(a))[0];
    answer(ui, first.molarMass + massOf(symbol));
    expect(container.textContent).toContain(
      `Þú virðist hafa talið einu ${atomWord(symbol)}i of mikið.`
    );
    expect(container.textContent).toContain('Líklegast voru mistökin:');

    fireEvent.click(ui.getByRole('button', { name: /Næsta dæmi/ }));

    const second = shownCompound(container);
    answer(ui, second.molarMass);
    expect(container.textContent).toContain(`Mólmassi ${second.nameGenitive} er`);
  });
});
