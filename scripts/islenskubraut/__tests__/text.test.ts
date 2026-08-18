import { describe, expect, it } from 'vitest';

import { findInvisible, isFlattened, normalizeText } from '../text.mjs';

describe('normalizeText', () => {
  it('composes decomposed Icelandic to NFC', () => {
    // "a" + U+0301 combining acute is what Word and macOS can produce for the
    // Icelandic letter with an accent. Built from an escape (not typed as the
    // precomposed character) so an editor or commit hook cannot silently
    // re-normalise the test's premise away.
    const decomposed = 'a\u0301ferð';
    const composed = 'áferð';
    expect(decomposed).not.toBe(composed);
    expect(normalizeText(decomposed)).toBe(composed);
  });

  it('strips a soft hyphen wedged mid-word', () => {
    // U+00AD soft hyphen, built from an escape -- invisible in source otherwise.
    expect(normalizeText('Orda\u00ADfordi')).toBe('Ordafordi');
  });

  it('replaces a non-breaking space with a normal space', () => {
    // U+00A0 non-breaking space, built from an escape -- indistinguishable from
    // a normal space in source otherwise.
    expect(normalizeText('til að\u00A0vinna')).toBe('til að vinna');
  });

  it('collapses runs of whitespace and trims', () => {
    expect(normalizeText('  til   að  vinna ')).toBe('til að vinna');
  });

  it('leaves clean Icelandic untouched', () => {
    expect(normalizeText('húsdýr (búfénaður)')).toBe('húsdýr (búfénaður)');
  });
});

describe('findInvisible', () => {
  it('names the invisible codepoints it found', () => {
    // U+00AD soft hyphen, and U+200B zero-width space + U+2060 word joiner,
    // built from escapes so they are reviewable and cannot be normalised away.
    expect(findInvisible('Orda\u00ADfordi')).toEqual(['U+00AD']);
    expect(findInvisible('a\u200Bb\u2060c')).toEqual(['U+200B', 'U+2060']);
  });

  it('returns an empty array for clean text', () => {
    expect(findInvisible('Orðaforði')).toEqual([]);
  });
});

describe('isFlattened', () => {
  it('flags text that lost its Icelandic characters', () => {
    expect(isFlattened('husdyr')).toBe(true);
    expect(isFlattened('Ordafordi')).toBe(true);
    expect(isFlattened('gaeludyr')).toBe(true);
  });

  it('does not flag the correct spelling', () => {
    expect(isFlattened('húsdýr')).toBe(false);
    expect(isFlattened('Orðaforði')).toBe(false);
  });

  it('does not flag ordinary Icelandic-free text', () => {
    expect(isFlattened('A1')).toBe(false);
    expect(isFlattened('#7B2CBF')).toBe(false);
  });
});
