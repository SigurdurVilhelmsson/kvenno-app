// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BondAngleMeasurement } from '../components/BondAngleMeasurement';
import { Level1 } from '../components/Level1';
import { ShapeTransitionAnimation } from '../components/ShapeTransitionAnimation';

/**
 * Stig 1's explore screen hands the selected shape to three widgets — the
 * repulsion animation above the grid, the shape-transition animation and the
 * bond-angle tool below it. Each copied its prop into state once, so it stayed
 * on the first shape whatever the student chose next: pick CH₄, then SF₆, and
 * the angle tool still measured CH₄.
 *
 * Queries are scoped to the rendered container (the repo runs vitest with
 * `retry: 2` and no RTL auto-cleanup), and the level is unmounted afterwards
 * so the animations' timers do not leak into the next test.
 */

let unmount: (() => void) | null = null;

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  unmount?.();
  unmount = null;
});

function start() {
  const rendered = render(<Level1 onComplete={vi.fn()} onBack={vi.fn()} />);
  unmount = rendered.unmount;
  return { ui: within(rendered.container), container: rendered.container };
}

/** The shape cards in the explore grid carry the English name as a subtitle. */
const pick = (ui: ReturnType<typeof within>, english: RegExp) =>
  fireEvent.click(ui.getByRole('button', { name: english }));

const angleTool = (container: HTMLElement) =>
  container.querySelector('svg[aria-label^="Tengihornarit"]') as SVGElement;

const shapeTransition = (container: HTMLElement) =>
  container.querySelector('svg[aria-label*="umbreytingu"]') as SVGElement;

describe('the Stig 1 widgets follow the shape the student picks', () => {
  it('the bond-angle tool measures the new shape', () => {
    const { ui, container } = start();
    pick(ui, /Tetrahedral/);
    expect(angleTool(container).getAttribute('aria-label')).toContain('109,5°');

    pick(ui, /Octahedral/);
    expect(angleTool(container).getAttribute('aria-label')).toContain('90°');

    pick(ui, /Linear/);
    expect(angleTool(container).getAttribute('aria-label')).toContain('180°');
  });

  it("the bond-angle tool's own buttons still choose freely", () => {
    const { ui, container } = start();
    pick(ui, /Octahedral/);
    fireEvent.click(ui.getByRole('button', { name: 'H₂O' }));
    expect(angleTool(container).getAttribute('aria-label')).toContain('104,5°');
  });

  it('the repulsion animation shows the new shape', () => {
    const { ui, container } = start();
    pick(ui, /Tetrahedral/);
    pick(ui, /Linear/);
    expect(container.textContent).toContain('hrinda hvort öðru 180° í sundur');

    // The four-domain bent shape is drawn by the animation as well.
    pick(ui, /Trigonal Pyramidal/);
    pick(ui, /^Beygð \(2 lp\)/);
    expect(container.textContent).toContain('2 stök pör ýta bindandi pörum nær saman');
  });

  it('the shape-transition animation moves to the new domain count', () => {
    const { ui, container } = start();
    pick(ui, /Tetrahedral/);
    expect(shapeTransition(container).textContent).toContain('4 svið');

    pick(ui, /Octahedral/);
    expect(shapeTransition(container).textContent).toContain('6 svið');

    pick(ui, /Linear/);
    expect(shapeTransition(container).textContent).toContain('2 svið');
  });
});

describe('the shape-transition animation', () => {
  it('draws no domain on top of the central atom', () => {
    // The third equatorial domain of the five-domain shape sat at (0, 0).
    for (const domains of [2, 3, 4, 5, 6]) {
      const rendered = render(
        <ShapeTransitionAnimation compact showControls initialDomains={domains} />
      );
      const svg = rendered.container.querySelector('svg[aria-label*="umbreytingu"]')!;
      const center = 110; // compact: a 220-unit square
      const circles = Array.from(svg.querySelectorAll('circle[fill="url(#domainGradient)"]'));
      expect(circles.length, `${domains} domains`).toBe(domains);
      for (const c of circles) {
        const dx = Number(c.getAttribute('cx')) - center;
        const dy = Number(c.getAttribute('cy')) - center;
        // central radius 22 + domain radius 14
        expect(Math.hypot(dx, dy), `${domains} domains`).toBeGreaterThan(36);
      }
      rendered.unmount();
    }
  });
});

describe('the compact bond-angle tool', () => {
  it('names one lone pair in the singular', () => {
    // Level 2's count phrases were fixed for "1 stök pör"; the compact
    // angle tool printed the same plural after a count of 1.
    const one = render(<BondAngleMeasurement compact geometryId="trigonal-pyramidal" />);
    expect(one.container.textContent).toContain('1 stakt par → -2,5°');
    expect(one.container.textContent).not.toContain('stök pör');
    one.unmount();

    const two = render(<BondAngleMeasurement compact geometryId="bent-4" />);
    expect(two.container.textContent).toContain('2 stök pör → -5°');
    two.unmount();
  });
});
