// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LewisDrawingCanvas } from '../components/LewisDrawingCanvas';

/**
 * What Level 2's drawing board draws, as opposed to what it grades.
 *
 * The counter and the grading were always right; the picture was not. The
 * central atom's lone pairs went one to a gap between bonds, so HCl's three
 * pairs on Cl (one bond, so one gap) drew as a single pair and H₂O never showed
 * more than two. NO's odd electron was never drawn at all. The feedback also
 * named "F" where the controls say F₁, F₂, F₃, and said "1 pör".
 *
 * The board is found by structure, not by accessible name, so the drawing tests
 * run unchanged against the version before the fix. Queries are scoped to each
 * rendered container, since the suite runs with retries.
 */

type Bond = 'single' | 'double' | 'triple';
interface Structure {
  centralAtom: string;
  surroundingAtoms: { symbol: string; bondType: Bond; lonePairs: number }[];
  centralLonePairs: number;
  centralUnpairedElectron?: boolean;
}

const HCL: Structure = {
  centralAtom: 'Cl',
  surroundingAtoms: [{ symbol: 'H', bondType: 'single', lonePairs: 0 }],
  centralLonePairs: 3,
};
const WATER: Structure = {
  centralAtom: 'O',
  surroundingAtoms: [
    { symbol: 'H', bondType: 'single', lonePairs: 0 },
    { symbol: 'H', bondType: 'single', lonePairs: 0 },
  ],
  centralLonePairs: 2,
};
const NO: Structure = {
  centralAtom: 'N',
  surroundingAtoms: [{ symbol: 'O', bondType: 'double', lonePairs: 2 }],
  centralLonePairs: 1,
  centralUnpairedElectron: true,
};
const BF3: Structure = {
  centralAtom: 'B',
  surroundingAtoms: [
    { symbol: 'F', bondType: 'single', lonePairs: 3 },
    { symbol: 'F', bondType: 'single', lonePairs: 3 },
    { symbol: 'F', bondType: 'single', lonePairs: 3 },
  ],
  centralLonePairs: 0,
};

// The desktop board: 350 × 280, central atom at its middle.
const CENTRE = { x: 175, y: 140 };

function renderBoard(molecule: string, total: number, structure: Structure) {
  const rendered = render(
    <LewisDrawingCanvas
      molecule={molecule}
      totalElectrons={total}
      correctStructure={structure}
      onComplete={vi.fn()}
    />
  );
  const { container } = rendered;
  const ui = within(container);
  const svg = container.querySelector('svg') as SVGSVGElement;

  /** The + and − steppers in screen order: the central atom's row comes first. */
  const steppers = (glyph: '+' | '−') =>
    [...container.querySelectorAll('button')].filter((b) => b.textContent === glyph);

  /** Electron dots within reach of the central atom (outer atoms' dots sit ≥ 44 away). */
  const centralDots = () =>
    [...svg.querySelectorAll('circle')]
      .filter((c) => c.getAttribute('r') === '2.5')
      .map((c) => ({ x: Number(c.getAttribute('cx')), y: Number(c.getAttribute('cy')) }))
      .filter((p) => Math.hypot(p.x - CENTRE.x, p.y - CENTRE.y) < 42);

  return { ui, container, svg, steppers, centralDots };
}

/** Angle of a point about the central atom, in degrees, 0 = right, 90 = down. */
const angleOf = (p: { x: number; y: number }) =>
  (Math.atan2(p.y - CENTRE.y, p.x - CENTRE.x) * 180) / Math.PI;

