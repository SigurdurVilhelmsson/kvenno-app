/**
 * Keep the part of the screen a student just changed in view on a phone.
 *
 * Several taps here change something away from the finger. "Næsta súla" adds a
 * column to a table above the button, "Svara" puts the verdict under the input,
 * and "Næsta efni" / "Næsta dæmi" swap in a new compound at the top of a card
 * the student has scrolled past — which on a landscape phone is every card.
 * Without this the student taps and sees nothing happen. On a desktop screen
 * the change is already in view, and then nothing moves.
 *
 * The same shape as `1-ar/utfellingarhvorf/src/utils/reveal.ts`; each game is
 * its own Vite build, so it is a copy rather than an import.
 */

/** Space kept between a revealed element and the edge it is aligned to. */
const MARGIN = 12;

interface Box {
  top: number;
  bottom: number;
}

/**
 * How far to scroll so that `box` is on screen; 0 when it already is.
 *
 * Coordinates are viewport-relative. `viewTop` is the first row not covered by
 * the sticky header. A box that fits is moved the least distance that shows all
 * of it. A box taller than the screen is left alone while its start is in the
 * upper half of the screen, and otherwise has its start brought to the top:
 * the start is what a student reads first.
 */
export function revealDelta(box: Box, viewTop: number, viewBottom: number): number {
  if (box.top >= viewTop && box.bottom <= viewBottom) return 0;

  const room = viewBottom - viewTop - 2 * MARGIN;
  if (box.bottom - box.top > room) {
    if (box.top >= viewTop && box.top <= viewTop + room / 2) return 0;
    return box.top - viewTop - MARGIN;
  }
  if (box.top < viewTop) return box.top - viewTop - MARGIN;
  return box.bottom - viewBottom + MARGIN;
}

/**
 * The first viewport row below the game header, while that header is sticky.
 * On a landscape phone the shared header is static and scrolls away, so
 * nothing covers the top of the screen there.
 */
function visibleTop(): number {
  const header = document.querySelector('header');
  if (!header) return 0;
  const { position } = getComputedStyle(header);
  if (position !== 'sticky' && position !== 'fixed') return 0;
  return Math.max(0, header.getBoundingClientRect().bottom);
}

function behavior(): ScrollBehavior {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

/**
 * Scroll the page just enough to bring `el` into view, if it is not.
 *
 * With `through`, the box revealed runs from the top of `el` to the bottom of
 * `through`, so a new compound and the inputs that ask about it come into view
 * together.
 */
export function reveal(el: Element | null | undefined, through?: Element | null): void {
  if (!el) return;
  const { top, bottom } = el.getBoundingClientRect();
  const end = through ? Math.max(bottom, through.getBoundingClientRect().bottom) : bottom;
  const delta = revealDelta({ top, bottom: end }, visibleTop(), window.innerHeight);
  if (delta !== 0) window.scrollBy({ top: delta, behavior: behavior() });
}

/**
 * Scroll a table that is wider than its box to its right-hand end, so the
 * column just added is the one on screen. Does nothing when the table fits,
 * which is every desktop width.
 */
export function revealLastColumn(scroller: HTMLElement | null | undefined): void {
  if (!scroller) return;
  const left = scroller.scrollWidth - scroller.clientWidth;
  if (left <= 0) return;
  if (typeof scroller.scrollTo === 'function') scroller.scrollTo({ left, behavior: behavior() });
  else scroller.scrollLeft = left;
}

/** Back to the top of the page, used when the whole screen is replaced. */
export function scrollPageToTop(): void {
  if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'auto' });
}
