import { describe, it, expect } from 'vitest';

import type { Compound } from '../data/compounds';
import { generateCalculationBreakdown } from '../utils/calculations';

// ---------------------------------------------------------------------------
// utils/calculations.ts
// ---------------------------------------------------------------------------
describe('generateCalculationBreakdown', () => {
  it('should return calculation steps for a regular compound (H2O)', () => {
    const water: Compound = {
      formula: 'H₂O',
      name: 'Vatn',
      elements: [
        { symbol: 'H', count: 2 },
        { symbol: 'O', count: 1 },
      ],
      molarMass: 18.015,
      difficulty: 'easy',
    };
    const breakdown = generateCalculationBreakdown(water);
    expect(breakdown.length).toBeGreaterThan(0);
    expect(breakdown[0].label).toContain('H');
  });
});
