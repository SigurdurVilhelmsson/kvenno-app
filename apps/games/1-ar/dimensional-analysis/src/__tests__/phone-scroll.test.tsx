// @vitest-environment jsdom
/**
 * Where the screen lands, and where focus goes, after the student moves on.
 *
 * Every screen of this game is taller than a phone, and the button that moves
 * on — "Byrja", "Næsta verkefni" — sits at the foot of it. The browser keeps
 * the scroll offset when React swaps the content, so Stig 2's first problem
 * opened about 800 px down, with its context and starting value above the
 * screen, and every later problem did the same.
 *
 * The game used to carry its own helper for this. It now uses the shared one
 * in `@shared/utils` (`reveal.ts`), and these tests hold the game to what the
 * old helper did plus what the vertical-scroll pass added:
 *
 * - A new problem opens from its top, **at any width**, when that top is above
 *   the screen — the old helper did not check for a phone, so a desktop window
 *   keeps it (`anyWidth`). A top already on screen never moves.
 * - Focus moves to the new problem's own first line, not to `<body>`.
 * - After "Athuga", focus moves to the feedback, not to "Næsta", so a second
 *   Enter lands on nothing; and "Næsta" ignores a press within 400 ms of
 *   appearing, so a second tap cannot skip the feedback either.
 * - On a phone, a wrong pair in Stig 1's fraction challenge brings its
 *   explanation into view: it opens after the block tray, below the fold.
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PHONE_QUERY } from '@shared/utils';

import { Level0SigFigs } from '../components/Level0SigFigs';
import { Level1Conceptual } from '../components/Level1Conceptual';
import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';

/** Where every element's top is, as far as the components can tell. */
let top = -300;
let phone = true;
let clock = 1000;
const scrollBy = vi.fn();

beforeEach(() => {
  top = -300;
  phone = true;
  clock = 1000;
  scrollBy.mockClear();
  window.scrollBy = scrollBy as unknown as typeof window.scrollBy;
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  window.matchMedia = vi.fn((query: string) => ({
    matches: query === PHONE_QUERY && phone,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
  Object.defineProperty(window, 'innerHeight', { value: 640, configurable: true });
  Object.defineProperty(window, 'visualViewport', { value: undefined, configurable: true });
  vi.spyOn(performance, 'now').mockImplementation(() => clock);
  // Frames run at once, so the commit reveal can be read synchronously.
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    cb(0);
    return 0;
  });
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
});

const focused = () => document.activeElement as HTMLElement | null;

/** Stig 2, first problem, answered wrongly in click mode. */
function answerLevel2() {
  fireEvent.click(screen.getByRole('button', { name: /smella-ham/ }));
  fireEvent.click(screen.getAllByRole('button').find((b) => /\d/.test(b.textContent ?? ''))!);
  fireEvent.change(screen.getByPlaceholderText('Sláðu inn svar'), { target: { value: '999' } });
  fireEvent.click(screen.getByRole('button', { name: /Athuga svar/ }));
}

describe('Stig 2', () => {
  it('opens the first problem at its top, with focus on its context', () => {
    render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    expect(scrollBy).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /Byrja æfingar/ }));
    // No sticky header in jsdom: the top goes to 8 px, the helper's margin.
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy).toHaveBeenLastCalledWith({ top: -308, behavior: 'smooth' });
    expect(focused()?.textContent).toMatch(/Samhengi/);
  });

  it('keeps that at any width, as the old helper did', () => {
    phone = false;
    render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja æfingar/ }));
    expect(scrollBy).toHaveBeenCalledTimes(1);
  });

  it('does not move a screen whose top is already in view', () => {
    top = 10;
    render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja æfingar/ }));
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('moves focus to the feedback after Athuga, not to Næsta', () => {
    render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja æfingar/ }));
    answerLevel2();
    const group = focused();
    expect(group?.getAttribute('role')).toBe('group');
    expect(group?.textContent).toMatch(/Rétt umbreytingarleið/);
    expect(group?.contains(screen.getByRole('button', { name: /Næsta verkefni/ }))).toBe(false);
  });

  it('on desktop, brings back a verdict left above the screen, as before', () => {
    phone = false;
    render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja æfingar/ }));
    scrollBy.mockClear();
    answerLevel2();
    expect(scrollBy).toHaveBeenCalledTimes(1);
  });

  it('on desktop, leaves a verdict already on screen where it is', () => {
    phone = false;
    top = 10;
    render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja æfingar/ }));
    answerLevel2();
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('ignores Næsta for 400 ms, then opens the next problem with focus on it', () => {
    render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja æfingar/ }));
    answerLevel2();

    clock += 150;
    fireEvent.click(screen.getByRole('button', { name: /Næsta verkefni/ }));
    expect(screen.getByText(/Verkefni 1 \/ 15/)).toBeTruthy();

    clock += 400;
    scrollBy.mockClear();
    fireEvent.click(screen.getByRole('button', { name: /Næsta verkefni/ }));
    expect(screen.getByText(/Verkefni 2 \/ 15/)).toBeTruthy();
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(focused()?.textContent).toMatch(/Samhengi/);
  });
});

