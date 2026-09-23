/**
 * Scroll anchoring and focus for the games — the one shared copy.
 *
 * Sixteen games carry their own reveal/scroll helper, each with its own idea of
 * the sticky header, and most of them move the page at any width. This module is
 * what they migrate to, one game at a time. It does three jobs:
 *
 *  1. After a screen or item swap, start the new screen at its top (or bring the
 *     new item's top under the header) and move focus to its heading, because
 *     the button that caused the swap has unmounted and focus would otherwise
 *     fall to `<body>` (`useScreenTop`, `useItemTop`).
 *  2. After a commit (Athuga, Svara, …), bring the verdict and the next action
 *     into view, keeping as much of what the student answered as fits, and move
 *     focus to the feedback (`revealSpan`, `useRevealAfterCommit`).
 *  3. Sideways reveals inside a scrolling box (`revealInline`).
 *
 * Rules every helper follows:
 *  - **Scrolling is phone-only by default** (`PHONE_QUERY`), so a desktop window
 *    never moves. A call site that replaces an existing helper which already
 *    scrolled at any width passes `{ anyWidth: true }` and keeps that behaviour.
 *  - **Focus moves at every width.** It is not layout, and a keyboard user on a
 *    desktop loses their place in exactly the same way. `focusTarget` marks the
 *    non-interactive targets it focuses with `data-focus-target`, which
 *    `styles/theme.css` gives no outline: focus moves, no ring is painted.
 *  - Header- and pin-aware: `usableArea()` is the band between the sticky
 *    header (and anything pinned under it) and anything pinned to the bottom,
 *    measured on the visual viewport, which is what the soft keyboard shrinks.
 *  - Minimal: an element already where it needs to be never moves the page.
 *  - `prefers-reduced-motion` gets an instant jump instead of a smooth one.
 */
import { useEffect, useLayoutEffect, useRef, useSyncExternalStore, type RefObject } from 'react';

/**
 * What "phone" means, for scripts. The same two queries as the `phone:` Tailwind
 * variant in `styles/theme.css` — a portrait phone narrower than `sm`, or any
 * screen at most 500 px tall (a phone on its side, where the shared Header
 * stops being sticky). `styles/__tests__/phone-variant.test.ts` holds the two
 * together.
 */
export const PHONE_QUERIES = ['(max-width: 639.98px)', '(max-height: 500px)'] as const;
// Written out rather than joined from PHONE_QUERIES: a top-level `.join()` call
// is not tree-shaken, so it would land in every bundle that imports
// `@shared/utils`, whether or not it uses the scroll helpers.
// `styles/__tests__/phone-variant.test.ts` holds both to the compiled CSS.
export const PHONE_QUERY = '(max-width: 639.98px), (max-height: 500px)';

/** The `phone-land:` variant's query: a phone on its side. */
export const PHONE_LAND_QUERY = '(orientation: landscape) and (max-height: 500px)';

/**
 * The `pin:` variant's query: a portrait phone, narrower than `sm` and taller
 * than 500 px. The only layout in which `TaskStrip` and `PinnedActions` stick.
 */
export const PIN_QUERY = '(max-width: 639.98px) and (min-height: 501px)';

/** Gap left between a revealed element and the edge of the usable area. */
const MARGIN = 8;

/** How much of an element must show below the fold before it counts as on screen. */
const MIN_VISIBLE = 48;

function matches(query: string): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(query).matches
  );
}

/** True on a phone layout. False wherever `matchMedia` is missing (jsdom, SSR). */
export function isPhone(): boolean {
  return matches(PHONE_QUERY);
}

function subscribePhone(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }
  const list = window.matchMedia(PHONE_QUERY);
  if (typeof list.addEventListener === 'function') {
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }
  // Safari before 14 has only the deprecated pair.
  list.addListener?.(onChange);
  return () => list.removeListener?.(onChange);
}

/**
 * `isPhone()` as React state: true on a phone layout, and it re-renders the
 * component when the answer changes (a phone turned on its side, a desktop
 * window dragged narrow). For phone-only markup that CSS cannot express — an
 * element that must not exist at all on desktop, or an SVG attribute. Like
 * `isPhone()` it is false wherever `matchMedia` is missing, so jsdom and
 * desktop never see the phone-only branch.
 */
export function useIsPhone(): boolean {
  return useSyncExternalStore(subscribePhone, isPhone, () => false);
}

