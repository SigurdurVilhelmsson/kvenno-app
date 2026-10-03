// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Level1 } from '../components/Level1';
import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';

/**
 * No game on the platform charges for a hint (CLAUDE.md: "Hint usage is never penalized").
 * All three levels here still did: a correct answer was worth 15 points unaided and 8 after
 * "Sýna vísbendingu" in Stig 1 and Stig 2, and 12 against 6 in Stig 3.
 *
 * Points are gone altogether now (mobile-pass decision 1 (b)): each case takes the hint, answers
 * the first question correctly, and checks it is marked right with no score anywhere. That a
 * hint never changes the count a level reports is played through in `right-count.test.tsx`. Queries are scoped to the rendered container because
 * the repo runs vitest with `retry: 2` and no RTL auto-cleanup.
 */
describe('a hint costs nothing', () => {
  it('Stig 1: a correct answer after the hint is still right, with no score shown', () => {
    const { container } = render(<Level1 onComplete={vi.fn()} onBack={vi.fn()} />);
    const view = within(container);
    fireEvent.click(view.getByRole('button', { name: /Hefja æfingar/ }));

    // The first molecule is water: all three forces. Picked by their strength badges.
    expect(container.querySelector('.text-4xl')!.textContent).toBe('H₂O');
    fireEvent.click(view.getByRole('button', { name: 'Sýna vísbendingu' }));
    for (const force of [/Veikastur$/, /Meðal$/, /Sterkastur$/]) {
      fireEvent.click(view.getByRole('button', { name: force }));
    }
    fireEvent.click(view.getByRole('button', { name: 'Athuga svar' }));

    expect(container.textContent).toContain('Rétt!');
    expect(container.textContent).not.toMatch(/\d+ stig\b/);
  });

  it('Stig 2: a correct ranking after the hint is still right, with no score shown', () => {
    const { container } = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    const view = within(container);

    fireEvent.click(view.getByRole('button', { name: 'Sýna vísbendingu' }));
    // Problem 1, boiling point low to high: CH₄ < HCl < H₂O.
    const pool = view.getByText('Tiltæk efni:').parentElement!;
    for (const formula of ['CH₄', 'HCl', 'H₂O']) {
      const button = [...pool.querySelectorAll('button')].find(
        (b) => b.querySelector('.font-bold')!.textContent === formula
      )!;
      fireEvent.click(button);
    }
    fireEvent.click(view.getByRole('button', { name: 'Athuga röðun' }));

    expect(view.getByText('Rétt röðun!')).toBeTruthy();
    expect(container.textContent).not.toMatch(/\d+ stig\b/);
  });

  it('Stig 3: a correct answer after the hint is still right, with no score shown', () => {
    const { container } = render(<Level3 onComplete={vi.fn()} onBack={vi.fn()} />);
    const view = within(container);

    fireEvent.click(view.getByRole('button', { name: 'Sýna vísbendingu' }));
    fireEvent.click(
      view.getByRole('button', { name: /Etanól hefur O-H hóp sem myndar vetnistengi/ })
    );
    fireEvent.click(view.getByRole('button', { name: 'Athuga svar' }));

    expect(view.getByText('Rétt!')).toBeTruthy();
    expect(container.textContent).not.toMatch(/\d+ stig\b/);
  });
});
