/**
 * Stig 0 — Markverðir stafir. The teaching items and the graded ones.
 *
 * Ordered teach-before-test, the April 2026 structure: the rules are shown
 * worked before anything is asked, then counting, then writing to a precision,
 * then the two arithmetic rules that Einingagreining's own Level 3 relies on.
 *
 * **Every answer here is derived from `utils/sigfigs.ts`, never typed in.** A
 * hand-entered answer is how a question comes to disagree with its own grader —
 * the defect this repo shipped in `molmassi` (B4) and again in
 * `buffer-recipe-creator` (Sep 2026). `sigfig-items.test.ts` re-derives every
 * one and fails if the two ever part company.
 */

import {
  countSigFigs,
  decimalPlacesAfterAdd,
  roundToSigFigs,
  sigFigsAfterMultiply,
} from '../utils/sigfigs';

export interface Rule {
  n: number;
  title: string;
  body: string;
  /** Worked examples: the number as written, and why it counts as it does. */
  examples: { written: string; count: number; why: string }[];
}

/** The four counting rules, as the course states them. */
export const RULES: Rule[] = [
  {
    n: 1,
    title: 'Allir tölustafir aðrir en núll eru markverðir',
    body: 'Ef stafurinn er 1–9 telur hann. Alltaf.',
    examples: [
      { written: '7', count: 1, why: 'einn tölustafur, einn markverður' },
      { written: '123', count: 3, why: 'þrír tölustafir, enginn þeirra núll' },
    ],
  },
  {
    n: 2,
    title: 'Núll milli annarra tölustafa telja',
    body: 'Núll sem er innilokað á milli markverðra stafa er sjálft markvert.',
    examples: [
      { written: '101', count: 3, why: 'núllið er innilokað milli tveggja eina' },
      { written: '50,07', count: 4, why: 'bæði núllin eru innilokuð' },
    ],
  },
  {
    n: 3,
    title: 'Núll fremst telja aldrei',
    body: 'Þau segja bara hvar kommann stendur — þau mæla ekkert.',
    examples: [
      { written: '0,5', count: 1, why: 'núllið fremst staðsetur bara kommann' },
      { written: '0,00450', count: 3, why: 'aðeins 4, 5 og aftasta 0 eru markverð' },
    ],
  },
  {
    n: 4,
    title: 'Núll aftast telja aðeins ef komma er skrifuð',
    body: 'Þetta er reglan sem mestu skiptir — og sú eina sem breytir merkingu tölunnar eftir því hvernig hún er skrifuð.',
    examples: [
      { written: '1200', count: 2, why: 'engin komma, svo núllin aftast telja ekki' },
      { written: '1200,', count: 4, why: 'kommann gerir bæði núllin markverð' },
      { written: '2,50', count: 3, why: 'núllið aftast er á eftir kommu, svo það telur' },
    ],
  },
];

export interface CountItem {
  id: string;
  written: string;
  answer: number;
  /** Which rule it is really testing, so the feedback can name it. */
  rule: number;
  misconception?: string;
}

const count = (id: string, written: string, rule: number, misconception?: string): CountItem => ({
  id,
  written,
  answer: countSigFigs(written),
  rule,
  misconception,
});

/** Counting practice. The pairs are deliberate — same digits, different claim. */
export const COUNT_ITEMS: CountItem[] = [
  count('c1', '4,56', 1),
  count('c2', '2005', 2, 'Núllin hér eru innilokuð milli 2 og 5, svo þau telja bæði (regla 2).'),
  count(
    'c3',
    '0,0032',
    3,
    'Núllin fremst staðsetja aðeins kommann og telja aldrei (regla 3). Aðeins 3 og 2 eru markverð.'
  ),
  count(
    'c4',
    '4500',
    4,
    'Engin komma er skrifuð, svo núllin aftast telja ekki (regla 4). Berðu þetta saman við 4500, í næstu spurningu.'
  ),
  count(
    'c5',
    '4500,',
    4,
    'Hér er komma skrifuð, og þá verða bæði núllin aftast markverð (regla 4). Sama talan, önnur fullyrðing um nákvæmni.'
  ),
  count('c6', '0,02040', 3, 'Núllin fremst telja ekki; núllið á milli og núllið aftast gera það.'),
];