export function prefersReducedMotion(): boolean {
  return matches('(prefers-reduced-motion: reduce)');
}

function isPinned(el: Element): boolean {
  const pos = getComputedStyle(el).position;
  return pos === 'sticky' || pos === 'fixed';
}

/**
 * The band of the viewport content can use, in the same coordinates as
 * `getBoundingClientRect()`.
 *
 * - The bottom is the visual viewport's, where there is one: on iOS Safari and
 *   Chrome Android 108+ the soft keyboard shrinks only the visual viewport, and
 *   `innerHeight` does not change.
 * - The top is below a sticky or fixed `<header>` that covers the top edge, and
 *   below any stuck `[data-pinned-top]` element under it.
 * - The bottom is above any stuck `[data-pinned-bottom]` element.
 *
 * A pinned element counts only while it is actually stuck against that edge; a
 * sticky strip still in the flow further down the page covers nothing.
 */
export function usableArea(): { top: number; bottom: number } {
  const vv = typeof window !== 'undefined' ? window.visualViewport : null;
  let top = vv ? Math.max(0, vv.offsetTop) : 0;
  let bottom = vv ? vv.offsetTop + vv.height : window.innerHeight;

  const covering = (selector: string) =>
    Array.from(document.querySelectorAll(selector))
      .filter(isPinned)
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.height > 0);

  // Top edge: the header first, then anything pinned beneath it, in page order.
  const tops = [...covering('header'), ...covering('[data-pinned-top]')].sort(
    (a, b) => a.top - b.top
  );
  for (const r of tops) {
    if (r.top <= top + 1 && r.bottom > top) top = r.bottom;
  }

  const bottoms = covering('[data-pinned-bottom]').sort((a, b) => b.bottom - a.bottom);
  for (const r of bottoms) {
    if (r.bottom >= bottom - 1 && r.top < bottom) bottom = r.top;
  }

  return { top, bottom: Math.max(top, bottom) };
}

type Target = Element | null | undefined;

export interface RevealOptions {
  /**
   * Scroll at any width, not only on a phone. Only for call sites that replace
   * an existing helper which already scrolled at any width, so a desktop user
   * keeps what they have today. New behaviour stays phone-only.
   */
  anyWidth?: boolean;
  /**
   * Wait this many ms before measuring, for a Presence exit animation to finish
   * (ph-titration's `MARKING_EXIT_MS`, thermo's `ANSWER_CARD_EXIT_MS`).
   */
  afterExit?: number;
}

function allowed(opts: RevealOptions | undefined): boolean {
  return typeof window !== 'undefined' && (!!opts?.anyWidth || isPhone());
}

function later(fn: () => void, afterExit: number | undefined): void {
  if (afterExit && afterExit > 0) window.setTimeout(fn, afterExit);
  else fn();
}

