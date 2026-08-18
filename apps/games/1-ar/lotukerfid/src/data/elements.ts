// Chemical elements database with periodic table positioning
export interface Element {
  symbol: string;
  name: string;
  atomicMass: number;
  /** Mass number (protons + neutrons) of the most abundant natural isotope.
   *  NOT the rounded atomicMass -- that is a weighted average over isotopes,
   *  so rounding it names the wrong nuclide for eleven records in this file:
   *  Ni, Cu, Zn, Ga, Ge, Se, Br (inside Level 3's period<=4 pool) and
   *  Ag, Ba, Hg, Pb (outside it). Source: NIST atomic weights and isotopic
   *  compositions, cross-checked against CIAAW.
   *
   *  Lead is the one representative rather than invariant value: Pb-206/207/208
   *  are decay end-products, so the composition varies with ore provenance.
   *  Pb-208 (~52.4%) is NIST's representative figure and Pb-207 is never the
   *  majority isotope, so the entry is safe -- but it is not a constant of
   *  nature the way F-19 is. */
  massNumber: number;
  atomicNumber: number;
  period: number;
  group: number;
  category: ElementCategory;
}

export type ElementCategory =
  | 'alkali-metal'
  | 'alkaline-earth'
  | 'transition-metal'
  | 'post-transition-metal'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble-gas'
  | 'lanthanide'
  | 'actinide';

// Category colors for visual styling
export const CATEGORY_COLORS: Record<
  ElementCategory,
  { bg: string; text: string; border: string }
