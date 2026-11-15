import { describe, expect, it } from 'vitest';

import { level2Problems } from '../data/problems';
import { ROUND_ITEMS } from '../data/sigfig-items';

/**
 * Year-1 audit, Phase 0 item 3 (2026-11-15).
 */

/** Units left after multiplying `start` by each factor `a U1 / b U2`. */
function unitAfter(start: string, path: string[]): string {
  let unit = start;
  for (const factor of path) {
    const [num, den] = factor.split(' / ').map((p) => p.trim().split(' ').slice(1).join(' '));
    expect(unit.split('/')[0] === den || unit.split('/')[1] === num, `${factor} on ${unit}`).toBe(
      true
    );
    unit =
      unit.split('/')[0] === den
        ? [num, ...unit.split('/').slice(1)].join('/')
        : `${unit.split('/')[0]}/${den}`;
  }
  return unit;
}

describe('Stig 2 problems', () => {
  it.each(level2Problems.map((p) => [p.id, p] as const))(
    '%s: the factors carry the start unit to the target unit',
    (_id, p) => {
      expect(unitAfter(p.startUnit, p.correctPath)).toBe(p.targetUnit);
    }
  );

  it('every advanced problem takes at least two steps', () => {
    for (const p of level2Problems.filter((q) => q.difficulty === 'advanced')) {
      expect(p.correctPath.length, p.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('no prompt asks for a conversion the problem does not pose', () => {
    for (const p of level2Problems) expect(p.context, p.id).not.toMatch(/síðan aftur|öðru gildi/);
  });

  it('calls a mass a mass, not a concentration', () => {
    for (const p of level2Problems) {
      if (p.targetUnit === 'g' || p.targetUnit === 'mg')
        expect(p.context, p.id).not.toMatch(/styrk/);
    }
  });
});

describe('Stig 0 rounding items', () => {
  it('give a calculation, not an instrument, as the reason to round away shown digits', () => {
    // An instrument that shows four figures measures to four (m68690).
    for (const item of ROUND_ITEMS) {
      expect(item.context, item.id).not.toMatch(/nákvæm(ur)? upp á|úr vog sem gefur/);
    }
  });
});
