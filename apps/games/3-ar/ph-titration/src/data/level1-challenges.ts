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
    /**
     * A curve to draw as the option, unlabelled: the student reads the shape.
     * `labelIs` then describes it to a screen reader, and shows after the result.
     */
    curve?: 'strong-strong' | 'weak-strong' | 'strong-weak';
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
      'Hver þessara ferla sýnir títrun á STERKRI SÝRU með sterkum basa (t.d. HCl + NaOH)?',
    question: 'Which of these curves shows STRONG ACID + strong base (e.g., HCl + NaOH)?',
    options: [
      {
        id: 'A',
        labelIs: 'pH byrjar lágt (~1), stígur hægt, skarpt stökk við pH 7, helst hátt',
        label: 'pH starts low (~1), rises slowly, sharp jump at pH 7, stays high',
        isCorrect: true,
        curve: 'strong-strong',
      },
      {
        id: 'B',
        labelIs: 'pH byrjar lágt (~3), stuðpúðasvæði, stökk yfir pH 7, endar hátt',
        label: 'pH starts low (~3), buffer region, jump above pH 7, ends high',
        isCorrect: false,
        curve: 'weak-strong',
      },
      {
        id: 'C',
        labelIs: 'pH byrjar hátt (~11), lækkar hægt, stökk niður, endar lágt',
        label: 'pH starts high (~11), decreases slowly, sharp drop, ends low',
        isCorrect: false,
        curve: 'strong-weak',
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
      'Veik sýra + sterkur basi hefur: 1) Hærra upphafs-pH (t.d. 2,87 í 0,100 M ediksýru) vegna þess að sýran jónast aðeins að hluta, 2) Stuðpúðasvæði við hálfjafngildispunkt þar sem pH ≈ pKₐ, 3) Jafngildispunkt YFIR pH 7 vegna þess að samoka basinn (t.d. CH₃COO⁻) er basískur.',
    explanation:
      'Weak acid + strong base has: 1) Higher initial pH (e.g. 2.87 in 0.100 M acetic acid) due to partial dissociation, 2) Buffer region at half-equivalence where pH ≈ pKₐ, 3) Equivalence point ABOVE pH 7 because conjugate base (e.g., CH₃COO⁻) is basic.',
  },
  {
    id: 3,
    type: 'predict-color',
    questionIs:
      'Fenólftalín breytir lit frá litlausu í bleikt við pH 8,3-10,0. Hvaða lit sýnir fenólftalín við jafngildispunkt títrunar HCl + NaOH (pH = 7)?',
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
      topic: 'Þetta snýst um litabreytingasvið litvísa og pH gildi.',
      strategy: 'Fenólftalín breytir lit YFIR pH 8,3. Berðu saman við pH 7.',
      method: 'Ef pH < 8,3, þá er fenólftalín á súru formi → litlaust.',
      solution: 'pH 7 < 8,3, svo fenólftalín er LITLAUST við jafngildispunkt HCl + NaOH.',
    },
    explanationIs:
      'Við pH 7 (jafngildispunktur HCl + NaOH) er fenólftalín LITLAUST vegna þess að pH < 8,3. Það kemur ekki að sök: ferillinn er nær lóðréttur við jafngildispunktinn, svo brot úr dropa í viðbót lyftir pH upp fyrir 8,3 og lausnin verður bleik. Fenólftalín hentar því við títrun sterkrar sýru með sterkum basa, eins og metýlrautt og brómþýmólblátt.',
    explanation:
      'At pH 7 (HCl + NaOH equivalence point), phenolphthalein is COLORLESS because pH < 8.3. That does not matter: the curve is nearly vertical at equivalence, so a fraction of a drop more takes the pH above 8.3 and the solution turns pink. Phenolphthalein works for a strong acid with a strong base, as do methyl red and bromothymol blue.',
  },
  {
    id: 4,
    type: 'predict-color',
    questionIs:
      'Metýlappelsínugult breytir lit frá rauðu í gult við pH 3,1–4,4. Hvaða lit sýnir það við pH 2?',
    question:
      'Methyl orange changes from red to yellow at pH 3.1-4.4. What color does it show at pH 2?',
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
      topic: 'Þetta snýst um litabreytingasvið metýlappelsínuguls.',
      strategy:
        'pH 2 er UNDIR litabreytingasviðinu (3,1-4,4). Hvaða lit hefur litvísirinn í súrri lausn?',
      method:
        'Metýlappelsínugult er rautt undir pH 3,1, appelsínugult á milli, og gult yfir pH 4,4.',
      solution: 'pH 2 < 3,1, svo metýlappelsínugult er RAUTT.',
    },
    explanationIs:
      'Við pH 2 er lausnin mjög súr (undir 3,1), svo metýlappelsínugult sýnir RAUÐAN lit. Í sýru hefur litvísirinn tekið við róteind.',
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
        labelIs: 'Fyrir og eftir hálfjafngildispunkt (pH = pKₐ ± 1)',
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
        'Við hálfjafngildispunkt er [HA] = [A⁻], svo pH = pKₐ. Stuðpúðasvæði er pH = pKₐ ± 1.',
      solution: 'Stuðpúðasvæðið er fyrir og eftir hálfjafngildispunkt (pH = pKₐ ± 1).',
    },
    explanationIs:
      'Stuðpúðasvæðið er við pH = pKₐ ± 1. Við hálfjafngildispunkt er [HA] = [A⁻], svo pH = pKₐ (Henderson-Hasselbalch). Þetta svæði stenst pH-breytingar best.',
    explanation:
      'The buffer region is at pH = pKₐ ± 1. At half-equivalence point, [HA] = [A⁻], so pH = pKₐ (Henderson-Hasselbalch). This region resists pH changes best.',
  },
  {
    id: 6,
    type: 'curve-feature',
    questionIs: 'Hvernig er besti litvísirinn valinn fyrir títrun?',
    question: 'How is the best indicator chosen for a titration?',
    options: [
      {
        id: 'A',
        labelIs:
          'Litvísirinn þarf að skipta um lit á bratta kafla ferilsins, við jafngildispunktinn',
        label: 'The indicator must change colour on the steep part of the curve, at equivalence',
        isCorrect: true,
      },
      {
        id: 'B',
        labelIs: 'Allir litvísar virka fyrir allar títranir',
        label: 'All indicators work for all titrations',
        isCorrect: false,
      },
      {
        id: 'C',
        labelIs: 'Velja alltaf fenólftalín',
        label: 'Always choose phenolphthalein',
        isCorrect: false,
      },
      {
        id: 'D',
        labelIs: 'Litabreytingasvið litvísisins þarf að vera við pH 7',
        label: "The indicator's color change range must be at pH 7",
        isCorrect: false,
      },
    ],
    hints: {
      topic: 'Þetta snýst um val á litvísi fyrir títrun.',
      strategy:
        'Jafngildispunktur er ekki alltaf við pH 7. Veldu litvísi sem breytir lit við jafngildispunktinn.',
      method:
        'Við jafngildispunktinn er ferillinn nær lóðréttur: einn dropi breytir pH um nokkrar einingar. Litvísir sem skiptir um lit einhvers staðar á þeim kafla sýnir jafngildispunktinn upp á dropa.',
      solution:
        'HCl + NaOH (pH 7) → brómþýmólblátt, metýlrautt eða fenólftalín; CH₃COOH + NaOH (pH 8,7) → fenólftalín.',
    },
    explanationIs:
      'Góður litvísir skiptir um lit á bratta kafla ferilsins, svo endapunkturinn fellur innan dropa frá jafngildispunktinum. Hjá sterkri sýru og sterkum basa nær sá kafli frá pH 4 upp í 10, svo nokkrir litvísar duga: HCl + NaOH (pH 7) → brómþýmólblátt, metýlrautt eða fenólftalín. Hjá veikri sýru er hann styttri og ofar: CH₃COOH + NaOH (pH 8,7) → fenólftalín.',
    explanation:
      'A good indicator changes colour on the steep part of the curve, so the endpoint falls within a drop of equivalence. For a strong acid with a strong base that part runs from pH 4 to 10, so several indicators work: HCl + NaOH (pH 7) → bromothymol blue, methyl red or phenolphthalein. For a weak acid it is shorter and higher: CH₃COOH + NaOH (pH 8.7) → phenolphthalein.',
  },
  {
    id: 7,
    type: 'match-curve',
    questionIs:
      'Ammóníak (NH₃, veikur basi) er títrað með saltsýru (HCl). Hvaða lýsing passar við ferilinn og litvísinn?',
    question:
      'Ammonia (NH₃, a weak base) is titrated with hydrochloric acid (HCl). Which description fits the curve and the indicator?',
    options: [
      {
        id: 'A',
        labelIs: 'pH byrjar um 11 og lækkar; jafngildispunktur undir pH 7 (~5,3); metýlrautt',
        label: 'pH starts near 11 and falls; equivalence below pH 7 (~5.3); methyl red',
        isCorrect: true,
      },
      {
        id: 'B',
        labelIs: 'pH byrjar um 11 og lækkar; jafngildispunktur við pH 7; brómþýmólblátt',
        label: 'pH starts near 11 and falls; equivalence at pH 7; bromothymol blue',
        isCorrect: false,
      },
      {
        id: 'C',
        labelIs: 'pH byrjar um 11 og lækkar; jafngildispunktur yfir pH 7 (~8,7); fenólftalín',
        label: 'pH starts near 11 and falls; equivalence above pH 7 (~8.7); phenolphthalein',
        isCorrect: false,
      },
      {
        id: 'D',
        labelIs: 'pH byrjar lágt og hækkar; jafngildispunktur undir pH 7 (~5,3); metýlrautt',
        label: 'pH starts low and rises; equivalence below pH 7 (~5.3); methyl red',
        isCorrect: false,
      },
    ],
    curveType: 'strong-weak',
    hints: {
      topic: 'Þetta snýst um títrun veiks basa með sterkri sýru.',
      strategy: 'Hvað er í flöskunni í upphafi, og hvað er eftir í henni við jafngildispunkt?',
      method:
        'Sýru er bætt í basa, svo pH lækkar. Við jafngildispunkt er NH₄⁺ eftir, sem er veik sýra. Veldu svo litvísi sem skiptir um lit á bratta kaflanum.',
      solution:
        'pH byrjar hátt og lækkar; NH₄⁺ gerir lausnina súra við jafngildispunkt (pH ~5,3), og metýlrautt (pH 4,4–6,2) skiptir um lit þar.',
    },
    explanationIs:
      'Í upphafi er aðeins veikur basi í flöskunni, svo pH er um 11, og það lækkar þegar sýrunni er bætt við. Við jafngildispunkt er allt NH₃ orðið að NH₄⁺, sem er veik sýra, svo pH er undir 7 (~5,3). Metýlrautt (pH 4,4–6,2) skiptir um lit innan við 0,1 mL frá jafngildispunktinum; brómþýmólblátt og fenólftalín skipta of snemma.',
    explanation:
      'At the start only the weak base is in the flask, so the pH is near 11, and it falls as acid is added. At equivalence all the NH₃ has become NH₄⁺, a weak acid, so the pH is below 7 (~5.3). Methyl red (pH 4.4–6.2) changes colour within 0.1 mL of equivalence; bromothymol blue and phenolphthalein change too early.',
  },
];
