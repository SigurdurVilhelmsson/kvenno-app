import { describe, it, expect } from 'vitest';

import { parseStudentNumber } from '@shared/utils';

import { LEVEL2_PUZZLES } from '../data/level2-puzzles';
import { BUFFER_PROBLEMS } from '../data/problems';
import { solveBuffer } from '../engine/buffer';

/**
 * Level 2's hints and explanations agree with the grader.
 *
 * **Why this exists.** The hint tiers were typed by hand and were not touched
 * when grading moved to `engine/buffer.ts` or when Appendix D corrected the
 * ammonium pKa from 9,25 to 9,26. On three of the five puzzles a student who
 * copied the revealed worked solution was marked wrong by the level that had
 * just revealed it — the formate puzzle's acid mass was out by 58 %. These
 * tests read the numbers back out of the text a student sees and put them
 * through the same comparison `Level2.tsx` makes.
 */

const grams = (text: string) =>
  [...text.matchAll(/= (\d+,\d+) g\b/g)].map((m) => parseStudentNumber(m[1]));

describe('Level 2 hints', () => {
  for (const puzzle of LEVEL2_PUZZLES) {
    const problem = BUFFER_PROBLEMS.find((p) => p.id === puzzle.problemId)!;
    const r = solveBuffer(problem);

    describe(`puzzle ${puzzle.id} (problem ${problem.id})`, () => {
      it('reveals masses the level then accepts', () => {
        const [acid, base] = grams(puzzle.hints.solution);
        expect(acid, puzzle.hints.solution).toBeDefined();
        expect(base, puzzle.hints.solution).toBeDefined();
        // The exact comparison Level2.tsx's checkMass makes.
        expect(Math.abs(acid - r.acidMass) / r.acidMass).toBeLessThanOrEqual(puzzle.massTolerance);
        expect(Math.abs(base - r.baseMass) / r.baseMass).toBeLessThanOrEqual(puzzle.massTolerance);
      });

      it('reveals a ratio the level then accepts, everywhere it is quoted', () => {
        const text = [puzzle.hints.method, puzzle.hints.solution, puzzle.explanationIs].join(' ');
        const quoted = [...text.matchAll(/(?:≈|Hlutfall =) (\d+,\d+)/g)].map((m) =>
          parseStudentNumber(m[1])
        );
        expect(quoted.length).toBeGreaterThanOrEqual(3);
        for (const q of quoted) {
          // Checked against the ratio itself, not the tolerance: a hint that
          // disagrees with its own method line is wrong even if the grader
          // would forgive it.
          expect(q).toBeCloseTo(r.ratio, 2);
          expect(Math.abs(q - r.ratio) / r.ratio).toBeLessThanOrEqual(puzzle.ratioTolerance);
        }
      });

      it('quotes the pKa the problem actually uses', () => {
        const text = [...Object.values(puzzle.hints), puzzle.explanationIs].join(' ');
        // `pH − pKa = 7,40 − 7,20` quotes the pH first; the lookbehind skips it.
        const quoted = [...text.matchAll(/(?<!pH − )pKa(?: =| \()\s*(\d+,\d+)/g)].map((m) =>
          parseStudentNumber(m[1])
        );
        expect(quoted.length).toBeGreaterThan(0);
        for (const q of quoted) expect(q).toBeCloseTo(problem.pKa, 2);
      });

      it('writes decimals with a comma', () => {
        const text = [puzzle.taskIs, ...Object.values(puzzle.hints), puzzle.explanationIs].join(
          ' '
        );
        expect(text).not.toMatch(/\d\.\d/);
      });
    });
  }
});
