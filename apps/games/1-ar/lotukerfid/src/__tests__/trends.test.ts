/**
 * The periodic-trend questions, derived rather than trusted.
 *
 * The twelve comparisons were harvested from the frozen repo, where the file
 * carried a comment reading "All chemically accurate based on standard periodic
 * trends". That is a claim, not a check, and the roadmap's whole reason for
 * saying *take the data, not the code* is that nothing in the old repo was ever
 * verified. So this test does not read `answerSymbol` and agree with it: it
 * works the answer out from the two elements' positions in `elements.ts` and
 * then compares.
 *
 * That is only sound because every pair is in the same period or the same
 * group. The naive rules — "smaller to the right, bigger downwards" — pull in
 * opposite directions on a diagonal comparison and settle it only with real
 * measured values, which this game does not carry. So the test also *refuses* a
 * diagonal pair: adding one would be adding a question this level cannot teach
 * a student to answer.
 */

import { describe, it, expect } from 'vitest';

import { ELEMENTS } from '../data/elements';
import { TREND_INFO, TREND_QUESTIONS, type TrendQuestion } from '../data/trends';

function elementFor(symbol: string) {
  const element = ELEMENTS.find((e) => e.symbol === symbol);
  if (!element) throw new Error(`${symbol} is not in elements.ts`);
  return element;
}

/**
 * Which of the two has the larger value of the trend quantity, from position
 * alone. Radius grows to the left and downwards; ionisation energy and
 * electronegativity do the opposite.
 */
function predictLarger(question: TrendQuestion): string {
  const a = elementFor(question.element1Symbol);
  const b = elementFor(question.element2Symbol);
  const growsLeftAndDown = question.trendType === 'atomic-radius';

  if (a.period === b.period) {
    const leftmost = a.group < b.group ? a : b;
    const rightmost = a.group < b.group ? b : a;
    return (growsLeftAndDown ? leftmost : rightmost).symbol;
  }

  if (a.group === b.group) {
    const lower = a.period > b.period ? a : b;
    const higher = a.period > b.period ? b : a;
    return (growsLeftAndDown ? lower : higher).symbol;
  }

  throw new Error(
    `${a.symbol} (lota ${a.period}, flokkur ${a.group}) and ${b.symbol} (lota ${b.period}, flokkur ${b.group}) share neither a period nor a group — the rules this level teaches do not settle that comparison`
  );
}

describe('the trend questions', () => {
  it('ships twelve, four per trend', () => {
    expect(TREND_QUESTIONS).toHaveLength(12);
    for (const trendType of Object.keys(TREND_INFO)) {
      expect(
        TREND_QUESTIONS.filter((q) => q.trendType === trendType),
        trendType
      ).toHaveLength(4);
    }
  });

  it('gives every question its own id', () => {
    const ids = TREND_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(TREND_QUESTIONS.map((q) => [q.id, q] as const))(
    '%s — the key is what the trend rules give',
    (id, question) => {
      expect(predictLarger(question), `${id}: ${question.question}`).toBe(question.answerSymbol);
    }
  );

  it.each(TREND_QUESTIONS.map((q) => [q.id, q] as const))(
    '%s — names both elements in the question and the right one in the explanation',
    (id, question) => {
      expect([question.element1Symbol, question.element2Symbol], id).toContain(
        question.answerSymbol
      );
      expect(question.question, id).toContain(question.element1Symbol);
      expect(question.question, id).toContain(question.element2Symbol);
      expect(question.explanation.startsWith(question.answerSymbol), id).toBe(true);
    }
  );
});

describe('the Icelandic that came with them', () => {
  const allText = [
    ...TREND_QUESTIONS.flatMap((q) => [q.question, q.explanation]),
    ...Object.values(TREND_INFO).flatMap((info) => [info.name, info.description, info.rule]),
  ].join('\n');

  // `ordabok.md` gives atomic radius as `atómradíus`; `atómgeisli` was the old
  // repo's coinage and returns zero hits in the school's textbook corpus.
  it('says atómradíus, never atómgeisli', () => {
    expect(allText).not.toMatch(/atómgeisl/i);
    expect(allText).toMatch(/atómradíus/);
  });

  // The across-period contraction is caused by rising effective nuclear charge.
  // `kjarnakraftur` is the strong nuclear force, which is a different thing.
  it('blames virk kjarnhleðsla, not kjarnakraftur', () => {
    expect(allText).not.toMatch(/kjarnakraft/i);
    expect(allText).toMatch(/virk[ar]? kjarnhleðsl/);
  });
});
