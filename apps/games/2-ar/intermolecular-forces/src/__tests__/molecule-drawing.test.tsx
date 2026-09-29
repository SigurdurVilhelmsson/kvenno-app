// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { Level1 } from '../components/Level1';

/**
 * Stig 1 draws each molecule with its partial charges and, for a polar one, a dipole arrow.
 * Two defects made that drawing teach the wrong chemistry:
 *
 * - The arrow pointed at the δ+ end on every polar molecule. The shared arrow puts its head
 *   at the negative end and its crossbar at the positive end, but the stored direction said
 *   'up' for water, whose hydrogens are drawn above the oxygen, and the same for chloroform.
 * - The layout ignored the positions in the data and put the FIRST-listed atom in the middle.
 *   CO₂ came out C=O=O, methanol had carbon in the middle, HCl and HF had the hydrogen in the
 *   middle with the halogen on the far side of it, and ammonia was flattened with a hydrogen
 *   on top, where the arrow then pointed.
 *
 * This test reads the drawing the student sees, not the data, so it holds whichever of the
 * two a future change breaks. Queries are scoped to the rendered container because the repo
 * runs vitest with `retry: 2` and no RTL auto-cleanup.
 */

/** The atom expected at the middle of the drawing, for every molecule that has one. */
const CENTRAL: Record<string, string> = {
  'H₂O': 'O',
  'CH₄': 'C',
  'NH₃': 'N',
  'CO₂': 'C',
  'CH₃OH': 'O',
  'CCl₄': 'C',
  'CHCl₃': 'C',
};
/** Two-atom molecules: drawn in formula order, left to right, either side of the middle. */
const DIATOMIC: Record<string, [string, string]> = {
  HCl: ['H', 'Cl'],
  HF: ['H', 'F'],
  'I₂': ['I', 'I'],
};
const POLAR = new Set(['H₂O', 'HCl', 'NH₃', 'CH₃OH', 'CHCl₃', 'HF']);

interface DrawnAtom {
  symbol: string;
  x: number;
  y: number;
  charge: 'δ+' | 'δ−' | null;
}

function drawnAtoms(svg: SVGSVGElement): DrawnAtom[] {
  return [...svg.querySelectorAll('g.molecule-atom')].map((g) => {
    const circle = g.querySelector('circle')!;
    const texts = [...g.querySelectorAll('text')].map((t) => t.textContent ?? '');
    const charge = texts.find((t) => t === 'δ+' || t === 'δ−') as DrawnAtom['charge'];
    return {
      symbol: texts[0],
      x: Number(circle.getAttribute('cx')),
      y: Number(circle.getAttribute('cy')),
      charge: charge ?? null,
    };
  });
}

function centroid(atoms: DrawnAtom[]) {
  return {
    x: atoms.reduce((s, a) => s + a.x, 0) / atoms.length,
    y: atoms.reduce((s, a) => s + a.y, 0) / atoms.length,
  };
}

// Næsta ignores a press within 400 ms of appearing; these tests press it at once.
clockPastNextGuard();

describe('Stig 1 molecule drawings', () => {
  it('draws every molecule with the right atom in the middle and the dipole toward δ−', () => {
    const { container } = render(<Level1 onComplete={vi.fn()} onBack={vi.fn()} />);
    const view = within(container);
    fireEvent.click(view.getByRole('button', { name: /Hefja æfingar/ }));

    const seen: string[] = [];
    for (let i = 0; i < 10; i++) {
      const formula = container.querySelector('.text-4xl')!.textContent!;
      seen.push(formula);
      const svg = container.querySelector('svg[role="img"]') as SVGSVGElement;
      const [, , w, h] = svg.getAttribute('viewBox')!.split(' ').map(Number);
      const mid = { x: w / 2, y: h / 2 };
      const atoms = drawnAtoms(svg);

      if (CENTRAL[formula]) {
        const middle = atoms.filter((a) => a.x === mid.x && a.y === mid.y);
        expect(
          middle.map((a) => a.symbol),
          `${formula}: atom in the middle`
        ).toEqual([CENTRAL[formula]]);
      } else {
        const [first, second] = DIATOMIC[formula];
        expect(
          atoms.map((a) => a.symbol),
          formula
        ).toEqual([first, second]);
        expect(atoms[0].x, `${formula}: ${first} on the left`).toBeLessThan(mid.x);
        expect(atoms[1].x, `${formula}: ${second} on the right`).toBeGreaterThan(mid.x);
        expect((atoms[0].x + atoms[1].x) / 2, `${formula}: centred`).toBeCloseTo(mid.x);
      }

      const dipole = svg.querySelector('g.molecule-dipole');
      if (POLAR.has(formula)) {
        expect(dipole, `${formula}: dipole arrow`).not.toBeNull();
        const tailLine = dipole!.querySelector('line')!;
        const tail = {
          x: Number(tailLine.getAttribute('x1')),
          y: Number(tailLine.getAttribute('y1')),
        };
        const [hx, hy] = dipole!
          .querySelector('polygon')!
          .getAttribute('points')!
          .split(' ')[0]
          .split(',')
          .map(Number);
        const arrow = { x: hx - tail.x, y: hy - tail.y };

        const plus = centroid(atoms.filter((a) => a.charge === 'δ+'));
        const minus = centroid(atoms.filter((a) => a.charge === 'δ−'));
        const toMinus = { x: minus.x - plus.x, y: minus.y - plus.y };
        const cos =
          (arrow.x * toMinus.x + arrow.y * toMinus.y) /
          (Math.hypot(arrow.x, arrow.y) * Math.hypot(toMinus.x, toMinus.y));
        // The arrow snaps to up/down/left/right, so it can sit up to 45° off the true line.
        expect(cos, `${formula}: arrowhead toward the δ− end`).toBeGreaterThan(Math.SQRT1_2 - 1e-9);
      } else {
        expect(dipole, `${formula}: no dipole on a nonpolar molecule`).toBeNull();
      }

      fireEvent.click(view.getByRole('button', { name: /London dreifikraftar/ }));
      fireEvent.click(view.getByRole('button', { name: 'Athuga svar' }));
      if (i < 9) fireEvent.click(view.getByRole('button', { name: 'Næsta sameind' }));
    }

    expect(seen).toHaveLength(10);
    expect(new Set(seen)).toEqual(new Set([...Object.keys(CENTRAL), ...Object.keys(DIATOMIC)]));
  });
});
