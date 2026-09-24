/**
 * Scroll a card back into view when its top has gone above the viewport.
 *
 * On a phone "Næsta verkefni" sits at the bottom of a worked solution taller
 * than the screen, so the next task rendered with its statement, target pH and
 * given data already scrolled past, and the student saw the middle of it. This
 * brings the top back.
 *
 * It does nothing when the top is already on screen, so a layout that fits
 * never moves.
 */
export function revealTop(el: Element | null | undefined): boolean {
  if (!el) return false;
  if (el.getBoundingClientRect().top >= 0) return false;
  el.scrollIntoView({ block: 'start', behavior: 'smooth' });
  return true;
}

/**
 * Scroll an element fully into view by the shortest distance. `block: 'nearest'`
 * leaves an element that is already on screen where it is, so this only moves
 * the page when part of the element is hidden.
 */
export function revealNearest(el: Element | null | undefined): void {
  if (!el || typeof el.scrollIntoView !== 'function') return;
  el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
