/**
 * Where to put the small text tags that sit beside an atom (δ+ / δ−), so they stay legible:
 * clear of the atom's own circle, of every other atom, of the bonds and of each other, and
 * inside the drawing.
 *
 * The tag used to be drawn at a fixed spot on the atom's upper-right diagonal, 0.8 radii out —
 * which put its centre inside the circle's bounding box, so the text overlapped the atom, and on
 * water's oxygen laid it straight across an O–H bond.
 */

import type { Position2D } from '@shared/types';

export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface Circle {
  x: number;
  y: number;
  r: number;
}

export interface Segment {
  a: Position2D;
  b: Position2D;
  /** Half the drawn stroke, plus air: how far from the centre line a tag must stay. */
  clearance: number;
}

export interface TagObstacles {
  circles: Circle[];
  segments: Segment[];
  boxes: Box[];
}

/**
 * Directions tried, in SVG degrees (y points down). Upper right first, where the tag has always
 * gone, so a molecule with room there draws as it did.
 */
const TAG_DIRECTIONS = [-45, -135, 45, 135, -90, 0, 180, 90];

export function boxAt(center: Position2D, halfWidth: number, halfHeight: number): Box {
  return {
    left: center.x - halfWidth,
    top: center.y - halfHeight,
    right: center.x + halfWidth,
    bottom: center.y + halfHeight,
  };
}

/** Distance from a point to the nearest point of a box (0 inside it). */
export function distanceToBox(box: Box, x: number, y: number): number {
  const dx = Math.max(box.left - x, 0, x - box.right);
  const dy = Math.max(box.top - y, 0, y - box.bottom);
  return Math.hypot(dx, dy);
}

export function boxesOverlap(a: Box, b: Box): boolean {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
}

function inflate(box: Box, by: number): Box {
  return { left: box.left - by, top: box.top - by, right: box.right + by, bottom: box.bottom + by };
}

/** Whether a line segment passes through a box (Liang–Barsky clipping). */
export function segmentCrossesBox(a: Position2D, b: Position2D, box: Box): boolean {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let t0 = 0;
  let t1 = 1;
  const edges: Array<[number, number]> = [
    [-dx, a.x - box.left],
    [dx, box.right - a.x],
    [-dy, a.y - box.top],
    [dy, box.bottom - a.y],
  ];
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q < 0) return false;
      continue;
    }
    const t = q / p;
    if (p < 0) {
      if (t > t1) return false;
      if (t > t0) t0 = t;
    } else {
      if (t < t0) return false;
      if (t < t1) t1 = t;
    }
  }
  return t0 <= t1;
}

/**
 * Centre for a tag of the given half-size beside `atom`. Tries each direction, pushed out just
 * far enough to clear the atom's circle, and keeps the first spot that meets nothing; if every
 * spot meets something, the one that meets least — being cut off by the edge of the drawing
 * counts most, then covering an atom, then crossing a line.
 */
export function placeAtomTag(
  atom: Circle,
  halfWidth: number,
  halfHeight: number,
  obstacles: TagObstacles,
  drawing: { width: number; height: number },
  gap = 2
): Position2D {
  let best: { center: Position2D; cost: number } | null = null;

  for (const deg of TAG_DIRECTIONS) {
    const ux = Math.cos((deg * Math.PI) / 180);
    const uy = Math.sin((deg * Math.PI) / 180);
    let d = atom.r + gap;
    const limit = atom.r + gap + halfWidth + halfHeight;
    let center = { x: atom.x + ux * d, y: atom.y + uy * d };
    while (
      d < limit &&
      distanceToBox(boxAt(center, halfWidth, halfHeight), atom.x, atom.y) < atom.r + gap
    ) {
      d += 0.5;
      center = { x: atom.x + ux * d, y: atom.y + uy * d };
    }
    const box = boxAt(center, halfWidth, halfHeight);

    let cost = 0;
    if (box.left < 0 || box.top < 0 || box.right > drawing.width || box.bottom > drawing.height) {
      cost += 100;
    }
    for (const c of obstacles.circles) {
      if (distanceToBox(box, c.x, c.y) < c.r + 1) cost += 10;
    }
    for (const other of obstacles.boxes) {
      if (boxesOverlap(box, other)) cost += 10;
    }
    for (const s of obstacles.segments) {
      if (segmentCrossesBox(s.a, s.b, inflate(box, s.clearance))) cost += 1;
    }

    if (cost === 0) return center;
    if (!best || cost < best.cost) best = { center, cost };
  }
  return best!.center;
}
