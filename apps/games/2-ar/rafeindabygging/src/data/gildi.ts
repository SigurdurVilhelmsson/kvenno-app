/**
 * Gildisrafeindir og jónir: the elements Kanna offers and the ten Æfa items. No answer is stored:
 * each is worked out from Z by `engine/gildi.ts`, and `gildi.test.ts` checks that every item
 * offers it exactly once. The wrong options are the slips a student makes, each with a line
 * saying what it would mean.
 */

import type { Sides } from '../engine/gildi';

export interface KannaElement {
  z: number;
  symbol: string;
  name: string;
  /** The ion the element usually forms, where the book names one; none for C, Si, B, the noble gases. */
  ion?: number;
}

/** Main-group elements of periods 2–4. Helium is left out: its two dots are a pair, not a rule. */
export const KANNA_ELEMENTS: readonly KannaElement[] = [
  { z: 3, symbol: 'Li', name: 'Litíum', ion: 1 },
  { z: 4, symbol: 'Be', name: 'Beryllíum', ion: 2 },
  { z: 5, symbol: 'B', name: 'Bór' },
  { z: 6, symbol: 'C', name: 'Kolefni' },
  { z: 7, symbol: 'N', name: 'Nitur', ion: -3 },
  { z: 8, symbol: 'O', name: 'Súrefni', ion: -2 },
  { z: 9, symbol: 'F', name: 'Flúor', ion: -1 },
  { z: 10, symbol: 'Ne', name: 'Neon' },
  { z: 11, symbol: 'Na', name: 'Natríum', ion: 1 },
  { z: 12, symbol: 'Mg', name: 'Magnesíum', ion: 2 },
  { z: 13, symbol: 'Al', name: 'Ál', ion: 3 },
  { z: 14, symbol: 'Si', name: 'Kísill' },
  { z: 15, symbol: 'P', name: 'Fosfór', ion: -3 },
  { z: 16, symbol: 'S', name: 'Brennisteinn', ion: -2 },
  { z: 17, symbol: 'Cl', name: 'Klór', ion: -1 },
  { z: 18, symbol: 'Ar', name: 'Argon' },
  { z: 19, symbol: 'K', name: 'Kalíum', ion: 1 },
  { z: 20, symbol: 'Ca', name: 'Kalsíum', ion: 2 },
  { z: 31, symbol: 'Ga', name: 'Gallíum', ion: 3 },
  { z: 32, symbol: 'Ge', name: 'Germaníum' },
  { z: 33, symbol: 'As', name: 'Arsen' },
  { z: 34, symbol: 'Se', name: 'Selen', ion: -2 },
  { z: 35, symbol: 'Br', name: 'Bróm', ion: -1 },
  { z: 36, symbol: 'Kr', name: 'Krypton' },
];

interface Base {
  id: string;
  z: number;
  symbol: string;
  /** The question as the student reads it. */
  question: string;
}

export interface ValenceItem extends Base {
  kind: 'gildi';
  options: readonly { value: number; slip?: string }[];
}

export interface LewisItem extends Base {
  kind: 'lewis';
  options: readonly { value: Sides; slip?: string }[];
}

export interface IonItem extends Base {
  kind: 'jon';
  charge: number;
  options: readonly { value: string; slip?: string }[];
}

export type GildiItem = ValenceItem | LewisItem | IonItem;

