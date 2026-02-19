// Chemical compounds database
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface CompoundElement {
  symbol: string;
  count: number;
}

export interface Compound {
  formula: string;
  name: string;
  elements: CompoundElement[];
  molarMass: number;
  difficulty: Difficulty;
}

export const COMPOUNDS: Compound[] = [
  // Easy - Real-world chemicals students know
  { formula: 'H₂O', name: 'Vatn', elements: [{symbol: 'H', count: 2}, {symbol: 'O', count: 1}], molarMass: 18.015, difficulty: 'easy' },
  { formula: 'NaCl', name: 'Borðsalt', elements: [{symbol: 'Na', count: 1}, {symbol: 'Cl', count: 1}], molarMass: 58.44, difficulty: 'easy' },
  { formula: 'O₂', name: 'Súrefni', elements: [{symbol: 'O', count: 2}], molarMass: 31.998, difficulty: 'easy' },
  { formula: 'N₂', name: 'Köfnunarefni', elements: [{symbol: 'N', count: 2}], molarMass: 28.014, difficulty: 'easy' },
  { formula: 'CH₄', name: 'Metan', elements: [{symbol: 'C', count: 1}, {symbol: 'H', count: 4}], molarMass: 16.043, difficulty: 'easy' },
  { formula: 'C₂H₆', name: 'Etan', elements: [{symbol: 'C', count: 2}, {symbol: 'H', count: 6}], molarMass: 30.070, difficulty: 'easy' },
  { formula: 'C₃H₈', name: 'Própan', elements: [{symbol: 'C', count: 3}, {symbol: 'H', count: 8}], molarMass: 44.097, difficulty: 'easy' },
  { formula: 'CO₂', name: 'Koltvísýringur', elements: [{symbol: 'C', count: 1}, {symbol: 'O', count: 2}], molarMass: 44.009, difficulty: 'easy' },
  { formula: 'NH₃', name: 'Ammóníak', elements: [{symbol: 'N', count: 1}, {symbol: 'H', count: 3}], molarMass: 17.031, difficulty: 'easy' },
  { formula: 'HCl', name: 'Saltsýra', elements: [{symbol: 'H', count: 1}, {symbol: 'Cl', count: 1}], molarMass: 36.458, difficulty: 'easy' },

  // Medium - Common chemicals in labs and household
  { formula: 'C₂H₅OH', name: 'Etanól', elements: [{symbol: 'C', count: 2}, {symbol: 'H', count: 6}, {symbol: 'O', count: 1}], molarMass: 46.069, difficulty: 'medium' },
  { formula: 'CH₃COOH', name: 'Ediksýra', elements: [{symbol: 'C', count: 2}, {symbol: 'H', count: 4}, {symbol: 'O', count: 2}], molarMass: 60.052, difficulty: 'medium' },
  { formula: 'NaOH', name: 'Natrímhýdroxíð', elements: [{symbol: 'Na', count: 1}, {symbol: 'O', count: 1}, {symbol: 'H', count: 1}], molarMass: 39.997, difficulty: 'medium' },
  { formula: 'CaCO₃', name: 'Kalsíumkarbónat', elements: [{symbol: 'Ca', count: 1}, {symbol: 'C', count: 1}, {symbol: 'O', count: 3}], molarMass: 100.087, difficulty: 'medium' },
  { formula: 'KCl', name: 'Kalíumklóríð', elements: [{symbol: 'K', count: 1}, {symbol: 'Cl', count: 1}], molarMass: 74.551, difficulty: 'medium' },
  { formula: 'MgSO₄', name: 'Magnesíumsúlfat', elements: [{symbol: 'Mg', count: 1}, {symbol: 'S', count: 1}, {symbol: 'O', count: 4}], molarMass: 120.366, difficulty: 'medium' },
  { formula: 'NaHCO₃', name: 'Matarsódi', elements: [{symbol: 'Na', count: 1}, {symbol: 'H', count: 1}, {symbol: 'C', count: 1}, {symbol: 'O', count: 3}], molarMass: 84.007, difficulty: 'medium' },
  { formula: 'H₂O₂', name: 'Vetnisperoxíð', elements: [{symbol: 'H', count: 2}, {symbol: 'O', count: 2}], molarMass: 34.015, difficulty: 'medium' },
  { formula: 'C₆H₁₂O₆', name: 'Glúkósi', elements: [{symbol: 'C', count: 6}, {symbol: 'H', count: 12}, {symbol: 'O', count: 6}], molarMass: 180.156, difficulty: 'medium' },
  { formula: 'H₂SO₄', name: 'Brennisteinssýra', elements: [{symbol: 'H', count: 2}, {symbol: 'S', count: 1}, {symbol: 'O', count: 4}], molarMass: 98.079, difficulty: 'medium' },

  // Hard - Complex molecules and hydrates
  { formula: 'C₆H₅OH', name: 'Fenól', elements: [{symbol: 'C', count: 6}, {symbol: 'H', count: 6}, {symbol: 'O', count: 1}], molarMass: 94.113, difficulty: 'hard' },
  { formula: 'C₁₂H₂₂O₁₁', name: 'Súkrósi/Sykur', elements: [{symbol: 'C', count: 12}, {symbol: 'H', count: 22}, {symbol: 'O', count: 11}], molarMass: 342.297, difficulty: 'hard' },
  { formula: 'MgSO₄·7H₂O', name: 'Epsom salt hýdrat', elements: [{symbol: 'Mg', count: 1}, {symbol: 'S', count: 1}, {symbol: 'O', count: 11}, {symbol: 'H', count: 14}], molarMass: 246.475, difficulty: 'hard' },
  { formula: 'Na₂CO₃·10H₂O', name: 'Vatnaglas hýdrat', elements: [{symbol: 'Na', count: 2}, {symbol: 'C', count: 1}, {symbol: 'O', count: 13}, {symbol: 'H', count: 20}], molarMass: 286.141, difficulty: 'hard' },
  { formula: 'FeSO₄·7H₂O', name: 'Járnsúlfat hýdrat', elements: [{symbol: 'Fe', count: 1}, {symbol: 'S', count: 1}, {symbol: 'O', count: 11}, {symbol: 'H', count: 14}], molarMass: 278.015, difficulty: 'hard' },
  { formula: '(NH₄)₃PO₄', name: 'Ammóníumfosfat', elements: [{symbol: 'N', count: 3}, {symbol: 'H', count: 12}, {symbol: 'P', count: 1}, {symbol: 'O', count: 4}], molarMass: 149.087, difficulty: 'hard' },
  { formula: 'Al₂(SO₄)₃', name: 'Álsúlfat', elements: [{symbol: 'Al', count: 2}, {symbol: 'S', count: 3}, {symbol: 'O', count: 12}], molarMass: 342.151, difficulty: 'hard' },
  { formula: 'Ca₃(PO₄)₂', name: 'Kalsíumfosfat', elements: [{symbol: 'Ca', count: 3}, {symbol: 'P', count: 2}, {symbol: 'O', count: 8}], molarMass: 310.177, difficulty: 'hard' },
  { formula: 'CuSO₄·5H₂O', name: 'Koparbrennisteinshýdrat', elements: [{symbol: 'Cu', count: 1}, {symbol: 'S', count: 1}, {symbol: 'O', count: 9}, {symbol: 'H', count: 10}], molarMass: 249.685, difficulty: 'hard' },
];

// Helper functions
export function getCompoundsByDifficulty(difficulty: Difficulty): Compound[] {
  return COMPOUNDS.filter(c => c.difficulty === difficulty);
}

export function getRandomCompound(difficulty: Difficulty | 'mixed' = 'mixed'): Compound {
  if (difficulty === 'mixed') {
    return COMPOUNDS[Math.floor(Math.random() * COMPOUNDS.length)];
  }
  const filtered = getCompoundsByDifficulty(difficulty);
  return filtered[Math.floor(Math.random() * filtered.length)];
}
