// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';
import { LEWIS_SIZES } from '../utils/lewisLayout';

/**
 * One way to draw a Lewis structure — ruled 2026-09-30 (docs/REVIEW-QUEUE.md C6).
 *
 * The game drew a molecule five ways: coloured balls on the Stig 2 board, the
 * shared ball-and-stick renderer in CPK colours (bent, with a legend describing
 * the board's colours) after a correct drawing, no lone pairs in the
 * walkthrough, a single atom with its bonds stacked on one side in Stig 3 —
 * water's O read as a double bond — and resonance forms as monospace text.
 *
 * Every screen now draws from `utils/lewisLayout.ts` with the pen in
 * `components/LewisStructure.tsx`: element symbols, bond lines, dots in pairs,
 * circled formal charges. These tests hold each screen to that.
 *
 * Queries are scoped to each rendered container, since the suite runs with retries.
 */

afterEach(cleanup);
clockPastNextGuard();

/** No atom is a ball: the only circles are electron dots and circled formal charges. */
function expectBookPen(svg: Element) {
  for (const c of svg.querySelectorAll('circle')) {
    const r = Number(c.getAttribute('r'));
    const isDot = r === LEWIS_SIZES.dotRadius;
    const isCharge = c.closest('[data-formal-charge]') !== null;
    expect(isDot || isCharge, `circle r=${r}`).toBe(true);
  }
}

const dotsOf = (svg: Element) =>
  [...svg.querySelectorAll('circle')].filter(
    (c) => Number(c.getAttribute('r')) === LEWIS_SIZES.dotRadius
  );
const symbolsOf = (svg: Element) => [...svg.querySelectorAll('text')].map((t) => t.textContent);

describe('Stig 2: the board and the structure shown after it agree', () => {
  it('draws H₂O the same way before and after Athuga', () => {
    const { container } = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(container);
    for (const name of [/^Tengi 1 af 2/, /^Tengi 2 af 2/]) {
      fireEvent.click(ui.getByRole('button', { name }));
    }
    const plus = ui.getByRole('button', { name: 'Bæta stöku pari við O (miðatóm)' });
    fireEvent.click(plus);
    fireEvent.click(plus);

    const board = container.querySelector('svg[aria-label^="Teikniborð"]')!;
    expectBookPen(board);
    // Dot offsets from the central symbol, rounded, as a set.
    const offsets = (svg: Element) => {
      const o = [...svg.querySelectorAll('text')].find((t) => t.textContent === 'O')!;
      const ox = Number(o.getAttribute('x'));
      const oy = Number(o.getAttribute('y'));
      return dotsOf(svg)
        .map(
          (d) =>
            `${Math.round(Number(d.getAttribute('cx')) - ox)},${Math.round(Number(d.getAttribute('cy')) - oy)}`
        )
        .sort();
    };
    const onBoard = offsets(board);

    fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));
    const shown = ui.getByRole('img', { name: 'Lewis-formúla fyrir H₂O' });
    expect(shown.hasAttribute('data-lewis-structure')).toBe(true);
    expectBookPen(shown);
    expect(symbolsOf(shown).sort()).toEqual(['H', 'H', 'O']);
    // Before: a bent CPK molecule with grey pairs in a different place.
    expect(offsets(shown)).toEqual(onBoard);
    expect(container.querySelector('.animated-molecule')).toBeNull();
    // The legend describes what is drawn, not the board's old colours.
    expect(container.textContent).not.toContain('Miðatóm');
    expect(container.textContent).not.toContain('Ytri atóm');
  });
});

/** Stig 3's right answers, in question order (as option-order.test.tsx has them). */
const CORRECT = [
  'FC = Gildisraf. - (óbundnar + ½ bundnar)',
  '0',
  '+1',
  ':C≡O: með þreföldum tengslum',
  '2 formúlur',
  '3 formúlur',
];

function renderLevel3() {
  const { container } = render(<Level3 onComplete={vi.fn()} onBack={vi.fn()} />);
  const ui = within(container);
  const answer = (text: string) => {
    const option = [...container.querySelectorAll('button')].find(
      (b) => b.querySelector('span')?.textContent === text
    );
    fireEvent.click(option!);
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
  };
  const next = () => fireEvent.click(ui.getByRole('button', { name: /Næsta þraut/ }));
  const structures = () => [...container.querySelectorAll('svg[data-lewis-structure]')];
  return { container, ui, answer, next, structures };
}

describe('Stig 3 draws whole molecules', () => {
  it('draws water with both hydrogens and two single bonds, not one double bar', () => {
    const l = renderLevel3();
    l.answer(CORRECT[0]);
    l.next();
    const [water] = l.structures();
    expectBookPen(water);
    expect(symbolsOf(water).sort()).toEqual(['H', 'H', 'O']);
    expect(water.querySelectorAll('line')).toHaveLength(2);
    expect(dotsOf(water)).toHaveLength(4);
  });

  it('holds back the formal charge it asks for until the answer is in', () => {
    const l = renderLevel3();
    l.answer(CORRECT[0]);
    l.next();
    l.answer(CORRECT[1]);
    l.next();
    const ammonium = () => l.structures()[0];
    expect(symbolsOf(ammonium()).filter((s) => s === 'H')).toHaveLength(4);
    expect(ammonium().querySelector('[data-formal-charge]')).toBeNull();
    l.answer(CORRECT[2]);
    expect(ammonium().querySelector('[data-formal-charge="1"]')).not.toBeNull();
  });

  it('draws both CO structures with their lone pairs, so the octet can be counted', () => {
    const l = renderLevel3();
    for (let q = 0; q < 3; q++) {
      l.answer(CORRECT[q]);
      l.next();
    }
    const [triple, double] = l.structures();
    for (const s of [triple, double]) expectBookPen(s);
    expect(triple.querySelectorAll('line')).toHaveLength(3);
    expect(double.querySelectorAll('line')).toHaveLength(2);
    // C and O share 10 valence electrons: 6 or 4 in the bond, the rest in pairs.
    expect(dotsOf(triple)).toHaveLength(4);
    expect(dotsOf(double)).toHaveLength(6);
  });

  it('draws the resonance forms, and only once the count is answered', () => {
    const l = renderLevel3();
    for (let q = 0; q < 4; q++) {
      l.answer(CORRECT[q]);
      l.next();
    }
    expect(l.structures()).toHaveLength(0);
    l.answer(CORRECT[4]);
    const forms = l.structures();
    expect(forms).toHaveLength(2);
    for (const f of forms) {
      expectBookPen(f);
      expect(f.querySelector('[data-ion-bracket]')).not.toBeNull();
    }
    l.next();
    l.answer(CORRECT[5]);
    expect(l.structures()).toHaveLength(3);
  });
});
