// Note: Using "mólmassi" (correct Icelandic term per Orðasafn í efnafræði)
// Previously used "mólþyngd" which is less accurate
export const CHEMICALS = {
  simple: [
    { name: 'NaCl', molarMass: 58.5, displayName: 'NaCl (borðsalt)', molarMassDisplay: 'mólmassi: 58.5 g/mol' },
    { name: 'glúkósa', formula: 'C₆H₁₂O₆', molarMass: 180, displayName: 'glúkósa (C₆H₁₂O₆)', molarMassDisplay: 'mólmassi: 180 g/mol' },
    { name: 'H₂O₂', molarMass: 34, displayName: 'H₂O₂ (vetnisperoxíð)', molarMassDisplay: 'mólmassi: 34 g/mol' }
  ],
  medium: [
    { name: 'NaOH', molarMass: 40, displayName: 'NaOH (natríumhýdroxíð)', molarMassDisplay: 'mólmassi: 40 g/mol' },
    { name: 'CaCl₂', molarMass: 111, displayName: 'CaCl₂ (kalsíumklóríð)', molarMassDisplay: 'mólmassi: 111 g/mol' },
    { name: 'HCl', molarMass: 36.5, displayName: 'HCl (saltsýra)', molarMassDisplay: 'mólmassi: 36.5 g/mol' }
  ],
  hard: [
    { name: 'KNO₃', molarMass: 101, displayName: 'KNO₃ (kalíumnítrat)', molarMassDisplay: 'mólmassi: 101 g/mol' },
    { name: 'MgSO₄', molarMass: 120, displayName: 'MgSO₄ (magnesíumsúlfat)', molarMassDisplay: 'mólmassi: 120 g/mol' },
    { name: 'H₂SO₄', molarMass: 98, displayName: 'H₂SO₄ (brennisteinssýra)', molarMassDisplay: 'mólmassi: 98 g/mol' }
  ]
} as const;
