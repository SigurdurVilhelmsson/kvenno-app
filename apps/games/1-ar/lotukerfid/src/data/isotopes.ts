/**
 * Meðalatómmassi from isotope abundance — Stig 3, from the book's own examples
 * (`ch02/m68692`, "Atómmassi"). Year-1 plan item 12, 2026-11-15.
 *
 * Every sample is one the book uses, with its numbers as printed: boron in the running
 * text, neon from the solar wind (worked example), magnesium (check your learning),
 * chlorine (the worked example's data run forwards) and copper (the check-your-learning
 * whose answer, 69,15 % Cu-63, the book's numbers give). The answer is derived, never
 * stored: `averageMass` sums mass × abundance.
 */

export interface Isotope {
  /** Mass number, as in the isotope's name. */
  massNumber: number;
  /** Isotope mass, amu, as the book prints it. */
  mass: number;
  /** Natural abundance, percent, as the book prints it. */
  percent: number;
}

export interface IsotopeSample {
  symbol: string;
  /** Nominative, as the sentence opens: `Bór er …`. */
  name: string;
  /** Genitive, after `meðalatómmassi`. */
  genitive: string;
  isotopes: Isotope[];
  /** Why the answer is worth a look, shown after it. */
  note: string;
}

export const ISOTOPE_SAMPLES: IsotopeSample[] = [
  {
    symbol: 'B',
    name: 'Bór',
    genitive: 'bórs',
    isotopes: [
      { massNumber: 10, mass: 10.0129, percent: 19.9 },
      { massNumber: 11, mass: 11.0093, percent: 80.1 },
    ],
    note: 'Ekkert eitt bóratóm vegur 10,81 amu: hvert þeirra vegur um 10 eða um 11 amu. 10,81 er meðaltalið.',
  },
  {
    symbol: 'Ne',
    name: 'Neon úr sólvindinum',
    genitive: 'neons úr sólvindinum',
    isotopes: [
      { massNumber: 20, mass: 19.9924, percent: 91.84 },
      { massNumber: 21, mass: 20.994, percent: 0.47 },
      { massNumber: 22, mass: 21.9914, percent: 7.69 },
    ],
    note: 'Loftsteinn sem fannst í Indiana tók þetta neon upp á ferð sinni um sólkerfið. Neon á jörðinni hefur meðalatómmassann 20,18 amu, og það er talan í lotukerfinu. Gnægð samsætanna fer eftir uppruna sýnisins.',
  },
  {
    symbol: 'Mg',
    name: 'Magnesíum',
    genitive: 'magnesíums',
    isotopes: [
      { massNumber: 24, mass: 23.98, percent: 78.7 },
      { massNumber: 25, mass: 24.99, percent: 10.13 },
      { massNumber: 26, mass: 25.98, percent: 11.17 },
    ],
    note: 'Þetta er talan sem stendur í reit magnesíums í lotukerfinu.',
  },
  {
    symbol: 'Cl',
    name: 'Klór',
    genitive: 'klórs',
    isotopes: [
      { massNumber: 35, mass: 34.96885, percent: 75.76 },
      { massNumber: 37, mass: 36.9659, percent: 24.24 },
    ],
    note: 'Meðaltalið liggur nær 35 en 37 af því að þrjú klóratóm af hverjum fjórum eru Cl-35.',
  },
  {
    symbol: 'Cu',
    name: 'Kopar',
    genitive: 'kopars',
    isotopes: [
      { massNumber: 63, mass: 62.9296, percent: 69.15 },
      { massNumber: 65, mass: 64.9278, percent: 30.85 },
    ],
    note: 'Þess vegna er massatala algengustu samsætu kopars 63, en ekki 64 eins og námundun meðalatómmassans gæfi.',
  },
];

/** Weighted mean: Σ mass × abundance / 100. */
export function averageMass(sample: IsotopeSample): number {
  return sample.isotopes.reduce((sum, iso) => sum + (iso.mass * iso.percent) / 100, 0);
}

/**
 * An answer counts within 0,02 amu. That takes the book's own rounding (it gives boron
 * as 10,8) and rejects every shortcut: the plain mean of the isotope masses, the mass
 * number of the commonest isotope, and, for the solar-wind neon, the table's 20,18.
 */
export const AVERAGE_MASS_TOLERANCE = 0.02;
