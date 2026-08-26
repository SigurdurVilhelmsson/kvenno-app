import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, it, expect } from 'vitest';

import { problems, type Problem } from '../data/problems';
import { allRatios, ratioById } from '../data/ratios';
import { solveChain, type ChainSlot } from '../engine/chain';
import {
  applyRatio,
  orient,
  signatureMatches,
  type Orientation,
  type Quantity,
} from '../engine/units';

const ORIENTATIONS: Orientation[] = ['forward', 'flipped'];

/**
 * Compare on *relative* error.
 *
 * `toBeCloseTo` compares absolute difference, which says nothing useful about a
 * count of atoms near 10^23 — the same trap as grading a student's answer against
 * an absolute 0,01 tolerance (CURRICULUM_REVIEW.md B13).
 */
const expectRelativelyClose = (actual: number, expected: number, tolerance = 1e-4): void => {
  expect(
    Math.abs(actual - expected) / Math.abs(expected),
    `${actual} is not within ${tolerance} relative of ${expected}`
  ).toBeLessThan(tolerance);
};

/**
 * Exhaustively search a problem's own pool for chains that reach the target.
 *
 * Only steps that actually cancel are explored, which both prunes the search and
 * mirrors what the game lets a student get away with.
 */
function findSolutions(problem: Problem, maxDepth: number): ChainSlot[][] {
  const pool = problem.poolIds.map(ratioById);
  const found: ChainSlot[][] = [];

  const walk = (current: Quantity, slots: ChainSlot[]): void => {
    if (signatureMatches(current, problem.target)) {
      found.push([...slots]);
      return;
    }
    if (slots.length >= maxDepth) return;

    for (const equivalence of pool) {
      for (const orientation of ORIENTATIONS) {
        const step = applyRatio(current, orient(equivalence, orientation));
        if (step.cancelCount === 0) continue;
        walk(step.after, [...slots, { equivalenceId: equivalence.id, orientation }]);
      }
    }
  };

  walk(problem.start, []);
  return found;
}