describe('the other levels', () => {
  it('Stig 1 opens the first challenge at its top, with focus on its title', () => {
    render(<Level1Conceptual onComplete={vi.fn()} onBack={vi.fn()} />);
    expect(scrollBy).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Byrja!/ }));
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(focused()?.textContent).toBe('Jafngildi eininga');
  });

  it('Stig 1 moves focus to the verdict when a challenge is solved', () => {
    render(<Level1Conceptual onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja!/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Bæta við 1 lítra' }));
    expect(focused()?.getAttribute('role')).toBe('group');
    expect(focused()?.textContent).toMatch(/^Rétt!/);
  });

  it("Stig 1 C2 brings a wrong pair's explanation into view on a phone only", () => {
    const wrongPair = () => {
      render(<Level1Conceptual onComplete={vi.fn()} onBack={vi.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: /Byrja!/ }));
      fireEvent.click(screen.getByRole('button', { name: 'Bæta við 1 lítra' }));
      clock += 500;
      fireEvent.click(screen.getByRole('button', { name: /Næsta áskorun/ }));
      scrollBy.mockClear();
      // The panel comes after the block tray on a phone, below the fold.
      fireEvent.click(screen.getByRole('button', { name: '1000 mL' }));
      const second = screen.getByRole('button', { name: '500 mL' });
      second.focus();
      fireEvent.click(second);
      expect(screen.getByText('Sömu einingarnar!')).toBeTruthy();
    };

    wrongPair();
    expect(scrollBy).toHaveBeenCalledTimes(1);
    // Focus stays on the block just tapped, so the next tap is where it was.
    expect(focused()?.textContent).toBe('500 mL');

    cleanup();
    phone = false;
    wrongPair();
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('Stig 3 opens the first problem at its top, with focus on the problem', () => {
    render(<Level3 onComplete={vi.fn()} onBack={vi.fn()} />);
    expect(scrollBy).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Byrja áskoranir/ }));
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(focused()?.tagName).toBe('H2');
  });

  it('Stig 0 moves focus to the verdict, and a quick second tap does not skip it', () => {
    render(<Level0SigFigs onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Áfram í æfingu' }));
    expect(focused()?.textContent).toMatch(/Spurning 1 af/);

    fireEvent.click(screen.getByRole('button', { name: '1' }));
    expect(focused()?.getAttribute('role')).toBe('group');

    clock += 100;
    fireEvent.click(screen.getByRole('button', { name: /^(Næsta|Áfram)$/ }));
    expect(screen.getByText(/Spurning 1 af/)).toBeTruthy();
    clock += 400;
    fireEvent.click(screen.getByRole('button', { name: /^(Næsta|Áfram)$/ }));
    expect(screen.getByText(/Spurning 2 af/)).toBeTruthy();
  });
});
