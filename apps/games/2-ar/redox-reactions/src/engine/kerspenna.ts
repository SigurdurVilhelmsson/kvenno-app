/**
 * Cell potentials and ΔG° from the book's table of electrode potentials (`@shared/data/
 * electrode-potentials`, appendix m68870), and a balance check for half-reactions. The book:
 * ch. 17, m68823 (E°ker = E°katóða − E°anóða) and m68824 (ΔG° = −nFE°ker).
 *
 * Nothing here is typed per problem. E°ker is the difference of two table rows, n is read from
 * the two half-reactions as the table writes them, and a reaction is sjálfgengt where E°ker > 0.
 */

import {
  ELECTRODE_POTENTIALS,
  cellPotential,
  standardPotential,
  type Couple,
} from '@shared/data/electrode-potentials';
import { normaliseSubscripts } from '@shared/utils';

/** Faraday's constant, C per mole of electrons (m68824's glossary: 96.485 C/mól e⁻). */
export const FARADAY = 96485;

/** Electrons in a couple's half-reaction as the table writes it. */
export function electronsOf(couple: Couple): number {
  const m = /(\d*)e⁻/.exec(ELECTRODE_POTENTIALS[couple].halfReaction);
  if (!m) throw new Error(`${couple} has no electrons in its half-reaction`);
  return m[1] ? Number(m[1]) : 1;
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

export interface Cell {
  /** The couple reduced, at the katóða. */
  cathode: Couple;
  /** The couple oxidised, at the anóða. */
  anode: Couple;
}

/** The cell two couples make when it runs by itself: the higher E° is the katóða. */
export function spontaneousCell(a: Couple, b: Couple): Cell {
  return standardPotential(a) >= standardPotential(b)
    ? { cathode: a, anode: b }
    : { cathode: b, anode: a };
}

/** E°ker in volts. */
export const ecell = (cell: Cell) => cellPotential(cell.cathode, cell.anode);

/** Moles of electrons transferred per mole of reaction as written with the smallest whole numbers. */
export function electronsTransferred(cell: Cell): number {
  const a = electronsOf(cell.cathode);
  const b = electronsOf(cell.anode);
  return (a * b) / gcd(a, b);
}

/** ΔG° in kJ per mole of reaction: −nFE°ker. */
export const deltaG = (cell: Cell) => (-electronsTransferred(cell) * FARADAY * ecell(cell)) / 1000;

/** Within 1 % of the key, or 0,011 V for a potential, so a student working from two decimals is right. */
export function closeTo(value: number, key: number, unit: 'V' | 'kJ'): boolean {
  if (!Number.isFinite(value)) return false;
  return unit === 'V'
    ? Math.abs(value - key) <= 0.011
    : Math.abs(value - key) <= Math.abs(key) * 0.01;
}

const SUP_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹';

interface Term {
  coefficient: number;
  atoms: Map<string, number>;
  charge: number;
  electron: boolean;
}

function readTerm(text: string): Term {
  const m = /^(\d*)(.+)$/.exec(text.trim().replace(/\((?:s|l|g|aq)\)$/, ''));
  if (!m) throw new Error(`cannot read "${text}"`);
  const coefficient = m[1] ? Number(m[1]) : 1;
  let species = m[2];
  if (species === 'e⁻') return { coefficient, atoms: new Map(), charge: -1, electron: true };
  let charge = 0;
  const c = /([⁰¹²³⁴⁵⁶⁷⁸⁹]*)([⁺⁻])$/.exec(species);
  if (c) {
    const size = c[1] ? Number([...c[1]].map((d) => SUP_DIGITS.indexOf(d)).join('')) : 1;
    charge = c[2] === '⁺' ? size : -size;
    species = species.slice(0, -c[0].length);
  }
  // Element symbols and counts only, read without the atomic-mass table, which has no row for
  // some metals in the electrode table (Cd, Au). Anything else in the species is refused.
  const flat = normaliseSubscripts(species);
  const atoms = new Map<string, number>();
  let read = '';
  for (const [whole, symbol, count] of flat.matchAll(/([A-Z][a-z]?)(\d*)/g)) {
    atoms.set(symbol, (atoms.get(symbol) ?? 0) + (count ? Number(count) : 1));
    read += whole;
  }
  if (read !== flat || read === '') throw new Error(`cannot read "${text}"`);
  return { coefficient, atoms, charge, electron: false };
}

function tally(side: string) {
  const atoms = new Map<string, number>();
  let charge = 0;
  let electrons = 0;
  for (const part of side.split(' + ')) {
    const t = readTerm(part);
    charge += t.coefficient * t.charge;
    if (t.electron) electrons += t.coefficient;
    for (const [symbol, n] of t.atoms)
      atoms.set(symbol, (atoms.get(symbol) ?? 0) + t.coefficient * n);
  }
  return { atoms, charge, electrons };
}

/** What is out of balance in an equation written `a + b → c + d`: atoms by symbol, then charge. */
export function imbalance(equation: string): { atoms: string[]; charge: boolean } {
  const [left, right] = equation.split(' → ');
  if (right === undefined) throw new Error(`no arrow in "${equation}"`);
  const l = tally(left);
  const r = tally(right);
  const symbols = new Set([...l.atoms.keys(), ...r.atoms.keys()]);
  return {
    atoms: [...symbols].filter((s) => (l.atoms.get(s) ?? 0) !== (r.atoms.get(s) ?? 0)),
    charge: l.charge !== r.charge,
  };
}

export const isBalanced = (equation: string) => {
  const off = imbalance(equation);
  return off.atoms.length === 0 && !off.charge;
};
