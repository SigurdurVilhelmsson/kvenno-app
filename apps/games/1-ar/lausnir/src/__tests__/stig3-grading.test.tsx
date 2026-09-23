import { createElement } from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { parseStudentNumber } from '@shared/utils';

import { Level3 } from '../components/Level3';
import { StepBySolution } from '../components/StepBySolution';
import type { Difficulty, Problem } from '../types';
import { generateProblem } from '../utils/problem-generator';
import { checkAnswer, validateInput } from '../utils/validation';

/**
 * Stig 3 grades at a 2 % relative tolerance, so the answer it grades against
 * has to be the value the question's own numbers give.
 *
 * **Why this exists.** Every generator stored a rounded answer: three decimals
 * for a molarity, and two significant figures — up to 5 % off — for the mass in
 * `massFromMolarity`. About one mass problem in eight then marked the exact
 * answer wrong (`333 mL af 1,1 M HCl`, 36,5 g/mol: 13,37 g, graded against 13),
 * and a dilution to 0,0154 M was graded against 0,015. The student is only ever
 * shown the question, so the exact value is recomputed here from the numbers
 * the question prints — not from the generator's internals.
 */

afterEach(cleanup);

const RUNS = 1500;
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

const num = (text: string) => parseStudentNumber(text);

/** The answer, worked out from what the question says and nothing else. */
function exactFromQuestion(p: Problem): number {
  const q = p.question;
  const need = (re: RegExp) => {
    const m = q.match(re);
    if (!m) throw new Error(`${p.type}: cannot read "${q}"`);
    return m;
  };
  switch (p.type) {
    case 'dilution': {
      if (p.unit === 'M') {
        const [, v1, m1, v2] = need(/með (\d+) mL af ([\d,]+) M .*? verður (\d+) mL/);
        return (num(m1) * num(v1)) / num(v2);
      }
      const [, v2, m2, m1] = need(/útbúa (\d+) mL af ([\d,]+) M .*? þynna ([\d,]+) M/);
      return (num(m2) * num(v2)) / num(m1);
    }
    case 'molarity': {
      const [, moles, litres] = need(/leysir ([\d,]+) mól af .*? í ([\d,]+) L/);
      return num(moles) / num(litres);
    }
    case 'molarityFromMass': {
      const [, g, mm, mL] = need(/leysir ([\d,]+) g af .*?\(mólmassi ([\d,]+) g\/mól\) í (\d+) mL/);
      return num(g) / num(mm) / (num(mL) / 1000);
    }
    case 'massFromMolarity': {
      const [, mL, M, mm] = need(/með (\d+) mL af ([\d,]+) M .*?\(mólmassi ([\d,]+) g\/mól\)/);
      return (num(M) * num(mL) * num(mm)) / 1000;
    }
    case 'mixing': {
      const [, v1, m1, v2, m2] = need(
        /blandar (\d+) mL af ([\d,]+) M .*? með (\d+) mL af ([\d,]+) M/
      );
      return (num(m1) * num(v1) + num(m2) * num(v2)) / (num(v1) + num(v2));
    }
  }
}

/** The number a line ends on, before its unit: "M₂ = 0,0154 M" → 0.0154. */
function lastNumber(text: string): number {
  const all = text.match(/-?[\d]+(?:,\d+)?/g);
  if (!all) throw new Error(`no number in "${text}"`);
  return num(all[all.length - 1]);
}

describe('Stig 3 grades against the value its own question gives', () => {
  const batch = DIFFICULTIES.flatMap((d) => Array.from({ length: RUNS }, () => generateProblem(d)));

  it('covers every problem type', () => {
    const types = new Set(batch.map((p) => p.type));
    expect([...types].sort()).toEqual([
      'dilution',
      'massFromMolarity',
      'mixing',
      'molarity',
      'molarityFromMass',
    ]);
  });

  it('marks the exact answer correct', () => {
    const wrong = batch
      .filter((p) => !checkAnswer(exactFromQuestion(p), p.answer))
      .map((p) => `${p.type}: ${p.question} → graded against ${p.answer}`);
    expect(wrong.slice(0, 5), `${wrong.length} of ${batch.length}`).toEqual([]);
  });

  it('marks the value the last hint prints correct', () => {
    // The last hint gives the answer away; typing it back in must pass.
    for (const p of batch) {
      const shown = lastNumber(p.hints[2]);
      expect(checkAnswer(shown, p.answer), `${p.type}: ${p.hints[2]}`).toBe(true);
    }
  });

  it('marks the value the worked solution prints correct', () => {
    for (const p of batch.filter((_, i) => i % 10 === 0)) {
      const { container, unmount } = render(createElement(StepBySolution, { problem: p }));
      const svar = [...container.querySelectorAll('h4')].find((h) =>
        h.textContent?.startsWith('Svar:')
      );
      expect(svar, p.type).toBeDefined();
      const shown = lastNumber(svar!.textContent ?? '');
      expect(checkAnswer(shown, p.answer), `${p.type}: ${svar!.textContent}`).toBe(true);
      unmount();
    }
  });

  it('rejects 0, double, half and NaN', () => {
    expect(validateInput('0').valid).toBe(false);
    expect(validateInput('abc').valid).toBe(false);
    for (const p of batch) {
      expect(checkAnswer(0, p.answer), `${p.type} accepts 0`).toBe(false);
      expect(checkAnswer(p.answer * 2, p.answer), `${p.type} accepts double`).toBe(false);
      expect(checkAnswer(p.answer / 2, p.answer), `${p.type} accepts half`).toBe(false);
      expect(checkAnswer(Number.NaN, p.answer), `${p.type} accepts NaN`).toBe(false);
    }
  });
});

