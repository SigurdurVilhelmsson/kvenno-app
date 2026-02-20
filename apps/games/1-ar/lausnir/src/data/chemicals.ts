// Note: Using "mólmassi" (correct Icelandic term per Orðasafn í efnafræði)
// Previously used "mólþyngd" which is less accurate
export const CHEMICALS = {
  simple: [
    { name: 'NaCl', molarMass: 58.5, displayName: 'NaCl (borðsalt)', molarMassDisplay: 'mólmassi: 58.5 g/mol' },
    { name: 'glúkósa', formula: 'C₆H₁₂O₆', molarMass: 180, displayName: 'glúkósa (C₆H₁₂O₆)', molarMassDisplay: 'mólmassi: 180 g/mol' },
    { name: 'H₂O₂', molarMass: 34, displayName: 'H₂O₂ (vetnisperoxíð)', molarMassDisplay: 'mólmassi: 34 g/mol' },
    { name: 'KCl', molarMass: 74.6, displayName: 'KCl (kalíumklóríð)', molarMassDisplay: 'mólmassi: 74.6 g/mol' },
    { name: 'NaHCO₃', molarMass: 84, displayName: 'NaHCO₃ (matarsódi)', molarMassDisplay: 'mólmassi: 84 g/mol' },
    { name: 'súkrósa', formula: 'C₁₂H₂₂O₁₁', molarMass: 342, displayName: 'súkrósa (C₁₂H₂₂O₁₁)', molarMassDisplay: 'mólmassi: 342 g/mol' },
    { name: 'etanól', formula: 'C₂H₅OH', molarMass: 46, displayName: 'etanól (C₂H₅OH)', molarMassDisplay: 'mólmassi: 46 g/mol' },
  ],
  medium: [
    { name: 'NaOH', molarMass: 40, displayName: 'NaOH (natríumhýdroxíð)', molarMassDisplay: 'mólmassi: 40 g/mol' },
    { name: 'CaCl₂', molarMass: 111, displayName: 'CaCl₂ (kalsíumklóríð)', molarMassDisplay: 'mólmassi: 111 g/mol' },
    { name: 'HCl', molarMass: 36.5, displayName: 'HCl (saltsýra)', molarMassDisplay: 'mólmassi: 36.5 g/mol' },
    { name: 'HNO₃', molarMass: 63, displayName: 'HNO₃ (saltpéturssýra)', molarMassDisplay: 'mólmassi: 63 g/mol' },
    { name: 'Na₂CO₃', molarMass: 106, displayName: 'Na₂CO₃ (þvottasódi)', molarMassDisplay: 'mólmassi: 106 g/mol' },
    { name: 'NH₄Cl', molarMass: 53.5, displayName: 'NH₄Cl (ammóníumklóríð)', molarMassDisplay: 'mólmassi: 53.5 g/mol' },
    { name: 'CH₃COOH', molarMass: 60, displayName: 'CH₃COOH (ediksýra)', molarMassDisplay: 'mólmassi: 60 g/mol' },
  ],
  hard: [
    { name: 'KNO₃', molarMass: 101, displayName: 'KNO₃ (kalíumnítrat)', molarMassDisplay: 'mólmassi: 101 g/mol' },
    { name: 'MgSO₄', molarMass: 120, displayName: 'MgSO₄ (magnesíumsúlfat)', molarMassDisplay: 'mólmassi: 120 g/mol' },
    { name: 'H₂SO₄', molarMass: 98, displayName: 'H₂SO₄ (brennisteinssýra)', molarMassDisplay: 'mólmassi: 98 g/mol' },
    { name: 'Ca(OH)₂', molarMass: 74, displayName: 'Ca(OH)₂ (kalsíumhýdroxíð)', molarMassDisplay: 'mólmassi: 74 g/mol' },
    { name: 'K₂Cr₂O₇', molarMass: 294, displayName: 'K₂Cr₂O₇ (kalíumdíkrómat)', molarMassDisplay: 'mólmassi: 294 g/mol' },
    { name: 'FeCl₃', molarMass: 162.2, displayName: 'FeCl₃ (járnklóríð)', molarMassDisplay: 'mólmassi: 162.2 g/mol' },
    { name: 'H₃PO₄', molarMass: 98, displayName: 'H₃PO₄ (fosfórsýra)', molarMassDisplay: 'mólmassi: 98 g/mol' },
  ]
} as const;
