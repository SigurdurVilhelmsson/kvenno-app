// @vitest-environment jsdom
/**
 * Where the screen lands, and where focus goes, as a student moves through the
 * game.
 *
 * On a phone every screen of this game is taller than the viewport, and the
 * browser keeps the old scroll offset when React swaps the content. Without
 * help, a student who taps "Næsta spurning" at the foot of the screen lands
 * below the next question, and opening Stig 2 from the menu lands halfway down
 * its teaching text.
 *
 * The game used to scroll by itself; it now uses the shared helpers in
 * `@shared/utils` (`reveal.ts`), and these tests hold it to what it did before
 * plus what the vertical-scroll pass added:
 *
 * - Every new screen and every next item starts at the top of the page, **at
 *   any width**, as it always has. Focus moves to the new screen's heading or
 *   the new item's own start (its n value, its element), never to `<body>`.
 * - After "Athuga", a desktop brings Stig 1's and Stig 2's verdict block into
 *   view only when it is below the fold, as `scrollIntoView({ block:
 *   'nearest' })` did; Stig 3's verdict replaces the button in place and gets
 *   no scroll there. A phone shows as much as fits from the question down to
 *   Næsta in every level.
 * - Focus then moves to the verdict, not to Næsta, so a second Enter lands on
 *   nothing, and Næsta ignores a press within 400 ms of appearing, so a second
 *   tap cannot skip the feedback either.
 * - Back on the menu, focus goes to the first level not yet done.
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PHONE_QUERY } from '@shared/utils';

import App from '../App';
import { Level1 } from '../components/Level1';
import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';

/** Where every element's top is, as far as the components can tell. */
let top = 700;
let phone = false;
let clock = 1000;
const scrollBy = vi.fn();
const scrollTo = vi.fn();

beforeEach(() => {
  top = 700;
  phone = false;
  clock = 1000;
  scrollBy.mockClear();
  scrollTo.mockClear();
  window.scrollBy = scrollBy as unknown as typeof window.scrollBy;
  window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
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
  localStorage.clear();
});

const focused = () => document.activeElement as HTMLElement | null;
const TOP = { top: 0, behavior: 'auto' };
/** Past the Næsta guard. */
const later = () => {
  clock += 500;
};

function startLevel1() {
  render(<Level1 onComplete={vi.fn()} onBack={vi.fn()} />);
  for (const next of [/Sjáum dæmi/, /Eitt dæmi til/, /byrja æfingar/]) {
    fireEvent.click(screen.getByRole('button', { name: next }));
  }
}

function answerLevel1() {
  fireEvent.click(document.querySelector<HTMLButtonElement>('button.quantum-card')!);
  fireEvent.click(screen.getByRole('button', { name: /Athuga svar/ }));
}

describe('Stig 1', () => {
  it.each([
    ['a desktop', false],
    ['a phone', true],
  ])('opens every teaching step and the exercises at the top on %s', (_, isPhone) => {
    phone = isPhone;
    render(<Level1 onComplete={vi.fn()} onBack={vi.fn()} />);
    expect(scrollTo).not.toHaveBeenCalled();

    const headings = [/Dæmi: n = 2/, /Dæmi: n = 3/];
    for (const [i, next] of [/Sjáum dæmi/, /Eitt dæmi til/].entries()) {
      scrollTo.mockClear();
      fireEvent.click(screen.getByRole('button', { name: next }));
      expect(scrollTo).toHaveBeenCalledWith(TOP);
      expect(focused()?.textContent).toMatch(headings[i]);
    }

    scrollTo.mockClear();
    fireEvent.click(screen.getByRole('button', { name: /byrja æfingar/ }));
    expect(scrollTo).toHaveBeenCalledWith(TOP);
    expect(focused()?.textContent).toMatch(/^n = 1$/);
  });

  it('opens each next question at the top of the page at any width, with focus on its n', () => {
    startLevel1();
    answerLevel1();
    later();
    scrollBy.mockClear();
    top = -300;
    fireEvent.click(screen.getByRole('button', { name: /Næsta spurning/ }));
    // The page's own wrapper, at -300, goes to the very top: no sticky header
    // in jsdom and no gap, so exactly the old scroll to 0, and instant.
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy).toHaveBeenLastCalledWith({ top: -300, behavior: 'auto' });
    expect(screen.getByText(/Spurning 2 \/ 8/)).toBeTruthy();
    expect(focused()?.textContent).toMatch(/^n = \d$/);
  });

  it('brings the verdict up on a desktop only where it is below the fold', () => {
    startLevel1();
    answerLevel1();
    // 800 − (640 − 16): the block's bottom lands 16 px above the fold, as its
    // 16 px scroll margin put it under scrollIntoView.
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 176, behavior: 'smooth' });
  });

  it('leaves the page alone on a desktop where the verdict is in view', () => {
    top = 200;
    startLevel1();
    answerLevel1();
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('on a phone shows the question down to Næsta, and focuses the verdict', () => {
    phone = true;
    startLevel1();
    answerLevel1();
    // 800 − (640 − 8): Næsta's bottom 8 px above the fold, the span fitting.
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 168, behavior: 'smooth' });
    expect(focused()?.getAttribute('role')).toBe('group');
    expect(focused()?.textContent).toMatch(/Rétt!|Ekki rétt/);
  });

  it('focuses the verdict, not Næsta, at any width, and drops a Næsta press within 400 ms', () => {
    startLevel1();
    answerLevel1();
    expect(focused()?.getAttribute('role')).toBe('group');
    expect(focused()?.getAttribute('aria-labelledby')).toBe('rafeind-l1-verdict');
    expect(focused()?.textContent).toMatch(/Rétt!|Ekki rétt/);

    clock += 150;
    fireEvent.click(screen.getByRole('button', { name: /Næsta spurning/ }));
    expect(screen.getByText(/Spurning 1 \/ 8/)).toBeTruthy();

    clock += 300;
    fireEvent.click(screen.getByRole('button', { name: /Næsta spurning/ }));
    expect(screen.getByText(/Spurning 2 \/ 8/)).toBeTruthy();
  });
});

