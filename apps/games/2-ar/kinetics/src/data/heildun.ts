/**
 * Heildað hraðalögmál og Arrhenius: the ten Æfa items. Each holds only what the book gives (the
 * numbers in its worked examples and exercises, ch. 12, m68791 and m68793) and says which
 * formula answers it; the key is worked out by `engine/rate-laws.ts`, never typed.
 * `heildun.test.ts` holds every key to the book's own answer.
 */

import type { Order } from '../engine/rate-laws';

interface Base {
  id: string;
  /** The setting and the givens, as the student reads them. */
  setting: string;
  question: string;
  /** Where in the book the numbers come from. */
  source: string;
}

interface NumericBase extends Base {
  /** The unit the answer is typed in, shown beside the field. */
  unit: string;
  /** What the book prints as the answer, where it prints one, for the test to hold the engine to. */
  bookAnswer?: number;
}

/** Time for a first-order reaction to leave a fraction of its reactant. */
export interface TimeItem extends NumericBase {
  kind: 'timi';
  left: number;
  k: number;
}

/** [A] after time t, at a given order. */
export interface ConcentrationItem extends NumericBase {
  kind: 'styrkur';
  order: Order;
  A0: number;
  k: number;
  t: number;
}

/** Half-life at a given order. */
export interface HalfLifeItem extends NumericBase {
  kind: 'helmingun';
  order: Order;
  A0: number;
  k: number;
}

/** First-order k from a half-life, answered as a multiple of `scale`. */
export interface RateConstantItem extends NumericBase {
  kind: 'hradafasti';
  tHalf: number;
  scale: number;
}

/** Percent of a first-order reactant left after time t. */
export interface LeftItem extends NumericBase {
  kind: 'eftir';
  k: number;
  t: number;
}

/** Activation energy from k at two temperatures, in kJ/mól. */
export interface ActivationItem extends NumericBase {
  kind: 'virkjun';
  k1: number;
  T1: number;
  k2: number;
  T2: number;
}

/** Which plot is a straight line at a given order. */
export interface PlotItem extends Base {
  kind: 'graf';
  order: Order;
}

/** What doubling [A]₀ does to the half-life at a given order. */
export interface ScaleItem extends Base {
  kind: 'tvofalt';
  order: Order;
}

export type NumericItem =
  TimeItem | ConcentrationItem | HalfLifeItem | RateConstantItem | LeftItem | ActivationItem;
export type HeildunItem = NumericItem | PlotItem | ScaleItem;

export const PLOTS: Record<Order, string> = {
  0: '[A] á móti t',
  1: 'ln[A] á móti t',
  2: '1/[A] á móti t',
};

export const SCALES = ['Helst óbreyttur', 'Tvöfaldast', 'Helmingast'] as const;

