import { describe, it, expect } from 'vitest';

import { COMPOUNDS } from '../data/compounds';
import { ELEMENT_ROOTS, PREFIXES } from '../data/naming';

/**
 * Guards B5 for Nafnakerfið — wrong compound names taught as fact.
 *
 * This is the one game whose entire subject is what a compound is called, so a
 * wrong name here is not a cosmetic defect: it is the thing being examined. Four
 * were shipped —
 *
 *  - P₄O₁₀ as "Fosfordekoxíð", missing the tetra- its four phosphorus atoms
 *    require, and inconsistent with N₂O₄, N₂O₅ and Cl₂O₇ in the same table
 *  - Co(NO₃)₂ as "Kóbolt(II)nítrat" — the Icelandic element is kóbalt, spelled
 *    correctly in the sibling game's periodic table
 *  - Fe₃O₄ as "Járnoxíð (blandað)", which is not a nomenclature name at all
 *  - `naming.ts` giving sulfur the root "brennisteinið", not an Icelandic word
 *
 * plus one found while fixing them: PCl₅ as "Fosforpentaklóríð", against the
 * accented `fosfór` the same file's root table gives.
 */

/** Subscript digits, as they appear in the formulas. */
const SUBSCRIPTS = '₀₁₂₃₄₅₆₇₈₉';

/** Element symbol → atom count, for the simple binary molecular formulas. */
function parseFormula(formula: string): { symbol: string; count: number }[] {
  const out: { symbol: string; count: number }[] = [];
  const pattern = /([A-Z][a-z]?)([₀-₉]*)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(formula)) !== null) {
    if (!match[1]) continue;
    const digits = [...match[2]].map((c) => SUBSCRIPTS.indexOf(c)).join('');
    out.push({ symbol: match[1], count: digits === '' ? 1 : Number(digits) });
  }
  return out;
}

/**
 * Does the Greek prefix for `count` show up in this name?
 *
 * Icelandic elides the prefix's final -a before a vowel, which is why N₂O₄ is
 * Díniturtetroxíð rather than -tetraoxíð. So a prefix ending in -a also counts
 * as present in its elided form; `dí` and `trí` are matched whole, since
 * dropping their final letter would match almost anything.
 */
function prefixAppears(name: string, count: number): boolean {
  const prefix = PREFIXES[count];
  const lower = name.toLowerCase();
  if (lower.includes(prefix)) return true;
  return prefix.endsWith('a') && lower.includes(prefix.slice(0, -1));
}

const byFormula = (formula: string) => {
  const compound = COMPOUNDS.find((c) => c.formula === formula);
  expect(compound, `no compound with formula ${formula}`).toBeDefined();
  return compound!;
};

describe('the names B5 got wrong', () => {
  it.each([
    ['P₄O₁₀', 'Tetrafosfórdekoxíð'],
    ['Co(NO₃)₂', 'Kóbalt(II)nítrat'],
    ['Fe₃O₄', 'Járn(II,III)oxíð'],
    ['PCl₅', 'Fosfórpentaklóríð'],
  ])('%s is named %s', (formula, name) => {
    expect(byFormula(formula).name).toBe(name);
  });

  it('spells the element kóbalt everywhere it is mentioned, not kóbolt', () => {
    const cobalt = byFormula('Co(NO₃)₂');
    expect(`${cobalt.name} ${cobalt.info}`).not.toMatch(/kóbolt/i);
    expect(cobalt.info).toMatch(/Kóbalt/);
  });

  it('gives sulfur a real Icelandic root', () => {
    // "brennisteinið" is not a word — not the bare noun (brennisteinn) and not
    // its definite form (brennisteinninn). The table's other entries are anion
    // names (oxíð, klóríð, flúoríð, brómíð, joðíð), which is what súlfíð is,
    // and what Level 1 already teaches at `Level1.tsx`.
    expect(ELEMENT_ROOTS.S.root).toBe('súlfíð');
    for (const [symbol, info] of Object.entries(ELEMENT_ROOTS)) {
      expect(info.root, `${symbol} root`).not.toMatch(/brennisteinið/);
      expect(info.root.trim(), `${symbol} root`).not.toBe('');
    }
  });
});

describe('molecular names carry the prefix their formula requires', () => {
  // This is the check that would have caught "Fosfordekoxíð": ten oxygens with
  // no deka-, four phosphorus atoms with no tetra-.
  const molecular = COMPOUNDS.filter((c) => c.type === 'molecular' && !c.excludeFromNameBuilder);

  it('has molecular compounds to check', () => {
    expect(molecular.length).toBeGreaterThanOrEqual(9);
  });

  it.each(molecular.map((c) => [c.formula, c] as const))('%s', (_formula, compound) => {
    const atoms = parseFormula(compound.formula);
    expect(atoms.length, `${compound.formula} did not parse`).toBe(2);

    atoms.forEach(({ symbol, count }, index) => {
      if (count > 1) {
        expect(
          prefixAppears(compound.name, count),
          `${compound.formula} has ${count} × ${symbol} but "${compound.name}" carries no ${PREFIXES[count]}-`
        ).toBe(true);
      } else if (index === 0) {
        // Mónó- is dropped on the first element by convention.
        expect(
          compound.name.toLowerCase().includes('mónó'),
          `${compound.formula} should not carry mónó- on its first element`
        ).toBe(false);
      }
    });
  });
});

describe('Level 3 excludes compounds by declaration, not by their name', () => {
  /**
   * Level 3 asks a student to assemble a name from prefixes and element roots,
   * so it can only ask about names built that way. It used to find those by
   * string-matching — including `!c.name.includes('(blandað)')`, which made
   * Fe₃O₄'s wrong name load-bearing: correcting it would have put an item the
   * level cannot grade back into the pool.
   */
  const excluded = COMPOUNDS.filter((c) => c.excludeFromNameBuilder);

  it('no name carries a parenthetical that is really a flag', () => {
    for (const compound of COMPOUNDS) {
      expect(compound.name, compound.formula).not.toMatch(/\(blandað\)/);
      // A parenthetical in a name is a Roman numeral (oxidation state) and
      // nothing else.
      const parentheticals = compound.name.match(/\(([^)]*)\)/g) ?? [];
      for (const part of parentheticals) {
        expect(part, `${compound.formula}: "${part}"`).toMatch(/^\([IVX]+(,[IVX]+)*\)$/);
      }
    }
  });

  it('excludes the trivial names, the bare elements and Fe₃O₄', () => {
    expect(excluded.map((c) => c.formula).sort()).toEqual(
      ['CH₄', 'Cl₂', 'Fe₃O₄', 'H₂', 'H₂O', 'N₂', 'NH₃', 'O₂'].sort()
    );
  });

  it('leaves a pool large enough for the ten questions it asks', () => {
    expect(COMPOUNDS.length - excluded.length).toBeGreaterThanOrEqual(10);
  });
});
