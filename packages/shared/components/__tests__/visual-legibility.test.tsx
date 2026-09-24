import { render, cleanup, screen } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';

import type { Molecule } from '@shared/types';

import {
  AnimatedMolecule,
  MIN_LABEL_PX,
  minTextSizeFor,
} from '../AnimatedMolecule/AnimatedMolecule';
import { boxAt, distanceToBox, segmentCrossesBox } from '../AnimatedMolecule/moleculeLabels';
import { InteractiveGraph } from '../InteractiveGraph/InteractiveGraph';
import {
  chooseLabelSpot,
  contrastOnWhite,
  readableInk,
  textBox,
  type LabelBox,
} from '../InteractiveGraph/labelLayout';
import { MoleculeViewer3DLazy } from '../MoleculeViewer3D';
import { ParticleSimulation } from '../ParticleSimulation';

// The 3D chunks are never needed here: the placeholder is what is under test.
vi.mock('three', () => ({}));
vi.mock('@react-three/fiber', () => ({}));
vi.mock('../MoleculeViewer3D/MoleculeViewer3D', () => ({ MoleculeViewer3D: () => null }));

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------------------------
// AnimatedMolecule
// ---------------------------------------------------------------------------------------------

/**
 * What organic-nomenclature's `organicToMolecule` produces: main chain along y = 0.3 in the −1…1
 * explicit-position space, branches rising 0.35 per carbon above their anchor.
 */
function organic(carbons: number, branchAt?: number): Molecule {
  const x = (i: number) => (carbons === 1 ? 0 : -0.7 + (i * 1.4) / (carbons - 1));
  const atoms: Molecule['atoms'] = Array.from({ length: carbons }, (_, i) => ({
    id: `c-${i}`,
    symbol: 'C',
    label: `${i + 1}`,
    position: { x: x(i), y: 0.3 },
  }));
  const bonds: Molecule['bonds'] = Array.from({ length: carbons - 1 }, (_, i) => ({
    from: `c-${i}`,
    to: `c-${i + 1}`,
    type: 'single' as const,
  }));
  if (branchAt) {
    atoms.push({ id: 'b0-0', symbol: 'C', position: { x: x(branchAt - 1), y: -0.05 } });
    bonds.push({ from: `c-${branchAt - 1}`, to: 'b0-0', type: 'single' });
  }
  return { id: 'm', formula: 'C', atoms, bonds };
}

type DrawnAtom = { x: number; y: number; r: number; symbol: string };

function drawnAtoms(container: HTMLElement): DrawnAtom[] {
  return [...container.querySelectorAll('g.molecule-atom')].map((g) => {
    const c = g.querySelector('circle')!;
    return {
      x: Number(c.getAttribute('cx')),
      y: Number(c.getAttribute('cy')),
      r: Number(c.getAttribute('r')),
      symbol: g.querySelector('text')!.textContent ?? '',
    };
  });
}

