import { formatDecimal, formatScientific } from '@shared/utils';

/**
 * A number to a fixed count of significant figures, with the Icelandic decimal comma:
 * 5 → "5,0", 0.02 → "0,020", 973 → "970".
 */
export function formatSignificant(value: number, figures = 2): string {
  if (value === 0) return '0';
  const rounded = Number(value.toPrecision(figures));
  const decimals = Math.max(0, figures - 1 - Math.floor(Math.log10(Math.abs(rounded))));
  return formatDecimal(rounded, decimals);
}

/**
 * A percentage that may be vanishingly small. The fraction of molecules above Ea runs from a
 * few per cent down to 10⁻¹⁵ % across this game's sliders; printed to one decimal it read
 * "0.0%" nearly everywhere, and in JavaScript's exponent form it read "1.1e-4%".
 */
export function formatPercent(percent: number): string {
  return percent >= 0.1 ? formatSignificant(percent) : powerOfTen(percent);
}

/** A speed-up factor: plain up to ten thousand, in powers of ten beyond. */
export function formatFactor(factor: number): string {
  return factor < 1e4 ? formatSignificant(factor) : powerOfTen(factor);
}

/**
 * `formatScientific`, rounded first. It rounds the mantissa on its own, so a value just under a
 * power of ten came out as "10,0 × 10⁻⁴" — the catalyst demo at 470 K and Ea' = 45 kJ/mol
 * showed exactly that. Rounding the value to two figures first carries it into the next power:
 * "1,0 × 10⁻³".
 */
function powerOfTen(value: number, figures = 2): string {
  return formatScientific(Number(value.toPrecision(figures)), figures);
}
