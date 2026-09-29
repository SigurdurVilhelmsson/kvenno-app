import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

import {
  focusTarget,
  isPhone,
  revealSpan,
  revealTop,
  usableArea,
  type CommitTargets,
} from './reveal';

/**
 * Desktop-preserving reveals: what five games' own helpers did on a desktop
 * window before the vertical-scroll pass, kept exactly, so a desktop user neither
 * gains nor loses a scroll (docs/plans/2026-09-23-vertical-scroll-design.md §2
 * P2, "Critic correction").
 *
 * Those helpers moved the page at any width. On a phone the games now use the
 * shared `revealSpan`/`revealTop`/`useItemTop`/`useRevealAfterCommit` with their
 * own targets; on a desktop window they call these, which decide only *whether*
 * and *where* — the scrolling itself still goes through `revealSpan`/`revealTop`.
 * They lived as `src/utils/desktopReveal.ts` copies in each game until the
 * rollout's last step (§4 step 6) moved them here, so no game keeps a local
 * reveal helper. Two families, because the old helpers came in two:
 *
 * - `revealOnDesktop` — einingakedjan, reynsluformulur, utfellingarhvorf
 *   (a box brought wholly into view, 12 px from the edge);
 * - `revealBelowFoldOnDesktop`, `useRevealTopOnDesktop`, `useItemStart`,
 *   `useCommitReveal` — jafnvaegisfasti, leysnijafnvaegi (a panel's bottom
 *   brought up, 8 px from the edge, never past its own first line).
 *
 * Do not reach for these in a new game: a game with no old desktop behaviour to
 * keep uses the phone-only helpers in `./reveal`.
 */

/** Space the first family's helpers kept between a revealed box and the edge. */
const MARGIN = 12;

/** Space the second family's helpers left between a revealed panel and the edge. */
const GAP = 8;

/**
 * After a tap, the box from `top` to `bottom` (default: `top` alone) brought
 * into view if any of it is off screen. Not gated to a desktop window — callers
 * choose when to call it.
 *
 * - A box that is wholly on screen, below the sticky header, never moves.
 * - A box that fits is moved the least that shows all of it, 12 px from the edge.
 * - A box taller than the screen is left alone while its start is in the upper
 *   half, and otherwise has its start brought 12 px under the header.
 */
export function revealOnDesktop(top: Element | null | undefined, bottom?: Element | null): void {
  if (!top) return;
  const end = bottom ?? top;
  // Measured before usableArea(), as einingakedjan's helper did: the first layout
  // read is where Chrome applies scroll anchoring for content that has just been
  // inserted, and reading the visual viewport first would skip it.
  const first = top.getBoundingClientRect();
  const area = usableArea();
  // The box ends at whichever of the two reaches lower, as the old helpers had it.
  const last = end.getBoundingClientRect().bottom > first.bottom ? end : top;
  const start = first.top;
  const stop = last.getBoundingClientRect().bottom;
  if (start >= area.top && stop <= area.bottom) return;

  const room = area.bottom - area.top - 2 * MARGIN;
  if (stop - start > room) {
    if (start >= area.top && start <= area.top + room / 2) return;
    revealTop(top, { anyWidth: true, always: true, gap: MARGIN });
    return;
  }
  revealSpan(last, [top], { anyWidth: true, gap: MARGIN });
}

/**
 * On a desktop window only: a panel that runs past the bottom of the window is
 * scrolled up just far enough to show it, but never so far that its own first
 * line goes under the sticky header.
 *
 * - A panel whose bottom is on screen never moves.
 * - A panel that fits is moved the least that shows its bottom, 8 px from the
 *   edge — `revealSpan` with the panel alone lands exactly there.
 * - A panel taller than that room has its first line brought 8 px under the
 *   header — `revealTop` with `always`.
 */
export function revealBelowFoldOnDesktop(el: Element | null | undefined): void {
  if (!el || isPhone()) return;
  const area = usableArea();
  const { top, bottom } = el.getBoundingClientRect();
  const below = bottom - area.bottom + GAP;
  if (below <= 0) return;
  const room = top - area.top - GAP;
  if (Math.min(below, room) <= 0) return;
  if (below <= room) revealSpan(el, [], { anyWidth: true, gap: GAP });
  else revealTop(el, { anyWidth: true, always: true, gap: GAP });
}

