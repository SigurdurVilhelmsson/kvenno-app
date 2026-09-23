/**
 * The one decision behind `TaskStrip` and `PinnedActions`: are they pinned?
 *
 * Every pinned region on the page registers here, and they are pinned or not
 * **together**, because the budget is on their sum (design P8): a strip and a
 * bar that each look small can still cover most of a short screen between
 * them.
 *
 * A region is pinned only when all of these hold:
 *  - the layout is a portrait phone (`PIN_QUERY`, the `pin:` variant);
 *  - the pinned regions together take at most `PIN_BUDGET` of the **visual**
 *    viewport's height — the one the soft keyboard and pinch-zoom shrink,
 *    which `innerHeight` and the media queries do not see;
 *  - the screen has no text input (`hasTextInput`). The keyboard covers a
 *    sticky bottom, and the iOS decimal pad has no return key.
 *
 * Re-evaluated when a region renders, when a region or the header changes size
 * (`ResizeObserver`), when the visual viewport or window is resized, and when
 * the `pin:` query starts or stops matching.
 *
 * While anything is pinned the heights are published on `<html>` as
 * `--pin-header-h`, `--pin-strip-h` and `--pin-bar-h`, which drive the strip's
 * `top` and the `scroll-padding` in `styles/theme.css`. They are removed the
 * moment nothing is pinned, so nothing else on the page ever sees them.
 */
import { PIN_QUERY } from '../../utils/reveal';

export type PinEdge = 'top' | 'bottom';

/** The most of the visual viewport's height the pinned regions may cover together. */
export const PIN_BUDGET = 0.28;

/**
 * What counts as a text input. Everything that opens a soft keyboard; a slider,
 * a checkbox, a radio button or a button does not.
 */
export const TEXT_INPUT_SELECTOR = [
  'input:not([type=range]):not([type=checkbox]):not([type=radio])' +
    ':not([type=button]):not([type=submit]):not([type=reset]):not([type=hidden])',
  'textarea',
  '[contenteditable]:not([contenteditable=false])',
].join(', ');

interface Entry {
  edge: PinEdge;
  el: HTMLElement | null;
  /** The screen has a text input: never pinned. */
  blocked: boolean;
  /** Height in the flow, last measured while not pinned. */
  flow: number;
  /**
   * What pinning adds to the height (padding, the status line), learned the
   * last time it was pinned. Without it a region that fits only in the flow
   * would pin, overflow the budget, unpin, fit, and pin again, forever.
   */
  overhead: number;
  /**
   * Set when the region is told to pin: its next pinned measurement is the one
   * to learn `overhead` from, because `flow` was measured just before, under
   * the same text size and width. A later pinned measurement is not compared
   * with that `flow` — after the text is enlarged, say, the difference would
   * be the enlargement, and the region would never pin again at normal size.
   */
  learn: boolean;
  /** The answer `isPinned` last gave, so subscribers hear only real changes. */
  shown: boolean;
}

const entries = new Map<number, Entry>();
const listeners = new Set<() => void>();
let nextId = 1;
let detachWindow: (() => void) | null = null;
let observer: ResizeObserver | null = null;
const observed = new Set<Element>();

/** True when the portrait-phone query matches. False wherever `matchMedia` is missing. */
export function pinMediaMatches(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(PIN_QUERY).matches
  );
}

function viewportHeight(): number {
  const vv = window.visualViewport;
  return vv && vv.height > 0 ? vv.height : window.innerHeight;
}

/** Whether the screen holding `el` has a text input anywhere on it. */
export function hasTextInput(el: Element): boolean {
  const screen = el.ownerDocument?.body ?? null;
  return !!screen?.querySelector(TEXT_INPUT_SELECTOR);
}

/** A region is rendered pinned when it carries its `data-pinned-*` attribute. */
function renderedPinned(e: Entry): boolean {
  return !!e.el && e.el.hasAttribute(e.edge === 'top' ? 'data-pinned-top' : 'data-pinned-bottom');
}

/**
 * The height of a region in the flow. Unpinned, the wrapper is
 * `display: contents` and has no box of its own, so this is the span of its
 * children's boxes.
 */
function flowHeight(el: HTMLElement): number {
  let top = Infinity;
  let bottom = -Infinity;
  for (const child of Array.from(el.children)) {
    const r = child.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    top = Math.min(top, r.top);
    bottom = Math.max(bottom, r.bottom);
  }
  return bottom > top ? bottom - top : 0;
}