describe('AnimatedMolecule, organic mode', () => {
  it('draws a branch where the data puts it, not as one more link in the chain', () => {
    // 2-metýlprópan: three in a row, and the fourth carbon above the middle one. The chain
    // layout used to line up all four, so the molecule read as bútan.
    const { container } = render(
      <AnimatedMolecule
        molecule={organic(3, 2)}
        mode="organic"
        size="lg"
        animation="none"
        showAtomLabels
      />
    );
    const [c1, c2, c3, branch] = drawnAtoms(container);
    expect(c1.y).toBeCloseTo(c2.y);
    expect(c3.y).toBeCloseTo(c2.y);
    expect(branch.x).toBeCloseTo(c2.x);
    expect(branch.y).toBeLessThan(c2.y - c2.r * 2);
  });

  it.each([
    ['2-metýlbútan', organic(4, 2)],
    ['3-metýlpentan', organic(5, 3)],
    ['hexan', organic(6)],
  ])('%s: no two atoms overlap, so every bond line shows', (_name, molecule) => {
    const { container } = render(
      <AnimatedMolecule molecule={molecule} mode="organic" size="lg" animation="none" />
    );
    const atoms = drawnAtoms(container);
    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        const d = Math.hypot(atoms[i].x - atoms[j].x, atoms[i].y - atoms[j].y);
        expect(d).toBeGreaterThan(atoms[i].r + atoms[j].r + 4);
      }
    }
    // Every bond line has visible length between its two circles.
    for (const line of container.querySelectorAll('g.molecule-bonds line')) {
      const len = Math.hypot(
        Number(line.getAttribute('x2')) - Number(line.getAttribute('x1')),
        Number(line.getAttribute('y2')) - Number(line.getAttribute('y1'))
      );
      expect(len).toBeGreaterThan(8);
    }
  });

  it('centres an unbranched chain vertically and numbers it above', () => {
    const { container } = render(
      <AnimatedMolecule
        molecule={organic(4)}
        mode="organic"
        size="lg"
        animation="none"
        showAtomLabels
      />
    );
    const atoms = drawnAtoms(container);
    for (const a of atoms) expect(a.y).toBeCloseTo(120);
    const labels = [...container.querySelectorAll('g.molecule-atom text')].filter((t) =>
      /^\d$/.test(t.textContent ?? '')
    );
    expect(labels).toHaveLength(4);
    for (const t of labels) expect(Number(t.getAttribute('y'))).toBeLessThan(120);
  });

  it('numbers a branched chain underneath, where no branch bond runs', () => {
    const { container } = render(
      <AnimatedMolecule
        molecule={organic(4, 2)}
        mode="organic"
        size="lg"
        animation="none"
        showAtomLabels
      />
    );
    const chain = drawnAtoms(container).slice(0, 4);
    const labels = [...container.querySelectorAll('g.molecule-atom text')].filter((t) =>
      /^\d$/.test(t.textContent ?? '')
    );
    expect(labels).toHaveLength(4);
    labels.forEach((t, i) => {
      expect(Number(t.getAttribute('y'))).toBeGreaterThan(chain[i].y + chain[i].r);
    });
  });
});

/** Water as intermolecular-forces' imfToMolecule draws it: O centre, H at 104,5°. */
const WATER: Molecule = {
  id: 'h2o',
  formula: 'H₂O',
  isPolar: true,
  atoms: [
    { id: 'o', symbol: 'O', partialCharge: 'negative', position: { x: 0, y: 0 } },
    { id: 'h1', symbol: 'H', partialCharge: 'positive', position: { x: -0.527, y: -0.408 } },
    { id: 'h2', symbol: 'H', partialCharge: 'positive', position: { x: 0.527, y: -0.408 } },
  ],
  bonds: [
    { from: 'o', to: 'h1', type: 'single', polar: true },
    { from: 'o', to: 'h2', type: 'single', polar: true },
  ],
};

const CHLOROFORM: Molecule = {
  id: 'chcl3',
  formula: 'CHCl₃',
  isPolar: true,
  atoms: [
    { id: 'c', symbol: 'C', partialCharge: 'positive', position: { x: 0, y: 0 } },
    { id: 'h', symbol: 'H', position: { x: 0, y: -0.667 } },
    { id: 'cl1', symbol: 'Cl', partialCharge: 'negative', position: { x: -0.577, y: 0.333 } },
    { id: 'cl2', symbol: 'Cl', partialCharge: 'negative', position: { x: 0, y: 0.667 } },
    { id: 'cl3', symbol: 'Cl', partialCharge: 'negative', position: { x: 0.577, y: 0.333 } },
  ],
  bonds: [
    { from: 'c', to: 'h', type: 'single' },
    { from: 'c', to: 'cl1', type: 'single' },
    { from: 'c', to: 'cl2', type: 'single' },
    { from: 'c', to: 'cl3', type: 'single' },
  ],
};

