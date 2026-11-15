import { fireEvent, render, within } from '@testing-library/react';
import { expect, vi } from 'vitest';

import { Level1 } from '../components/Level1';

/** Stig 1's answers: typed counts, and the one multiple-choice question. */
const LEVEL1: (string | RegExp)[] = ['4', '7', '8', '8', '16', '8', /^[a-d]\. ?8 rafeindir$/, '1'];

/** Plays Stig 1 right, opening the first `tiersToOpen` hint tiers on every question. */
export function playLevel1(tiersToOpen: number) {
  const onComplete = vi.fn();
  const { container } = render(<Level1 onComplete={onComplete} onBack={vi.fn()} />);
  const ui = within(container);
  for (const answer of LEVEL1) {
    {
      for (let tier = 1; tier <= tiersToOpen; tier++) {
        fireEvent.click(ui.getByRole('button', { name: new RegExp(`Vísbending ${tier}/4`) }));
      }
    }
    // No cost shown for opening them, and no running score.
    expect(container.textContent).not.toMatch(/Stig: \d/);
    expect(container.textContent).not.toMatch(/\d+ stig\b/);
    if (typeof answer === 'string') {
      fireEvent.change(ui.getByPlaceholderText('?'), { target: { value: answer } });
    } else {
      fireEvent.click(ui.getByRole('button', { name: answer }));
    }
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
    expect(container.textContent).not.toContain('Rétt svar:');
    fireEvent.click(ui.getByRole('button', { name: /Næsta þraut|Ljúka stigi 1/ }));
  }
  return onComplete;
}
