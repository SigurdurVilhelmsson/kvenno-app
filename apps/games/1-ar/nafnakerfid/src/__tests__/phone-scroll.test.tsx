// @vitest-environment jsdom
/**
 * Where the screen lands, and where focus goes, as the student moves through the game.
 *
 * The levels swap content in place, and on a phone the buttons that move on sit below the
 * content they replace. The game used to carry its own reveal helper; it now uses the shared
 * ones in `@shared/utils` (`reveal.ts`, `armed.ts`), and these tests hold it to them:
 *
 * - A screen swap starts the new screen at the top of the page — at every width, as the old
 *   helper did — and focuses its heading; back on the menu, the first level not yet done is
 *   focused.
 * - Each "next" brings the new rule, element, question or compound back when its top went
 *   above the viewport — also at every width, as before — and focuses it. A rule dot keeps
 *   focus on itself.
 * - After an answer, focus moves to the feedback, not to Næsta, so a second Enter lands on
 *   nothing; and Næsta ignores a press within 400 ms of appearing, so a second tap cannot
 *   skip the feedback either. "Athuga" and "Næsta efni" are separate elements.
 * - A tap on the feedback in its first 400 ms (the second half of a double tap on the answer,
 *   once the page has moved to show the feedback) is dropped, so 'Af hverju?' stays open.
 * - On a phone the Level 2 hint follows the buttons, and the spent Level 3 tray is hidden.
 *
 * jsdom has no layout, so every box is stubbed: each element's top is `top`.
 */
import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PHONE_QUERY } from '@shared/utils';

import App from '../App';
import { Level1, quizQuestions, shortOptions } from '../components/Level1';
import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';

const t = (_key: string, fallback?: string) => fallback ?? '';

/** Animation frames wait in a queue until `frame()` runs the ones already asked for. */
let frames = new Map<number, FrameRequestCallback>();
let lastFrame = 0;
function frame() {
  const due = [...frames.values()];
  frames = new Map();
  act(() => due.forEach((cb) => cb(0)));
}

/** A click, then the frame in which the game reveals and focuses what it opened. */
function press(el: Element) {
  fireEvent.click(el);
  frame();
}

let top = -300;
let phone = true;
let clock = 1000;
const scrollBy = vi.fn();
const scrollTo = vi.fn();

