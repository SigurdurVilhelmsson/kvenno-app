import { Compound } from '../data/compounds';
import { ELEMENTS } from '../data/elements';

export interface CalculationStep {
  type: 'section' | 'calculation';
  label?: string;
  symbol?: string;
  count?: number;
  atomicMass?: number;
  total?: number;
}

// Generate step-by-step calculation breakdown
export function generateCalculationBreakdown(compound: Compound): CalculationStep[] {
  const breakdown: CalculationStep[] = [];
  const isHydrate = compound.formula.includes('·');

  if (isHydrate) {
    // Handle hydrates separately
    const parts = compound.formula.split('·');
    const mainFormula = parts[0];
    const waterPart = parts[1];

    // Extract water multiplier (e.g., "5H₂O" -> 5)
    const waterMatch = waterPart.match(/^(\d+)/);
    const waterMultiplier = waterMatch ? parseInt(waterMatch[1]) : 1;

    breakdown.push({ type: 'section', label: `Aðalefni (${mainFormula}):` });

    // Add non-water elements first
    compound.elements.forEach((el) => {
      if (el.symbol !== 'H' && el.symbol !== 'O') {
        const element = ELEMENTS.find((e) => e.symbol === el.symbol);
        if (element) {
          breakdown.push({
            type: 'calculation',
            symbol: el.symbol,
            count: el.count,
            atomicMass: element.atomicMass,
            total: el.count * element.atomicMass,
          });
        }
      }
    });

    // Calculate O and H from main compound
    const totalO = compound.elements.find((e) => e.symbol === 'O')?.count || 0;
    const waterH = waterMultiplier * 2;
    const waterO = waterMultiplier * 1;
    const mainO = totalO - waterO;

    if (mainO > 0) {
      const oElement = ELEMENTS.find((e) => e.symbol === 'O');
      if (oElement) {
        breakdown.push({
          type: 'calculation',
          symbol: 'O',
          count: mainO,
          atomicMass: oElement.atomicMass,
          total: mainO * oElement.atomicMass,
        });
      }
    }

    breakdown.push({ type: 'section', label: `Vatn (${waterMultiplier}H₂O):` });

    const hElement = ELEMENTS.find((e) => e.symbol === 'H');
    const oElement = ELEMENTS.find((e) => e.symbol === 'O');

    if (hElement) {
      breakdown.push({
        type: 'calculation',
        symbol: 'H',
        count: waterH,
        atomicMass: hElement.atomicMass,
        total: waterH * hElement.atomicMass,
      });
    }

    if (oElement) {
      breakdown.push({
        type: 'calculation',
        symbol: 'O',
        count: waterO,
        atomicMass: oElement.atomicMass,
        total: waterO * oElement.atomicMass,
      });
    }
  } else {
    // Regular compound
    compound.elements.forEach((el) => {
      const element = ELEMENTS.find((e) => e.symbol === el.symbol);
      if (element) {
        breakdown.push({
          type: 'calculation',
          symbol: el.symbol,
          count: el.count,
          atomicMass: element.atomicMass,
          total: el.count * element.atomicMass,
        });
      }
    });
  }

  return breakdown;
}
