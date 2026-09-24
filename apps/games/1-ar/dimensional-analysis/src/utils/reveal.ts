import { useEffect, useRef } from 'react';

/**
 * Scroll an element back into view when its top has gone above the viewport.
 *
 * On a phone every screen of this game is taller than the viewport, and the
 * button that moves on — "Byrja", "Næsta verkefni", "Senda inn" — sits at the
 * foot of it. The browser keeps the scroll offset when React swaps the content,
 * so without this the next problem opened with its context already scrolled
 * past, and a verdict could open with its heading above the screen.
 *
 * It does nothing when the top is already on screen, which is the desktop
 * case, so a layout that fits never moves. The element's `scroll-mt-*` decides
 * where it lands, clear of the sticky header.
 */
export function revealTop(el: Element | null | undefined): boolean {
  if (!el || el.getBoundingClientRect().top >= 0) return false;
  el.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
  return true;
}

/**
 * A ref whose element is revealed (see `revealTop`) each time `screenKey`
 * changes — a new problem, or the intro giving way to the first one. Not on
 * mount: the swap from the menu into a level is left to the platform-wide
 * scroll fix; this covers only the swaps inside a level, where the problem's
 * context and starting value used to open entirely above a phone's screen.
 */
export function useRevealTopOnChange<T extends Element>(screenKey: string | number) {
  const ref = useRef<T>(null);
  const shown = useRef(screenKey);
  useEffect(() => {
    if (shown.current === screenKey) return;
    shown.current = screenKey;
    revealTop(ref.current);
  }, [screenKey]);
  return ref;
}
