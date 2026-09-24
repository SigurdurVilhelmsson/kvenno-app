/**
 * Flip the sign of a typed number: `33,5` → `-33,5`, `-33,5` → `33,5`, empty → `-`.
 *
 * The ΔG° field raises the decimal keypad, and on an iPhone that keypad has no
 * minus key — while most ΔG° answers in this game are negative. The `±` button
 * beside the field calls this, so a negative answer can be typed by touch.
 * A typographic minus (U+2212) is read as a minus too.
 */
export function toggleSign(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('-') || trimmed.startsWith('−')) return trimmed.slice(1);
  return `-${trimmed}`;
}