beforeEach(() => {
  localStorage.clear();
  top = -300;
  phone = true;
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
  frames = new Map();
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    frames.set(++lastFrame, cb);
    return lastFrame;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    frames.delete(id);
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
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const focused = () => document.activeElement as HTMLElement | null;

/** Past the 400 ms Næsta guard. */
function later() {
  clock += 500;
}

describe('screen swaps', () => {
  it.each([
    ['a phone', true],
    ['a desktop', false],
  ])('on %s a level opens at the top of the page, with focus on its heading', (_, isPhone) => {
    phone = isPhone;
    const view = within(render(<App />).container);
    press(view.getByRole('button', { name: /Grunnreglur/ }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(focused()?.textContent).toBe('Reglur um nafnagift');
  });

  it('back on the menu, the first level not yet done is focused', () => {
    const view = within(render(<App />).container);
    press(view.getByRole('button', { name: /Byggja nöfn/ }));
    press(view.getByRole('button', { name: 'Til baka í valmynd' }));
    expect(focused()?.getAttribute('data-level-card')).toBe('level1');
  });

  it('back on the menu with every level done, focus lands on the first level, not on the page', () => {
    localStorage.setItem(
      'nafnakerfidProgress',
      JSON.stringify({
        level1Completed: true,
        level1Score: 100,
        level2Completed: true,
        level2Score: 120,
        level3Completed: true,
        level3Score: 80,
        totalGamesPlayed: 3,
      })
    );
    const view = within(render(<App />).container);
    press(view.getByRole('button', { name: /Byggja nöfn/ }));
    press(view.getByRole('button', { name: 'Til baka í valmynd' }));
    expect(focused()?.getAttribute('data-level-card')).toBe('level1');
  });

  it('on a phone, the warm-up starts at the top with its heading focused', () => {
    const view = within(render(<Level1 t={t} onComplete={vi.fn()} onBack={vi.fn()} />).container);
    fireEvent.click(view.getByRole('button', { name: /Regla 4/ }));
    scrollTo.mockClear();
    press(view.getByRole('button', { name: /Hefja próf/ }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(focused()?.textContent).toBe('Upphitun: Málmur eða málmleysingi?');
  });
});

describe('Level 1', () => {
  it.each([
    ['a phone', true],
    ['a desktop', false],
  ])(
    'on %s, "Næsta regla" brings the new rule back where it went above the screen',
    (_, isPhone) => {
      phone = isPhone;
      const view = within(render(<Level1 t={t} onComplete={vi.fn()} onBack={vi.fn()} />).container);
      press(view.getByRole('button', { name: /Næsta regla/ }));
      // No sticky header on a level screen: the rule card lands at the very top,
      // exactly where the old scrollIntoView({ block: 'start' }) put it.
      expect(scrollBy).toHaveBeenCalledWith({ top: -300, behavior: 'smooth' });
      expect(focused()?.textContent).toBe('Málmar með breytilega hleðslu');
    }
  );

  it('nothing moves when the new rule is already in view', () => {
    top = 40;
    const view = within(render(<Level1 t={t} onComplete={vi.fn()} onBack={vi.fn()} />).container);
    press(view.getByRole('button', { name: /Næsta regla/ }));
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('a rule dot keeps focus on itself', () => {
    const view = within(render(<Level1 t={t} onComplete={vi.fn()} onBack={vi.fn()} />).container);
    const dot = view.getByRole('button', { name: /Regla 3/ });
    dot.focus();
    press(dot);
    expect(focused()).toBe(dot);
    expect(view.getByRole('heading', { level: 2 }).textContent).toBe('Fjölatóma jónir');
  });

  function toWarmup() {
    const view = within(render(<Level1 t={t} onComplete={vi.fn()} onBack={vi.fn()} />).container);
    fireEvent.click(view.getByRole('button', { name: /Regla 4/ }));
    press(view.getByRole('button', { name: /Hefja próf/ }));
    return view;
  }

  it('warm-up: the answer moves focus to the verdict, and Næsta ignores an early press', () => {
    const view = toWarmup();
    press(view.getByRole('button', { name: /Málmleysingi/ }));
    const verdict = view.getByRole('group', { name: /Ekki rétt/ });
    expect(focused()).toBe(verdict);

    press(view.getByRole('button', { name: /Næsta frumefni/ }));
    expect(view.getByText('Na')).toBeTruthy();
    later();
    press(view.getByRole('button', { name: /Næsta frumefni/ }));
    expect(view.getByText('Cl')).toBeTruthy();
    // The new element is the item start, and focus goes there.
    expect(focused()?.textContent).toContain('Klór');
  });

  function toQuiz() {
    const view = toWarmup();
    for (let i = 0; i < 8; i++) {
      press(view.getByRole('button', { name: /^Málmur/ }));
      later();
      press(view.getByRole('button', { name: /Næsta frumefni|Hefja próf/ }));
    }
    return view;
  }

  it.each([
    ['a phone', true, true],
    ['a desktop', false, false],
  ])(
    'quiz on %s: the answer moves focus to the feedback group (scrolls: %s)',
    (_, isPhone, scrolls) => {
      phone = isPhone;
      const view = toQuiz();
      scrollBy.mockClear();
      press(view.getByRole('button', { name: /^B\./ }));
      const group = focused();
      expect(group?.getAttribute('role')).toBe('group');
      expect(group?.querySelector('.feedback-panel')).not.toBeNull();
      expect(scrollBy.mock.calls.length > 0).toBe(scrolls);
    }
  );

  it('quiz: Næsta ignores an early press and then brings the next question', () => {
    const view = toQuiz();
    press(view.getByRole('button', { name: /^B\./ }));
    press(view.getByRole('button', { name: /Næsta spurning/ }));
    expect(view.getByText(quizQuestions[0].question)).toBeTruthy();
    later();
    press(view.getByRole('button', { name: /Næsta spurning/ }));
    expect(view.getByText(quizQuestions[1].question)).toBeTruthy();
    expect(focused()?.textContent).toContain(quizQuestions[1].question);
  });

  it("quiz: a tap on 'Af hverju?' in the answer's first 400 ms is dropped, not folded shut", () => {
    const view = toQuiz();
    press(view.getByRole('button', { name: /^B\./ }));
    const why = view.getByRole('button', { name: /Af hverju/ });
    press(why);
    expect(why.getAttribute('aria-expanded')).toBe('true');
    later();
    press(why);
    expect(why.getAttribute('aria-expanded')).toBe('false');
  });

  it('only short options sit two to a row on a phone', () => {
    expect(shortOptions(['-íð (klóríð)', '-at (klórat)'])).toBe(true);
    expect(shortOptions(['Magnesíumoxíð', 'Magnesíum(II)oxíð'])).toBe(false);
    expect(quizQuestions.filter((q) => shortOptions(q.options)).map((q) => q.id)).toEqual([
      1, 5, 6,
    ]);
  });
});

describe('Level 2', () => {
  /** Step 1 moves on by itself after 1.5 s; only timeouts are faked, so the guard clock stays. */
  function render2() {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    return within(render(<Level2 t={t} onComplete={vi.fn()} onBack={vi.fn()} />).container);
  }
  function chooseType(view: ReturnType<typeof render2>, name: RegExp) {
    press(view.getByRole('button', { name }));
    act(() => {
      vi.advanceTimersByTime(1600);
    });
  }

  it('Step 1: the choice moves focus to the verdict; a desktop scrolls the least that shows it', () => {
    phone = false;
    const view = render2();
    press(view.getByRole('button', { name: /^Sameind/ }));
    expect(focused()?.id).toBe('nk-l2-type-verdict');
    expect(scrollBy).toHaveBeenCalledWith({ top: -300, behavior: 'smooth' });
  });

  it('Step 2 focuses its heading; Step 3 leaves focus in the field', () => {
    const view = render2();
    chooseType(view, /^Einfalt jónefni/);
    expect(focused()?.textContent).toBe('Skref 2: Hvernig er nafnið byggt upp?');
    press(view.getByRole('button', { name: /skrifa nafnið/ }));
    expect(focused()).toBe(view.getByRole('textbox'));
  });

  it('the check moves focus to the verdict group, and Næsta ignores an early press', () => {
    const view = render2();
    chooseType(view, /^Einfalt jónefni/);
    press(view.getByRole('button', { name: /skrifa nafnið/ }));
    fireEvent.change(view.getByRole('textbox'), { target: { value: 'Kalíumbrómíð' } });
    press(view.getByRole('button', { name: 'Athuga svar' }));
    expect(focused()).toBe(view.getByRole('group', { name: 'Rétt!' }));
    press(view.getByRole('button', { name: /Næsta efnasamband/ }));
    expect(view.getByText('KBr')).toBeTruthy();
  });

  it.each([
    ['a phone', true],
    ['a desktop', false],
  ])('on %s the next compound lands on its formula, and only there', (_, isPhone) => {
    phone = isPhone;
    const view = render2();
    chooseType(view, /^Einfalt jónefni/);
    press(view.getByRole('button', { name: /skrifa nafnið/ }));
    fireEvent.change(view.getByRole('textbox'), { target: { value: 'Kalíumbrómíð' } });
    press(view.getByRole('button', { name: 'Athuga svar' }));
    later();
    scrollBy.mockClear();
    press(view.getByRole('button', { name: /Næsta efnasamband/ }));
    // Item and step change together; a second scroll to the step panel would
    // carry the formula Step 1 asks about back out of view.
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy).toHaveBeenCalledWith({ top: -300, behavior: 'smooth' });
    expect(focused()?.textContent).toBe('CaO');
  });

  it.each([
    ['a phone', true, 'after'],
    ['a desktop', false, 'before'],
  ])('on %s the hint sits %s the buttons, and takes focus', (_, isPhone, where) => {
    phone = isPhone;
    const view = render2();
    chooseType(view, /^Einfalt jónefni/);
    press(view.getByRole('button', { name: /skrifa nafnið/ }));
    press(view.getByRole('button', { name: /Vísbending/ }));
    const hint = view.getByText(/K er málmur í hópi 1/).closest('div.rounded-xl') as HTMLElement;
    expect(focused()).toBe(hint);
    const check = view.getByRole('button', { name: 'Athuga svar' });
    const after = !!(check.compareDocumentPosition(hint) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(after ? 'after' : 'before').toBe(where);
  });
});

describe('Level 3', () => {
  function tray(view: ReturnType<typeof within>) {
    return view.getByText('Tiltækir partar:').parentElement as HTMLElement;
  }

  it('"Athuga" never turns into "Næsta efni" in place, and focus moves to the feedback', () => {
    const view = within(render(<Level3 t={t} onComplete={vi.fn()} onBack={vi.fn()} />).container);
    press(within(tray(view)).getAllByRole('button')[0]);
    const check = view.getByRole('button', { name: 'Athuga' });
    press(check);
    expect(check.isConnected).toBe(false);
    const next = view.getByRole('button', { name: /Næsta efni/ });
    expect(next).not.toBe(check);
    const group = focused();
    expect(group?.getAttribute('role')).toBe('group');
    expect(group?.querySelector('.feedback-panel')).not.toBeNull();
    // On a phone the spent tray gives its place to the feedback.
    expect(tray(view).className).toContain('phone:hidden');
  });

  it('"Næsta efni" ignores an early press, then brings the next formula back and focuses it', () => {
    phone = false;
    const view = within(render(<Level3 t={t} onComplete={vi.fn()} onBack={vi.fn()} />).container);
    press(within(tray(view)).getAllByRole('button')[0]);
    press(view.getByRole('button', { name: 'Athuga' }));
    const first = view.getByText('Efnaformúla:').parentElement?.textContent;
    press(view.getByRole('button', { name: /Næsta efni/ }));
    expect(view.getByText('Efnaformúla:').parentElement?.textContent).toBe(first);
    later();
    scrollBy.mockClear();
    press(view.getByRole('button', { name: /Næsta efni/ }));
    expect(view.getByText('Efnaformúla:').parentElement?.textContent).not.toBe(first);
    // At any width, as the old helper did, and to the very top.
    expect(scrollBy).toHaveBeenCalledWith({ top: -300, behavior: 'smooth' });
    expect(focused()?.textContent).toContain('Efnaformúla:');
  });

  it("a tap on 'Af hverju?' in the answer's first 400 ms is dropped, not folded shut", () => {
    const view = within(render(<Level3 t={t} onComplete={vi.fn()} onBack={vi.fn()} />).container);
    press(within(tray(view)).getAllByRole('button')[0]);
    press(view.getByRole('button', { name: 'Athuga' }));
    const why = view.getByRole('button', { name: /Af hverju/ });
    press(why);
    expect(why.getAttribute('aria-expanded')).toBe('true');
    later();
    press(why);
    expect(why.getAttribute('aria-expanded')).toBe('false');
  });

  it('"Reyna aftur" brings the tray back and focuses the name being built', () => {
    const view = within(render(<Level3 t={t} onComplete={vi.fn()} onBack={vi.fn()} />).container);
    // One part is never a whole name, so this answer is wrong.
    press(within(tray(view)).getAllByRole('button')[0]);
    press(view.getByRole('button', { name: 'Athuga' }));
    later();
    press(view.getByRole('button', { name: 'Reyna aftur' }));
    expect(tray(view).className).not.toContain('phone:hidden');
    expect(focused()?.textContent).toBe('Veldu parta hér að neðan...');
  });
});
