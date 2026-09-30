/**
 * One geometry for every Lewis structure the game draws.
 *
 * The game used to draw a molecule five ways: coloured balls on the Stig 2
 * board (H–O–H standing on end), the shared ball-and-stick renderer in CPK
 * colours after a correct drawing, a walkthrough with no lone pairs at all, a
 * single atom with its bonds stacked on one side in Stig 3, and resonance forms
 * as monospace text. Ruled 2026-09-30 (docs/REVIEW-QUEUE.md C6): one way, the
 * textbook's — element symbols, bond lines, electron dots in pairs and circled
 * formal charges. Geometry is VSEPR's job, the next game in the chain, so the
 * layout here is the book's flat 2D convention and claims no shape.
 *
 * Everything that draws a structure takes its coordinates from `lewisGeometry`,
 * so the board a student draws on and the structure shown afterwards cannot
 * disagree about where an atom or a pair sits.
 */

import { centralLonePairAngles } from './lonePairs';

export type LewisBond = 'none' | 'single' | 'double' | 'triple';

export interface LewisAtom {
  symbol: string;
  lonePairs: number;
  /** A radical's odd electron, drawn as a single dot. */
  unpaired?: boolean;
  formalCharge?: number;
}

export interface LewisOuterAtom extends LewisAtom {
  bond: LewisBond;
}

