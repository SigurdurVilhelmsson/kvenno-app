import { Titration } from '../types';

/**
 * The titrations the levels serve: Level 1 draws its two sample curves from
 * here, and each Level 2 puzzle names one by `titrationId`.
 *
 * Seven more sat here until 2026-10-23 that nothing rendered (mobile-pass
 * decision 115 (a)): two further strong-acid flasks, benzoic acid at a Ka that
 * is not Appendix D's, methylamine, and three polyprotic acids — sulfurous acid,
 * which has no Appendix D row, and oxalic and phosphoric acids, the second at
 * constants that are not Appendix D's either — whose pH branches fell to −∞ or
 * NaN. They were deleted rather than corrected, with the polyprotic maths, as
 * no level draws a polyprotic curve (Level 3's polyprotic problems carry their
 * own data). `titration-data.test.ts` holds both.
 */
export const titrations: Titration[] = [
  // ===== BEGINNER LEVEL (Strong Acid + Strong Base) =====
  {
    id: 1,
    type: 'strong-strong',
    name: 'HCl + NaOH',
    analyte: { formula: 'HCl', volume: 25.0, molarity: 0.1, name: 'Saltsýra' },
    titrant: { formula: 'NaOH', molarity: 0.1, name: 'Natríumhýdroxíð' },
    equivalenceVolume: 25.0,
    equivalencePH: 7.0,
    initialPH: 1.0,
    bestIndicator: 'bromothymol-blue',
    difficulty: 'Byrjandi',
    Ka: null,
    pKa: null,
  },
  {
    id: 2,
    type: 'strong-strong',
    name: 'HNO₃ + KOH',
    analyte: { formula: 'HNO₃', volume: 30.0, molarity: 0.05, name: 'Saltpéturssýra' },
    titrant: { formula: 'KOH', molarity: 0.1, name: 'Kalíumhýdroxíð' },
    equivalenceVolume: 15.0,
    equivalencePH: 7.0,
    initialPH: 1.3,
    bestIndicator: 'bromothymol-blue',
    difficulty: 'Byrjandi',
    Ka: null,
    pKa: null,
  },

  // ===== INTERMEDIATE LEVEL (Weak Acid + Strong Base) =====
  {
    id: 5,
    type: 'weak-strong',
    name: 'CH₃COOH + NaOH',
    analyte: { formula: 'CH₃COOH', volume: 25.0, molarity: 0.1, name: 'Ediksýra' },
    titrant: { formula: 'NaOH', molarity: 0.1, name: 'Natríumhýdroxíð' },
    equivalenceVolume: 25.0,
    equivalencePH: 8.72,
    initialPH: 2.87,
    halfEquivalencePH: 4.74,
    bestIndicator: 'phenolphthalein',
    difficulty: 'Miðlungs',
    Ka: 1.8e-5,
    pKa: 4.74,
  },
  {
    id: 6,
    type: 'weak-strong',
    name: 'HF + NaOH',
    analyte: { formula: 'HF', volume: 30.0, molarity: 0.15, name: 'Flússýra' },
    titrant: { formula: 'NaOH', molarity: 0.1, name: 'Natríumhýdroxíð' },
    equivalenceVolume: 45.0,
    equivalencePH: 8.08,
    initialPH: 2.08,
    halfEquivalencePH: 3.17,
    // Not phenolphthalein, whose range starts at 8,3: the curve reaches pH
    // 7,97 here, printed 8,0 (decision 113 (a)).
    bestIndicator: 'thymol-blue',
    difficulty: 'Miðlungs',
    Ka: 6.8e-4,
    pKa: 3.17,
  },
  {
    id: 7,
    type: 'weak-strong',
    name: 'HCOOH + KOH',
    analyte: { formula: 'HCOOH', volume: 20.0, molarity: 0.2, name: 'Maurasýra' },
    titrant: { formula: 'KOH', molarity: 0.1, name: 'Kalíumhýdroxíð' },
    equivalenceVolume: 40.0,
    equivalencePH: 8.35,
    initialPH: 2.22,
    halfEquivalencePH: 3.74,
    bestIndicator: 'phenolphthalein',
    difficulty: 'Miðlungs',
    Ka: 1.8e-4,
    pKa: 3.74,
  },

  // ===== INTERMEDIATE LEVEL (Weak Base + Strong Acid) =====
  {
    id: 9,
    type: 'strong-weak',
    name: 'NH₃ + HCl',
    analyte: { formula: 'NH₃', volume: 25.0, molarity: 0.1, name: 'Ammóníak' },
    titrant: { formula: 'HCl', molarity: 0.1, name: 'Saltsýra' },
    equivalenceVolume: 25.0,
    equivalencePH: 5.28,
    initialPH: 11.13,
    halfEquivalencePH: 9.26,
    bestIndicator: 'methyl-red',
    difficulty: 'Miðlungs',
    Kb: 1.8e-5,
    pKa: 9.26,
  },
];

/**
 * Get titrations filtered by difficulty level
 */
export function getTitrationsByDifficulty(difficulty: string): Titration[] {
  return titrations.filter((t) => t.difficulty === difficulty);
}

/**
 * Get a random titration
 */
export function getRandomTitration(): Titration {
  return titrations[Math.floor(Math.random() * titrations.length)];
}

/**
 * Get a titration by ID
 */
export function getTitrationById(id: number): Titration | undefined {
  return titrations.find((t) => t.id === id);
}