/**
 * On a desktop window: whenever `key` changes (the screen) — not on mount — the
 * top of `ref` comes back 8 px under the header if it has scrolled above it. On
 * a phone the screens use `useScreenTop` instead.
 */
export function useRevealTopOnDesktop(ref: RefObject<Element | null>, key: unknown): void {
  const shown = useRef(key);
  useEffect(() => {
    if (Object.is(shown.current, key)) return;
    shown.current = key;
    if (!isPhone()) revealTop(ref.current, { anyWidth: true });
  }, [key, ref]);
}

/**
 * `useItemTop`, with a desktop window kept exactly as it was. Returns a ref for
 * the item's card. Each time `key` changes — not on mount — focus moves to the
 * card's `[data-item-start]` (the new question), and:
 *
 * - on a phone, as `useItemTop` does it: in a layout effect, the card's top
 *   back under the header if it is off screen;
 * - on a desktop window, as the old helpers did it: after the render, the
 *   card's top back 8 px under the header only if it has scrolled above it.
 *   Focus moves two frames later, once the new item has rendered. Moved in the
 *   same frame, while the page is still shrinking from the feedback just
 *   removed, the focused question becomes the browser's scroll anchor, and a
 *   page scrolled to its foot comes to rest a few pixels from where it did
 *   (4 px at 1024 × 600, measured in leysnijafnvaegi).
 */
export function useItemStart<T extends HTMLElement>(key: unknown): RefObject<T | null> {
  const ref = useRef<T>(null);
  const laidOut = useRef(key);
  const painted = useRef(key);
  const start = () => {
    const box = ref.current;
    if (!box) return null;
    if (box.matches('[data-item-start]')) return box;
    return box.querySelector<HTMLElement>('[data-item-start]') ?? box;
  };
  useLayoutEffect(() => {
    if (Object.is(laidOut.current, key)) return;
    laidOut.current = key;
    if (!isPhone()) return;
    revealTop(ref.current);
    focusTarget(start());
  }, [key]);
  useEffect(() => {
    if (Object.is(painted.current, key)) return;
    painted.current = key;
    const box = ref.current;
    if (isPhone() || !box) return;
    revealTop(box, { anyWidth: true });
    // Two frames: the first renders the shrunken page, with the browser's own
    // scroll adjustment, before focus can take part in it. Not cancelled on
    // cleanup: under React's development double effect the second run sees the
    // key already shown and would schedule nothing; `focusTarget` skips an
    // element that has since left the page.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => focusTarget(start()));
    });
  }, [key]);
  return ref;
}

export interface DesktopCommitTargets extends CommitTargets {
  /** What the game's own helper brought up on a desktop window after this commit. */
  desktop: Element | null;
}

/**
 * `useRevealAfterCommit`, with a desktop window kept exactly as it was. After a
 * commit — each time `key` changes, but not on mount and not while it is `0`,
 * `null` or `false`. `key` is a counter where a repeat check with the same
 * outcome must still bring its message in.
 *
 * - A desktop window: in the effect, `desktop` brought up just far enough if it
 *   ran past the bottom (`revealBelowFoldOnDesktop`).
 * - A phone, a frame later once the feedback has painted: `revealSpan(bottom,
 *   tops)` — the question through Næsta where it fits, else the most context
 *   that does.
 * - At every width, focus moves to `focus` in that frame.
 */
export function useCommitReveal(key: unknown, get: () => DesktopCommitTargets): void {
  const latest = useRef(get);
  latest.current = get;
  const shown = useRef(key);
  useEffect(() => {
    if (Object.is(shown.current, key)) return;
    shown.current = key;
    if (key === 0 || key === null || key === false) return;
    revealBelowFoldOnDesktop(latest.current().desktop);
    // Not cancelled on cleanup, for the reason `useItemStart` gives.
    requestAnimationFrame(() => {
      const t = latest.current();
      revealSpan(t.bottom, t.tops);
      focusTarget(t.focus);
    });
  }, [key]);
}
