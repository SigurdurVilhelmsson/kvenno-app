/** How far down the viewport the game header covers: sticky in portrait, static on a landscape phone. */
function coveredByHeader(): number {
  const header = document.querySelector('header');
  return header && /sticky|fixed/.test(getComputedStyle(header).position)
    ? header.getBoundingClientRect().bottom
    : 0;
}

function scrollBehavior(): ScrollBehavior {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  return reduced ? 'auto' : 'smooth';
}

/**
 * Bring a just-rendered verdict on screen — but only when it landed off it.
 *
 * On a phone held sideways, and on the smallest portrait screens, Beita's
 * verdict renders under the klofnun bar and below the bottom edge, so tapping
 * "Svara" looked as if nothing had happened. Where the verdict is already
 * readable the page is left exactly where the student put it. Kanna uses it
 * the same way for its first measurement, whose row opens under the buttons.
 *
 * @param verdict  the element whose top line must be readable (the "Rétt!" /
 *                 "Rangt" heading)
 * @param block    the whole feedback block to bring in: shown entire if it fits
 *                 under the header, otherwise from its top edge
 */
export function revealIfBelowFold(
  verdict: HTMLElement | null,
  block: HTMLElement | null = verdict,
  minVisible = 48
): void {
  if (!verdict || !block) return;
  const viewport = window.innerHeight;
  if (verdict.getBoundingClientRect().top + minVisible <= viewport) return;

  const covered = coveredByHeader();
  const box = block.getBoundingClientRect();
  const room = viewport - covered;
  const delta = box.height + 16 <= room ? box.bottom + 16 - viewport : box.top - covered - 8;
  window.scrollBy({ top: delta, behavior: scrollBehavior() });
}

/**
 * Bring the top of a just-swapped block back on screen — but only when it is
 * above the visible area.
 *
 * Skilja's "Næsta skref" sits under the step it replaces. On a phone the
 * student has scrolled down to reach it, so without this the next step opened
 * with its heading and first paragraph already scrolled past, under the header.
 * Where the top is already visible the page is left where it is.
 */
export function revealTopIfAbove(block: HTMLElement | null): void {
  if (!block) return;
  const covered = coveredByHeader();
  const top = block.getBoundingClientRect().top;
  if (top >= covered) return;
  window.scrollBy({ top: top - covered - 8, behavior: scrollBehavior() });
}
