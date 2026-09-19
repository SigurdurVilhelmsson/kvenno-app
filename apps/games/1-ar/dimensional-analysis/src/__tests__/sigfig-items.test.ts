import { describe, it, expect } from 'vitest';

import { checkWritten } from '../components/Level0SigFigs';
import { ARITHMETIC_ITEMS, COUNT_ITEMS, ROUND_ITEMS, RULES } from '../data/sigfig-items';
import {
  countDecimalPlaces,
  countSigFigs,
  decimalPlacesAfterAdd,
  roundToSigFigs,
  sigFigsAfterMultiply,
} from '../utils/sigfigs';

/**
 * Stig 0's content, checked against the engine that grades it.
 *
 * The failure this guards is the one the repo has shipped twice — `molmassi`'s
 * breakdowns that did not sum to their own totals (B4), and
 * `buffer-recipe-creator` Level 2 grading against stored arithmetic that
 * disagreed with itself. Both came from answers typed in beside the question.
 * Here every answer is derived, and these tests re-derive them independently.
 */

describe('the teaching rules', () => {
  it('states all four, in order', () => {
    expect(RULES.map((r) => r.n)).toEqual([1, 2, 3, 4]);
  });

  it('every worked example counts the way the rule claims', () => {
    // A wrong worked example is worse than none: it is the thing the student
    // copies. Checked against the engine, not against itself.
    for (const rule of RULES) {
      for (const ex of rule.examples) {
        expect(countSigFigs(ex.written), `rule ${rule.n}: ${ex.written}`).toBe(ex.count);
      }
    }
  });

  it('rule 4 is illustrated by a pair that differs only in the comma', () => {
    // The point of the rule. If this pair ever loses its partner the rule
    // becomes an assertion rather than a demonstration.
    const written = RULES[3].examples.map((e) => e.written);
    expect(written).toContain('1200');
    expect(written).toContain('1200,');
    expect(countSigFigs('1200')).not.toBe(countSigFigs('1200,'));
  });
});

describe('counting practice', () => {
  it('every stored answer is what the engine says', () => {
    for (const item of COUNT_ITEMS) {
      expect(countSigFigs(item.written), item.id).toBe(item.answer);
    }
  });

  it('every answer is inside the range of buttons offered', () => {
    // The screen offers 1-5. An item whose answer is 6 could never be answered
    // correctly — the Nafnakerfið Level 3 defect, in miniature.
    for (const item of COUNT_ITEMS) {
      expect(item.answer, `${item.id} is unanswerable`).toBeGreaterThanOrEqual(1);
      expect(item.answer, `${item.id} is unanswerable`).toBeLessThanOrEqual(5);
    }
  });

  it('carries the 4500 / 4500, pair, which is the whole of rule 4', () => {
    const written = COUNT_ITEMS.map((i) => i.written);
    expect(written).toContain('4500');
    expect(written).toContain('4500,');
    const plain = COUNT_ITEMS.find((i) => i.written === '4500')!;
    const comma = COUNT_ITEMS.find((i) => i.written === '4500,')!;
    expect(plain.answer).toBe(2);
    expect(comma.answer).toBe(4);
  });

  it('names a misconception wherever the wrong answer is diagnosable', () => {
    // Rule 1 is the one case where there is nothing to diagnose.
    for (const item of COUNT_ITEMS.filter((i) => i.rule > 1)) {
      expect(item.misconception, `${item.id} has no misconception`).toBeTruthy();
    }
  });
});

describe('rounding practice', () => {
  it('every stored answer is what the engine prints', () => {
    for (const item of ROUND_ITEMS) {
      expect(roundToSigFigs(item.value, item.figures), item.id).toBe(item.answer);
    }
  });

  it('every answer reads back at the precision it was asked for', () => {
    for (const item of ROUND_ITEMS) {
      expect(countSigFigs(item.answer), `${item.id} (${item.answer})`).toBe(item.figures);
    }
  });

  it('includes the trailing-zero case and the one plain decimal cannot express', () => {
    const r3 = ROUND_ITEMS.find((i) => i.id === 'r3')!;
    expect(r3.answer).toBe('2,50'); // dropping the zero understates it
    const r5 = ROUND_ITEMS.find((i) => i.id === 'r5')!;
    expect(r5.answer).toContain('×'); // 60 cannot claim two figures in plain decimal
  });
});

