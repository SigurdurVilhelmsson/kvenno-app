/**
 * Flip the sign of a typed number: `33,5` → `-33,5`, `-33,5` → `33,5`, empty → `-`.
 *
 * The ΔG° field raises the decimal keypad, and on an iPhone that keypad has no
 * minus key — while most ΔG° answers in this game are negative. The `±` button
 * beside the field calls this, so a negative answer can be typed by touch.
 * A typographic minus (U+2212) is read as a minus too. It is the shared
 * `ScientificInput`'s own function, so the two `±` buttons cannot disagree.
 */
export { toggleSign } from '@shared/components';
