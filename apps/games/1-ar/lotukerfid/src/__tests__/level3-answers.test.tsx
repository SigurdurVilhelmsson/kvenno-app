import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Level3, generateQuestions } from '../components/Level3';
import { ELEMENTS } from '../data/elements';

/**
 * Stig 3 grades the number the student typed, and writes its questions in
 * Icelandic that agrees with itself.
 *
 * Until 2026-09-23 the grader read its field with `parseInt`, which stops at
 * the first character it cannot use: `6.5` graded as `6`, so a non-whole
 * count of protons was marked right. And the templates dropped the element's
 * nominative name where the sentence needed another case — `Sætistala
 * Brennisteinn er 16, þannig að það hefur …`, where the genitive is
 * `brennisteins` and `það` agrees with no masculine name.
 */

function questionText(): string {
  return document.querySelector('p.text-lg.font-bold')?.textContent ?? '';
}

/** The answer to a numeric question, read back from its own text. */
function answerTo(text: string): number | null {
  const m = text.match(/\(([A-Z][a-z]?)(?:-(\d+))?\)/);
  if (!m) return null;
  const el = ELEMENTS.find((e) => e.symbol === m[1])!;
  if (/nifteindir/.test(text)) return Number(m[2]) - el.atomicNumber;
  return el.atomicNumber;
}

describe('Stig 3 grader', () => {
  it('marks a non-whole count wrong instead of reading its integer part', () => {
    render(<Level3 onBack={() => {}} onComplete={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja æfingar/ }));

    let checked = 0;
    for (let i = 0; i < 8; i++) {
      const input = screen.queryByPlaceholderText('t.d. 12');
      if (input) {
        const answer = answerTo(questionText());
        expect(answer, questionText()).not.toBeNull();
        fireEvent.change(input, { target: { value: `${answer}.5` } });
        fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
        expect(screen.getByRole('alert').textContent, `${answer}.5`).toMatch(/Rangt/);
        checked++;
      } else {
        fireEvent.click(screen.getByRole('button', { name: /\(H\), sætistala 1,/ }));
      }
      fireEvent.click(screen.getByRole('button', { name: /Næsta spurning|Sjá niðurstöður/ }));
    }
    expect(checked).toBe(6);
  });

  it('still marks the whole number right', () => {
    render(<Level3 onBack={() => {}} onComplete={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja æfingar/ }));
    for (let i = 0; i < 8; i++) {
      const input = screen.queryByPlaceholderText('t.d. 12');
      if (input) {
        fireEvent.change(input, { target: { value: String(answerTo(questionText())) } });
        fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
        expect(screen.getByRole('alert').textContent).toMatch(/Rétt/);
        return;
      }
      fireEvent.click(screen.getByRole('button', { name: /\(H\), sætistala 1,/ }));
      fireEvent.click(screen.getByRole('button', { name: /Næsta spurning|Sjá niðurstöður/ }));
    }
    throw new Error('no numeric question in the run');
  });

  it('does not grade an empty field', () => {
    render(<Level3 onBack={() => {}} onComplete={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja æfingar/ }));
    for (let i = 0; i < 8; i++) {
      const input = screen.queryByPlaceholderText('t.d. 12');
      if (input) {
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(screen.queryByRole('alert')).toBeNull();
        return;
      }
      fireEvent.click(screen.getByRole('button', { name: /\(H\), sætistala 1,/ }));
      fireEvent.click(screen.getByRole('button', { name: /Næsta spurning|Sjá niðurstöður/ }));
    }
    throw new Error('no numeric question in the run');
  });
});

describe('Stig 3 templates', () => {
  const questions = Array.from({ length: 300 }, () => generateQuestions()).flat();

  it('covers every element in the pool', () => {
    const pool = ELEMENTS.filter((e) => e.period <= 4);
    const seen = new Set(questions.map((q) => q.element.symbol));
    expect(seen.size).toBe(pool.length);
  });

  it('never puts a nominative name after `Sætistala`, nor `það` for an element', () => {
    for (const q of questions) {
      for (const text of [q.text, q.explanation]) {
        expect(text, text).not.toMatch(new RegExp(`Sætistala ${q.element.name}`, 'i'));
        expect(text, text).not.toMatch(/þannig að það hefur/);
      }
    }
  });

  it('does not wedge a name between `hlutlaust` and `atóm`', () => {
    for (const q of questions.filter((x) => x.type === 'electrons')) {
      expect(q.text).not.toMatch(/hlutlaust \S+ \([A-Z][a-z]?\) atóm/);
    }
  });

  /**
   * A number ending in 1, other than 11, takes a singular noun in Icelandic:
   * `1 róteind`, `21 róteind`, `11 róteindir`. Until 2026-09-23 every template
   * wrote the plural, so vetni, skandíum and gallíum read `1 róteindir`,
   * `21 róteindir`, `31 rafeindir`.
   */
  it('agrees each count with its noun in number', () => {
    let singulars = 0;
    for (const q of questions) {
      for (const text of [q.text, q.explanation]) {
        for (const m of text.matchAll(/(\d+) (róteind|rafeind|nifteind)(ir)?(?!\p{L})/gu)) {
          const n = Number(m[1]);
          const singular = n % 10 === 1 && n % 100 !== 11;
          expect(m[3] === undefined, `${m[0]} in: ${text}`).toBe(singular);
          if (singular) singulars++;
        }
      }
    }
    // The pool holds Z = 1, 21 and 31, so the singular must actually be met.
    expect(singulars).toBeGreaterThan(0);
  });
});