describe('the arithmetic rules', () => {
  it('every stored answer is what the engine says', () => {
    expect(ARITHMETIC_ITEMS.find((i) => i.id === 'a1')!.answer).toBe(
      sigFigsAfterMultiply(['2,50', '1,1'])
    );
    expect(ARITHMETIC_ITEMS.find((i) => i.id === 'a3')!.answer).toBe(
      sigFigsAfterMultiply(['2,50', null])
    );
    expect(ARITHMETIC_ITEMS.find((i) => i.id === 'a4')!.answer).toBe(
      decimalPlacesAfterAdd(['100', '1,234'])
    );
    expect(ARITHMETIC_ITEMS.find((i) => i.id === 'a5')!.answer).toBe(
      decimalPlacesAfterAdd(['12,11', '0,3'])
    );
  });

  it('every answer is inside the range of buttons offered', () => {
    for (const item of ARITHMETIC_ITEMS) {
      expect(item.answer, `${item.id} is unanswerable`).toBeGreaterThanOrEqual(0);
      expect(item.answer, `${item.id} is unanswerable`).toBeLessThanOrEqual(4);
    }
  });

  it('teaches both rules, and carries the exact-factor case', () => {
    expect(ARITHMETIC_ITEMS.some((i) => i.kind === 'margfeldi')).toBe(true);
    expect(ARITHMETIC_ITEMS.some((i) => i.kind === 'summa')).toBe(true);
    // a3 is the one that matters for this game: a conversion factor is a
    // definition and does not limit the answer. Without it a student would cap
    // every unit conversion at the figures in `1000`.
    const a3 = ARITHMETIC_ITEMS.find((i) => i.id === 'a3')!;
    expect(a3.answer).toBe(3);
  });

  it('the sum item would get a different answer under the product rule', () => {
    // Why both rules are taught side by side. If this ever stops being true the
    // step has lost its point.
    expect(decimalPlacesAfterAdd(['100', '1,234'])).not.toBe(
      sigFigsAfterMultiply(['100', '1,234'])
    );
    expect(countDecimalPlaces('100')).toBe(0);
  });
});

describe('checkWritten — grading a written answer', () => {
  it('accepts the exact written form', () => {
    expect(checkWritten('2,50', '2,50')).toBe('rett');
    expect(checkWritten('2.50', '2,50')).toBe('rett'); // a dot is fine
  });

  it('rejects the right value written to the wrong precision', () => {
    // The whole reason this step exists. `2,5` is the same number and a
    // different claim, and grading on value alone would accept it.
    expect(checkWritten('2,5', '2,50')).toBe('stafir');
    expect(checkWritten('2,500', '2,50')).toBe('stafir');
  });

  it('rejects a wrong value', () => {
    expect(checkWritten('2,60', '2,50')).toBe('gildi');
    expect(checkWritten('25,0', '2,50')).toBe('gildi');
  });

  it('rejects 0, double, half and nonsense on every rounding item', () => {
    // The general rule this repo encoded after Sýrufastinn: assert the
    // property, do not trust the comparison mode.
    for (const item of ROUND_ITEMS) {
      expect(checkWritten('0', item.answer), `${item.id} accepts 0`).not.toBe('rett');
      expect(
        checkWritten(String(item.value * 2), item.answer),
        `${item.id} accepts double`
      ).not.toBe('rett');
      expect(checkWritten(String(item.value / 2), item.answer), `${item.id} accepts half`).not.toBe(
        'rett'
      );
      expect(checkWritten('', item.answer), `${item.id} accepts empty`).not.toBe('rett');
      expect(checkWritten('abc', item.answer), `${item.id} accepts letters`).not.toBe('rett');
    }
  });

  it('accepts every item own answer, so the set is playable to the end', () => {
    for (const item of ROUND_ITEMS) {
      expect(checkWritten(item.answer, item.answer), item.id).toBe('rett');
    }
  });
});