describe('a worked step reproduces the answer from the numbers it prints', () => {
  /**
   * A student who carries a printed intermediate forward has to land inside the
   * tolerance too. Printed at three decimals, a small amount of moles lost up to
   * 5 % — so the page's own next line did not follow from the one above it.
   */

  it('the worked solution: the moles it prints give the molarity it states', () => {
    // 1,5 g of CaCl₂ (111 g/mol) in 53 mL is 0,01351 mol. At three decimals the
    // page read "M = 0,014 mol ÷ 0,053 L" and then "0,255 M"; 0,014 ÷ 0,053 is
    // 0,264, which grades wrong.
    const problem: Problem = {
      id: 'cacl2',
      type: 'molarityFromMass',
      description: 'Reikna mólstyrk út frá massa',
      question: '',
      given: { massInGrams: 1.5, molarMass: 111, volumeInML: 53 },
      answer: 1.5 / 111 / 0.053,
      unit: 'M',
      difficulty: 'medium',
      hints: [],
    };
    const { container } = render(createElement(StepBySolution, { problem }));
    const line = [...container.querySelectorAll('p')]
      .map((p) => p.textContent ?? '')
      .find((t) => /^M = [\d,]+ mól ÷ [\d,]+ L$/.test(t));
    expect(line, 'no "M = … mól ÷ … L" line').toBeDefined();
    const [moles, litres] = line!.match(/\d+(?:,\d+)?/g)!.map(num);
    expect(checkAnswer(moles / litres, problem.answer), line).toBe(true);
  });

  it('the hints: the moles the second prints give the answer the third states', () => {
    const wrong: string[] = [];
    let checked = 0;
    for (const d of DIFFICULTIES) {
      for (let i = 0; i < 20000; i++) {
        const p = generateProblem(d);
        let carried: number;
        if (p.type === 'molarityFromMass') {
          const m = p.hints[1].match(/= ([\d,]+); L = \d+\/1000 = ([\d,]+)$/);
          if (!m) throw new Error(`cannot read "${p.hints[1]}"`);
          carried = num(m[1]) / num(m[2]);
        } else if (p.type === 'massFromMolarity') {
          const m = p.hints[1].match(/= ([\d,]+)$/);
          if (!m) throw new Error(`cannot read "${p.hints[1]}"`);
          carried = num(m[1]) * p.given.molarMass;
        } else continue;
        checked++;
        if (!checkAnswer(carried, p.answer)) wrong.push(`${p.hints[1]} | ${p.hints[2]}`);
      }
    }
    expect(checked).toBeGreaterThan(10000);
    expect(wrong.slice(0, 5), `${wrong.length} of ${checked}`).toEqual([]);
  });
});

describe('Stig 3 screen', () => {
  /** The text of the question on screen. */
  function question(): string {
    const el = document.querySelector('p.text-lg.text-warm-800');
    expect(el, 'no question on screen').not.toBeNull();
    return el!.textContent ?? '';
  }

  /** Answer every problem (with "1", right or wrong) and return the questions. */
  function playThrough(): string[] {
    const seen: string[] = [];
    for (let i = 0; i < 8; i++) {
      seen.push(question());
      fireEvent.change(screen.getByPlaceholderText('0,000'), { target: { value: '1' } });
      fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
      fireEvent.click(screen.getByRole('button', { name: /Næsta dæmi|Sjá niðurstöður/ }));
    }
    return seen;
  }

  it('"Reyna aftur" deals a new set, not the one whose solutions were just shown', () => {
    render(<Level3 onComplete={() => {}} onBack={() => {}} />);
    const first = playThrough();
    fireEvent.click(screen.getByRole('button', { name: 'Reyna aftur' }));
    const second = playThrough();
    expect(second).toHaveLength(8);
    expect(second).not.toEqual(first);
  });

  it('draws "Athuga" while it is disabled', () => {
    // It was white text on no background at 40 % opacity: invisible on the
    // white card, so a student saw only the hint button until they typed.
    render(<Level3 onComplete={() => {}} onBack={() => {}} />);
    const athuga = screen.getByRole('button', { name: 'Athuga' }) as HTMLButtonElement;
    expect(athuga.disabled).toBe(true);
    expect(athuga.className).toMatch(/\bdisabled:bg-\S+/);
    expect(athuga.className).toMatch(/\bdisabled:text-\S+/);
  });
});
