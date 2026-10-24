import { describe, it, expect } from 'vitest';

import { parseStudentNumber } from '@shared/utils';

import { indicators } from '../data/indicators';
import { LEVEL1_CHALLENGES } from '../data/level1-challenges';
import { LEVEL2_PUZZLES } from '../data/level2-puzzles';
import { getTitrationById } from '../data/titrations';
import type { MonoproticTitration } from '../types';
import { calculatePH } from '../utils/ph-calculations';

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

/**
 * Stig 2 grades the indicator by Stig 1's rule — the colour-change range must
 * contain the pH at the equivalence point (Stig 1, question 6) — on the pH the
 * result prints: the curve's own, to one decimal. Mobile-pass decision 113 (a),
 * 2026-10-23.
 *
 * Until then each puzzle listed its indicators by hand, against that rule and
 * against each other: methyl red was accepted for HCl + NaOH (pH 7), methyl
 * orange refused there but accepted for HNO₃ + KOH (also pH 7) and for ammonia
 * (pH 5,3), and phenolphthalein accepted for HF (pH 8,0). Stig 1's own worked
 * example paired HCl + NaOH with methyl red too.
 *
 * The rule is written out here rather than imported, so the test does not
 * check the grader against itself.
 */
function suits(indicatorId: string, pH: number): boolean {
  const [low, high] = indicators.find((i) => i.id === indicatorId)!.pHRange;
  return pH >= low && pH <= high;
}

const printedEquivalencePH = (t: MonoproticTitration) =>
  Math.round(calculatePH(t, t.equivalenceVolume) * 10) / 10;

/** The indicators a text names, as whole words: þýmólblátt is not brómþýmólblátt. */
function namedIndicators(text: string): string[] {
  return indicators
    .filter(({ name }) => new RegExp(`(?<!\\p{L})${name}`, 'iu').test(text))
    .map((i) => i.id);
}

describe("Level 2 grades the indicator by Level 1's rule", () => {
  it('accepts these indicators, and no others', () => {
    expect(Object.fromEntries(LEVEL2_PUZZLES.map((p) => [p.id, p.acceptableIndicators]))).toEqual({
      1: ['bromothymol-blue'], // HCl + NaOH, pH 7,0
      2: ['phenolphthalein', 'thymol-blue'], // CH₃COOH + NaOH, pH 8,7
      3: ['bromothymol-blue'], // HNO₃ + KOH, pH 7,0
      4: ['methyl-red'], // NH₃ + HCl, pH 5,3
      5: ['thymol-blue'], // HF + NaOH, pH 8,0
      6: ['phenolphthalein', 'thymol-blue'], // HCOOH + KOH, pH 8,3
    });
  });

  it.each(LEVEL2_PUZZLES.map((p) => [p.id, p] as const))(
    'puzzle %i: accepts exactly the indicators whose range holds the printed pH',
    (id, puzzle) => {
      const pH = printedEquivalencePH(titrationOf(id));
      const suited = indicators.filter((i) => suits(i.id, pH)).map((i) => i.id);
      expect(suited.length, `pH ${pH}`).toBeGreaterThan(0);
      expect(puzzle.acceptableIndicators, `pH ${pH}`).toEqual(suited);
    }
  );

  it.each(LEVEL2_PUZZLES.map((p) => [p.id, p] as const))(
    'puzzle %i: the explanation names the accepted indicators, and only those',
    (_id, puzzle) => {
      expect(namedIndicators(puzzle.explanationIs)).toEqual(puzzle.acceptableIndicators);
    }
  );

  it("Level 1's worked examples obey the rule they teach", () => {
    const question6 = LEVEL1_CHALLENGES.find((c) => c.id === 6)!;
    for (const text of [question6.hints.solution, question6.explanationIs]) {
      const examples = [...text.matchAll(/\(pH ~?(\d+(?:,\d+)?)\) → ([^;.]+)/g)];
      expect(examples.length, text).toBeGreaterThan(0);
      for (const [, pH, names] of examples) {
        const named = namedIndicators(names);
        expect(named.length, names).toBeGreaterThan(0);
        for (const indicator of named) {
          expect(suits(indicator, parseStudentNumber(pH)), `${indicator} at pH ${pH}`).toBe(true);
        }
      }
    }
  });
});
