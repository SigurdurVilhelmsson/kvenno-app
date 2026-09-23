/**
 * Label placement for InteractiveGraph.
 *
 * Every text label on the graph (region, reference-line and marker labels) is placed in one pass
 * after all the lines and points are drawn: each label has a list of candidate spots, most
 * preferred first, and takes the first one that stays inside its bounds and clear of every label
 * and marker already placed. Before this, each label was drawn at one fixed spot as its element
 * was drawn, so on a phone-width titration curve "Þitt val" printed over "Stuðpúðasvæði", and
 * grid lines and the curve were drawn straight through labels drawn earlier.
 */

export interface LabelBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Where a label's text starts (left edge) and the baseline it sits on. */
export interface LabelSpot {
  x: number;
  baseline: number;
}

/** The box a line of text occupies, from its font size in px (ascent ≈ 0.8, descent ≈ 0.25 em). */
export function textBox(spot: LabelSpot, width: number, fontPx: number): LabelBox {
  return {
    left: spot.x,
    top: spot.baseline - fontPx * 0.8,
    right: spot.x + width,
    bottom: spot.baseline + fontPx * 0.25,
  };
}

function overlapArea(a: LabelBox, b: LabelBox): number {
  const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return w > 0 && h > 0 ? w * h : 0;
}

function inside(box: LabelBox, bounds: LabelBox): boolean {
  return (
    box.left >= bounds.left &&
    box.top >= bounds.top &&
    box.right <= bounds.right &&
    box.bottom <= bounds.bottom
  );
}

/**
 * The first candidate that fits `bounds` and overlaps nothing in `occupied`. If none is clear,
 * the in-bounds candidate that overlaps least; if none is even in bounds, the first candidate.
 */
export function chooseLabelSpot(
  candidates: LabelSpot[],
  width: number,
  fontPx: number,
  occupied: LabelBox[],
  bounds: LabelBox
): LabelSpot {
  let best: { spot: LabelSpot; overlap: number } | null = null;
  for (const spot of candidates) {
    const box = textBox(spot, width, fontPx);
    if (!inside(box, bounds)) continue;
    const overlap = occupied.reduce((sum, o) => sum + overlapArea(box, o), 0);
    if (overlap === 0) return spot;
    if (!best || overlap < best.overlap) best = { spot, overlap };
  }
  return best?.spot ?? candidates[0];
}

function parseColor(color: string): [number, number, number] | null {
  const hex = color.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join('') : hex[1];
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
  }
  const rgb = color.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  return null;
}

/** WCAG relative luminance of an sRGB colour. */
export function relativeLuminance([r, g, b]: [number, number, number]): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Contrast of a colour against white (the halo every label is drawn on). */
export function contrastOnWhite(color: string): number {
  const rgb = parseColor(color);
  if (!rgb) return 21;
  return 1.05 / (relativeLuminance(rgb) + 0.05);
}

/**
 * The colour to write a label in: its element's own colour, darkened only as far as it takes to
 * read at `minContrast` against white. Labels take the colour of what they name — a green marker,
 * an amber pKa line — and at 11 px those mid-tones are too pale to read (green-500 on white is
 * 2.3:1, over a green region less). The hue stays, so the label still matches its element.
 * Any alpha is dropped: a region's translucent fill colour becomes an opaque label.
 */
export function readableInk(color: string, minContrast = 4.5): string {
  const rgb = parseColor(color);
  if (!rgb) return color;
  let [r, g, b] = rgb;
  // A hair over the target, so rounding to whole channel values cannot land just under it.
  const target = minContrast + 0.05;
  for (let i = 0; i < 40 && 1.05 / (relativeLuminance([r, g, b]) + 0.05) < target; i++) {
    r *= 0.92;
    g *= 0.92;
    b *= 0.92;
  }
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}
