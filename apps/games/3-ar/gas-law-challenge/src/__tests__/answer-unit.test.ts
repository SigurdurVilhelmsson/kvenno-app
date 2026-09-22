import { describe, it, expect } from 'vitest';

import { questions } from '../data/questions';
import { answerUnit, checkAnswer, getUnit } from '../utils/gas-calculations';

/**
 * The answer field's unit is the unit the answer is stored and graded in.
 *
 * **Why this exists.** Question 14 gives a syringe at 10,0 mL and stores the
 * answer 4,0 — in mL — but the input, the revealed answer and the feedback all
 * labelled it with `getUnit('V')`, which is always `L`. A student who read the
 * label and converted (0,004 L) was marked wrong; one who ignored it was marked
 * right under a unit that was false. `answerUnit` takes the unit the question
 * itself states the variable in, and these tests hold the label to the worked
 * solution rather than to a default.
 */
describe('answer units', () => {
  it('labels question 14 in mL', () => {
    const q14 = questions.find((q) => q.id === 14)!;
    expect(answerUnit(q14)).toBe('mL');
    expect(checkAnswer(4.0, q14.answer, q14.tolerance)).toBe(true);
    expect(checkAnswer(0.004, q14.answer, q14.tolerance)).toBe(false);
  });

  it('agrees with the unit each worked solution ends in', () => {
    for (const q of questions) {
      expect(q.solution.calculation.trim(), `question ${q.id}`).toMatch(
        new RegExp(`\\s${answerUnit(q)}$`)
      );
    }
  });

  it('falls back to the default where the question does not state the variable', () => {
    for (const q of questions.filter((x) => x.given[x.find] === undefined)) {
      expect(answerUnit(q), `question ${q.id}`).toBe(getUnit(q.find));
    }
  });
});
