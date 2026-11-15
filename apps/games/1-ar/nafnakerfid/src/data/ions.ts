import { COMPOUNDS, type Compound } from './compounds';

/**
 * The ions behind the game's ionic compounds, for "Frá nafni til formúlu":
 * the student reads a name, picks the two ions it names and sets how many of
 * each make the charges cancel (year-1 plan item 13, the book's ch02/m68698).
 *
 * Nothing here stores a compound's formula. `formulaOf` derives it from the
 * two charges, and `nameToFormulaPool` keeps only the compounds of
 * `compounds.ts` whose name and formula both come out of an ion pair, so the
 * pool cannot disagree with Stig 3 about any of them.
 */
export interface Ion {
  id: string;
  /** The symbol part, written as in a formula: `Fe`, `NH₄`, `SO₄`. */
  symbol: string;
  charge: number;
  /** More than one atom: wrapped in brackets when more than one is needed. */
  polyatomic: boolean;
  /** As the compound's name spells it: `Járn(III)`, `súlfat`. */
  name: string;
}

export const CATIONS: Ion[] = [
  { id: 'na', symbol: 'Na', charge: 1, polyatomic: false, name: 'Natríum' },
  { id: 'k', symbol: 'K', charge: 1, polyatomic: false, name: 'Kalíum' },
  { id: 'li', symbol: 'Li', charge: 1, polyatomic: false, name: 'Litíum' },
  { id: 'ag', symbol: 'Ag', charge: 1, polyatomic: false, name: 'Silfur' },
  { id: 'nh4', symbol: 'NH₄', charge: 1, polyatomic: true, name: 'Ammóníum' },
  { id: 'mg', symbol: 'Mg', charge: 2, polyatomic: false, name: 'Magnesíum' },
  { id: 'ca', symbol: 'Ca', charge: 2, polyatomic: false, name: 'Kalsíum' },
  { id: 'ba', symbol: 'Ba', charge: 2, polyatomic: false, name: 'Baríum' },
  { id: 'zn', symbol: 'Zn', charge: 2, polyatomic: false, name: 'Sink' },
  { id: 'al', symbol: 'Al', charge: 3, polyatomic: false, name: 'Ál' },
  { id: 'fe2', symbol: 'Fe', charge: 2, polyatomic: false, name: 'Járn(II)' },
  { id: 'fe3', symbol: 'Fe', charge: 3, polyatomic: false, name: 'Járn(III)' },
  { id: 'cu1', symbol: 'Cu', charge: 1, polyatomic: false, name: 'Kopar(I)' },
  { id: 'cu2', symbol: 'Cu', charge: 2, polyatomic: false, name: 'Kopar(II)' },
  { id: 'cr3', symbol: 'Cr', charge: 3, polyatomic: false, name: 'Króm(III)' },
  { id: 'pb2', symbol: 'Pb', charge: 2, polyatomic: false, name: 'Blý(II)' },
  { id: 'hg2', symbol: 'Hg', charge: 2, polyatomic: false, name: 'Kvikasilfur(II)' },
  { id: 'sn4', symbol: 'Sn', charge: 4, polyatomic: false, name: 'Tin(IV)' },
  { id: 'co2', symbol: 'Co', charge: 2, polyatomic: false, name: 'Kóbalt(II)' },
];

export const ANIONS: Ion[] = [
  { id: 'cl', symbol: 'Cl', charge: -1, polyatomic: false, name: 'klóríð' },
  { id: 'br', symbol: 'Br', charge: -1, polyatomic: false, name: 'brómíð' },
  { id: 'f', symbol: 'F', charge: -1, polyatomic: false, name: 'flúoríð' },
  { id: 'o', symbol: 'O', charge: -2, polyatomic: false, name: 'oxíð' },
  { id: 'oh', symbol: 'OH', charge: -1, polyatomic: true, name: 'hýdroxíð' },
  { id: 'no3', symbol: 'NO₃', charge: -1, polyatomic: true, name: 'nítrat' },
  { id: 'hco3', symbol: 'HCO₃', charge: -1, polyatomic: true, name: 'bíkarbónat' },
  { id: 'so4', symbol: 'SO₄', charge: -2, polyatomic: true, name: 'súlfat' },
  { id: 'co3', symbol: 'CO₃', charge: -2, polyatomic: true, name: 'karbónat' },
  { id: 'cr2o7', symbol: 'Cr₂O₇', charge: -2, polyatomic: true, name: 'díkrómat' },
  { id: 'po4', symbol: 'PO₄', charge: -3, polyatomic: true, name: 'fosfat' },
];

const SUB = '₀₁₂₃₄₅₆₇₈₉';
const SUP: Record<string, string> = { '1': '', '2': '²', '3': '³', '4': '⁴' };

function subscript(n: number): string {
  return n === 1
    ? ''
    : String(n)
        .split('')
        .map((d) => SUB[Number(d)])
        .join('');
}

/** `+`, `2+`, `−`, `3−`, as superscripts: `Fe³⁺`. */
export function ionLabel(ion: Ion): string {
  const n = SUP[String(Math.abs(ion.charge))];
  return `${ion.symbol}${n}${ion.charge > 0 ? '⁺' : '⁻'}`;
}

/** One ion `count` times, bracketed when it is polyatomic and more than one. */
export function ionPart(ion: Ion, count: number): string {
  if (count === 1) return ion.symbol;
  return ion.polyatomic ? `(${ion.symbol})${subscript(count)}` : `${ion.symbol}${subscript(count)}`;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** The lowest whole numbers of each ion whose charges cancel. */
export function lowestCounts(cation: Ion, anion: Ion): { cation: number; anion: number } {
  const g = gcd(cation.charge, -anion.charge);
  return { cation: -anion.charge / g, anion: cation.charge / g };
}

export function formulaOf(cation: Ion, anion: Ion, counts = lowestCounts(cation, anion)): string {
  return ionPart(cation, counts.cation) + ionPart(anion, counts.anion);
}

export interface NameToFormulaItem {
  compound: Compound;
  cation: Ion;
  anion: Ion;
}

/** The ion pair a compound's name spells, if its formula is that pair's. */
export function ionsOf(compound: Compound): NameToFormulaItem | null {
  const name = compound.name.toLowerCase();
  for (const cation of CATIONS) {
    for (const anion of ANIONS) {
      if (
        name === (cation.name + anion.name).toLowerCase() &&
        formulaOf(cation, anion) === compound.formula
      ) {
        return { compound, cation, anion };
      }
    }
  }
  return null;
}

/**
 * Every simple ionic compound in the game. Left out: Fe₃O₄, whose two charges
 * no single ion pair gives, Mn₂O₇, whose Mn(VII) is no ion a student meets
 * (the oxide is molecular), and the hydrates, whose water no charge sets.
 */
export const NAME_TO_FORMULA_EXCLUDED = ['Fe₃O₄', 'Mn₂O₇'];

export const nameToFormulaPool: NameToFormulaItem[] = COMPOUNDS.filter(
  (c) =>
    c.type === 'ionic' && c.category !== 'hýdrat' && !NAME_TO_FORMULA_EXCLUDED.includes(c.formula)
).map((c) => {
  const item = ionsOf(c);
  if (!item) throw new Error(`No ion pair spells ${c.name} (${c.formula})`);
  return item;
});
