import { createElement, useRef, useState, type ReactNode } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  PHONE_QUERY,
  focusTarget,
  isPhone,
  prefersReducedMotion,
  revealInline,
  revealSpan,
  revealTop,
  usableArea,
  useIsPhone,
  useItemTop,
  useRevealAfterCommit,
  useScreenTop,
} from '../reveal';

/*
 * jsdom has no layout, so every rect here is stubbed. The viewport is a
 * 360x640 phone unless a test says otherwise; the sticky header, where there is
 * one, covers the top 56 px. `lo`/`hi` in the comments are the usable band less
 * the helpers' 8 px margin.
 */

let phone = true;
let reduced = false;
let scrollBy: ReturnType<typeof vi.fn>;
let scrollTo: ReturnType<typeof vi.fn>;

function stubMatchMedia() {
  window.matchMedia = vi.fn((query: string) => ({
    matches:
      (query === PHONE_QUERY && phone) || (query === '(prefers-reduced-motion: reduce)' && reduced),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

function rect(el: Element, top: number, height: number, left = 0, width = 300) {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    top,
    bottom: top + height,
    height,
    left,
    right: left + width,
    width,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect);
}

function add(tag = 'div', parent: Element = document.body): HTMLElement {
  const el = document.createElement(tag);
  parent.appendChild(el);
  return el;
}

function stickyHeader(height = 56): HTMLElement {
  const header = add('header');
  header.style.position = 'sticky';
  rect(header, 0, height);
  return header;
}

beforeEach(() => {
  phone = true;
  reduced = false;
  stubMatchMedia();
  Object.defineProperty(window, 'innerHeight', { value: 640, configurable: true });
  Object.defineProperty(window, 'visualViewport', { value: undefined, configurable: true });
  scrollBy = vi.fn();
  scrollTo = vi.fn();
  window.scrollBy = scrollBy as unknown as typeof window.scrollBy;
  window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('isPhone / prefersReducedMotion', () => {
  it('follow matchMedia', () => {
    expect(isPhone()).toBe(true);
    phone = false;
    expect(isPhone()).toBe(false);
    expect(prefersReducedMotion()).toBe(false);
    reduced = true;
    expect(prefersReducedMotion()).toBe(true);
  });

  it('are false where matchMedia is missing, so jsdom and SSR never scroll', () => {
    // @ts-expect-error -- simulating an environment without matchMedia
    delete window.matchMedia;
    expect(isPhone()).toBe(false);
    expect(prefersReducedMotion()).toBe(false);
  });

  it('PHONE_QUERY is the two phone queries, OR-ed', () => {
    expect(PHONE_QUERY).toBe('(max-width: 639.98px), (max-height: 500px)');
  });
});

describe('usableArea', () => {
  it('is the whole viewport with no header', () => {
    expect(usableArea()).toEqual({ top: 0, bottom: 640 });
  });

  it('starts below a sticky header', () => {
    stickyHeader();
    expect(usableArea()).toEqual({ top: 56, bottom: 640 });
  });

  it('ignores a static header (a phone on its side)', () => {
    const header = add('header');
    rect(header, 0, 56);
    expect(usableArea()).toEqual({ top: 0, bottom: 640 });
  });

  it('subtracts a stuck [data-pinned-top] strip under the header', () => {
    stickyHeader();
    const strip = add();
    strip.setAttribute('data-pinned-top', '');
    strip.style.position = 'sticky';
    rect(strip, 56, 60);
    expect(usableArea().top).toBe(116);
  });

  it('does not subtract a pinned strip that is still in the flow further down', () => {
    stickyHeader();
    const strip = add();
    strip.setAttribute('data-pinned-top', '');
    strip.style.position = 'sticky';
    rect(strip, 300, 60);
    expect(usableArea().top).toBe(56);
  });

  it('subtracts a stuck [data-pinned-bottom] bar', () => {
    const bar = add();
    bar.setAttribute('data-pinned-bottom', '');
    bar.style.position = 'sticky';
    rect(bar, 572, 68);
    expect(usableArea()).toEqual({ top: 0, bottom: 572 });
  });

  it('does not subtract a bottom bar that sits in the flow above the edge', () => {
    const bar = add();
    bar.setAttribute('data-pinned-bottom', '');
    bar.style.position = 'sticky';
    rect(bar, 200, 68);
    expect(usableArea().bottom).toBe(640);
  });

  it('measures the visual viewport, which the soft keyboard shrinks', () => {
    Object.defineProperty(window, 'visualViewport', {
      value: { height: 340, offsetTop: 0 },
      configurable: true,
    });
    expect(usableArea()).toEqual({ top: 0, bottom: 340 });
  });
});

describe('revealSpan', () => {
  function loop(questionTop: number, verdictTop: number, nextBottom: number) {
    const question = add();
    const verdict = add();
    const next = add('button');
    rect(question, questionTop, 40);
    rect(verdict, verdictTop, 40);
    rect(next, nextBottom - 44, 44);
    return { question, verdict, next };
  }

  it('is a no-op on desktop', () => {
    phone = false;
    const { question, verdict, next } = loop(300, 500, 900);
    revealSpan(next, [question, verdict]);
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('scrolls on desktop only when asked to keep an any-width helper', () => {
    phone = false;
    const { question, verdict, next } = loop(300, 500, 900);
    revealSpan(next, [question, verdict], { anyWidth: true });
    expect(scrollBy).toHaveBeenCalledWith({ top: 268, behavior: 'smooth' });
  });

  it('does not move when the widest span is already on screen', () => {
    const { question, verdict, next } = loop(100, 300, 600);
    revealSpan(next, [question, verdict]);
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('shows the widest span that fits, by the least move', () => {
    // question 300 → Næsta 800 is 500 px, inside 632 - 8 = 624 px: move 800 - 632.
    const { question, verdict, next } = loop(300, 500, 800);
    revealSpan(next, [question, verdict]);
    expect(scrollBy).toHaveBeenCalledWith({ top: 168, behavior: 'smooth' });
  });

  it('falls back to a later candidate when the question is too far above', () => {
    // question -300 → Næsta 700 is 1000 px and cannot fit; verdict 400 → 700 can.
    const { question, verdict, next } = loop(-300, 400, 700);
    revealSpan(next, [question, verdict]);
    expect(scrollBy).toHaveBeenCalledWith({ top: 68, behavior: 'smooth' });
  });

  it('brings a span back down when its top is above the usable area', () => {
    // verdict -100 → Næsta 300 fits: move up to put the verdict at lo = 8.
    const { verdict, next } = loop(-900, -100, 300);
    revealSpan(next, [verdict]);
    expect(scrollBy).toHaveBeenCalledWith({ top: -108, behavior: 'smooth' });
  });

  it('with nothing fitting, aligns the verdict to the top — never Næsta alone', () => {
    const { question, verdict, next } = loop(-300, 900, 2000);
    revealSpan(next, [question, verdict]);
    expect(scrollBy).toHaveBeenCalledWith({ top: 892, behavior: 'smooth' });
  });

  it('with nothing fitting, leaves a verdict the student is already reading', () => {
    const { question, verdict, next } = loop(-300, 200, 2000);
    revealSpan(next, [question, verdict]);
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('subtracts the sticky header', () => {
    stickyHeader();
    // lo = 64: the verdict at 40 is under the header; verdict 40 → Næsta 400 fits.
    const { verdict, next } = loop(-500, 40, 400);
    revealSpan(next, [verdict]);
    expect(scrollBy).toHaveBeenCalledWith({ top: -24, behavior: 'smooth' });
  });

  it('subtracts a pinned bottom bar', () => {
    const bar = add();
    bar.setAttribute('data-pinned-bottom', '');
    bar.style.position = 'sticky';
    rect(bar, 560, 80);
    // hi = 552: Næsta ending at 600 is under the bar.
    const { verdict, next } = loop(-500, 300, 600);
    revealSpan(next, [verdict]);
    expect(scrollBy).toHaveBeenCalledWith({ top: 48, behavior: 'smooth' });
  });

  it('jumps instantly under prefers-reduced-motion', () => {
    reduced = true;
    const { question, verdict, next } = loop(300, 500, 800);
    revealSpan(next, [question, verdict]);
    expect(scrollBy).toHaveBeenCalledWith({ top: 168, behavior: 'auto' });
  });

  it('with no tops, shows the bottom element itself', () => {
    const next = add('button');
    rect(next, 700, 44);
    revealSpan(next);
    expect(scrollBy).toHaveBeenCalledWith({ top: 112, behavior: 'smooth' });
  });

  it("with gap 0, lands flush with the edge, where scrollIntoView's 'nearest' did", () => {
    phone = false;
    const result = add();
    rect(result, 400, 500);
    // The block ends at 900 in a 640 px viewport: 260 px to bring its bottom to the edge.
    revealSpan(result, [], { anyWidth: true, gap: 0 });
    expect(scrollBy).toHaveBeenCalledWith({ top: 260, behavior: 'smooth' });
    scrollBy.mockClear();
    // A block already flush with an edge does not move, where the default 8 px gap would.
    rect(result, 140, 500);
    revealSpan(result, [], { anyWidth: true, gap: 0 });
    expect(scrollBy).not.toHaveBeenCalled();
    revealSpan(result, [], { anyWidth: true });
    expect(scrollBy).toHaveBeenCalledWith({ top: 8, behavior: 'smooth' });
  });

  it('skips missing tops', () => {
    const { verdict, next } = loop(0, 400, 700);
    revealSpan(next, [null, undefined, verdict]);
    expect(scrollBy).toHaveBeenCalledWith({ top: 68, behavior: 'smooth' });
  });

  it('waits afterExit ms before measuring', () => {
    vi.useFakeTimers();
    const { verdict, next } = loop(0, 400, 700);
    revealSpan(next, [verdict], { afterExit: 250 });
    expect(scrollBy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(250);
    expect(scrollBy).toHaveBeenCalledWith({ top: 68, behavior: 'smooth' });
  });

  it('does nothing for a missing or detached element', () => {
    revealSpan(null);
    const gone = document.createElement('div');
    revealSpan(gone);
    expect(scrollBy).not.toHaveBeenCalled();
  });
});

describe('revealTop', () => {
  it('brings a top hidden under the header back below it', () => {
    stickyHeader();
    const el = add();
    rect(el, -200, 300);
    revealTop(el);
    expect(scrollBy).toHaveBeenCalledWith({ top: -264, behavior: 'smooth' });
  });

  it('brings up a top that opened below the fold', () => {
    const el = add();
    rect(el, 620, 300);
    revealTop(el);
    expect(scrollBy).toHaveBeenCalledWith({ top: 612, behavior: 'smooth' });
  });

  it("lands at an element's own scroll-margin-top, as scrollIntoView did", () => {
    stickyHeader();
    const el = add();
    el.style.scrollMarginTop = '56px';
    rect(el, -300, 100);
    revealTop(el);
    expect(scrollBy).toHaveBeenCalledWith({ top: -356, behavior: 'smooth' });
  });

  it('never lands an element under the header, whatever its scroll margin', () => {
    stickyHeader();
    const el = add();
    el.style.scrollMarginTop = '20px';
    rect(el, -300, 100);
    revealTop(el);
    expect(scrollBy).toHaveBeenCalledWith({ top: -356, behavior: 'smooth' });
  });

  it('leaves a visible top alone unless always is set', () => {
    const el = add();
    rect(el, 200, 300);
    revealTop(el);
    expect(scrollBy).not.toHaveBeenCalled();
    revealTop(el, { always: true });
    expect(scrollBy).toHaveBeenCalledWith({ top: 192, behavior: 'smooth' });
  });

  it('is a no-op on desktop unless anyWidth', () => {
    phone = false;
    const el = add();
    rect(el, -200, 300);
    revealTop(el);
    expect(scrollBy).not.toHaveBeenCalled();
    revealTop(el, { anyWidth: true });
    expect(scrollBy).toHaveBeenCalled();
  });

  it('honours afterExit', () => {
    vi.useFakeTimers();
    const el = add();
    rect(el, -200, 300);
    revealTop(el, { afterExit: 100 });
    expect(scrollBy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(scrollBy).toHaveBeenCalled();
  });
});

describe('revealInline', () => {
  function row(cardLeft: number, cardWidth = 80) {
    const box = add();
    box.style.overflowX = 'auto';
    Object.defineProperty(box, 'scrollWidth', { value: 1000, configurable: true });
    Object.defineProperty(box, 'clientWidth', { value: 300, configurable: true });
    box.scrollLeft = 100;
    const boxScroll = vi.fn();
    box.scrollTo = boxScroll as unknown as typeof box.scrollTo;
    rect(box, 0, 100, 0, 300);
    const card = add('div', box);
    rect(card, 0, 80, cardLeft, cardWidth);
    return { box, card, boxScroll };
  }

  it("aligns the newest card to the row's end", () => {
    const { card, boxScroll } = row(350);
    revealInline(card, { inline: 'end' });
    // right edge 430 + 8 margin - 300 = 138 → scrollLeft 238
    expect(boxScroll).toHaveBeenCalledWith({ left: 238, behavior: 'smooth' });
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('moves the least for nearest, and not at all when already visible', () => {
    const { card, boxScroll } = row(-50);
    revealInline(card, { inline: 'nearest' });
    expect(boxScroll).toHaveBeenCalledWith({ left: 42, behavior: 'smooth' });
    boxScroll.mockClear();
    rect(card, 0, 80, 100, 80);
    revealInline(card);
    expect(boxScroll).not.toHaveBeenCalled();
  });

  it('does nothing without a sideways-scrolling ancestor, or on desktop', () => {
    const card = add();
    rect(card, 0, 80, 500, 80);
    revealInline(card, { inline: 'end' });
    phone = false;
    const { card: other, boxScroll } = row(350);
    revealInline(other, { inline: 'end' });
    expect(boxScroll).not.toHaveBeenCalled();
  });
});

describe('focusTarget', () => {
  it('makes a heading focusable, marks it ring-free, and focuses without scrolling', () => {
    const h = add('h2');
    const focus = vi.spyOn(h, 'focus');
    focusTarget(h);
    expect(h.getAttribute('tabindex')).toBe('-1');
    expect(h.hasAttribute('data-focus-target')).toBe(true);
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(document.activeElement).toBe(h);
  });

  it('keeps an existing tabindex="-1" and still marks the target', () => {
    const group = add();
    group.tabIndex = -1;
    group.setAttribute('role', 'group');
    focusTarget(group);
    expect(group.hasAttribute('data-focus-target')).toBe(true);
    expect(document.activeElement).toBe(group);
  });

  it('leaves an interactive control, and its ring, as it is', () => {
    const button = add('button');
    focusTarget(button);
    expect(button.hasAttribute('tabindex')).toBe(false);
    expect(button.hasAttribute('data-focus-target')).toBe(false);
    expect(document.activeElement).toBe(button);
  });

  it('ignores null and detached elements', () => {
    focusTarget(null);
    focusTarget(document.createElement('h2'));
    expect(document.activeElement).toBe(document.body);
  });
});

describe('useScreenTop', () => {
  function Screens({ withTarget = false }: { withTarget?: boolean }) {
    const [screen, setScreen] = useState('menu');
    useScreenTop(screen, {
      target: withTarget ? () => document.getElementById('next-card') : undefined,
    });
    const children: ReactNode[] = [
      createElement('header', { key: 'h' }, createElement('h1', null, 'Leikur')),
      createElement('h2', { key: 't' }, screen === 'menu' ? 'Veldu stig' : 'Stig 1'),
      createElement('button', { key: 'b', onClick: () => setScreen('level') }, 'Áfram'),
    ];
    if (screen === 'level' && withTarget) {
      children.push(createElement('div', { key: 'c', id: 'next-card' }, 'Stig 2'));
    }
    return createElement('div', null, children);
  }

  it('does nothing on mount', () => {
    render(createElement(Screens));
    expect(scrollTo).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(document.body);
  });

  it('on a phone, starts the new screen at the top and focuses its heading, not the header', () => {
    const { getByText } = render(createElement(Screens));
    act(() => getByText('Áfram').click());
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(document.activeElement).toBe(getByText('Stig 1'));
  });

  it('on desktop, moves focus but never the page', () => {
    phone = false;
    const { getByText } = render(createElement(Screens));
    act(() => getByText('Áfram').click());
    expect(scrollTo).not.toHaveBeenCalled();
    expect(scrollBy).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(getByText('Stig 1'));
  });

  it('with a target, reveals and focuses it instead', () => {
    const { getByText } = render(createElement(Screens, { withTarget: true }));
    act(() => getByText('Áfram').click());
    expect(document.activeElement).toBe(getByText('Stig 2'));
  });

  it('focuses the given heading ref', () => {
    function WithRef() {
      const [n, setN] = useState(0);
      const ref = useRef<HTMLHeadingElement>(null);
      useScreenTop(n, { focus: ref });
      return createElement(
        'div',
        null,
        createElement('h2', null, 'Fyrsta'),
        createElement('h3', { ref }, 'Markmið'),
        createElement('button', { onClick: () => setN(1) }, 'Áfram')
      );
    }
    const { getByText } = render(createElement(WithRef));
    act(() => getByText('Áfram').click());
    expect(document.activeElement).toBe(getByText('Markmið'));
  });
});

describe('useItemTop', () => {
  function Items() {
    const [i, setI] = useState(0);
    const ref = useItemTop<HTMLDivElement>(i);
    return createElement(
      'div',
      { ref, 'data-testid': 'item' },
      createElement('h1', null, 'Stig 1'),
      createElement('p', { 'data-item-start': '' }, `Dæmi ${i + 1}`),
      createElement('button', { onClick: () => setI(i + 1) }, 'Næsta')
    );
  }

  it('on an item swap, focuses [data-item-start] — not the level h1', () => {
    const { getByText } = render(createElement(Items));
    expect(document.activeElement).toBe(document.body);
    act(() => getByText('Næsta').click());
    expect(document.activeElement).toBe(getByText('Dæmi 2'));
  });

  it('on a phone, brings the item top back under the header', () => {
    stickyHeader();
    const { getByText, getByTestId } = render(createElement(Items));
    rect(getByTestId('item'), -400, 900);
    act(() => getByText('Næsta').click());
    expect(scrollBy).toHaveBeenCalledWith({ top: -464, behavior: 'smooth' });
  });

  it('on desktop, does not scroll', () => {
    phone = false;
    const { getByText, getByTestId } = render(createElement(Items));
    rect(getByTestId('item'), -400, 900);
    act(() => getByText('Næsta').click());
    expect(scrollBy).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(getByText('Dæmi 2'));
  });

  it('with anyWidth, brings the item top back on desktop too', () => {
    phone = false;
    function Wide() {
      const [i, setI] = useState(0);
      const ref = useItemTop<HTMLDivElement>(i, { anyWidth: true });
      return createElement(
        'div',
        { ref, 'data-testid': 'item' },
        createElement('button', { onClick: () => setI(i + 1) }, 'Næsta')
      );
    }
    const { getByText, getByTestId } = render(createElement(Wide));
    rect(getByTestId('item'), -400, 900);
    act(() => getByText('Næsta').click());
    expect(scrollBy).toHaveBeenCalledWith({ top: -408, behavior: 'smooth' });
  });

  it('falls back to the container when nothing is marked', () => {
    function Plain() {
      const [i, setI] = useState(0);
      const ref = useItemTop<HTMLDivElement>(i);
      return createElement(
        'div',
        { ref, 'data-testid': 'item' },
        createElement('button', { onClick: () => setI(i + 1) }, 'Næsta')
      );
    }
    const { getByText, getByTestId } = render(createElement(Plain));
    act(() => getByText('Næsta').click());
    expect(document.activeElement).toBe(getByTestId('item'));
  });
});

describe('useRevealAfterCommit', () => {
  function Loop({
    afterExit,
    anyWidth,
    gap,
  }: {
    afterExit?: number;
    anyWidth?: boolean;
    gap?: number;
  }) {
    const [done, setDone] = useState(false);
    const verdict = useRef<HTMLHeadingElement>(null);
    const group = useRef<HTMLDivElement>(null);
    const next = useRef<HTMLButtonElement>(null);
    useRevealAfterCommit(
      done,
      () => ({ bottom: next.current, tops: [verdict.current], focus: group.current }),
      { afterExit, anyWidth, gap }
    );
    if (!done) return createElement('button', { onClick: () => setDone(true) }, 'Athuga');
    return createElement(
      'div',
      { ref: group, role: 'group', 'data-testid': 'feedback' },
      createElement('h3', { ref: verdict }, 'Rangt'),
      createElement('button', { ref: next }, 'Næsta')
    );
  }

  function stubLoopRects() {
    rect(document.querySelector('h3')!, 400, 40);
    const next = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent === 'Næsta'
    )!;
    rect(next, 656, 44);
  }

  it('after paint, reveals verdict→Næsta and focuses the feedback, not Næsta', async () => {
    const { getByText, getByTestId } = render(createElement(Loop));
    act(() => getByText('Athuga').click());
    stubLoopRects();
    await act(() => new Promise((r) => requestAnimationFrame(() => r(undefined))));
    expect(scrollBy).toHaveBeenCalledWith({ top: 68, behavior: 'smooth' });
    expect(document.activeElement).toBe(getByTestId('feedback'));
  });

  it('on desktop, focuses but does not scroll — unless anyWidth', async () => {
    phone = false;
    const { getByText, getByTestId } = render(createElement(Loop));
    act(() => getByText('Athuga').click());
    stubLoopRects();
    await act(() => new Promise((r) => requestAnimationFrame(() => r(undefined))));
    expect(scrollBy).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(getByTestId('feedback'));
    cleanup();

    const again = render(createElement(Loop, { anyWidth: true }));
    act(() => again.getByText('Athuga').click());
    stubLoopRects();
    await act(() => new Promise((r) => requestAnimationFrame(() => r(undefined))));
    expect(scrollBy).toHaveBeenCalled();
  });

  it('passes gap on to revealSpan', async () => {
    const { getByText } = render(createElement(Loop, { gap: 0 }));
    act(() => getByText('Athuga').click());
    stubLoopRects();
    await act(() => new Promise((r) => requestAnimationFrame(() => r(undefined))));
    // Næsta ends at 700: flush with the 640 px edge is 60, where the default gap moves 68.
    expect(scrollBy).toHaveBeenCalledWith({ top: 60, behavior: 'smooth' });
  });

  it('with afterExit, waits for the exit animation first', () => {
    vi.useFakeTimers();
    const { getByText, getByTestId } = render(createElement(Loop, { afterExit: 300 }));
    act(() => getByText('Athuga').click());
    stubLoopRects();
    act(() => vi.advanceTimersByTime(299));
    expect(document.activeElement).not.toBe(getByTestId('feedback'));
    act(() => vi.advanceTimersByTime(1));
    expect(document.activeElement).toBe(getByTestId('feedback'));
    expect(scrollBy).toHaveBeenCalled();
  });
});

describe('useIsPhone', () => {
  function Probe() {
    return createElement('span', { 'data-testid': 'probe' }, useIsPhone() ? 'phone' : 'desk');
  }

  it('is false wherever matchMedia is missing (jsdom, SSR)', () => {
    // @ts-expect-error -- simulate an environment without matchMedia
    window.matchMedia = undefined;
    const { getByTestId } = render(createElement(Probe));
    expect(getByTestId('probe').textContent).toBe('desk');
  });

  it('follows the phone query, and re-renders when it changes', () => {
    let matchesNow = true;
    const listeners = new Set<() => void>();
    window.matchMedia = vi.fn((query: string) => ({
      get matches() {
        return query === PHONE_QUERY && matchesNow;
      },
      media: query,
      addEventListener: (_: string, fn: () => void) => listeners.add(fn),
      removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
    })) as unknown as typeof window.matchMedia;

    const { getByTestId, unmount } = render(createElement(Probe));
    expect(getByTestId('probe').textContent).toBe('phone');

    matchesNow = false;
    act(() => listeners.forEach((fn) => fn()));
    expect(getByTestId('probe').textContent).toBe('desk');

    unmount();
    expect(listeners.size).toBe(0);
  });

  it('uses the deprecated listener pair where addEventListener is missing', () => {
    const addListener = vi.fn();
    const removeListener = vi.fn();
    window.matchMedia = vi.fn(() => ({
      matches: false,
      addListener,
      removeListener,
    })) as unknown as typeof window.matchMedia;

    const { unmount } = render(createElement(Probe));
    expect(addListener).toHaveBeenCalled();
    unmount();
    expect(removeListener).toHaveBeenCalled();
  });
});
