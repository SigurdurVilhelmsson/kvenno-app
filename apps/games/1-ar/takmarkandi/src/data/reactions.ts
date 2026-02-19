import { Reaction } from '../types';

export const REACTIONS: Reaction[] = [
  // EASY LEVEL - Simple 1:1 and 2:1 ratios
  {
    id: '1',
    equation: '2H₂ + O₂ → 2H₂O',
    reactant1: { formula: 'H₂', coeff: 2, color: '#3b82f6' },
    reactant2: { formula: 'O₂', coeff: 1, color: '#ef4444' },
    products: [{ formula: 'H₂O', coeff: 2, color: '#8b5cf6' }],
    difficulty: 'easy'
  },
  {
    id: '2',
    equation: '2Mg + O₂ → 2MgO',
    reactant1: { formula: 'Mg', coeff: 2, color: '#a855f7' },
    reactant2: { formula: 'O₂', coeff: 1, color: '#ef4444' },
    products: [{ formula: 'MgO', coeff: 2, color: '#f97316' }],
    difficulty: 'easy'
  },
  {
    id: '3',
    equation: 'C + O₂ → CO₂',
    reactant1: { formula: 'C', coeff: 1, color: '#1f2937' },
    reactant2: { formula: 'O₂', coeff: 1, color: '#ef4444' },
    products: [{ formula: 'CO₂', coeff: 1, color: '#6b7280' }],
    difficulty: 'easy'
  },
  {
    id: '7',
    equation: '2Na + Cl₂ → 2NaCl',
    reactant1: { formula: 'Na', coeff: 2, color: '#fbbf24' },
    reactant2: { formula: 'Cl₂', coeff: 1, color: '#84cc16' },
    products: [{ formula: 'NaCl', coeff: 2, color: '#f3f4f6' }],
    difficulty: 'easy'
  },
  {
    id: '8',
    equation: '2K + Cl₂ → 2KCl',
    reactant1: { formula: 'K', coeff: 2, color: '#c084fc' },
    reactant2: { formula: 'Cl₂', coeff: 1, color: '#84cc16' },
    products: [{ formula: 'KCl', coeff: 2, color: '#e5e7eb' }],
    difficulty: 'easy'
  },
  {
    id: '9',
    equation: 'Ca + S → CaS',
    reactant1: { formula: 'Ca', coeff: 1, color: '#fb923c' },
    reactant2: { formula: 'S', coeff: 1, color: '#fde047' },
    products: [{ formula: 'CaS', coeff: 1, color: '#fcd34d' }],
    difficulty: 'easy'
  },
  {
    id: '10',
    equation: 'Zn + S → ZnS',
    reactant1: { formula: 'Zn', coeff: 1, color: '#94a3b8' },
    reactant2: { formula: 'S', coeff: 1, color: '#fde047' },
    products: [{ formula: 'ZnS', coeff: 1, color: '#f59e0b' }],
    difficulty: 'easy'
  },
  {
    id: '11',
    equation: '2Cu + O₂ → 2CuO',
    reactant1: { formula: 'Cu', coeff: 2, color: '#f97316' },
    reactant2: { formula: 'O₂', coeff: 1, color: '#ef4444' },
    products: [{ formula: 'CuO', coeff: 2, color: '#78350f' }],
    difficulty: 'easy'
  },

  // MEDIUM LEVEL - 3:1, 1:3, and 2:3 ratios
  {
    id: '4',
    equation: 'N₂ + 3H₂ → 2NH₃',
    reactant1: { formula: 'N₂', coeff: 1, color: '#10b981' },
    reactant2: { formula: 'H₂', coeff: 3, color: '#3b82f6' },
    products: [{ formula: 'NH₃', coeff: 2, color: '#f59e0b' }],
    difficulty: 'medium'
  },
  {
    id: '12',
    equation: '4Al + 3O₂ → 2Al₂O₃',
    reactant1: { formula: 'Al', coeff: 4, color: '#cbd5e1' },
    reactant2: { formula: 'O₂', coeff: 3, color: '#ef4444' },
    products: [{ formula: 'Al₂O₃', coeff: 2, color: '#f3f4f6' }],
    difficulty: 'medium'
  },
  {
    id: '13',
    equation: '3Ca + N₂ → Ca₃N₂',
    reactant1: { formula: 'Ca', coeff: 3, color: '#fb923c' },
    reactant2: { formula: 'N₂', coeff: 1, color: '#10b981' },
    products: [{ formula: 'Ca₃N₂', coeff: 1, color: '#fdba74' }],
    difficulty: 'medium'
  },
  {
    id: '14',
    equation: '2C + O₂ → 2CO',
    reactant1: { formula: 'C', coeff: 2, color: '#1f2937' },
    reactant2: { formula: 'O₂', coeff: 1, color: '#ef4444' },
    products: [{ formula: 'CO', coeff: 2, color: '#4b5563' }],
    difficulty: 'medium'
  },
  {
    id: '15',
    equation: '3Mg + N₂ → Mg₃N₂',
    reactant1: { formula: 'Mg', coeff: 3, color: '#a855f7' },
    reactant2: { formula: 'N₂', coeff: 1, color: '#10b981' },
    products: [{ formula: 'Mg₃N₂', coeff: 1, color: '#c084fc' }],
    difficulty: 'medium'
  },

  // HARD LEVEL - Complex ratios and larger coefficients
  {
    id: '6',
    equation: '4Fe + 3O₂ → 2Fe₂O₃',
    reactant1: { formula: 'Fe', coeff: 4, color: '#dc2626' },
    reactant2: { formula: 'O₂', coeff: 3, color: '#ef4444' },
    products: [{ formula: 'Fe₂O₃', coeff: 2, color: '#92400e' }],
    difficulty: 'hard'
  },
  {
    id: '16',
    equation: '3Fe + 2O₂ → Fe₃O₄',
    reactant1: { formula: 'Fe', coeff: 3, color: '#dc2626' },
    reactant2: { formula: 'O₂', coeff: 2, color: '#ef4444' },
    products: [{ formula: 'Fe₃O₄', coeff: 1, color: '#7c2d12' }],
    difficulty: 'hard'
  },
  {
    id: '17',
    equation: 'P₄ + 5O₂ → 2P₂O₅',
    reactant1: { formula: 'P₄', coeff: 1, color: '#7c3aed' },
    reactant2: { formula: 'O₂', coeff: 5, color: '#ef4444' },
    products: [{ formula: 'P₂O₅', coeff: 2, color: '#f3f4f6' }],
    difficulty: 'hard'
  },
  {
    id: '18',
    equation: 'S₈ + 12O₂ → 8SO₃',
    reactant1: { formula: 'S₈', coeff: 1, color: '#fde047' },
    reactant2: { formula: 'O₂', coeff: 12, color: '#ef4444' },
    products: [{ formula: 'SO₃', coeff: 8, color: '#fef3c7' }],
    difficulty: 'hard'
  },

  // MULTI-PRODUCT REACTIONS
  {
    id: '5',
    equation: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
    reactant1: { formula: 'CH₄', coeff: 1, color: '#14b8a6' },
    reactant2: { formula: 'O₂', coeff: 2, color: '#ef4444' },
    products: [
      { formula: 'CO₂', coeff: 1, color: '#6b7280' },
      { formula: 'H₂O', coeff: 2, color: '#8b5cf6' }
    ],
    difficulty: 'medium'
  },
  {
    id: '19',
    equation: '2Al + 3CuO → Al₂O₃ + 3Cu',
    reactant1: { formula: 'Al', coeff: 2, color: '#cbd5e1' },
    reactant2: { formula: 'CuO', coeff: 3, color: '#78350f' },
    products: [
      { formula: 'Al₂O₃', coeff: 1, color: '#f3f4f6' },
      { formula: 'Cu', coeff: 3, color: '#f97316' }
    ],
    difficulty: 'hard'
  },
  {
    id: '20',
    equation: '4FeS₂ + 11O₂ → 2Fe₂O₃ + 8SO₂',
    reactant1: { formula: 'FeS₂', coeff: 4, color: '#fcd34d' },
    reactant2: { formula: 'O₂', coeff: 11, color: '#ef4444' },
    products: [
      { formula: 'Fe₂O₃', coeff: 2, color: '#92400e' },
      { formula: 'SO₂', coeff: 8, color: '#fef3c7' }
    ],
    difficulty: 'hard'
  }
];
