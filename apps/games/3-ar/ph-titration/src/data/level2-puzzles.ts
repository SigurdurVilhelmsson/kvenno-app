// Level 2: Interactive titration puzzles

export interface Level2Puzzle {
  id: number;
  titrationId: number;  // Reference to titrations.ts
  taskIs: string;
  task: string;
  volumeTolerance: number;  // Acceptable error in mL
  acceptableIndicators: string[];  // Multiple correct answers allowed
  hintIs: string;
  hint: string;
  explanationIs: string;
  explanation: string;
}

export const LEVEL2_PUZZLES: Level2Puzzle[] = [
  {
    id: 1,
    titrationId: 1,  // HCl + NaOH (strong-strong)
    taskIs: 'Títraðu 25.0 mL af 0.100 M HCl með 0.100 M NaOH. Finndu jafngildispunktinn og veldu viðeigandi vísi.',
    task: 'Titrate 25.0 mL of 0.100 M HCl with 0.100 M NaOH. Find the equivalence point and select an appropriate indicator.',
    volumeTolerance: 1.0,
    acceptableIndicators: ['methyl-red', 'bromothymol-blue'],
    hintIs: 'Fyrir sterka sýru + sterka basa er jafngildispunktur við pH = 7. Veldu vísi sem breytir lit nálægt pH 7.',
    hint: 'For strong acid + strong base, equivalence point is at pH = 7. Choose an indicator that changes color near pH 7.',
    explanationIs: 'HCl + NaOH gefur NaCl + H₂O. Saltið NaCl er hlutlaust, svo jafngildispunktur er við pH = 7. Metýl rautt (pH 4.4-6.2) eða brómþýmól blátt (pH 6.0-7.6) eru góðir vísar.',
    explanation: 'HCl + NaOH produces NaCl + H₂O. The salt NaCl is neutral, so equivalence point is at pH = 7. Methyl red (pH 4.4-6.2) or bromothymol blue (pH 6.0-7.6) are good indicators.'
  },
  {
    id: 2,
    titrationId: 4,  // CH₃COOH + NaOH (weak-strong)
    taskIs: 'Títraðu 25.0 mL af 0.100 M ediksýru (CH₃COOH) með 0.100 M NaOH. Athugaðu að jafngildispunktur er EKKI við pH 7!',
    task: 'Titrate 25.0 mL of 0.100 M acetic acid (CH₃COOH) with 0.100 M NaOH. Note that equivalence point is NOT at pH 7!',
    volumeTolerance: 1.0,
    acceptableIndicators: ['phenolphthalein', 'thymol-blue'],
    hintIs: 'Veik sýra + sterk basi myndar basíska samþjöppuðu basa við jafngildispunkt. pH verður hærra en 7.',
    hint: 'Weak acid + strong base forms basic conjugate base at equivalence. pH will be higher than 7.',
    explanationIs: 'CH₃COOH + NaOH gefur CH₃COONa. Asetat jónin (CH₃COO⁻) er veik basi, svo lausnin verður basísk við jafngildispunkt (~pH 8.7). Fenólftaleín (pH 8.3-10.0) er besti vísirinn.',
    explanation: 'CH₃COOH + NaOH produces CH₃COONa. The acetate ion (CH₃COO⁻) is a weak base, so solution becomes basic at equivalence (~pH 8.7). Phenolphthalein (pH 8.3-10.0) is the best indicator.'
  },
  {
    id: 3,
    titrationId: 2,  // HNO₃ + KOH
    taskIs: 'Títraðu 25.0 mL af 0.100 M saltpétursýru (HNO₃) með 0.100 M KOH.',
    task: 'Titrate 25.0 mL of 0.100 M nitric acid (HNO₃) with 0.100 M KOH.',
    volumeTolerance: 1.0,
    acceptableIndicators: ['methyl-red', 'bromothymol-blue', 'methyl-orange'],
    hintIs: 'Þetta er sterk sýra + sterk basi títrun, svipað og HCl + NaOH.',
    hint: 'This is a strong acid + strong base titration, similar to HCl + NaOH.',
    explanationIs: 'HNO₃ + KOH gefur KNO₃ + H₂O. Eins og öll sterk-sterk títrun, er jafngildispunktur við pH = 7.',
    explanation: 'HNO₃ + KOH produces KNO₃ + H₂O. Like all strong-strong titrations, equivalence point is at pH = 7.'
  },
  {
    id: 4,
    titrationId: 9,  // NH₃ + HCl (weak base + strong acid)
    taskIs: 'Títraðu 25.0 mL af 0.100 M ammoníaki (NH₃) með 0.100 M HCl. Þetta er veik basi + sterk sýra!',
    task: 'Titrate 25.0 mL of 0.100 M ammonia (NH₃) with 0.100 M HCl. This is weak base + strong acid!',
    volumeTolerance: 1.0,
    acceptableIndicators: ['methyl-orange', 'methyl-red'],
    hintIs: 'Veik basi + sterk sýra myndar súra samþjöppuðu sýru við jafngildispunkt. pH verður lægra en 7.',
    hint: 'Weak base + strong acid forms acidic conjugate acid at equivalence. pH will be lower than 7.',
    explanationIs: 'NH₃ + HCl gefur NH₄Cl. Ammóníum jónin (NH₄⁺) er veik sýra, svo lausnin verður súr við jafngildispunkt (~pH 5.3). Metýl appelsínugult (pH 3.1-4.4) er góður vísir.',
    explanation: 'NH₃ + HCl produces NH₄Cl. The ammonium ion (NH₄⁺) is a weak acid, so solution becomes acidic at equivalence (~pH 5.3). Methyl orange (pH 3.1-4.4) is a good indicator.'
  },
  {
    id: 5,
    titrationId: 5,  // HF + NaOH
    taskIs: 'Títraðu 25.0 mL af 0.100 M flúorsýru (HF) með 0.100 M NaOH. HF er veik sýra.',
    task: 'Titrate 25.0 mL of 0.100 M hydrofluoric acid (HF) with 0.100 M NaOH. HF is a weak acid.',
    volumeTolerance: 1.0,
    acceptableIndicators: ['phenolphthalein', 'thymol-blue'],
    hintIs: 'HF er veik sýra þó hún sé halógen sýra. Jafngildispunktur verður yfir pH 7.',
    hint: 'HF is a weak acid despite being a halogen acid. Equivalence point will be above pH 7.',
    explanationIs: 'HF + NaOH gefur NaF. Flúoríð jónin (F⁻) er veik basi (samþjöppuð basi HF), svo lausnin verður basísk við jafngildispunkt. pKₐ(HF) ≈ 3.17.',
    explanation: 'HF + NaOH produces NaF. The fluoride ion (F⁻) is a weak base (conjugate base of HF), so solution becomes basic at equivalence. pKₐ(HF) ≈ 3.17.'
  },
  {
    id: 6,
    titrationId: 6,  // HCOOH + NaOH (formic acid)
    taskIs: 'Títraðu 25.0 mL af 0.100 M maurasýru (HCOOH) með 0.100 M NaOH.',
    task: 'Titrate 25.0 mL of 0.100 M formic acid (HCOOH) with 0.100 M NaOH.',
    volumeTolerance: 1.0,
    acceptableIndicators: ['phenolphthalein', 'thymol-blue'],
    hintIs: 'Maurasýra er veik sýra eins og ediksýra. Jafngildispunktur verður yfir pH 7.',
    hint: 'Formic acid is a weak acid like acetic acid. Equivalence point will be above pH 7.',
    explanationIs: 'HCOOH + NaOH gefur HCOONa. Formiat jónin (HCOO⁻) er veik basi, svo lausnin verður basísk við jafngildispunkt. pKₐ(HCOOH) ≈ 3.75.',
    explanation: 'HCOOH + NaOH produces HCOONa. The formate ion (HCOO⁻) is a weak base, so solution becomes basic at equivalence. pKₐ(HCOOH) ≈ 3.75.'
  }
];
