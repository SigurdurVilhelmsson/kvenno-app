// @vitest-environment jsdom
import { render, fireEvent, cleanup, within } from '@testing-library/react';
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';

import { CO_COMBUSTION_RXN, Level3 } from '../components/Level3';
import { gameTranslations } from '../i18n';

/**
 * What Level 3 prints, read through the real Icelandic strings rather than a key stub,
 * since several of the defects lived in the translations: numbers with a decimal point,
 * ASCII formulas under a Unicode equation, a wrong-answer line that quoted a ±2 kJ/mol
 * tolerance beside a 2 % grader, and a "find ΔH°f(SO₂)" challenge whose table printed it.
 */

// Næsta ignores a press within 400 ms of appearing (the P3 double-tap guard,
// `useArmedAfter`), so the clock is driven by hand: `advanceTo` waits it out.
let clock = 1000;
beforeEach(() => {
  clock = 1000;
  vi.spyOn(performance, 'now').mockImplementation(() => clock);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const IS = (gameTranslations as unknown as { is: Record<string, unknown> }).is;
const SHARED: Record<string, string> = {
  'common.back': 'Til baka',
  'common.correct': 'Rétt!',
  'common.incorrect': 'Rangt',
};

function t(key: string, fallback?: string): string {
  const value = key
    .split('.')
    .reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], IS);
  if (typeof value === 'string') return value;
  return SHARED[key] ?? fallback ?? key;
}

const ANSWERS = ['-890,6', '-91,8', '191,6', '-110,5', '-1366,9', '-851,8'];

function start() {
  const view = render(<Level3 t={t} onComplete={() => {}} onBack={() => {}} />);
  const page = within(view.container);
  fireEvent.click(page.getByText(/Byrja æfingar/));
  return { view, page };
}

function answer(page: ReturnType<typeof within>, value: string) {
  fireEvent.change(page.getByLabelText(/ΔH°/), { target: { value } });
  fireEvent.click(page.getByRole('button', { name: 'Athuga' }));
}

function advanceTo(page: ReturnType<typeof within>, index: number) {
  for (let i = 0; i < index; i++) {
    answer(page, ANSWERS[i]);
    clock += 500;
    fireEvent.click(page.getByRole('button', { name: 'Næsta þraut' }));
  }
}

describe('hess-law level 3 wrong-answer line', () => {
  it('says "slóst" and quotes the tolerance the grader applies', () => {
    const { page } = start();
    answer(page, '-800');
    const line = page.getByText(/munurinn er/).textContent ?? '';
    expect(line).toMatch(/^Þú slóst inn -800/);
    // 2 % of 890,6 kJ/mol is 17,8 kJ/mol — the old line said ±2.
    expect(line).toMatch(/leyft svigrúm: ±17,8 kJ\/mól\)\./);
    expect(page.getByText(/Rétt svar:/).textContent).toBe('Rétt svar: -890,6 kJ/mól');
  });

  it('is right about the tolerance: an answer 17 kJ/mol out is accepted', () => {
    const { page } = start();
    answer(page, '-873,3');
    expect(page.getByText('Rétt!')).toBeTruthy();
  });
});

describe('hess-law level 3 reverse challenge', () => {
  it('does not show the ΔH°f it asks for until the answer is checked', () => {
    const { page } = start();
    advanceTo(page, 3);
    expect(page.getByText(/Finndu ΔH°f fyrir CO\(g\)/)).toBeTruthy();
    fireEvent.click(page.getByRole('button', { name: 'Sýna ΔH°f töflu' }));

    const card = page.getByText('CO(g)', { selector: '.font-mono.font-bold' }).parentElement!;
    expect(card.textContent).toContain('? kJ/mól');
    expect(card.textContent).not.toMatch(/110/);
    const total = page.getByText(/Samtals hvarfefni:/).textContent ?? '';
    expect(total).toMatch(/\?/);
    expect(total).not.toMatch(/110|221/);

    answer(page, ANSWERS[3]);
    expect(card.textContent).toContain('-110,52 kJ/mól');
  });

  /**
   * Year-2 audit, 2026-11-15: the old item was S + O₂ → SO₂ with ΔH°rxn given, which is
   * ΔH°f(SO₂) itself, so the question printed its answer. The given value must differ from
   * the answer, and the answer must follow from it and the book's ΔH°f(CO₂).
   */
  it('gives a ΔH°rxn that is not the answer', () => {
    const { page } = start();
    advanceTo(page, 3);
    const desc = page.getByText(/Finndu ΔH°f fyrir CO\(g\)/).textContent ?? '';
    expect(desc).toContain('-566,0');
    expect(desc).not.toMatch(/110/);
    expect(CO_COMBUSTION_RXN).toBe(-566);
    expect((2 * -393.51 - CO_COMBUSTION_RXN) / 2).toBeCloseTo(-110.51, 2);
  });
});
