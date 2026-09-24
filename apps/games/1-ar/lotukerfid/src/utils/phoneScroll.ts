/**
 * Scrolling that only phones need.
 *
 * Below the `md` breakpoint the periodic table keeps tappable cells and scrolls
 * sideways inside its own box, and a level's feedback lands below that table —
 * out of sight on a phone, where on a desktop it is one short scroll away. These
 * helpers keep what a student needs in view there, and do nothing at `md` and
 * up, so the desktop layout behaves exactly as it did.
 */

/** The phone layouts: narrower than Tailwind's `md` (48rem). */
const PHONE_QUERY = '(max-width: 47.99rem)';

export function isPhoneLayout(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.(PHONE_QUERY).matches;
}

function behavior(): ScrollBehavior {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

/** Bring `el` into view with the least scrolling, on phones only. */
export function revealOnPhone(el: HTMLElement | null): void {
  if (!el || !isPhoneLayout() || typeof el.scrollIntoView !== 'function') return;
  el.scrollIntoView({ block: 'nearest', behavior: behavior() });
}

/**
 * Start a new screen or question at the top, on phones only.
 *
 * The page keeps its scroll offset when the content under it is swapped, so a
 * student who tapped "Næsta spurning" at the bottom of a long screen otherwise
 * lands on the next question with its text scrolled away above them.
 */
export function scrollTopOnPhone(): void {
  if (!isPhoneLayout()) return;
  window.scrollTo({ top: 0 });
}

/** A horizontal extent, in the scroll container's content coordinates. */
export interface Span {
  left: number;
  right: number;
}

/**
 * Where to scroll a sideways-scrolling box so the cells that matter are visible.
 *
 * - Returns `null` when every span is already fully visible, or the box cannot
 *   scroll any closer to them, so a student's own scrolling is never undone for
 *   no reason.
 * - When all spans fit in the box together, centres their joint extent.
 * - When they do not, keeps `primary` in view — centring it if it is not.
 *
 * `margin` keeps a cell's ring clear of the box edge.
 */
export function revealScrollLeft(
  spans: Span[],
  primary: Span | null,
  viewportWidth: number,
  scrollLeft: number,
  maxScrollLeft: number,
  margin = 8
): number | null {
  if (spans.length === 0 || viewportWidth <= 0) return null;
  // Clamped to the box; a target the box cannot move any closer to is left be.
  const clamp = (x: number) => {
    const left = Math.max(0, Math.min(maxScrollLeft, Math.round(x)));
    return Math.abs(left - scrollLeft) < 1 ? null : left;
  };
  const visible = (s: Span) =>
    s.left >= scrollLeft + margin - 0.5 && s.right <= scrollLeft + viewportWidth - margin + 0.5;

  if (spans.every(visible)) return null;

  const left = Math.min(...spans.map((s) => s.left));
  const right = Math.max(...spans.map((s) => s.right));
  if (right - left + 2 * margin <= viewportWidth) {
    return clamp((left + right) / 2 - viewportWidth / 2);
  }

  const target = primary ?? spans[0];
  if (visible(target)) return null;
  return clamp((target.left + target.right) / 2 - viewportWidth / 2);
}