function startLevel2() {
  render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: /Byrja æfingar/ }));
}

function answerLevel2() {
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '1s2' } });
  fireEvent.click(screen.getByRole('button', { name: /Athuga svar/ }));
}

describe('Stig 2', () => {
  it('opens the exercises at the top with focus on the element', () => {
    render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja æfingar/ }));
    expect(scrollTo).toHaveBeenCalledWith(TOP);
    expect(focused()?.textContent).toMatch(/Z = 1/);
  });

  it('brings the verdict up on a desktop, and the answer down to Næsta on a phone', () => {
    startLevel2();
    answerLevel2();
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 176, behavior: 'smooth' });
    expect(focused()?.getAttribute('aria-labelledby')).toBe('rafeind-l2-verdict');
    expect(focused()?.textContent).toMatch(/Ekki rétt/);
    cleanup();

    phone = true;
    scrollBy.mockClear();
    startLevel2();
    answerLevel2();
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 168, behavior: 'smooth' });
    expect(focused()?.getAttribute('aria-labelledby')).toBe('rafeind-l2-verdict');
  });

  it('opens each next element at the top, with focus on it', () => {
    startLevel2();
    answerLevel2();
    later();
    scrollBy.mockClear();
    top = -300;
    fireEvent.click(screen.getByRole('button', { name: /Næsta frumefni/ }));
    expect(scrollBy).toHaveBeenLastCalledWith({ top: -300, behavior: 'auto' });
    expect(screen.getByText(/Frumefni 2 \/ 8/)).toBeTruthy();
    expect(focused()?.textContent).toMatch(/Z = 6/);
  });

  it('keeps phone keyboards from capitalising or correcting the configuration', () => {
    startLevel2();
    const input = screen.getByRole('textbox');
    expect(input.getAttribute('autocapitalize')).toBe('none');
    expect(input.getAttribute('autocorrect')).toBe('off');
    expect(input.getAttribute('autocomplete')).toBe('off');
    expect(input.getAttribute('spellcheck')).toBe('false');
    expect(input.getAttribute('enterkeyhint')).toBe('done');
  });
});

function startLevel3() {
  render(<Level3 onComplete={vi.fn()} onBack={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: /Byrja æfingar/ }));
}

function answerLevel3() {
  fireEvent.click(document.querySelector<HTMLButtonElement>('button.mc-option')!);
  fireEvent.click(screen.getByRole('button', { name: /Athuga svar/ }));
}

describe('Stig 3', () => {
  it('leaves the verdict in place on a desktop, where it replaces Athuga', () => {
    startLevel3();
    expect(scrollTo).toHaveBeenCalledWith(TOP);
    answerLevel3();
    expect(scrollBy).not.toHaveBeenCalled();
    expect(focused()?.getAttribute('aria-labelledby')).toBe('rafeind-l3-verdict');
  });

  it('on a phone shows the question down to Næsta', () => {
    phone = true;
    startLevel3();
    answerLevel3();
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 168, behavior: 'smooth' });
    expect(focused()?.getAttribute('aria-labelledby')).toBe('rafeind-l3-verdict');
  });

  it('opens each next element at the top, and drops a Næsta press within 400 ms', () => {
    startLevel3();
    answerLevel3();
    fireEvent.click(screen.getByRole('button', { name: /Næsta frumefni/ }));
    expect(screen.getByText(/Frumefni 1 \/ 8/)).toBeTruthy();

    later();
    top = -300;
    fireEvent.click(screen.getByRole('button', { name: /Næsta frumefni/ }));
    expect(scrollBy).toHaveBeenLastCalledWith({ top: -300, behavior: 'auto' });
    expect(screen.getByText(/Frumefni 2 \/ 8/)).toBeTruthy();
    expect(focused()?.textContent).toMatch(/Z = \d+/);
  });
});

describe('menu', () => {
  it('opens at the top when a student comes back, with focus on the first level not done', () => {
    localStorage.setItem(
      'rafeindabygging-progress',
      JSON.stringify({
        level1Completed: true,
        level1Score: 5,
        level2Completed: false,
        level2Score: 0,
        level3Completed: false,
        level3Score: 0,
        totalGamesPlayed: 1,
      })
    );
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Stig 3: Lotukerfi og rafeindir/ }));
    expect(scrollTo).toHaveBeenCalledWith(TOP);
    scrollTo.mockClear();

    fireEvent.click(screen.getByRole('button', { name: /Til baka/ }));
    expect(scrollTo).toHaveBeenCalledWith(TOP);
    expect(screen.getByText(/Hvað er rafeindabygging\?/)).toBeTruthy();
    expect(focused()?.getAttribute('data-level-card')).toBe('level2');
  });
});
