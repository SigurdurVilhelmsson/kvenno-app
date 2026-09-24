import { describe, it, expect } from 'vitest';

import { generateQuestions, type Question } from '../components/Level2';
import { ELEMENTS } from '../data/elements';

/**
 * Stig 2's options do not give their answer away, and a run does not repeat
 * itself.
 *
 * Three defects, all found 2026-09-23:
 *
 * - **The right group-property option was the one with a group number.** Three
 *   of the four correct answers read "… (flokkur N)" while only one wrong option
 *   in the whole set carried a number that way, so the parenthesis was the
 *   answer.
 * - **An order-by-mass item never put its heaviest element first.** The three
 *   wrong orderings were always the same three of five, none of which led with
 *   the heaviest element — so the element that led no option was the heaviest,
 *   and half the ordering could be read off the options with no chemistry.
 * - **Two group-property questions were drawn independently**, so a quarter of
 *   runs asked the identical question twice.
 */

const RUNS = 400;

function runs(): Question[][] {
  return Array.from({ length: RUNS }, () => generateQuestions());
}

const bySymbol = new Map(ELEMENTS.map((e) => [e.symbol, e]));

describe('Stig 2 options', () => {
  const all = runs();

  it('does not mark the right group-property option with a group number only it carries', () => {
    let seen = 0;
    for (const run of all) {
      for (const q of run.filter((x) => x.type === 'group-property')) {
        seen++;
        const withNumber = q.options.filter((o) => /\d/.test(o));
        expect(withNumber, `${q.text}: ${q.options.join(' | ')}`).not.toEqual([q.correctOption]);
        const withParenthesis = q.options.filter((o) => o.includes('('));
        expect(withParenthesis, `${q.text}: ${q.options.join(' | ')}`).not.toEqual([
          q.correctOption,
        ]);
      }
    }
    expect(seen).toBe(RUNS * 2);
  });

  it('lets the heaviest element lead a wrong ordering, so the options do not name it', () => {
    let items = 0;
    let heaviestNeverFirst = 0;
    for (const run of all) {
      for (const q of run.filter((x) => x.type === 'order-by-mass')) {
        items++;
        const heaviest = q.correctOption.split(' < ').at(-1)!;
        expect(bySymbol.has(heaviest)).toBe(true);
        expect(q.options).toHaveLength(4);
        expect(new Set(q.options).size).toBe(4);
        expect(q.options).toContain(q.correctOption);
        if (!q.options.some((o) => o.startsWith(`${heaviest} <`))) heaviestNeverFirst++;
      }
    }
    expect(items).toBe(RUNS * 2);
    // Three wrong orderings drawn from five: the two that lead with the
    // heaviest element are both missed one time in ten. Always missing them is
    // the leak.
    expect(heaviestNeverFirst / items).toBeLessThan(0.3);
  });

  it('never asks the same group-property question twice in a run', () => {
    for (const run of all) {
      const texts = run.filter((q) => q.type === 'group-property').map((q) => q.text);
      expect(texts).toHaveLength(2);
      expect(new Set(texts).size, texts.join(' / ')).toBe(2);
    }
  });
});
