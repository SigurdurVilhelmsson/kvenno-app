import { describe, expect, it } from 'vitest';

import { challenges } from '../components/Level3';

/**
 * Stig 3, challenges 6 and 7 (decision 73, Siggi's ruling 2026-10-23).
 *
 * Challenge 6 was titled `Edik vs. edikaldehýð`: `edik` is vinegar, not the acid, `vs.` is English,
 * and `edikaldehýð` is in neither the textbook (which says `asetaldehýð`) nor the glossary.
 * Challenge 7 called ice's structure a „kagala" one, a word nobody could find; it is dropped.
 */
const text = (id: number) => JSON.stringify(challenges.find((c) => c.id === id));

describe('Stig 3 challenge names', () => {
  it('challenge 6 is "Ediksýra eða asetaldehýð"', () => {
    expect(challenges.find((c) => c.id === 6)!.title).toBe('Ediksýra eða asetaldehýð');
    expect(text(6)).not.toMatch(/edikaldehýð|Edik vs/i);
    expect(text(6)).toContain('Asetaldehýð (CH₃CHO');
  });

  it('challenge 7 no longer uses the word "kagala"', () => {
    expect(text(7)).not.toContain('kagala');
    expect(text(7)).toContain('sem skapar opna formgerð.');
  });
});
