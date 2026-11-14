import { describe, it, expect } from 'vitest';

import { parseStudentNumber } from '@shared/utils';

import { indicators } from '../data/indicators';
import { LEVEL1_CHALLENGES } from '../data/level1-challenges';
import {
  acceptableIndicatorsFor,
  colourChangeWindow,
  concentrationRange,
  formatMolarity,
  LEVEL2_PUZZLES,
  molarityFromEndpoint,
  randomMolarity,
  sampleOf,
} from '../data/level2-puzzles';
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
        new RegExp(`Títraðu ${NUMBER} mL af .+? af óþekktum styrk með ${NUMBER} M (\\S+?)[.!]`)
      );
      expect(match, `puzzle ${id}: "${puzzle.taskIs}"`).not.toBeNull();
      const [, volume, titrantM, titrant] = match!;

      expect(parseStudentNumber(volume), 'analyte volume').toBe(t.analyte.volume);
      expect(parseStudentNumber(titrantM), 'titrant molarity').toBe(t.titrant.molarity);
      expect(titrant, 'titrant').toBe(t.titrant.formula);
      // The sample's concentration is what the student finds: never given.
      expect(puzzle.taskIs.match(/ M /g)?.length, 'only the titrant has a molarity').toBe(1);
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
 * Stig 2 accepts an indicator whose whole colour change falls within 0,1 mL of
 * the equivalence volume on the titration's curve: the textbook's rule (ch. 14,
 * m68809), Siggi's ruling of 2026-11-14, replacing decision 113 (a), which accepted only
 * an indicator whose range contained the equivalence pH and so marked
 * phenolphthalein wrong for HCl + NaOH.
 *
 * The rule is written out here rather than imported, so the test does not
 * check the grader against itself: it walks the curve in 0,001 mL steps.
 */
function suits(titrationId: number, indicatorId: string): boolean {
  const t = getTitrationById(titrationId) as MonoproticTitration;
  const [low, high] = indicators.find((i) => i.id === indicatorId)!.pHRange;
  const inRange: number[] = [];
  for (let v = 0; v <= 60; v += 0.001) {
    const pH = calculatePH(t, v);
    if (pH >= low && pH <= high) inRange.push(v);
  }
  if (inRange.length === 0) return false;
  return (
    inRange[0] >= t.equivalenceVolume - 0.1 - 0.001 &&
    inRange[inRange.length - 1] <= t.equivalenceVolume + 0.1 + 0.001
  );
}

/** The indicators a text names, as whole words: þýmólblátt is not brómþýmólblátt. */
function namedIndicators(text: string): string[] {
  return indicators
    .filter(({ name }) => new RegExp(`(?<!\\p{L})${name}`, 'iu').test(text))
    .map((i) => i.id);
}

