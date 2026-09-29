import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';

/**
 * The phone pass changed how the answer field and the built name behave on a
 * phone, not what the levels ask. Where the page lands and where focus goes are
 * held by phone-scroll.test.tsx.
 */

const t = (_key: string, fallback?: string) => fallback ?? '';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Level 2 answer field on a phone keyboard', () => {
  it('turns off autocorrect, autocapitalise, autocomplete and spellcheck', () => {
    vi.useFakeTimers();
    try {
      render(<Level2 t={t} onComplete={vi.fn()} onBack={vi.fn()} />);
      const typeButtons = screen
        .getAllByRole('button')
        .filter((b) => b.className.includes('rounded-xl border-2'));
      fireEvent.click(typeButtons[0]);
      // Step 1 moves on by itself after 1.5 s.
      act(() => {
        vi.advanceTimersByTime(1600);
      });
    } finally {
      vi.useRealTimers();
    }
    fireEvent.click(screen.getByRole('button', { name: /skrifa nafnið/ }));
    const input = screen.getByRole('textbox');
    expect(input.getAttribute('autocapitalize')).toBe('none');
    expect(input.getAttribute('autocorrect')).toBe('off');
    expect(input.getAttribute('autocomplete')).toBe('off');
    expect(input.getAttribute('spellcheck')).toBe('false');
  });
});

describe('Level 3 built name', () => {
  it('reads as one capitalised word, with line-break chances only between parts', () => {
    render(<Level3 t={t} onComplete={vi.fn()} onBack={vi.fn()} />);
    const tray = screen.getByText('Tiltækir partar:').parentElement as HTMLElement;
    const parts = within(tray).getAllByRole('button').slice(0, 3);
    const texts = parts.map((b) => b.textContent ?? '');
    for (const part of parts) fireEvent.click(part);

    const joined = texts.join('');
    const expected = joined.charAt(0).toUpperCase() + joined.slice(1);
    const shown = screen.getByText(
      (_content, el) => el?.tagName === 'DIV' && el.textContent === expected
    );
    expect(shown.querySelectorAll('wbr')).toHaveLength(texts.length - 1);
  });
});
