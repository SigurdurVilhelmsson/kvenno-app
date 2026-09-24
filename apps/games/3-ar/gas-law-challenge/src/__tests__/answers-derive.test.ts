import { describe, expect, it } from 'vitest';

import { formatDecimal } from '@shared/utils';

import { questions } from '../data/questions';
import { R, type GasLawQuestion, type Variable } from '../types';
import { answerText } from '../utils/gas-calculations';

/**
 * Every stored answer follows from its own question, at the precision it is written to.
 *
 * **Why this exists.** The answers were typed in by hand and nothing re-derived them.
 * Two had been worked with R = 0,0821 while the game states R = 0,08206: question 2's
 * 0,211 mol is 0,2116, which is 0,212, and question 11's 0,946 atm is 0,9453, which is
 * 0,945. Both sat inside their tolerances, so no grade changed — but the hints and
 * worked solutions printed a last digit the student's own correct arithmetic could not
 * reproduce. `1-ar/reynsluformulur` and `3-ar/buffer-recipe-creator` derive for the same
 * reason.
 *
 * A Stig 2 or 3 question states only its first state in `given`; the second-state value
 * it needs is in the scenario text. That value is listed here and the test checks the
 * scenario really says it, so the table cannot drift from the question.
 */

/** The second state of each two-state question, as its scenario states it. */
const SECOND_STATE: Record<number, Partial<Record<Variable, number>>> = {
  14: { P: 2.5 },
  15: { V: 2.0 },
  16: { T: 450 },
  17: { V: 8.8 },
  18: { T: 450 },
  19: { P: 2.5 },
  20: { P: 0.5, T: 253 },
  21: { P: 6.0, V: 6.0 },
  22: { n: 0.3 },
  23: { V: 12.5 },
};

/**
 * Solve PV = nRT for one state, or P₁V₁/(n₁T₁) = P₂V₂/(n₂T₂) across two. A quantity the
 * question never states is held constant, so it cancels: it is taken as 1 on both sides.
 */
function derive(q: GasLawQuestion): number {
  const first = (v: Variable) => q.given[v]?.value ?? 1;

  if (q.gasLaw === 'ideal') {
    const k = (v: Variable) => q.given[v]!.value;
    switch (q.find) {
      case 'P':
        return (k('n') * R * k('T')) / k('V');
      case 'V':
        return (k('n') * R * k('T')) / k('P');
      case 'T':
        return (k('P') * k('V')) / (k('n') * R);
      case 'n':
        return (k('P') * k('V')) / (R * k('T'));
    }
  }

  const second = (v: Variable) => SECOND_STATE[q.id]?.[v] ?? first(v);
  // PV/(nT) is the same in both states.
  const ratio = (first('P') * first('V')) / (first('n') * first('T'));
  // Isolate the sought variable from P₂V₂ / (n₂T₂) = ratio: set it to 1 and solve.
  const at = (v: Variable) => (v === q.find ? 1 : second(v));
  const top = at('P') * at('V');
  const bottom = at('n') * at('T');
  const inNumerator = q.find === 'P' || q.find === 'V';
  return inNumerator ? (ratio * bottom) / top : top / (ratio * bottom);
}

/** Decimal places the stored answer is written to, as its worked solution writes it. */
function decimalsOf(q: GasLawQuestion): number {
  return answerText(q).split(',')[1]?.length ?? 0;
}

describe('stored answers', () => {
  it('cover every question with a second state where one is needed', () => {
    for (const q of questions) {
      expect(q.gasLaw === 'ideal' || q.id in SECOND_STATE, `question ${q.id}`).toBe(true);
    }
  });

  it.each(Object.entries(SECOND_STATE))(
    'question %s states its second-state values in its scenario',
    (id, values) => {
      const q = questions.find((x) => x.id === Number(id))!;
      for (const value of Object.values(values)) {
        const written = [formatDecimal(value), formatDecimal(value, 1)];
        expect(
          written.some((w) => q.scenario_is.includes(w)),
          `question ${id} scenario lacks ${written[0]}`
        ).toBe(true);
      }
    }
  );

  it.each(questions.map((q) => [q.id, q] as const))(
    'question %i: the stored answer is the derived one, rounded as written',
    (_id, q) => {
      const decimals = decimalsOf(q);
      expect(formatDecimal(derive(q), decimals)).toBe(formatDecimal(q.answer, decimals));
    }
  );

  it.each(questions.map((q) => [q.id, q] as const))(
    'question %i: the scenario asks nothing the answer field cannot take',
    (_id, q) => {
      // Question 11 asked "Hvað gerist við loftþrýsting þegar hitastigið lækkar?" — a
      // qualitative question about a temperature change its data does not contain — above
      // a field that grades one pressure at one temperature.
      expect(q.scenario_is).not.toMatch(/Hvað gerist/i);
    }
  );

  it.each(questions.map((q) => [q.id, q] as const))(
    'question %i: the worked solution ends on the stored answer',
    (_id, q) => {
      // answerText falls back to the stored number when the calculation does not end on it.
      const numbers = q.solution.calculation.match(/\d+(?:,\d+)?/g) ?? [];
      expect(numbers[numbers.length - 1]).toBe(answerText(q));
    }
  );
});
