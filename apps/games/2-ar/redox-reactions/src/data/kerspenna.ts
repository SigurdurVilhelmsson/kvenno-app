/**
 * Kerspenna: the half-cells Kanna offers and the ten Æfa items. No key is stored: E°ker, ΔG° and
 * whether a reaction is sjálfgengt come from the book's table through `engine/kerspenna.ts`, and
 * a half-reaction's key is the table's own row. `kerspenna.test.ts` holds every item to that.
 */

import type { Couple } from '@shared/data/electrode-potentials';

/** `Cr2O72-/Cr3+` → `Cr₂O₇²⁻/Cr³⁺`: a charge is one digit or none before its sign. */
export function coupleLabel(couple: string): string {
  const SUB = '₀₁₂₃₄₅₆₇₈₉';
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  return couple
    .split('/')
    .map((part) =>
      part
        .replace(
          /(\d?)([+-])$/,
          (_, d: string, sign: string) => `${d ? SUP[Number(d)] : ''}${sign === '+' ? '⁺' : '⁻'}`
        )
        .replace(/\d/g, (d) => SUB[Number(d)])
    )
    .join('/');
}

/** Half-cells Kanna offers: the metals of the galvanic cell and three non-metal couples. */
export const KANNA_COUPLES: readonly Couple[] = [
  'Mg2+/Mg',
  'Al3+/Al',
  'Zn2+/Zn',
  'Fe2+/Fe',
  'Ni2+/Ni',
  'Pb2+/Pb',
  'H+/H2',
  'Cu2+/Cu',
  'I2/I-',
  'Fe3+/Fe2+',
  'Ag+/Ag',
  'Cl2/Cl-',
];

interface Base {
  id: string;
  question: string;
}

/** E°ker of the cell two half-cells make. */
export interface PotentialItem extends Base {
  kind: 'ecell';
  couples: readonly [Couple, Couple];
}

/** ΔG° of the cell two half-cells make, per mole of reaction as written. */
export interface FreeEnergyItem extends Base {
  kind: 'dg';
  couples: readonly [Couple, Couple];
  /** The overall reaction the cell runs, as the student reads it. */
  equation: string;
}

/** Is the reaction, as written, sjálfgengt? */
export interface DirectionItem extends Base {
  kind: 'stefna';
  equation: string;
  /** The couple whose oxidised form is reduced in the reaction as written. */
  reduced: Couple;
  /** The couple whose reduced form is oxidised. */
  oxidised: Couple;
}

/** Pick the balanced half-reaction in acid. */
export interface HalfReactionItem extends Base {
  kind: 'halfhvarf';
  couple: Couple;
  options: readonly { value: string; slip?: string }[];
}

export type KerItem = PotentialItem | FreeEnergyItem | DirectionItem | HalfReactionItem;

