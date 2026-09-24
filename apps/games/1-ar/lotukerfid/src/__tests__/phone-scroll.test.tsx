// @vitest-environment jsdom
/**
 * Where the screen lands, where focus goes, and what the table shows, as a
 * student plays on a phone.
 *
 * The game's own helper (`utils/phoneScroll.ts`) is gone: it scrolls through
 * the shared helpers in `@shared/utils` now (`reveal.ts`, `armed.ts`), and these
 * tests hold it to them.
 *
 * - The table: whatever it points at — the highlighted cells, the correct one,
 *   the one just tapped — is brought into its sideways-scrolling box, their
 *   joint extent centred when it fits, else the primary cell. That was the old
 *   `revealScrollLeft`, and is now `revealInline(…, { inline: 'center' })`.
 * - On a phone the swipe hint goes once the student has swiped the table, the
 *   empty seventh period is a thin placeholder strip, and the legend starts
 *   closed behind a button.
 * - A screen swap focuses the screen's heading, a new question focuses the
 *   question (the answer field, on a typed one), and an answer focuses the
 *   feedback, never "Næsta", which ignores a press within 400 ms of appearing.
 * - Below md but wider than a phone, the page still scrolls exactly where the
 *   old helper scrolled it; from md up, it never scrolls.
 *
 * jsdom has no layout, so boxes are stubbed.
 */
import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PHONE_QUERY } from '@shared/utils';

import App from '../App';
import { Level1 } from '../components/Level1';
import { Level2, generateQuestions as level2Questions, optionsTwoUp } from '../components/Level2';
import { Level3 } from '../components/Level3';
import { PeriodicTable } from '../components/PeriodicTable';
import { ELEMENTS } from '../data/elements';

type Layout = 'phone' | 'tablet' | 'desktop';
let layout: Layout = 'phone';
let clock = 1000;
/** Where every box outside the table is, as far as the game can tell. */
let top = -300;
const scrollBy = vi.fn();
const scrollTo = vi.fn();

let frames = new Map<number, FrameRequestCallback>();
let lastFrame = 0;
/** Runs the animation frames asked for so far: where the game reveals and focuses after a commit. */
function frame() {
  const due = [...frames.values()];
  frames = new Map();
  act(() => due.forEach((cb) => cb(0)));
}

function press(el: Element) {
  fireEvent.click(el);
  frame();
}

const focused = () => document.activeElement as HTMLElement | null;

/** A cell's box: 46 px wide, 48 px apart, 6 px in from the box, less the box's scroll. */
function cellLeft(el: Element): number | null {
  const symbol = el.getAttribute('aria-label')?.match(/\(([A-Z][a-z]?)\)/)?.[1];
  const element = ELEMENTS.find((e) => e.symbol === symbol);
  const box = el.closest<HTMLElement>('.overflow-x-auto');
  if (!element || !box) return null;
  return 6 + (element.group - 1) * 48 - box.scrollLeft;
}

