import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { ChainBuilder } from '../components/ChainBuilder';
import { ExploreScreen } from '../components/ExploreScreen';
import { problemsForPhase } from '../data/problems';
import { reveal, revealDelta } from '../utils/reveal';

/**
 * On a 360 × 740 phone every tap in this game changes something a screen away
 * from the finger: a pool card lands in the chain above the pool, the worked
 * solution grows below the fold, "Næsta dæmi" swaps the statement in at the top.
 * These tests hold the scrolling that brings each change into view — and hold
 * that nothing moves when the change is already on screen, which is the desktop
 * case.
 */

const HEADER = 56;
const VIEW = 740;

describe('revealDelta', () => {
  it('does not move a box that is already on screen', () => {
    expect(revealDelta({ top: 100, bottom: 300 }, HEADER, VIEW)).toBe(0);
  });

  it('brings a box below the fold up by the least distance, plus a margin', () => {
    expect(revealDelta({ top: 900, bottom: 1000 }, HEADER, VIEW)).toBe(1000 - VIEW + 12);
  });

  it('counts a box under the sticky header as hidden and brings it down below it', () => {
    expect(revealDelta({ top: 20, bottom: 120 }, HEADER, VIEW)).toBe(20 - HEADER - 12);
  });

  it('shows the start of a box taller than the screen', () => {
    expect(revealDelta({ top: 900, bottom: 2000 }, HEADER, VIEW)).toBe(900 - HEADER - 12);
    expect(revealDelta({ top: -500, bottom: 900 }, HEADER, VIEW)).toBe(-500 - HEADER - 12);
  });

  it('leaves a tall box alone while its start is in the upper half of the screen', () => {
    expect(revealDelta({ top: 150, bottom: 1500 }, HEADER, VIEW)).toBe(0);
  });
});

describe('reveal', () => {
  let scrollBy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scrollBy = vi.fn();
    window.scrollBy = scrollBy as unknown as typeof window.scrollBy;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  const box = (top: number, bottom: number) =>
    ({ top, bottom, left: 0, right: 100, width: 100, height: bottom - top }) as DOMRect;

  it('measures from the bottom of a sticky header', () => {
    const header = document.createElement('header');
    header.style.position = 'sticky';
    header.getBoundingClientRect = () => box(0, HEADER);
    document.body.appendChild(header);

    const el = document.createElement('div');
    el.getBoundingClientRect = () => box(10, 90);
    reveal(el);

    expect(scrollBy).toHaveBeenCalledWith({ top: 10 - HEADER - 12, behavior: 'smooth' });
  });

  it('ignores a header that has scrolled away with the page', () => {
    const header = document.createElement('header');
    header.style.position = 'static';
    header.getBoundingClientRect = () => box(0, HEADER);
    document.body.appendChild(header);

    const el = document.createElement('div');
    el.getBoundingClientRect = () => box(10, 90);
    reveal(el);

    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('reveals through to a second element', () => {
    const el = document.createElement('div');
    el.getBoundingClientRect = () => box(600, 700);
    const through = document.createElement('div');
    through.getBoundingClientRect = () => box(710, 800);
    window.innerHeight = VIEW;
    reveal(el, through);

    expect(scrollBy).toHaveBeenCalledWith({ top: 800 - VIEW + 12, behavior: 'smooth' });
  });
});

/**
 * Render-level: lay the page out with getBoundingClientRect so that whatever
 * `offscreen` matches sits above the screen and everything else is on it.
 */
function layOut(offscreen: (el: Element) => boolean) {
  return vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: Element
  ) {
    const top = offscreen(this) ? -400 : 200;
    return { top, bottom: top + 100, left: 0, right: 100, width: 100, height: 100 } as DOMRect;
  });
}

const tapCard = (labelPart: string) =>
  fireEvent.click(
    screen.getAllByRole('button').find((b) => b.getAttribute('aria-label')?.includes(labelPart))!
  );