describe('AnimatedMolecule text', () => {
  it('floors numbering and charge text at a legible size, and grows it back when shrunk', () => {
    expect(minTextSizeFor(0, 180, 12)).toBe(MIN_LABEL_PX); // not yet measured
    expect(minTextSizeFor(180, 180, 12)).toBe(MIN_LABEL_PX);
    expect(minTextSizeFor(150, 180, 12)).toBeCloseTo((MIN_LABEL_PX * 180) / 150);
    // Capped, so a drawing squeezed very narrow does not get labels larger than its atoms.
    expect(minTextSizeFor(60, 180, 12)).toBe(18);
  });

  it.each([
    ['water δ tags (md)', WATER, 'simple', 'md'],
    ['chloroform δ tags (md)', CHLOROFORM, 'simple', 'md'],
  ] as const)('%s render at ≥ 12 px', (_n, molecule, mode, size) => {
    const { container } = render(
      <AnimatedMolecule
        molecule={molecule}
        mode={mode}
        size={size}
        animation="none"
        showPartialCharges
        showDipoleMoment
      />
    );
    const texts = [...container.querySelectorAll('text')];
    expect(texts.some((t) => /δ/.test(t.textContent ?? ''))).toBe(true);
    for (const t of texts) expect(Number(t.getAttribute('font-size'))).toBeGreaterThanOrEqual(12);
  });

  it('does not shrink a back atom’s symbol with its circle (VSEPR depth)', () => {
    const sf6: Molecule = {
      id: 'sf6',
      formula: 'SF₆',
      geometry: 'octahedral',
      atoms: [
        { id: 's', symbol: 'S' },
        ...Array.from({ length: 6 }, (_, i) => ({ id: `f${i}`, symbol: 'F' })),
      ],
      bonds: Array.from({ length: 6 }, (_, i) => ({
        from: 's',
        to: `f${i}`,
        type: 'single' as const,
      })),
    };
    const { container } = render(
      <AnimatedMolecule molecule={sf6} mode="vsepr" size="md" animation="none" />
    );
    const sizes = [...container.querySelectorAll('g.molecule-atom > text')].map((t) =>
      Number(t.getAttribute('font-size'))
    );
    expect(sizes).toHaveLength(7);
    // The back fluorine used to be drawn at 0,8 × 12 = 9,6.
    for (const s of sizes) expect(s).toBeGreaterThanOrEqual(12);
  });

  it('draws formal charges at ≥ 12 px (Lewis)', () => {
    const co: Molecule = {
      id: 'co',
      formula: 'CO',
      atoms: [
        { id: 'c', symbol: 'C', formalCharge: -1, lonePairs: 1 },
        { id: 'o', symbol: 'O', formalCharge: 1, lonePairs: 1 },
      ],
      bonds: [{ from: 'c', to: 'o', type: 'triple' }],
    };
    render(
      <AnimatedMolecule molecule={co} mode="lewis" size="lg" animation="none" showFormalCharges />
    );
    for (const label of ['-1', '+1']) {
      expect(Number(screen.getByText(label).getAttribute('font-size'))).toBeGreaterThanOrEqual(12);
    }
  });

  it.each([
    ['water', WATER],
    ['chloroform', CHLOROFORM],
  ])('%s: no δ tag covers an atom, crosses a bond or leaves the drawing', (_n, molecule) => {
    const { container } = render(
      <AnimatedMolecule
        molecule={molecule}
        mode="simple"
        size="md"
        animation="none"
        showPartialCharges
      />
    );
    const atoms = drawnAtoms(container);
    const tags = [...container.querySelectorAll('g.molecule-atom text')].filter((t) =>
      /δ/.test(t.textContent ?? '')
    );
    expect(tags.length).toBeGreaterThan(1);
    const boxes = tags.map((t) => {
      const size = Number(t.getAttribute('font-size'));
      return boxAt(
        { x: Number(t.getAttribute('x')), y: Number(t.getAttribute('y')) },
        size * 0.62,
        size * 0.5
      );
    });
    for (const box of boxes) {
      expect(box.left).toBeGreaterThanOrEqual(0);
      expect(box.top).toBeGreaterThanOrEqual(0);
      expect(box.right).toBeLessThanOrEqual(180);
      expect(box.bottom).toBeLessThanOrEqual(180);
      for (const a of atoms) expect(distanceToBox(box, a.x, a.y)).toBeGreaterThanOrEqual(a.r);
      for (const bond of molecule.bonds) {
        const from = atoms[molecule.atoms.findIndex((a) => a.id === bond.from)];
        const to = atoms[molecule.atoms.findIndex((a) => a.id === bond.to)];
        expect(segmentCrossesBox(from, to, box)).toBe(false);
      }
    }
  });

  it('draws the dipole arrow under the atoms, so it cannot strike through a symbol', () => {
    const { container } = render(
      <AnimatedMolecule
        molecule={WATER}
        mode="simple"
        size="md"
        animation="none"
        showPartialCharges
        showDipoleMoment
      />
    );
    const dipole = container.querySelector('.molecule-dipole')!;
    const atoms = container.querySelector('.molecule-atoms')!;
    expect(dipole).not.toBeNull();
    expect(dipole.compareDocumentPosition(atoms) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------------------------
// InteractiveGraph
// ---------------------------------------------------------------------------------------------

describe('InteractiveGraph label ink', () => {
  it('darkens a pale label colour to readable contrast and keeps its hue', () => {
    expect(contrastOnWhite('#22c55e')).toBeLessThan(3); // green-500: 2,3:1
    const ink = readableInk('#22c55e');
    expect(contrastOnWhite(ink)).toBeGreaterThanOrEqual(4.5);
    const [r, g, b] = ink.match(/\d+/g)!.map(Number);
    expect(g).toBeGreaterThan(r);
    expect(g).toBeGreaterThan(b);
    // A region's translucent fill becomes an opaque, readable label.
    expect(contrastOnWhite(readableInk('rgba(251, 191, 36, 0.15)'))).toBeGreaterThanOrEqual(4.5);
  });

  it('leaves an already dark colour alone', () => {
    expect(readableInk('#374151')).toBe('rgb(55, 65, 81)');
  });
});

describe('chooseLabelSpot', () => {
  const bounds: LabelBox = { left: 0, top: 0, right: 300, bottom: 300 };
  it('takes the first spot that is clear', () => {
    const occupied = [textBox({ x: 100, baseline: 100 }, 40, 11)];
    const spot = chooseLabelSpot(
      [
        { x: 110, baseline: 104 },
        { x: 20, baseline: 104 },
      ],
      40,
      11,
      occupied,
      bounds
    );
    expect(spot).toEqual({ x: 20, baseline: 104 });
  });
  it('skips a spot outside its bounds', () => {
    const spot = chooseLabelSpot(
      [
        { x: 280, baseline: 50 },
        { x: 200, baseline: 50 },
      ],
      40,
      11,
      [],
      bounds
    );
    expect(spot).toEqual({ x: 200, baseline: 50 });
  });
});

/** A 2D context that records every text draw, with the state it was drawn in. */
function recordingContext() {
  const draws: Array<{
    op: 'fill' | 'stroke' | 'path';
    text: string;
    x: number;
    y: number;
    font: string;
    fill: string;
    align: string;
  }> = [];
  const state: Record<string, unknown> = {
    font: '10px sans-serif',
    fillStyle: '#000',
    textAlign: 'start',
  };
  const stack: Array<Record<string, unknown>> = [];
  const px = () => Number(/(\d+(?:\.\d+)?)px/.exec(String(state.font))?.[1] ?? 10);
  const ctx = new Proxy(
    {},
    {
      get: (_t, prop: string) => {
        if (prop in state) return state[prop];
        if (prop === 'measureText') return (s: string) => ({ width: [...s].length * px() * 0.55 });
        if (prop === 'fillText' || prop === 'strokeText')
          return (text: string, x: number, y: number) =>
            draws.push({
              op: prop === 'fillText' ? 'fill' : 'stroke',
              text,
              x,
              y,
              font: String(state.font),
              fill: String(state.fillStyle),
              align: String(state.textAlign),
            });
        // A stroked line: the grid, an axis, a reference line, the curve, a marker's outline.
        if (prop === 'stroke')
          return () =>
            draws.push({ op: 'path', text: '', x: 0, y: 0, font: '', fill: '', align: '' });
        if (prop === 'save') return () => stack.push({ ...state });
        if (prop === 'restore') return () => Object.assign(state, stack.pop() ?? {});
        if (prop === 'createLinearGradient' || prop === 'createRadialGradient')
          return () => ({ addColorStop: () => {} });
        return () => {};
      },
      set: (_t, prop: string, value) => {
        state[prop] = value;
        return true;
      },
    }
  );
  return { ctx, draws };
}

describe('InteractiveGraph labels', () => {
  const realGetContext = HTMLCanvasElement.prototype.getContext;
  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = realGetContext;
  });

  function drawGraph(props: Parameters<typeof InteractiveGraph>[0]) {
    const { ctx, draws } = recordingContext();
    HTMLCanvasElement.prototype.getContext = (() => ctx) as never;
    render(<InteractiveGraph {...props} />);
    return draws;
  }

  const weakAcid = Array.from({ length: 101 }, (_, i) => {
    const v = i * 0.5;
    return { x: v, y: v < 25 ? 4.74 + Math.log10((v + 0.3) / (25.3 - v)) : 11 + (v - 25) * 0.06 };
  });

  // Phone-width ph-titration Stig 2, the student's mark inside the buffer region: "Þitt val"
  // used to print straight over "Stuðpúðasvæði".
  const phoneTitration = {
    width: 300,
    height: 400,
    series: [{ id: 't', data: weakAcid, color: '#3b82f6' }],
    xAxis: { min: 0, max: 50, label: 'Rúmmál bætt við (mL)', tickInterval: 10 },
    yAxis: { min: 0, max: 14, label: 'pH', tickInterval: 2 },
    regions: [
      { yMin: 3.74, yMax: 5.74, color: 'rgba(251, 191, 36, 0.15)', label: 'Stuðpúðasvæði' },
    ],
    horizontalLines: [
      {
        y: 4.74,
        color: '#f59e0b',
        lineDash: [5, 5],
        label: 'pKa = 4,74',
        labelPosition: 'right' as const,
      },
    ],
    markers: [
      {
        x: 25,
        y: 8.7,
        color: '#22c55e',
        icon: '⭐' as const,
        radius: 8,
        label: 'Jafngildispunktur',
      },
      { x: 12.5, y: 4.74, color: '#f36b22', icon: '◆' as const, radius: 10, label: 'Þitt val' },
    ],
  };
  const LABELS = ['Stuðpúðasvæði', 'pKa = 4,74', 'Jafngildispunktur', 'Þitt val'];

  it('keeps every label clear of every other label', () => {
    const draws = drawGraph(phoneTitration);
    const boxes = LABELS.map((text) => {
      const d = draws.filter((x) => x.op === 'fill' && x.text === text).at(-1)!;
      expect(d).toBeDefined();
      return textBox({ x: d.x, baseline: d.y }, [...text].length * 11 * 0.55, 11);
    });
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i];
        const b = boxes[j];
        const overlap =
          a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
        expect(overlap, `${LABELS[i]} / ${LABELS[j]}`).toBe(false);
      }
    }
  });

  it('writes every label on a white halo, after every line, in readable ink', () => {
    const draws = drawGraph(phoneTitration);
    const lastLine = draws.map((d) => d.op).lastIndexOf('path');
    for (const text of LABELS) {
      const fillAt = draws.findIndex((d) => d.op === 'fill' && d.text === text);
      const strokeAt = draws.findIndex((d) => d.op === 'stroke' && d.text === text);
      expect(strokeAt, text).toBeGreaterThan(-1);
      expect(strokeAt).toBeLessThan(fillAt);
      expect(fillAt, `${text} drawn before a line that can cross it`).toBeGreaterThan(lastLine);
      expect(contrastOnWhite(draws[fillAt].fill), text).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('writes the thermodynamics temperature marker legibly over the green region', () => {
    const draws = drawGraph({
      width: 500,
      height: 300,
      series: [
        {
          id: 'g',
          data: [
            { x: 200, y: -52 },
            { x: 1200, y: 147 },
          ],
          color: '#f36b22',
        },
      ],
      xAxis: { min: 200, max: 1200, label: 'T (K)', tickInterval: 200 },
      yAxis: { min: -150, max: 150, label: 'ΔG (kJ/mól)', tickInterval: 30 },
      regions: [
        {
          yMin: -150,
          yMax: 0,
          color: 'rgba(34, 197, 94, 0.1)',
          label: 'Sjálfgengt',
          labelPosition: 'left',
        },
      ],
      markers: [{ x: 300, y: -32, color: '#22c55e', radius: 6, label: '-32 kJ/mól' }],
    });
    const fill = draws.find((d) => d.op === 'fill' && d.text === '-32 kJ/mól')!;
    expect(contrastOnWhite(fill.fill)).toBeGreaterThanOrEqual(4.5);
    expect(draws.some((d) => d.op === 'stroke' && d.text === '-32 kJ/mól')).toBe(true);
  });

  it('keeps a vertical line’s label right of the y axis, off its tick values', () => {
    // thermodynamics-predictor on a phone, T_cross near the left edge: the centred label was
    // clamped only to the canvas, so it ran out over the axis and the "-500" tick.
    const draws = drawGraph({
      width: 288,
      height: 300,
      series: [
        {
          id: 'g',
          data: [
            { x: 200, y: -1 },
            { x: 1200, y: 24 },
          ],
          color: '#f36b22',
        },
      ],
      xAxis: { min: 200, max: 1200, label: 'T (K)', tickInterval: 200 },
      yAxis: { min: -500, max: 500, label: 'ΔG (kJ/mól)', tickInterval: 100 },
      verticalLines: [
        {
          x: 273,
          color: '#8b5cf6',
          lineDash: [5, 5],
          label: 'T_cross = 273 K',
          labelPosition: 'bottom',
        },
      ],
    });
    const label = draws.find((d) => d.op === 'fill' && d.text === 'T_cross = 273 K')!;
    const box = textBox({ x: label.x, baseline: label.y }, 15 * 11 * 0.55, 11);
    const ticks = draws.filter((d) => d.op === 'fill' && d.font === '12px sans-serif');
    expect(ticks.length).toBeGreaterThan(5);
    for (const t of ticks) {
      const tick = textBox({ x: t.x, baseline: t.y }, [...t.text].length * 12 * 0.55, 12);
      const overlap =
        box.left < tick.right &&
        tick.left < box.right &&
        box.top < tick.bottom &&
        tick.top < box.bottom;
      expect(overlap, `T_cross label over tick "${t.text}"`).toBe(false);
    }
  });

  it('centres an icon marker on its point', () => {
    const draws = drawGraph(phoneTitration);
    const star = draws.find((d) => d.op === 'fill' && d.text === '⭐')!;
    expect(star.align).toBe('center');
  });

  it('keeps a marker label off the reference line its marker sits on', () => {
    // ph-titration Stig 1: the equivalence point sits on the dashed pH 7 line.
    const draws = drawGraph({
      width: 500,
      height: 300,
      series: [{ id: 't', data: weakAcid, color: '#3b82f6' }],
      xAxis: { min: 0, max: 50, label: 'Rúmmál (mL)', tickInterval: 10 },
      yAxis: { min: 0, max: 14, label: 'pH', tickInterval: 2 },
      markers: [{ x: 25, y: 7, color: '#22c55e', radius: 6, label: 'Jafngildispunktur' }],
      horizontalLines: [
        { y: 7, color: '#94a3b8', lineDash: [5, 5], label: 'pH 7', labelPosition: 'right' },
      ],
    });
    // y = 7 on a 0–14 axis drawn from 30 to 250 px.
    const lineY = 250 - (7 / 14) * 220;
    const d = draws.find((x) => x.op === 'fill' && x.text === 'Jafngildispunktur')!;
    const box = textBox({ x: d.x, baseline: d.y }, 17 * 11 * 0.55, 11);
    expect(box.bottom < lineY - 1 || box.top > lineY + 1).toBe(true);
  });
});

// ---------------------------------------------------------------------------------------------
// ParticleSimulation legend
// ---------------------------------------------------------------------------------------------

describe('ParticleSimulation legend', () => {
  const realGetContext = HTMLCanvasElement.prototype.getContext;
  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = realGetContext;
  });
  const types = [
    { id: 'R', color: '#f97316', label: 'R' },
    { id: 'P', color: '#8b5cf6', label: 'P' },
  ];

  function legendEntry(text: RegExp) {
    return screen.getByText(text).closest('[data-testid="particle-legend-entry"]') as HTMLElement;
  }

  it('carries the simulation background with contrasting text, so it reads on a light page', () => {
    HTMLCanvasElement.prototype.getContext = (() => null) as never;
    render(
      <div style={{ background: '#fff' }}>
        <ParticleSimulation
          container={{ width: 300, height: 180, backgroundColor: '#0f172a' }}
          particleTypes={types}
          particles={[
            { typeId: 'R', count: 3 },
            { typeId: 'P', count: 2 },
          ]}
          running={false}
        />
      </div>
    );
    const entry = legendEntry(/^R:/);
    expect(entry).not.toBeNull();
    expect(entry.style.backgroundColor).toBe('rgb(15, 23, 42)');
    expect(entry.style.color).toBe('rgb(243, 244, 246)');
  });

  it('writes dark text on a light simulation background', () => {
    HTMLCanvasElement.prototype.getContext = (() => null) as never;
    render(
      <ParticleSimulation
        container={{ width: 300, height: 180, backgroundColor: '#f8fafc' }}
        particleTypes={types}
        particles={[{ typeId: 'R', count: 1 }]}
        running={false}
      />
    );
    expect(legendEntry(/^R:/).style.color).toBe('rgb(31, 41, 55)');
  });

  it('can be switched off by a caller that draws its own legend', () => {
    HTMLCanvasElement.prototype.getContext = (() => null) as never;
    render(
      <ParticleSimulation
        container={{ width: 300, height: 180 }}
        particleTypes={types}
        particles={[{ typeId: 'R', count: 1 }]}
        running={false}
        showLegend={false}
      />
    );
    expect(screen.queryByText(/^R:/)).toBeNull();
  });
});

// ---------------------------------------------------------------------------------------------
// MoleculeViewer3D loading text
// ---------------------------------------------------------------------------------------------

describe('MoleculeViewer3DLazy placeholder', () => {
  it('keeps "Sæki þrívíddarsýn…" on one line', () => {
    render(
      <MoleculeViewer3DLazy
        molecule={{ id: 'h2o', formula: 'H₂O', atoms: [{ id: 'o', symbol: 'O' }], bonds: [] }}
      />
    );
    expect(screen.getByText('Sæki þrívíddarsýn…').className).toContain('whitespace-nowrap');
  });
});
