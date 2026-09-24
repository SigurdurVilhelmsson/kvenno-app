import { describe, it, expect } from 'vitest';

import { parseStudentNumber } from '@shared/utils';

import { LEVEL2_PUZZLES } from '../data/level2-puzzles';
import { getTitrationById } from '../data/titrations';
import type { MonoproticTitration } from '../types';

/**
 * Each Level 2 puzzle names a titration twice: in its task sentence, and
 * through `titrationId`, which supplies the card's title, the "Sýni" and
 * "Títrantur" lines under the sentence, the curve on screen and the
 * equivalence volume the marked volume is graded against.
 *
 * Until 2026-09-23 four of the six disagreed. Puzzle 2 asked for acetic acid
 * and served HClO₄ + LiOH, a strong-acid curve, while accepting only the
 * weak-acid indicators; puzzle 5 asked for HF and served acetic acid; puzzle 6
 * asked for formic acid and served HF; and puzzle 3 stated 25,0 mL of
 * 0,100 M HNO₃ over a titration of 30,0 mL of 0,050 M. A student who worked
 * from the sentence was graded against a different flask.
 */

const NUMBER = String.raw`(\d+(?:[.,]\d+)?)`;

function titrationOf(puzzleId: number): MonoproticTitration {
  const puzzle = LEVEL2_PUZZLES.find((p) => p.id === puzzleId)!;
  const titration = getTitrationById(puzzle.titrationId);
  if (!titration || !('equivalenceVolume' in titration)) {
    throw new Error(`puzzle ${puzzleId}: titration ${puzzle.titrationId} is not monoprotic`);
  }
  return titration;
}

describe('Level 2 puzzles agree with the titration they serve', () => {
  it.each(LEVEL2_PUZZLES.map((p) => [p.id, p] as const))(
    'puzzle %i: the task sentence states the analyte and titrant on screen',
    (id, puzzle) => {
      const t = titrationOf(id);
      const match = puzzle.taskIs.match(
        new RegExp(`Títraðu ${NUMBER} mL af ${NUMBER} M .+? með ${NUMBER} M (\\S+?)[.!]`)
      );
      expect(match, `puzzle ${id}: "${puzzle.taskIs}"`).not.toBeNull();
      const [, volume, analyteM, titrantM, titrant] = match!;

      expect(parseStudentNumber(volume), 'analyte volume').toBe(t.analyte.volume);
      expect(parseStudentNumber(analyteM), 'analyte molarity').toBe(t.analyte.molarity);
      expect(parseStudentNumber(titrantM), 'titrant molarity').toBe(t.titrant.molarity);
      expect(titrant, 'titrant').toBe(t.titrant.formula);
      expect(puzzle.taskIs, 'analyte formula').toContain(t.analyte.formula);
    }
  );

  it.each(LEVEL2_PUZZLES.map((p) => [p.id, p] as const))(
    'puzzle %i: the explanation describes the same reaction',
    (id, puzzle) => {
      const t = titrationOf(id);
      expect(puzzle.explanationIs).toContain(`${t.analyte.formula} + ${t.titrant.formula}`);
    }
  );

  it('serves six different titrations', () => {
    expect(new Set(LEVEL2_PUZZLES.map((p) => p.titrationId)).size).toBe(LEVEL2_PUZZLES.length);
  });
});
