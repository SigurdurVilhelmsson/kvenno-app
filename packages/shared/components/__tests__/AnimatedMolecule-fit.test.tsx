import { render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { stubPhoneMedia } from './phoneMedia';
import type { AnimatedMoleculeProps, Molecule } from '../../types';
import { AnimatedMolecule } from '../AnimatedMolecule/AnimatedMolecule';

/*
 * `fit` (design P11): on a phone the viewBox loses the empty rows above and below the
 * drawing. The width and the scale stay as they were, so the molecule is drawn at the same
 * size and the SVG only gets shorter; off a phone the square is untouched.
 */

let media: ReturnType<typeof stubPhoneMedia> | null = null;
afterEach(() => {
  media?.restore();
  media = null;
});

/** A straight organic chain, numbered, as organic-nomenclature draws it. */
function chain(carbons: number, branchAt?: number): Molecule {
  const x = (i: number) => -0.7 + (i * 1.4) / (carbons - 1);
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
    atoms.push({ id: 'b', symbol: 'C', position: { x: x(branchAt - 1), y: -0.05 } });
    bonds.push({ from: `c-${branchAt - 1}`, to: 'b', type: 'single' });
  }
  return { id: 'm', formula: 'C', atoms, bonds };
}

/** CO₂ as Lewis draws it: lone pairs on each oxygen, double bonds. */
const CO2: Molecule = {
  id: 'co2',
  formula: 'CO₂',
  geometry: 'linear',
  atoms: [
    { id: 'c', symbol: 'C' },
    { id: 'o1', symbol: 'O', lonePairs: 2 },
    { id: 'o2', symbol: 'O', lonePairs: 2 },
  ],
  bonds: [
    { from: 'c', to: 'o1', type: 'double' },
    { from: 'c', to: 'o2', type: 'double' },
  ],
};

/** Water, bent and polar: partial charges and an upward dipole arrow. */
const H2O: Molecule = {
  id: 'h2o',
  formula: 'H₂O',
  geometry: 'bent',
  isPolar: true,
  dipoleMoment: { direction: 'up' },
  atoms: [
    { id: 'o', symbol: 'O', lonePairs: 2, partialCharge: 'negative' },
    { id: 'h1', symbol: 'H', partialCharge: 'positive' },
    { id: 'h2', symbol: 'H', partialCharge: 'positive' },
  ],
  bonds: [
    { from: 'o', to: 'h1', type: 'single' },
    { from: 'o', to: 'h2', type: 'single' },
  ],
};

/** Hydronium: a +1 formal charge badge above the oxygen. */
const H3O: Molecule = {
  id: 'h3o',
  formula: 'H₃O⁺',
  geometry: 'trigonal-pyramidal',
  atoms: [
    { id: 'o', symbol: 'O', lonePairs: 1, formalCharge: 1 },
    { id: 'h1', symbol: 'H' },
    { id: 'h2', symbol: 'H' },
    { id: 'h3', symbol: 'H' },
  ],
  bonds: [
    { from: 'o', to: 'h1', type: 'single' },
    { from: 'o', to: 'h2', type: 'single' },
    { from: 'o', to: 'h3', type: 'single' },
  ],
};

function view(svg: SVGSVGElement) {
  const [x, y, w, h] = svg.getAttribute('viewBox')!.split(' ').map(Number);
  return { x, y, w, h };
}

/** Every drawn circle and text must lie inside the vertical range of the viewBox. */
function expectEverythingInside(svg: SVGSVGElement) {
  const { y, h } = view(svg);
  const top = y;
  const bottom = y + h;
  for (const c of svg.querySelectorAll('circle')) {
    const cy = Number(c.getAttribute('cy'));
    const r = Number(c.getAttribute('r'));
    expect(cy - r, 'circle top').toBeGreaterThanOrEqual(top);
    expect(cy + r, 'circle bottom').toBeLessThanOrEqual(bottom);
  }
  for (const t of svg.querySelectorAll('text')) {
    const ty = Number(t.getAttribute('y'));
    const size = Number(t.getAttribute('font-size'));
    const central = t.getAttribute('dominant-baseline') === 'central';
    const above = central ? size / 2 : size * 0.75;
    const below = central ? size / 2 : size * 0.25;
    expect(ty - above, `top of "${t.textContent}"`).toBeGreaterThanOrEqual(top);
    expect(ty + below, `bottom of "${t.textContent}"`).toBeLessThanOrEqual(bottom);
  }
}

