// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Level1 } from '../components/Level1';

/**
 * Stig 1 grades an oxidation number, which is a whole number. It read the field with `parseInt`,
 * which takes `-1.5` as -1, so a non-integer answer was marked correct. Queries are scoped to the
 * rendered container and every render is unmounted (vitest `retry: 2`, no RTL auto-cleanup).
 */
const t = (key: string, fallback?: string) => fallback ?? key;

afterEach(cleanup);

function answerFirstQuestion(value: string) {
  const { container, unmount } = render(<Level1 t={t} onComplete={vi.fn()} onBack={vi.fn()} />);
  const view = within(container);
  for (let i = 0; i < 5; i++) fireEvent.click(view.getByRole('button', { name: /Næsta/ }));
  fireEvent.click(view.getByRole('button', { name: /Byrja æfingar/ }));
  // Question 1: Cl in NaCl, whose oxidation number is -1.
  fireEvent.change(view.getByRole('spinbutton', { name: 'Oxunartala' }), { target: { value } });
  fireEvent.click(view.getByRole('button', { name: 'Athuga svar' }));
  const retried = view.queryByRole('button', { name: 'Reyna aftur' }) !== null;
  unmount();
  return retried ? 'wrong' : 'right';
}

describe('Stig 1 oxidation numbers are whole numbers', () => {
  it('accepts -1 for Cl in NaCl, also written -1.0', () => {
    expect(answerFirstQuestion('-1')).toBe('right');
    expect(answerFirstQuestion('-1.0')).toBe('right');
  });

  it('rejects -1.5, -1.9 and the other near misses parseInt used to round away', () => {
    for (const value of ['-1.5', '-1.9', '-1.01', '1', '0', '-2']) {
      expect(answerFirstQuestion(value), value).toBe('wrong');
    }
  });
});