export const KER_ITEMS: readonly KerItem[] = [
  {
    id: 'ecell-zn-cu',
    kind: 'ecell',
    couples: ['Zn2+/Zn', 'Cu2+/Cu'],
    question: 'Galvaníhlað er gert úr hálfkerunum Zn²⁺/Zn og Cu²⁺/Cu. Hver er E°ker?',
  },
  {
    id: 'ecell-mg-ag',
    kind: 'ecell',
    couples: ['Ag+/Ag', 'Mg2+/Mg'],
    question: 'Galvaníhlað er gert úr hálfkerunum Ag⁺/Ag og Mg²⁺/Mg. Hver er E°ker?',
  },
  {
    id: 'ecell-al-ni',
    kind: 'ecell',
    couples: ['Ni2+/Ni', 'Al3+/Al'],
    question: 'Galvaníhlað er gert úr hálfkerunum Ni²⁺/Ni og Al³⁺/Al. Hver er E°ker?',
  },
  {
    id: 'stefna-cu-ag',
    kind: 'stefna',
    equation: 'Cu(s) + 2Ag⁺(aq) → Cu²⁺(aq) + 2Ag(s)',
    reduced: 'Ag+/Ag',
    oxidised: 'Cu2+/Cu',
    question: 'Er þetta hvarf sjálfgengt við staðalaðstæður?',
  },
  {
    id: 'stefna-cu-zn',
    kind: 'stefna',
    equation: 'Cu(s) + Zn²⁺(aq) → Cu²⁺(aq) + Zn(s)',
    reduced: 'Zn2+/Zn',
    oxidised: 'Cu2+/Cu',
    question: 'Er þetta hvarf sjálfgengt við staðalaðstæður?',
  },
  {
    id: 'stefna-fe-i',
    kind: 'stefna',
    equation: '2Fe³⁺(aq) + 2I⁻(aq) → 2Fe²⁺(aq) + I₂(s)',
    reduced: 'Fe3+/Fe2+',
    oxidised: 'I2/I-',
    question: 'Er þetta hvarf sjálfgengt við staðalaðstæður?',
  },
  {
    id: 'dg-zn-cu',
    kind: 'dg',
    couples: ['Zn2+/Zn', 'Cu2+/Cu'],
    equation: 'Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s)',
    question: 'Hver er ΔG° hvarfsins í kJ?',
  },
  {
    id: 'dg-cu-ag',
    kind: 'dg',
    couples: ['Cu2+/Cu', 'Ag+/Ag'],
    equation: 'Cu(s) + 2Ag⁺(aq) → Cu²⁺(aq) + 2Ag(s)',
    question: 'Hver er ΔG° hvarfsins í kJ?',
  },
  {
    id: 'halfhvarf-mno4',
    kind: 'halfhvarf',
    couple: 'MnO4-/Mn2+',
    question: 'Hvert er stillta hálfhvarfið þegar MnO₄⁻ afoxast í Mn²⁺ í súrri lausn?',
    options: [
      { value: 'MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O' },
      {
        value: 'MnO₄⁻ + 8H⁺ + 3e⁻ → Mn²⁺ + 4H₂O',
        slip: 'Atómin stemma en hleðslan ekki: vinstra megin er hún 7+ − 3 = 4+, hægra megin 2+.',
      },
      {
        value: 'MnO₄⁻ + 4H⁺ + 5e⁻ → Mn²⁺ + 2H₂O',
        slip: 'Fjögur O vinstra megin þurfa fjórar H₂O hægra megin, og þær átta H⁺.',
      },
      {
        value: 'MnO₄⁻ + 4H₂O + 5e⁻ → Mn²⁺ + 8H⁺',
        slip: 'H₂O fer þeim megin sem vantar O, hér hægra megin, og H⁺ á móti.',
      },
    ],
  },
  {
    id: 'halfhvarf-cr2o7',
    kind: 'halfhvarf',
    couple: 'Cr2O72-/Cr3+',
    question: 'Hvert er stillta hálfhvarfið þegar Cr₂O₇²⁻ afoxast í Cr³⁺ í súrri lausn?',
    options: [
      { value: 'Cr₂O₇²⁻ + 14H⁺ + 6e⁻ → 2Cr³⁺ + 7H₂O' },
      {
        value: 'Cr₂O₇²⁻ + 14H⁺ + 3e⁻ → 2Cr³⁺ + 7H₂O',
        slip: 'Hvort Cr tekur við þremur rafeindum, og þau eru tvö: sex rafeindir.',
      },
      {
        value: 'Cr₂O₇²⁻ + 14H⁺ + 6e⁻ → Cr³⁺ + 7H₂O',
        slip: 'Tvö Cr eru vinstra megin, svo 2Cr³⁺ hægra megin. Fyrst eru önnur atóm en O og H stillt.',
      },
      {
        value: 'Cr₂O₇²⁻ + 7H⁺ + 6e⁻ → 2Cr³⁺ + 7H₂O',
        slip: 'Sjö H₂O hafa fjórtán H, svo fjórtán H⁺ vinstra megin.',
      },
    ],
  },
];