export interface RoundItem {
  id: string;
  value: number;
  figures: number;
  /** The written form, derived — never typed. */
  answer: string;
  context: string;
}

const round = (id: string, value: number, figures: number, context: string): RoundItem => ({
  id,
  value,
  figures,
  answer: roundToSigFigs(value, figures),
  context,
});

/**
 * Writing to a precision. `r3` is the one that teaches the hardest point: the
 * trailing zero is not decoration, and leaving it off understates the answer.
 * `r5` cannot be written in plain decimal at all.
 */
export const ROUND_ITEMS: RoundItem[] = [
  round('r1', 1234, 2, 'Vogin sýnir 1234 g en hún er aðeins nákvæm upp á tvo markverða stafi.'),
  round(
    'r2',
    0.0045678,
    3,
    'Styrkur mælist 0,0045678 M. Skrifaðu hann með þremur markverðum stöfum.'
  ),
  round('r3', 2.5, 3, 'Rúmmál 2,5 mL er mælt með pípettu sem gefur þrjá markverða stafi.'),
  round('r4', 98765, 3, 'Massi 98765 mg úr vog sem gefur þrjá markverða stafi.'),
  round(
    'r5',
    60.221,
    2,
    'Hitastig mælist 60,221 °C en mælirinn er aðeins nákvæmur upp á tvo markverða stafi.'
  ),
];

export interface ArithmeticItem {
  id: string;
  /** What the student is shown. */
  expression: string;
  kind: 'margfeldi' | 'summa';
  /** Significant figures (margfeldi) or decimal places (summa) the answer may carry. */
  answer: number;
  explanation: string;
}

/**
 * The two rules, and the pair that shows they disagree.
 *
 * `a4` is the point of the whole step: the same two numbers give a different
 * limit depending on whether they are multiplied or added. A student who learns
 * one rule and applies it to both gets a visibly wrong answer.
 */
export const ARITHMETIC_ITEMS: ArithmeticItem[] = [
  {
    id: 'a1',
    expression: '2,50 × 1,1',
    kind: 'margfeldi',
    answer: sigFigsAfterMultiply(['2,50', '1,1']),
    explanation:
      '2,50 hefur 3 markverða stafi og 1,1 hefur 2. Margfeldið má ekki vera nákvæmara en ónákvæmasta mælingin, svo svarið fær 2.',
  },
  {
    id: 'a2',
    expression: '50,0 mL × 2,50 g/mL',
    kind: 'margfeldi',
    answer: sigFigsAfterMultiply(['50,0', '2,50']),
    explanation: 'Báðar mælingarnar hafa 3 markverða stafi, svo svarið fær 3.',
  },
  {
    id: 'a3',
    expression: '2,50 g × (1000 mg / 1 g)',
    kind: 'margfeldi',
    answer: sigFigsAfterMultiply(['2,50', null]),
    explanation:
      'Hér er aðeins ein mæling: 2,50 með 3 markverða stafi. Umreikningsstuðullinn 1000 mg í grammi er skilgreining, ekki mæling — hann takmarkar ekkert. Þetta er reglan sem öll einingagreining hvílir á.',
  },
  {
    id: 'a4',
    expression: '100 + 1,234',
    kind: 'summa',
    answer: decimalPlacesAfterAdd(['100', '1,234']),
    explanation:
      'Í samlagningu ræður fæsti fjöldi AUKASTAFA, ekki markverðra stafa. 100 hefur 0 aukastafi, svo svarið fær 0 aukastafi: 101. Hefðirðu notað margföldunarregluna hefðirðu fengið 1 markverðan staf, sem gefur 100 — annað svar.',
  },
  {
    id: 'a5',
    expression: '12,11 + 0,3',
    kind: 'summa',
    answer: decimalPlacesAfterAdd(['12,11', '0,3']),
    explanation: '0,3 hefur aðeins 1 aukastaf, svo svarið fær 1 aukastaf: 12,4.',
  },
];
