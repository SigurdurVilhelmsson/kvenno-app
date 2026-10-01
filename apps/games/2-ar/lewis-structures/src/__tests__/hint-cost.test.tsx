// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { Level1 } from '../components/Level1';
import { Level3 } from '../components/Level3';

/**
 * Hints are free. Stig 1 used to pay 15 × the HintSystem tier multiplier (0.8
 * down to 0.4) and show the cost; Stig 3 paid 15 without its hint and 8 with it,
 * and said nothing. `CLAUDE.md` recorded that no game charged for a hint any
 * more; this one had been missed (mobile-pass decision 2, ruled (b) 2026-09-30).
 *
 * Each level is played through twice, once opening every hint, and must report
 * the same result. Queries are scoped to each rendered container.
 */

afterEach(cleanup);
clockPastNextGuard();

/** Stig 1's answers: typed counts, and the one multiple-choice question. */
const LEVEL1: (string | RegExp)[] = ['4', '7', '8', '8', '16', '8', /^[a-d]\. ?8 rafeindir$/, '1'];

function playLevel1(openHints: boolean) {
  const onComplete = vi.fn();
  const { container } = render(<Level1 onComplete={onComplete} onBack={vi.fn()} />);
  const ui = within(container);
  for (const answer of LEVEL1) {
    if (openHints) {
      for (let tier = 1; tier <= 4; tier++) {
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

/** Stig 3's correct options, in question order (as option-order.test.tsx has them). */
const LEVEL3 = [
  'FC = Gildisraf. - (óbundnar + ½ bundnar)',
  '0',
  '+1',
  ':C≡O: með þrítengi',
  '2 formúlur',
  '3 formúlur',
  'Sameindin er vokblendingur allra formúlanna',
  'Lágmarka formlegar hleðslur (helst 0)',
];

function playLevel3(openHint: boolean) {
  const onComplete = vi.fn();
  const { container } = render(<Level3 onComplete={onComplete} onBack={vi.fn()} />);
  const ui = within(container);
  for (const text of LEVEL3) {
    if (openHint) fireEvent.click(ui.getByRole('button', { name: 'Sýna vísbendingu' }));
    expect(container.textContent).not.toMatch(/\d+ stig\b/);
    const option = [...container.querySelectorAll('button')].find(
      (b) => b.querySelector('span')?.textContent === text
    );
    fireEvent.click(option!);
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
    expect(ui.getByText('Rétt!')).toBeTruthy();
    fireEvent.click(ui.getByRole('button', { name: /Næsta þraut|Ljúka stigi 3/ }));
  }
  return onComplete;
}

describe('a hint never changes the result', () => {
  it('Stig 1 reports 8 of 8 with or without every hint tier open', () => {
    expect(playLevel1(false)).toHaveBeenCalledWith(8, 8);
    cleanup();
    expect(playLevel1(true)).toHaveBeenCalledWith(8, 8);
  });

  it('Stig 3 reports 8 of 8 with or without its hint open', () => {
    expect(playLevel3(false)).toHaveBeenCalledWith(8, 8);
    cleanup();
    expect(playLevel3(true)).toHaveBeenCalledWith(8, 8);
  });
});
