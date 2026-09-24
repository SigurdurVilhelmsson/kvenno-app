import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Level1 } from '../components/Level1';
import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';
import { revealNearest, revealTop, scrollPageToTop } from '../utils/reveal';

/**
 * The phone pass changed how the levels move the page, not what they ask.
 *
 * On a 360 px phone the "next" buttons sit screens below the content they
 * replace, so the new rule or question used to start above the viewport. The
 * levels now scroll it back into view — but only when it is actually out of
 * view, so a desktop screen where everything fits does not jump.
 */

const t = (_key: string, fallback?: string) => fallback ?? '';

function fakeElement(top: number, bottom: number) {
  const scrollIntoView = vi.fn();
  const el = {
    getBoundingClientRect: () => ({ top, bottom }) as DOMRect,
    scrollIntoView,
  } as unknown as Element;
  return { el, scrollIntoView };
}

// jsdom has no scrollIntoView; the tests below install a spy and this puts the
// prototype back as it was.
const originalScrollIntoView = Element.prototype.scrollIntoView;
afterEach(() => {
  vi.restoreAllMocks();
  Element.prototype.scrollIntoView = originalScrollIntoView;
});

describe('reveal helpers', () => {
  it('revealTop scrolls only an element whose top is above the viewport', () => {
    const above = fakeElement(-120, 300);
    revealTop(above.el);
    expect(above.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(above.scrollIntoView.mock.calls[0][0]).toMatchObject({ block: 'start' });

    const inView = fakeElement(40, 300);
    revealTop(inView.el);
    expect(inView.scrollIntoView).not.toHaveBeenCalled();

    expect(() => revealTop(null)).not.toThrow();
  });

  it('revealNearest scrolls only an element that is not fully in view', () => {
    const below = fakeElement(window.innerHeight - 10, window.innerHeight + 60);
    revealNearest(below.el);
    expect(below.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(below.scrollIntoView.mock.calls[0][0]).toMatchObject({ block: 'nearest' });

    const inView = fakeElement(10, 60);
    revealNearest(inView.el);
    expect(inView.scrollIntoView).not.toHaveBeenCalled();
  });

  it('scrollPageToTop does nothing on a page that is not scrolled', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    scrollPageToTop();
    expect(scrollTo).not.toHaveBeenCalled();
  });
});

/**
 * jsdom lays nothing out, so every rect is at 0. Pretend the whole level has
 * been scrolled past, which is where a phone student is when they tap "next".
 */
function scrolledPast() {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    top: -500,
    bottom: -100,
  } as DOMRect);
  const scrollIntoView = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoView;
  return scrollIntoView;
}

describe('the levels bring replaced content back into view', () => {
  it('Level 1: the next rule is scrolled to', () => {
    const scrollIntoView = scrolledPast();
    render(<Level1 t={t} onComplete={vi.fn()} onBack={vi.fn()} />);
    scrollIntoView.mockClear();

    fireEvent.click(screen.getByRole('button', { name: /Næsta regla/ }));
    expect(scrollIntoView).toHaveBeenCalled();
    // The element scrolled to is the new rule card, which holds its title.
    const target = scrollIntoView.mock.contexts.at(-1) as HTMLElement;
    expect(target.textContent).toContain('Málmar með breytilega hleðslu');
  });

  it('Level 1: nothing moves when the content is already in view', () => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 20,
      bottom: 400,
    } as DOMRect);
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    render(<Level1 t={t} onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Næsta regla/ }));
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('Level 2: the next compound lands on its formula, not on the Step 1 panel', () => {
    const scrollIntoView = scrolledPast();
    vi.useFakeTimers();
    try {
      render(<Level2 t={t} onComplete={vi.fn()} onBack={vi.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: /^Einfalt jónefni/ }));
      act(() => {
        vi.advanceTimersByTime(1600);
      });
    } finally {
      vi.useRealTimers();
    }
    fireEvent.click(screen.getByRole('button', { name: /skrifa nafnið/ }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Kalíumbrómíð' } });
    fireEvent.click(screen.getByRole('button', { name: 'Athuga svar' }));
    scrollIntoView.mockClear();

    fireEvent.click(screen.getByRole('button', { name: /Næsta efnasamband/ }));
    // Item and step change together; a second scroll to the step panel would
    // carry the formula Step 1 asks about back out of view.
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    const target = scrollIntoView.mock.contexts[0] as HTMLElement;
    expect(target.textContent).toBe('CaO');
  });

  it('Level 3: the next compound is scrolled to', () => {
    const scrollIntoView = scrolledPast();
    render(<Level3 t={t} onComplete={vi.fn()} onBack={vi.fn()} />);
    const tray = screen.getByText('Tiltækir partar:').parentElement as HTMLElement;
    fireEvent.click(within(tray).getAllByRole('button')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
    scrollIntoView.mockClear();
    fireEvent.click(screen.getByRole('button', { name: /Næsta efni/ }));
    expect(scrollIntoView).toHaveBeenCalled();
    const target = scrollIntoView.mock.contexts.at(-1) as HTMLElement;
    expect(target.textContent).toContain('Efnaformúla:');
  });
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
