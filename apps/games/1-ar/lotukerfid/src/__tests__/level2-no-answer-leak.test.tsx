import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Level2, generateQuestions } from '../components/Level2';
import { ELEMENTS } from '../data/elements';

/**
 * B15: "every Level 2 question is answerable from the reference table rendered
 * beneath it". The table stays — it is how a student locates an element — but
 * the datum the current question asks about is masked until they commit to an
 * answer, then revealed so they can check themselves.
 */

/** The prompt paragraph in the question card. */
function prompt(): string {
  return document.querySelector('.text-lg.sm\\:text-xl.font-bold')?.textContent ?? '';
}

function periodicGrid() {
  return screen.getByRole('grid', { name: 'Lotukerfið' });
}

function optionButtons() {
  return screen.getAllByRole('button').filter((b) => b.className.includes('rounded-xl border-2'));
}

describe('Lotukerfið Level 2 does not answer its own questions', () => {
  it('masks the datum under test until the student has answered', () => {
    render(<Level2 onBack={() => {}} onComplete={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja æfingar/ }));

    const seen = { classify: false, group: false, order: false };

    for (let i = 0; i < 10; i++) {
      const text = prompt();
      const isClassify = /málmur, málmleysingi eða hálfmálmur/.test(text);
      const isGroup = /Hvað er sameiginlegt/.test(text);
      const orderMatch = text.match(/Raðaðu (.+) eftir vaxandi frumeindamassa/);

      if (isClassify || isGroup) {
        seen.classify ||= isClassify;
        seen.group ||= isGroup;
        // The legend spells out every category name, and each cell carries a
        // two-letter category badge. Neither may be on screen.
        expect(screen.queryByText(/Al — Alkalímálmar/)).toBeNull();
        expect(within(periodicGrid()).queryByText('Eð')).toBeNull();
      }

      if (orderMatch) {
        seen.order = true;
        for (const name of orderMatch[1].split(',').map((n) => n.trim())) {
          const el = ELEMENTS.find((e) => e.name === name);
          expect(el, `unknown element name in prompt: ${name}`).toBeDefined();
          const mass = el!.atomicMass.toFixed(1);
          expect(
            within(periodicGrid()).queryByText(mass),
            `mass ${mass} for ${el!.symbol} is readable before the student answers`
          ).toBeNull();
        }
      }

      fireEvent.click(optionButtons()[0]);

      // Answered: the table is whole again.
      expect(screen.getByText(/Al — Alkalímálmar/)).toBeDefined();

      fireEvent.click(screen.getByRole('button', { name: /Næsta spurning|Sjá niðurstöður/ }));
    }

    // A run is 4 classify, 2 order, 2 group and 2 trend questions, so all
    // three masked types are certain to have appeared.
    expect(seen).toEqual({ classify: true, group: true, order: true });
  });

  it('never asks for an ordering that contradicts the rule it teaches', () => {
    // Ar(18) is heavier than K(19), and Co(27) than Ni(28), because atomic
    // mass is a weighted average over isotopes. With the masses masked such an
    // item would be unanswerable by the taught rule, so the generator must not
    // produce one.
    const bySymbol = new Map(ELEMENTS.map((e) => [e.symbol, e]));
    let orderQuestions = 0;

    for (let run = 0; run < 400; run++) {
      for (const q of generateQuestions()) {
        if (q.type !== 'order-by-mass') continue;
        orderQuestions++;
        const chosen = q.highlightSymbols
          .map((s) => bySymbol.get(s)!)
          .sort((a, b) => a.atomicNumber - b.atomicNumber);
        for (let i = 1; i < chosen.length; i++) {
          expect(
            chosen[i - 1].atomicMass <= chosen[i].atomicMass,
            `${chosen[i - 1].symbol} is heavier than ${chosen[i].symbol} despite the lower sætistala`
          ).toBe(true);
        }
      }
    }

    expect(orderQuestions).toBe(800);
  });
});
