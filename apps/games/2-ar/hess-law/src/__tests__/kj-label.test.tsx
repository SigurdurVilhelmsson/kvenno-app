// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EnergyPathwayDiagram } from '../components/EnergyPathwayDiagram';
import { kjLabel } from '../utils/kj-label';

/**
 * Year-2 audit, 2026-11-15: the staircase rounded every label to a whole kJ, so puzzle 3's
 * steps and total disagreed with the card beside them (-1367 against -1366,8).
 */
describe('kjLabel', () => {
  it('keeps one decimal, a comma and a plus sign', () => {
    expect(kjLabel(-787)).toBe('-787');
    expect(kjLabel(-857.49)).toBe('-857,5');
    expect(kjLabel(277.6)).toBe('+277,6');
    expect(kjLabel(-1366.8000000001)).toBe('-1366,8');
  });
});

describe('EnergyPathwayDiagram labels', () => {
  it('prints the step values and the total to one decimal', () => {
    const steps = [
      { label: 'a', deltaH: -787 },
      { label: 'b', deltaH: -857.4 },
      { label: 'c', deltaH: 277.6 },
    ];
    const { container } = render(
      <EnergyPathwayDiagram steps={steps} targetDeltaH={-1366.8} isCorrect={false} />
    );
    const texts = [...container.querySelectorAll('svg text')].map((t) => t.textContent);
    expect(texts).toContain('-857,4 kJ');
    expect(texts).toContain('+277,6 kJ');
    expect(texts).toContain('Σ = -1366,8');
    expect(texts.join(' ')).not.toMatch(/-1367|\+278/);
  });
});
