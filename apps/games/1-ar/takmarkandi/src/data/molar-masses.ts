// Molar masses (g/mol) for compounds used in reactions
// These are approximate values suitable for educational purposes

export const MOLAR_MASSES: Record<string, number> = {
  // Elements
  'H₂': 2.0,
  'O₂': 32.0,
  'N₂': 28.0,
  'Cl₂': 71.0,
  'S': 32.0,
  'S₈': 256.0,
  'C': 12.0,
  'P₄': 124.0,

  // Metals
  'Mg': 24.3,
  'Na': 23.0,
  'K': 39.0,
  'Ca': 40.0,
  'Zn': 65.4,
  'Cu': 63.5,
  'Fe': 55.8,
  'Al': 27.0,

  // Simple compounds
  'H₂O': 18.0,
  'CO₂': 44.0,
  'CO': 28.0,
  'NH₃': 17.0,
  'CH₄': 16.0,
  'NaCl': 58.4,
  'KCl': 74.5,
  'CaS': 72.1,
  'ZnS': 97.4,
  'CuO': 79.5,
  'MgO': 40.3,

  // Metal oxides
  'Al₂O₃': 102.0,
  'Fe₂O₃': 159.7,
  'Fe₃O₄': 231.5,
  'P₂O₅': 142.0,
  'SO₂': 64.0,
  'SO₃': 80.0,

  // Nitrides
  'Ca₃N₂': 148.0,
  'Mg₃N₂': 100.9,

  // Sulfides and others
  'FeS₂': 120.0,
};

// Get molar mass with fallback for unknown compounds
export function getMolarMass(formula: string): number {
  return MOLAR_MASSES[formula] || 100; // Default to 100 g/mol if not found
}

// Round to reasonable precision for educational use
export function roundMass(value: number): number {
  if (value >= 100) return Math.round(value);
  if (value >= 10) return Math.round(value * 10) / 10;
  return Math.round(value * 100) / 100;
}
