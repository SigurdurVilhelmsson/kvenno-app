/**
 * Flip the sign of a typed number: `890,3` → `-890,3`, `-890,3` → `890,3`, empty → `-`.
 *
 * The Level 3 answer field raises the decimal keypad, and on an iPhone that
 * keypad has no minus key — while five of the six Level 3 answers are negative.
 * The `±` button beside the field calls this, so a negative answer can be typed
 * by touch. A typographic minus (U+2212) is read as a minus too. Same behaviour
 * as `3-ar/thermodynamics-predictor`'s `toggleSign`; games do not import from
 * each other.
 */
export function toggleSign(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('-') || trimmed.startsWith('−')) return trimmed.slice(1);
  return `-${trimmed}`;
}
