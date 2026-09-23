// Level 1: Conceptual challenges for understanding titration curves

import type { TieredHints } from '@shared/types';

export interface Level1Challenge {
  id: number;
  type: 'match-curve' | 'predict-color' | 'find-equivalence' | 'curve-feature';
  questionIs: string;
  question: string;

  // For multiple choice
  options?: {
    id: string;
    labelIs: string;
    label: string;
    isCorrect: boolean;
  }[];

  // For visual elements
  curveType?: 'strong-strong' | 'weak-strong' | 'strong-weak';
  pH?: number;
  indicatorId?: string;

  hints: TieredHints;
  explanationIs: string;
  explanation: string;
}

export const LEVEL1_CHALLENGES: Level1Challenge[] = [
  {
    id: 1,
    type: 'match-curve',
    questionIs:
      'Hvaða títrunarferill sýnir títrun á STERKRI SÝRU með sterkum basa (t.d. HCl + NaOH)?',
    question: 'Which titration curve shows STRONG ACID + strong base (e.g., HCl + NaOH)?',
    options: [
      {
        id: 'A',
        labelIs: 'pH byrjar lágt (~1), stígur hægt, skarpt stökk við pH 7, heldur hátt',
        label: 'pH starts low (~1), rises slowly, sharp jump at pH 7, stays high',
        isCorrect: true,
      },
      {
        id: 'B',
        labelIs: 'pH byrjar lágt (~3), stuðpúðasvæði, stökk yfir pH 7, endar hátt',
        label: 'pH starts low (~3), buffer region, jump above pH 7, ends high',
        isCorrect: false,
      },
      {
        id: 'C',
        labelIs: 'pH byrjar hátt (~13), lækkar hægt, stökk niður, endar lágt',
        label: 'pH starts high (~13), decreases slowly, sharp drop, ends low',
        isCorrect: false,
      },
    ],
    curveType: 'strong-strong',
    hints: {
      topic: 'Þetta snýst um títrunarferla sterkra sýra og basa.',
      strategy: 'Hugsaðu um upphafs-pH og hvar jafngildispunkturinn er.',
      method:
        'Sterk sýra hefur mjög lágt upphafs-pH (u.þ.b. 1). Jafngildispunktur er nákvæmlega við pH 7.',
      solution: 'pH byrjar við ~1, jafngildispunktur við pH 7. Sterk sýra + sterkur basi.',
    },
    explanationIs:
      'Sterk sýra + sterkur basi hefur jafngildispunkt við pH = 7 vegna þess að saltið sem myndast (t.d. NaCl) er hlutlaust. Upphafs-pH er lágt (~1) vegna þess að sýran jónast að fullu.',
    explanation:
      'Strong acid + strong base has equivalence point at pH = 7 because the salt formed (e.g., NaCl) is neutral. Initial pH is low (~1) because the acid is fully dissociated.',
  },
  {
    id: 2,
    type: 'match-curve',
    questionIs:
      'Hvaða einkenni á títrunarferill fyrir VEIKA SÝRU + sterkan basa (t.d. CH₃COOH + NaOH)?',
    question:
      'What feature does a titration curve for WEAK ACID + strong base (e.g., CH₃COOH + NaOH) have?',
    options: [
      {
        id: 'A',
        labelIs: 'Jafngildispunktur við pH = 7',
        label: 'Equivalence point at pH = 7',
        isCorrect: false,
      },
      {
        id: 'B',
        labelIs: 'Stuðpúðasvæði þar sem pH breytist lítið og jafngildispunktur yfir pH 7',
        label: 'Buffer region where pH changes little and equivalence point above pH 7',
        isCorrect: true,
      },
      {
        id: 'C',
        labelIs: 'Mjög lágt upphafs-pH (u.þ.b. 1)',
        label: 'Very low initial pH (~1)',
        isCorrect: false,
      },
      {
        id: 'D',
        labelIs: 'Jafngildispunktur undir pH 7',
        label: 'Equivalence point below pH 7',
        isCorrect: false,
      },
    ],
    curveType: 'weak-strong',
    hints: {
      topic: 'Þetta snýst um títrunarferla veikra sýra og sterkra basa.',
      strategy:
        'Veik sýra jónast ekki að fullu, svo upphafs-pH er hærra. Hugsaðu hvað myndast við jafngildispunkt.',
      method: 'Veik sýra + sterkur basi myndar samoka basa (basískt) við jafngildispunkt → pH > 7.',
      solution:
        'Stuðpúðasvæði + jafngildispunktur yfir pH 7 eru lykileinkenni veikrar sýru + sterks basa.',
    },
    explanationIs:
      'Veik sýra + sterkur basi hefur: 1) Hærra upphafs-pH (3-5) vegna þess að sýran jónast aðeins að hluta, 2) Stuðpúðasvæði við hálfan jafngildispunkt þar sem pH ≈ pKₐ, 3) Jafngildispunkt YFIR pH 7 vegna þess að samoka basinn (t.d. CH₃COO⁻) er basískur.',
    explanation:
      'Weak acid + strong base has: 1) Higher initial pH (3-5) due to partial dissociation, 2) Buffer region at half-equivalence where pH ≈ pKₐ, 3) Equivalence point ABOVE pH 7 because conjugate base (e.g., CH₃COO⁻) is basic.',
  },
  {
    id: 3,
    type: 'predict-color',
    questionIs:
      'Fenólftaleín breytir lit frá litlausu í bleikt við pH 8,3-10,0. Hvaða lit sýnir fenólftaleín við jafngildispunkt títrunar HCl + NaOH (pH = 7)?',
    question:
      'Phenolphthalein changes from colorless to pink at pH 8.3-10.0. What color does phenolphthalein show at the equivalence point of HCl + NaOH titration (pH = 7)?',
    pH: 7.0,
    indicatorId: 'phenolphthalein',
    options: [
      {
        id: 'A',
        labelIs: 'Bleikur',
        label: 'Pink',
        isCorrect: false,
      },
      {
        id: 'B',
        labelIs: 'Litlaus',
        label: 'Colorless',
        isCorrect: true,
      },
      {
        id: 'C',
        labelIs: 'Rauður',
        label: 'Red',
        isCorrect: false,
      },
    ],
    hints: {
      topic: 'Þetta snýst um litbreytingasvið vísa og pH gildi.',
      strategy: 'Fenólftaleín breytir lit YFIR pH 8,3. Berðu saman við pH 7.',
      method: 'Ef pH < 8,3, þá er fenólftaleín á súru formi → litlaust.',
      solution: 'pH 7 < 8,3, svo fenólftaleín er LITLAUST við jafngildispunkt HCl + NaOH.',
    },
    explanationIs:
      'Við pH 7 (jafngildispunktur HCl + NaOH) er fenólftaleín LITLAUST vegna þess að pH < 8,3. Þetta þýðir að fenólftaleín er EKKI góður vísir fyrir títrun sterkrar sýru með sterkum basa!',
    explanation:
      'At pH 7 (HCl + NaOH equivalence point), phenolphthalein is COLORLESS because pH < 8.3. This means phenolphthalein is NOT a good indicator for strong acid + strong base titration!',
  },
  {
    id: 4,
    type: 'predict-color',
    questionIs:
      'Metýlappelsínugult breytir lit frá rauðu í appelsínugult við pH 3,1-4,4. Hvaða lit sýnir það við pH 2?',
    question:
      'Methyl orange changes from red to orange at pH 3.1-4.4. What color does it show at pH 2?',
    pH: 2.0,
    indicatorId: 'methyl-orange',
    options: [
      {
        id: 'A',
        labelIs: 'Appelsínugulur',
        label: 'Orange',
        isCorrect: false,
      },
      {
        id: 'B',
        labelIs: 'Gulur',
        label: 'Yellow',
        isCorrect: false,
      },
      {
        id: 'C',
        labelIs: 'Rauður',
        label: 'Red',
        isCorrect: true,
      },
    ],
    hints: {
      topic: 'Þetta snýst um litbreytingasvið metýlappelsínuguls.',
      strategy:
        'pH 2 er UNDIR litbreytingarsviðinu (3,1-4,4). Hvaða lit hefur vísirinn í súrri lausn?',
      method:
        'Metýlappelsínugult er rautt undir pH 3,1, appelsínugult á milli, og gult yfir pH 4,4.',
      solution: 'pH 2 < 3,1, svo metýlappelsínugult er RAUTT.',
    },
    explanationIs:
      'Við pH 2 er lausnin mjög súr (undir 3,1), svo metýlappelsínugult sýnir RAUÐAN lit. Í sýru er vísirinn í prótónformi sínu.',
    explanation:
      'At pH 2, the solution is very acidic (below 3.1), so methyl orange shows RED color. In acid, the indicator is in its protonated form.',
  },
  {
    id: 5,
    type: 'curve-feature',
    questionIs: 'Á títrunarferli fyrir veika sýru + sterkan basa, hvar er stuðpúðasvæðið?',
    question: 'On a titration curve for weak acid + strong base, where is the buffer region?',
    curveType: 'weak-strong',
    options: [
      {
        id: 'A',
        labelIs: 'Við jafngildispunkt',
        label: 'At the equivalence point',
        isCorrect: false,
      },
      {
        id: 'B',
        labelIs: 'Fyrir og eftir hálfan jafngildispunkt (pH = pKₐ ± 1)',
        label: 'Before and after half-equivalence point (pH = pKₐ ± 1)',
        isCorrect: true,
      },
      {
        id: 'C',
        labelIs: 'Eftir jafngildispunkt',
        label: 'After the equivalence point',
        isCorrect: false,
      },
      {
        id: 'D',
        labelIs: 'Við upphaf títrunar',
        label: 'At the start of titration',
        isCorrect: false,
      },
    ],
    hints: {
      topic: 'Þetta snýst um stuðpúðasvæði á títrunarferli.',
      strategy:
        'Stuðpúði myndast þegar bæði veik sýra og samoka basi hennar eru til staðar í sambærilegu magni.',
      method:
        'Við hálfan jafngildispunkt er [HA] = [A⁻], svo pH = pKₐ. Stuðpúðasvæði er pH = pKₐ ± 1.',
      solution: 'Stuðpúðasvæðið er fyrir og eftir hálfan jafngildispunkt (pH = pKₐ ± 1).',
    },
    explanationIs:
      'Stuðpúðasvæðið er við pH = pKₐ ± 1. Við hálfan jafngildispunkt er [HA] = [A⁻], svo pH = pKₐ (Henderson-Hasselbalch). Þetta svæði stenst pH-breytingar best.',
    explanation:
      'The buffer region is at pH = pKₐ ± 1. At half-equivalence point, [HA] = [A⁻], so pH = pKₐ (Henderson-Hasselbalch). This region resists pH changes best.',
  },
  {
    id: 6,
    type: 'curve-feature',
    questionIs: 'Hvernig er besti vísirinn valinn fyrir títrun?',
    question: 'How is the best indicator chosen for a titration?',
    options: [
      {
        id: 'A',
        labelIs: 'Litbreytingasvið vísisins þarf að innihalda pH við jafngildispunkt',
        label: "The indicator's color change range must contain the equivalence point pH",
        isCorrect: true,
      },
      {
        id: 'B',
        labelIs: 'Allir vísar virka fyrir allar títranir',
        label: 'All indicators work for all titrations',
        isCorrect: false,
      },
      {
        id: 'C',
        labelIs: 'Velja alltaf fenólftaleín',
        label: 'Always choose phenolphthalein',
        isCorrect: false,
      },
      {
        id: 'D',
        labelIs: 'Litbreytingasvið vísisins þarf að vera við pH 7',
        label: "The indicator's color change range must be at pH 7",
        isCorrect: false,
      },
    ],
    hints: {
      topic: 'Þetta snýst um val á vísi fyrir títrun.',
      strategy:
        'Jafngildispunktur er ekki alltaf við pH 7. Veldu vísi sem breytir lit við jafngildispunktinn.',
      method: 'Litbreytingasvið vísisins verður að innihalda pH við jafngildispunkt.',
      solution: 'HCl + NaOH (pH 7) → metýlrautt; CH₃COOH + NaOH (pH ~9) → fenólftaleín.',
    },
    explanationIs:
      'Besti vísirinn hefur litbreytingasvið sem inniheldur jafngildispunkt títrunarinnar. T.d.: HCl + NaOH (pH 7) → metýlrautt eða brómþýmólblátt; CH₃COOH + NaOH (pH ~9) → fenólftaleín.',
    explanation:
      "The best indicator has a color change range containing the titration's equivalence point. E.g.: HCl + NaOH (pH 7) → methyl red or bromothymol blue; CH₃COOH + NaOH (pH ~9) → phenolphthalein.",
  },
];