function scrollByY(dy: number): void {
  if (Math.abs(dy) < 1) return;
  window.scrollBy({ top: dy, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

export interface RevealSpanOptions extends RevealOptions {
  /**
   * Gap left between the span and the edge of the usable area, in px; 8 by
   * default. A call site replacing `scrollIntoView({ block: 'nearest' })` with
   * `anyWidth` passes 0, so a desktop page lands exactly where it did.
   */
  gap?: number;
}

/**
 * Bring `bottom` (usually Næsta) into view together with as much context above
 * it as fits.
 *
 * `tops` lists candidate tops from the most context to the least — the question,
 * then the student's own choice, then the verdict. The first candidate whose
 * span down to `bottom` fits the usable area is shown, moving the page by the
 * least that shows the whole span. When none fits, the **last** candidate (the
 * verdict) is aligned to the top of the usable area and the student reads down
 * to the button; the button is never shown alone, which would leave the verdict
 * above the screen. A verdict already in the upper half of the usable area is
 * left where it is — the student is reading it.
 *
 * With no `tops`, `bottom` itself is the span: shown whole if it fits, from its
 * top edge if not.
 */
export function revealSpan(bottom: Target, tops: Target[] = [], opts?: RevealSpanOptions): void {
  if (!bottom || !allowed(opts)) return;
  later(() => {
    if (!bottom.isConnected) return;
    const { top: areaTop, bottom: areaBottom } = usableArea();
    const gap = opts?.gap ?? MARGIN;
    const lo = areaTop + gap;
    const hi = areaBottom - gap;
    const b = bottom.getBoundingClientRect();
    const present = tops.filter((t): t is Element => !!t && t.isConnected);
    const candidates = present.length ? present : [bottom];

    for (const t of candidates) {
      const top = t.getBoundingClientRect().top;
      if (b.bottom - top > hi - lo) continue;
      if (top >= lo && b.bottom <= hi) return;
      // The span fits, so moving one edge in never pushes the other out.
      scrollByY(b.bottom > hi ? b.bottom - hi : top - lo);
      return;
    }

    const verdictTop = candidates[candidates.length - 1].getBoundingClientRect().top;
    if (verdictTop >= lo && verdictTop <= lo + (hi - lo) / 2) return;
    scrollByY(verdictTop - lo);
  }, opts?.afterExit);
}

export interface RevealTopOptions extends RevealOptions {
  /** Align the top under the header even when it is already on screen. */
  always?: boolean;
}

/**
 * Bring `el`'s top line just under the header when it is hidden — above the
 * usable area (scrolled past, under the header) or below it (a new step that
 * opened off the bottom of the screen). A top already on screen stays put
 * unless `always` is set.
 *
 * It lands `MARGIN` below the header, unless the element declares its own
 * `scroll-margin-top` (a `scroll-mt-*` class): then it lands that far from the
 * top of the viewport, where `scrollIntoView` would put it — never under the
 * header. That is for a game migrating from a helper that used
 * `scrollIntoView`, so an `anyWidth` reveal lands on desktop exactly where it
 * did.
 */
export function revealTop(el: Target, opts?: RevealTopOptions): void {
  if (!el || !allowed(opts)) return;
  later(() => {
    if (!el.isConnected) return;
    const { top: lo, bottom: hi } = usableArea();
    const top = el.getBoundingClientRect().top;
    if (!opts?.always && top >= lo && top <= hi - MIN_VISIBLE) return;
    const declared = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    scrollByY(top - (declared > 0 ? Math.max(lo, declared) : lo + MARGIN));
  }, opts?.afterExit);
}

export interface RevealInlineOptions extends RevealOptions {
  /** `'end'` aligns `el`'s right edge with the box's; `'nearest'` moves the least. */
  inline?: 'end' | 'nearest';
}

function scrollParentX(el: Element): HTMLElement | null {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const { overflowX } = getComputedStyle(p);
    if ((overflowX === 'auto' || overflowX === 'scroll') && p.scrollWidth > p.clientWidth) {
      return p;
    }
  }
  return null;
}

/**
 * Scroll `el`'s nearest sideways-scrolling box so `el` is visible. The page's
 * vertical position is not touched. For the periodic table (lotukerfid) and a
 * growing chain of cards (einingakedjan), where the newest item is off the right
 * edge of its row.
 */
export function revealInline(el: Target, opts?: RevealInlineOptions): void {
  if (!el || !allowed(opts)) return;
  later(() => {
    if (!el.isConnected) return;
    const box = scrollParentX(el);
    if (!box) return;
    const boxRect = box.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const left = boxRect.left + box.clientLeft;
    const right = left + box.clientWidth;
    let dx = 0;
    if (opts?.inline === 'end') {
      dx = r.right + MARGIN - right;
    } else if (r.left < left + MARGIN) {
      dx = r.left - left - MARGIN;
    } else if (r.right > right - MARGIN) {
      // Wider than the box: keep its start in view.
      dx = Math.min(r.right - right + MARGIN, r.left - left - MARGIN);
    }
    const max = box.scrollWidth - box.clientWidth;
    const next = Math.max(0, Math.min(max, box.scrollLeft + dx));
    if (Math.abs(next - box.scrollLeft) < 1) return;
    box.scrollTo({ left: next, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, opts?.afterExit);
}

const NATIVELY_FOCUSABLE = 'a[href], button, input, select, textarea, summary, [contenteditable]';

/**
 * Move focus to `el` without scrolling. A non-interactive target (a heading, a
 * feedback group) is made focusable with `tabIndex = -1` if it is not already,
 * and marked `data-focus-target`, which `styles/theme.css` paints no outline on:
 * it is not an operable control, so no ring is needed (WCAG 2.4.7). Interactive
 * controls keep their own focus styles.
 */
export function focusTarget(el: HTMLElement | null | undefined): void {
  if (!el || !el.isConnected) return;
  const interactive = el.matches(NATIVELY_FOCUSABLE);
  if (!interactive && !el.hasAttribute('tabindex')) el.tabIndex = -1;
  if (!interactive && el.tabIndex < 0) el.setAttribute('data-focus-target', '');
  el.focus({ preventScroll: true });
}

/** The screen's own first heading, skipping the shared Header's title. */
function screenHeading(): HTMLElement | null {
  for (const h of document.querySelectorAll<HTMLElement>('h1, h2')) {
    if (!h.closest('header')) return h;
  }
  return null;
}

export interface ScreenTopOptions {
  /** The heading to focus; defaults to the first h1/h2 outside the site header. */
  focus?: RefObject<HTMLElement | null>;
  /**
   * On a return to a menu: the element to reveal and focus instead of the top of
   * the page — the next unfinished level or phase card. Returning `null` falls
   * back to the top.
   */
  target?: () => Element | null;
}

/**
 * For an app that swaps whole screens by state (menu ↔ level, intro → play, a
 * phase or mode change). Each time `key` changes — not on mount — a phone starts
 * the new screen at the top of the page, or at `target()` when it returns an
 * element, and focus moves to the screen heading (or to the target) at every
 * width. Runs in a layout effect, so the new screen never paints at the old
 * offset.
 */
export function useScreenTop(key: unknown, opts: ScreenTopOptions = {}): void {
  const shown = useRef(key);
  const latest = useRef(opts);
  latest.current = opts;
  useLayoutEffect(() => {
    if (Object.is(shown.current, key)) return;
    shown.current = key;
    const { focus, target } = latest.current;
    // Instant, not smooth: the new screen must not paint at the old offset.
    if (isPhone()) window.scrollTo({ top: 0, behavior: 'auto' });
    const el = target?.() ?? null;
    if (el) {
      // From the top of the page, the least move that shows the card whole.
      revealSpan(el);
      focusTarget(el instanceof HTMLElement ? el : null);
      return;
    }
    focusTarget(focus?.current ?? screenHeading());
  }, [key]);
}

/**
 * For an item swap inside a screen (Næsta). Returns a ref for the item's
 * container. Each time `key` changes — not on mount — a phone brings the
 * container's top back under the header if it is off screen, and focus moves
 * to the `[data-item-start]` element inside it (the new challenge's own
 * heading, not the level's h1), or to the container when none is marked.
 *
 * `opts` goes to `revealTop`: `{ anyWidth: true }` for a game whose own helper
 * already revealed each new item at any width, so a desktop window keeps that.
 */
export function useItemTop<T extends HTMLElement>(
  key: unknown,
  opts?: RevealTopOptions
): RefObject<T | null> {
  const ref = useRef<T>(null);
  const shown = useRef(key);
  const latest = useRef(opts);
  latest.current = opts;
  useLayoutEffect(() => {
    if (Object.is(shown.current, key)) return;
    shown.current = key;
    const box = ref.current;
    if (!box) return;
    revealTop(box, latest.current);
    const start = box.matches('[data-item-start]')
      ? box
      : box.querySelector<HTMLElement>('[data-item-start]');
    focusTarget(start ?? box);
  }, [key]);
  return ref;
}

export interface CommitTargets {
  /** The last thing the student needs: usually Næsta. */
  bottom: Element | null;
  /** Candidate tops, most context first: question, own choice, verdict. */
  tops: (Element | null)[];
  /** The feedback region to focus (P3): never Næsta itself. */
  focus: HTMLElement | null;
}

/**
 * After a commit: once `when` turns true, and after the feedback has painted
 * (or after `afterExit` ms), `revealSpan` the targets and focus the feedback
 * region. The scroll follows `opts` (phone-only unless `anyWidth`; `gap` as in
 * `revealSpan`); the focus moves at every width.
 */
export function useRevealAfterCommit(
  when: boolean,
  get: () => CommitTargets,
  opts?: RevealSpanOptions
): void {
  const latest = useRef({ get, opts });
  latest.current = { get, opts };
  useEffect(() => {
    if (!when) return;
    const run = () => {
      const { get: read, opts: o } = latest.current;
      const t = read();
      revealSpan(t.bottom, t.tops, { anyWidth: o?.anyWidth, gap: o?.gap });
      focusTarget(t.focus);
    };
    const wait = latest.current.opts?.afterExit;
    if (wait && wait > 0) {
      const id = window.setTimeout(run, wait);
      return () => window.clearTimeout(id);
    }
    const id = requestAnimationFrame(run);
    return () => cancelAnimationFrame(id);
  }, [when]);
}
