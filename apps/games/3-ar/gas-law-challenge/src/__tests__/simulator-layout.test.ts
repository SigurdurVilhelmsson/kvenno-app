import { describe, it, expect } from 'vitest';

import {
  CONTAINER_HEIGHT,
  GAUGE_CX,
  GAUGE_CY,
  GAUGE_HEIGHT,
  GAUGE_LABEL_RADIUS,
  GAUGE_WIDTH,
  P_MAX,
  SIMULATOR_GAP,
  gaugePoint,
  pressureToAngle,
  simulatorLayout,
} from '../utils/simulator-layout';

/**
 * The simulator's gas container used to take a fixed pixel width (200–400 px, encoding
 * the volume) inside a row that also holds the 100 px pressure gauge. On a 360 px phone
 * that row is about 280 px wide, so the page scrolled sideways; on desktop a large
 * volume overflowed its column and the canvas was clipped.
 */
describe('simulatorLayout', () => {
  it('keeps the desktop layout unchanged while the volume fits the column', () => {
    // Desktop 1280: the simulator row inside its column is 420 px wide.
    for (const desired of [200, 250, 300, 308]) {
      expect(simulatorLayout(420, desired)).toEqual({
        stacked: false,
        width: desired,
        height: CONTAINER_HEIGHT,
        gaugeScale: 1,
      });
    }
  });

  it('caps a large volume at the space beside the gauge instead of overflowing', () => {
    const layout = simulatorLayout(420, 400);
    expect(layout.stacked).toBe(false);
    expect(layout.width).toBe(420 - SIMULATOR_GAP - GAUGE_WIDTH);
  });

  it('stacks the gauge under the container on a phone and fits the row', () => {
    const layout = simulatorLayout(280, 400);
    expect(layout.stacked).toBe(true);
    expect(layout.width).toBe(280);
    expect(layout.height).toBeLessThanOrEqual(CONTAINER_HEIGHT);
    expect(layout.gaugeScale).toBeGreaterThan(1);
    // A small volume keeps its own, narrower width: the width still encodes V.
    expect(simulatorLayout(280, 220).width).toBe(220);
  });

  it('never lays out wider than the row, at any row width', () => {
    for (let row = 200; row <= 1000; row += 7) {
      for (const desired of [200, 260, 330, 400]) {
        const l = simulatorLayout(row, desired);
        const used = l.stacked
          ? Math.max(l.width, GAUGE_WIDTH * l.gaugeScale)
          : l.width + SIMULATOR_GAP + GAUGE_WIDTH * l.gaugeScale;
        expect(used, `row ${row}, desired ${desired}`).toBeLessThanOrEqual(row);
        expect(l.width).toBeLessThanOrEqual(desired);
      }
    }
  });

  it('uses the unconstrained layout before the row has been measured', () => {
    expect(simulatorLayout(null, 360)).toEqual({
      stacked: false,
      width: 360,
      height: CONTAINER_HEIGHT,
      gaugeScale: 1,
    });
  });
});

/**
 * The gauge's scale labels were placed a quarter turn away from the needle: 0 atm at the
 * top of the dial and 6–10 atm off the bottom of the drawing, while the needle pointed
 * left for 0 atm. They now share one sweep.
 */
describe('pressure gauge geometry', () => {
  function needleTip(p: number, length: number) {
    // The needle is drawn pointing straight up and rotated clockwise by pressureToAngle.
    const a = (pressureToAngle(p) * Math.PI) / 180;
    return { x: GAUGE_CX + length * Math.sin(a), y: GAUGE_CY - length * Math.cos(a) };
  }

  it('places each scale mark on the ray the needle takes at that pressure', () => {
    for (let p = 0; p <= P_MAX; p += 0.5) {
      const tip = needleTip(p, 35);
      const mark = gaugePoint(p, 35);
      expect(mark.x).toBeCloseTo(tip.x, 6);
      expect(mark.y).toBeCloseTo(tip.y, 6);
    }
  });

  it('reads 0 on the left, half scale at the top and full scale on the right', () => {
    expect(gaugePoint(0, 30).x).toBeLessThan(GAUGE_CX);
    expect(gaugePoint(0, 30).y).toBeCloseTo(GAUGE_CY, 6);
    expect(gaugePoint(P_MAX / 2, 30).x).toBeCloseTo(GAUGE_CX, 6);
    expect(gaugePoint(P_MAX / 2, 30).y).toBeLessThan(GAUGE_CY);
    expect(gaugePoint(P_MAX, 30).x).toBeGreaterThan(GAUGE_CX);
  });

  it('keeps every scale label inside the drawing', () => {
    for (const p of [0, 2, 4, 6, 8, 10]) {
      const { x, y } = gaugePoint(p, GAUGE_LABEL_RADIUS);
      expect(x).toBeGreaterThan(5);
      expect(x).toBeLessThan(GAUGE_WIDTH - 5);
      expect(y).toBeGreaterThan(5);
      expect(y).toBeLessThan(GAUGE_HEIGHT - 5);
    }
  });
});
