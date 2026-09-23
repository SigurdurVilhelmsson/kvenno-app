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
    // `60` claims one figure by rule 4; written plainly it needs a trailing
    // comma, so the printed answer uses the power of ten.
    expect(r5.answer).toContain('×');
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

/** Digits and an optional power of ten, as the two fields submit them. */
const w = (mantissa: string, exponent = '') => ({ mantissa, exponent });
const item = (id: string) => ROUND_ITEMS.find((i) => i.id === id)!;
const R3 = { value: 2.5, figures: 3 }; // answer 2,50

describe('checkWritten — grading a written answer', () => {
  it('accepts the exact written form', () => {
    expect(checkWritten(w('2,50'), R3)).toBe('rett');
    expect(checkWritten(w('2.50'), R3)).toBe('rett'); // a dot is fine
  });

  it('rejects the right value written to the wrong precision', () => {
    // The whole reason this step exists. `2,5` is the same number and a
    // different claim, and grading on value alone would accept it.
    expect(checkWritten(w('2,5'), R3)).toBe('stafir');
    expect(checkWritten(w('2,500'), R3)).toBe('stafir');
  });

  it('rejects a wrong value', () => {
    expect(checkWritten(w('2,60'), R3)).toBe('gildi');
    // Right digits, comma in the wrong place: its own diagnosis, still wrong.
    expect(checkWritten(w('25,0'), R3)).toBe('veldi');
  });

  it('rejects 0, double, half and nonsense on every rounding item', () => {
    // The general rule this repo encoded after Sýrufastinn: assert the
    // property, do not trust the comparison mode. Double and half are of the
    // ROUNDED answer and written to the asked-for precision, so only the value
    // can fail them. The shipped version of this test doubled the raw value,
    // which is wrong on rounding alone and so proved nothing.
    for (const it of ROUND_ITEMS) {
      const wanted = Number(it.value.toPrecision(it.figures));
      const as = (v: number) => {
        const [digits, power] = v.toExponential(it.figures - 1).split('e');
        return w(digits.replace('.', ','), power);
      };
      expect(checkWritten(w('0'), it), `${it.id} accepts 0`).not.toBe('rett');
      expect(checkWritten(as(wanted * 2), it), `${it.id} accepts double`).not.toBe('rett');
      expect(checkWritten(as(wanted / 2), it), `${it.id} accepts half`).not.toBe('rett');
      expect(checkWritten(w(''), it), `${it.id} accepts empty`).not.toBe('rett');
      expect(checkWritten(w('abc'), it), `${it.id} accepts letters`).not.toBe('rett');
      expect(checkWritten(w('NaN'), it), `${it.id} accepts NaN`).not.toBe('rett');
      // And the right answer, written the same way, is accepted — so the
      // rejections above are the value's doing and not the format's.
      expect(checkWritten(as(wanted), it), `${it.id} rejects its own answer`).toBe('rett');
    }
  });

  it('accepts every item own answer, typed the way the screen asks', () => {
    // The digits in one field, the power in the other. The shipped test fed
    // the printed `6,0 × 10¹` back into itself as one string, and both sides
    // read it as 6 — which is exactly the defect it was there to catch.
    for (const it of ROUND_ITEMS) {
      const [digits, power] = it.answer.includes('×')
        ? [it.answer.split('×')[0].trim(), String(Math.floor(Math.log10(it.value)))]
        : [it.answer, ''];
      expect(checkWritten(w(digits, power), it), it.id).toBe('rett');
    }
  });
});

describe('r5 — sixty to two significant figures', () => {
  const r5 = item('r5');

  it('marks the digits alone wrong: 6,0 is a tenth of the answer', () => {
    // The shipped grader read the expected `6,0 × 10¹` with parseStudentNumber,
    // which stops at the `×`, and so marked `6,0` correct for sixty.
    expect(checkWritten(w('6,0'), r5)).toBe('veldi');
    expect(checkWritten(w('6'), r5)).not.toBe('rett');
  });

  it('accepts every correct form a phone decimal keypad can type', () => {
    expect(checkWritten(w('6,0', '1'), r5)).toBe('rett');
    expect(checkWritten(w('6.0', '1'), r5)).toBe('rett');
    expect(checkWritten(w('0,60', '2'), r5)).toBe('rett');
    // Rule 4, which the game teaches with 1200, and 4500, — a written comma
    // makes the trailing zero count, so this is two figures and sixty.
    expect(checkWritten(w('60,'), r5)).toBe('rett');
    expect(checkWritten(w('60.'), r5)).toBe('rett');
  });

  it('accepts e notation typed on a full keyboard', () => {
    expect(checkWritten(w('6,0e1'), r5)).toBe('rett');
    expect(checkWritten(w('6.0E1'), r5)).toBe('rett');
  });

  it('names the precision mistake, not the rounding, for sixty to one or three figures', () => {
    expect(checkWritten(w('60'), r5)).toBe('stafir'); // rule 4: one figure
    expect(checkWritten(w('60,0'), r5)).toBe('stafir');
    expect(checkWritten(w('6', '1'), r5)).toBe('stafir');
    expect(checkWritten(w('6,00', '1'), r5)).toBe('stafir');
  });

  it('refuses a power typed into the digits field instead of half-reading it', () => {
    // parseFloat would read `6,0 × 10²` as 6, and with a 1 in the power field
    // that is sixty — a wrong answer graded right.
    expect(checkWritten(w('6,0 × 10²', '1'), r5)).toBe('ogilt');
    expect(checkWritten(w('6,0x10^1'), r5)).toBe('ogilt');
    expect(checkWritten(w('6,0', '1,5'), r5)).toBe('ogilt');
    expect(checkWritten(w('6,0e1', '1'), r5)).toBe('ogilt'); // a power in both fields
  });
});

describe('the other items take scientific notation too', () => {
  it('accepts each answer written as digits and a power of ten', () => {
    expect(checkWritten(w('1,2', '3'), item('r1'))).toBe('rett');
    expect(checkWritten(w('4,57', '-3'), item('r2'))).toBe('rett');
    expect(checkWritten(w('4,57', '\u22123'), item('r2'))).toBe('rett'); // a typographic minus
    expect(checkWritten(w('2,50', '0'), item('r3'))).toBe('rett');
    expect(checkWritten(w('9,88', '4'), item('r4'))).toBe('rett');
  });

  it('still counts the figures on the digits', () => {
    expect(checkWritten(w('1,20', '3'), item('r1'))).toBe('stafir');
    expect(checkWritten(w('4,6', '-3'), item('r2'))).toBe('gildi'); // wrong rounding
  });

  it('rejects a near-miss rounding that a tolerance would accept', () => {
    // Why gradeScientific's value check is not reused: its 2 % default would
    // accept 0,00456 for 0,00457.
    expect(checkWritten(w('0,00456'), item('r2'))).toBe('gildi');
    expect(checkWritten(w('98700'), item('r4'))).toBe('gildi');
  });
});
