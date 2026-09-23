// Level 2: Henderson-Hasselbalch Calculations
// Students apply the formula to calculate ratios and masses

import type { TieredHints } from '@shared/types';

import { solveBuffer } from '../engine/buffer';
import type { BufferProblem } from '../types';
import { BUFFER_PROBLEMS } from './problems';

/**
 * A Level 2 puzzle as the level renders it.
 *
 * **Every number in `hints` and `explanationIs` is derived, not written.**
 * Until 2026-09-22 the four hint tiers and the explanation were typed out by
 * hand, and they were never re-derived when `engine/buffer.ts` took over the
 * grading on 2026-09-19 or when Appendix D corrected ammonium's pKa to 9,26.
 * So the level graded against one set of numbers and handed out another: the
 * worked solution for the formate puzzle gave the ratio as 1,78 and the acid
 * mass as 2,58 g (the grader wants 1,82 and 1,63 g, and the acid and base moles
 * were swapped), the ammonium puzzle still taught pKa 9,25, and on three of the
 * five puzzles a student who copied the revealed solution was marked wrong.
 * Only the prose around the numbers is authored now; the numbers come from the
 * same `solveBuffer` the grader calls, so the two cannot disagree again.
 */
export interface Level2Puzzle {
  id: number;
  problemId: number; // Reference to BUFFER_PROBLEMS
  taskIs: string; // Icelandic task description
  ratioTolerance: number; // Relative tolerance for ratio (e.g., 0.1 = ±10%)
  massTolerance: number; // Relative tolerance for mass (e.g., 0.05 = ±5%)
  hints: TieredHints;
  explanationIs: string;
}

/** What a puzzle's author writes: the task and the prose, never a computed number. */
interface Level2PuzzleSource {
  id: number;
  problemId: number;
  taskIs: string;
  ratioTolerance: number;
  massTolerance: number;
  /** The first hint tier, naming the system. May quote the problem's pKa. */
  topicIs: (problem: BufferProblem) => string;
  /** A sentence appended to the derived explanation — context, not arithmetic. */
  noteIs: string;
}

/** Icelandic decimal comma, which is what the answer fields accept. */
const fmt = (n: number, dp: number) => n.toFixed(dp).replace('.', ',');

/** A signed exponent the way the hints print it: 0,20 or −0,20. */
const signed = (n: number) => (n < 0 ? `−${fmt(-n, 2)}` : fmt(n, 2));

function findProblem(id: number): BufferProblem {
  const problem = BUFFER_PROBLEMS.find((p) => p.id === id);
  if (!problem) throw new Error(`Level 2 puzzle points at missing problem ${id}`);
  return problem;
}

function build(source: Level2PuzzleSource): Level2Puzzle {
  const problem = findProblem(source.problemId);

  // The sentences below describe mixing an acid and its conjugate base. A
  // pH-adjustment problem (#25) weighs out all the acid and adds NaOH, and a
  // range question has no target pH, so neither can be described this way.
  // No puzzle points at one today; refuse rather than print a false recipe.
  if (problem.phAdjustment || problem.rangeQuestion) {
    throw new Error(
      `Level 2 puzzle ${source.id} points at problem ${problem.id}, which is not a ` +
        'mix-two-salts recipe; its hints would need their own wording.'
    );
  }

  const r = solveBuffer(problem);
  const diff = problem.targetPH - problem.pKa;
  const pH = fmt(problem.targetPH, 2);
  const pKa = fmt(problem.pKa, 2);
  const ratio = fmt(r.ratio, 2);
  const totalMoles = problem.totalConcentration * problem.volume;

  const direction =
    diff > 0
      ? 'HÆRRA en pKa (' + pKa + '), svo þú þarft meira af basa en sýru'
      : diff < 0
        ? 'LÆGRA en pKa (' + pKa + '), svo þú þarft meira af sýru en basa'
        : 'JAFNT pKa (' + pKa + '), svo þú þarft jafnmikið af sýru og basa';

  const hints: TieredHints = {
    topic: source.topicIs(problem),
    strategy: `Markmiðs-pH (${pH}) er ${direction}. Reiknaðu hlutfallið fyrst.`,
    method:
      `Skref 1: pH − pKa = ${pH} − ${pKa} = ${signed(diff)}. ` +
      `Skref 2: Hlutfall [Basi]/[Sýra] = 10^(${signed(diff)}) ≈ ${ratio}.`,
    solution:
      `Hlutfall = ${ratio}. Heildarmagn = ${fmt(problem.totalConcentration, 3)} M × ` +
      `${fmt(problem.volume, 1)} L = ${fmt(totalMoles, 4)} mol. ` +
      `Sýra: ${fmt(r.acidMoles, 4)} mol × ${fmt(problem.acidMolarMass, 2)} g/mol = ` +
      `${fmt(r.acidMass, 2)} g. ` +
      `Basi: ${fmt(r.baseMoles, 4)} mol × ${fmt(problem.baseMolarMass, 2)} g/mol = ` +
      `${fmt(r.baseMass, 2)} g.`,
  };

  const where = diff > 0 ? 'yfir' : diff < 0 ? 'undir' : 'jafnt';
  const offset =
    diff === 0
      ? `pH ${pH} er jafnt pKa`
      : `pH ${pH} er ${fmt(Math.abs(diff), 2)} einingum ${where} pKa (${pKa})`;
  const explanationIs =
    `${offset}, svo hlutfallið [Basi]/[Sýra] = 10^(${signed(diff)}) ≈ ${ratio}. ` + source.noteIs;

  return {
    id: source.id,
    problemId: source.problemId,
    taskIs: source.taskIs,
    ratioTolerance: source.ratioTolerance,
    massTolerance: source.massTolerance,
    hints,
    explanationIs,
  };
}

