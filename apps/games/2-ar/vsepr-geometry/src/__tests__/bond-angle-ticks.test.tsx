// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { BondAngleMeasurement } from '../components/BondAngleMeasurement';

/**
 * The bond-angle diagram draws the two bonds at ±θ/2 either side of straight up, and its
 * scale used to sit at a and be labelled a — so the right-hand bond of BF₃, 120° from the
 * left one, pointed at the tick labelled "60°" (docs/REVIEW-QUEUE.md D1). The scale now
 * puts the tick for a at ±a/2, so a bond lies on the label of the angle it makes.
 */

afterEach(cleanup);

/** Direction from the centre, in degrees clockwise from straight up. */
const bearing = (cx: number, cy: number, x: number, y: number) =>
  (Math.atan2(x - cx, cy - y) * 180) / Math.PI;

function diagram(geometryId: string) {
  const { container } = render(<BondAngleMeasurement geometryId={geometryId} />);
  const svg = container.querySelector('svg[aria-label^="Tengihornarit"]') as SVGSVGElement;
  const bonds = [...svg.querySelectorAll('line[stroke="#60a5fa"][stroke-width="5"]')];
  const right = bonds[bonds.length - 1];
  const [cx, cy, x, y] = ['x1', 'y1', 'x2', 'y2'].map((a) => Number(right.getAttribute(a)));
  const label = (text: string) => {
    const t = [...svg.querySelectorAll('text')].find((n) => n.textContent === text)!;
    expect(t, `a "${text}" label`).toBeTruthy();
    // The label's y is nudged 4 down to centre the glyphs on the tick.
    return bearing(cx, cy, Number(t.getAttribute('x')), Number(t.getAttribute('y')) - 4);
  };
  return { bond: bearing(cx, cy, x, y), label };
}

describe('the bond-angle scale', () => {
  it.each([
    ['trigonal-planar', '120°'],
    ['linear', '180°'],
  ])('puts the bond of %s on its own angle, %s', (id, text) => {
    const { bond, label } = diagram(id);
    expect(label(text)).toBeCloseTo(bond, 0);
  });

  it('labels the full angle, not the half, on every labelled tick', () => {
    const { label } = diagram('tetrahedral');
    for (const a of [60, 120, 180]) expect(label(`${a}°`)).toBeCloseTo(a / 2, 0);
  });
});
