import { formatDecimal } from '@shared/utils';

import { Problem } from '../types';
import { formatAnswer } from '../utils/validation';

interface StepBySolutionProps {
  problem: Problem | null;
}

/**
 * Round to three decimals without `toFixed`, for a product such as M₁ × V₁
 * that is exact on paper but carries float noise (1,1 × 30 = 33,000000000000004).
 */
function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function StepBySolution({ problem }: StepBySolutionProps) {
  if (!problem) return null;

  if (problem.type === 'dilution') {
    return (
      <div className="mt-4 space-y-2 phone:mt-0 phone:space-y-1">
        <h3 className="text-lg font-bold text-warm-800 phone:text-base">Lausn með skrefum:</h3>
        <div className="solution-step">
          <h4>Gefið:</h4>
          <p>M₁ = {formatDecimal(problem.given.M1)} M</p>
          <p>V₁ = {problem.given.V1} mL</p>
          <p>V₂ = {problem.given.V2} mL</p>
        </div>
        <div className="solution-step">
          <h4>Skref 1: Varðveisla móla</h4>
          <p>Við útþynningu breytist fjöldi móla ekki: mól₁ = mól₂</p>
          <p>Þar sem mól = M × V: M₁ × V₁ = M₂ × V₂</p>
        </div>
        <div className="solution-step">
          <h4>Skref 2: Setja inn gildi</h4>
          <p>
            ({formatDecimal(problem.given.M1)} M)({problem.given.V1} mL) = M₂({problem.given.V2} mL)
          </p>
          <p>
            {formatDecimal(round3(problem.given.M1 * problem.given.V1))} = M₂({problem.given.V2})
          </p>
        </div>
        <div className="solution-step">
          <h4>Skref 3: Einangra M₂</h4>
          <p>
            M₂ = {formatDecimal(round3(problem.given.M1 * problem.given.V1))} ÷ {problem.given.V2}
          </p>
          <p>M₂ = {formatAnswer(problem.answer)} M</p>
        </div>
        <div className="solution-step">
          <h4>Svar: {formatAnswer(problem.answer)} M</h4>
        </div>
      </div>
    );
  } else if (problem.type === 'molarity') {
    return (
      <div className="mt-4 space-y-2 phone:mt-0 phone:space-y-1">
        <h3 className="text-lg font-bold text-warm-800 phone:text-base">Lausn með skrefum:</h3>
        <div className="solution-step">
          <h4>Gefið:</h4>
          <p>mól = {formatDecimal(problem.given.moles)} mól</p>
          <p>rúmmál = {formatDecimal(problem.given.volume)} L</p>
        </div>
        <div className="solution-step">
          <h4>Skref 1: Skilgreining mólstyrks</h4>
          <p>Mólstyrkur = mól efnis ÷ rúmmál lausnar í lítrum</p>
        </div>
        <div className="solution-step">
          <h4>Skref 2: Setja inn gildi</h4>
          <p>
            M = {formatDecimal(problem.given.moles)} mól ÷ {formatDecimal(problem.given.volume)} L
          </p>
          <p>M = {formatAnswer(problem.answer)} M</p>
        </div>
        <div className="solution-step">
          <h4>Svar: {formatAnswer(problem.answer)} M</h4>
        </div>
      </div>
    );
  } else if (problem.type === 'molarityFromMass') {
    // Three significant figures, not three decimals: Skref 3 divides the moles
    // printed here, and 1,5 g of CaCl₂ in 53 mL printed 0,014 mol, so the page
    // read 0,014 ÷ 0,053 = 0,255 M when 0,014 ÷ 0,053 is 0,264.
    const moles = formatAnswer(problem.given.massInGrams / problem.given.molarMass);
    return (
      <div className="mt-4 space-y-2 phone:mt-0 phone:space-y-1">
        <h3 className="text-lg font-bold text-warm-800 phone:text-base">Lausn með skrefum:</h3>
        <div className="solution-step">
          <h4>Gefið:</h4>
          <p>
            massi = {formatDecimal(problem.given.massInGrams)} g {problem.chemical?.name || ''}
          </p>
          <p>mólmassi = {formatDecimal(problem.given.molarMass)} g/mól</p>
          <p>rúmmál = {problem.given.volumeInML} mL</p>
        </div>
        <div className="solution-step">
          <h4>Skref 1: Breyta mL í L</h4>
          <p>
            {problem.given.volumeInML} mL = {problem.given.volumeInML} ÷ 1000 ={' '}
            {formatDecimal(problem.given.volumeInML / 1000, 3)} L
          </p>
        </div>
        <div className="solution-step">
          <h4>Skref 2: Reikna mól</h4>
          <p>mól = massi ÷ mólmassi</p>
          <p>
            mól = {formatDecimal(problem.given.massInGrams)} g ÷{' '}
            {formatDecimal(problem.given.molarMass)} g/mól
          </p>
          <p>mól = {moles} mól</p>
        </div>
        <div className="solution-step">
          <h4>Skref 3: Reikna mólstyrk</h4>
          <p>M = mól ÷ lítrar</p>
          <p>
            M = {moles} mól ÷ {formatDecimal(problem.given.volumeInML / 1000, 3)} L
          </p>
          <p>M = {formatAnswer(problem.answer)} M</p>
        </div>
        <div className="solution-step">
          <h4>Svar: {formatAnswer(problem.answer)} M</h4>
        </div>
      </div>
    );
  } else if (problem.type === 'mixing') {
    // Each step shows three decimals, and the total is the sum of the rounded
    // parts a student sees on the two lines above it, not of the unrounded ones.
    const moles1 = round3((problem.given.M1 * problem.given.V1) / 1000);
    const moles2 = round3((problem.given.M2 * problem.given.V2) / 1000);
    const totalMoles = formatDecimal(moles1 + moles2, 3);
    const totalVolume = formatDecimal((problem.given.V1 + problem.given.V2) / 1000, 3);

    return (
      <div className="mt-4 space-y-2 phone:mt-0 phone:space-y-1">
        <h3 className="text-lg font-bold text-warm-800 phone:text-base">Lausn með skrefum:</h3>
        <div className="solution-step">
          <h4>Gefið:</h4>
          <p>
            Lausn 1: M₁ = {formatDecimal(problem.given.M1)} M, V₁ = {problem.given.V1} mL
          </p>
          <p>
            Lausn 2: M₂ = {formatDecimal(problem.given.M2)} M, V₂ = {problem.given.V2} mL
          </p>
        </div>
        <div className="solution-step">
          <h4>Skref 1: Reikna heildarmól</h4>
          <p>
            mól₁ = M₁ × V₁ = {formatDecimal(problem.given.M1)} M ×{' '}
            {formatDecimal(problem.given.V1 / 1000, 3)} L = {formatDecimal(moles1, 3)} mól
          </p>
          <p>
            mól₂ = M₂ × V₂ = {formatDecimal(problem.given.M2)} M ×{' '}
            {formatDecimal(problem.given.V2 / 1000, 3)} L = {formatDecimal(moles2, 3)} mól
          </p>
          <p>
            mól_alls = {formatDecimal(moles1, 3)} + {formatDecimal(moles2, 3)} = {totalMoles} mól
          </p>
        </div>
        <div className="solution-step">
          <h4>Skref 2: Reikna heildarrúmmál</h4>
          <p>
            V_alls = V₁ + V₂ = {problem.given.V1} + {problem.given.V2} ={' '}
            {problem.given.V1 + problem.given.V2} mL = {totalVolume} L
          </p>
        </div>
        <div className="solution-step">
          <h4>Skref 3: Reikna endanlegan mólstyrk</h4>
          <p>M_lokal = mól_alls ÷ V_alls</p>
          <p>
            M_lokal = {totalMoles} mól ÷ {totalVolume} L
          </p>
          <p>M_lokal = {formatAnswer(problem.answer)} M</p>
        </div>
        <div className="solution-step">
          <h4>Svar: {formatAnswer(problem.answer)} M</h4>
        </div>
      </div>
    );
  } else if (problem.type === 'massFromMolarity') {
    const moles = formatDecimal((problem.given.molarity * problem.given.volumeInML) / 1000, 3);
    return (
      <div className="mt-4 space-y-2 phone:mt-0 phone:space-y-1">
        <h3 className="text-lg font-bold text-warm-800 phone:text-base">Lausn með skrefum:</h3>
        <div className="solution-step">
          <h4>Gefið:</h4>
          <p>M = {formatDecimal(problem.given.molarity)} M</p>
          <p>V = {problem.given.volumeInML} mL</p>
          <p>mólmassi = {formatDecimal(problem.given.molarMass)} g/mól</p>
        </div>
        <div className="solution-step">
          <h4>Skref 1: Breyta mL í L</h4>
          <p>
            {problem.given.volumeInML} mL = {formatDecimal(problem.given.volumeInML / 1000, 3)} L
          </p>
        </div>
        <div className="solution-step">
          <h4>Skref 2: Reikna mól</h4>
          <p>mól = M × L</p>
          <p>
            mól = {formatDecimal(problem.given.molarity)} M ×{' '}
            {formatDecimal(problem.given.volumeInML / 1000, 3)} L
          </p>
          <p>mól = {moles} mól</p>
        </div>
        <div className="solution-step">
          <h4>Skref 3: Reikna massa</h4>
          <p>massi = mól × mólmassi</p>
          <p>
            massi = {moles} mól × {formatDecimal(problem.given.molarMass)} g/mól
          </p>
          <p>massi = {formatAnswer(problem.answer)} g</p>
        </div>
        <div className="solution-step">
          <h4>Svar: {formatAnswer(problem.answer)} g</h4>
        </div>
      </div>
    );
  }

  return null;
}
