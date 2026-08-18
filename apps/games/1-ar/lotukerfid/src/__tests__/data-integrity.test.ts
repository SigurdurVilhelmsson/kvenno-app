import { describe, it, expect } from 'vitest';

import { ELEMENTS } from '../data/elements';

// Mass number of the most abundant natural isotope, for every element in this
// file where rounding the standard atomic mass gives the wrong answer.
// Abundances are from the NIST "Atomic Weights and Isotopic Compositions"
// tables; Ge, Ag, Ba, Hg and Pb were additionally checked against CIAAW, which
// agrees. These eleven are the complete set across all 42 records -- NOT just
// the 36 with period <= 4 that Level 3 draws from. The four out-of-pool entries
// are here on purpose: without them this test cannot see a wrong literal
// written into Ag, Ba, Hg or Pb.
const KNOWN_MOST_ABUNDANT: Record<string, number> = {
  // in Level 3's period <= 4 draw pool
  Ni: 58, // atomicMass 58.693 rounds to 59; Ni-59 has no natural abundance
  Cu: 63, // 63.546  -> 64; Cu-64 has no natural abundance
  Zn: 64, // 65.38   -> 65; Zn-65 has no natural abundance
  Ga: 69, // 69.723  -> 70; Ga-70 has no natural abundance
  Ge: 74, // 72.63   -> 73; Ge-73 IS natural but minor, ~7.8% against Ge-74's ~36.5%
  Se: 80, // 78.971  -> 79; Se-79 has no natural abundance
  Br: 79, // 79.904  -> 80; Br-80 has no natural abundance (79/81 are near 50/50)
  // outside the draw pool, but in the file and equally wrong if derived
  Ag: 107, // 107.868 -> 108; Ag-108 has no natural abundance (t-half 2.4 min)
  Ba: 138, // 137.327 -> 137; Ba-137 IS natural but 2nd at ~11.2%
  Hg: 202, // 200.592 -> 201; Hg-201 IS natural but 4th at ~13.2%
  Pb: 208, // 207.2   -> 207; representative composition, see the note in elements.ts
};

describe('element data', () => {
  it('every element declares a mass number', () => {
    const missing = ELEMENTS.filter((e) => typeof e.massNumber !== 'number');
    expect(missing.map((e) => e.symbol)).toEqual([]);
  });

  it('mass number is a whole number at least as large as the atomic number', () => {
    const bad = ELEMENTS.filter(
      (e) => !Number.isInteger(e.massNumber) || e.massNumber < e.atomicNumber
    );
    expect(bad.map((e) => e.symbol)).toEqual([]);
  });

  it.each(Object.entries(KNOWN_MOST_ABUNDANT))(
    '%s has mass number %i, which rounding the atomic mass would get wrong',
    (symbol, expected) => {
      const el = ELEMENTS.find((e) => e.symbol === symbol);
      expect(el).toBeDefined();
      expect(el!.massNumber).toBe(expected);
      expect(Math.round(el!.atomicMass)).not.toBe(expected);
    }
  );
});