describe('the game keeps each change on screen', () => {
  let scrollBy: ReturnType<typeof vi.fn>;
  let scrollTo: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scrollBy = vi.fn();
    scrollTo = vi.fn();
    window.scrollBy = scrollBy as unknown as typeof window.scrollBy;
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
    window.innerHeight = VIEW;
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  });

  it('scrolls a new chain card into view when it lands above the screen', () => {
    layOut((el) => el.hasAttribute('data-slot'));
    render(
      <ChainBuilder
        problems={problemsForPhase('aefa')}
        predictBeforeSolving
        onComplete={() => {}}
        onBack={() => {}}
      />
    );
    tapCard(': 24,31 g Mg');

    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy.mock.calls[0][0].top).toBeLessThan(0);
  });

  it('does not scroll when the new chain card is already on screen', () => {
    layOut(() => false);
    render(
      <ChainBuilder
        problems={problemsForPhase('aefa')}
        predictBeforeSolving
        onComplete={() => {}}
        onBack={() => {}}
      />
    );
    tapCard(': 24,31 g Mg');
    fireEvent.click(screen.getByRole('button', { name: 'Snúa við hlutfalli númer 1' }));

    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('does not scroll when a card is flipped or removed', () => {
    layOut((el) => el.hasAttribute('data-slot'));
    render(
      <ChainBuilder
        problems={problemsForPhase('aefa')}
        predictBeforeSolving
        onComplete={() => {}}
        onBack={() => {}}
      />
    );
    tapCard(': 24,31 g Mg');
    scrollBy.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Snúa við hlutfalli númer 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Fjarlægja hlutfall númer 1' }));

    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('follows the worked solution down as each step appears, then the verdict', () => {
    vi.useFakeTimers();
    // Everything in the worked solution is below the fold.
    layOut(() => false);
    render(
      <ChainBuilder
        problems={problemsForPhase('beita')}
        predictBeforeSolving={false}
        onComplete={() => {}}
        onBack={() => {}}
      />
    );
    tapCard(': 24,31 g Mg');
    vi.restoreAllMocks();
    window.scrollBy = scrollBy as unknown as typeof window.scrollBy;
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: Element
    ) {
      const below = this.tagName === 'LI' || this.classList.contains('border-amber-400');
      const top = below ? 1200 : 200;
      return { top, bottom: top + 100, left: 0, right: 100, width: 100, height: 100 } as DOMRect;
    });
    scrollBy.mockClear();

    fireEvent.click(screen.getByRole('button', { name: 'Leysa' }));
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    // Step 1 was revealed.
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy.mock.calls[0][0].top).toBeGreaterThan(0);

    act(() => {
      vi.advanceTimersByTime(700);
    });
    // One step, which cancels nothing: the correction prompt appears and is revealed.
    expect(screen.getByText('Hvað þarf að laga?')).toBeTruthy();
    expect(scrollBy).toHaveBeenCalledTimes(2);
  });

  it('scrolls the hint into view when it opens below the screen, and not when it closes', () => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: Element
    ) {
      const top = this.classList.contains('bg-sky-50') ? 760 : 200;
      return { top, bottom: top + 80, left: 0, right: 100, width: 100, height: 80 } as DOMRect;
    });
    render(
      <ChainBuilder
        problems={problemsForPhase('aefa')}
        predictBeforeSolving
        onComplete={() => {}}
        onBack={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Vísbending' }));

    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy.mock.calls[0][0].top).toBe(840 - VIEW + 12);

    fireEvent.click(screen.getByRole('button', { name: 'Fela vísbendingu' }));
    expect(scrollBy).toHaveBeenCalledTimes(1);
  });

  it('starts the next problem at the top of the page', () => {
    vi.useFakeTimers();
    layOut(() => false);
    render(
      <ChainBuilder
        problems={problemsForPhase('aefa')}
        predictBeforeSolving={false}
        onComplete={() => {}}
        onBack={() => {}}
      />
    );
    tapCard(': 24,31 g Mg');
    fireEvent.click(screen.getByRole('button', { name: 'Snúa við hlutfalli númer 1' }));
    tapCard('atóm Mg');
    fireEvent.click(screen.getByRole('button', { name: 'Leysa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sýna öll skrefin strax' }));
    act(() => {
      vi.advanceTimersByTime(700);
    });

    Object.defineProperty(window, 'scrollY', { value: 900, configurable: true });
    scrollBy.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Næsta dæmi' }));

    expect(screen.getByText('Dæmi 2 af 5')).toBeTruthy();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    // …and the return to the board does not then scroll away from the statement.
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('reveals the new card and the unit it produced together in Kanna', () => {
    layOut((el) => el.hasAttribute('data-slot'));
    render(<ExploreScreen onComplete={() => {}} onBack={() => {}} />);
    tapCard(': 40,3 g MgO');

    expect(scrollBy).toHaveBeenCalledTimes(1);
  });

  it('opens each phase at the top of the page, not at the menu card’s scroll position', () => {
    render(<App />);
    Object.defineProperty(window, 'scrollY', { value: 800, configurable: true });
    fireEvent.click(screen.getByRole('button', { name: /Kanna/ }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
  });
});
