/**
 * Vapour pressures at 20 °C, transcribed from the school's book. Nothing here is typed into
 * the Nærmynd scenes: they read it.
 *
 * - The four alcohols: the table in ch10/m68768 (Fasabreytingar), whose column header says
 *   20 °C. The table's own summary line says 25 °C; the header and the exercise text both say
 *   20 °C, and that is the reading taken. (The book writes the term without -nar-; the
 *   platform's word is gufunarþrýstingur, decision 18, so the book's spelling is not quoted.)
 * - Water: appendix m68863, the table of water's vapour pressure by temperature, 2333,135 Pa
 *   at 20 °C and 101324,7 Pa at 100 °C.
 *
 * The book prints no number for diethyl ether or methane, so neither is here.
 */

export interface Liquid {
  id: 'vatn' | 'metanol' | 'etanol' | 'propanol' | 'butanol';
  name: string;
  formula: string;
  /** kPa at 20 °C. */
  kPa: number;
  /** Decimals the book prints it to. */
  decimals: number;
  /** Carbon atoms per molecule; every liquid here makes hydrogen bonds through its -OH. */
  carbons: number;
}

export const LIQUIDS: Liquid[] = [
  { id: 'vatn', name: 'vatn', formula: 'H₂O', kPa: 2.333135, decimals: 2, carbons: 0 },
  { id: 'metanol', name: 'metanól', formula: 'CH₃OH', kPa: 11.9, decimals: 1, carbons: 1 },
  { id: 'etanol', name: 'etanól', formula: 'C₂H₅OH', kPa: 5.95, decimals: 2, carbons: 2 },
  { id: 'propanol', name: 'própanól', formula: 'C₃H₇OH', kPa: 2.67, decimals: 2, carbons: 3 },
  { id: 'butanol', name: 'bútanól', formula: 'C₄H₉OH', kPa: 0.56, decimals: 2, carbons: 4 },
];

/** Water's vapour pressure at 100 °C, kPa (m68863), and standard air pressure (m68768). */
export const WATER_AT_100_KPA = 101.3247;
export const ONE_ATM_KPA = 101.3;
