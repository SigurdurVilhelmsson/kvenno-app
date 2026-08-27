/**
 * Lotubundnar sveiflur — periodic trends.
 *
 * Harvested from `namsbokasafn-leikir` (frozen at `379266e`),
 * `games/1-ar/lotukerfid/src/data/trends.ts`, per Phase 3 of
 * `docs/plans/2026-08-16-games-roadmap.md`. Periodic trends were taught nowhere
 * on the platform: the shipped Level 2 asks a student to *order elements by
 * mass*, which is a lookup, not a trend.
 *
 * The twelve comparisons came over as written — every key was checked and every
 * one is right. The Icelandic did not: the old file called the atomic radius
 * `atómgeisli`, which `packages/shared/i18n/ordabok.md` gives as `atómradíus`
 * and which returns **zero** hits in the school's textbook corpus against 23
 * for `atómradíus`. It also blamed the across-period contraction on
 * `sterkari kjarnakraftur` — the strong nuclear force, which has nothing to do
 * with it. The cause is the rising *effective nuclear charge*, `virk
 * kjarnhleðsla`, which is what the textbook calls it.
 *
 * Every pair is either in the same period or the same group, deliberately: the
 * naive rules disagree on a diagonal comparison, and this level teaches the
 * rules. `__tests__/trends.test.ts` derives each answer from the two elements'
 * positions and refuses any pair that is neither.
 */

export type TrendType = 'atomic-radius' | 'ionization-energy' | 'electronegativity';

export interface TrendInfo {
  /** What the trend is called, on screen */
  name: string;
  /** One line on what the quantity means */
  description: string;
  /** The rule itself, shown with the feedback */
  rule: string;
  emoji: string;
}

export interface TrendQuestion {
  id: string;
  trendType: TrendType;
  element1Symbol: string;
  element2Symbol: string;
  /** The element with the larger value of the trend quantity */
  answerSymbol: string;
  question: string;
  explanation: string;
}

export const TREND_INFO: Record<TrendType, TrendInfo> = {
  'atomic-radius': {
    name: 'Atómradíus',
    description: 'Stærð atómsins — fjarlægðin frá kjarnanum út í ystu rafeindaskel.',
    rule: 'Atómradíus minnkar til hægri yfir lotuna og stækkar niður flokkinn.',
    emoji: '🔴',
  },
  'ionization-energy': {
    name: 'Jónunarorka',
    description: 'Orkan sem þarf til að losa ystu rafeindina frá atómi.',
    rule: 'Jónunarorka eykst til hægri yfir lotuna og minnkar niður flokkinn.',
    emoji: '⚡',
  },
  electronegativity: {
    name: 'Rafneikvæðni',
    description: 'Hversu fast atóm dregur að sér rafeindir í efnatengi.',
    rule: 'Rafneikvæðni eykst til hægri yfir lotuna og minnkar niður flokkinn (eðalgös undanskilin).',
    emoji: '🧲',
  },
};

