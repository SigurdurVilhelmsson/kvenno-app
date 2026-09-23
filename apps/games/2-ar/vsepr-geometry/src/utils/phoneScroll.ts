import { useEffect, useRef } from 'react';

/**
 * Start the page at the top whenever `key` changes, below md.
 *
 * Each screen of this game is one long column on a phone, and the button that
 * replaces it (a level card, "Hefja spurningar", "Næsta spurning", "Næsta
 * sameind") sits a screen or more down. Without this the new screen opens at
 * the old scroll position: entering Stig 3 from the menu lands on its reference
 * tables, and every new question starts with the question itself above the
 * fold. From md up the page is left alone, so desktop behaves as it did.
 *
 * The first value is skipped, so nothing moves on mount (StrictMode included).
 */
export function useScrollTopOnChange(key: unknown): void {
  const previous = useRef(key);
  useEffect(() => {
    if (previous.current === key) return;
    previous.current = key;
    if (window.matchMedia?.('(min-width: 48rem)').matches) return;
    if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'auto' });
  }, [key]);
}
