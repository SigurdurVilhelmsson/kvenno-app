import { revealSpan, revealTop, usableArea } from '@shared/utils';

/** Space the game's own helper kept between a revealed box and the edge. */
const MARGIN = 12;

/**
 * What a desktop window did before the vertical-scroll pass, kept exactly.
 *
 * Before it, this game carried its own reveal helper, and it moved the page at
 * any width: after a tap, the box from `top` to `bottom` was brought into view
 * whenever any of it was off screen. That helper is gone; on a phone the screens
 * now use the shared ones in `@shared/utils` with their own targets. A desktop
 * window keeps the old behaviour — the same trigger and the same landing — so it
 * neither gains nor loses a scroll. The scrolling itself goes through the shared
 * `revealSpan`/`revealTop`; this only decides whether and where. It is the same
 * helper as reynsluformulur's and utfellingarhvorf's, whose own helpers were
 * this game's.
 *
 * - A box that is wholly on screen, below the sticky header, never moves.
 * - A box that fits is moved the least that shows all of it, 12 px from the edge.
 * - A box taller than the screen is left alone while its start is in the upper
 *   half, and otherwise has its start brought 12 px under the header.
 */
export function revealOnDesktop(top: Element | null | undefined, bottom?: Element | null): void {
  if (!top) return;
  const end = bottom ?? top;
  // Measured before usableArea(), as the old helper did: the first layout read
  // is where Chrome applies scroll anchoring for content that has just been
  // inserted, and reading the visual viewport first would skip it.
  const first = top.getBoundingClientRect();
  const area = usableArea();
  // The box ends at whichever of the two reaches lower, as the old helper had it.
  const last = end.getBoundingClientRect().bottom > first.bottom ? end : top;
  const start = first.top;
  const stop = last.getBoundingClientRect().bottom;
  if (start >= area.top && stop <= area.bottom) return;

  const room = area.bottom - area.top - 2 * MARGIN;
  if (stop - start > room) {
    if (start >= area.top && start <= area.top + room / 2) return;
    revealTop(top, { anyWidth: true, always: true, gap: MARGIN });
    return;
  }
  revealSpan(last, [top], { anyWidth: true, gap: MARGIN });
}
