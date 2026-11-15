import { APPENDIX_D1_ACIDS } from '@shared/data/appendix-d';

import { PROBLEMS } from './problems';
import { calculateDeltaG } from '../utils/thermo-calculations';

/**
 * The problems of "ΔG° og K", as data. Every number a student is given comes from a source
 * named beside it, and every answer is computed (`utils/gibbs-k.ts`), never stored.
 *
 * - **ΔG° from ΔfG°**: the book's appendix G (m68865) lists ΔfG° beside ΔfH° and S°; the
 *   values are written out here and summed, so the ΔG° on screen is the book's.
 * - **ΔG° from ΔH° and ΔS°**: this game's own problem data, through this game's own
 *   `calculateDeltaG`, so the screen and the Æfingarhamur cannot disagree about a reaction.
 * - **K given**: Appendix D (Ka), or the Kc the book quotes in a worked example.
 */

export type GibbsKProblem = {
  id: string;
  name: string;
  /** The equation, with ⇌: K belongs to an equilibrium. */
  reaction: string;
  /** Kelvin. */
  temp: number;
  /** What K is called for this reaction, as printed: `Kp`, `Ksp`, `Ka`, `K`. */
  symbol: string;
  /** One line on which K this is, e.g. that a gas reaction's K is Kp. */
  note: string;
} & (
  | { kind: 'K-fra-G'; deltaG: number; source: string }
  | { kind: 'K-fra-HS'; deltaH: number; deltaS: number; source: string }
  | { kind: 'G-fra-K'; k: number; source: string }
);

const round1 = (x: number) => Math.round(x * 10) / 10;

/** ΔfG° in kJ/mól, from the book's appendix G (m68865), as printed there. */
const DELTA_F_G = {
  'NO₂(g)': 51.3,
  'N₂O₄(g)': 99.8,
  'Ag⁺(aq)': 77.11,
  'Cl⁻(aq)': -131.2,
  'AgCl(s)': -109.8,
} as const;

const haber = [...PROBLEMS.intermediate, ...PROBLEMS.advanced].find((p) => p.id === 11);
if (!haber) throw new Error('gibbs-k: problem 11 (Haber) is missing from problems.ts');

export const GIBBS_K_PROBLEMS: GibbsKProblem[] = [
  {
    id: 'n2o4',
    kind: 'K-fra-G',
    name: 'Klofnun díniturtetroxíðs',
    reaction: 'N₂O₄(g) ⇌ 2NO₂(g)',
    temp: 298,
    symbol: 'Kp',
    note: 'Allt er lofttegundir, svo K er Kp, reiknað út frá þrýstingi.',
    // The book's own check-your-learning in m68819, whose answer is K = 0,32.
    deltaG: round1(2 * DELTA_F_G['NO₂(g)'] - DELTA_F_G['N₂O₄(g)']),
    source: 'reiknað úr gögnum í viðauka G í kennslubókinni',
  },
  {
    id: 'agcl',
    kind: 'K-fra-G',
    name: 'Leysni silfurklóríðs',
    reaction: 'AgCl(s) ⇌ Ag⁺(aq) + Cl⁻(aq)',
    temp: 298,
    symbol: 'Ksp',
    note: 'K fyrir leysni er leysnimargfeldið, Ksp.',
    // The book's worked example in m68819; Appendix D gives Ksp = 1,8 × 10⁻¹⁰.
    deltaG: round1(DELTA_F_G['Ag⁺(aq)'] + DELTA_F_G['Cl⁻(aq)'] - DELTA_F_G['AgCl(s)']),
    source: 'reiknað úr gögnum í viðauka G í kennslubókinni',
  },
  {
    id: 'haber-298',
    kind: 'K-fra-HS',
    name: 'Myndun ammoníaks við 298 K',
    reaction: 'N₂(g) + 3H₂(g) ⇌ 2NH₃(g)',
    temp: 298,
    symbol: 'Kp',
    note: 'Reiknaðu fyrst ΔG° = ΔH° − TΔS°, svo K.',
    deltaH: haber.deltaH,
    deltaS: haber.deltaS,
    source: 'ΔH° og ΔS° eins og í Æfingarhamnum',
  },
  {
    id: 'haber-700',
    kind: 'K-fra-HS',
    name: 'Myndun ammoníaks við 700 K',
    reaction: 'N₂(g) + 3H₂(g) ⇌ 2NH₃(g)',
    temp: 700,
    symbol: 'Kp',
    note: 'Sama hvarf við hærra hitastig. ΔH° og ΔS° eru talin óháð hitastigi.',
    deltaH: haber.deltaH,
    deltaS: haber.deltaS,
    source: 'ΔH° og ΔS° eins og í Æfingarhamnum',
  },
  {
    id: 'ediksyra',
    kind: 'G-fra-K',
    name: 'Klofnun ediksýru',
    reaction: 'CH₃COOH(aq) ⇌ H⁺(aq) + CH₃COO⁻(aq)',
    temp: 298,
    symbol: 'Ka',
    note: 'Sýrufastinn er jafnvægisfasti eins og hver annar.',
    k: APPENDIX_D1_ACIDS.acetic.ka[0],
    source: 'Ka úr viðauka D',
  },
  {
    id: 'vetnisjodid',
    kind: 'G-fra-K',
    name: 'Myndun vetnisjoðíðs við 400 °C',
    reaction: 'H₂(g) + I₂(g) ⇌ 2HI(g)',
    temp: 673,
    symbol: 'K',
    note: 'Jafnmörg mól lofttegunda eru hvoru megin, svo Kc og Kp eru jöfn.',
    // The Kc the book quotes at 400 °C in m68798, as `3-ar/jafnvaegisfasti` does.
    k: 50,
    source: 'Kc úr sýnidæmi í 13. kafla kennslubókarinnar',
  },
];

/** ΔG° (kJ/mól) a problem gives or asks the student to work out first. */
export function problemDeltaG(p: GibbsKProblem): number | null {
  if (p.kind === 'K-fra-G') return p.deltaG;
  if (p.kind === 'K-fra-HS') return calculateDeltaG(p.deltaH, p.deltaS, p.temp);
  return null;
}