describe('ratio pool integrity', () => {
  it('has unique ids', () => {
    const ids = allRatios.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('tags both sides of an equivalence or neither', () => {
    // Species inference in engine/units.ts assumes this; a half-tagged
    // equivalence would silently stop cancelling.
    for (const ratio of allRatios) {
      const tagged = [ratio.left.species, ratio.right.species].filter(
        (s) => s !== undefined
      ).length;
      expect(tagged, `${ratio.id} is half-tagged`).not.toBe(1);
    }
  });

  it('never states a zero or negative quantity', () => {
    for (const ratio of allRatios) {
      expect(ratio.left.value, ratio.id).toBeGreaterThan(0);
      expect(ratio.right.value, ratio.id).toBeGreaterThan(0);
    }
  });

  it('agrees with molmassi on NaCl', () => {
    // 1-ar/molmassi says 58.44; lausnir and the older dimensional-analysis say
    // 58.5 (CURRICULUM_REVIEW.md:192). Follow the correct one.
    expect(ratioById('mm-NaCl').left.value).toBe(58.44);
  });
});

describe('mass is conserved across every equation used', () => {
  const molarMass = (species: string): number => {
    const found = allRatios.find(
      (r) => r.kind === 'molmassi' && r.left.species === species && r.left.unit === 'g'
    );
    if (!found) throw new Error(`Enginn mólmassi skráður fyrir ${species}`);
    return found.left.value;
  };

  // [equation, reactants as [coefficient, species], products as [coefficient, species]]
  const balances: [string, [number, string][], [number, string][]][] = [
    [
      '2 Mg + O₂ → 2 MgO',
      [
        [2, 'Mg'],
        [1, 'O₂'],
      ],
      [[2, 'MgO']],
    ],
    [
      '2 NaHCO₃ → Na₂CO₃ + H₂O + CO₂',
      [[2, 'NaHCO₃']],
      [
        [1, 'Na₂CO₃'],
        [1, 'H₂O'],
        [1, 'CO₂'],
      ],
    ],
    [
      'C₂H₅OH + 3 O₂ → 2 CO₂ + 3 H₂O',
      [
        [1, 'C₂H₅OH'],
        [3, 'O₂'],
      ],
      [
        [2, 'CO₂'],
        [3, 'H₂O'],
      ],
    ],
    [
      '4 Fe + 3 O₂ → 2 Fe₂O₃',
      [
        [4, 'Fe'],
        [3, 'O₂'],
      ],
      [[2, 'Fe₂O₃']],
    ],
  ];

  const total = (side: [number, string][]): number =>
    side.reduce((sum, [n, species]) => sum + n * molarMass(species), 0);

  it.each(balances)('%s balances by mass', (_equation, reactants, products) => {
    // If a molar mass in the pool were wrong, the two sides would not agree. The
    // tolerance covers only the four-significant-figure rounding of each card.
    expect(total(products)).toBeCloseTo(total(reactants), 1);
  });
});

describe('every problem is solvable from its own pool', () => {
  it.each(problems.map((p) => [p.id, p] as const))('%s', (_id, problem) => {
    const solutions = findSolutions(problem, problem.expectedSteps);

    expect(solutions.length, 'no chain in the pool reaches the target').toBeGreaterThan(0);

    const shortest = Math.min(...solutions.map((s) => s.length));
    expect(shortest, 'expectedSteps disagrees with the shortest real chain').toBe(
      problem.expectedSteps
    );

    for (const chain of solutions) {
      const result = solveChain(problem.start, chain, allRatios, problem.target);
      expect(result.status).toBe('solved');
      // Every valid route must land on the same number — that is the claim the
      // whole "no answer key" design rests on.
      expectRelativelyClose(result.final.value, problem.expectedValue);
    }
  });
});

describe('every problem offers real distractors', () => {
  it.each(problems.map((p) => [p.id, p] as const))('%s', (_id, problem) => {
    const solutions = findSolutions(problem, problem.expectedSteps);
    const used = new Set(solutions.flat().map((s) => s.equivalenceId));
    const unused = problem.poolIds.filter((id) => !used.has(id));

    expect(unused.length, 'pool contains only cards that are on a solution').toBeGreaterThan(0);

    // At least one distractor must be a wrong-substance trap rather than filler:
    // a card that cancels nothing against the starting quantity in either
    // orientation is the error this game exists to make visible.
    const inertAtStart = unused.filter((id) =>
      ORIENTATIONS.every(
        (o) => applyRatio(problem.start, orient(ratioById(id), o)).cancelCount === 0
      )
    );
    expect(inertAtStart.length, 'no distractor that fails to cancel at step one').toBeGreaterThan(
      0
    );
  });

  it('gives every problem a pool bigger than its solution', () => {
    for (const problem of problems) {
      expect(problem.poolIds.length, problem.id).toBeGreaterThan(problem.expectedSteps);
    }
  });

  it('references only ratios that exist, with no duplicates in a pool', () => {
    for (const problem of problems) {
      expect(new Set(problem.poolIds).size, problem.id).toBe(problem.poolIds.length);
      for (const id of problem.poolIds) {
        expect(() => ratioById(id), `${problem.id} -> ${id}`).not.toThrow();
      }
    }
  });
});

describe('problem metadata', () => {
  it('has unique ids and non-empty Icelandic copy', () => {
    const ids = problems.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const problem of problems) {
      expect(problem.context.length, problem.id).toBeGreaterThan(20);
      expect(problem.goal.length, problem.id).toBeGreaterThan(5);
      expect(problem.hint.length, problem.id).toBeGreaterThan(20);
      expect(problem.why.length, problem.id).toBeGreaterThan(20);
    }
  });

  it('states the starting measurement the same way in the label and the number', () => {
    // startLabel exists only to keep the trailing zeros a JS number cannot hold.
    // If it ever disagrees with start.value, the chip contradicts the sentence
    // above it and the game is telling a student two different measurements.
    for (const problem of problems) {
      const parsed = Number(problem.startLabel.replace(',', '.'));
      expect(Number.isNaN(parsed), `${problem.id}: startLabel is not a number`).toBe(false);
      expect(parsed, problem.id).toBe(problem.start.value);
    }
  });

  it('shows the starting measurement in the scenario text', () => {
    for (const problem of problems) {
      expect(problem.context, `${problem.id} never states ${problem.startLabel}`).toContain(
        problem.startLabel
      );
    }
  });

  it('gives every problem that uses a mole ratio a visible balanced equation', () => {
    for (const problem of problems) {
      const usesEquation = problem.poolIds.some((id) => ratioById(id).kind === 'jafna');
      if (usesEquation) {
        expect(
          problem.equation,
          `${problem.id} uses a mole ratio with no equation shown`
        ).toBeTruthy();
      }
    }
  });

  it('keeps practice problems shorter than apply problems', () => {
    const aefa = problems.filter((p) => p.phase === 'aefa');
    const beita = problems.filter((p) => p.phase === 'beita');
    expect(aefa.length).toBeGreaterThan(0);
    expect(beita.length).toBeGreaterThan(0);
    expect(Math.max(...aefa.map((p) => p.expectedSteps))).toBeLessThan(
      Math.min(...beita.map((p) => p.expectedSteps))
    );
  });
});

describe('hints are free', () => {
  // Four games shipped strings advertising a hint penalty; three of the four never
  // charged one and the fourth did. This test fails if such a string appears here.
  const sourceDir = join(__dirname, '..');

  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) return entry.name === '__tests__' ? [] : walk(full);
      return /\.tsx?$/.test(entry.name) ? [full] : [];
    });

  it.each([/kostar/i, /af einkunn/i, /-\s*\d+\s*stig/i, /dregið frá/i])(
    'no source file mentions %s',
    (pattern) => {
      for (const file of walk(sourceDir)) {
        expect(readFileSync(file, 'utf8'), file).not.toMatch(pattern);
      }
    }
  );
});
