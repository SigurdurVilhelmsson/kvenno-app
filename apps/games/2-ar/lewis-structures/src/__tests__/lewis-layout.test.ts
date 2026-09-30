import { describe, expect, it } from 'vitest';

import {
  LEWIS_SIZES,
  chargeText,
  lewisGeometry,
  outerAngles,
  type LewisDrawing,
  type Point,
} from '../utils/lewisLayout';

/**
 * The one geometry every Lewis structure in the game is drawn from. Checked as
 * properties over every shape the game can produce — one to six outer atoms,
 * up to four pairs on the centre and three on each outer atom — rather than a
 * few hand-picked molecules, since the Stig 2 board draws whatever the student
 * puts on it.
 */

const segmentDistance = (p: Point, a: Point, b: Point) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
};

function drawingOf(n: number, centralPairs: number, outerPairs: number): LewisDrawing {
  return {
    central: { symbol: 'X', lonePairs: centralPairs },
    outer: Array.from({ length: n }, () => ({
      symbol: 'Y',
      lonePairs: outerPairs,
      bond: 'single',
    })),
  };
}

const shapes = [1, 2, 3, 4, 5, 6].flatMap((n) =>
  [0, 1, 2, 3, 4].flatMap((c) => [0, 1, 2, 3].map((o) => [n, c, o] as const))
);

describe('lewisGeometry', () => {
  it.each(shapes)(
    '%i outer atoms, %i central pairs, %i pairs each: nothing collides',
    (n, c, o) => {
      const g = lewisGeometry(drawingOf(n, c, o));
      const atoms = [g.central, ...g.outer];

      expect(g.dots).toHaveLength(2 * c + 2 * n * o);

      for (const d of g.dots) {
        // No dot on a bond line.
        for (const b of g.bonds) {
          expect(segmentDistance(d, b.from, b.to)).toBeGreaterThanOrEqual(6);
        }
        // No dot on another atom's symbol, and its own atom's at the pair offset.
        atoms.forEach((a, i) => {
          const own = i === d.atom + 1;
          const r = Math.hypot(d.x - a.x, d.y - a.y);
          if (own) expect(r).toBeLessThan(LEWIS_SIZES.pairOffset + LEWIS_SIZES.dotGap + 0.01);
          else expect(r).toBeGreaterThanOrEqual(16);
        });
      }
      // No two dots on each other.
      for (let i = 0; i < g.dots.length; i++) {
        for (let j = i + 1; j < g.dots.length; j++) {
          const r = Math.hypot(g.dots[i].x - g.dots[j].x, g.dots[i].y - g.dots[j].y);
          expect(r).toBeGreaterThanOrEqual(2 * LEWIS_SIZES.dotRadius + 1);
        }
      }
      // No two atoms on each other.
      for (let i = 0; i < atoms.length; i++) {
        for (let j = i + 1; j < atoms.length; j++) {
          expect(Math.hypot(atoms[i].x - atoms[j].x, atoms[i].y - atoms[j].y)).toBeGreaterThan(40);
        }
      }
      // The box holds everything drawn.
      for (const p of [...atoms, ...g.dots]) {
        expect(p.x).toBeGreaterThan(g.box.minX);
        expect(p.x).toBeLessThan(g.box.maxX);
        expect(p.y).toBeGreaterThan(g.box.minY);
        expect(p.y).toBeLessThan(g.box.maxY);
      }
    }
  );

  it('draws the book’s flat arrangements, and claims no shape', () => {
    const deg = (n: number) => outerAngles(n).map((a) => Math.round((a * 180) / Math.PI));
    expect(deg(2)).toEqual([180, 0]); // H–O–H across, not bent
    expect(deg(3)).toEqual([180, 0, 90]);
    expect(deg(4)).toEqual([-90, 0, 90, 180]);
  });

  it('draws a radical’s odd electron as one dot on the central atom', () => {
    const g = lewisGeometry({
      central: { symbol: 'N', lonePairs: 1, unpaired: true },
      outer: [{ symbol: 'O', lonePairs: 2, bond: 'double' }],
    });
    expect(g.dots.filter((d) => d.odd)).toHaveLength(1);
    expect(g.dots.filter((d) => d.atom === -1)).toHaveLength(3);
  });
});

describe('chargeText', () => {
  it('writes charges as the book does', () => {
    expect(chargeText(1)).toBe('+');
    expect(chargeText(-1)).toBe('−');
    expect(chargeText(-2)).toBe('2−');
    expect(chargeText(0)).toBe('');
  });
});
