/**
 * Text hygiene for Íslenskubraut content.
 *
 * Reviewers paste from Word, email and existing worksheets, which drags in soft
 * hyphens, non-breaking spaces and decomposed accents. That is the exact character
 * class behind the August 2026 corruption, where "Orðaforði" reached students as
 * "Orda<U+00AD>fordi" — invisible in an editor and in the rendered PDF.
 */

/**
 * Characters that render as nothing (or as a space) and must never enter the data.
 * Written with escape sequences and alternation, not a literal character class:
 * a literal class containing these codepoints is unreviewable (the characters are
 * invisible in source) and is rejected by this repo's ESLint (no-irregular-whitespace,
 * no-misleading-character-class).
 *
 * U+00AD soft hyphen, U+200B zero-width space, U+200C zero-width non-joiner,
 * U+200D zero-width joiner, U+2060 word joiner, U+FEFF byte-order mark / zero-width
 * no-break space.
 */
const INVISIBLE = /\u00AD|\u200B|\u200C|\u200D|\u2060|\uFEFF/g;

export const ICELANDIC_RE = /[áéíóúýðþæöÁÉÍÓÚÝÐÞÆÖ]/;

/** Stems that only occur in words which must carry an Icelandic character. */
const FLATTENED_RE =
  /\b(husdyr|gaeludyr|ordafordi|dyrid|liffraedilegur|bufenadur|hlyja|rannsoka|afer[dt]|thekkt|stordyr)\b/i;

/**
 * NFC-normalise, drop invisibles, turn non-breaking spaces into ordinary ones,
 * collapse whitespace runs and trim.
 */
export function normalizeText(value) {
  return value
    .normalize('NFC')
    .replace(INVISIBLE, '')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Returns the invisible codepoints present, as U+XXXX strings, in order of appearance. */
export function findInvisible(value) {
  const found = [];
  for (const match of value.matchAll(INVISIBLE)) {
    found.push(`U+${match[0].codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`);
  }
  return found;
}

/** True when a string looks like Icelandic that has been flattened to ASCII. */
export function isFlattened(value) {
  return FLATTENED_RE.test(value) && !ICELANDIC_RE.test(value);
}
