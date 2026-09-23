/**
 * Scroll a card back into view when its top has gone above the viewport.
 *
 * On a phone the button that moves on to the next item sits at the bottom of
 * a card taller than the screen, so the new item renders with its start —
 * the question, the formula, the setup — already scrolled past, and the
 * student sees the middle of it. This brings the top back.
 *
 * It does nothing when the top is already on screen, which is the desktop
 * case, so a layout that fits never moves.
 */
export function revealTop(el: Element | null | undefined): boolean {
  if (!el) return false;
  if (el.getBoundingClientRect().top >= 0) return false;
  el.scrollIntoView({ block: 'start', behavior: 'smooth' });
  return true;
}
