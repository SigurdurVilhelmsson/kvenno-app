import { isPhone } from '@shared/utils';

/**
 * Below Tailwind's `md` (48rem) the periodic table keeps 46 px columns and
 * scrolls sideways inside its own box, so a level's feedback lands below the
 * table, out of sight. The game has always scrolled for that layout at every
 * width below md — a small tablet held upright as well as a phone.
 *
 * The shared helpers in `@shared/utils` scroll on a phone only (`PHONE_QUERY`).
 * Between them — at least 640 px wide and taller than 500 px, but narrower than
 * md — this is true, and the game keeps doing there exactly what it did before,
 * through the shared helpers with `anyWidth`. On a phone the shared phone
 * behaviour applies instead; from md up nothing scrolls.
 */
export function tabletBelowMd(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(max-width: 47.99rem)').matches &&
    !isPhone()
  );
}