const SOURCES: Level2PuzzleSource[] = [
  {
    id: 1,
    problemId: 11, // Phosphate pH 7.40 - Blood buffer
    taskIs: 'Búðu til fosfatstuðpúða við blóð-pH (7,40) úr NaH₂PO₄ og Na₂HPO₄.',
    ratioTolerance: 0.1,
    massTolerance: 0.05,
    topicIs: () => 'Þetta snýst um Henderson-Hasselbalch jöfnuna: pH = pKa + log([Basi]/[Sýra]).',
    noteIs: 'Þetta er pH blóðs, og líkaminn viðheldur þessu hlutfalli til að halda því stöðugu.',
  },
  {
    id: 2,
    problemId: 14, // Acetate pH 5.00
    taskIs: 'Búðu til asetatstuðpúða við pH 5,00 úr ediksýru og natríumasetati.',
    ratioTolerance: 0.1,
    massTolerance: 0.05,
    topicIs: (p) =>
      `Asetatstuðpúði notar Henderson-Hasselbalch jöfnuna með pKa = ${fmt(p.pKa, 2)}.`,
    noteIs: 'Þetta þýðir næstum tvöfalt meira af basa en sýru.',
  },
  {
    id: 3,
    problemId: 17, // Ammonia pH 9.50
    taskIs: 'Búðu til ammóníustuðpúða við pH 9,50 úr ammóníumklóríði og ammóníaki.',
    ratioTolerance: 0.1,
    massTolerance: 0.05,
    topicIs: (p) => `Ammóníustuðpúði virkar við hátt pH með pKa = ${fmt(p.pKa, 2)}.`,
    noteIs:
      'Athugaðu að ammóníak (NH₃) hefur mjög lágan mólmassa (17 g/mol) svo massinn er lítill.',
  },
  {
    id: 5,
    problemId: 19, // Formic acid pH 4.00
    taskIs: 'Búðu til maurasýrustuðpúða við pH 4,00.',
    ratioTolerance: 0.1,
    massTolerance: 0.05,
    topicIs: (p) => `Maurasýra (HCOOH) hefur pKa = ${fmt(p.pKa, 2)}, lægra en ediksýra.`,
    noteIs: 'Maurasýra er einfaldasta karboxýlsýran (HCOOH).',
  },
  {
    id: 6,
    problemId: 21, // Phosphate pH 7.00
    taskIs: 'Búðu til fosfatstuðpúða við pH 7,00 (hlutlaust).',
    ratioTolerance: 0.1,
    massTolerance: 0.05,
    topicIs: () => 'Fosfatstuðpúði við hlutlaust pH þarf meira af sýru.',
    noteIs: 'Þetta þýðir um 60 % meira af sýru en basa.',
  },
];

export const LEVEL2_PUZZLES: Level2Puzzle[] = SOURCES.map(build);
