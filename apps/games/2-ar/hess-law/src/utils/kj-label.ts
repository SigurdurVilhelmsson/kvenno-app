import { formatDecimal } from '@shared/utils';

/**
 * A ΔH for a diagram label, to one decimal where it has one: `-787`, `-1366,8`.
 *
 * The diagrams printed `toFixed(0)`, so a staircase whose steps were -787,0, -857,5 and
 * +277,6 showed -787, -858 (or -857) and +278 under a total of -1367 while the card beside
 * it said -1366,8 (year-2 audit, 2026-11-15). Rounding each label on its own made the
 * labels disagree with the sum and with the card. Whole values stay short.
 */
export function kjLabel(value: number): string {
  const text = formatDecimal(Math.round(value * 10) / 10);
  return value > 0 ? `+${text}` : text;
}