export const TREND_QUESTIONS: TrendQuestion[] = [
  // ── Atómradíus ────────────────────────────────────────────────────────────
  {
    id: 'ar-1',
    trendType: 'atomic-radius',
    element1Symbol: 'Na',
    element2Symbol: 'Cl',
    answerSymbol: 'Na',
    question: 'Hvort hefur stærri atómradíus: Na eða Cl?',
    explanation:
      'Na hefur stærri atómradíus. Þegar farið er til hægri yfir lotuna vex virk kjarnhleðsla, sem dregur rafeindirnar fastar að kjarnanum og minnkar atómið.',
  },
  {
    id: 'ar-2',
    trendType: 'atomic-radius',
    element1Symbol: 'Li',
    element2Symbol: 'Na',
    answerSymbol: 'Na',
    question: 'Hvort hefur stærri atómradíus: Li eða Na?',
    explanation:
      'Na hefur stærri atómradíus. Niður flokkinn bætist ný rafeindaskel við í hverri lotu og atómið stækkar.',
  },
  {
    id: 'ar-3',
    trendType: 'atomic-radius',
    element1Symbol: 'O',
    element2Symbol: 'S',
    answerSymbol: 'S',
    question: 'Hvort hefur stærri atómradíus: O eða S?',
    explanation:
      'S hefur stærri atómradíus. S er neðar í sama flokki og hefur fleiri rafeindaskeljar utan um kjarnann.',
  },
  {
    id: 'ar-4',
    trendType: 'atomic-radius',
    element1Symbol: 'C',
    element2Symbol: 'F',
    answerSymbol: 'C',
    question: 'Hvort hefur stærri atómradíus: C eða F?',
    explanation:
      'C hefur stærri atómradíus. F er lengra til hægri í sömu lotu og hefur meiri virka kjarnhleðslu.',
  },

  // ── Jónunarorka ───────────────────────────────────────────────────────────
  {
    id: 'ie-1',
    trendType: 'ionization-energy',
    element1Symbol: 'Li',
    element2Symbol: 'F',
    answerSymbol: 'F',
    question: 'Hvort hefur hærri jónunarorku: Li eða F?',
    explanation:
      'F hefur hærri jónunarorku. Til hægri yfir lotuna eykst virk kjarnhleðsla og atómið heldur fastar í ystu rafeindina.',
  },
  {
    id: 'ie-2',
    trendType: 'ionization-energy',
    element1Symbol: 'Na',
    element2Symbol: 'K',
    answerSymbol: 'Na',
    question: 'Hvort hefur hærri jónunarorku: Na eða K?',
    explanation:
      'Na hefur hærri jónunarorku. Niður flokkinn minnkar jónunarorkan því ysta rafeindin er fjær kjarnanum og auðveldara að losa hana.',
  },
  {
    id: 'ie-3',
    trendType: 'ionization-energy',
    element1Symbol: 'Mg',
    element2Symbol: 'Ca',
    answerSymbol: 'Mg',
    question: 'Hvort hefur hærri jónunarorku: Mg eða Ca?',
    explanation:
      'Mg hefur hærri jónunarorku. Mg er ofar í flokki 2 og ysta rafeindin er nær kjarnanum.',
  },
  {
    id: 'ie-4',
    trendType: 'ionization-energy',
    element1Symbol: 'B',
    element2Symbol: 'N',
    answerSymbol: 'N',
    question: 'Hvort hefur hærri jónunarorku: B eða N?',
    explanation:
      'N hefur hærri jónunarorku. N er lengra til hægri í lotu 2 og hefur meiri virka kjarnhleðslu.',
  },

  // ── Rafneikvæðni ──────────────────────────────────────────────────────────
  {
    id: 'en-1',
    trendType: 'electronegativity',
    element1Symbol: 'Na',
    element2Symbol: 'Cl',
    answerSymbol: 'Cl',
    question: 'Hvort er rafneikvæðara: Na eða Cl?',
    explanation:
      'Cl er rafneikvæðara. Rafneikvæðni eykst til hægri yfir lotuna, því þau atóm eru nær því að fylla ystu skel og sækjast eftir rafeindum.',
  },
  {
    id: 'en-2',
    trendType: 'electronegativity',
    element1Symbol: 'F',
    element2Symbol: 'Cl',
    answerSymbol: 'F',
    question: 'Hvort er rafneikvæðara: F eða Cl?',
    explanation:
      'F er rafneikvæðast allra frumefna. Ofar í flokknum er ysta skelin nær kjarnanum og rafneikvæðnin meiri.',
  },
  {
    id: 'en-3',
    trendType: 'electronegativity',
    element1Symbol: 'C',
    element2Symbol: 'O',
    answerSymbol: 'O',
    question: 'Hvort er rafneikvæðara: C eða O?',
    explanation:
      'O er rafneikvæðara. O er lengra til hægri í sömu lotu og dregur fastar að sér rafeindir í efnatengi.',
  },
  {
    id: 'en-4',
    trendType: 'electronegativity',
    element1Symbol: 'K',
    element2Symbol: 'Br',
    answerSymbol: 'Br',
    question: 'Hvort er rafneikvæðara: K eða Br?',
    explanation:
      'Br er rafneikvæðara. Br er halógen og vantar aðeins eina rafeind í fulla ystu skel, en K er alkalímálmur sem losar sig frekar við sína.',
  },
];
