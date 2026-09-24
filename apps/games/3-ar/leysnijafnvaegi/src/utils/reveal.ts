import { useEffect, useRef, type RefObject } from 'react';

/**
 * Keeping the work on screen on a phone.
 *
 * Every phase here is a card taller than a phone screen, and the button that
 * moves on — a phase card on the menu, "Næsta dæmi", "Ljúka" — sits low on it.
 * The next screen or problem renders in place, so without help the student
 * lands part-way down it with its start scrolled away above, under the sticky
 * game header. And feedback that runs past the bottom edge hides the button
 * that moves on.
 *
 * Neither scroll happens when the element is already where it should be, which
 * is the desktop case: a layout that fits never moves.
 *
 * The same helpers as `3-ar/jafnvaegisfasti/src/utils/reveal.ts`, copied rather
 * than imported, since games do not reach into each other's source.
 */

/** Space left between the header and a revealed element, in CSS px. */
const GAP = 8;

function scrollBehavior(): ScrollBehavior {
  const reduce =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return reduce ? 'auto' : 'smooth';
}

/**
 * How much of the top of the viewport the game header covers.
 *
 * Zero on a short landscape screen, where the shared header is static and
 * scrolls away with the page rather than holding a sixth of the height.
 */
export function stickyHeaderBottom(): number {
  const header = document.querySelector('header');
  if (!header) return 0;
  const { position } = getComputedStyle(header);
  if (position !== 'sticky' && position !== 'fixed') return 0;
  return Math.max(0, header.getBoundingClientRect().bottom);
}

/** Scroll `el` back into view if its top has gone above the visible area. */
export function revealTop(el: Element | null | undefined): boolean {
  if (!el) return false;
  const cover = stickyHeaderBottom();
  const { top } = el.getBoundingClientRect();
  if (top >= cover) return false;
  window.scrollBy({ top: top - cover - GAP, behavior: scrollBehavior() });
  return true;
}

/**
 * Scroll just far enough to show `el` if it ends below the bottom of the
 * screen — but never so far that its own top goes under the header. A panel
 * taller than the screen is brought up to its first line, which is where the
 * student starts reading it.
 */
export function revealBottom(el: Element | null | undefined): boolean {
  if (!el) return false;
  const { top, bottom } = el.getBoundingClientRect();
  const below = bottom - window.innerHeight + GAP;
  if (below <= 0) return false;
  const room = top - stickyHeaderBottom() - GAP;
  const amount = Math.min(below, room);
  if (amount <= 0) return false;
  window.scrollBy({ top: amount, behavior: scrollBehavior() });
  return true;
}

/**
 * `revealTop(ref.current)` whenever `key` changes — the screen, the problem
 * index — but not on the first render, when nothing has moved yet. Comparing
 * with the previous key rather than counting renders keeps React's development
 * double-render from firing it on mount.
 */
export function useRevealTopOnChange(ref: RefObject<Element | null>, key: unknown): void {
  const previous = useRef(key);
  useEffect(() => {
    if (previous.current === key) return;
    previous.current = key;
    revealTop(ref.current);
  }, [key, ref]);
}
