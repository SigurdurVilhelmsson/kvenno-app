export interface ElectronConfigPuzzle {
  id: number;
  element: string;
  elementName_is: string;
  elementName_en: string;
  atomicNumber: number;
  correctConfig: string;
  orbitalOrder: string[];
  electronCounts: number[];
  maxElectrons: number[];
  explanation_is: string;
  explanation_en: string;
}

export const configPuzzles: ElectronConfigPuzzle[] = [
  {
    id: 1,
    element: 'H',
    elementName_is: 'Vetni',
    elementName_en: 'Hydrogen',
    atomicNumber: 1,
    correctConfig: '1s¹',
    orbitalOrder: ['1s'],
    electronCounts: [1],
    maxElectrons: [2],
    explanation_is: 'Vetni hefur 1 rafeind sem fer í 1s svigrúmið.',
    explanation_en: 'Hydrogen has 1 electron which goes into the 1s orbital.',
  },
  {
    id: 2,
    element: 'C',
    elementName_is: 'Kolefni',
    elementName_en: 'Carbon',
    atomicNumber: 6,
    correctConfig: '1s² 2s² 2p²',
    orbitalOrder: ['1s', '2s', '2p'],
    electronCounts: [2, 2, 2],
    maxElectrons: [2, 2, 6],
    explanation_is:
      'Kolefni: 6 rafeindir. Aufbau: 1s² → 2s² → 2p². Regla Hunds: 2p rafeindir dreifastar í aðskilin svigrúm.',
    explanation_en:
      "Carbon: 6 electrons. Aufbau: 1s² → 2s² → 2p². Hund's rule: 2p electrons spread across separate orbitals.",
  },
  {
    id: 3,
    element: 'N',
    elementName_is: 'Nitur',
    elementName_en: 'Nitrogen',
    atomicNumber: 7,
    correctConfig: '1s² 2s² 2p³',
    orbitalOrder: ['1s', '2s', '2p'],
    electronCounts: [2, 2, 3],
    maxElectrons: [2, 2, 6],
    explanation_is: 'Nitur: 7 rafeindir. 2p hefur 3 rafeindir — eina í hverju svigrúmi (Hund).',
    explanation_en:
      "Nitrogen: 7 electrons. 2p has 3 electrons — one in each orbital (Hund's rule).",
  },
  {
    id: 4,
    element: 'O',
    elementName_is: 'Súrefni',
    elementName_en: 'Oxygen',
    atomicNumber: 8,
    correctConfig: '1s² 2s² 2p⁴',
    orbitalOrder: ['1s', '2s', '2p'],
    electronCounts: [2, 2, 4],
    maxElectrons: [2, 2, 6],
    explanation_is:
      'Súrefni: 8 rafeindir. 2p⁴ — eitt 2p svigrúm hefur rafeindarapar, hin tvö hafa einstaka rafeind.',
    explanation_en:
      'Oxygen: 8 electrons. 2p⁴ — one 2p orbital has a pair, the other two have single electrons.',
  },
  {
    id: 5,
    element: 'Na',
    elementName_is: 'Natrín',
    elementName_en: 'Sodium',
    atomicNumber: 11,
    correctConfig: '1s² 2s² 2p⁶ 3s¹',
    orbitalOrder: ['1s', '2s', '2p', '3s'],
    electronCounts: [2, 2, 6, 1],
    maxElectrons: [2, 2, 6, 2],
    explanation_is: 'Natrín: 11 rafeindir. Eftir að 2. skel fyllist (2s²2p⁶) fer 1 rafeind í 3s.',
    explanation_en:
      'Sodium: 11 electrons. After the 2nd shell fills (2s²2p⁶), 1 electron goes to 3s.',
  },
  {
    id: 6,
    element: 'Cl',
    elementName_is: 'Klór',
    elementName_en: 'Chlorine',
    atomicNumber: 17,
    correctConfig: '1s² 2s² 2p⁶ 3s² 3p⁵',
    orbitalOrder: ['1s', '2s', '2p', '3s', '3p'],
    electronCounts: [2, 2, 6, 2, 5],
    maxElectrons: [2, 2, 6, 2, 6],
    explanation_is: 'Klór: 17 rafeindir. 3p⁵ — vantar eina rafeind til að fylla 3p skelina.',
    explanation_en: 'Chlorine: 17 electrons. 3p⁵ — one electron short of filling the 3p subshell.',
  },
  {
    id: 7,
    element: 'Fe',
    elementName_is: 'Járn',
    elementName_en: 'Iron',
    atomicNumber: 26,
    correctConfig: '1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶',
    orbitalOrder: ['1s', '2s', '2p', '3s', '3p', '4s', '3d'],
    electronCounts: [2, 2, 6, 2, 6, 2, 6],
    maxElectrons: [2, 2, 6, 2, 6, 2, 10],
    explanation_is: 'Járn: 26 rafeindir. Aufbau: 4s fyllist FYRIR 3d. Uppsetning: ...4s² 3d⁶.',
    explanation_en: 'Iron: 26 electrons. Aufbau: 4s fills BEFORE 3d. Configuration: ...4s² 3d⁶.',
  },
  {
    id: 8,
    element: 'Kr',
    elementName_is: 'Krypton',
    elementName_en: 'Krypton',
    atomicNumber: 36,
    correctConfig: '1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d¹⁰ 4p⁶',
    orbitalOrder: ['1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p'],
    electronCounts: [2, 2, 6, 2, 6, 2, 10, 6],
    maxElectrons: [2, 2, 6, 2, 6, 2, 10, 6],
    explanation_is: 'Krypton: 36 rafeindir. Eðalgas — allar skeljar fylltar. Mjög stöðugt.',
    explanation_en: 'Krypton: 36 electrons. Noble gas — all subshells filled. Very stable.',
  },
];

const SUPERSCRIPT_MAP: Record<string, string> = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
};

/** Normalize config string for comparison: strip spaces, convert superscripts to digits. */
export function normalizeConfig(input: string): string {
  return input
    .replace(/\s+/g, '')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (c) => SUPERSCRIPT_MAP[c] ?? c)
    .toLowerCase();
}
