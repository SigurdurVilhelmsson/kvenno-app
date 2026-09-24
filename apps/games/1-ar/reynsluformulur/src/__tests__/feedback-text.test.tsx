import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AefaScreen } from '../components/AefaScreen';
import { BeitaScreen } from '../components/BeitaScreen';
import { KannaScreen } from '../components/KannaScreen';
import { ATOMIC_MASSES, type ElementSymbol } from '../data/elements';
import { COMPOUNDS, MOLECULAR_PROBLEMS, PROBLEMS } from '../data/problems';
import { deriveEmpirical } from '../engine/empirical';

/**
 * What the game says about a student's answer, and about the compound on
 * screen, has to be true of it. Each block here was a sentence that was not:
 *
 *  - Beita built "your n gave …" from a fractional n by rounding each subscript
 *    on its own, but the mass from n rounded once. At n = 1,5 on hydrogen
 *    peroxide it printed the right formula at exactly the measured mass and
 *    called it wrong.
 *  - Kanna named the first element in the formula as the one with "the most
 *    atoms" when two tied — H₂O₂, the compound it opens on, and NaCl.
 *  - Æfa's verdict pasted `súlan` onto the column label, which put two of the
 *    three compounds in the wrong case.
 */

const SUBSCRIPT_DIGITS = '₀₁₂₃₄₅₆₇₈₉';
const comma = (n: number, dp: number) => n.toFixed(dp).replace('.', ',');

/** `H₃O₃` -> its molar mass, from the same table the game uses. */
function massOf(formula: string): number {
  let total = 0;
  for (const [, symbol, digits] of formula.matchAll(/([A-Z][a-z]?)([₀-₉]*)/g)) {
    const count = digits ? Number([...digits].map((d) => SUBSCRIPT_DIGITS.indexOf(d)).join('')) : 1;
    total += ATOMIC_MASSES[symbol as ElementSymbol] * count;
  }
  return total;
}

