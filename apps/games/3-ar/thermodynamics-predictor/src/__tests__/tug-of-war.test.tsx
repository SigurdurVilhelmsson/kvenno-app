import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TugOfWar, tugTerms } from '../components/TugOfWar';
import { calculateDeltaG } from '../utils/thermo-calculations';

describe('TugOfWar', () => {
  it('sums to the game’s own ΔG°', () => {
    for (const [h, s, t] of [
      [-100, -200, 300],
      [178, 161, 1100],
      [-6, -22, 263],
    ]) {
      expect(tugTerms(h, s, t).deltaG).toBeCloseTo(calculateDeltaG(h, s, t), 10);
    }
  });

  it('balances at the crossover temperature', () => {
    const { deltaH, minusTS, deltaG } = tugTerms(-100, -200, 500);
    expect(minusTS).toBeCloseTo(-deltaH, 10);
    expect(deltaG).toBeCloseTo(0, 10);
  });

  it('keeps ΔH° fixed and moves only −TΔS° with temperature, on a fixed scale', () => {
    const { container, rerender } = render(
      <TugOfWar deltaH={-100} deltaS={-200} temperature={300} />
    );
    const width = (k: string) =>
      (container.querySelector(`[data-bar="${k}"]`) as HTMLElement).style.width;
    const h300 = width('h');
    const ts300 = width('ts');
    rerender(<TugOfWar deltaH={-100} deltaS={-200} temperature={900} />);
    expect(width('h')).toBe(h300);
    expect(width('ts')).not.toBe(ts300);
  });

  it('describes the values with a decimal comma', () => {
    render(<TugOfWar deltaH={-91.8} deltaS={-199} temperature={500} />);
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe(
      'Við 500 K: ΔH° = -91,8 kJ/mól, −TΔS° = 99,5 kJ/mól, samtals ΔG° = 7,7 kJ/mól.'
    );
  });
});