export const GILDI_ITEMS: readonly GildiItem[] = [
  {
    id: 'gildi-p',
    kind: 'gildi',
    z: 15,
    symbol: 'P',
    question: 'Hve margar gildisrafeindir hefur fosfór (P)?',
    options: [
      { value: 5 },
      { value: 15, slip: '15 er sætistala fosfórs, fjöldi allra rafeinda atómsins.' },
      { value: 3, slip: 'Þú taldir aðeins 3p. 3s-rafeindirnar eru líka í ysta hvolfinu, n = 3.' },
      { value: 2, slip: 'Þú taldir aðeins 3s. 3p-rafeindirnar eru líka í ysta hvolfinu, n = 3.' },
    ],
  },
  {
    id: 'gildi-br',
    kind: 'gildi',
    z: 35,
    symbol: 'Br',
    question: 'Hve margar gildisrafeindir hefur bróm (Br)?',
    options: [
      { value: 7 },
      {
        value: 17,
        slip: 'Þú taldir 3d¹⁰ með. Fullfyllt d-undirhvolf undir ysta hvolfinu telst til kjarnarafeinda.',
      },
      { value: 5, slip: 'Þú taldir aðeins 4p. 4s-rafeindirnar eru líka í ysta hvolfinu, n = 4.' },
      { value: 35, slip: '35 er sætistala bróms, fjöldi allra rafeinda atómsins.' },
    ],
  },
  {
    id: 'lewis-n',
    kind: 'lewis',
    z: 7,
    symbol: 'N',
    question: 'Hvert er Lewis-tákn niturs (N)?',
    options: [
      { value: [2, 1, 1, 1] },
      {
        value: [2, 2, 1, 0],
        slip: 'Fjöldinn er réttur, en punktarnir fara fyrst einn á hverja hlið og para sig svo.',
      },
      { value: [1, 1, 1, 0], slip: 'Þrír punktar eru aðeins 2p-rafeindirnar; 2s² telst líka með.' },
      {
        value: [2, 2, 2, 1],
        slip: 'Sjö er sætistala niturs. Punktarnir sýna aðeins gildisrafeindir.',
      },
    ],
  },
  {
    id: 'lewis-cl',
    kind: 'lewis',
    z: 17,
    symbol: 'Cl',
    question: 'Hvert er Lewis-tákn klórs (Cl)?',
    options: [
      { value: [2, 2, 2, 1] },
      {
        value: [2, 2, 2, 2],
        slip: 'Átta punktar eru klóríðjónin, Cl⁻, sem hefur fengið eina rafeind. Atómið hefur sjö.',
      },
      {
        value: [1, 0, 0, 0],
        slip: 'Einn punktur er rafeindin sem klór vantar upp á átta, ekki þær sem það hefur.',
      },
      { value: [2, 2, 1, 0], slip: 'Fimm punktar eru aðeins 3p-rafeindirnar; 3s² telst líka með.' },
    ],
  },
  {
    id: 'jon-na',
    kind: 'jon',
    z: 11,
    symbol: 'Na',
    charge: 1,
    question: 'Hver er rafeindaskipan Na⁺?',
    options: [
      { value: '[Ne]' },
      { value: '[Ne] 3s¹', slip: 'Þetta er óhlaðna natríumatómið. Na⁺ hefur misst eina rafeind.' },
      {
        value: '[Ne] 3s²',
        slip: 'Hér var rafeind bætt við. Jákvæð hleðsla þýðir að jónin hefur misst rafeind.',
      },
      {
        value: '[He] 2s² 2p⁵',
        slip: 'Hér var rafeindin tekin úr 2p. Hún fer úr ysta hvolfinu, 3s.',
      },
    ],
  },
  {
    id: 'jon-o',
    kind: 'jon',
    z: 8,
    symbol: 'O',
    charge: -2,
    question: 'Hver er rafeindaskipan O²⁻?',
    options: [
      { value: '[Ne]' },
      {
        value: '[He] 2s² 2p⁴',
        slip: 'Þetta er óhlaðna súrefnisatómið. O²⁻ hefur fengið tvær rafeindir.',
      },
      {
        value: '[He] 2s² 2p²',
        slip: 'Hér voru tvær rafeindir teknar burt. Neikvæð hleðsla þýðir að jónin hefur fengið rafeindir.',
      },
      {
        value: '[Ne] 3s²',
        slip: 'Rafeindirnar fara í næsta lausa svigrúm, og 2p-undirhvolfið var ekki fullt.',
      },
    ],
  },
  {
    id: 'jon-al',
    kind: 'jon',
    z: 13,
    symbol: 'Al',
    charge: 3,
    question: 'Hver er rafeindaskipan Al³⁺?',
    options: [
      { value: '[Ne]' },
      {
        value: '[Ne] 3s²',
        slip: 'Þetta er Al⁺: aðeins 3p-rafeindin er farin. Al³⁺ missir líka bæði 3s.',
      },
      { value: '[Ne] 3s¹', slip: 'Þetta er Al²⁺. Al³⁺ missir þrjár rafeindir, allar úr n = 3.' },
      {
        value: '[Ne] 3s² 3p⁴',
        slip: 'Hér var rafeindum bætt við. Jákvæð hleðsla þýðir að jónin hefur misst rafeindir.',
      },
    ],
  },
  {
    id: 'jon-fe2',
    kind: 'jon',
    z: 26,
    symbol: 'Fe',
    charge: 2,
    question: 'Hver er rafeindaskipan Fe²⁺?',
    options: [
      { value: '[Ar] 3d⁶' },
      {
        value: '[Ar] 4s² 3d⁴',
        slip: '3d fylltist síðast, en hliðarmálmur missir 4s-rafeindirnar fyrst: þær hafa hærra n.',
      },
      {
        value: '[Ar] 4s² 3d⁶',
        slip: 'Þetta er óhlaðna járnatómið. Fe²⁺ hefur misst tvær rafeindir.',
      },
      { value: '[Ar] 4s¹ 3d⁵', slip: 'Báðar rafeindirnar fara úr 4s, ekki ein úr hvoru.' },
    ],
  },
  {
    id: 'jon-fe3',
    kind: 'jon',
    z: 26,
    symbol: 'Fe',
    charge: 3,
    question: 'Hver er rafeindaskipan Fe³⁺?',
    options: [
      { value: '[Ar] 3d⁵' },
      {
        value: '[Ar] 4s² 3d³',
        slip: '3d fylltist síðast, en hliðarmálmur missir 4s-rafeindirnar fyrst: þær hafa hærra n.',
      },
      { value: '[Ar] 3d⁶', slip: 'Þetta er Fe²⁺. Fe³⁺ missir eina rafeind í viðbót, úr 3d.' },
      { value: '[Ar] 4s¹ 3d⁴', slip: 'Fyrst fara báðar 4s-rafeindirnar, svo ein úr 3d.' },
    ],
  },
  {
    id: 'jon-cu2',
    kind: 'jon',
    z: 29,
    symbol: 'Cu',
    charge: 2,
    question: 'Hver er rafeindaskipan Cu²⁺?',
    options: [
      { value: '[Ar] 3d⁹' },
      { value: '[Ar] 3d¹⁰', slip: 'Þetta er Cu⁺. Cu²⁺ missir eina rafeind í viðbót, úr 3d.' },
      {
        value: '[Ar] 4s² 3d⁷',
        slip: 'Hér fóru tvær rafeindir úr 3d. Kopar er undantekning, [Ar] 4s¹ 3d¹⁰, og 4s-rafeindin fer fyrst.',
      },
      {
        value: '[Ar] 4s¹ 3d⁸',
        slip: 'Hliðarmálmur missir 4s-rafeindina fyrst, og svo eina úr 3d.',
      },
    ],
  },
];

/** Each element's name, for the explanation lines. */
export const NAME_OF: Record<string, string> = Object.fromEntries(
  KANNA_ELEMENTS.map((e) => [e.symbol, e.name])
);
NAME_OF.Fe = 'Járn';
NAME_OF.Cu = 'Kopar';
