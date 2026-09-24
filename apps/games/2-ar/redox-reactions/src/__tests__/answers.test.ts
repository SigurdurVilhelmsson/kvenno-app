import { describe, expect, it } from 'vitest';

import { problems } from '../data/half-reactions';
import { matchesSpecies, normalizeSpecies, parseWholeNumber } from '../utils/answers';

describe('matchesSpecies', () => {
  it('reads superscripts, subscripts, carets, a typographic minus and stray spaces', () => {
    expect(normalizeSpecies(' Cu²⁺ ')).toBe('cu2+');
    expect(normalizeSpecies('Cu^2+')).toBe('cu2+');
    expect(normalizeSpecies('Br−')).toBe('br-');
    expect(normalizeSpecies('O₂')).toBe('o2');
  });

  it('accepts every Stig 3 species in all three forms a student might write', () => {
    for (const p of problems) {
      for (const species of [p.oxidationHalf.species, p.reductionHalf.species]) {
        const ascii = normalizeSpecies(species);
        const symbol = ascii.replace(/[0-9+-]/g, '');
        for (const answer of [species, ascii, symbol, symbol.toUpperCase()]) {
          expect(matchesSpecies(answer, species), `${answer} for ${species}`).toBe(true);
        }
      }
    }
  });

  it('rejects an empty answer, the other species, and a different charge', () => {
    expect(matchesSpecies('', 'Zn')).toBe(false);
    expect(matchesSpecies('   ', 'Zn')).toBe(false);
    expect(matchesSpecies('Cu', 'Zn')).toBe(false);
    expect(matchesSpecies('Cu+', 'Cu²⁺')).toBe(false);
    expect(matchesSpecies('Cu3+', 'Cu²⁺')).toBe(false);
    expect(matchesSpecies('Sn4+', 'Sn²⁺')).toBe(false);
  });
});

describe('parseWholeNumber', () => {
  it('reads whole numbers, signed or not', () => {
    expect(parseWholeNumber('2')).toBe(2);
    expect(parseWholeNumber(' 3 ')).toBe(3);
    expect(parseWholeNumber('-2')).toBe(-2);
    expect(parseWholeNumber('+7')).toBe(7);
  });

  it('still reads a whole number written with a zero decimal part, as parseInt did', () => {
    // A number field hands over "2.0" or "-1.0" as typed; that is the count, not a near miss.
    expect(parseWholeNumber('2.0')).toBe(2);
    expect(parseWholeNumber('-1.0')).toBe(-1);
    expect(parseWholeNumber('3,00')).toBe(3);
  });

  it('refuses anything that is not a whole number', () => {
    for (const text of ['', '2.5', '2,5', '2.05', '2.50', '2abc', 'e', '1e1', '.', '.0']) {
      expect(parseWholeNumber(text), text).toBeNaN();
    }
  });

  it('leaves every Stig 3 count unmatched by 0, double, half and NaN', () => {
    for (const p of problems) {
      for (const answer of [
        p.oxidationHalf.electrons,
        p.reductionHalf.electrons,
        p.multiplierOx,
        p.multiplierRed,
      ]) {
        for (const wrong of ['0', String(answer * 2), String(answer / 2), 'NaN']) {
          if (wrong === String(answer)) continue; // half of 1 is not a whole number anyway
          expect(parseWholeNumber(wrong) === answer, `${wrong} for ${answer}`).toBe(false);
        }
      }
    }
  });
});
