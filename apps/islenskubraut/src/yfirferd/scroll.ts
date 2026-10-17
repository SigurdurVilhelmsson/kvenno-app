import { useEffect, useLayoutEffect } from 'react';

import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';

/**
 * Where a history entry's place is kept. React Router keeps an entry's key in `history.state`
 * across a reload and back/forward; a page loaded afresh, from a bookmark or a typed address, has
 * none ('default') until `useKeepScroll` gives it one, so it never takes another visit's place.
 */
const keyFor = (entry: string) => `islenskubraut-skrun:${entry}`;

/**
 * Keeps a long review page's place across a reload, a restored tab and back/forward. The review
 * pages load on their own, after the browser has tried to put the reader back: Chromium finds the
 * page too short then and gives up. This puts them back once the page is there. A page opened by
 * a link, or loaded afresh, opens at its top.
 */
export function useKeepScroll() {
  const location = useLocation();
  const { key } = location;
  const type = useNavigationType();
  const navigate = useNavigate();
  // Back, forward or a reload into this page: its place, once it is there.
  useLayoutEffect(() => {
    if (key === 'default' || type !== 'POP') return;
    try {
      const y = Number(window.sessionStorage.getItem(keyFor(key)));
      if (y > 0) window.scrollTo(0, y);
    } catch {
      // No session storage: the browser's own restoring is all there is.
    }
    // Once, when the page has mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (key === 'default') {
      // Loaded afresh, or a link to a card on the page (`#dyr`), which the browser makes an entry
      // for with no key: give it one, so a reload of it can find its place.
      const { pathname, search, hash } = location;
      navigate({ pathname, search, hash }, { replace: true, preventScrollReset: true });
      return;
    }
    let frame = 0;
    const store = () => {
      try {
        // A scroll or pagehide after history has moved on, as when a link scrolls the next page
        // to its top, belongs to that page and not to this entry.
        if ((window.history.state as { key?: string } | null)?.key !== key) return;
        window.sessionStorage.setItem(keyFor(key), String(Math.round(window.scrollY)));
      } catch {
        // As above.
      }
    };
    const save = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(store);
    };
    // A new entry (the listening page's filters replace one) starts where the page is now.
    store();
    window.addEventListener('scroll', save, { passive: true });
    // The last place before the page goes, which a pending frame would miss.
    window.addEventListener('pagehide', store);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', save);
      window.removeEventListener('pagehide', store);
    };
    // The entry is what matters; the location it was read from is the entry's own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

/** Before a reload that stands in for a link, so the page opens at its top as a link's would. */
export function forgetScroll() {
  try {
    const entry = (window.history.state as { key?: string } | null)?.key ?? 'default';
    window.sessionStorage.removeItem(keyFor(entry));
  } catch {
    // As above.
  }
  window.scrollTo(0, 0);
}
