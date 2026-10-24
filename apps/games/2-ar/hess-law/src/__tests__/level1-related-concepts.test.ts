import { describe, it, expect } from 'vitest';

import { RELATED_CONCEPTS } from '../components/Level1';

/**
 * Stig 1's concept chips carried two words in neither the glossary nor the book:
 * `Hverfanleiki` on challenges 2 and 5 and `Ferlisstuðull` on challenge 6. Challenge 6 is
 * about path-independence, which ordabok.md calls `ástandsfall`; challenge 2 already has
 * `Öfug hvörf`. Decision 78 (2026-10-23): `Ástandsfall` for 6, and the coinage dropped from
 * 2 and 5. The game's icelandic-text.test.ts bans both words in source.
 */
describe('Stig 1 related-concept chips', () => {
  it('names challenge 6 by the glossary term', () => {
    expect(RELATED_CONCEPTS[6]).toEqual(['Orkubraut', 'Ástandsfall', 'Heildar-ΔH']);
  });

  it('drops the coined word from challenges 2 and 5', () => {
    expect(RELATED_CONCEPTS[2]).toEqual(['Öfug hvörf', 'Formerkisbreyting']);
    expect(RELATED_CONCEPTS[5]).toEqual(['Lögmál Hess', 'Orkuvarðveisla']);
  });

  it('carries no chip outside the glossary on any challenge', () => {
    const chips = Object.values(RELATED_CONCEPTS).flat();
    expect(chips).not.toContain('Hverfanleiki');
    expect(chips).not.toContain('Ferlisstuðull');
  });
});
