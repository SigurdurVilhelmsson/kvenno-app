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
  useLayoutEffect(() => {
    if (key === 'default') {
      // Loaded afresh: give the entry a key of its own, so a reload of it can find its place.
      const { pathname, search, hash } = location;
      navigate({ pathname, search, hash }, { replace: true, preventScrollReset: true });
      return;
    }
    if (type !== 'POP') return;
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
    let frame = 0;
    const store = () => {
      try {
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
