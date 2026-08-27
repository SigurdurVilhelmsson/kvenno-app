/**
 * The Level 3 pool, checked against the game's own graders.
 *
 * The February harvest brought twenty-five scenarios in from the frozen repo,
 * and the review's standing instruction for anything coming out of there is
 * "take the data, not the code" — the data was never verified either. Four
 * classes of defect were found in it and are pinned here so they cannot return:
 *
 * - a declared significant-figure count the correct answer cannot have, so a
 *   student typing the exact key was told their answer had the wrong precision
 *   (three of the eight harvested declarations, plus none of the shipped four);
 * - an answer key that the item's own stated method does not produce;
 * - a `real_world` key that is not a whole number while the item requires one;
 * - a solution step left in English, which the level renders verbatim.
 */

import { describe, it, expect } from 'vitest';

import { level3Challenges } from '../data/challenges';
import { applyFactorPath, isAnswerCorrect, parseStudentNumber } from '../utils/grading';
import { countSignificantFigures } from '../utils/scoring';

describe('the Level 3 challenge pool', () => {
  it('gives every challenge its own id', () => {
    const ids = level3Challenges.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('asks every challenge a question', () => {
    for (const challenge of level3Challenges) {
      expect(challenge.prompt.trim(), challenge.id).not.toBe('');
    }
  });
});

describe('significant figures a student can actually write', () => {
  const declared = level3Challenges.filter(
    (c) => c.type === 'synthesis' && c.significantFigures !== undefined
  );

  it('covers the items that declare a count', () => {
    expect(declared.length).toBeGreaterThan(5);
  });

  it.each(declared.map((c) => [c.id, c] as const))(
    '%s — the correct answer, written to the declared precision, is still correct',
    (id, challenge) => {
      if (challenge.type !== 'synthesis' || challenge.significantFigures === undefined) {
        throw new Error(`${id} is not a synthesis item with a declared precision`);
      }

      // What the student would type if they rounded the way the item asks.
      const written = challenge.expectedAnswer.toPrecision(challenge.significantFigures);

      // The game's own counter has to agree that this is the declared count.
      // A declaration of 4 on an answer of 1200 fails here: `toPrecision(4)`
      // gives "1200", which counts as 2 under the trailing-zero convention.
      expect(countSignificantFigures(written), `${id}: wrote ${written}`).toBe(
        challenge.significantFigures
      );

      // And the game's own grader has to accept it.
      expect(
        isAnswerCorrect(parseStudentNumber(written), challenge.expectedAnswer),
        `${id}: wrote ${written}, key is ${challenge.expectedAnswer}`
      ).toBe(true);
    }
  );
});

describe('answer keys the stated method reproduces', () => {
  const derivations = level3Challenges.filter((c) => c.type === 'derivation');

  it.each(derivations.map((c) => [c.id, c] as const))(
    '%s — the correct factor chain gives the key',
    (id, challenge) => {
      if (challenge.type !== 'derivation') throw new Error(`${id} is not a derivation`);
      const produced = applyFactorPath(challenge.startValue, challenge.correctMethod);
      expect(
        isAnswerCorrect(produced, challenge.expectedAnswer),
        `${id}: chain gave ${produced}`
      ).toBe(true);
    }
  );

  const efficiencies = level3Challenges.filter((c) => c.type === 'efficiency');

  it.each(efficiencies.map((c) => [c.id, c] as const))(
    '%s — every offered path lands on the same answer',
    (id, challenge) => {
      if (challenge.type !== 'efficiency') throw new Error(`${id} is not an efficiency item`);

      // The level scores the *path* on step count and the *answer* on value, so
      // an inefficient path is still a right answer. A path that lands somewhere
      // else is not inefficient, it is wrong.
      for (const path of challenge.possiblePaths) {
        const produced = applyFactorPath(challenge.startValue, path.steps);
        expect(
          isAnswerCorrect(produced, challenge.targetAnswer),
          `${id}: [${path.steps.join(', ')}] gave ${produced}, key is ${challenge.targetAnswer}`
        ).toBe(true);
        expect(path.stepCount, `${id}: stepCount disagrees with the path`).toBe(path.steps.length);
      }

      expect(
        challenge.possiblePaths.some((p) => p.efficient),
        `${id}: no path is marked efficient, so the choice cannot be scored`
      ).toBe(true);
    }
  );
});

describe('real-world items', () => {
  const realWorld = level3Challenges.filter((c) => c.type === 'real_world');

  it.each(realWorld.map((c) => [c.id, c] as const))('%s is gradeable and explained', (id, c) => {
    if (c.type !== 'real_world') throw new Error(`${id} is not a real_world item`);

    // The grader requires a whole number when the item says so, so a key that
    // is not one could never be reached.
    if (c.requireInteger) {
      expect(Number.isInteger(c.expectedAnswer), `${id}: key is ${c.expectedAnswer}`).toBe(true);
    }

    // The worked solution is the only feedback this type has.
    expect(c.explanation.trim(), id).not.toBe('');
  });
});

describe('nothing renders English at a student', () => {
  // `requiredSteps` used to be three magic English strings that the component
  // swapped for Icelandic, and anything else fell through and rendered as
  // written — so `'multiply by molar mass'` shipped on screen. The steps are
  // Icelandic in the data now and the component renders them verbatim.
  const steps = level3Challenges.flatMap((c) =>
    c.type === 'synthesis' ? c.requiredSteps.map((s) => [c.id, s] as const) : []
  );

  it.each(steps)('%s — %s is not untranslated English', (_id, step) => {
    expect(/^[a-z][a-z\s]*$/.test(step)).toBe(false);
  });
});
