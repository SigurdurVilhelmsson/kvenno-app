// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { pastExample } from './past-example';
import { playLevel1 } from './play-level1';
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
  pastExample(container);
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
  // Tiers 1 and 2 never state the answer. The tier that does is a revealed answer
  // (REVIEW-QUEUE C3, extended 2026-11-15): hint-reveals-answer.test.tsx.
  it('Stig 1 reports 8 of 8 with or without its first two hint tiers open', () => {
    expect(playLevel1(0)).toHaveBeenCalledWith(8, 8);
    cleanup();
    expect(playLevel1(2)).toHaveBeenCalledWith(8, 8);
  });

  it('Stig 3 reports 8 of 8 with or without its hint open', () => {
    expect(playLevel3(false)).toHaveBeenCalledWith(8, 8);
    cleanup();
    expect(playLevel3(true)).toHaveBeenCalledWith(8, 8);
  });
});
