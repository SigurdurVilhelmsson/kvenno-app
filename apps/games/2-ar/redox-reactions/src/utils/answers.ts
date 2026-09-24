/**
 * Reading what a student typed into a Stig 3 answer field.
 *
 * The identify step asks "Hvað oxast?" about a species shown as `Cu²⁺`, `O₂` or `Br⁻`. A phone
 * keyboard has no superscripts or subscripts, so the same answer arrives as `Cu2+`, `O2` or
 * `Br-`, often with a trailing space from the keyboard's word suggestions. All of those name the
 * species, and so does the bare element symbol the grader has always accepted.
 */

const SUPERSCRIPT_OR_SUBSCRIPT: Record<string, string> = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
  '⁺': '+',
  '⁻': '-',
  '₀': '0',
  '₁': '1',
  '₂': '2',
  '₃': '3',
  '₄': '4',
  '₅': '5',
  '₆': '6',
  '₇': '7',
  '₈': '8',
  '₉': '9',
  '−': '-',
};

/** Lower-case, no spaces or carets, every superscript and subscript as a plain character. */
export function normalizeSpecies(text: string): string {
  return text
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻₀₁₂₃₄₅₆₇₈₉−]/g, (c) => SUPERSCRIPT_OR_SUBSCRIPT[c])
    .replace(/[\s^]/g, '')
    .toLowerCase();
}

/**
 * Whether `answer` names `species`: either its element symbol alone (`Cu`, `O`) or the species
 * written out in full, with its charge or subscript in either notation (`Cu²⁺`, `Cu2+`, `O₂`,
 * `O2`). A different charge (`Cu+`) or the product instead of the reactant (`Zn2+` for `Zn`) is
 * not the species and is not accepted.
 */
export function matchesSpecies(answer: string, species: string): boolean {
  const given = normalizeSpecies(answer);
  if (given === '') return false;
  const full = normalizeSpecies(species);
  const symbol = full.replace(/[0-9+-]/g, '');
  return given === full || given === symbol;
}

/**
 * A whole-number answer (an electron count, a multiplier), or NaN. `parseInt` read `2.5` as 2
 * and `2abc` as 2, so a count field accepted answers that are not the count. A whole number
 * written with a zero decimal part (`2.0`, `-1,0`) is still that number, as it was before.
 */
export function parseWholeNumber(text: string): number {
  const trimmed = text.trim();
  if (!/^[+-]?\d+(?:[.,]0*)?$/.test(trimmed)) return Number.NaN;
  return Number(trimmed.replace(/[.,]0*$/, ''));
}