describe('Level 2 accepts an indicator that changes colour at equivalence', () => {
  it('accepts these indicators, and no others', () => {
    expect(Object.fromEntries(LEVEL2_PUZZLES.map((p) => [p.id, p.acceptableIndicators]))).toEqual({
      1: ['methyl-red', 'bromothymol-blue', 'phenolphthalein', 'thymol-blue'], // HCl + NaOH
      2: ['phenolphthalein', 'thymol-blue'], // CH₃COOH + NaOH
      3: ['methyl-red', 'bromothymol-blue', 'phenolphthalein', 'thymol-blue'], // HNO₃ + KOH
      4: ['methyl-red'], // NH₃ + HCl: methyl orange finishes 0,4 mL late
      5: ['bromothymol-blue', 'phenolphthalein', 'thymol-blue'], // HF + NaOH
      6: ['phenolphthalein', 'thymol-blue'], // HCOOH + KOH: bromothymol blue starts 0,2 mL early
    });
  });

  it.each(LEVEL2_PUZZLES.map((p) => [p.id, p] as const))(
    'puzzle %i: accepts exactly the indicators that change colour within 0,1 mL',
    (_id, puzzle) => {
      const suited = indicators.filter((i) => suits(puzzle.titrationId, i.id)).map((i) => i.id);
      expect(puzzle.acceptableIndicators).toEqual(suited);
    }
  );

  it.each(LEVEL2_PUZZLES.map((p) => [p.id, p] as const))(
    'puzzle %i: the explanation names the accepted indicators, and only those',
    (_id, puzzle) => {
      expect(namedIndicators(puzzle.explanationIs)).toEqual(puzzle.acceptableIndicators);
    }
  );

  it('colourChangeWindow agrees with the walk', () => {
    const [from, to] = colourChangeWindow(1, 'phenolphthalein');
    expect(from).toBeGreaterThanOrEqual(-0.001);
    expect(to).toBeLessThan(0.1);
    expect(colourChangeWindow(1, 'methyl-orange')[0]).toBeLessThan(-0.3);
  });

  it("Level 1's worked examples obey the rule they teach", () => {
    const byFormula: Record<string, number> = { 'HCl + NaOH': 1, 'CH₃COOH + NaOH': 5 };
    const question6 = LEVEL1_CHALLENGES.find((c) => c.id === 6)!;
    for (const text of [question6.hints.solution, question6.explanationIs]) {
      const examples = [
        ...text.matchAll(/(HCl \+ NaOH|CH₃COOH \+ NaOH) \(pH [\d,]+\) → ([^;.]+)/g),
      ];
      expect(examples.length, text).toBeGreaterThan(0);
      for (const [, reaction, names] of examples) {
        const named = namedIndicators(names);
        expect(named.length, names).toBeGreaterThan(0);
        for (const indicator of named) {
          expect(suits(byFormula[reaction], indicator), `${indicator} for ${reaction}`).toBe(true);
        }
      }
    }
  });
});

/**
 * Each puzzle draws its sample's concentration at random (2026-11-14), so the
 * student has something to find. The draw must not change the puzzle: the
 * indicators accepted are the same anywhere in the range, and the burette
 * always reaches equivalence.
 */
describe('Stig 2 samples of unknown concentration', () => {
  it.each(LEVEL2_PUZZLES.map((p) => [p.id, p] as const))(
    'puzzle %i: accepts the same indicators across the whole range',
    (_id, puzzle) => {
      const [lo, hi] = concentrationRange(puzzle.titrationId);
      for (let k = 0; k <= 10; k++) {
        const sample = sampleOf(puzzle.titrationId, lo + ((hi - lo) * k) / 10);
        expect(acceptableIndicatorsFor(sample), `at ${sample.analyte.molarity} M`).toEqual(
          puzzle.acceptableIndicators
        );
      }
    }
  );

  it.each(LEVEL2_PUZZLES.map((p) => [p.id, p] as const))(
    'puzzle %i: every draw is reachable on the 60 mL burette, to three figures',
    (_id, puzzle) => {
      const [lo, hi] = concentrationRange(puzzle.titrationId);
      for (const r of [0, 0.25, 0.5, 0.75, 0.999]) {
        const m = randomMolarity(puzzle.titrationId, () => r);
        // Rounding to three figures may step just past an end of the range.
        expect(m).toBeGreaterThanOrEqual(lo * 0.995);
        expect(m).toBeLessThanOrEqual(hi * 1.005);
        expect(Number(m.toPrecision(3))).toBe(m);
        const sample = sampleOf(puzzle.titrationId, m);
        expect(sample.equivalenceVolume).toBeGreaterThanOrEqual(9.95);
        expect(sample.equivalenceVolume).toBeLessThanOrEqual(50.5);
        expect(molarityFromEndpoint(sample, sample.equivalenceVolume)).toBeCloseTo(m, 10);
      }
    }
  );

  it('prints a molarity to three significant figures with a comma', () => {
    expect(formatMolarity(0.096)).toBe('0,0960');
    expect(formatMolarity(0.12)).toBe('0,120');
    expect(formatMolarity(0.10062)).toBe('0,101');
    expect(formatMolarity(0.0499)).toBe('0,0499');
  });
});
