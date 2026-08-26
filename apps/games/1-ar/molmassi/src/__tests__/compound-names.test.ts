import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, it, expect } from 'vitest';

import { COMPOUNDS } from '../data/compounds';

/**
 * Guards the Mólmassi half of B5 — wrong compound names taught as fact.
 *
 * Two were named in the Year-1 curriculum review:
 *
 *  - NaOH as "Natrímhýdroxíð", a typo for natríum
 *  - Na₂CO₃·10H₂O as "Vatnaglas hýdrat" — vatnsgler is sodium *silicate*, a
 *    different substance entirely; the decahydrate is þvottasódi
 *
 * Three more hydrates in the same table were wrong in the same way and are fixed
 * with them: MgSO₄·7H₂O was "Epsom salt hýdrat" (English, and the hydrate count
 * dropped), FeSO₄·7H₂O was "Járnsúlfat hýdrat" (no oxidation state, no count),
 * and CuSO₄·5H₂O was "Koparbrennisteinshýdrat", which is not a name in any
 * language. Þvottasódi keeps its trivial name because the review ruled on it;
 * the other three take the systematic form, since nothing had ruled on those.
 */

describe('the names B5 got wrong', () => {
  const byFormula = (formula: string) => {
    const compound = COMPOUNDS.find((c) => c.formula === formula);
    expect(compound, `no compound with formula ${formula}`).toBeDefined();
    return compound!;
  };

  it.each([
    ['NaOH', 'Natríumhýdroxíð'],
    ['Na₂CO₃·10H₂O', 'Þvottasódi'],
    ['MgSO₄·7H₂O', 'Magnesíumsúlfat heptahýdrat'],
    ['FeSO₄·7H₂O', 'Járn(II)súlfat heptahýdrat'],
    ['CuSO₄·5H₂O', 'Kopar(II)súlfat pentahýdrat'],
  ])('%s is named %s', (formula, name) => {
    expect(byFormula(formula).name).toBe(name);
  });

  it('does not call the decahydrate vatnsgler, which is a different substance', () => {
    for (const compound of COMPOUNDS) {
      expect(compound.name, compound.formula).not.toMatch(/vatnagla|vatnsgler/i);
      expect(compound.name, compound.formula).not.toMatch(/natrím/i);
    }
  });

  it('names every hydrate with its water count', () => {
    // "hýdrat" alone says a compound carries water but not how much, which is
    // the whole quantity this game asks the student to compute.
    const HYDRATE_PREFIX = /(mónó|dí|trí|tetra|penta|hexa|hepta|okta|nóna|deka)hýdrat/i;
    const hydrates = COMPOUNDS.filter((c) => c.formula.includes('·'));
    expect(hydrates.length).toBeGreaterThanOrEqual(3);
    for (const compound of hydrates) {
      // Þvottasódi is a trivial name and carries no count by design.
      if (compound.name === 'Þvottasódi') continue;
      expect(compound.name, compound.formula).toMatch(HYDRATE_PREFIX);
    }
  });
});

describe('þvottasódi names one substance across the platform', () => {
  /**
   * Read as source text rather than imported, so this stays a check on another
   * game without making Mólmassi depend on Lausnir's module graph.
   *
   * Until now Lausnir called *anhydrous* Na₂CO₃ (106 g/mol) þvottasódi while
   * Mólmassi gave the same word's referent, Na₂CO₃·10H₂O, a molar mass of
   * 286,141 — one platform, one word, two substances, three times apart in mass.
   */
  const repoRoot = join(__dirname, '..', '..', '..', '..', '..', '..');
  const lausnir = readFileSync(
    join(repoRoot, 'apps/games/1-ar/lausnir/src/data/chemicals.ts'),
    'utf8'
  );

  it('reads the sibling game it is checking', () => {
    expect(lausnir).toContain('Na₂CO₃');
  });

  it('is not used for the anhydrous salt in lausnir', () => {
    expect(lausnir).not.toMatch(/þvottasódi/i);
  });

  it('is the decahydrate here, and only the decahydrate', () => {
    const named = COMPOUNDS.filter((c) => /þvottasódi/i.test(c.name));
    expect(named.map((c) => c.formula)).toEqual(['Na₂CO₃·10H₂O']);
  });
});
