// @vitest-environment jsdom
/**
 * Where the screen lands after the student moves on.
 *
 * Every screen of this game is taller than a phone, and the button that moves
 * on — "Byrja", "Næsta verkefni" — sits at the foot of it. The
 * browser keeps the scroll offset when React swaps the content, so Stig 2's
 * first problem opened about 800 px down, with its context and starting value
 * above the screen, and every later problem did the same.
 *
 * So inside a level each new problem is revealed from its top — but only when
 * that top is above the viewport, so a desktop layout that fits never moves.
 * The swap from the menu into a level is left to the platform-wide scroll fix.
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Level1Conceptual } from '../components/Level1Conceptual';
import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';
import { revealTop } from '../utils/reveal';

const scrollIntoView = vi.fn();
/** Where every element's top is, as far as the components can tell. */
let top = -300;

beforeEach(() => {
  top = -300;
  scrollIntoView.mockClear();
  // jsdom implements neither; the components call scrollIntoView optionally.
  Element.prototype.scrollIntoView = scrollIntoView;
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
    () =>
      ({
        top,
        bottom: top + 100,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
        x: 0,
        y: top,
        toJSON: () => ({}),
      }) as DOMRect
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  delete (Element.prototype as Partial<Element>).scrollIntoView;
});

const START = { block: 'start', behavior: 'smooth' };

/** The text of each element scrolled into view so far. */
const revealed = () =>
  scrollIntoView.mock.contexts.map((el) => (el as HTMLElement).textContent ?? '');

describe('revealTop', () => {
  it('scrolls an element whose top is above the viewport', () => {
    const el = document.createElement('div');
    expect(revealTop(el)).toBe(true);
    expect(scrollIntoView).toHaveBeenCalledWith(START);
  });

  it('leaves an element alone when its top is on screen', () => {
    top = 0;
    expect(revealTop(document.createElement('div'))).toBe(false);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});

describe('Stig 2', () => {
  it('opens the first problem, a verdict and the next problem at their tops', () => {
    render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    expect(scrollIntoView).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /Byrja æfingar/ }));
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenLastCalledWith(START);
    expect(revealed()[0]).toMatch(/Verkefni 1 \/ 15/);
    expect(revealed()[0]).toMatch(/Samhengi/);

    fireEvent.click(screen.getByRole('button', { name: /smella-ham/ }));
    fireEvent.click(screen.getAllByRole('button').find((b) => /\d/.test(b.textContent ?? ''))!);
    fireEvent.change(screen.getByPlaceholderText('Sláðu inn svar'), { target: { value: '999' } });
    scrollIntoView.mockClear();
    fireEvent.click(screen.getByRole('button', { name: /Athuga svar/ }));
    expect(revealed().some((t) => /Rétt umbreytingarleið/.test(t))).toBe(true);

    scrollIntoView.mockClear();
    fireEvent.click(screen.getByRole('button', { name: /Næsta verkefni/ }));
    expect(revealed()).toHaveLength(1);
    expect(revealed()[0]).toMatch(/Verkefni 2 \/ 15/);
  });

  it('does not move a screen whose top is already in view', () => {
    top = 10;
    render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja æfingar/ }));
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});

describe('the other levels', () => {
  it('Stig 1 opens the first challenge at its top', () => {
    render(<Level1Conceptual onComplete={vi.fn()} onBack={vi.fn()} />);
    expect(scrollIntoView).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Byrja!/ }));
    expect(revealed()).toHaveLength(1);
    expect(revealed()[0]).toMatch(/Áskorun 1 \/ 6/);
  });

  it('Stig 3 opens the first problem at its top', () => {
    render(<Level3 onComplete={vi.fn()} onBack={vi.fn()} />);
    expect(scrollIntoView).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Byrja áskoranir/ }));
    expect(revealed()).toHaveLength(1);
    expect(revealed()[0]).toMatch(/Áskorun 1 \//);
  });
});
