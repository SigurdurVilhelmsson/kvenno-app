import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { FormulaText, splitExpression } from '../components/FormulaText';
import { questions } from '../data';

/**
 * The hints and worked solutions write substitutions without spaces
 * (`V = (0,15)(0,08206)(310)/(1,0)`), so on a phone the browser split them wherever the
 * line ran out, including inside a number. `FormulaText` offers a break between factors
 * and after a slash instead, and changes nothing else.
 */
describe('splitExpression', () => {
  it('breaks between bracketed factors and after a slash', () => {
    expect(splitExpression('V = (0,15)(0,08206)(310)/(1,0)')).toEqual([
      'V = (0,15)',
      '(0,08206)',
      '(310)/',
      '(1,0)',
    ]);
    expect(splitExpression('n = (0,74)(10,0)/[(0,08206)(300)]')).toEqual([
      'n = (0,74)',
      '(10,0)/',
      '[(0,08206)',
      '(300)]',
    ]);
  });

  it('leaves text without factors alone', () => {
    expect(splitExpression('Byrja á PV = nRT')).toEqual(['Byrja á PV = nRT']);
    expect(splitExpression('')).toEqual(['']);
  });

  it('never splits inside a number, in any hint or solution the game ships', () => {
    for (const q of questions) {
      const texts = [
        ...q.hints,
        ...q.solution.steps,
        q.solution.formula,
        q.solution.substitution,
        q.solution.calculation,
      ];
      for (const text of texts) {
        const parts = splitExpression(text);
        expect(parts.join(''), `question ${q.id}`).toBe(text);
        for (let i = 1; i < parts.length; i++) {
          const before = parts[i - 1].slice(-1);
          const after = parts[i][0];
          expect(/[\d,]/.test(before) && /[\d,]/.test(after), `question ${q.id}: ${text}`).toBe(
            false
          );
        }
      }
    }
  });
});

describe('FormulaText', () => {
  it('renders the text unchanged with a break opportunity between factors', () => {
    const text = 'P = (0,30 mol)(0,08206 L·atm/mol·K)(298 K) / (2,0 L)';
    const { container } = render(
      <p>
        <FormulaText text={text} />
      </p>
    );
    expect(container.textContent).toBe(text);
    // Between `mol)` and `(0,08206`, after `atm/`, and between `K)` and `(298`.
    expect(container.querySelectorAll('wbr')).toHaveLength(3);
  });
});
