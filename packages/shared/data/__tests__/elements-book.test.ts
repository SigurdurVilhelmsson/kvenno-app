/**
 * `elements.ts` against the school's own periodic table.
 *
 * The Icelandic textbook's periodic table (appendix `m68859`, _Lotukerfið_)
 * prints each element's atomic mass, mostly to four significant figures. The
 * platform's table carries more figures (`24.305` for magnesium against the
 * book's `24,31`), so each stored mass is compared at the precision the book
 * prints it to: it must round, half up, to the book's value. This is the
 * arrangement `appendix-d.ts` and `thermo.ts` already have with their sources.
 *
 * The book's values are transcribed below as printed, comma and all, from the
 * table's alt text in `books/efnafraedi-2e/02-mt-output/appendices/m68859`.
 * They agreed on 2026-11-15 (year-1 audit); nothing held them together before.
 */
import { describe, expect, it } from 'vitest';

import { ATOMIC_MASSES, type ElementSymbol } from '../elements';

/** The book's atomic masses, as printed in `m68859`, with its atomic number and name. */
const BOOK: Record<ElementSymbol, string> = {
  H: '1,008', // 1 vetni
  He: '4,003', // 2 helíum
  Li: '6,94', // 3 litíum
  Be: '9,012', // 4 beryllíum
  B: '10,81', // 5 bór
  C: '12,01', // 6 kolefni
  N: '14,01', // 7 nitur
  O: '16,00', // 8 súrefni
  F: '19,00', // 9 flúor
  Ne: '20,18', // 10 neon
  Na: '22,99', // 11 natríum
  Mg: '24,31', // 12 magnesíum
  Al: '26,98', // 13 ál
  Si: '28,09', // 14 kísill
  P: '30,97', // 15 fosfór
  S: '32,06', // 16 brennisteinn
  Cl: '35,45', // 17 klór
  Ar: '39,95', // 18 argon
  K: '39,10', // 19 kalíum
  Ca: '40,08', // 20 kalsíum
  Sc: '44,96', // 21 skandíum
  Ti: '47,87', // 22 títan
  V: '50,94', // 23 vanadíum
  Cr: '52,00', // 24 króm
  Mn: '54,94', // 25 mangan
  Fe: '55,85', // 26 járn
  Co: '58,93', // 27 kóbalt
  Ni: '58,69', // 28 nikkel
  Cu: '63,55', // 29 kopar
  Zn: '65,38', // 30 sink
  Ga: '69,72', // 31 gallíum
  Ge: '72,63', // 32 german
  As: '74,92', // 33 arsen
  Se: '78,97', // 34 selen
  Br: '79,90', // 35 bróm
  Kr: '83,80', // 36 krypton
  Ag: '107,9', // 47 silfur
  I: '126,9', // 53 joð
  Ba: '137,3', // 56 barín
  Au: '197,0', // 79 gull
  Hg: '200,6', // 80 kvikasilfur
  Pb: '207,2', // 82 blý
};

/** Decimals the book prints, and the value as a number. */
function read(printed: string): { decimals: number; value: number } {
  const [, frac = ''] = printed.split(',');
  return { decimals: frac.length, value: Number(printed.replace(',', '.')) };
}

/**
 * Whether `stored` rounds half up to `value` at `decimals` places. Compared as
 * a distance rather than with `toFixed`, which rounds 24.305 down to 24.30 in
 * binary floating point while the book prints 24,31.
 */
function roundsTo(stored: number, value: number, decimals: number): boolean {
  const half = 0.5 * 10 ** -decimals;
  const diff = stored - value;
  return diff >= -half - 1e-9 && diff < half - 1e-9;
}

describe('elements.ts against the book periodic table (m68859)', () => {
  it('has a book value for every element the platform weighs', () => {
    expect(Object.keys(BOOK).sort()).toEqual(Object.keys(ATOMIC_MASSES).sort());
  });

  it.each(Object.entries(ATOMIC_MASSES) as [ElementSymbol, number][])(
    '%s rounds to the mass the book prints',
    (symbol, stored) => {
      const { decimals, value } = read(BOOK[symbol]);
      expect(
        roundsTo(stored, value, decimals),
        `${symbol}: ${stored} against ${BOOK[symbol]}`
      ).toBe(true);
    }
  );

  it('rejects a mass that does not round to the book value', () => {
    // Guards the comparison itself: a check that passes everything holds nothing.
    expect(roundsTo(24.305, 24.31, 2)).toBe(true);
    expect(roundsTo(55.845, 55.85, 2)).toBe(true);
    expect(roundsTo(24.315, 24.31, 2)).toBe(false);
    expect(roundsTo(24.3, 24.31, 2)).toBe(false);
    expect(roundsTo(107.95, 107.9, 1)).toBe(false);
  });
});
