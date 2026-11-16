import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Accuracy, hint } from '../components/Accuracy';
import { ACCURACY_ITEMS, VERDICT_LABEL, explain, verdictOf } from '../data/accuracy';

describe('hittni og nákvæmni, against the book (ch01/m68690)', () => {
  const v = (id: string) => verdictOf(ACCURACY_ITEMS.find((i) => i.id === id)!);

  it("derives the book's verdicts on the dispensers", () => {
    // "skammtari nr. 1 sé nákvæmur … en ekki réttur", nr. 2 "betri réttleika … verri
    // nákvæmni", nr. 3 "bæði rétt … og nákvæmlega".
    expect(v('s1')).toBe('nakvaemni');
    expect(v('s2')).toBe('hittni');
    expect(v('s3')).toBe('baedi');
  });

  it("matches the book's archery answers and the end-of-section sets", () => {
    expect(v('w')).toBe('baedi');
    expect(v('x')).toBe('nakvaemni');
    expect(v('y')).toBe('hvorugt');
    expect(v('p')).toBe('nakvaemni');
    expect(v('g')).toBe('baedi');
  });

  it('every verdict but neither is a numeric set or a target the student can check', () => {
    const verdicts = new Set(ACCURACY_ITEMS.map(verdictOf));
    expect(verdicts.size).toBe(4);
  });

  it('explains with a decimal comma', () => {
    for (const item of ACCURACY_ITEMS) expect(explain(item)).not.toMatch(/\d\.\d/);
  });

  it('a hint names the half that was wrong without the verdict', () => {
    expect(hint('baedi', 'nakvaemni')).toMatch(/Skoðaðu hittnina/);
    expect(hint('baedi', 'hittni')).toMatch(/Skoðaðu nákvæmnina/);
    expect(hint('baedi', 'hvorugt')).toMatch(/bæði/);
  });
});

describe('the Hittni og nákvæmni practice', () => {
  it('plays every item and reports N af M rétt', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    render(<Accuracy onComplete={onComplete} onBack={() => {}} />);
    ACCURACY_ITEMS.forEach((item, i) => {
      const right = verdictOf(item);
      if (i === 0) {
        const wrong = right === 'hvorugt' ? 'baedi' : 'hvorugt';
        for (let k = 0; k < 2; k++) {
          fireEvent.click(screen.getByRole('button', { name: VERDICT_LABEL[wrong] }));
          fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
          vi.advanceTimersByTime(500);
          fireEvent.click(screen.getByRole('button', { name: 'Reyna aftur' }));
          expect(document.activeElement?.getAttribute('aria-label')).toBe('Hvað sýna mælingarnar?');
        }
      }
      fireEvent.click(screen.getByRole('button', { name: VERDICT_LABEL[right] }));
      fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
      vi.advanceTimersByTime(500);
      fireEvent.click(screen.getByRole('button', { name: /Næsta|Sjá niðurstöður/ }));
    });
    const n = ACCURACY_ITEMS.length;
    expect(onComplete).toHaveBeenCalledWith(n - 1, n);
    expect(screen.getByText(`Æfingu lokið: ${n - 1} af ${n} rétt.`)).toBeTruthy();
    vi.useRealTimers();
  });
});