beforeEach(() => {
  localStorage.clear();
  layout = 'phone';
  clock = 1000;
  top = -300;
  scrollBy.mockClear();
  scrollTo.mockClear();
  window.scrollBy = scrollBy as unknown as typeof window.scrollBy;
  window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
  window.matchMedia = vi.fn((query: string) => ({
    matches:
      (query === PHONE_QUERY && layout === 'phone') ||
      (query === '(max-width: 47.99rem)' && layout !== 'desktop'),
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
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const left = this.classList.contains('element-cell') ? cellLeft(this) : null;
    const box = this.classList.contains('overflow-x-auto');
    const r =
      left !== null
        ? { top: 300, height: 46, left, width: 46 }
        : box
          ? { top: 300, height: 330, left: 0, width: 316 }
          : { top, height: 100, left: 0, width: 100 };
    return {
      ...r,
      bottom: r.top + r.height,
      right: r.left + r.width,
      x: r.left,
      y: r.top,
      toJSON: () => ({}),
    } as DOMRect;
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('the table', () => {
  /**
   * A table whose box scrolls sideways, as it does below md: 316 px of view
   * over 18 columns. Rendered first with nothing highlighted, so the box can be
   * given its size before the table points at anything.
   */
  function table(Table: typeof PeriodicTable = PeriodicTable) {
    const view = render(<Table interactive={false} />);
    const box = view.container.querySelector<HTMLElement>('.overflow-x-auto')!;
    box.style.overflowX = 'auto';
    let left = 0;
    Object.defineProperty(box, 'scrollLeft', {
      get: () => left,
      set: (v: number) => (left = v),
      configurable: true,
    });
    Object.defineProperty(box, 'scrollWidth', { value: 6 + 18 * 48 + 4, configurable: true });
    Object.defineProperty(box, 'clientWidth', { value: 316, configurable: true });
    const boxScroll = vi.fn(({ left: to }: ScrollToOptions) => (left = to ?? left));
    box.scrollTo = boxScroll as unknown as typeof box.scrollTo;
    const point = (symbols: string[], extra: Partial<Parameters<typeof PeriodicTable>[0]> = {}) =>
      view.rerender(
        <Table interactive={false} highlightedElements={new Set(symbols)} {...extra} />
      );
    return { view, box, boxScroll, point };
  }

  it('centres an off-screen cell it points at', () => {
    const { boxScroll, point } = table();
    point(['Kr']);
    // Kr is group 18: 6 + 17·48 = 822..868. Centred in 316 px it would be 845 - 158 = 687,
    // past the box's end, so the box stops at its end, 874 - 316 = 558.
    expect(boxScroll).toHaveBeenCalledWith({ left: 558, behavior: 'smooth' });
  });

  it('shows cells in one period together when they fit', () => {
    const { box, boxScroll, point } = table();
    point(['N', 'S', 'Ge']);
    expect(boxScroll).toHaveBeenCalledTimes(1);
    // Groups 14–16: 630..772, centred → 701 - 158 = 543.
    expect(box.scrollLeft).toBe(543);
  });

  it('keeps the correct cell in view when the tapped one is too far from it', () => {
    const { box, point } = table();
    point(['Ni'], { correctElement: 'Ni', wrongElement: 'H' });
    // Ni (group 10) and H (group 1) do not fit together: Ni is centred.
    expect(box.scrollLeft).toBe(6 + 9 * 48 + 23 - 158);
  });

  it('leaves the box alone when everything is in view, and starts a new question at the left', () => {
    const { box, boxScroll, point } = table();
    point(['H', 'Li']);
    expect(boxScroll).not.toHaveBeenCalled();
    box.scrollLeft = 200;
    point([]);
    expect(box.scrollLeft).toBe(0);
  });

  it('never scrolls a box that does not overflow (md and up)', () => {
    const { box, boxScroll, point } = table();
    Object.defineProperty(box, 'scrollWidth', { value: 316, configurable: true });
    point(['Kr']);
    expect(boxScroll).not.toHaveBeenCalled();
  });

  it('drops the swipe hint on a phone once the student has swiped, from the next question on', async () => {
    // The flag is page-wide, so this test gets a table module of its own.
    vi.resetModules();
    const { PeriodicTable: Fresh } = await import('../components/PeriodicTable');
    const { view, box, point } = table(Fresh);
    const hint = () => view.getByText(/Strjúktu til hliðar/);
    expect(hint().classList.contains('phone:hidden')).toBe(false);
    // The table's own reveal is not a swipe.
    fireEvent.scroll(box);
    point(['Kr']);
    expect(hint().classList.contains('phone:hidden')).toBe(false);
    // A scroll under the student's finger is — but the hint stays until the
    // table points at something new, so nothing moves under the finger.
    fireEvent.touchStart(box);
    fireEvent.scroll(box);
    fireEvent.touchEnd(box);
    expect(hint().classList.contains('phone:hidden')).toBe(false);
    point(['He']);
    expect(hint().classList.contains('phone:hidden')).toBe(true);
    // Later tables on the page start without it.
    cleanup();
    render(<Fresh />);
    expect(
      within(document.body)
        .getByText(/Strjúktu/)
        .classList.contains('phone:hidden')
    ).toBe(true);
  });

  it('keeps the empty seventh period as a placeholder strip on a phone', () => {
    const { view } = table();
    const strips = view.container.querySelectorAll('.phone\\:h-3');
    expect(strips).toHaveLength(18);
    // 7 periods × 18 cells plus the group numbers, as before.
    expect(view.getByRole('grid').children).toHaveLength(18 + 7 * 18);
  });

  it('puts the legend behind a closed button on a phone, and shows it everywhere else', () => {
    const { view } = table();
    const button = view.getByRole('button', { name: 'Tegundir frumefna' });
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(view.getByText('Al — Alkalímálmar').closest('[hidden]')).not.toBeNull();
    fireEvent.click(button);
    expect(view.getByText('Al — Alkalímálmar').closest('[hidden]')).toBeNull();

    cleanup();
    layout = 'desktop';
    const desk = render(<PeriodicTable />);
    expect(desk.queryByRole('button', { name: 'Tegundir frumefna' })).toBeNull();
    expect(desk.getByText('Al — Alkalímálmar').closest('[hidden]')).toBeNull();
  });
});

describe('Stig 1', () => {
  function toPlay() {
    const view = render(<Level1 onBack={vi.fn()} onComplete={vi.fn()} />);
    fireEvent.click(view.getByRole('button', { name: /Byrja æfingar/ }));
    return view;
  }

  /** The first thing the current question offers: an option, or the cell for vetni. */
  function firstAnswer(view: ReturnType<typeof toPlay>) {
    const option = view.container.querySelector<HTMLElement>('div.grid.grid-cols-2 > button');
    return option ?? view.getAllByRole('button', { name: /\(H\), sætistala 1,/ })[0];
  }

  /** Reads the question for half a second, then answers it with the first thing it offers. */
  function answer(view: ReturnType<typeof toPlay>) {
    clock += 500;
    press(firstAnswer(view));
  }

  it('opens the questions at the top, with the level heading focused', () => {
    toPlay();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(focused()?.tagName).toBe('H1');
    expect(focused()?.textContent).toBe('Þekkja frumefni');
  });

  it('after an answer focuses the feedback, and drops a Næsta press within 400 ms', () => {
    const view = toPlay();
    const question = view.container.querySelector('[data-item-start]')!.textContent;
    answer(view);
    const feedback = focused();
    expect(feedback?.getAttribute('role')).toBe('group');
    expect(feedback?.querySelector('[role=alert]')).not.toBeNull();
    const next = view.getByRole('button', { name: /Næsta spurning/ });
    expect(feedback?.contains(next)).toBe(false);

    clock += 150;
    fireEvent.click(next);
    expect(view.getByText('1/10')).toBeTruthy();

    clock += 400;
    scrollBy.mockClear();
    fireEvent.click(view.getByRole('button', { name: /Næsta spurning/ }));
    expect(view.getByText('2/10')).toBeTruthy();
    // The new question's card was above the screen: it comes back under its top.
    expect(scrollBy).toHaveBeenCalledWith({ top: -308, behavior: 'smooth' });
    expect(focused()?.hasAttribute('data-item-start')).toBe(true);
    expect(focused()?.textContent).not.toBe(question);
  });

  it('ignores an answer within 400 ms of a question appearing', () => {
    // The second tap of a double tap on "Byrja æfingar" or "Næsta" lands on the new question.
    const view = toPlay();
    press(firstAnswer(view));
    expect(view.container.querySelector('.feedback-panel')).toBeNull();
    clock += 400;
    press(firstAnswer(view));
    expect(view.container.querySelector('.feedback-panel')).not.toBeNull();

    clock += 500;
    fireEvent.click(view.getByRole('button', { name: /Næsta spurning/ }));
    press(firstAnswer(view));
    expect(view.container.querySelector('.feedback-panel')).toBeNull();
    expect(view.getByText('2/10')).toBeTruthy();
  });

  it('opening the hint focuses the hint, not <body>', () => {
    const view = toPlay();
    press(view.getByRole('button', { name: /Vísbending/ }));
    expect(focused()?.textContent?.startsWith('Vísbending:')).toBe(true);
  });

  it('the results open at their heading, and their buttons ignore a press within 400 ms', () => {
    const onComplete = vi.fn();
    const view = render(<Level1 onBack={vi.fn()} onComplete={onComplete} />);
    fireEvent.click(view.getByRole('button', { name: /Byrja æfingar/ }));
    for (let i = 0; i < 10; i++) {
      answer(view);
      clock += 500;
      fireEvent.click(view.getByRole('button', { name: /Næsta spurning|Sjá niðurstöður/ }));
    }
    expect(focused()?.textContent).toBe('Niðurstöður');
    fireEvent.click(view.getByRole('button', { name: 'Ljúka stigi' }));
    expect(onComplete).not.toHaveBeenCalled();
    clock += 500;
    fireEvent.click(view.getByRole('button', { name: 'Ljúka stigi' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('below md but wider than a phone, scrolls where the old helper did', () => {
    layout = 'tablet';
    const view = toPlay();
    // Each screen and question starts at the top of the page, in one jump, as the old
    // helper's window.scrollTo({ top: 0 }) did …
    expect(scrollBy).toHaveBeenCalledWith({ top: -308, behavior: 'auto' });
    expect(scrollTo).not.toHaveBeenCalled();
    scrollBy.mockClear();
    // … and the feedback is brought into view the way scrollIntoView('nearest') did: its
    // bottom, 700, to the bottom of the 640 px screen.
    top = 600;
    answer(view);
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy).toHaveBeenCalledWith({ top: 60, behavior: 'smooth' });
  });

  it('from md up, moves focus but never the page', () => {
    layout = 'desktop';
    const view = toPlay();
    answer(view);
    expect(focused()?.getAttribute('role')).toBe('group');
    clock += 500;
    fireEvent.click(view.getByRole('button', { name: /Næsta spurning/ }));
    expect(focused()?.hasAttribute('data-item-start')).toBe(true);
    expect(scrollBy).not.toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();
  });
});

describe('Stig 2', () => {
  function toPlay() {
    const view = render(<Level2 onBack={vi.fn()} onComplete={vi.fn()} />);
    fireEvent.click(view.getByRole('button', { name: /Byrja æfingar/ }));
    return view;
  }
  const options = (view: ReturnType<typeof toPlay>) =>
    view.container.querySelector<HTMLElement>('.max-w-2xl.grid')!;

  it('on a phone puts the table between the question and the options', () => {
    const view = toPlay();
    const grid = view.getByRole('grid', { name: 'Lotukerfið' });
    const question = view.container.querySelector('[data-item-start]')!;
    const order = (a: Node, b: Node) => a.compareDocumentPosition(b);
    expect(order(question, grid) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(order(grid, options(view)) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('everywhere else keeps the table after the options', () => {
    layout = 'desktop';
    const view = toPlay();
    const grid = view.getByRole('grid', { name: 'Lotukerfið' });
    expect(
      options(view).compareDocumentPosition(grid) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('after an answer focuses the feedback; Næsta focuses the next question', () => {
    const view = toPlay();
    // Within 400 ms of the question appearing a tap is not an answer.
    press(options(view).querySelector('button')!);
    expect(view.container.querySelector('.feedback-panel')).toBeNull();
    clock += 500;
    press(options(view).querySelector('button')!);
    expect(focused()?.getAttribute('role')).toBe('group');
    clock += 500;
    fireEvent.click(view.getByRole('button', { name: /Næsta spurning/ }));
    expect(focused()?.hasAttribute('data-item-start')).toBe(true);
  });

  it('sets only short options two to a row on a phone', () => {
    const twoUp = new Set<string>();
    for (let run = 0; run < 100; run++) {
      for (const q of level2Questions()) {
        if (optionsTwoUp(q.options)) twoUp.add(q.type);
        // A group sentence is never squeezed into half a 320 px card.
        if (q.type === 'group-property') expect(optionsTwoUp(q.options)).toBe(false);
      }
    }
    expect([...twoUp].sort()).toEqual(['classify', 'order-by-mass', 'trend']);
    expect(optionsTwoUp(['Köfnunarefni (N)', 'Súrefni (O)'])).toBe(true);
    expect(optionsTwoUp(['Þau eru öll jarðalkalímálmar'])).toBe(false);
  });
});

describe('Stig 3', () => {
  it('keeps focus in the answer field on a typed question, and on the question otherwise', () => {
    const view = render(<Level3 onBack={vi.fn()} onComplete={vi.fn()} />);
    fireEvent.click(view.getByRole('button', { name: /Byrja æfingar/ }));
    let typed = 0;
    let table = 0;
    for (let i = 0; i < 8; i++) {
      clock += 500;
      const input = view.queryByPlaceholderText('t.d. 12');
      if (input) {
        typed++;
        expect(focused()).toBe(input);
        fireEvent.change(input, { target: { value: '1' } });
        press(view.getByRole('button', { name: 'Athuga' }));
      } else {
        table++;
        if (i > 0) expect(focused()?.textContent).toMatch(/^Hvaða frumefni hefur/);
        press(view.getAllByRole('button', { name: /\(H\), sætistala 1,/ })[0]);
      }
      // Athuga is gone, not relabelled; focus is in the feedback.
      expect(view.queryByRole('button', { name: 'Athuga' })).toBeNull();
      expect(focused()?.getAttribute('role')).toBe('group');
      clock += 500;
      fireEvent.click(view.getByRole('button', { name: /Næsta spurning|Sjá niðurstöður/ }));
    }
    expect(typed).toBe(6);
    expect(table).toBe(2);
    expect(focused()?.textContent).toBe('Niðurstöður');
  });
});

describe('the menu', () => {
  it('opens a level at its top, and on return focuses the first level not yet done', () => {
    localStorage.setItem(
      'lotukerfidProgress',
      JSON.stringify({ level1Completed: true, level2Completed: false, level3Completed: false })
    );
    const view = render(<App />);
    fireEvent.click(view.getByRole('button', { name: /Stig 3: Atómbygging/ }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(focused()?.textContent).toBe('Bygging atómsins — Kennsla');
    fireEvent.click(view.getByRole('button', { name: /Til baka/ }));
    expect(focused()?.getAttribute('data-level-card')).toBe('2');
  });

  it('focuses the first level once all are done', () => {
    localStorage.setItem(
      'lotukerfidProgress',
      JSON.stringify({ level1Completed: true, level2Completed: true, level3Completed: true })
    );
    const view = render(<App />);
    fireEvent.click(view.getByRole('button', { name: /Stig 2: Flokkar/ }));
    fireEvent.click(view.getByRole('button', { name: /Til baka/ }));
    expect(focused()?.getAttribute('data-level-card')).toBe('1');
  });
});
