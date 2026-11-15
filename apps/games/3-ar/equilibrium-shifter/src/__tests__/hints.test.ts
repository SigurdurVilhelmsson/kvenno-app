import { describe, expect, it } from 'vitest';

import { equilibria } from '../data/equilibria';
import { methodHint } from '../utils/hints';

/**
 * The «Aðferð» tier says how to decide and never which way it shifts. It used to
 * end every stress with the answer, while only the solution tier counted as
 * giving it away.
 */
const NAMES_A_DIRECTION =
  /til (hægri|vinstri)|engin hliðrun|breytir ekki|→|←|hliðrun (til|í)|jafnt →/i;

describe('the method hint', () => {
  it('names no direction, for every stress the game offers', () => {
    let checked = 0;
    for (const eq of equilibria) {
      for (const stress of eq.possibleStresses) {
        const hint = methodHint(eq, stress);
        expect(hint, `${eq.id} ${stress.type}`).not.toBe('');
        expect(hint, `${eq.id} ${stress.type}: ${hint}`).not.toMatch(NAMES_A_DIRECTION);
        checked += 1;
      }
    }
    expect(checked).toBeGreaterThan(80);
  });

  it('still gives the student the counts they need for a pressure stress', () => {
    const haber = equilibria.find((e) => e.id === 11)!;
    const hint = methodHint(haber, { type: 'increase-pressure', target: null });
    expect(hint).toContain('hvarfefni 4');
    expect(hint).toContain('myndefni 2');
  });
});
