// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ForceStrengthAnimation } from '../components/ForceStrengthAnimation';

/**
 * The force drawing used to keep a fixed 380-unit viewBox and let the browser scale it down.
 * On a 360 px phone its container is about 250 px wide, so every label shrank to two thirds
 * of its size — the comparison view's 9 px energy ranges rendered at 5.6 px. It now lays
 * itself out at the container's width when that is narrower, and at 380 otherwise, so the
 * desktop drawing is unchanged.
 *
 * jsdom has no layout, so the container width is stubbed on `clientWidth`, which is what the
 * shared `useContainerWidth` hook reads. Queries are scoped to the rendered container because
 * the repo runs vitest with `retry: 2` and no RTL auto-cleanup.
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

function renderAt(px: number) {
  stubContainerWidth(px);
  const { container } = render(<ForceStrengthAnimation animate={false} />);
  const svg = container.querySelector('svg[role="img"]') as SVGSVGElement;
  return { container, svg };
}

describe('ForceStrengthAnimation layout', () => {
  it('keeps the 380-wide drawing where there is room for it', () => {
    const { svg } = renderAt(800);
    expect(svg.getAttribute('viewBox')).toBe('0 0 380 280');
  });

  it('lays out at the container width on a phone instead of scaling down', () => {
    const { svg } = renderAt(250);
    expect(svg.getAttribute('viewBox')).toBe('0 0 250 280');
  });

  it('breaks the comparison labels onto two lines only when narrow', () => {
    const narrow = renderAt(250);
    fireEvent.click(within(narrow.container).getByRole('button', { name: 'Bera saman' }));
    const narrowTspans = [...narrow.svg.querySelectorAll('tspan')].map((t) => t.textContent);
    expect(narrowTspans).toContain('Tvískauts-');
    expect(narrowTspans).toContain('tvískauts');
    expect(narrowTspans.filter((t) => t === 'kJ/mol')).toHaveLength(3);

    const wide = renderAt(800);
    fireEvent.click(within(wide.container).getByRole('button', { name: 'Bera saman' }));
    expect(wide.svg.querySelectorAll('tspan')).toHaveLength(0);
    const texts = [...wide.svg.querySelectorAll('text')].map((t) => t.textContent);
    expect(texts).toContain('Tvískauts-tvískauts');
    expect(texts).toContain('0,05 - 40 kJ/mol');
  });

  it('keeps every comparison molecule pair inside its own column when narrow', () => {
    const { container, svg } = renderAt(232);
    fireEvent.click(within(container).getByRole('button', { name: 'Bera saman' }));
    const circles = [...svg.querySelectorAll('circle')];
    expect(circles).toHaveLength(6);
    // Three equal columns between 8-unit margins; each pair must stay within its column.
    const column = (232 - 16) / 3;
    circles.forEach((c, i) => {
      const col = Math.floor(i / 2);
      const cx = Number(c.getAttribute('cx'));
      const r = Number(c.getAttribute('r'));
      expect(cx - r).toBeGreaterThanOrEqual(8 + column * col);
      expect(cx + r).toBeLessThanOrEqual(8 + column * (col + 1));
    });
  });
});
