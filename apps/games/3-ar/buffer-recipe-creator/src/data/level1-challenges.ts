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
  acidNameEn?: string;
  baseNameEn?: string;
  acidNamePl?: string;
  baseNamePl?: string;
  pKa: number;
  targetPH: number;
  targetRatioMin: number;  // [Base]/[Acid] minimum
  targetRatioMax: number;  // [Base]/[Acid] maximum
  context: string;
  contextEn?: string;
  contextPl?: string;
  /** @deprecated Use hints instead */
  hint: string;
  hints: TieredHints;
  hintsEn?: TieredHints;
  hintsPl?: TieredHints;
  // Post-success explanation
  explanation: string;
  explanationEn?: string;
  explanationPl?: string;
}

export const LEVEL1_CHALLENGES: Level1Challenge[] = [
  {
    id: 1,
    system: 'CH₃COOH / CH₃COO⁻',
    acidFormula: 'CH₃COOH',
    baseFormula: 'CH₃COO⁻',
    acidName: 'Ediksýra',
    baseName: 'Asetatjón',
    acidNameEn: 'Acetic acid',
    baseNameEn: 'Acetate ion',
    acidNamePl: 'Kwas octowy',
    baseNamePl: 'Jon octanowy',
    pKa: 4.74,
    targetPH: 4.74,
    targetRatioMin: 0.9,
    targetRatioMax: 1.1,
    context: 'Þú þarft að búa til stuðpúða við pH 4.74 fyrir rannsóknarstofu.',
    contextEn: 'You need to prepare a buffer at pH 4.74 for the laboratory.',
    contextPl: 'Musisz przygotować bufor o pH 4.74 do laboratorium.',
    hint: 'Þegar pH = pKa, þarftu JAFNT af sýru og basa!',
    hints: {
      topic: 'Þetta snýst um Henderson-Hasselbalch jöfnuna og tengsl pH og pKa.',
      strategy: 'Berðu saman markmiðs-pH og pKa. Þegar þau eru jöfn, hvað þýðir það fyrir hlutfallið?',
      method: 'pH = pKa + log([Basi]/[Sýra]). Þegar pH = pKa, þá er log([Basi]/[Sýra]) = 0, sem þýðir [Basi]/[Sýra] = 1.',
      solution: 'Markmiðs-pH (4.74) = pKa (4.74). Þess vegna þarftu JAFNT af sýru og basa. Settu 5 af hvoru → hlutfall = 1.0.'
    },
    hintsEn: {
      topic: 'This is about the Henderson-Hasselbalch equation and the relationship between pH and pKa.',
      strategy: 'Compare the target pH and pKa. When they are equal, what does that mean for the ratio?',
      method: 'pH = pKa + log([Base]/[Acid]). When pH = pKa, then log([Base]/[Acid]) = 0, which means [Base]/[Acid] = 1.',
      solution: 'Target pH (4.74) = pKa (4.74). Therefore you need EQUAL amounts of acid and base. Add 5 of each → ratio = 1.0.'
    },
    hintsPl: {
      topic: 'To dotyczy równania Hendersona-Hasselbalcha i związku między pH a pKa.',
      strategy: 'Porównaj docelowe pH z pKa. Gdy są równe, co to oznacza dla proporcji?',
      method: 'pH = pKa + log([Zasada]/[Kwas]). Gdy pH = pKa, to log([Zasada]/[Kwas]) = 0, co oznacza [Zasada]/[Kwas] = 1.',
      solution: 'Docelowe pH (4.74) = pKa (4.74). Dlatego potrzebujesz RÓWNYCH ilości kwasu i zasady. Dodaj po 5 → proporcja = 1.0.'
    },
    explanation: 'Þegar sýra og basi eru í jafnvægi (1:1), þá er pH nákvæmlega jafnt pKa. Þetta er miðpunktur stuðpúðans!',
    explanationEn: 'When acid and base are in equilibrium (1:1), the pH is exactly equal to pKa. This is the midpoint of the buffer!',
    explanationPl: 'Gdy kwas i zasada są w równowadze (1:1), pH jest dokładnie równe pKa. To jest punkt środkowy buforu!'
  },
  {
    id: 2,
    system: 'CH₃COOH / CH₃COO⁻',
    acidFormula: 'CH₃COOH',
    baseFormula: 'CH₃COO⁻',
    acidName: 'Ediksýra',
    baseName: 'Asetatjón',
    acidNameEn: 'Acetic acid',
    baseNameEn: 'Acetate ion',
    acidNamePl: 'Kwas octowy',
    baseNamePl: 'Jon octanowy',
    pKa: 4.74,
    targetPH: 5.00,
    targetRatioMin: 1.6,
    targetRatioMax: 2.0,
    context: 'Þú þarft basískari stuðpúða, pH 5.0',
    contextEn: 'You need a more basic buffer, pH 5.0',
    contextPl: 'Potrzebujesz bardziej zasadowego buforu, pH 5.0',
    hint: 'Hærra pH þarf MEIRA af basa en sýru!',
    hints: {
      topic: 'Þetta snýst um hvernig hlutfall basa/sýru hefur áhrif á pH.',
      strategy: 'Þegar markmiðs-pH er HÆRRA en pKa, þarftu meira af basa.',
      method: 'pH = pKa + log([Basi]/[Sýra]). 5.0 = 4.74 + log([Basi]/[Sýra]). log([Basi]/[Sýra]) = 0.26.',
      solution: 'Hlutfall [Basi]/[Sýra] ≈ 1.8. Til dæmis: 9 basi og 5 sýra → 9/5 = 1.8.'
    },
    hintsEn: {
      topic: 'This is about how the base/acid ratio affects pH.',
      strategy: 'When target pH is HIGHER than pKa, you need more base.',
      method: 'pH = pKa + log([Base]/[Acid]). 5.0 = 4.74 + log([Base]/[Acid]). log([Base]/[Acid]) = 0.26.',
      solution: 'Ratio [Base]/[Acid] ≈ 1.8. For example: 9 base and 5 acid → 9/5 = 1.8.'
    },
    hintsPl: {
      topic: 'To dotyczy wpływu proporcji zasady do kwasu na pH.',
      strategy: 'Gdy docelowe pH jest WYŻSZE niż pKa, potrzebujesz więcej zasady.',
      method: 'pH = pKa + log([Zasada]/[Kwas]). 5.0 = 4.74 + log([Zasada]/[Kwas]). log([Zasada]/[Kwas]) = 0.26.',
      solution: 'Proporcja [Zasada]/[Kwas] ≈ 1.8. Na przykład: 9 zasady i 5 kwasu → 9/5 = 1.8.'
    },
    explanation: 'Til að hækka pH yfir pKa þarf meira af basa. Hlutfallið [Basi]/[Sýra] > 1 gefur hærra pH.',
    explanationEn: 'To raise pH above pKa you need more base. The ratio [Base]/[Acid] > 1 gives a higher pH.',
    explanationPl: 'Aby podnieść pH powyżej pKa, potrzebujesz więcej zasady. Proporcja [Zasada]/[Kwas] > 1 daje wyższe pH.'
  },
  {
    id: 3,
    system: 'CH₃COOH / CH₃COO⁻',
    acidFormula: 'CH₃COOH',
    baseFormula: 'CH₃COO⁻',
    acidName: 'Ediksýra',
    baseName: 'Asetatjón',
    acidNameEn: 'Acetic acid',
    baseNameEn: 'Acetate ion',
    acidNamePl: 'Kwas octowy',
    baseNamePl: 'Jon octanowy',
    pKa: 4.74,
    targetPH: 4.50,
    targetRatioMin: 0.5,
    targetRatioMax: 0.65,
    context: 'Þú þarft súrari stuðpúða, pH 4.5',
    contextEn: 'You need a more acidic buffer, pH 4.5',
    contextPl: 'Potrzebujesz bardziej kwaśnego buforu, pH 4.5',
    hint: 'Lægra pH þarf MEIRA af sýru en basa!',
    hints: {
      topic: 'Þetta snýst um hvernig hlutfall basa/sýru hefur áhrif á pH.',
      strategy: 'Þegar markmiðs-pH er LÆGRA en pKa, þarftu meira af sýru (minna af basa).',
      method: 'pH = pKa + log([Basi]/[Sýra]). 4.5 = 4.74 + log([Basi]/[Sýra]). log([Basi]/[Sýra]) = -0.24.',
      solution: 'Hlutfall [Basi]/[Sýra] ≈ 0.58. Til dæmis: 3 basi og 5 sýra → 3/5 = 0.6.'
    },
    hintsEn: {
      topic: 'This is about how the base/acid ratio affects pH.',
      strategy: 'When target pH is LOWER than pKa, you need more acid (less base).',
      method: 'pH = pKa + log([Base]/[Acid]). 4.5 = 4.74 + log([Base]/[Acid]). log([Base]/[Acid]) = -0.24.',
      solution: 'Ratio [Base]/[Acid] ≈ 0.58. For example: 3 base and 5 acid → 3/5 = 0.6.'
    },
    hintsPl: {
      topic: 'To dotyczy wpływu proporcji zasady do kwasu na pH.',
      strategy: 'Gdy docelowe pH jest NIŻSZE niż pKa, potrzebujesz więcej kwasu (mniej zasady).',
      method: 'pH = pKa + log([Zasada]/[Kwas]). 4.5 = 4.74 + log([Zasada]/[Kwas]). log([Zasada]/[Kwas]) = -0.24.',
      solution: 'Proporcja [Zasada]/[Kwas] ≈ 0.58. Na przykład: 3 zasady i 5 kwasu → 3/5 = 0.6.'
    },
    explanation: 'Til að lækka pH undir pKa þarf meira af sýru. Hlutfallið [Basi]/[Sýra] < 1 gefur lægra pH.',
    explanationEn: 'To lower pH below pKa you need more acid. The ratio [Base]/[Acid] < 1 gives a lower pH.',
    explanationPl: 'Aby obniżyć pH poniżej pKa, potrzebujesz więcej kwasu. Proporcja [Zasada]/[Kwas] < 1 daje niższe pH.'
  },
  {
    id: 4,
    system: 'H₂PO₄⁻ / HPO₄²⁻',
    acidFormula: 'H₂PO₄⁻',
    baseFormula: 'HPO₄²⁻',
    acidName: 'Díhýdrógenfosfat',
    baseName: 'Hýdrógenfosfat',
    acidNameEn: 'Dihydrogen phosphate',
    baseNameEn: 'Hydrogen phosphate',
    acidNamePl: 'Diwodorofosforan',
    baseNamePl: 'Wodorofosforan',
    pKa: 7.20,
    targetPH: 7.20,
    targetRatioMin: 0.9,
    targetRatioMax: 1.1,
    context: 'Búa til stuðpúða fyrir lækningalausnir (pH 7.2)',
    contextEn: 'Prepare a buffer for medical solutions (pH 7.2)',
    contextPl: 'Przygotuj bufor do roztworów medycznych (pH 7.2)',
    hint: 'pH = pKa → jafnt hlutfall!',
    hints: {
      topic: 'Þetta snýst um fosfatstuðpúða, sem eru mikilvægir í líffræði.',
      strategy: 'Sama regla gildir: Þegar markmiðs-pH = pKa, þá þarftu jafnt hlutfall.',
      method: 'pH = pKa + log([Basi]/[Sýra]). 7.20 = 7.20 + log([Basi]/[Sýra]). log = 0 → hlutfall = 1.',
      solution: 'Markmiðs-pH (7.2) = pKa (7.2). Settu jafnt af hvoru, t.d. 5 af hvoru → hlutfall = 1.0.'
    },
    hintsEn: {
      topic: 'This is about the phosphate buffer, which is important in biology.',
      strategy: 'The same rule applies: When target pH = pKa, you need an equal ratio.',
      method: 'pH = pKa + log([Base]/[Acid]). 7.20 = 7.20 + log([Base]/[Acid]). log = 0 → ratio = 1.',
      solution: 'Target pH (7.2) = pKa (7.2). Add equal amounts of each, e.g. 5 of each → ratio = 1.0.'
    },
    hintsPl: {
      topic: 'To dotyczy buforu fosforanowego, który jest ważny w biologii.',
      strategy: 'Ta sama zasada obowiązuje: Gdy docelowe pH = pKa, potrzebujesz równych proporcji.',
      method: 'pH = pKa + log([Zasada]/[Kwas]). 7.20 = 7.20 + log([Zasada]/[Kwas]). log = 0 → proporcja = 1.',
      solution: 'Docelowe pH (7.2) = pKa (7.2). Dodaj równe ilości, np. po 5 → proporcja = 1.0.'
    },
    explanation: 'Fosfatstuðpúði er mikilvægur í líkamanum. Sama reglan gildir: jafnt hlutfall = pH við pKa.',
    explanationEn: 'The phosphate buffer is important in the body. The same rule applies: equal ratio = pH at pKa.',
    explanationPl: 'Bufor fosforanowy jest ważny w organizmie. Ta sama zasada obowiązuje: równa proporcja = pH przy pKa.'
  },
  {
    id: 5,
    system: 'H₂PO₄⁻ / HPO₄²⁻',
    acidFormula: 'H₂PO₄⁻',
    baseFormula: 'HPO₄²⁻',
    acidName: 'Díhýdrógenfosfat',
    baseName: 'Hýdrógenfosfat',
    acidNameEn: 'Dihydrogen phosphate',
    baseNameEn: 'Hydrogen phosphate',
    acidNamePl: 'Diwodorofosforan',
    baseNamePl: 'Wodorofosforan',
    pKa: 7.20,
    targetPH: 7.40,
    targetRatioMin: 1.4,
    targetRatioMax: 1.7,
    context: 'Líffræðilegur stuðpúði við pH 7.4 (blóð pH)',
    contextEn: 'Biological buffer at pH 7.4 (blood pH)',
    contextPl: 'Bufor biologiczny o pH 7.4 (pH krwi)',
    hint: 'Þarftu meira af basa til að hækka pH yfir pKa',
    hints: {
      topic: 'Þetta snýst um blóðstuðpúða og hvernig líkaminn heldur pH stöðugu.',
      strategy: 'Blóð pH (7.4) er aðeins HÆRRA en pKa (7.2), svo þú þarft aðeins meira af basa.',
      method: 'pH = pKa + log([Basi]/[Sýra]). 7.4 = 7.2 + log([Basi]/[Sýra]). log = 0.2.',
      solution: 'Hlutfall [Basi]/[Sýra] ≈ 1.58. Til dæmis: 8 basi og 5 sýra → 8/5 = 1.6.'
    },
    hintsEn: {
      topic: 'This is about blood buffers and how the body maintains a stable pH.',
      strategy: 'Blood pH (7.4) is slightly HIGHER than pKa (7.2), so you need slightly more base.',
      method: 'pH = pKa + log([Base]/[Acid]). 7.4 = 7.2 + log([Base]/[Acid]). log = 0.2.',
      solution: 'Ratio [Base]/[Acid] ≈ 1.58. For example: 8 base and 5 acid → 8/5 = 1.6.'
    },
    hintsPl: {
      topic: 'To dotyczy buforów krwi i tego, jak organizm utrzymuje stabilne pH.',
      strategy: 'pH krwi (7.4) jest nieco WYŻSZE niż pKa (7.2), więc potrzebujesz nieco więcej zasady.',
      method: 'pH = pKa + log([Zasada]/[Kwas]). 7.4 = 7.2 + log([Zasada]/[Kwas]). log = 0.2.',
      solution: 'Proporcja [Zasada]/[Kwas] ≈ 1.58. Na przykład: 8 zasady i 5 kwasu → 8/5 = 1.6.'
    },
    explanation: 'Blóð hefur pH um 7.4, sem er aðeins yfir pKa fosfats. Þess vegna er lítið meira af basa í blóði.',
    explanationEn: 'Blood has a pH of about 7.4, which is slightly above the pKa of phosphate. That is why there is slightly more base in blood.',
    explanationPl: 'Krew ma pH około 7.4, co jest nieco powyżej pKa fosforanu. Dlatego we krwi jest nieco więcej zasady.'
  },
  {
    id: 6,
    system: 'NH₄⁺ / NH₃',
    acidFormula: 'NH₄⁺',
    baseFormula: 'NH₃',
    acidName: 'Ammóníumjón',
    baseName: 'Ammóníak',
    acidNameEn: 'Ammonium ion',
    baseNameEn: 'Ammonia',
    acidNamePl: 'Jon amonowy',
    baseNamePl: 'Amoniak',
    pKa: 9.25,
    targetPH: 9.25,
    targetRatioMin: 0.9,
    targetRatioMax: 1.1,
    context: 'Basískur stuðpúði fyrir efnahvörf',
    contextEn: 'Basic buffer for chemical reactions',
    contextPl: 'Zasadowy bufor do reakcji chemicznych',
    hint: 'Sama reglan gildir: pH = pKa = jöfn hlutföll',
    hints: {
      topic: 'Þetta snýst um ammóníustuðpúða sem virkar við hátt pH.',
      strategy: 'Þrátt fyrir að pKa sé hátt (9.25), gildir sama regla: pH = pKa → jafnt hlutfall.',
      method: 'pH = pKa + log([Basi]/[Sýra]). 9.25 = 9.25 + log([Basi]/[Sýra]). log = 0 → hlutfall = 1.',
      solution: 'Markmiðs-pH (9.25) = pKa (9.25). Settu jafnt af hvoru, t.d. 5 af hvoru → hlutfall = 1.0.'
    },
    hintsEn: {
      topic: 'This is about the ammonium buffer which works at high pH.',
      strategy: 'Even though pKa is high (9.25), the same rule applies: pH = pKa → equal ratio.',
      method: 'pH = pKa + log([Base]/[Acid]). 9.25 = 9.25 + log([Base]/[Acid]). log = 0 → ratio = 1.',
      solution: 'Target pH (9.25) = pKa (9.25). Add equal amounts of each, e.g. 5 of each → ratio = 1.0.'
    },
    hintsPl: {
      topic: 'To dotyczy buforu amonowego, który działa przy wysokim pH.',
      strategy: 'Mimo że pKa jest wysokie (9.25), ta sama zasada obowiązuje: pH = pKa → równa proporcja.',
      method: 'pH = pKa + log([Zasada]/[Kwas]). 9.25 = 9.25 + log([Zasada]/[Kwas]). log = 0 → proporcja = 1.',
      solution: 'Docelowe pH (9.25) = pKa (9.25). Dodaj równe ilości, np. po 5 → proporcja = 1.0.'
    },
    explanation: 'Ammóníustuðpúði virkar við hátt pH. Sama hugmynd: jafnt hlutfall gefur pH = pKa, óháð hvaða stuðpúðakerfi er notað.',
    explanationEn: 'The ammonium buffer works at high pH. Same idea: an equal ratio gives pH = pKa, regardless of which buffer system is used.',
    explanationPl: 'Bufor amonowy działa przy wysokim pH. Ta sama idea: równa proporcja daje pH = pKa, niezależnie od użytego układu buforowego.'
  }
];
