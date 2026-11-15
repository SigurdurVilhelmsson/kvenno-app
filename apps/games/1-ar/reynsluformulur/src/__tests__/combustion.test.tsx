import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CombustionScreen, judgeCombustion } from '../components/CombustionScreen';
import { COMBUSTION_PROBLEMS, formulaText, solveCombustion } from '../data/combustion';

const solve = (id: string) => solveCombustion(COMBUSTION_PROBLEMS.find((p) => p.id === id)!);

describe('combustion analysis, against the book (ch04/m68716)', () => {
  it("reproduces the book's answers", () => {
    expect(formulaText(solve('polyetylen').empirical)).toBe('CH₂');
    expect(formulaText(solve('polystyren').empirical)).toBe('CH');
    const naftalen = solve('naftalen');
    expect(formulaText(naftalen.empirical)).toBe('C₅H₄');
    expect(naftalen.n).toBe(2);
    expect(formulaText(naftalen.molecular!)).toBe('C₁₀H₈');
    expect(naftalen.hByDifference).toBe(true);
  });

  it('carbon never weighs more than the sample', () => {
    for (const p of COMBUSTION_PROBLEMS) {
      const s = solveCombustion(p);
      expect(s.massC).toBeLessThan(p.sample);
      expect(s.massC + s.massH).toBeLessThanOrEqual(p.sample * 1.02);
    }
  });
});

describe('grading a combustion answer', () => {
  const p = (id: string) => COMBUSTION_PROBLEMS.find((q) => q.id === id)!;

  it('names the common slips', () => {
    expect(judgeCombustion(p('polyetylen'), 1, 2)).toBe('right');
    // Forgetting the two H per water halves the hydrogen: CH.
    expect(judgeCombustion(p('polyetylen'), 1, 1)).toBe('half-h');
    expect(judgeCombustion(p('polyetylen'), 2, 1)).toBe('swapped');
    expect(judgeCombustion(p('naftalen'), 10, 8)).toBe('right');
    expect(judgeCombustion(p('naftalen'), 5, 4)).toBe('empirical');
    expect(judgeCombustion(p('polystyren'), 3, 7)).toBe('wrong');
  });
});

describe('the combustion screen', () => {
  const p = (id: string) => COMBUSTION_PROBLEMS.find((q) => q.id === id)!;

  it('plays all three problems, with a retry that returns focus to the first field', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    render(<CombustionScreen onComplete={onComplete} onBack={() => {}} />);
    const answer = (c: number, h: number) => {
      fireEvent.change(screen.getByLabelText('Fjöldi C'), { target: { value: String(c) } });
      fireEvent.change(screen.getByLabelText('Fjöldi H'), { target: { value: String(h) } });
      fireEvent.click(screen.getByRole('button', { name: 'Svara' }));
      vi.advanceTimersByTime(500);
    };
    answer(1, 1);
    expect(screen.getByText(/tvær vetnisfrumeindir/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Reyna aftur' }));
    expect(document.activeElement).toBe(screen.getByLabelText('Fjöldi C'));
    for (const id of ['polyetylen', 'polystyren', 'naftalen']) {
      const s = solveCombustion(p(id));
      const t = s.molecular ?? s.empirical;
      answer(t.C, t.H);
      expect(screen.getByText('Rétt')).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: /Næsta dæmi|Klára/ }));
    }
    expect(onComplete).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
