import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PHONE_QUERY, PIN_QUERY, revealOnDesktop } from '@shared/utils';

import App from '../App';
import { ChainBuilder } from '../components/ChainBuilder';
import { ExploreScreen } from '../components/ExploreScreen';
import { UnderstandScreen } from '../components/UnderstandScreen';
import { problemsForPhase } from '../data/problems';

/**
 * Where the page lands, and where focus goes, after the student acts.
 *
 * On a phone every tap in this game changes something away from the finger: a
 * pool card lands in the chain above the pool, the worked solution grows below
 * the fold, "Næsta dæmi" swaps the statement in at the top.
 *
 * The game used to carry its own reveal helper (`src/utils/reveal.ts`). It now
 * scrolls through the shared helpers in `@shared/utils`, and these tests hold:
 *
 * - on a desktop window, exactly what the old helper did, at any width
 *   (`revealOnDesktop`): the same trigger and the same landing, and nothing
 *   moves when the change is already on screen;
 * - on a phone, the loops the vertical-scroll pass fitted to one screen: the
 *   chain pinned under the header while the student picks from the pool, so a
 *   new card no longer jumps the page up to it, and the step that broke the
 *   chain shown together with the fixes;
 * - focus, at every width: never on `<body>` after a tap, on the feedback after
 *   a commit and never on the button that follows it, on the new problem after
 *   "Næsta dæmi", on the next phase not yet done back on the menu;
 * - a button that appears where the last one was ignores a press within
 *   400 ms, so a double tap cannot skip the feedback or answer unread.
 */

const HEADER = 56;
const VIEW = 740;

const box = (top: number, bottom: number) =>
  ({
    top,
    bottom,
    left: 0,
    right: 100,
    width: 100,
    height: bottom - top,
    x: 0,
    y: top,
    toJSON: () => ({}),
  }) as DOMRect;

/** Rects by a test on the element, first match wins; anything else sits on screen at 200–300. */
let rules: [(el: Element) => boolean, DOMRect][] = [];
let phone = false;
let portrait = false;
let clock = 1000;
const scrollBy = vi.fn();
const scrollTo = vi.fn();

