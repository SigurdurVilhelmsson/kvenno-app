import { describe, it, expect } from 'vitest';

import { problems } from '../data/half-reactions';

describe('half-reactions data integrity', () => {
  it('has 6 problems', () => {
    expect(problems).toHaveLength(6);
  });

  it('each problem has sequential ids', () => {
    problems.forEach((p, idx) => {
      expect(p.id).toBe(idx + 1);
    });
  });

  it('each problem has all required fields', () => {
    problems.forEach(p => {
      expect(p.description).toBeTruthy();
      expect(p.overallReaction).toBeTruthy();
      expect(p.overallDisplay).toBeTruthy();
      expect(p.oxidationHalf).toBeDefined();
      expect(p.reductionHalf).toBeDefined();
      expect(p.multiplierOx).toBeGreaterThan(0);
      expect(p.multiplierRed).toBeGreaterThan(0);
      expect(p.finalEquation).toBeTruthy();
      expect(p.hint).toBeTruthy();
    });
  });

  it('oxidation half-reactions have isOxidation=true', () => {
    problems.forEach(p => {
      expect(p.oxidationHalf.isOxidation).toBe(true);
    });
  });

  it('reduction half-reactions have isOxidation=false', () => {
    problems.forEach(p => {
      expect(p.reductionHalf.isOxidation).toBe(false);
    });
  });

  it('multipliers balance electron transfer', () => {
    problems.forEach(p => {
      const totalOxElectrons = p.multiplierOx * p.oxidationHalf.electrons;
      const totalRedElectrons = p.multiplierRed * p.reductionHalf.electrons;
      expect(totalOxElectrons).toBe(totalRedElectrons);
    });
  });

  it('all electron counts are positive', () => {
    problems.forEach(p => {
      expect(p.oxidationHalf.electrons).toBeGreaterThan(0);
      expect(p.reductionHalf.electrons).toBeGreaterThan(0);
    });
  });
});