export const HEILDUN_ITEMS: readonly HeildunItem[] = [
  {
    id: 'timi-syklobutan',
    kind: 'timi',
    setting:
      'Sýklóbútan, C₄H₈, brotnar niður eftir fyrsta stigs hraðalögmáli við 500 °C með k = 9,2 × 10⁻³ s⁻¹.',
    question: 'Hve langan tíma tekur það fyrir 80,0 % sýnisins að brotna niður?',
    unit: 's',
    left: 0.2,
    k: 9.2e-3,
    bookAnswer: 175,
    source:
      'kafli 12, „Heilduð hraðalögmál“, sýnidæmi um heildað hraðalögmál fyrsta stigs (m68791)',
  },
  {
    id: 'styrkur-butadien',
    kind: 'styrkur',
    setting:
      'Tvíliðun bútadíens, C₄H₆, er annars stigs með k = 5,76 × 10⁻² L/(mól·mín). Upphafsstyrkurinn er 0,200 M.',
    question: 'Hver er styrkur bútadíens eftir 10,0 mín?',
    unit: 'M',
    order: 2,
    A0: 0.2,
    k: 5.76e-2,
    t: 10,
    bookAnswer: 0.179,
    source:
      'kafli 12, „Heilduð hraðalögmál“, sýnidæmi um heildað hraðalögmál annars stigs (m68791)',
  },
  {
    id: 'helmingun-butadien',
    kind: 'helmingun',
    setting:
      'Sama hvarf: annars stigs, k = 5,76 × 10⁻² L/(mól·mín), upphafsstyrkur bútadíens 0,200 M.',
    question: 'Hver er helmingunartími hvarfsins?',
    unit: 'mín',
    order: 2,
    A0: 0.2,
    k: 5.76e-2,
    bookAnswer: 86.8,
    source:
      'kafli 12, „Heilduð hraðalögmál“, sýnidæmi um helmingunartíma núllta og annars stigs (m68791)',
  },
  {
    id: 'hradafasti-h2o2',
    kind: 'hradafasti',
    setting:
      'Vetnisperoxíð, H₂O₂, brotnar niður í vatni eftir fyrsta stigs hraðalögmáli. Við 40 °C er helmingunartíminn 2,16 × 10⁴ s.',
    question: 'Hver er hraðafastinn k?',
    unit: '× 10⁻⁵ s⁻¹',
    tHalf: 2.16e4,
    scale: 1e-5,
    bookAnswer: 3.21,
    source:
      'kafli 12, „Heilduð hraðalögmál“, sýnidæmi um hraðafasta út frá helmingunartíma (m68791)',
  },
  {
    id: 'eftir-syklopropan',
    kind: 'eftir',
    setting:
      'Sýklóprópan umraðast í própen við 499 °C eftir fyrsta stigs hraðalögmáli með k = 5,95 × 10⁻⁴ s⁻¹.',
    question: 'Hve mörg prósent sýklóprópans eru eftir eftir 0,75 klst.?',
    unit: '%',
    k: 5.95e-4,
    t: 0.75 * 3600,
    bookAnswer: 20,
    source: 'kafli 12, „Heilduð hraðalögmál“, æfing í lok kaflans (m68791)',
  },
  {
    id: 'graf-annars',
    kind: 'graf',
    setting: 'Hvarf er annars stigs með tilliti til eina hvarfefnisins, A.',
    question: 'Hvaða graf af mæligögnunum er bein lína?',
    order: 2,
    source: 'kafli 12, „Heilduð hraðalögmál“, grafísk ákvörðun á stigi efnahvarfs (m68791)',
  },
  {
    id: 'tvofalt-fyrsta',
    kind: 'tvofalt',
    setting: 'Hvarf er fyrsta stigs. Upphafsstyrkurinn er tvöfaldaður.',
    question: 'Hvað verður um helmingunartímann?',
    order: 1,
    source: 'kafli 12, „Heilduð hraðalögmál“, helmingunartími fyrsta stigs hvarfs (m68791)',
  },
  {
    id: 'virkjun-n2o5',
    kind: 'virkjun',
    setting:
      'Hraðafasti niðurbrots N₂O₅ í gasfasa er 1,66 L/(mól·s) við 650 K og 7,39 L/(mól·s) við 700 K.',
    question: 'Hver er virkjunarorka hvarfsins?',
    unit: 'kJ/mól',
    k1: 1.66,
    T1: 650,
    k2: 7.39,
    T2: 700,
    bookAnswer: 110,
    source: 'kafli 12, „Árekstrakenningin“, „Kannaðu þekkingu þína“ (m68793)',
  },
  {
    id: 'virkjun-hi',
    kind: 'virkjun',
    setting:
      'Hraðafasti niðurbrots HI í gasfasa er 3,52 × 10⁻⁷ L/(mól·s) við 555 K og 3,95 × 10⁻² L/(mól·s) við 781 K.',
    question: 'Hver er virkjunarorka hvarfsins?',
    unit: 'kJ/mól',
    k1: 3.52e-7,
    T1: 555,
    k2: 3.95e-2,
    T2: 781,
    bookAnswer: 180,
    source:
      'kafli 12, „Árekstrakenningin“, sýnidæmi um ákvörðun á Ea, tveggja punkta aðferðin (m68793)',
  },
  {
    id: 'virkjun-asetaldehyd',
    kind: 'virkjun',
    setting:
      'Hraðafasti niðurbrots asetaldehýðs, CH₃CHO, í gasfasa er 1,1 × 10⁻² L/(mól·s) við 703 K og 4,95 L/(mól·s) við 865 K.',
    question: 'Hver er virkjunarorka hvarfsins?',
    unit: 'kJ/mól',
    k1: 1.1e-2,
    T1: 703,
    k2: 4.95,
    T2: 865,
    source: 'kafli 12, „Árekstrakenningin“, æfing í lok kaflans (m68793)',
  },
];
