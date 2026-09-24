import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

import { focusTarget, isPhone, revealSpan, revealTop, usableArea } from '@shared/utils';

/** Space the game's own helper left between a revealed panel and the edge. */
const GAP = 8;

/**
 * What a desktop window did before the vertical-scroll pass, kept exactly.
 *
 * Before it, this game carried its own reveal helper, and it moved the page at
 * any width: feedback that ran past the bottom of the window was scrolled up
 * just far enough to show it, but never so far that its own first line went
 * under the sticky header. That helper is gone; on a phone the screens now use
 * the shared ones in `@shared/utils` with their own targets. A desktop window
 * keeps the old behaviour — the same trigger and the same landing — so it
 * neither gains nor loses a scroll. The scrolling itself goes through the
 * shared `revealSpan`/`revealTop`; this only decides whether and where.
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
 * The old helper's other trigger, for a desktop window: whenever `key` changes
 * (the screen) — not on mount — the top of `ref` comes back 8 px under the
 * header if it has scrolled above it. On a phone the screens use `useScreenTop`
 * instead.
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
 * `useItemTop` from `@shared/utils`, with a desktop window kept exactly as it
 * was. Returns a ref for the problem's card. Each time `key` changes — not on
 * mount — focus moves to the card's `[data-item-start]` (the new question), and:
 *
 * - on a phone, as `useItemTop` does it: in a layout effect, the card's top
 *   back under the header if it is off screen;
 * - on a desktop window, as the old helper did it: after the render, the card's
 *   top back 8 px under the header only if it has scrolled above it. Focus
 *   moves a frame later, once the new problem has rendered. Moved in the same
 *   frame, while the page is still shrinking from the feedback just removed,
 *   the focused question becomes the browser's scroll anchor, and a page
 *   scrolled to its foot comes to rest a few pixels from where it did (4 px at
 *   1024 × 600, measured).
 */
export function useItemStart<T extends HTMLElement>(key: unknown): RefObject<T | null> {
  const ref = useRef<T>(null);
  const laidOut = useRef(key);
  const painted = useRef(key);
  const start = () => {
    const box = ref.current;
    if (!box) return null;
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
    // scroll adjustment, before focus can take part in it.
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => focusTarget(start()));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [key]);
  return ref;
}