> = {
  'alkali-metal': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  'alkaline-earth': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  'transition-metal': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  'post-transition-metal': {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
  },
  metalloid: { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
  nonmetal: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  halogen: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
  'noble-gas': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  lanthanide: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
  actinide: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
};

// Category labels in Icelandic
export const CATEGORY_LABELS: Record<ElementCategory, string> = {
  'alkali-metal': 'Alkalímálmur',
  'alkaline-earth': 'Jarðalkalímálmur',
  'transition-metal': 'Skiptimálmur',
  'post-transition-metal': 'P-málmur',
  metalloid: 'Hálfmálmur',
  nonmetal: 'Ómálmur',
  halogen: 'Halógen',
  'noble-gas': 'Eðallofttegund',
  lanthanide: 'Lantaníð',
  actinide: 'Aktíníð',
};

// Classification: metal, nonmetal, or metalloid
export type ElementClassification = 'málmur' | 'málmleysingi' | 'hálfmálmur';

export function getClassification(category: ElementCategory): ElementClassification {
  if (category === 'metalloid') return 'hálfmálmur';
  if (category === 'nonmetal' || category === 'halogen' || category === 'noble-gas')
    return 'málmleysingi';
  return 'málmur';
}

// First 36 elements (up to Kr) - commonly used in chemistry education
export const ELEMENTS: Element[] = [
  // Period 1
  {
    symbol: 'H',
    name: 'Vetni',
    atomicMass: 1.008,
    massNumber: 1,
    atomicNumber: 1,
    period: 1,
    group: 1,
    category: 'nonmetal',
  },
  {
    symbol: 'He',
    name: 'Helíum',
    atomicMass: 4.003,
    massNumber: 4,
    atomicNumber: 2,
    period: 1,
    group: 18,
    category: 'noble-gas',
  },

  // Period 2
  {
    symbol: 'Li',
    name: 'Litíum',
    atomicMass: 6.941,
    massNumber: 7,
    atomicNumber: 3,
    period: 2,
    group: 1,
    category: 'alkali-metal',
  },
  {
    symbol: 'Be',
    name: 'Beryllíum',
    atomicMass: 9.012,
    massNumber: 9,
    atomicNumber: 4,
    period: 2,
    group: 2,
    category: 'alkaline-earth',
  },
  {
    symbol: 'B',
    name: 'Bór',
    atomicMass: 10.81,
    massNumber: 11,
    atomicNumber: 5,
    period: 2,
    group: 13,
    category: 'metalloid',
  },
  {
    symbol: 'C',
    name: 'Kolefni',
    atomicMass: 12.011,
    massNumber: 12,
    atomicNumber: 6,
    period: 2,
    group: 14,
    category: 'nonmetal',
  },
  {
    symbol: 'N',
    name: 'Köfnunarefni',
    atomicMass: 14.007,
    massNumber: 14,
    atomicNumber: 7,
    period: 2,
    group: 15,
    category: 'nonmetal',
  },
  {
    symbol: 'O',
    name: 'Súrefni',
    atomicMass: 15.999,
    massNumber: 16,
    atomicNumber: 8,
    period: 2,
    group: 16,
    category: 'nonmetal',
  },
  {
    symbol: 'F',
    name: 'Flúor',
    atomicMass: 18.998,
    massNumber: 19,
    atomicNumber: 9,
    period: 2,
    group: 17,
    category: 'halogen',
  },
  {
    symbol: 'Ne',
    name: 'Neon',
    atomicMass: 20.18,
    massNumber: 20,
    atomicNumber: 10,
    period: 2,
    group: 18,
    category: 'noble-gas',
  },

  // Period 3
  {
    symbol: 'Na',
    name: 'Natríum',
    atomicMass: 22.99,
    massNumber: 23,
    atomicNumber: 11,
    period: 3,
    group: 1,
    category: 'alkali-metal',
  },
  {
    symbol: 'Mg',
    name: 'Magnesíum',
    atomicMass: 24.305,
    massNumber: 24,
    atomicNumber: 12,
    period: 3,
    group: 2,
    category: 'alkaline-earth',
  },
  {
    symbol: 'Al',
    name: 'Ál',
    atomicMass: 26.982,
    massNumber: 27,
    atomicNumber: 13,
    period: 3,
    group: 13,
    category: 'post-transition-metal',
  },
  {
    symbol: 'Si',
    name: 'Kísill',
    atomicMass: 28.086,
    massNumber: 28,
    atomicNumber: 14,
    period: 3,
    group: 14,
    category: 'metalloid',
  },
  {
    symbol: 'P',
    name: 'Fosfór',
    atomicMass: 30.974,
    massNumber: 31,
    atomicNumber: 15,
    period: 3,
    group: 15,
    category: 'nonmetal',
  },
  {
    symbol: 'S',
    name: 'Brennisteinn',
    atomicMass: 32.06,
    massNumber: 32,
    atomicNumber: 16,
    period: 3,
    group: 16,
    category: 'nonmetal',
  },
  {
    symbol: 'Cl',
    name: 'Klór',
    atomicMass: 35.45,
    massNumber: 35,
    atomicNumber: 17,
    period: 3,
    group: 17,
    category: 'halogen',
  },
  {
    symbol: 'Ar',
    name: 'Argon',
    atomicMass: 39.948,
    massNumber: 40,
    atomicNumber: 18,
    period: 3,
    group: 18,
    category: 'noble-gas',
  },

  // Period 4
  {
    symbol: 'K',
    name: 'Kalíum',
    atomicMass: 39.098,
    massNumber: 39,
    atomicNumber: 19,
    period: 4,
    group: 1,
    category: 'alkali-metal',
  },
  {
    symbol: 'Ca',
    name: 'Kalsíum',
    atomicMass: 40.078,
    massNumber: 40,
    atomicNumber: 20,
    period: 4,
    group: 2,
    category: 'alkaline-earth',
  },
  {
    symbol: 'Sc',
    name: 'Skandíum',
    atomicMass: 44.956,
    massNumber: 45,
    atomicNumber: 21,
    period: 4,
    group: 3,
    category: 'transition-metal',
  },
  {
    symbol: 'Ti',
    name: 'Títan',
    atomicMass: 47.867,
    massNumber: 48,
    atomicNumber: 22,
    period: 4,
    group: 4,
    category: 'transition-metal',
  },
  {
    symbol: 'V',
    name: 'Vanadíum',
    atomicMass: 50.942,
    massNumber: 51,
    atomicNumber: 23,
    period: 4,
    group: 5,
    category: 'transition-metal',
  },
  {
    symbol: 'Cr',
    name: 'Króm',
    atomicMass: 51.996,
    massNumber: 52,
    atomicNumber: 24,
    period: 4,
    group: 6,
    category: 'transition-metal',
  },
  {
    symbol: 'Mn',
    name: 'Mangan',
    atomicMass: 54.938,
    massNumber: 55,
    atomicNumber: 25,
    period: 4,
    group: 7,
    category: 'transition-metal',
  },
  {
    symbol: 'Fe',
    name: 'Járn',
    atomicMass: 55.845,
    massNumber: 56,
    atomicNumber: 26,
    period: 4,
    group: 8,
    category: 'transition-metal',
  },
  {
    symbol: 'Co',
    name: 'Kóbalt',
    atomicMass: 58.933,
    massNumber: 59,
    atomicNumber: 27,
    period: 4,
    group: 9,
    category: 'transition-metal',
  },
  {
    symbol: 'Ni',
    name: 'Nikkel',
    atomicMass: 58.693,
    massNumber: 58,
    atomicNumber: 28,
    period: 4,
    group: 10,
    category: 'transition-metal',
  },
  {
    symbol: 'Cu',
    name: 'Kopar',
    atomicMass: 63.546,
    massNumber: 63,
    atomicNumber: 29,
    period: 4,
    group: 11,
    category: 'transition-metal',
  },
  {
    symbol: 'Zn',
    name: 'Sink',
    atomicMass: 65.38,
    massNumber: 64,
    atomicNumber: 30,
    period: 4,
    group: 12,
    category: 'transition-metal',
  },
  {
    symbol: 'Ga',
    name: 'Gallíum',
    atomicMass: 69.723,
    massNumber: 69,
    atomicNumber: 31,
    period: 4,
    group: 13,
    category: 'post-transition-metal',
  },
  {
    symbol: 'Ge',
    name: 'Germaníum',
    atomicMass: 72.63,
    massNumber: 74,
    atomicNumber: 32,
    period: 4,
    group: 14,
    category: 'metalloid',
  },
  {
    symbol: 'As',
    name: 'Arsen',
    atomicMass: 74.922,
    massNumber: 75,
    atomicNumber: 33,
    period: 4,
    group: 15,
    category: 'metalloid',
  },
  {
    symbol: 'Se',
    name: 'Selen',
    atomicMass: 78.971,
    massNumber: 80,
    atomicNumber: 34,
    period: 4,
    group: 16,
    category: 'nonmetal',
  },
  {
    symbol: 'Br',
    name: 'Bróm',
    atomicMass: 79.904,
    massNumber: 79,
    atomicNumber: 35,
    period: 4,
    group: 17,
    category: 'halogen',
  },
  {
    symbol: 'Kr',
    name: 'Krypton',
    atomicMass: 83.798,
    massNumber: 84,
    atomicNumber: 36,
    period: 4,
    group: 18,
    category: 'noble-gas',
  },

  // Additional commonly used elements (Period 5+)
  {
    symbol: 'Ag',
    name: 'Silfur',
    atomicMass: 107.868,
    massNumber: 107,
    atomicNumber: 47,
    period: 5,
    group: 11,
    category: 'transition-metal',
  },
  {
    symbol: 'I',
    name: 'Joð',
    atomicMass: 126.904,
    massNumber: 127,
    atomicNumber: 53,
    period: 5,
    group: 17,
    category: 'halogen',
  },
  {
    symbol: 'Ba',
    name: 'Baríum',
    atomicMass: 137.327,
    massNumber: 138,
    atomicNumber: 56,
    period: 6,
    group: 2,
    category: 'alkaline-earth',
  },
  {
    symbol: 'Au',
    name: 'Gull',
    atomicMass: 196.967,
    massNumber: 197,
    atomicNumber: 79,
    period: 6,
    group: 11,
    category: 'transition-metal',
  },
  {
    symbol: 'Hg',
    name: 'Kvikasilfur',
    atomicMass: 200.592,
    massNumber: 202,
    atomicNumber: 80,
    period: 6,
    group: 12,
    category: 'transition-metal',
  },
  {
    symbol: 'Pb',
    name: 'Blý',
    atomicMass: 207.2,
    massNumber: 208,
    atomicNumber: 82,
    period: 6,
    group: 14,
    category: 'post-transition-metal',
  },
];

// Helper to get element by symbol
export function getElementBySymbol(symbol: string): Element | undefined {
  return ELEMENTS.find((e) => e.symbol === symbol);
}

// Get elements for a specific period
export function getElementsByPeriod(period: number): Element[] {
  return ELEMENTS.filter((e) => e.period === period).sort((a, b) => a.group - b.group);
}

// Get elements for a specific group
export function getElementsByGroup(group: number): Element[] {
  return ELEMENTS.filter((e) => e.group === group).sort((a, b) => a.period - b.period);
}

// Group names in Icelandic for Level 2
export const GROUP_NAMES: Record<number, string> = {
  1: 'Alkalímálmar (og vetni)',
  2: 'Jarðalkalímálmar',
  17: 'Halógen',
  18: 'Eðallofttegundir',
};
