// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { playLevel1 } from './play-level1';
import { HINT_GAVE_ANSWER, Level1 } from '../components/Level1';

/**
 * REVIEW-QUEUE C3 (2026-10-23): a hint that states the answer counts as a revealed answer.
 * Siggi extended it to Lewis Stig 1 on 2026-11-15. Every question's fourth tier is the worked
 * solution, and questions 2 (Cl, 17 − 10 = 7) and 7 (the octet) state it at the third.
 */
afterEach(cleanup);
clockPastNextGuard();

describe('Lewis Stig 1, a hint that gives the answer', () => {
  it('counts no answer given after the worked solution', () => {
    expect(playLevel1(4)).toHaveBeenCalledWith(0, 8);
  });

  it('counts the two answers the third tier states as revealed too', () => {
    expect(playLevel1(3)).toHaveBeenCalledWith(6, 8);
  });

  it('says so beside the right answer', () => {
    const { container } = render(<Level1 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(container);
    for (let tier = 1; tier <= 4; tier++) {
      fireEvent.click(ui.getByRole('button', { name: new RegExp(`Vísbending ${tier}/4`) }));
    }
    fireEvent.change(ui.getByPlaceholderText('?'), { target: { value: '4' } });
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
    expect(container.textContent).toContain(HINT_GAVE_ANSWER[4]);
  });
});