function draw(props: Partial<AnimatedMoleculeProps> & { molecule: Molecule }) {
  const { container } = render(<AnimatedMolecule size="lg" animation="none" {...props} />);
  return container.querySelector('svg') as SVGSVGElement;
}

describe('AnimatedMolecule fit', () => {
  it('keeps the square off a phone, with or without fit', () => {
    // jsdom has no matchMedia: the desktop branch.
    const svg = draw({ molecule: chain(4), mode: 'organic', showAtomLabels: true, fit: true });
    expect(svg.getAttribute('viewBox')).toBe('0 0 240 240');
    expect(svg.getAttribute('height')).toBe('240');
  });

  it('keeps the square on a phone when the prop is not passed', () => {
    media = stubPhoneMedia(true);
    const svg = draw({ molecule: chain(4), mode: 'organic', showAtomLabels: true });
    expect(svg.getAttribute('viewBox')).toBe('0 0 240 240');
  });

  it('crops a flat chain to its own height, keeping width and scale', () => {
    media = stubPhoneMedia(true);
    const svg = draw({ molecule: chain(4), mode: 'organic', showAtomLabels: true, fit: true });
    const v = view(svg);

    expect(v.w).toBe(240);
    expect(svg.getAttribute('width')).toBe('240');
    // Width attribute and viewBox width agree, and so do the heights: one unit is one px.
    expect(Number(svg.getAttribute('height'))).toBe(v.h);
    // A numbered one-row chain needs well under half the square.
    expect(v.h).toBeLessThan(120);
    expectEverythingInside(svg);
  });

  it('keeps a branch and every number inside the crop', () => {
    media = stubPhoneMedia(true);
    const svg = draw({ molecule: chain(4, 2), mode: 'organic', showAtomLabels: true, fit: true });
    expect(view(svg).h).toBeLessThan(240);
    expectEverythingInside(svg);
  });

  it('keeps lone pairs inside the crop (Lewis CO₂)', () => {
    media = stubPhoneMedia(true);
    const svg = draw({ molecule: CO2, mode: 'lewis', showLonePairs: true, fit: true });
    expect(view(svg).h).toBeLessThan(240);
    expect(svg.querySelectorAll('.molecule-lone-pairs circle').length).toBeGreaterThan(0);
    expectEverythingInside(svg);
  });

  it('keeps a formal-charge badge inside the crop', () => {
    media = stubPhoneMedia(true);
    const svg = draw({ molecule: H3O, mode: 'lewis', showLonePairs: true, fit: true });
    expectEverythingInside(svg);
  });

  it('keeps partial charges and a vertical dipole arrow inside the crop', () => {
    media = stubPhoneMedia(true);
    const svg = draw({
      molecule: H2O,
      mode: 'vsepr',
      showPartialCharges: true,
      showDipoleMoment: true,
      fit: true,
    });
    expectEverythingInside(svg);
    const { y, h } = view(svg);
    for (const line of svg.querySelectorAll('.molecule-dipole line')) {
      for (const attr of ['y1', 'y2']) {
        const v = Number(line.getAttribute(attr));
        expect(v).toBeGreaterThanOrEqual(y);
        expect(v).toBeLessThanOrEqual(y + h);
      }
    }
  });

  it('goes back to the square when the screen stops being a phone', () => {
    media = stubPhoneMedia(true);
    const svg = draw({ molecule: chain(4), mode: 'organic', showAtomLabels: true, fit: true });
    expect(view(svg).h).toBeLessThan(240);

    media.set(false);

    expect(svg.getAttribute('viewBox')).toBe('0 0 240 240');
    expect(svg.getAttribute('height')).toBe('240');
  });
});
