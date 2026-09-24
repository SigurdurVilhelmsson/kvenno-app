/**
 * Scroll `el` to the top of the viewport, but only if its top edge has been
 * scrolled out of view above it.
 *
 * On a phone the "Næsta" button sits a screen or more below the start of the
 * question, and the next question renders in place, so without this the
 * student lands on its answer options with the question text off screen.
 */
export function revealTop(el: HTMLElement | null): void {
  if (!el || el.getBoundingClientRect().top >= 0) return;
  el.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
}
