import { useEffect, useLayoutEffect } from 'react';

import { useNavigationType } from 'react-router-dom';

const key = () => `islenskubraut-skrun:${window.location.pathname}`;

/**
 * Keeps a long review page's place across a reload or a restored tab. The review pages load on
 * their own, after the browser has tried to put the reader back: Chromium finds the page too short
 * then and gives up. This puts them back once the page is there. Only on a reload, a restored tab
 * or back/forward (POP); a page opened by a link opens at its top.
 */
export function useKeepScroll() {
  const type = useNavigationType();
  useLayoutEffect(() => {
    if (type !== 'POP') return;
    try {
      const y = Number(window.sessionStorage.getItem(key()));
      if (y > 0) window.scrollTo(0, y);
    } catch {
      // No session storage: the browser's own restoring is all there is.
    }
    // Once, when the page has mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    let frame = 0;
    const save = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        try {
          window.sessionStorage.setItem(key(), String(Math.round(window.scrollY)));
        } catch {
          // As above.
        }
      });
    };
    window.addEventListener('scroll', save, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', save);
    };
  }, []);
}

/** Before a reload that stands in for a link, so the page opens at its top as a link's would. */
export function forgetScroll() {
  try {
    window.sessionStorage.removeItem(key());
  } catch {
    // As above.
  }
  window.scrollTo(0, 0);
}
