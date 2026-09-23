import { formatScientific } from '../engine/ksp';

/**
 * A number in scientific notation, kept on one line.
 *
 * `1,8 × 10⁻¹⁰` has spaces in it, so on a phone a line could break at the `×`
 * and strand the power of ten at the start of the next line — which reads as
 * two numbers. Held together, the line breaks before or after the number
 * instead. A unit, when given, stays with it for the same reason.
 */
export function Sci({ value, figures, unit }: { value: number; figures?: number; unit?: string }) {
  return (
    <span className="whitespace-nowrap">
      {formatScientific(value, figures)}
      {unit ? ` ${unit}` : ''}
    </span>
  );
}
