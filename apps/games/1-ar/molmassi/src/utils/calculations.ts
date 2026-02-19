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
    compound.elements.forEach(el => {
      if (el.symbol !== 'H' && el.symbol !== 'O') {
        const element = ELEMENTS.find(e => e.symbol === el.symbol);
        if (element) {
          breakdown.push({
            type: 'calculation',
            symbol: el.symbol,
            count: el.count,
            atomicMass: element.atomicMass,
            total: el.count * element.atomicMass
          });
        }
      }
    });

    // Calculate O and H from main compound
    const totalO = compound.elements.find(e => e.symbol === 'O')?.count || 0;
    const waterH = waterMultiplier * 2;
    const waterO = waterMultiplier * 1;
    const mainO = totalO - waterO;

    if (mainO > 0) {
      const oElement = ELEMENTS.find(e => e.symbol === 'O');
      if (oElement) {
        breakdown.push({
          type: 'calculation',
          symbol: 'O',
          count: mainO,
          atomicMass: oElement.atomicMass,
          total: mainO * oElement.atomicMass
        });
      }
    }

    breakdown.push({ type: 'section', label: `Vatn (${waterMultiplier}H₂O):` });

    const hElement = ELEMENTS.find(e => e.symbol === 'H');
    const oElement = ELEMENTS.find(e => e.symbol === 'O');

    if (hElement) {
      breakdown.push({
        type: 'calculation',
        symbol: 'H',
        count: waterH,
        atomicMass: hElement.atomicMass,
        total: waterH * hElement.atomicMass
      });
    }

    if (oElement) {
      breakdown.push({
        type: 'calculation',
        symbol: 'O',
        count: waterO,
        atomicMass: oElement.atomicMass,
        total: waterO * oElement.atomicMass
      });
    }
  } else {
    // Regular compound
    compound.elements.forEach(el => {
      const element = ELEMENTS.find(e => e.symbol === el.symbol);
      if (element) {
        breakdown.push({
          type: 'calculation',
          symbol: el.symbol,
          count: el.count,
          atomicMass: element.atomicMass,
          total: el.count * element.atomicMass
        });
      }
    });
  }

  return breakdown;
}

// Validate user answer
export function validateAnswer(userValue: number, correctValue: number, tolerance: number = 0.5): boolean {
  return Math.abs(userValue - correctValue) <= tolerance;
}

// Generate contextual feedback based on error magnitude
export function generateContextualFeedback(userValue: number, correctValue: number): string {
  const percentError = Math.abs((userValue - correctValue) / correctValue) * 100;

  if (percentError > 50) {
    return 'Miklu of langt frá! Athugaðu hvort þú gleymdir frumefni';
  } else if (percentError > 20) {
    return 'Ekki rétt. Athugaðu fjölda atóma';
  } else if (percentError > 5) {
    return 'Nálægt en ekki alveg! Athugaðu aukastafi';
  } else if (percentError > 1) {
    return 'Mjög nálægt! Athugaðu útreikning þinn vandlega';
  }
  return '';
}

// Calculate points based on difficulty and speed
export function calculatePoints(difficulty: string, timeRemaining: number, hintsUsed: number): number {
  const basePoints = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
  const timeBonus = Math.floor(timeRemaining / 10);
  const hintPenalty = hintsUsed * 5;
  return Math.max(basePoints + timeBonus - hintPenalty, 5);
}
