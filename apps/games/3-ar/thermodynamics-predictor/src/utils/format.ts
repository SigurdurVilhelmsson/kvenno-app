import { formatDecimal } from '@shared/utils';

/**
 * `formatDecimal` rounded to `decimals`, except that a value which rounds to zero prints as
 * `0`, never `-0`.
 *
 * Rounding a small negative number keeps its sign: water freezes at a crossover of 272,7 K,
 * which is −0,3 °C, and the crossover panel printed `273 K (-0°C)`. The ΔG° at an equilibrium
 * temperature is a few hundredths either side of zero and printed `-0 kJ/mol` on the graph.
 */
export function formatRounded(value: number, decimals: number): string {
  const text = formatDecimal(value, decimals);
  return /^-0(,0+)?$/.test(text) ? text.slice(1) : text;
}
