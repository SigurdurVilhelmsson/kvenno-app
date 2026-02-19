import { Titration } from '../types';

/**
 * Complete bank of titration problems
 * Currently: 13 titrations implemented
 * Planned expansion: 30 total titrations
 */
export const titrations: Titration[] = [
  // ===== BEGINNER LEVEL (Strong Acid + Strong Base) =====
  {
    id: 1,
    type: 'strong-strong',
    name: 'HCl + NaOH',
    analyte: { formula: 'HCl', volume: 25.0, molarity: 0.100, name: 'Saltssýra' },
    titrant: { formula: 'NaOH', molarity: 0.100, name: 'Natríumhýdroxíð' },
    equivalenceVolume: 25.0,
    equivalencePH: 7.00,
    initialPH: 1.00,
    bestIndicator: 'bromothymol-blue',
    difficulty: 'Byrjandi',
    Ka: null,
    pKa: null
  },
  {
    id: 2,
    type: 'strong-strong',
    name: 'HNO₃ + KOH',
    analyte: { formula: 'HNO₃', volume: 30.0, molarity: 0.0500, name: 'Saltpéturssýra' },
    titrant: { formula: 'KOH', molarity: 0.100, name: 'Kalíumhýdroxíð' },
    equivalenceVolume: 15.0,
    equivalencePH: 7.00,
    initialPH: 1.30,
    bestIndicator: 'bromothymol-blue',
    difficulty: 'Byrjandi',
    Ka: null,
    pKa: null
  },
  {
    id: 3,
    type: 'strong-strong',
    name: 'HCl + NaOH',
    analyte: { formula: 'HCl', volume: 50.0, molarity: 0.200, name: 'Saltssýra' },
    titrant: { formula: 'NaOH', molarity: 0.100, name: 'Natríumhýdroxíð' },
    equivalenceVolume: 100.0,
    equivalencePH: 7.00,
    initialPH: 0.70,
    bestIndicator: 'bromothymol-blue',
    difficulty: 'Byrjandi',
    Ka: null,
    pKa: null
  },
  {
    id: 4,
    type: 'strong-strong',
    name: 'HClO₄ + LiOH',
    analyte: { formula: 'HClO₄', volume: 15.0, molarity: 0.125, name: 'Perklórsýra' },
    titrant: { formula: 'LiOH', molarity: 0.100, name: 'Litíumhýdroxíð' },
    equivalenceVolume: 18.75,
    equivalencePH: 7.00,
    initialPH: 0.90,
    bestIndicator: 'phenolphthalein',
    difficulty: 'Byrjandi',
    Ka: null,
    pKa: null
  },

  // ===== INTERMEDIATE LEVEL (Weak Acid + Strong Base) =====
  {
    id: 5,
    type: 'weak-strong',
    name: 'CH₃COOH + NaOH',
    analyte: { formula: 'CH₃COOH', volume: 25.0, molarity: 0.100, name: 'Ediksýra' },
    titrant: { formula: 'NaOH', molarity: 0.100, name: 'Natríumhýdroxíð' },
    equivalenceVolume: 25.0,
    equivalencePH: 8.72,
    initialPH: 2.87,
    halfEquivalencePH: 4.74,
    bestIndicator: 'phenolphthalein',
    difficulty: 'Miðlungs',
    Ka: 1.8e-5,
    pKa: 4.74
  },
  {
    id: 6,
    type: 'weak-strong',
    name: 'HF + NaOH',
    analyte: { formula: 'HF', volume: 30.0, molarity: 0.150, name: 'Flússýra' },
    titrant: { formula: 'NaOH', molarity: 0.100, name: 'Natríumhýdroxíð' },
    equivalenceVolume: 45.0,
    equivalencePH: 8.08,
    initialPH: 2.08,
    halfEquivalencePH: 3.17,
    bestIndicator: 'phenolphthalein',
    difficulty: 'Miðlungs',
    Ka: 6.8e-4,
    pKa: 3.17
  },
  {
    id: 7,
    type: 'weak-strong',
    name: 'HCOOH + KOH',
    analyte: { formula: 'HCOOH', volume: 20.0, molarity: 0.200, name: 'Maurasýra' },
    titrant: { formula: 'KOH', molarity: 0.100, name: 'Kalíumhýdroxíð' },
    equivalenceVolume: 40.0,
    equivalencePH: 8.35,
    initialPH: 2.22,
    halfEquivalencePH: 3.75,
    bestIndicator: 'phenolphthalein',
    difficulty: 'Miðlungs',
    Ka: 1.8e-4,
    pKa: 3.75
  },
  {
    id: 8,
    type: 'weak-strong',
    name: 'C₆H₅COOH + NaOH',
    analyte: { formula: 'C₆H₅COOH', volume: 25.0, molarity: 0.100, name: 'Bensoesýra' },
    titrant: { formula: 'NaOH', molarity: 0.100, name: 'Natríumhýdroxíð' },
    equivalenceVolume: 25.0,
    equivalencePH: 8.60,
    initialPH: 2.60,
    halfEquivalencePH: 4.19,
    bestIndicator: 'phenolphthalein',
    difficulty: 'Miðlungs',
    Ka: 6.5e-5,
    pKa: 4.19
  },

  // ===== INTERMEDIATE LEVEL (Weak Base + Strong Acid) =====
  {
    id: 9,
    type: 'strong-weak',
    name: 'NH₃ + HCl',
    analyte: { formula: 'NH₃', volume: 25.0, molarity: 0.100, name: 'Ammoníak' },
    titrant: { formula: 'HCl', molarity: 0.100, name: 'Saltssýra' },
    equivalenceVolume: 25.0,
    equivalencePH: 5.28,
    initialPH: 11.13,
    halfEquivalencePH: 9.26,
    bestIndicator: 'methyl-red',
    difficulty: 'Miðlungs',
    Kb: 1.8e-5,
    pKa: 9.26
  },
  {
    id: 10,
    type: 'strong-weak',
    name: 'CH₃NH₂ + HCl',
    analyte: { formula: 'CH₃NH₂', volume: 25.0, molarity: 0.100, name: 'Metýlamín' },
    titrant: { formula: 'HCl', molarity: 0.100, name: 'Saltssýra' },
    equivalenceVolume: 25.0,
    equivalencePH: 5.82,
    initialPH: 11.82,
    halfEquivalencePH: 10.64,
    bestIndicator: 'methyl-red',
    difficulty: 'Miðlungs',
    Kb: 4.4e-4,
    pKa: 10.64
  },

  // ===== ADVANCED LEVEL (Polyprotic Acids) =====
  {
    id: 11,
    type: 'polyprotic-diprotic',
    name: 'H₂SO₃ + NaOH',
    analyte: { formula: 'H₂SO₃', volume: 25.0, molarity: 0.100, name: 'Brennisteinssýrling' },
    titrant: { formula: 'NaOH', molarity: 0.100, name: 'Natríumhýdroxíð' },
    equivalenceVolumes: [25.0, 50.0],
    equivalencePHs: [4.5, 9.0],
    initialPH: 1.5,
    halfEquivalencePHs: [1.9, 7.2],
    bestIndicator: 'phenolphthalein',
    difficulty: 'Háþróað',
    Ka1: 1.3e-2,
    Ka2: 6.3e-8,
    pKa1: 1.9,
    pKa2: 7.2
  },
  {
    id: 12,
    type: 'polyprotic-diprotic',
    name: 'H₂C₂O₄ + NaOH',
    analyte: { formula: 'H₂C₂O₄', volume: 30.0, molarity: 0.0800, name: 'Oxalsýra' },
    titrant: { formula: 'NaOH', molarity: 0.100, name: 'Natríumhýdroxíð' },
    equivalenceVolumes: [24.0, 48.0],
    equivalencePHs: [2.9, 8.4],
    initialPH: 1.3,
    halfEquivalencePHs: [1.3, 4.3],
    bestIndicator: 'phenolphthalein',
    difficulty: 'Háþróað',
    Ka1: 5.9e-2,
    Ka2: 6.4e-5,
    pKa1: 1.3,
    pKa2: 4.3
  },
  {
    id: 13,
    type: 'polyprotic-triprotic',
    name: 'H₃PO₄ + NaOH',
    analyte: { formula: 'H₃PO₄', volume: 25.0, molarity: 0.100, name: 'Fosfórsýra' },
    titrant: { formula: 'NaOH', molarity: 0.100, name: 'Natríumhýdroxíð' },
    equivalenceVolumes: [25.0, 50.0, 75.0],
    equivalencePHs: [4.7, 9.8, 12.4],
    initialPH: 1.6,
    halfEquivalencePHs: [2.15, 7.20, 12.35],
    bestIndicator: 'phenolphthalein',
    difficulty: 'Sérfræðingur',
    Ka1: 7.1e-3,
    Ka2: 6.3e-8,
    Ka3: 4.5e-13,
    pKa1: 2.15,
    pKa2: 7.20,
    pKa3: 12.35
  }
];

/**
 * Get titrations filtered by difficulty level
 */
export function getTitrationsByDifficulty(difficulty: string): Titration[] {
  return titrations.filter(t => t.difficulty === difficulty);
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
  return titrations.find(t => t.id === id);
}
