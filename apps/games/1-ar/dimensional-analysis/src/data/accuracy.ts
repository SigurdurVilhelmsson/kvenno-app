import { formatDecimal } from '@shared/utils';

/**
 * Hittni og nákvæmni (accuracy and precision), year-1 plan item 14, from book
 * ch01/m68690, "Óvissa í mælingum, hittni og nákvæmni". Siggi's ruling
 * (2026-11-15): `hittni` is accuracy, how close a measurement is to the true
 * value, and `nákvæmni` is precision, how close repeated measurements are to
 * one another. The module's running text uses other words in places
 * (`réttvísi`, `réttleiki`), which is why the ruling was needed.
 *
 * Every item is the book's: the archery figure, the cough-syrup dispensers and
 * two of the end-of-section measurement sets. Verdicts on numeric sets are
 * derived from the numbers against the stated limits, never stored.
 */

export type AccuracyVerdict = 'baedi' | 'nakvaemni' | 'hittni' | 'hvorugt';

export const VERDICT_LABEL: Record<AccuracyVerdict, string> = {
  baedi: 'Bæði hittni og nákvæmni',
  nakvaemni: 'Nákvæmni en ekki hittni',
  hittni: 'Hittni en ekki nákvæmni',
  hvorugt: 'Hvorki hittni né nákvæmni',
};

export const VERDICT_ORDER: AccuracyVerdict[] = ['baedi', 'nakvaemni', 'hittni', 'hvorugt'];

/** A hit on a target, in units of the target's radius (centre 0,0). */
export interface Hit {
  x: number;
  y: number;
}

export interface TargetItem {
  kind: 'target';
  id: string;
  name: string;
  hits: Hit[];
  verdict: AccuracyVerdict;
  why: string;
}

export interface SetItem {
  kind: 'set';
  id: string;
  name: string;
  unit: string;
  target: number;
  values: number[];
  /** How far the mean may sit from the target and still count as accurate. */
  accurateWithin: number;
  /** How wide the spread (largest minus smallest) may be and still count as precise. */
  preciseWithin: number;
}

export type AccuracyItem = TargetItem | SetItem;

export const ACCURACY_ITEMS: AccuracyItem[] = [
  {
    kind: 'target',
    id: 'w',
    name: 'Bogmaður W',
    hits: [
      { x: 0.06, y: -0.05 },
      { x: -0.07, y: 0.04 },
      { x: 0.03, y: 0.08 },
      { x: -0.04, y: -0.06 },
    ],
    verdict: 'baedi',
    why: 'Örvarnar eru þétt saman (nákvæmni) og í miðjunni (hittni).',
  },
  {
    kind: 'target',
    id: 'x',
    name: 'Bogmaður X',
    hits: [
      { x: 0.55, y: 0.5 },
      { x: 0.62, y: 0.56 },
      { x: 0.58, y: 0.45 },
      { x: 0.5, y: 0.55 },
    ],
    verdict: 'nakvaemni',
    why: 'Örvarnar eru þétt saman (nákvæmni) en langt frá miðjunni, svo hittnin er léleg.',
  },
  {
    kind: 'target',
    id: 'y',
    name: 'Bogmaður Y',
    hits: [
      { x: -0.75, y: -0.7 },
      { x: 0.72, y: -0.74 },
      { x: -0.7, y: 0.76 },
      { x: 0.78, y: 0.7 },
    ],
    verdict: 'hvorugt',
    why: 'Örvarnar dreifast um alla skífuna og engin er nálægt miðjunni.',
  },
  {
    kind: 'set',
    id: 's1',
    name: 'Hóstasaft, skammtari nr. 1',
    unit: 'ml',
    target: 296,
    values: [283.3, 284.1, 283.9, 284.0, 284.1],
    accurateWithin: 3,
    preciseWithin: 1,
  },
  {
    kind: 'set',
    id: 's2',
    name: 'Hóstasaft, skammtari nr. 2',
    unit: 'ml',
    target: 296,
    values: [298.3, 294.2, 296.0, 297.8, 293.9],
    accurateWithin: 3,
    preciseWithin: 1,
  },
  {
    kind: 'set',
    id: 's3',
    name: 'Hóstasaft, skammtari nr. 3',
    unit: 'ml',
    target: 296,
    values: [296.1, 295.9, 296.1, 296.0, 296.1],
    accurateWithin: 3,
    preciseWithin: 1,
  },
  {
    kind: 'set',
    id: 'p',
    name: '25 ml pípettur',
    unit: 'ml',
    target: 25,
    values: [27.02, 26.99, 26.97, 27.01],
    accurateWithin: 0.1,
    preciseWithin: 0.1,
  },
  {
    kind: 'set',
    id: 'g',
    name: 'Hreinleiki gulls',
    unit: '%',
    target: 99.9999,
    values: [99.9999, 99.9998, 99.9998, 99.9999],
    accurateWithin: 0.001,
    preciseWithin: 0.001,
  },
];

export const mean = (values: number[]): number => values.reduce((a, b) => a + b, 0) / values.length;

export const spread = (values: number[]): number => Math.max(...values) - Math.min(...values);

export function verdictOf(item: AccuracyItem): AccuracyVerdict {
  if (item.kind === 'target') return item.verdict;
  const accurate = Math.abs(mean(item.values) - item.target) <= item.accurateWithin;
  const precise = spread(item.values) <= item.preciseWithin;
  return accurate ? (precise ? 'baedi' : 'hittni') : precise ? 'nakvaemni' : 'hvorugt';
}

const decimalsOf = (n: number): number => (String(n).split('.')[1] ?? '').length;

export const fmtValue = (n: number, decimals: number): string =>
  formatDecimal(Number(n.toFixed(decimals)), decimals);

/** Why a set gets its verdict: the mean against the target, the spread against the limit. */
export function explainSet(item: SetItem): string {
  const d = Math.max(...item.values.map(decimalsOf), decimalsOf(item.target));
  const m = mean(item.values);
  const off = Math.abs(m - item.target);
  const s = spread(item.values);
  const accurate = off <= item.accurateWithin;
  const precise = s <= item.preciseWithin;
  return (
    `Meðaltalið er ${fmtValue(m, d)} ${item.unit}, ${fmtValue(off, d)} ${item.unit} frá réttu gildi ` +
    `(${fmtValue(item.target, decimalsOf(item.target))} ${item.unit}): ` +
    (accurate ? 'góð hittni. ' : 'léleg hittni. ') +
    `Mælingarnar spanna ${fmtValue(s, d)} ${item.unit}: ` +
    (precise ? 'góð nákvæmni.' : 'léleg nákvæmni.')
  );
}

export function explain(item: AccuracyItem): string {
  return item.kind === 'target' ? item.why : explainSet(item);
}