beforeEach(() => {
  rules = [];
  phone = false;
  portrait = false;
  clock = 1000;
  scrollBy.mockClear();
  scrollTo.mockClear();
  localStorage.clear();
  window.scrollBy = scrollBy as unknown as typeof window.scrollBy;
  window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
  window.matchMedia = vi.fn((query: string) => ({
    matches: (query === PHONE_QUERY && phone) || (query === PIN_QUERY && portrait),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
  Object.defineProperty(window, 'innerHeight', { value: VIEW, configurable: true });
  Object.defineProperty(window, 'visualViewport', { value: undefined, configurable: true });
  vi.spyOn(performance, 'now').mockImplementation(() => clock);
  // Frames run at once, so a reveal or a focus move can be read synchronously.
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    cb(0);
    return 0;
  });
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    for (const [test, r] of rules) if (test(this)) return r;
    return box(200, 300);
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const focused = () => document.activeElement as HTMLElement | null;
/** Half a second on, past the 400 ms guard on a button that has just appeared. */
const later = () => {
  clock += 500;
};
/** Only the timers: `performance.now` stays the test's own clock, for the guard. */
const fakeTimers = () => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
const press = (name: string) => fireEvent.click(screen.getByRole('button', { name }));
const tapCard = (labelPart: string) =>
  fireEvent.click(
    screen.getAllByRole('button').find((b) => b.getAttribute('aria-label')?.includes(labelPart))!
  );

/** A sticky site header covering the top 56 px, as the shared Header is. */
function stickyHeader(position = 'sticky') {
  const header = document.createElement('header');
  header.style.position = position;
  document.body.appendChild(header);
  rules.push([(el) => el === header, box(0, HEADER)]);
}

function renderPhase(phase: 'aefa' | 'beita', predict = phase === 'aefa') {
  return render(
    <ChainBuilder
      problems={problemsForPhase(phase)}
      predictBeforeSolving={predict}
      onComplete={() => {}}
      onBack={() => {}}
    />
  );
}

/** The first card of A1 and B1, turned so grams cancel: 5,00 g Mg → mól Mg. */
function gramsToMoles() {
  tapCard(': 24,31 g Mg');
  press('Snúa við hlutfalli númer 1');
}

/** A1 solved and settled, its verdict on screen. */
function solveA1() {
  gramsToMoles();
  tapCard('atóm Mg');
  press('Leysa');
  later();
  press('Sýna öll skrefin strax');
  act(() => {
    vi.advanceTimersByTime(700);
  });
}

/** B1 with its first card upside down, run through to the correction. */
function correctionOnB1() {
  tapCard(': 24,31 g Mg');
  press('Leysa');
  later();
  press('Sýna öll skrefin strax');
  act(() => {
    vi.advanceTimersByTime(700);
  });
}

describe('revealOnDesktop: what the old helper did, on a desktop window', () => {
  function el(top: number, bottom: number) {
    const e = document.createElement('div');
    document.body.appendChild(e);
    rules.unshift([(x) => x === e, box(top, bottom)]);
    return e;
  }

  beforeEach(() => stickyHeader());

  it('does not move a box that is already on screen', () => {
    revealOnDesktop(el(100, 300));
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('brings a box below the fold up by the least distance, plus a margin', () => {
    revealOnDesktop(el(900, 1000));
    expect(scrollBy).toHaveBeenCalledWith({ top: 1000 - VIEW + 12, behavior: 'smooth' });
  });

  it('counts a box under the sticky header as hidden and brings it down below it', () => {
    revealOnDesktop(el(20, 120));
    expect(scrollBy).toHaveBeenCalledWith({ top: 20 - HEADER - 12, behavior: 'smooth' });
  });

  it('shows the start of a box taller than the screen', () => {
    revealOnDesktop(el(900, 2000));
    expect(scrollBy).toHaveBeenCalledWith({ top: 900 - HEADER - 12, behavior: 'smooth' });
  });

  it('leaves a tall box alone while its start is in the upper half of the screen', () => {
    revealOnDesktop(el(150, 1500));
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('reveals through to a second element', () => {
    revealOnDesktop(el(600, 700), el(710, 800));
    expect(scrollBy).toHaveBeenCalledWith({ top: 800 - VIEW + 12, behavior: 'smooth' });
  });

  it('ignores a header that has scrolled away with the page', () => {
    document.body.innerHTML = '';
    rules = [];
    stickyHeader('static');
    revealOnDesktop(el(10, 90));
    expect(scrollBy).not.toHaveBeenCalled();
  });
});

describe('a desktop window keeps what the game did before', () => {
  it('scrolls a new chain card into view when it lands above the screen', () => {
    rules.push([(el) => el.hasAttribute('data-slot'), box(-400, -300)]);
    renderPhase('aefa');
    tapCard(': 24,31 g Mg');

    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy.mock.calls[0][0].top).toBeLessThan(0);
  });

  it('does not scroll when the new card is on screen, or when a card is flipped or removed', () => {
    renderPhase('aefa');
    tapCard(': 24,31 g Mg');
    press('Snúa við hlutfalli númer 1');
    press('Fjarlægja hlutfall númer 1');

    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('follows the worked solution down as each step appears, then the correction', () => {
    fakeTimers();
    renderPhase('beita');
    tapCard(': 24,31 g Mg');
    rules.push([
      (el) => el.tagName === 'LI' || el.classList.contains('border-amber-400'),
      box(1200, 1300),
    ]);

    press('Leysa');
    scrollBy.mockClear();
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
    rules.push([(el) => el.classList.contains('bg-sky-50'), box(760, 840)]);
    renderPhase('aefa');
    press('Vísbending');

    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy.mock.calls[0][0].top).toBe(840 - VIEW + 12);

    press('Fela vísbendingu');
    expect(scrollBy).toHaveBeenCalledTimes(1);
  });

  it('reveals the new card and the unit it produced together in Kanna', () => {
    rules.push([(el) => el.hasAttribute('data-slot'), box(-400, -300)]);
    render(<ExploreScreen onComplete={() => {}} onBack={() => {}} />);
    tapCard(': 40,3 g MgO');

    expect(scrollBy).toHaveBeenCalledTimes(1);
  });
});

describe('a new problem and a new screen', () => {
  it('starts the next problem at the top of the page, with focus on the problem', () => {
    fakeTimers();
    renderPhase('aefa', false);
    solveA1();
    later();

    Object.defineProperty(window, 'scrollY', { value: 900, configurable: true });
    scrollBy.mockClear();
    press('Næsta dæmi');

    expect(screen.getByText('Dæmi 2 af 5')).toBeTruthy();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    // …and the return to the board does not then scroll away from the statement.
    expect(scrollBy).not.toHaveBeenCalled();
    expect(focused()?.hasAttribute('data-item-start')).toBe(true);
    expect(focused()?.textContent).toContain('250 mL');
  });

  it('opens each phase at the top of the page, with focus on its heading', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Kanna/ }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(focused()?.textContent).toBe('Prófaðu þig áfram');
  });

  it('opens Æfa with focus on its first problem, which has no heading of its own', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Æfa/ }));

    expect(focused()?.hasAttribute('data-item-start')).toBe(true);
    expect(focused()?.textContent).toContain('magnesíumborða');
  });

  it('back on the menu, focuses the next phase not yet done', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Kanna/ }));
    press('Áfram');

    expect(focused()?.getAttribute('data-phase-card')).toBe('skilja');
  });
});

