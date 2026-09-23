import { render, screen, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';
import { revealTop } from '../utils/reveal';

/**
 * On a phone the button that moves on to the next item sits at the bottom of a
 * card taller than the screen, so the next item used to render with its
 * start already scrolled past. `revealTop` scrolls the card's top back into
 * view — and only when it is above the screen, so a desktop layout where
 * everything fits never moves.
 */

function rectWithTop(top: number): DOMRect {
  return {
    top,
    bottom: top + 100,
    left: 0,
    right: 100,
    width: 100,
    height: 100,
    x: 0,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

describe('revealTop', () => {
  it('scrolls an element whose top is above the viewport', () => {
    const el = document.createElement('div');
    el.getBoundingClientRect = () => rectWithTop(-250);
    el.scrollIntoView = vi.fn();

    expect(revealTop(el)).toBe(true);
    expect(el.scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'smooth' });
  });

  it('leaves an element alone when its top is on screen', () => {
    const el = document.createElement('div');
    el.getBoundingClientRect = () => rectWithTop(0);
    el.scrollIntoView = vi.fn();

    expect(revealTop(el)).toBe(false);
    expect(el.scrollIntoView).not.toHaveBeenCalled();
  });

  it('does nothing without an element', () => {
    expect(revealTop(null)).toBe(false);
    expect(revealTop(undefined)).toBe(false);
  });
});

describe('advancing to the next item brings its card back into view', () => {
  let top = 0;
  const scrolled: Element[] = [];

  beforeEach(() => {
    top = 0;
    scrolled.length = 0;
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => rectWithTop(top));
    // jsdom does not implement scrollIntoView.
    Element.prototype.scrollIntoView = vi.fn(function (this: Element) {
      scrolled.push(this);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Stig 2: "Næsta spurning" reveals the next scenario', () => {
    render(<Level2 onComplete={() => {}} onBack={() => {}} />);
    // Everything on screen at first: nothing may scroll.
    expect(scrolled).toHaveLength(0);

    const options = screen
      .getAllByRole('button')
      .filter((b) => b.className.includes('rounded-xl border-2'));
    fireEvent.click(options[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Staðfesta svar' }));
    expect(scrolled).toHaveLength(0);

    // The student has scrolled down to the button; the card's top is gone.
    top = -600;
    fireEvent.click(screen.getByRole('button', { name: /Næsta spurning/ }));

    expect(scrolled).toHaveLength(1);
    expect(scrolled[0].textContent).toContain('Atburðarás 2');
  });

  it('Stig 3: "Næsta dæmi" reveals the next problem', () => {
    render(<Level3 onComplete={() => {}} onBack={() => {}} />);
    expect(scrolled).toHaveLength(0);

    fireEvent.change(screen.getByPlaceholderText('0,000'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
    expect(scrolled).toHaveLength(0);

    top = -800;
    fireEvent.click(screen.getByRole('button', { name: /Næsta dæmi/ }));

    expect(scrolled).toHaveLength(1);
    // The revealed element is the question card with the answer field in it.
    expect(scrolled[0].querySelector('input[inputmode="decimal"]')).not.toBeNull();
  });
});

describe('opening a level starts it at the top of the page', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('scrolls to the top when the menu is replaced by a level, and not on first load', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(<App />);
    expect(scrollTo).not.toHaveBeenCalled();

    // The menu scroll position used to carry over into the level: on a phone
    // Stig 2 opened in the middle of its answer options.
    fireEvent.click(screen.getByRole('button', { name: /Stig 2: Rökstuðningur/ }));
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
    expect(screen.getByText('Atburðarás 1: Útþynning með vatni')).toBeTruthy();
  });
});
