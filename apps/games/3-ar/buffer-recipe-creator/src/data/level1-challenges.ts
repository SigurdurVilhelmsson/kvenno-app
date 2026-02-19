// Level 1: Conceptual Buffer Builder Challenges
// Students learn through visual manipulation, NO calculations

import type { TieredHints } from '@shared/types';

export interface Level1Challenge {
  id: number;
  system: string;
  acidFormula: string;
  baseFormula: string;
  acidName: string;
  baseName: string;
  pKa: number;
  targetPH: number;
  targetRatioMin: number;  // [Base]/[Acid] minimum
  targetRatioMax: number;  // [Base]/[Acid] maximum
  context: string;
  /** @deprecated Use hints instead */
  hint: string;
  hints: TieredHints;
  // Post-success explanation
  explanation: string;
}

export const LEVEL1_CHALLENGES: Level1Challenge[] = [
  {
    id: 1,
    system: 'CH₃COOH / CH₃COO⁻',
    acidFormula: 'CH₃COOH',
    baseFormula: 'CH₃COO⁻',
    acidName: 'Ediksýra',
    baseName: 'Asetatjón',
    pKa: 4.74,
    targetPH: 4.74,
    targetRatioMin: 0.9,
    targetRatioMax: 1.1,
    context: 'Þú þarft að búa til stuðpúða við pH 4.74 fyrir rannsóknarstofu.',
    hint: 'Þegar pH = pKa, þarftu JAFNT af sýru og basa!',
    hints: {
      topic: 'Þetta snýst um Henderson-Hasselbalch jöfnuna og tengsl pH og pKa.',
      strategy: 'Berðu saman markmiðs-pH og pKa. Þegar þau eru jöfn, hvað þýðir það fyrir hlutfallið?',
      method: 'pH = pKa + log([Basi]/[Sýra]). Þegar pH = pKa, þá er log([Basi]/[Sýra]) = 0, sem þýðir [Basi]/[Sýra] = 1.',
      solution: 'Markmiðs-pH (4.74) = pKa (4.74). Þess vegna þarftu JAFNT af sýru og basa. Settu 5 af hvoru → hlutfall = 1.0.'
    },
    explanation: 'Þegar sýra og basi eru í jafnvægi (1:1), þá er pH nákvæmlega jafnt pKa. Þetta er miðpunktur stuðpúðans!'
  },
  {
    id: 2,
    system: 'CH₃COOH / CH₃COO⁻',
    acidFormula: 'CH₃COOH',
    baseFormula: 'CH₃COO⁻',
    acidName: 'Ediksýra',
    baseName: 'Asetatjón',
    pKa: 4.74,
    targetPH: 5.00,
    targetRatioMin: 1.6,
    targetRatioMax: 2.0,
    context: 'Þú þarft basískari stuðpúða, pH 5.0',
    hint: 'Hærra pH þarf MEIRA af basa en sýru!',
    hints: {
      topic: 'Þetta snýst um hvernig hlutfall basa/sýru hefur áhrif á pH.',
      strategy: 'Þegar markmiðs-pH er HÆRRA en pKa, þarftu meira af basa.',
      method: 'pH = pKa + log([Basi]/[Sýra]). 5.0 = 4.74 + log([Basi]/[Sýra]). log([Basi]/[Sýra]) = 0.26.',
      solution: 'Hlutfall [Basi]/[Sýra] ≈ 1.8. Til dæmis: 9 basi og 5 sýra → 9/5 = 1.8.'
    },
    explanation: 'Til að hækka pH yfir pKa þarf meira af basa. Hlutfallið [Basi]/[Sýra] > 1 gefur hærra pH.'
  },
  {
    id: 3,
    system: 'CH₃COOH / CH₃COO⁻',
    acidFormula: 'CH₃COOH',
    baseFormula: 'CH₃COO⁻',
    acidName: 'Ediksýra',
    baseName: 'Asetatjón',
    pKa: 4.74,
    targetPH: 4.50,
    targetRatioMin: 0.5,
    targetRatioMax: 0.65,
    context: 'Þú þarft súrari stuðpúða, pH 4.5',
    hint: 'Lægra pH þarf MEIRA af sýru en basa!',
    hints: {
      topic: 'Þetta snýst um hvernig hlutfall basa/sýru hefur áhrif á pH.',
      strategy: 'Þegar markmiðs-pH er LÆGRA en pKa, þarftu meira af sýru (minna af basa).',
      method: 'pH = pKa + log([Basi]/[Sýra]). 4.5 = 4.74 + log([Basi]/[Sýra]). log([Basi]/[Sýra]) = -0.24.',
      solution: 'Hlutfall [Basi]/[Sýra] ≈ 0.58. Til dæmis: 3 basi og 5 sýra → 3/5 = 0.6.'
    },
    explanation: 'Til að lækka pH undir pKa þarf meira af sýru. Hlutfallið [Basi]/[Sýra] < 1 gefur lægra pH.'
  },
  {
    id: 4,
    system: 'H₂PO₄⁻ / HPO₄²⁻',
    acidFormula: 'H₂PO₄⁻',
    baseFormula: 'HPO₄²⁻',
    acidName: 'Díhýdrógenfosfat',
    baseName: 'Hýdrógenfosfat',
    pKa: 7.20,
    targetPH: 7.20,
    targetRatioMin: 0.9,
    targetRatioMax: 1.1,
    context: 'Búa til stuðpúða fyrir lækningalausnir (pH 7.2)',
    hint: 'pH = pKa → jafnt hlutfall!',
    hints: {
      topic: 'Þetta snýst um fosfatstuðpúða, sem eru mikilvægir í líffræði.',
      strategy: 'Sama regla gildir: Þegar markmiðs-pH = pKa, þá þarftu jafnt hlutfall.',
      method: 'pH = pKa + log([Basi]/[Sýra]). 7.20 = 7.20 + log([Basi]/[Sýra]). log = 0 → hlutfall = 1.',
      solution: 'Markmiðs-pH (7.2) = pKa (7.2). Settu jafnt af hvoru, t.d. 5 af hvoru → hlutfall = 1.0.'
    },
    explanation: 'Fosfatstuðpúði er mikilvægur í líkamanum. Sama reglan gildir: jafnt hlutfall = pH við pKa.'
  },
  {
    id: 5,
    system: 'H₂PO₄⁻ / HPO₄²⁻',
    acidFormula: 'H₂PO₄⁻',
    baseFormula: 'HPO₄²⁻',
    acidName: 'Díhýdrógenfosfat',
    baseName: 'Hýdrógenfosfat',
    pKa: 7.20,
    targetPH: 7.40,
    targetRatioMin: 1.4,
    targetRatioMax: 1.7,
    context: 'Líffræðilegur stuðpúði við pH 7.4 (blóð pH)',
    hint: 'Þarftu meira af basa til að hækka pH yfir pKa',
    hints: {
      topic: 'Þetta snýst um blóðstuðpúða og hvernig líkaminn heldur pH stöðugu.',
      strategy: 'Blóð pH (7.4) er aðeins HÆRRA en pKa (7.2), svo þú þarft aðeins meira af basa.',
      method: 'pH = pKa + log([Basi]/[Sýra]). 7.4 = 7.2 + log([Basi]/[Sýra]). log = 0.2.',
      solution: 'Hlutfall [Basi]/[Sýra] ≈ 1.58. Til dæmis: 8 basi og 5 sýra → 8/5 = 1.6.'
    },
    explanation: 'Blóð hefur pH um 7.4, sem er aðeins yfir pKa fosfats. Þess vegna er lítið meira af basa í blóði.'
  },
  {
    id: 6,
    system: 'NH₄⁺ / NH₃',
    acidFormula: 'NH₄⁺',
    baseFormula: 'NH₃',
    acidName: 'Ammóníumjón',
    baseName: 'Ammóníak',
    pKa: 9.25,
    targetPH: 9.25,
    targetRatioMin: 0.9,
    targetRatioMax: 1.1,
    context: 'Basískur stuðpúði fyrir efnahvörf',
    hint: 'Sama reglan gildir: pH = pKa = jöfn hlutföll',
    hints: {
      topic: 'Þetta snýst um ammóníustuðpúða sem virkar við hátt pH.',
      strategy: 'Þrátt fyrir að pKa sé hátt (9.25), gildir sama regla: pH = pKa → jafnt hlutfall.',
      method: 'pH = pKa + log([Basi]/[Sýra]). 9.25 = 9.25 + log([Basi]/[Sýra]). log = 0 → hlutfall = 1.',
      solution: 'Markmiðs-pH (9.25) = pKa (9.25). Settu jafnt af hvoru, t.d. 5 af hvoru → hlutfall = 1.0.'
    },
    explanation: 'Ammóníustuðpúði virkar við hátt pH. Sama hugmynd: jafnt hlutfall gefur pH = pKa, óháð hvaða stuðpúðakerfi er notað.'
  }
];