export interface LewisDrawing {
  central: LewisAtom;
  outer: LewisOuterAtom[];
  /** An ion's overall charge, drawn as brackets with the charge outside. */
  ionCharge?: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Dot extends Point {
  /** Which atom the dot belongs to: -1 for the central atom, else the outer index. */
  atom: number;
  /** A radical's lone odd electron rather than half of a pair. */
  odd?: boolean;
}

export interface LewisGeometry {
  central: Point;
  outer: (Point & { angle: number })[];
  bonds: { from: Point; to: Point; angle: number; type: LewisBond }[];
  /** Every electron dot not in a bond, two per lone pair and one per odd electron. */
  dots: Dot[];
  /** Where each atom's circled formal charge sits: -1 is the central atom. */
  chargeAt: (atom: number) => Point;
  /** The box everything drawn fits in, dots and charges included. */
  box: { minX: number; minY: number; maxX: number; maxY: number };
}

/** Sizes in drawing units. The Stig 2 board is 350 × 280 with the central atom at its middle. */
export const LEWIS_SIZES = {
  /** Centre of the central atom to the centre of an outer one. */
  orbit: 85,
  /** Where a bond line stops short of an atom's symbol. */
  trim: 16,
  /** Centre of an atom to the middle of one of its lone pairs. */
  pairOffset: 24,
  /** Half the distance between the two dots of a pair. */
  dotGap: 4,
  dotRadius: 2.5,
  /** Distance between the lines of a double or triple bond. */
  bondGap: 5,
  symbolSize: 26,
} as const;

/** The book's pen colours: ink for symbols and bonds, one colour for every lone pair. */
export const LEWIS_COLORS = {
  ink: '#1f2937',
  bond: '#374151',
  pair: '#0f766e',
  placeholder: '#d1d5db',
  error: '#dc2626',
} as const;

const DEG = Math.PI / 180;

/**
 * Where the outer atoms go, as angles from the central atom (0 = right,
 * 90° = down). The flat textbook arrangement: H–O–H across, NH₃ and BF₃ with
 * the third atom below, CH₄ as a cross. Five and six are spaced evenly.
 */
export function outerAngles(n: number): number[] {
  switch (n) {
    case 0:
      return [];
    case 1:
      return [0];
    case 2:
      return [180 * DEG, 0];
    case 3:
      return [180 * DEG, 0, 90 * DEG];
    case 4:
      return [-90 * DEG, 0, 90 * DEG, 180 * DEG];
    default:
      return Array.from({ length: n }, (_, i) => (-90 + (360 / n) * i) * DEG);
  }
}

/**
 * Where an outer atom's pairs go: on its far side, away from the bond. One pair
 * sits straight out; two sit above and below the bond's line; three take the
 * three free sides, as the book draws a halogen.
 */
export function outerPairAngles(bondAngle: number, count: number): number[] {
  if (count <= 0) return [];
  const away = bondAngle; // pointing out from the central atom, through the outer one
  if (count === 1) return [away];
  if (count === 2) return [away - 90 * DEG, away + 90 * DEG];
  if (count === 3) return [away - 90 * DEG, away, away + 90 * DEG];
  return Array.from({ length: count }, (_, i) => away - 135 * DEG + (270 * DEG * i) / (count - 1));
}

function pairDots(at: Point, angle: number, atom: number): Dot[] {
  const { pairOffset, dotGap } = LEWIS_SIZES;
  const cx = at.x + Math.cos(angle) * pairOffset;
  const cy = at.y + Math.sin(angle) * pairOffset;
  const gx = -Math.sin(angle) * dotGap;
  const gy = Math.cos(angle) * dotGap;
  return [
    { x: cx + gx, y: cy + gy, atom },
    { x: cx - gx, y: cy - gy, atom },
  ];
}

export function lewisGeometry(
  drawing: LewisDrawing,
  centre: Point = { x: 0, y: 0 }
): LewisGeometry {
  const { orbit, trim, pairOffset, symbolSize } = LEWIS_SIZES;
  const angles = outerAngles(drawing.outer.length);
  const outer = angles.map((angle) => ({
    x: centre.x + Math.cos(angle) * orbit,
    y: centre.y + Math.sin(angle) * orbit,
    angle,
  }));

  const bonds = outer.map((p, i) => ({
    from: {
      x: centre.x + Math.cos(p.angle) * trim,
      y: centre.y + Math.sin(p.angle) * trim,
    },
    to: { x: p.x - Math.cos(p.angle) * trim, y: p.y - Math.sin(p.angle) * trim },
    angle: p.angle,
    type: drawing.outer[i].bond,
  }));

  const dots: Dot[] = [];
  // The central atom's pairs go in the gaps between its bonds, and its odd
  // electron, when it has one, takes the next free slot.
  const odd = drawing.central.unpaired ? 1 : 0;
  const slots = centralLonePairAngles(angles, drawing.central.lonePairs + odd);
  for (let i = 0; i < drawing.central.lonePairs; i++) dots.push(...pairDots(centre, slots[i], -1));
  if (odd) {
    const a = slots[drawing.central.lonePairs];
    dots.push({
      x: centre.x + Math.cos(a) * pairOffset,
      y: centre.y + Math.sin(a) * pairOffset,
      atom: -1,
      odd: true,
    });
  }
  drawing.outer.forEach((atom, i) => {
    for (const a of outerPairAngles(outer[i].angle, atom.lonePairs)) {
      dots.push(...pairDots(outer[i], a, i));
    }
  });

  // A formal charge sits above and to the right of its symbol, clear of the
  // pairs, which never use that diagonal on an outer atom and rarely on the centre.
  const chargeAt = (atom: number): Point => {
    const at = atom === -1 ? centre : outer[atom];
    return { x: at.x + 20, y: at.y - 22 };
  };

  const half = symbolSize / 2 + 4;
  const xs = [centre.x - half, centre.x + half, ...outer.flatMap((p) => [p.x - half, p.x + half])];
  const ys = [centre.y - half, centre.y + half, ...outer.flatMap((p) => [p.y - half, p.y + half])];
  for (const d of dots) {
    xs.push(d.x - 6, d.x + 6);
    ys.push(d.y - 6, d.y + 6);
  }
  const charged = [
    ...(drawing.central.formalCharge ? [-1] : []),
    ...drawing.outer.flatMap((a, i) => (a.formalCharge ? [i] : [])),
  ];
  for (const i of charged) {
    const c = chargeAt(i);
    xs.push(c.x - 10, c.x + 10);
    ys.push(c.y - 10, c.y + 10);
  }

  return {
    central: centre,
    outer,
    bonds,
    dots,
    chargeAt,
    box: {
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      maxX: Math.max(...xs),
      maxY: Math.max(...ys),
    },
  };
}

/** "+", "−", "2−": how a charge is written beside a symbol or a bracket. */
export function chargeText(charge: number): string {
  if (charge === 0) return '';
  const size = Math.abs(charge) === 1 ? '' : String(Math.abs(charge));
  return `${size}${charge > 0 ? '+' : '−'}`;
}
