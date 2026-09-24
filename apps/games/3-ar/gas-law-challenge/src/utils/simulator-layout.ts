/**
 * Sizing and gauge geometry for `GasLawSimulator`, kept pure so it can be tested.
 *
 * The gas container's width encodes the volume (200..400 px), which used to be set as a
 * fixed pixel width. On a phone that box alone is wider than the screen, so the width is
 * now capped to the space the simulator's row actually has, and the pressure gauge moves
 * under the container when the row is too narrow to hold both side by side.
 */

/** Height of the gas container when the gauge sits beside it (the desktop layout). */
export const CONTAINER_HEIGHT = 240;
/** Space between the container and the gauge, in either direction (Tailwind `gap-3`). */
export const SIMULATOR_GAP = 12;
/** The gauge's own drawing size at scale 1 (its SVG viewBox). */
export const GAUGE_WIDTH = 100;
export const GAUGE_HEIGHT = 65;
/** Scale of the gauge on phones, so its scale labels stay readable. */
export const GAUGE_LARGE_SCALE = 1.6;
/** A row narrower than this stacks the gauge under the container. */
export const SIDE_BY_SIDE_MIN_ROW = 360;
/** Largest container width `volumeToWidth` produces. */
export const MAX_CONTAINER_WIDTH = 400;

export interface SimulatorLayout {
  /** Gauge under the container rather than beside it. */
  stacked: boolean;
  /** Outer size of the gas container box, border included. */
  width: number;
  height: number;
  /** Drawing scale of the pressure gauge. */
  gaugeScale: number;
}

/**
 * Lay the simulator out in a row `rowWidth` px wide. `desiredWidth` is the width that
 * encodes the volume. `null` (not yet measured) returns the unconstrained desktop layout.
 */
export function simulatorLayout(rowWidth: number | null, desiredWidth: number): SimulatorLayout {
  if (rowWidth === null || rowWidth <= 0) {
    return { stacked: false, width: desiredWidth, height: CONTAINER_HEIGHT, gaugeScale: 1 };
  }
  const stacked = rowWidth < SIDE_BY_SIDE_MIN_ROW;
  // A wide row (a phone on its side) has room for the larger gauge beside the full container.
  const roomForLargeGauge =
    rowWidth >= MAX_CONTAINER_WIDTH + SIMULATOR_GAP + GAUGE_WIDTH * GAUGE_LARGE_SCALE;
  const gaugeScale = stacked || roomForLargeGauge ? GAUGE_LARGE_SCALE : 1;
  const available = stacked ? rowWidth : rowWidth - SIMULATOR_GAP - GAUGE_WIDTH * gaugeScale;
  return {
    stacked,
    width: Math.max(0, Math.min(desiredWidth, Math.floor(available))),
    height: stacked ? Math.min(CONTAINER_HEIGHT, Math.round(rowWidth * 0.75)) : CONTAINER_HEIGHT,
    gaugeScale,
  };
}

// ── Pressure gauge ─────────────────────────────────────────────────────────

/** Full-scale pressure on the gauge, in atm. */
export const P_MAX = 10;
/** Pivot of the needle, in the gauge's viewBox. */
export const GAUGE_CX = 50;
export const GAUGE_CY = 55;
/** Radius of the dial arc, and of the scale labels just inside it. */
export const GAUGE_RADIUS = 40;
export const GAUGE_LABEL_RADIUS = 27;

function clampPressure(p: number): number {
  return Math.min(Math.max(p, 0), P_MAX);
}

/**
 * CSS rotation of the needle, which is drawn pointing straight up: 0 atm points left
 * (-90deg), P_MAX points right (+90deg).
 */
export function pressureToAngle(p: number): number {
  return -90 + (clampPressure(p) / P_MAX) * 180;
}

/**
 * Point on the gauge at `radius` from the pivot for pressure `p`, on the same sweep the
 * needle follows: left for 0 atm, straight up for half scale, right for full scale.
 */
export function gaugePoint(p: number, radius: number): { x: number; y: number } {
  const theta = ((180 + (clampPressure(p) / P_MAX) * 180) * Math.PI) / 180;
  return { x: GAUGE_CX + radius * Math.cos(theta), y: GAUGE_CY + radius * Math.sin(theta) };
}
