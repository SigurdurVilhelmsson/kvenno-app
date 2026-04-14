export interface PeriodicConfigPuzzle {
  id: number;
  element: string;
  elementName_is: string;
  elementName_en: string;
  atomicNumber: number;
  nobleGasCore: string;
  valenceConfig: string;
  fullShorthand: string;
  isException: boolean;
  exceptionExplanation_is?: string;
  exceptionExplanation_en?: string;
  options: string[];
}

export const periodicPuzzles: PeriodicConfigPuzzle[] = [
  {
    id: 1,
    element: 'Ca',
    elementName_is: 'Kalsín',
    elementName_en: 'Calcium',
    atomicNumber: 20,
    nobleGasCore: '[Ar]',
    valenceConfig: '4s²',
    fullShorthand: '[Ar] 4s²',
    isException: false,
    options: ['[Ar] 4s²', '[Ar] 3d²', '[Ne] 3s² 3p⁶ 4s²', '[Ar] 4s¹ 3d¹'],
  },
  {
    id: 2,
    element: 'Ti',
    elementName_is: 'Títan',
    elementName_en: 'Titanium',
    atomicNumber: 22,
    nobleGasCore: '[Ar]',
    valenceConfig: '4s² 3d²',
    fullShorthand: '[Ar] 4s² 3d²',
    isException: false,
    options: ['[Ar] 4s² 3d²', '[Ar] 3d⁴', '[Ar] 4s¹ 3d³', '[Kr] 4s²'],
  },
  {
    id: 3,
    element: 'Cr',
    elementName_is: 'Króm',
    elementName_en: 'Chromium',
    atomicNumber: 24,
    nobleGasCore: '[Ar]',
    valenceConfig: '4s¹ 3d⁵',
    fullShorthand: '[Ar] 4s¹ 3d⁵',
    isException: true,
    exceptionExplanation_is:
      'Króm er undantekning! Hálffyllt d-skel (3d⁵) er sérlega stöðug, svo ein rafeind flytur úr 4s yfir í 3d. Vænt: [Ar] 4s² 3d⁴, raunverulegt: [Ar] 4s¹ 3d⁵.',
    exceptionExplanation_en:
      'Chromium is an exception! A half-filled d-subshell (3d⁵) is especially stable, so one electron transfers from 4s to 3d. Expected: [Ar] 4s² 3d⁴, actual: [Ar] 4s¹ 3d⁵.',
    options: ['[Ar] 4s¹ 3d⁵', '[Ar] 4s² 3d⁴', '[Ar] 3d⁶', '[Ar] 4s² 3d³ 4p¹'],
  },
  {
    id: 4,
    element: 'Cu',
    elementName_is: 'Kopar',
    elementName_en: 'Copper',
    atomicNumber: 29,
    nobleGasCore: '[Ar]',
    valenceConfig: '4s¹ 3d¹⁰',
    fullShorthand: '[Ar] 4s¹ 3d¹⁰',
    isException: true,
    exceptionExplanation_is:
      'Kopar er undantekning! Fullfyllt d-skel (3d¹⁰) er sérlega stöðugt, svo ein rafeind flytur úr 4s yfir í 3d. Vænt: [Ar] 4s² 3d⁹, raunverulegt: [Ar] 4s¹ 3d¹⁰.',
    exceptionExplanation_en:
      'Copper is an exception! A fully filled d-subshell (3d¹⁰) is especially stable, so one electron transfers from 4s to 3d. Expected: [Ar] 4s² 3d⁹, actual: [Ar] 4s¹ 3d¹⁰.',
    options: ['[Ar] 4s¹ 3d¹⁰', '[Ar] 4s² 3d⁹', '[Ar] 3d¹¹', '[Kr] 4s¹'],
  },
  {
    id: 5,
    element: 'Br',
    elementName_is: 'Bróm',
    elementName_en: 'Bromine',
    atomicNumber: 35,
    nobleGasCore: '[Ar]',
    valenceConfig: '4s² 3d¹⁰ 4p⁵',
    fullShorthand: '[Ar] 4s² 3d¹⁰ 4p⁵',
    isException: false,
    options: ['[Ar] 4s² 3d¹⁰ 4p⁵', '[Kr] 4p⁵', '[Ar] 4s² 3d¹⁰ 4p⁶', '[Ar] 4s² 3d⁹ 4p⁶'],
  },
  {
    id: 6,
    element: 'Sr',
    elementName_is: 'Strontín',
    elementName_en: 'Strontium',
    atomicNumber: 38,
    nobleGasCore: '[Kr]',
    valenceConfig: '5s²',
    fullShorthand: '[Kr] 5s²',
    isException: false,
    options: ['[Kr] 5s²', '[Kr] 4d²', '[Ar] 4s² 3d¹⁰ 4p⁶ 5s²', '[Kr] 5s¹ 4d¹'],
  },
  {
    id: 7,
    element: 'Fe',
    elementName_is: 'Járn',
    elementName_en: 'Iron',
    atomicNumber: 26,
    nobleGasCore: '[Ar]',
    valenceConfig: '4s² 3d⁶',
    fullShorthand: '[Ar] 4s² 3d⁶',
    isException: false,
    options: ['[Ar] 4s² 3d⁶', '[Ar] 3d⁸', '[Ar] 4s¹ 3d⁷', '[Kr] 3d⁶'],
  },
  {
    id: 8,
    element: 'Se',
    elementName_is: 'Selen',
    elementName_en: 'Selenium',
    atomicNumber: 34,
    nobleGasCore: '[Ar]',
    valenceConfig: '4s² 3d¹⁰ 4p⁴',
    fullShorthand: '[Ar] 4s² 3d¹⁰ 4p⁴',
    isException: false,
    options: ['[Ar] 4s² 3d¹⁰ 4p⁴', '[Kr] 4p⁴', '[Ar] 4s² 3d¹⁰ 4p⁶', '[Ar] 4s² 3d⁸ 4p⁶'],
  },
];