describe('focus after each tap, at every width', () => {
  it('moves to the prediction after "Leysa", then to its feedback, never to the button', () => {
    renderPhase('aefa');
    gramsToMoles();
    press('Leysa');
    expect(focused()?.getAttribute('role')).toBe('group');
    expect(focused()?.textContent).toContain('Áður en við reiknum');

    later();
    press('mól Mg');
    expect(focused()?.textContent).toMatch(/^Rétt lesið úr keðjunni/);
    expect(focused()?.tagName).not.toBe('BUTTON');
  });

  it('ignores a prediction tapped within 400 ms of "Leysa", the second tap of a double tap', () => {
    renderPhase('aefa');
    gramsToMoles();
    press('Leysa');
    press('mól Mg');

    expect(screen.queryByText(/^Rétt lesið/)).toBeNull();
  });

  it('ignores "Sýna útreikninginn" within 400 ms of appearing', () => {
    renderPhase('aefa');
    gramsToMoles();
    press('Leysa');
    later();
    press('mól Mg');
    press('Sýna útreikninginn');
    expect(screen.queryByText('Byrjun')).toBeNull();

    later();
    press('Sýna útreikninginn');
    expect(screen.getByText('Byrjun')).toBeTruthy();
  });

  it('moves to the worked solution, the correction, the fix, then back to the chain', () => {
    fakeTimers();
    renderPhase('beita');
    tapCard(': 24,31 g Mg');
    press('Leysa');
    expect(focused()?.tagName).toBe('OL');
    later();
    press('Sýna öll skrefin strax');
    expect(focused()?.tagName).toBe('OL');
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(focused()?.textContent).toContain('Hvað þarf að laga?');

    later();
    press('Snúa hlutfallinu við');
    expect(focused()?.getAttribute('role')).toBe('group');
    expect(focused()?.textContent).toMatch(/^Rétt/);

    // "Laga og reyna aftur" ignores the second tap of a double tap.
    press('Laga og reyna aftur');
    expect(screen.queryByRole('button', { name: 'Leysa' })).toBeNull();
    later();
    press('Laga og reyna aftur');
    expect(focused()?.textContent).toBe('Keðjan þín');
  });

  it('ignores the board for 400 ms after "Laga og reyna aftur", so a double tap cannot empty the fixed chain', () => {
    // On a portrait phone "Byrja upp á nýtt" is pinned at the foot of the
    // screen, under where "Laga og reyna aftur" was.
    phone = true;
    portrait = true;
    fakeTimers();
    renderPhase('beita');
    correctionOnB1();
    later();
    press('Snúa hlutfallinu við');
    later();
    press('Laga og reyna aftur');

    press('Byrja upp á nýtt');
    press('Leysa');
    expect(screen.getByText('Keðjan þín')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Fjarlægja hlutfall númer 1' })).toBeTruthy();

    later();
    press('Byrja upp á nýtt');
    expect(screen.queryByRole('button', { name: 'Fjarlægja hlutfall númer 1' })).toBeNull();
  });

  it('does not guard the board a phase opens on', () => {
    renderPhase('beita');
    tapCard(': 24,31 g Mg');
    expect(screen.getByRole('button', { name: 'Fjarlægja hlutfall númer 1' })).toBeTruthy();
  });

  it('returns to the question after "Velja aftur"', () => {
    fakeTimers();
    renderPhase('beita');
    correctionOnB1();
    later();
    press('Fjarlægja hlutfallið');
    later();
    press('Velja aftur');

    expect(focused()?.textContent).toContain('Hvað þarf að laga?');
  });

  it('moves to the verdict when the chain works, and guards "Næsta dæmi"', () => {
    fakeTimers();
    renderPhase('aefa', false);
    solveA1();
    expect(focused()?.textContent).toMatch(/^Keðjan gengur upp/);

    press('Næsta dæmi');
    expect(screen.getByText('Dæmi 1 af 5')).toBeTruthy();
  });

  it('keeps focus in the chain when the pressed button goes', () => {
    renderPhase('aefa');
    tapCard(': 24,31 g Mg');
    screen.getByRole('button', { name: 'Fjarlægja hlutfall númer 1' }).focus();
    press('Fjarlægja hlutfall númer 1');
    expect(focused()?.textContent).toBe('Keðjan þín');

    tapCard(': 24,31 g Mg');
    screen.getByRole('button', { name: 'Byrja upp á nýtt' }).focus();
    press('Byrja upp á nýtt');
    expect(focused()?.textContent).toBe('Keðjan þín');
  });

  it('keeps focus in Kanna’s chain when a card is taken out', () => {
    render(<ExploreScreen onComplete={() => {}} onBack={() => {}} />);
    tapCard(': 24,31 g Mg');
    screen.getByRole('button', { name: 'Fjarlægja hlutfall númer 1' }).focus();
    press('Fjarlægja hlutfall númer 1');
    expect(focused()?.textContent).toBe('Keðjan');
  });

  it('makes each Skilja lesson a group, so turning its ratio keeps focus inside it', () => {
    render(<UnderstandScreen onComplete={() => {}} onBack={() => {}} />);
    const group = screen.getByRole('group', { name: 'Mólmassi' });
    expect(group.querySelector('button')?.textContent).toContain('Snúa hlutfallinu við');
  });
});

describe('on a phone', () => {
  beforeEach(() => {
    phone = true;
    stickyHeader();
  });

  it('does not jump the page to a new card while the chain is pinned under the header', () => {
    portrait = true;
    renderPhase('beita');
    expect(document.querySelector('[data-pinned-top]'), 'the chain did not pin').not.toBeNull();
    rules.unshift([(el) => el.hasAttribute('data-slot'), box(-400, -300)]);
    tapCard(': 24,31 g Mg');

    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('puts the actions after the pool on a portrait phone, where they pin', () => {
    portrait = true;
    renderPhase('beita');
    const pool = screen.getByText('Hlutföll í boði');
    const leysa = screen.getByRole('button', { name: 'Leysa' });
    expect(pool.compareDocumentPosition(leysa) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(leysa.closest('[data-pinned-bottom]')).not.toBeNull();
  });

  it('keeps the actions with the chain on a phone on its side, where nothing pins', () => {
    renderPhase('beita');
    const pool = screen.getByText('Hlutföll í boði');
    const leysa = screen.getByRole('button', { name: 'Leysa' });
    expect(pool.compareDocumentPosition(leysa) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
    expect(document.querySelector('[data-pinned-top],[data-pinned-bottom]')).toBeNull();
  });

  it('brings the chain in with the least move where it is not pinned', () => {
    renderPhase('beita');
    rules.unshift([(el) => el.className.includes('phone:overflow-x-auto'), box(-400, -300)]);
    tapCard(': 24,31 g Mg');

    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy.mock.calls[0][0].top).toBe(-400 - HEADER - 8);
  });

  it('shows the step that broke the chain together with the fixes', () => {
    fakeTimers();
    renderPhase('beita');
    tapCard(': 24,31 g Mg');
    // The failed step (after "Byrjun") and the fixes under it, below the screen.
    rules.unshift(
      [(el) => el.tagName === 'LI' && (el.textContent ?? '').startsWith('Skref 1'), box(900, 1000)],
      [(el) => el.parentElement?.classList.contains('border-amber-400') === true, box(1010, 1200)]
    );
    press('Leysa');
    later();
    press('Sýna öll skrefin strax');
    scrollBy.mockClear();
    act(() => {
      vi.advanceTimersByTime(700);
    });

    // The whole span, failed step through the options, lands on screen, the
    // options' foot 8 px above the bottom edge.
    expect(scrollBy).toHaveBeenCalledWith({ top: 1200 - (VIEW - 8), behavior: 'smooth' });
  });
});
