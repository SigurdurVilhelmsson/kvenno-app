import { useLayoutEffect, useRef } from 'react';

import { isPhone, revealTop } from '@shared/utils';

/**
 * Below Tailwind's `md` (48rem) this game's panels stack into one column, and
 * its old scroll helper worked at every width below md — a small tablet held
 * upright as well as a phone: each new screen, question and molecule started
 * at the top, and a revealed panel was brought into view.
 *
 * The shared helpers in `@shared/utils` scroll on a phone only (`PHONE_QUERY`).
 * Between the two — at least 640 px wide and taller than 500 px, but narrower
 * than md — this is true, and the game keeps doing there exactly what it did
 * before, through the shared helpers with `anyWidth`. On a phone the shared
 * phone behaviour applies instead; from md up nothing scrolls.
 */
export function tabletBelowMd(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(max-width: 47.99rem)').matches &&
    !isPhone()
  );
}

/**
 * Between a phone and md, start the page at the top in one jump each time
 * `key` changes (not on mount), as the game's old helper did there. A phone
 * gets the shared `useScreenTop` / `useItemTop` instead, and md up is left
 * alone.
 */
export function useTabletTopOnChange(key: unknown): void {
  const shown = useRef(key);
  useLayoutEffect(() => {
    if (Object.is(shown.current, key)) return;
    shown.current = key;
    if (tabletBelowMd()) {
      revealTop(document.documentElement, { anyWidth: true, always: true, instant: true });
    }
  }, [key]);
}
