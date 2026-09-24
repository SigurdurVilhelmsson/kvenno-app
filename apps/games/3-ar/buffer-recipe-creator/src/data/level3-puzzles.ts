// Level 3: Design Constraints with Stock Solutions
// Students work with pre-made stock solutions and calculate volumes

import type { TieredHints } from '@shared/types';

import { solveStockRecipe } from '../engine/buffer';
import type { BufferProblem } from '../types';
import { BUFFER_PROBLEMS } from './problems';

/**
 * A Level 3 puzzle as the level renders it.
 *
 * **Every number in `hints` and `explanationIs` is derived, not written** — the
 * same arrangement `level2-puzzles.ts` has had since 2026-09-22. Until
 * 2026-09-23 this file stored `correctAcidVolume`, `correctBaseVolume` and
 * `correctWaterVolume` and typed every hint by hand. The ammonium puzzle had been
 * worked from pKa 9,25; when Appendix D moved it to 9,26 only the pKa in the
 * text changed, so its hints went on teaching `10^(0,25) = 1,78` for a
 * pH − pKa of 0,24, and the level graded volumes worked from the old ratio.
 * The prose below is authored; the numbers it quotes come from the same
 * `solveStockRecipe` the level grades with, so the two cannot disagree again.
 */
export interface Level3Puzzle {
  id: number;
  problemId: number; // Reference to BUFFER_PROBLEMS
  taskIs: string; // Icelandic task description
  taskEn?: string; // English task description
  taskPl?: string; // Polish task description
  stockAcidConc: number; // Stock solution concentration for acid (M)
  stockBaseConc: number; // Stock solution concentration for base (M)
  targetVolume: number; // Target final volume (mL)
  targetConcentration: number; // Target buffer concentration (M)
  volumeTolerance: number; // Relative tolerance for volumes (e.g., 0.05 = +/-5%)
  hints: TieredHints;
  explanationIs: string;
}

/** The numbers a puzzle's prose may quote, already written the way a student reads them. */
interface RecipeText {
  pH: string;
  pKa: string;
  /** pH − pKa, signed: 0,26 or −0,20. */
  diff: string;
  /** |pH − pKa|. */
  absDiff: string;
  ratio: string;
  /** Final volume in mL, and in L. */
  targetVolume: string;
  volumeL: string;
  conc: string;
  totalMoles: string;
  acidMoles: string;
  baseMoles: string;
  /** The stock concentration, for puzzles whose two stocks are equally strong. */
  stock: string;
  stockAcid: string;
  stockBase: string;
  acidVolume: string;
  baseVolume: string;
  waterVolume: string;
}

/** What a puzzle's author writes: the inputs and the prose, never a computed number. */
type Level3PuzzleSource = Omit<Level3Puzzle, 'hints' | 'explanationIs'> & {
  hintsIs: (n: RecipeText) => TieredHints;
  explanationIs: (n: RecipeText) => string;
};

/** Icelandic decimal comma, which is what the answer fields accept. */
const fmt = (n: number, dp: number) => n.toFixed(dp).replace('.', ',');

/** A plain value such as 0,025 or 250, without float noise. */
const num = (n: number) => String(Number(n.toFixed(6))).replace('.', ',');

/** Three significant figures, the precision the mole hints are written to. */
const sig3 = (n: number) => String(Number(n.toPrecision(3))).replace('.', ',');

/** A signed exponent the way the hints print it: 0,20 or −0,20. */
const signed = (n: number) => (n < 0 ? `−${fmt(-n, 2)}` : fmt(n, 2));

function findProblem(id: number): BufferProblem {
  const problem = BUFFER_PROBLEMS.find((p) => p.id === id);
  if (!problem) throw new Error(`Level 3 puzzle points at missing problem ${id}`);
  return problem;
}

function build(source: Level3PuzzleSource): Level3Puzzle {
  const problem = findProblem(source.problemId);

  // The prose describes drawing an acid stock and a base stock and topping up
  // with water. A pH-adjustment problem (#25) starts from the acid alone and a
  // range question has no target pH, so neither can be described this way.
  if (problem.phAdjustment || problem.rangeQuestion) {
    throw new Error(
      `Level 3 puzzle ${source.id} points at problem ${problem.id}, which is not a ` +
        'two-stock recipe; its hints would need their own wording.'
    );
  }

  const r = solveStockRecipe(problem, source);
  const diff = problem.targetPH - problem.pKa;
  const n: RecipeText = {
    pH: fmt(problem.targetPH, 2),
    pKa: fmt(problem.pKa, 2),
    diff: signed(diff),
    absDiff: fmt(Math.abs(diff), 2),
    ratio: fmt(r.ratio, 2),
    targetVolume: num(source.targetVolume),
    volumeL: num(source.targetVolume / 1000),
    conc: num(source.targetConcentration),
    totalMoles: num(r.totalMoles),
    acidMoles: sig3(r.acidMoles),
    baseMoles: sig3(r.baseMoles),
    // Quoting one strength for both stocks is only true when they match, so a
    // puzzle whose prose does that with unequal stocks refuses to load.
    get stock() {
      if (source.stockAcidConc !== source.stockBaseConc) {
        throw new Error(
          `Level 3 puzzle ${source.id} quotes a single stock strength, but its two stocks differ.`
        );
      }
      return fmt(source.stockAcidConc, 1);
    },
    stockAcid: fmt(source.stockAcidConc, 1),
    stockBase: fmt(source.stockBaseConc, 1),
    acidVolume: fmt(r.acidVolume, 2),
    baseVolume: fmt(r.baseVolume, 2),
    waterVolume: fmt(r.waterVolume, 1),
  };

  const { hintsIs, explanationIs, ...inputs } = source;
  return { ...inputs, hints: hintsIs(n), explanationIs: explanationIs(n) };
}

