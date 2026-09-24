/**
 * Scroll an element back into view when its top has gone above the viewport.
 *
 * On a phone every screen of this game is two or three screens tall, and the
 * buttons that move on — the mode cards on the menu, «Næsta jafnvægi →»,
 * «Næsta strax →», the automatic advance in Keppnishamur — all sit near the
 * bottom of what they replace. The browser keeps the scroll position, so the
 * next equilibrium used to open with its equation, its ΔH and (in
 * Keppnishamur) the running timer already scrolled past: the student saw a
 * stress and three buttons for a reaction they could not see.
 *
 * It does nothing when the top is already on screen, so a layout that fits
 * never moves.
 */
export function revealTop(el: Element | null | undefined, smooth = true): boolean {
  if (!el) return false;
  if (el.getBoundingClientRect().top >= 0) return false;
  el.scrollIntoView({ block: 'start', behavior: smooth ? 'smooth' : 'auto' });
  return true;
}

/** Smooth scrolling unless the student or their system asked for less motion. */
export function prefersSmoothScroll(reducedMotionSetting: boolean): boolean {
  if (reducedMotionSetting) return false;
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true;
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
