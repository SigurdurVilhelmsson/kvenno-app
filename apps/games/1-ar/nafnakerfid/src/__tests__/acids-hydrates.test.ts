import { describe, expect, it } from 'vitest';

import { ruleFor } from '../components/Level3';
import { COMPOUNDS } from '../data/compounds';
import { PREFIXES, segmentName } from '../data/naming';
import { buildablePool } from '../utils/nameParts';

/**
 * Acids and hydrates in Stig 3, year-1 plan item 13 (2026-11-15), from the book's
 * `ch02/m68698`. The names are the book's own, lower-cased as it prints them, and the
 * water count in a hydrate's name follows from its formula.
 */

const BOOK_ACIDS: Record<string, string> = {
  'HCl(aq)': 'vetnisklóríðsýra',
  'HBr(aq)': 'vetnisbrómíðsýra',
  'H₂S(aq)': 'vetnissúlfíðsýra',
  'H₂CO₃': 'kolsýra',
  'HNO₃': 'saltpéturssýra',
  'HNO₂': 'saltpéturssýrlingur',
  'H₂SO₄': 'brennisteinssýra',
  'H₂SO₃': 'brennisteinssýrlingur',
  'H₃PO₄': 'fosfórsýra',
};

const acids = COMPOUNDS.filter((c) => c.category === 'sýra');
const hydrates = COMPOUNDS.filter((c) => c.category === 'hýdrat');

describe('acids', () => {
  it("are the book's, spelled as it spells them", () => {
    expect(Object.fromEntries(acids.map((c) => [c.formula, c.name.toLowerCase()]))).toEqual(
      BOOK_ACIDS
    );
  });

  it('end in -sýrlingur exactly where the anion ends in -ít', () => {
    for (const c of acids.filter((a) => !a.name.startsWith('Vetnis'))) {
      const ite = / er \S+ít;/.test(c.why ?? '');
      expect(c.name.endsWith('sýrlingur'), c.formula).toBe(ite);
    }
  });

  it('are all in the name builder, and the rule shown fits the kind of acid', () => {
    const pool = buildablePool();
    for (const c of acids) {
      expect(pool, c.formula).toContain(c);
      expect(ruleFor(c)).toMatch(c.name.startsWith('Vetnis') ? /Tvíundarsýra/ : /Oxósýra/);
    }
  });
});

describe('hydrates', () => {
  it('name the number of water molecules the formula carries', () => {
    expect(hydrates.length).toBeGreaterThanOrEqual(4);
    for (const c of hydrates) {
      const water = Number(c.formula.match(/·(\d+)H₂O/)![1]);
      expect(c.name.endsWith(` ${PREFIXES[water]}hýdrat`), c.name).toBe(true);
    }
  });

  it('build from parts, the hydrate word whole', () => {
    for (const c of hydrates) {
      const parts = segmentName(c.name)!;
      expect(
        parts
          .map((m) => m.text)
          .join('')
          .toLowerCase(),
        c.name
      ).toBe(c.name.toLowerCase());
      expect(parts.at(-1)!.kind).toBe('water');
      expect(ruleFor(c)).toMatch(/Hýdrat/);
    }
  });
});
