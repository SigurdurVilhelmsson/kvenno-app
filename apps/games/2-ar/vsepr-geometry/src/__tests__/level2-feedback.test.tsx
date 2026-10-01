// @vitest-environment jsdom
import { fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  advanceTo,
  answerAngle,
  answerCount,
  check,
  next,
  playMolecule,
  POOL,
  startLevel2,
} from './level2-play';
import { clockPastNextGuard } from './next-guard-clock';

/**
 * What Stig 2 tells a student, step by step. Each of these was wrong:
 *
 *  - a wrong count said "Rangt — Sjáðu rétt svar hér að ofan" and showed no
 *    correct count anywhere;
 *  - the count hint derived valence electrons as bonding pairs + 2 × lone
 *    pairs, which told the student carbon in CO₂ has 2;
 *  - a single lone pair was "1 stök pör", and `með` took the accusative;
 *  - the explanation prompt read "hefur ferflötungur lögun";
 *  - XeF₄ said its lone pairs shrink the angle, where the two sit opposite and
 *    the angle stays 90°;
 *  - three Lewis sketches joined a lone pair to the atom with a bond stroke,
 *    so counting strokes gave the wrong number of bonding pairs.
 *
 * Queries are scoped to the rendered container (the repo runs vitest with
 * `retry: 2` and no RTL auto-cleanup), and the level is unmounted afterwards.
 */

let unmount: (() => void) | null = null;

// Næsta ignores a press within 400 ms of appearing; these tests press it at once.
clockPastNextGuard();

beforeEach(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  unmount?.();
  unmount = null;
});

function start() {
  const level = startLevel2();
  unmount = level.unmount;
  return level;
}

const at = (formula: string) => POOL.findIndex((m) => m.formula === formula);

/** The hint button, under either spelling it has shipped with. */
const hintButton = /S[ýy]na v[íi]sbendingu/;

describe('the count step', () => {
  it('shows the correct counts after a wrong answer', () => {
    const { ui, container } = start();
    answerCount(ui, container, 2, 1); // H₂O has 2 lone pairs
    expect(ui.getByText(/Rangt/)).toBeTruthy();
    expect(ui.getByText(/Rétt svar: 2 tengisvæði og 2 stök pör/)).toBeTruthy();
    expect(container.textContent).toContain('Samtals svæði rafeindaþéttleika: 4');
  });

  it('names one lone pair in the singular', () => {
    const { ui, container } = start();
    advanceTo(ui, container, at('NH₃'));
    answerCount(ui, container, 3, 0);
    expect(ui.getByText(/Rétt svar: 3 tengisvæði og 1 stakt par/)).toBeTruthy();
  });

  it('asks for bonding domains, which CO₂ has two of, not bonding pairs (decisions item 67)', () => {
    // A double bond is one domain and two pairs, so the key of 2 for CO₂ was
    // wrong for a student who counted the four bonding pairs the field asked for.
    const { ui, container } = start();
    advanceTo(ui, container, at('CO₂'));
    expect(ui.getByLabelText('Tengisvæði')).toBeTruthy();
    expect(ui.getByLabelText('Stök pör')).toBeTruthy();
    expect(container.textContent).not.toMatch(/Bindandi pör/i);
    fireEvent.click(ui.getByRole('button', { name: hintButton }));
    expect(container.textContent).toContain('eintengi, tvítengi eða þrítengi');
    answerCount(ui, container, 2, 0);
    expect(ui.queryByText(/Rangt/)).toBeNull();
  });

  it("gives carbon's real valence electron count for CO₂", () => {
    const { ui, container } = start();
    advanceTo(ui, container, at('CO₂'));
    fireEvent.click(ui.getByRole('button', { name: hintButton }));
    expect(container.textContent).toContain('C hefur 4 gildisrafeindir');
  });

  it('gives the valence electrons of every central atom in the pool', () => {
    const valence: Record<string, number> = {
      'H₂O': 6,
      'NH₃': 5,
      'CH₄': 4,
      'CO₂': 4,
      'BF₃': 3,
      'PCl₅': 5,
      'SF₄': 6,
      'SF₆': 6,
      'XeF₄': 8,
      'ClF₃': 7,
    };
    const { ui, container } = start();
    for (const m of POOL) {
      fireEvent.click(ui.getByRole('button', { name: hintButton }));
      expect(container.textContent, m.formula).toMatch(
        new RegExp(`hefur ${valence[m.formula]} gildisrafeindir`)
      );
      playMolecule(ui, container, m);
    }
  });
});

