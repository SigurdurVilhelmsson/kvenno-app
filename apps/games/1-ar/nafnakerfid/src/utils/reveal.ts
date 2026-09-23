/**
 * Keep the part of the screen a student just changed in view on a phone.
 *
 * The levels swap content in place: "Næsta regla" replaces the rule card, "Næsta
 * spurning" the question, a Level 2 step the step panel. Those buttons sit at the
 * bottom of pages that are several screens tall at 360 px, so the new content
 * used to start above the viewport and the student saw only the bottom of it.
 * On a desktop screen the content is usually already in view, and then nothing
 * moves.
 */

function behavior(): ScrollBehavior {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

/** Scroll `el` to the top of the viewport, but only if its top is above it. */
export function revealTop(el: Element | null | undefined): void {
  if (!el) return;
  if (el.getBoundingClientRect().top < 0) {
    el.scrollIntoView?.({ block: 'start', behavior: behavior() });
  }
}

/** Scroll the least distance that brings `el` fully into view, if it is not. */
export function revealNearest(el: Element | null | undefined): void {
  if (!el) return;
  const { top, bottom } = el.getBoundingClientRect();
  if (top < 0 || bottom > window.innerHeight) {
    el.scrollIntoView?.({ block: 'nearest', behavior: behavior() });
  }
}

/** Back to the top of the page, used when the whole screen is replaced. */
export function scrollPageToTop(): void {
  if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'auto' });
}
