import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { InteractiveGraphProps } from '@shared/components';

import { ALL_PROBLEMS, openProblem } from './play-helpers';

/**
 * The ΔG°-against-T graph shows the problem's line.
 *
 * **Why this exists.** The y-axis was fixed at ±500 kJ/mol, and methane combustion
 * (ΔG° ≈ −800) and photosynthesis (ΔG° ≈ +2870) never come inside it: the graph was an empty
 * grid with the temperature marker drawn off its edge. The canvas cannot be read in jsdom, so
 * the graph is replaced by a stub that records what it was asked to draw.
 */

const drawn: InteractiveGraphProps[] = [];

vi.mock('@shared/components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/components')>();
  return {
    ...actual,
    InteractiveGraph: (props: InteractiveGraphProps) => {
      drawn.push(props);
      return null;
    },
  };
});

beforeEach(() => {
  drawn.length = 0;
  localStorage.clear();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  Element.prototype.scrollIntoView = () => {};
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('the ΔG° graph', () => {
  it('holds every problem’s whole line and its marker', () => {
    for (const { problem } of ALL_PROBLEMS) {
      drawn.length = 0;
      openProblem(problem.id);
      const graph = drawn.at(-1)!;
      const ys = graph.series.flatMap((s) => s.data.map((p) => p.y));
      const where = `id ${problem.id}`;
      expect(Math.min(...ys), where).toBeGreaterThanOrEqual(graph.yAxis.min);
      expect(Math.max(...ys), where).toBeLessThanOrEqual(graph.yAxis.max);
      for (const marker of graph.markers ?? []) {
        expect(marker.y, `${where} marker`).toBeGreaterThanOrEqual(graph.yAxis.min);
        expect(marker.y, `${where} marker`).toBeLessThanOrEqual(graph.yAxis.max);
      }
      // The shaded regions still fill the plot.
      const regions = graph.regions ?? [];
      expect(Math.min(...regions.map((r) => r.yMin)), where).toBe(graph.yAxis.min);
      expect(Math.max(...regions.map((r) => r.yMax)), where).toBe(graph.yAxis.max);
      cleanup();
    }
  });

  it('keeps the ±500 kJ/mol axis wherever the line fits in it', () => {
    openProblem(11); // Haber: −52,2 … +146,8 kJ/mol over 200–1200 K
    const graph = drawn.at(-1)!;
    expect([graph.yAxis.min, graph.yAxis.max, graph.yAxis.tickInterval]).toEqual([-500, 500, 100]);
  });
});