const SOURCES: Level3PuzzleSource[] = [
  {
    id: 1,
    problemId: 11, // Phosphate pH 7.40 - Blood buffer
    taskIs:
      'Búðu til 100 mL af fosfatstuðpúða við pH 7,40 (blóð-pH) með því að nota birgðalausnir.',
    taskEn: 'Prepare 100 mL of phosphate buffer at pH 7.40 (blood pH) using stock solutions.',
    taskPl: 'Przygotuj 100 mL buforu fosforanowego o pH 7,40 (pH krwi) z roztworów podstawowych.',
    stockAcidConc: 0.5, // 0.5 M NaH2PO4
    stockBaseConc: 0.5, // 0.5 M Na2HPO4
    targetVolume: 100, // 100 mL final
    targetConcentration: 0.1, // 0.1 M total
    volumeTolerance: 0.05,
    hintsIs: (n) => ({
      topic: 'Þetta snýst um þynningu birgðalausna og Henderson-Hasselbalch jöfnuna.',
      strategy: `Fyrst: Reiknaðu hlutfall [Basi]/[Sýra] fyrir pH ${n.pH} með pKa = ${n.pKa}. Síðan: Reiknaðu mól og þá rúmmál.`,
      method: `Hlutfall = 10^(${n.pH}-${n.pKa}) = ${n.ratio}. Heildarmól = ${n.conc} M × ${n.volumeL} L = ${n.totalMoles} mól. Skiptu í sýru og basa.`,
      solution: `Sýra: ${n.acidMoles} mól, Basi: ${n.baseMoles} mól. Úr ${n.stock} M birgð: Sýra = ${n.acidVolume} mL, Basi = ${n.baseVolume} mL.`,
    }),
    explanationIs: (n) =>
      `Til að búa til ${n.targetVolume} mL af ${n.conc} M fosfatstuðpúða við pH ${n.pH}, þarftu ${n.acidVolume} mL af ${n.stockAcid} M NaH₂PO₄ og ${n.baseVolume} mL af ${n.stockBase} M Na₂HPO₄, fyllt upp í ${n.targetVolume} mL með vatni.`,
  },
  {
    id: 2,
    problemId: 14, // Acetate pH 5.00
    taskIs: 'Búðu til 250 mL af asetatstuðpúða við pH 5,00 með því að nota 1,0 M birgðalausnir.',
    taskEn: 'Prepare 250 mL of acetate buffer at pH 5.00 using 1.0 M stock solutions.',
    taskPl: 'Przygotuj 250 mL buforu octanowego o pH 5,00 z 1,0 M roztworów podstawowych.',
    stockAcidConc: 1.0, // 1.0 M acetic acid
    stockBaseConc: 1.0, // 1.0 M sodium acetate
    targetVolume: 250, // 250 mL final
    targetConcentration: 0.1,
    volumeTolerance: 0.05,
    hintsIs: (n) => ({
      topic: `Asetatstuðpúði með pKa = ${n.pKa} og markmiðs-pH = ${n.pH}.`,
      strategy: `Hlutfall = 10^(${n.pH}-${n.pKa}) = 10^${n.diff} ≈ ${n.ratio}. Meira af basa en sýru.`,
      method: `Heildarmól = ${n.conc} × ${n.volumeL} = ${n.totalMoles} mól. Sýra: ${n.acidMoles} mól, Basi: ${n.baseMoles} mól.`,
      solution: `Úr ${n.stock} M birgð: Sýra = ${n.acidVolume} mL, Basi = ${n.baseVolume} mL, Vatn = ${n.waterVolume} mL.`,
    }),
    explanationIs: (n) =>
      `Fyrir ${n.targetVolume} mL af ${n.conc} M asetatstuðpúða við pH ${n.pH} þarftu ${n.acidVolume} mL af ${n.stockAcid} M ediksýru og ${n.baseVolume} mL af ${n.stockBase} M natríumasetati.`,
  },
  {
    id: 4,
    problemId: 21, // Phosphate pH 7.00
    taskIs: 'Búðu til 500 mL af fosfatstuðpúða við hlutlaust pH (7,00).',
    taskEn: 'Prepare 500 mL of phosphate buffer at neutral pH (7.00).',
    taskPl: 'Przygotuj 500 mL buforu fosforanowego o obojętnym pH (7,00).',
    stockAcidConc: 1.0,
    stockBaseConc: 1.0,
    targetVolume: 500,
    targetConcentration: 0.05,
    volumeTolerance: 0.05,
    hintsIs: (n) => ({
      topic: `Fosfatstuðpúði við pH ${n.pH}, sem er UNDIR pKa (${n.pKa}).`,
      strategy: `Hlutfall = 10^(${n.pH}-${n.pKa}) = 10^(${n.diff}) = ${n.ratio}. Meira af sýru.`,
      method: `Heildarmól = ${n.conc} × ${n.volumeL} = ${n.totalMoles} mól. Sýra: ${n.acidMoles} mól, Basi: ${n.baseMoles} mól.`,
      solution: `Úr ${n.stock} M birgð: Sýra = ${n.acidVolume} mL, Basi = ${n.baseVolume} mL, Vatn = ${n.waterVolume} mL.`,
    }),
    explanationIs: (n) =>
      `Við pH ${n.pH} (undir pKa) þarf meira af sýru. Hlutfall ${n.ratio} þýðir um 60 % meira af sýru en basa.`,
  },
  {
    id: 5,
    problemId: 17, // Ammonia pH 9.50
    taskIs: 'Búðu til 200 mL af ammóníustuðpúða við pH 9,50.',
    taskEn: 'Prepare 200 mL of ammonium buffer at pH 9.50.',
    taskPl: 'Przygotuj 200 mL buforu amonowego o pH 9,50.',
    stockAcidConc: 2.0, // 2.0 M NH4Cl
    stockBaseConc: 2.0, // 2.0 M NH3
    targetVolume: 200,
    targetConcentration: 0.2,
    volumeTolerance: 0.05,
    hintsIs: (n) => ({
      topic: `Ammóníustuðpúði með pKa = ${n.pKa} og markmiðs-pH = ${n.pH}.`,
      strategy: `pH > pKa þannig að hlutfall > 1. Hlutfall = 10^(${n.diff}) = ${n.ratio}.`,
      method: `Heildarmól = ${n.conc} × ${n.volumeL} = ${n.totalMoles} mól. Sýra: ${n.acidMoles} mól, Basi: ${n.baseMoles} mól.`,
      solution: `Úr ${n.stock} M birgð: Sýra = ${n.acidVolume} mL, Basi = ${n.baseVolume} mL, Vatn = ${n.waterVolume} mL.`,
    }),
    explanationIs: (n) =>
      `Ammóníustuðpúði við pH ${n.pH} þarf hlutfall ${n.ratio}, sem þýðir næstum tvöfalt meira af NH₃ en NH₄Cl.`,
  },
  {
    id: 6,
    problemId: 15, // Phosphate pH 6.80
    taskIs: 'Búðu til 1000 mL (1 L) af fosfatstuðpúða við pH 6,80 fyrir frumuræktun.',
    taskEn: 'Prepare 1000 mL (1 L) of phosphate buffer at pH 6.80 for cell culture.',
    taskPl: 'Przygotuj 1000 mL (1 L) buforu fosforanowego o pH 6,80 do hodowli komórkowej.',
    stockAcidConc: 0.5,
    stockBaseConc: 0.5,
    targetVolume: 1000,
    targetConcentration: 0.1,
    volumeTolerance: 0.05,
    hintsIs: (n) => ({
      topic: `Fosfatstuðpúði við pH ${n.pH}, sem er töluvert undir pKa (${n.pKa}).`,
      strategy: `Hlutfall = 10^(${n.pH}-${n.pKa}) = 10^(${n.diff}) = ${n.ratio}. Miklu meira af sýru.`,
      method: `Heildarmól = ${n.conc} × ${n.volumeL} = ${n.totalMoles} mól. Sýra: ${n.acidMoles} mól, Basi: ${n.baseMoles} mól.`,
      solution: `Úr ${n.stock} M birgð: Sýra = ${n.acidVolume} mL, Basi = ${n.baseVolume} mL, Vatn = ${n.waterVolume} mL.`,
    }),
    explanationIs: (n) =>
      `Við pH ${n.pH} (${n.absDiff} undir pKa) er hlutfall aðeins ${n.ratio}, sem þýðir 2,5× meira af sýru en basa.`,
  },
];

export const LEVEL3_PUZZLES: Level3Puzzle[] = SOURCES.map(build);
