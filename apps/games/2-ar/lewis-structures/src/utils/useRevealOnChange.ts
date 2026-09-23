import { useEffect, useRef, type RefObject } from 'react';

/**
 * "Næsta …" swaps the question in place, so the page keeps its scroll
 * position. On a phone that left the next molecule's drawing board above the
 * fold (its bottom edge 12 px from the top of a 360×740 screen): the student
 * saw only the lone-pair controls of a molecule whose name and board they could
 * not see. When `key` changes and the element's top has scrolled off, bring it
 * back. Nothing moves when the element is already on screen, and the first
 * render is skipped.
 */
export function useRevealOnChange(ref: RefObject<HTMLElement | null>, key: unknown): void {
  const last = useRef(key);
  useEffect(() => {
    if (Object.is(last.current, key)) return;
    last.current = key;
    const el = ref.current;
    if (el && el.getBoundingClientRect().top < 0) {
      el.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
    }
  }, [ref, key]);
}
