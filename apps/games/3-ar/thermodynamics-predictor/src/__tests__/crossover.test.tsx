import { cleanup, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { InteractiveGraphProps } from '@shared/components';

import { ALL_PROBLEMS, answer, openProblem, VERDICT } from './play-helpers';
import { calculateDeltaG, crossoverTemperature } from '../utils/thermo-calculations';

/**
 * A crossover temperature is shown only where there is one.
 *
 * **Why this exists.** The game computed T = |ΔH° / ΔS°| for every problem. Where ΔH° and ΔS°
 * have opposite signs (scenarios 1 and 2) ΔG° never reaches 0 and the quotient is negative,
 * so the absolute value made one up: Demant → Grafít (id 15) was shown an
 * "Umbreytingarhitastig" of 576 K, told in red that 298 K was "undir T_cross", and its graph
 * drew a purple "ΔG = 0" point at 576 K where its own line stands at −3,8 kJ/mol. Id 27 (ATP)
 * had the same at 571 K, 40 kJ/mol off the line.
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

describe('crossoverTemperature', () => {
  it('is ΔH°/ΔS° where the two share a sign', () => {
    expect(crossoverTemperature(-92, -199)).toBeCloseTo(462.3, 1);
    expect(crossoverTemperature(44, 118)).toBeCloseTo(372.9, 1);
  });

  it('does not exist where they do not, or where ΔS° = 0', () => {
    expect(crossoverTemperature(-1.9, 3.3)).toBeNull();
    expect(crossoverTemperature(285, -137)).toBeNull();
    expect(crossoverTemperature(-50, 0)).toBeNull();
  });
});

/** The live panel's heading, "Umbreytingarhitastig (T cross):". */
const PANEL = /^Umbreytingarhitastig \(/;

describe('the crossover on screen', () => {
  it('every "ΔG = 0" point on the graph lies on the problem’s own line', () => {
    for (const { problem } of ALL_PROBLEMS) {
      drawn.length = 0;
      openProblem(problem.id);
      const graph = drawn.at(-1)!;
      for (const line of graph.verticalLines ?? []) {
        const deltaG = calculateDeltaG(problem.deltaH, problem.deltaS, line.x);
        expect(Math.abs(deltaG), `id ${problem.id}: T_cross at ${line.x} K`).toBeLessThan(1e-9);
      }
      for (const marker of (graph.markers ?? []).filter((m) => m.label === 'ΔG = 0')) {
        const deltaG = calculateDeltaG(problem.deltaH, problem.deltaS, marker.x);
        expect(Math.abs(deltaG - marker.y), `id ${problem.id}: marker`).toBeLessThan(1e-9);
      }
      cleanup();
    }
  });

  it('no crossover is named for a problem whose ΔG° never changes sign', () => {
    const oneSigned = ALL_PROBLEMS.filter(({ problem }) => problem.deltaH * problem.deltaS < 0);
    // Ids 15 and 27 are the two whose |ΔH°/ΔS°| lands inside the slider's 200–1200 K.
    expect(oneSigned.map(({ problem }) => problem.id)).toEqual(expect.arrayContaining([15, 27]));
    for (const { problem } of oneSigned) {
      openProblem(problem.id);
      answer('99999', VERDICT.equilibrium);
      // The live panel and its "Núverandi hitastig … T cross" line. The graph legend, which
      // explains the purple point in general, stays.
      expect(screen.queryByText(PANEL), `id ${problem.id}`).toBeNull();
      expect(screen.queryByText(/Núverandi hitastig/), `id ${problem.id}`).toBeNull();
      cleanup();
    }
  });

  it('is still named where there is one', () => {
    // Id 11, Haber at 500 K: T = −92 / −0,199 = 462 K.
    openProblem(11);
    expect(screen.getByText(PANEL)).toBeTruthy();
    expect(document.body.textContent).toContain('462 K');
  });
});
