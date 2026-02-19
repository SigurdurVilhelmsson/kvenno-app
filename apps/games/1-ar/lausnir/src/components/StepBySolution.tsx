import { Problem } from '../types';

interface StepBySolutionProps {
  problem: Problem | null;
}

export function StepBySolution({ problem }: StepBySolutionProps) {
  if (!problem) return null;

  if (problem.type === 'dilution') {
    return (
      <div className="mt-4 space-y-2">
        <h3 className="text-lg font-bold text-gray-800">Lausn með skrefum:</h3>
        <div className="solution-step">
          <h4>Gefið:</h4>
          <p>M₁ = {problem.given.M1} M</p>
          <p>V₁ = {problem.given.V1} mL</p>
          <p>V₂ = {problem.given.V2} mL</p>
        </div>
        <div className="solution-step">
          <h4>Skref 1: Velja formúlu</h4>
          <p>M₁V₁ = M₂V₂ (útþynningarformúla)</p>
        </div>
        <div className="solution-step">
          <h4>Skref 2: Setja inn gildi</h4>
          <p>
            ({problem.given.M1} M)({problem.given.V1} mL) = M₂({problem.given.V2} mL)
          </p>
          <p>
            {problem.given.M1 * problem.given.V1} = M₂({problem.given.V2})
          </p>
        </div>
        <div className="solution-step">
          <h4>Skref 3: Einangra M₂</h4>
          <p>
            M₂ = {problem.given.M1 * problem.given.V1} ÷ {problem.given.V2}
          </p>
          <p>M₂ = {problem.answer.toFixed(3)} M</p>
        </div>
        <div className="solution-step">
          <h4>Svar: {problem.answer.toFixed(3)} M</h4>
        </div>
      </div>
    );
  } else if (problem.type === 'molarity') {
    return (
      <div className="mt-4 space-y-2">
        <h3 className="text-lg font-bold text-gray-800">Lausn með skrefum:</h3>
        <div className="solution-step">
          <h4>Gefið:</h4>
          <p>mól = {problem.given.moles} mol</p>
          <p>rúmmál = {problem.given.volume} L</p>
        </div>
        <div className="solution-step">
          <h4>Skref 1: Velja formúlu</h4>
          <p>M = mól ÷ L</p>
        </div>
        <div className="solution-step">
          <h4>Skref 2: Setja inn gildi</h4>
          <p>
            M = {problem.given.moles} mol ÷ {problem.given.volume} L
          </p>
          <p>M = {problem.answer.toFixed(3)} M</p>
        </div>
        <div className="solution-step">
          <h4>Svar: {problem.answer.toFixed(3)} M</h4>
        </div>
      </div>
    );
  } else if (problem.type === 'molarityFromMass') {
    return (
      <div className="mt-4 space-y-2">
        <h3 className="text-lg font-bold text-gray-800">Lausn með skrefum:</h3>
        <div className="solution-step">
          <h4>Gefið:</h4>
          <p>
            massi = {problem.given.massInGrams} g {problem.chemical?.name || ''}
          </p>
          <p>mólmassi = {problem.given.molarMass} g/mol</p>
          <p>rúmmál = {problem.given.volumeInML} mL</p>
        </div>
        <div className="solution-step">
          <h4>Skref 1: Breyta mL í L</h4>
          <p>
            {problem.given.volumeInML} mL = {problem.given.volumeInML} ÷ 1000 ={' '}
            {(problem.given.volumeInML / 1000).toFixed(3)} L
          </p>
        </div>
        <div className="solution-step">
          <h4>Skref 2: Reikna mól</h4>
          <p>mól = massi ÷ mólmassi</p>
          <p>
            mól = {problem.given.massInGrams} g ÷ {problem.given.molarMass} g/mol
          </p>
          <p>
            mól = {(problem.given.massInGrams / problem.given.molarMass).toFixed(3)}{' '}
            mol
          </p>
        </div>
        <div className="solution-step">
          <h4>Skref 3: Reikna mólstyrk</h4>
          <p>M = mól ÷ lítrar</p>
          <p>
            M = {(problem.given.massInGrams / problem.given.molarMass).toFixed(3)}{' '}
            mol ÷ {(problem.given.volumeInML / 1000).toFixed(3)} L
          </p>
          <p>M = {problem.answer.toFixed(3)} M</p>
        </div>
        <div className="solution-step">
          <h4>Svar: {problem.answer.toFixed(3)} M</h4>
        </div>
      </div>
    );
  } else if (problem.type === 'mixing') {
    const moles1 = ((problem.given.M1 * problem.given.V1) / 1000).toFixed(3);
    const moles2 = ((problem.given.M2 * problem.given.V2) / 1000).toFixed(3);
    const totalMoles = (parseFloat(moles1) + parseFloat(moles2)).toFixed(3);
    const totalVolume = ((problem.given.V1 + problem.given.V2) / 1000).toFixed(3);

    return (
      <div className="mt-4 space-y-2">
        <h3 className="text-lg font-bold text-gray-800">Lausn með skrefum:</h3>
        <div className="solution-step">
          <h4>Gefið:</h4>
          <p>
            Lausn 1: M₁ = {problem.given.M1} M, V₁ = {problem.given.V1} mL
          </p>
          <p>
            Lausn 2: M₂ = {problem.given.M2} M, V₂ = {problem.given.V2} mL
          </p>
        </div>
        <div className="solution-step">
          <h4>Skref 1: Reikna heildarmól</h4>
          <p>
            mól₁ = M₁ × V₁ = {problem.given.M1} M ×{' '}
            {(problem.given.V1 / 1000).toFixed(3)} L = {moles1} mol
          </p>
          <p>
            mól₂ = M₂ × V₂ = {problem.given.M2} M ×{' '}
            {(problem.given.V2 / 1000).toFixed(3)} L = {moles2} mol
          </p>
          <p>
            mól_alls = {moles1} + {moles2} = {totalMoles} mol
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
            M_lokal = {totalMoles} mol ÷ {totalVolume} L
          </p>
          <p>M_lokal = {problem.answer.toFixed(3)} M</p>
        </div>
        <div className="solution-step">
          <h4>Svar: {problem.answer.toFixed(3)} M</h4>
        </div>
      </div>
    );
  } else if (problem.type === 'massFromMolarity') {
    const moles = ((problem.given.molarity * problem.given.volumeInML) / 1000).toFixed(
      3
    );
    return (
      <div className="mt-4 space-y-2">
        <h3 className="text-lg font-bold text-gray-800">Lausn með skrefum:</h3>
        <div className="solution-step">
          <h4>Gefið:</h4>
          <p>M = {problem.given.molarity} M</p>
          <p>V = {problem.given.volumeInML} mL</p>
          <p>mólmassi = {problem.given.molarMass} g/mol</p>
        </div>
        <div className="solution-step">
          <h4>Skref 1: Breyta mL í L</h4>
          <p>
            {problem.given.volumeInML} mL ={' '}
            {(problem.given.volumeInML / 1000).toFixed(3)} L
          </p>
        </div>
        <div className="solution-step">
          <h4>Skref 2: Reikna mól</h4>
          <p>mól = M × L</p>
          <p>
            mól = {problem.given.molarity} M ×{' '}
            {(problem.given.volumeInML / 1000).toFixed(3)} L
          </p>
          <p>mól = {moles} mol</p>
        </div>
        <div className="solution-step">
          <h4>Skref 3: Reikna massa</h4>
          <p>massi = mól × mólmassi</p>
          <p>
            massi = {moles} mol × {problem.given.molarMass} g/mol
          </p>
          <p>massi = {problem.answer.toFixed(1)} g</p>
        </div>
        <div className="solution-step">
          <h4>Svar: {problem.answer.toFixed(1)} g</h4>
        </div>
      </div>
    );
  }

  return null;
}
