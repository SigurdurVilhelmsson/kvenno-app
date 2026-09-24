// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { EnergyPathwayDiagram } from '../components/EnergyPathwayDiagram';
import { StatePathComparison } from '../components/StatePathComparison';

/**
 * Both energy drawings used a fixed viewBox (400 and 450 units) that the browser scaled down to
 * fit. On a 360 px phone their boxes are about 260 px wide, so every label shrank to 5–6 px.
 * They now lay themselves out at the box's own width when it is narrower, with larger type,
 * and keep the fixed desktop drawing otherwise.
 *
 * jsdom has no layout, so the box width is stubbed on `clientWidth`, which is what the shared
 * `useContainerWidth` hook reads. Queries are scoped to each render's container because the
 * repo runs vitest with `retry: 2` and no RTL auto-cleanup.
 */

const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');

function stubContainerWidth(px: number) {
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => px,
  });
}

afterEach(() => {
  if (original) Object.defineProperty(HTMLElement.prototype, 'clientWidth', original);
});

// Puzzle 3's solution: 2 × C combustion, 3 × H₂ combustion, ethanol formation reversed.
const THREE_STEPS = [
  { label: 'C(s) + O₂(g) → CO₂(g)', deltaH: -787 },
  { label: 'H₂(g) + ½O₂(g) → H₂O(l)', deltaH: -857.4 },
  { label: 'C₂H₅OH(l) → 2C(s) + 3H₂(g) + ½O₂(g)', deltaH: 277 },
];

function renderPathway(px: number, isCorrect = false) {
  stubContainerWidth(px);
  const { container } = render(
    <EnergyPathwayDiagram steps={THREE_STEPS} targetDeltaH={-1367} isCorrect={isCorrect} />
  );
  const svg = container.querySelector('svg[role="img"]') as SVGSVGElement;
  const svgTexts = [...svg.querySelectorAll('text')].map((t) => t.textContent);
  return { container, svg, svgTexts };
}

describe('EnergyPathwayDiagram layout', () => {
  it('keeps the 400-wide drawing with its step labels where there is room', () => {
    const { container, svg, svgTexts } = renderPathway(800);
    expect(svg.getAttribute('viewBox')).toBe('0 0 400 280');
    expect(svgTexts).toContain('-787 kJ');
    expect(svgTexts).toContain('Σ = -1367');
    expect(container.querySelector('ol')).toBeNull();
  });

  it('lays out at the box width on a phone and lists the step values under it', () => {
    const { container, svg, svgTexts } = renderPathway(260);
    expect(svg.getAttribute('viewBox')).toBe('0 0 260 240');
    // No crowded value labels on the drawing: the steps are numbered instead.
    expect(svgTexts.some((t) => /^[+-]?\d+ kJ$/.test(t ?? '') || t?.includes('Σ'))).toBe(false);
    expect(svgTexts).toEqual(expect.arrayContaining(['1', '2', '3']));

    const items = [...container.querySelectorAll('ol > li')].map((li) => li.textContent);
    expect(items).toEqual(['1-787 kJΣ = -787', '2-857 kJΣ = -1644', '3+277 kJΣ = -1367']);
  });

  it('still marks a correct path with a tick when narrow', () => {
    const { svgTexts } = renderPathway(260, true);
    expect(svgTexts).toContain('✓');
  });

  it('keeps every drawn point inside the narrow drawing', () => {
    const { svg } = renderPathway(232);
    for (const c of svg.querySelectorAll('circle')) {
      const cx = Number(c.getAttribute('cx'));
      const r = Number(c.getAttribute('r'));
      expect(cx - r).toBeGreaterThanOrEqual(0);
      // The last point stays clear of the right-aligned "Markmið" label.
      expect(cx + r).toBeLessThanOrEqual(232 - 40);
    }
  });
});

function renderComparison(px: number) {
  stubContainerWidth(px);
  const { container } = render(<StatePathComparison compact={true} />);
  const svg = container.querySelector('svg[role="img"]') as SVGSVGElement;
  return { container, svg };
}

describe('StatePathComparison layout', () => {
  it('keeps the 450-wide drawing where there is room', () => {
    const { svg } = renderComparison(800);
    expect(svg.getAttribute('viewBox')).toBe('0 0 450 200');
  });

  it('lays out at the box width on a phone, with its step values drawn over every line', () => {
    const { svg } = renderComparison(260);
    expect(svg.getAttribute('viewBox')).toBe('0 0 260 240');

    // Document order is paint order in SVG. Each step value must come after the last path
    // line, or the other route's line is painted across it.
    const nodes = [...svg.querySelectorAll('path, text')];
    const lastLine = nodes.map((n) => n.tagName).lastIndexOf('path');
    const stepValues = nodes.filter(
      (n) => n.tagName === 'text' && /^[+-]\d+$/.test(n.textContent ?? '')
    );
    expect(stepValues.map((n) => n.textContent)).toEqual(
      expect.arrayContaining(['-394', '-111', '-283'])
    );
    for (const n of stepValues) expect(nodes.indexOf(n)).toBeGreaterThan(lastLine);
  });

  it('puts the overlay toggle and its label in one named switch', () => {
    const { container } = renderComparison(800);
    const toggle = within(container).getByRole('switch', { name: 'Sýna saman:' });
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-checked')).toBe('false');
  });
});