beforeEach(() => {
  window.scrollBy = vi.fn() as unknown as typeof window.scrollBy;
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Beita: the line about the student’s own n', () => {
  /** Render Beita on problem `index` and submit `entry`; the verdict's text. */
  function answer(index: number, entry: string): string {
    const { unmount } = render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
    for (let i = 0; i < index; i++) {
      fireEvent.change(screen.getByLabelText('n ='), {
        target: { value: String(MOLECULAR_PROBLEMS[i].n) },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Svara' }));
      fireEvent.click(screen.getByRole('button', { name: 'Næsta dæmi' }));
    }
    fireEvent.change(screen.getByLabelText('n ='), { target: { value: entry } });
    fireEvent.click(screen.getByRole('button', { name: 'Svara' }));
    const text = screen.getByText(/Ekki alveg|Rétt/).parentElement!.textContent ?? '';
    unmount();
    return text;
  }

  const OWN_N = /Þitt n gaf (\S+), sem hefur mólmassa ([\d,]+) g\/mól/;

  it('does not call the right formula wrong when n = 1,5 rounds back onto it', () => {
    const problem = MOLECULAR_PROBLEMS.find((p) => p.id === 'vetnisperoxid-sameind')!;
    const text = answer(MOLECULAR_PROBLEMS.indexOf(problem), '1,5');

    expect(text).toMatch(/Ekki alveg/);
    expect(text).not.toMatch(/Þitt n gaf/);
  });

  it('for every problem and every entry, the formula it names has the mass it prints', () => {
    MOLECULAR_PROBLEMS.forEach((problem, index) => {
      for (const entry of ['1', '3', '1,5', '2,3', '0,5', String(problem.n * 2)]) {
        if (Number(entry.replace(',', '.')) === problem.n) continue;
        const text = answer(index, entry);
        const match = text.match(OWN_N);
        if (!match) continue;
        const [, formula, printed] = match;

        const where = `${problem.name}, n = ${entry}: ${formula}`;
        expect(formula, where).not.toBe(problem.answer);
        expect(printed, where).not.toBe(comma(problem.molarMass, 2));
        expect(printed, where).toBe(comma(massOf(formula), 2));
      }
    });
  });

  it('still explains a whole n that is wrong', () => {
    const text = answer(0, '3');
    expect(text).toMatch(OWN_N);
    expect(text).toContain('Þitt n gaf H₃O₃, sem hefur mólmassa 51,02 g/mól');
  });

  it('never names a formula it cannot write, however large the n', () => {
    // `1e21` parses as a whole number but prints in exponent form. The
    // subscript writer has no glyph for `e` or `+` and drops them, so the line
    // used to read H₁₂₁O₁₂₁ at a mass printed as 1,7007e+22.
    for (const entry of ['1e21', '1000000000000000000000', '1000000']) {
      const text = answer(0, entry);
      expect(text, `n = ${entry}`).not.toMatch(/e\+|undefined|NaN/);
      const match = text.match(OWN_N);
      if (match) expect(match[2], `n = ${entry}: ${match[1]}`).toBe(comma(massOf(match[1]), 2));
    }
  });

  it('says nothing about a fractional n, which builds no formula', () => {
    MOLECULAR_PROBLEMS.forEach((_, index) => {
      for (const entry of ['1,5', '2,3', '0,5']) {
        expect(answer(index, entry), `problem ${index + 1}, n = ${entry}`).not.toMatch(
          /Þitt n gaf/
        );
      }
    });
  });
});

describe('Kanna: which element has the most atoms', () => {
  it.each(COMPOUNDS.map((c) => [c.name, c] as const))('%s', (name, compound) => {
    render(<KannaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name }));
    const note = screen.getByText(
      /Prósentan segir þér ekki fjöldann|Hér fer það saman/
    ).textContent!;

    const most = Math.max(...compound.counts.map((c) => c.subscript));
    const leaders = compound.counts.filter((c) => c.subscript === most).map((c) => c.element);

    const claimed = note.match(/(?:en|: )\s*([A-Z][a-z]?) á (?:bæði .* og )?flestar frumeindirnar/);
    if (claimed) {
      expect(leaders, `${name}: "${note}"`).toEqual([claimed[1]]);
    }
    if (leaders.length > 1) {
      expect(note, name).toContain('jafnmargar frumeindir');
      for (const element of leaders) expect(note, name).toContain(element);
    }
  });

  it('the compound it opens on, H₂O₂, ties H and O', () => {
    render(<KannaScreen onComplete={() => {}} onBack={() => {}} />);
    expect(screen.getByText(/Prósentan segir/).textContent).toContain(
      'en H og O eiga jafnmargar frumeindir.'
    );
  });
});

describe('Æfa: the verdict names the column that went wrong', () => {
  it('in the right form for each of the three columns', () => {
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    const derived = deriveEmpirical(
      Object.fromEntries(PROBLEMS[0].percentages.map((p) => [p.element, p.percent]))
    );
    const columns = [
      ['moles', 'Mól', 'Mólsúlan'],
      ['ratio', 'Hlutfall', 'Hlutfallssúlan'],
      ['subscript', 'Vísitala', 'Vísitölusúlan'],
    ] as const;

    for (const [key, label, heading] of columns) {
      for (const r of derived.rows) {
        fireEvent.change(screen.getByLabelText(`${label} fyrir ${r.element}`), {
          target: { value: '0' },
        });
      }
      fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
      expect(screen.getByText(/^Ekki alveg — /).textContent).toBe(`Ekki alveg — ${heading}`);

      for (const r of derived.rows) {
        fireEvent.change(screen.getByLabelText(`${label} fyrir ${r.element}`), {
          target: { value: String(r[key]).replace('.', ',') },
        });
      }
      fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
      fireEvent.click(screen.getByRole('button', { name: /Næsta súla|Næsta efni/ }));
    }
  });
});
