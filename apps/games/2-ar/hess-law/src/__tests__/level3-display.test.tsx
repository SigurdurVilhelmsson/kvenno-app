// @vitest-environment jsdom
import { render, fireEvent, cleanup, within } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';

import { Level3 } from '../components/Level3';
import { gameTranslations } from '../i18n';

/**
 * What Level 3 prints, read through the real Icelandic strings rather than a key stub,
 * since several of the defects lived in the translations: numbers with a decimal point,
 * ASCII formulas under a Unicode equation, a wrong-answer line that quoted a ±2 kJ/mol
 * tolerance beside a 2 % grader, and a "find ΔH°f(SO₂)" challenge whose table printed it.
 */

afterEach(cleanup);

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

const ANSWERS = ['-890,3', '-92,2', '178,3', '-296,8', '-1366,7', '-851,5'];

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
    fireEvent.click(page.getByRole('button', { name: 'Næsta þraut' }));
  }
}

describe('hess-law level 3 wrong-answer line', () => {
  it('says "slóst" and quotes the tolerance the grader applies', () => {
    const { page } = start();
    answer(page, '-800');
    const line = page.getByText(/munurinn er/).textContent ?? '';
    expect(line).toMatch(/^Þú slóst inn -800/);
    // 2 % of 890,3 kJ/mol is 17,8 kJ/mol — the old line said ±2.
    expect(line).toMatch(/leyft svigrúm: ±17,8 kJ\/mól\)\./);
    expect(page.getByText(/Rétt svar:/).textContent).toBe('Rétt svar: -890,3 kJ/mól');
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
    expect(page.getByText(/Finndu ΔH°f fyrir SO₂\(g\)/)).toBeTruthy();
    fireEvent.click(page.getByRole('button', { name: 'Sýna ΔH°f töflu' }));

    const card = page.getByText('SO₂(g)', { selector: '.font-mono.font-bold' }).parentElement!;
    expect(card.textContent).toContain('? kJ/mól');
    expect(card.textContent).not.toMatch(/296/);
    const total = page.getByText(/Samtals myndefni:/).textContent ?? '';
    expect(total).toMatch(/\?/);
    expect(total).not.toMatch(/296/);

    answer(page, ANSWERS[3]);
    expect(card.textContent).toContain('-296,8 kJ/mól');
  });
});

describe('hess-law level 3 notation', () => {
  it.each(ANSWERS.map((_answer, i) => [i + 1, i] as const))(
    'challenge %i prints decimal commas and subscripted formulas',
    (_n, index) => {
      const { view, page } = start();
      advanceTo(page, index);
      fireEvent.click(page.getByRole('button', { name: 'Sýna ΔH°f töflu' }));
      answer(page, ANSWERS[index]);
      const text = view.container.textContent ?? '';
      expect(text).not.toMatch(/\d\.\d/);
      // An element symbol, an ASCII digit, then more formula: CO2(g), H2O, C2H5OH.
      // (Rows run together in textContent, so "kJ" then "2 ×" must not count.)
      expect(text).not.toMatch(/[A-Z][a-z]?\d+(?=[A-Z(])/);
    }
  );
});