const angularGap = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('central lone pairs are all drawn', () => {
  it('draws all three of HCl’s pairs on Cl, clear of the bond', () => {
    const board = renderBoard('HCl', 8, HCL);
    const plus = board.steppers('+')[0];
    for (let i = 0; i < 3; i++) fireEvent.click(plus);

    const dots = board.centralDots();
    // Before the fix: 2 dots — one pair, whatever the stepper said.
    expect(dots).toHaveLength(6);

    // Dots come in pairs 8 units apart; each pair's midpoint is where it sits.
    const pairAngles: number[] = [];
    for (let i = 0; i < dots.length; i += 2) {
      pairAngles.push(
        angleOf({ x: (dots[i].x + dots[i + 1].x) / 2, y: (dots[i].y + dots[i + 1].y) / 2 })
      );
    }
    // H is drawn straight up from Cl (−90°); no pair may sit on that bond,
    // and no two pairs on each other.
    for (const a of pairAngles) expect(angularGap(a, -90)).toBeGreaterThanOrEqual(45);
    for (let i = 0; i < pairAngles.length; i++) {
      for (let j = i + 1; j < pairAngles.length; j++) {
        expect(angularGap(pairAngles[i], pairAngles[j])).toBeGreaterThanOrEqual(45);
      }
    }
  });

  it('draws as many pairs on O in H₂O as the stepper holds, not at most two', () => {
    const board = renderBoard('H₂O', 8, WATER);
    const plus = board.steppers('+')[0];
    for (let i = 0; i < 3; i++) fireEvent.click(plus);
    expect(board.ui.getAllByText('3')[0]).toBeTruthy();
    // Before the fix: 4 dots, two pairs, while the stepper read 3.
    expect(board.centralDots()).toHaveLength(6);
  });
});

describe('the odd electron of a radical', () => {
  it('appears on N once NO’s count leaves exactly one electron', () => {
    const board = renderBoard('NO', 11, NO);
    const bond = board.ui.getAllByRole('button', { name: /^Tengi 1 af 1/ })[0];
    fireEvent.click(bond); // einfalt
    fireEvent.click(bond); // tvöfalt
    const [centralPlus, oxygenPlus] = board.steppers('+');
    fireEvent.click(oxygenPlus);
    fireEvent.click(oxygenPlus);

    // 4 + 4 used, 3 left: nothing is drawn on N yet.
    expect(board.centralDots()).toHaveLength(0);

    fireEvent.click(centralPlus);
    // 4 + 4 + 2 used, 1 left: N's pair and its unpaired electron.
    // Before the fix: 2 — the pair alone.
    expect(board.centralDots()).toHaveLength(3);
    expect(board.ui.getByText(/ópöruð rafeind: NO er stakeind/)).toBeTruthy();
  });

  it('draws no odd electron on a molecule that has none', () => {
    const board = renderBoard('HCl', 8, HCL);
    const plus = board.steppers('+')[0];
    for (let i = 0; i < 3; i++) fireEvent.click(plus);
    // 6 of 8 used; the 2 left are a missing bond, not a radical.
    expect(board.centralDots()).toHaveLength(6);
  });
});

describe('controls and feedback name the atom they are about', () => {
  it('gives every stepper an accessible name with its atom', () => {
    const board = renderBoard('BF₃', 24, BF3);
    // Before the fix all eight were announced as a bare "+" or "−".
    expect(
      board.ui.getByRole('button', { name: 'Bæta einstæðu pari við B (miðatóm)' })
    ).toBeTruthy();
    expect(board.ui.getByRole('button', { name: 'Taka einstætt par af B (miðatóm)' })).toBeTruthy();
    for (const f of ['F₁', 'F₂', 'F₃']) {
      expect(
        board.ui.getByRole('button', { name: `Bæta einstæðu pari við ${f} (ytri)` })
      ).toBeTruthy();
      expect(
        board.ui.getByRole('button', { name: `Taka einstætt par af ${f} (ytri)` })
      ).toBeTruthy();
    }
  });

  it('names F₁, F₂, F₃ in the feedback as the controls do, and counts one pair as "par"', () => {
    const board = renderBoard('BF₃', 24, BF3);
    for (const bond of board.ui.getAllByRole('button', { name: /^Tengi \d af 3/ })) {
      fireEvent.click(bond);
    }
    const [, f1Plus, f2Plus] = board.steppers('+');
    fireEvent.click(f1Plus);
    fireEvent.click(f2Plus);
    fireEvent.click(f2Plus);
    fireEvent.click(board.ui.getByRole('button', { name: 'Athuga' }));

    const list = board.container.querySelector('ul') as HTMLUListElement;
    const items = [...list.querySelectorAll('li')].map((li) => li.textContent);
    // Before the fix: "• F: 1 pör → …", "• F: 2 pör → …", "• F: 0 pör → …".
    expect(items).toEqual([
      '• F₁: 1 par → ætti að vera 3',
      '• F₂: 2 pör → ætti að vera 3',
      '• F₃: 0 pör → ætti að vera 3',
    ]);
  });
});
