// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { ConcentrationTimeGraph } from '../components/ConcentrationTimeGraph';

/**
 * The "Lykilatriði" box under the concentration–time graph said of a zero-order reaction that
 * t₁/₂ "lengist þegar styrkur minnkar". The graph beside it computes t₁/₂ = [A]₀/(2k), which is
 * proportional to [A]₀ — so as the concentration falls the half-life gets SHORTER. The sentence
 * was the second-order behaviour copied onto the zero-order line, and it contradicted the very
 * formula printed a few lines above it.
 */
function keyPoint(container: HTMLElement, order: 0 | 1 | 2): string {
  const item = Array.from(container.querySelectorAll('li')).find((li) =>
    li.textContent?.includes(`${order}. stig:`)
  );
  if (!item) throw new Error(`no key point for order ${order}`);
  return item.textContent!;
}

describe('the half-life key points agree with t₁/₂ for each order', () => {
  // t₁/₂ as a function of the starting concentration, for k = 1 — the textbook formulas.
  const halfLife = {
    0: (a0: number) => a0 / 2,
    1: () => Math.log(2),
    2: (a0: number) => 1 / a0,
  } as const;

  const trend = (order: 0 | 1 | 2) => {
    const before = halfLife[order](1);
    const after = halfLife[order](0.5);
    if (Math.abs(after - before) < 1e-12) return 'stöðugur';
    return after < before ? 'styttist' : 'lengist';
  };

  it.each([0, 1, 2] as const)('order %i', (order) => {
    const { container, unmount } = render(<ConcentrationTimeGraph />);
    const line = keyPoint(container, order).toLowerCase();
    const expected = trend(order);
    expect(line).toContain(expected);
    for (const other of ['styttist', 'lengist', 'stöðugur'].filter((w) => w !== expected)) {
      expect(line).not.toContain(other);
    }
    unmount();
  });
});