describe('the geometry step', () => {
  it('declines one lone pair after "með"', () => {
    const { ui, container } = start();
    advanceTo(ui, container, at('NH₃'));
    answerCount(ui, container, 3, 1);
    next(ui);
    expect(container.textContent).toContain('3 tengisvæði + 1 stakt par');
    expect(container.textContent).toContain('Með 1 stöku pari, hvaða');
    fireEvent.click(ui.getByRole('button', { name: hintButton }));
    expect(container.textContent).toContain('Hversu mikil áhrif hefur 1 stakt par?');
  });

  it('declines several lone pairs after "með"', () => {
    const { ui, container } = start();
    answerCount(ui, container, 2, 2);
    next(ui);
    expect(container.textContent).toContain('Með 2 stökum pörum, hvaða');
  });
});

describe('the angle and explanation steps', () => {
  function toAngleStep(formula: string) {
    const level = start();
    const { ui, container } = level;
    const m = POOL[at(formula)];
    advanceTo(ui, container, at(formula));
    answerCount(ui, container, m.bondingPairs, m.lonePairs);
    next(ui);
    fireEvent.click(ui.getByRole('button', { name: m.shape }));
    check(ui);
    next(ui);
    return { ...level, m };
  }

  /** The hint panel's own text; the Lögunartafla reference below it lists every angle. */
  function hintText(container: HTMLElement): string {
    const label = [...container.querySelectorAll('span')].find(
      (el) => el.textContent === 'Vísbending: '
    );
    return label?.parentElement?.textContent ?? '';
  }

  it('tiers the angle hint: the angle itself only on a second press (decisions item 71)', () => {
    const { ui, container, m } = toAngleStep('NH₃');
    fireEvent.click(ui.getByRole('button', { name: hintButton }));
    // The first tier points at the reasoning and prints no angle at all.
    expect(hintText(container)).toContain('Rafeindalögunin er ferflötungur.');
    expect(hintText(container)).toContain('Hvernig breyta stöku pörin þeim?');
    expect(hintText(container)).not.toMatch(/\d/);

    fireEvent.click(ui.getByRole('button', { name: 'Sýna nánari vísbendingu' }));
    expect(hintText(container)).toContain('horn nálægt 107°');
    expect(ui.queryByRole('button', { name: 'Sýna nánari vísbendingu' })).toBeNull();

    answerAngle(ui, container, m.angle);
    expect(ui.getByText(/Rétt! Tengihornið er/)).toBeTruthy();
  });

  it('says there are no lone pairs in the first tier where there are none', () => {
    const { ui, container } = toAngleStep('CH₄');
    fireEvent.click(ui.getByRole('button', { name: hintButton }));
    expect(hintText(container)).toContain('Hér eru engin stök pör til að breyta þeim.');
    expect(hintText(container)).not.toMatch(/\d/);
  });

  it('asks for the explanation in a sentence that agrees', () => {
    const { ui, container, m } = toAngleStep('CH₄');
    answerAngle(ui, container, m.angle);
    next(ui);
    expect(container.textContent).toContain(
      'Útskýrðu af hverju sameindarlögun CH₄ er ferflötungur:'
    );
  });

  it('keeps the T of T-lögun upper-case inside the sentence', () => {
    const { ui, container, m } = toAngleStep('ClF₃');
    answerAngle(ui, container, m.angle);
    next(ui);
    expect(container.textContent).toContain('sameindarlögun ClF₃ er T-lögun:');
  });

  it('does not say lone pairs shrink the angle of square-planar XeF₄', () => {
    const { ui, container, m } = toAngleStep('XeF₄');
    answerAngle(ui, container, m.angle);
    expect(ui.getByText(/Rétt! Tengihornið er 90°/)).toBeTruthy();
    expect(container.textContent).not.toContain('minnka hornið');
  });

  it('still says so for NH₃, where they do', () => {
    const { ui, container, m } = toAngleStep('NH₃');
    answerAngle(ui, container, m.angle);
    expect(container.textContent).toContain('minnka hornið');
  });
});

describe('the Lewis sketch shown before the prediction', () => {
  it('draws one stroke per bonding domain, and none to a lone pair', () => {
    const { ui, container } = start();
    for (const m of POOL) {
      const sketch = container.querySelector('.font-mono.whitespace-pre')?.textContent ?? '';
      const strokes = (sketch.match(/[—\-|/\\=≡]/g) ?? []).length;
      expect(strokes, `${m.formula}:\n${sketch}`).toBe(m.bondingPairs);
      playMolecule(ui, container, m);
    }
  });
});