function stickyHeader(): HTMLElement | null {
  for (const h of Array.from(document.querySelectorAll<HTMLElement>('header'))) {
    const pos = getComputedStyle(h).position;
    if (pos === 'sticky' || pos === 'fixed') return h;
  }
  return null;
}

const VARS = ['--pin-header-h', '--pin-strip-h', '--pin-bar-h'] as const;

function publish(): void {
  const root = document.documentElement.style;
  let strip = 0;
  let bar = 0;
  let any = false;
  for (const e of entries.values()) {
    if (!e.el || !renderedPinned(e)) continue;
    any = true;
    const h = e.el.getBoundingClientRect().height;
    if (e.edge === 'top') strip += h;
    else bar += h;
  }
  if (!any) {
    for (const v of VARS) root.removeProperty(v);
    return;
  }
  const header = stickyHeader();
  root.setProperty('--pin-header-h', `${header ? header.getBoundingClientRect().height : 0}px`);
  root.setProperty('--pin-strip-h', `${strip}px`);
  root.setProperty('--pin-bar-h', `${bar}px`);
}

function syncObserved(): void {
  if (typeof ResizeObserver === 'undefined') return;
  observer ??= new ResizeObserver(() => evaluate());
  const want = new Set<Element>();
  for (const e of entries.values()) {
    if (!e.el) continue;
    want.add(e.el);
    for (const child of Array.from(e.el.children)) want.add(child);
  }
  const header = stickyHeader();
  if (header) want.add(header);
  // Observe only what is new: observing an element queues a first callback,
  // so re-observing everything on every evaluation would never settle.
  for (const el of want) if (!observed.has(el)) observer.observe(el);
  for (const el of observed) if (!want.has(el)) observer.unobserve(el);
  observed.clear();
  for (const el of want) observed.add(el);
}

/** Re-measure and decide. Notifies subscribers only when a region's answer changes. */
export function evaluate(): void {
  if (typeof window === 'undefined') return;
  let next = false;
  // Re-checked here too, not only on a region's render: a stage that opens an
  // input elsewhere on the screen does not re-render the region.
  for (const e of entries.values()) if (e.el) e.blocked = hasTextInput(e.el);
  const active = [...entries.values()].filter((e) => e.el && !e.blocked);
  if (active.length > 0 && pinMediaMatches()) {
    let total = 0;
    for (const e of active) {
      const el = e.el as HTMLElement;
      if (renderedPinned(e)) {
        const h = el.getBoundingClientRect().height;
        if (e.learn) {
          e.overhead = Math.max(0, h - e.flow);
          e.learn = false;
        }
        total += h;
      } else {
        e.flow = flowHeight(el);
        total += e.flow + e.overhead;
      }
    }
    next = total <= PIN_BUDGET * viewportHeight();
  }
  syncObserved();
  let changed = false;
  for (const e of entries.values()) {
    const now = next && !!e.el && !e.blocked;
    if (e.shown !== now) {
      e.shown = now;
      e.learn = now;
      changed = true;
    }
  }
  if (changed) for (const fn of [...listeners]) fn();
  publish();
}

function attachWindow(): void {
  if (detachWindow || typeof window === 'undefined') return;
  const run = () => evaluate();
  const vv = window.visualViewport;
  window.addEventListener('resize', run);
  vv?.addEventListener('resize', run);
  const list = typeof window.matchMedia === 'function' ? window.matchMedia(PIN_QUERY) : null;
  if (list && typeof list.addEventListener === 'function') list.addEventListener('change', run);
  else list?.addListener?.(run);
  detachWindow = () => {
    window.removeEventListener('resize', run);
    vv?.removeEventListener('resize', run);
    if (list && typeof list.removeEventListener === 'function') {
      list.removeEventListener('change', run);
    } else list?.removeListener?.(run);
  };
}

export function newPinId(): number {
  return nextId++;
}

export function register(id: number, edge: PinEdge): void {
  entries.set(id, {
    edge,
    el: null,
    blocked: false,
    flow: 0,
    overhead: 0,
    learn: false,
    shown: false,
  });
  attachWindow();
}

export function unregister(id: number): void {
  entries.delete(id);
  if (entries.size === 0) {
    detachWindow?.();
    detachWindow = null;
    observer?.disconnect();
    observer = null;
    observed.clear();
  }
  evaluate();
}

/** Called after every render of a region: its element and whether the screen has a text input. */
export function update(id: number, el: HTMLElement | null, blocked: boolean): void {
  const e = entries.get(id);
  if (!e) return;
  e.el = el;
  e.blocked = blocked;
  evaluate();
}

export function isPinned(id: number): boolean {
  return entries.get(id)?.shown ?? false;
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
