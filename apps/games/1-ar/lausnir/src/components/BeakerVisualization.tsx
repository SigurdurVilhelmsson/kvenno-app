import { Problem } from '../types';
import { Beaker } from './Beaker';

interface BeakerVisualizationProps {
  problem: Problem | null;
  animate: boolean;
}

export function BeakerVisualization({ problem, animate }: BeakerVisualizationProps) {
  if (!problem) return null;

  if (problem.type === 'dilution') {
    return (
      <div
        className="beaker-container"
        role="img"
        aria-label={`Útþynning: ${problem.given.M1} M lausn þynnt niður í ${problem.answer} M`}
      >
        <Beaker
          volume={problem.given.V1}
          concentration={problem.given.M1}
          label={`M₁ = ${problem.given.M1} M\nV₁ = ${problem.given.V1} mL`}
          color="#f97316"
        />
        <div className="text-4xl self-center">→</div>
        <Beaker
          volume={problem.given.V2}
          concentration={problem.answer}
          label={`M₂ = ${problem.answer.toFixed(3)} M\nV₂ = ${problem.given.V2} mL`}
          color="#f97316"
          animate={animate}
          animationType="pour"
        />
      </div>
    );
  } else if (
    problem.type === 'molarity' ||
    problem.type === 'molarityFromMass' ||
    problem.type === 'massFromMolarity'
  ) {
    return (
      <div
        className="beaker-container"
        role="img"
        aria-label={`Mólstyrkur: ${problem.answer.toFixed(3)} M lausn`}
      >
        <Beaker
          volume={problem.given.volumeInML || problem.given.volume * 1000}
          concentration={problem.answer}
          label={`M = ${problem.answer.toFixed(3)} M`}
          color="#3b82f6"
          animate={animate}
          animationType="dissolve"
        />
      </div>
    );
  } else if (problem.type === 'mixing') {
    return (
      <div
        className="beaker-container"
        role="img"
        aria-label={`Blöndun tveggja lausna: ${problem.answer.toFixed(3)} M`}
      >
        <Beaker
          volume={problem.given.V1}
          concentration={problem.given.M1}
          label={`M₁ = ${problem.given.M1} M\nV₁ = ${problem.given.V1} mL`}
          color="#3b82f6"
        />
        <div className="text-2xl self-center">+</div>
        <Beaker
          volume={problem.given.V2}
          concentration={problem.given.M2}
          label={`M₂ = ${problem.given.M2} M\nV₂ = ${problem.given.V2} mL`}
          color="#ec4899"
        />
        <div className="text-4xl self-center">→</div>
        <Beaker
          volume={problem.given.V1 + problem.given.V2}
          concentration={problem.answer}
          label={`M = ${problem.answer.toFixed(3)} M\nV = ${problem.given.V1 + problem.given.V2} mL`}
          color="#8b5cf6"
          animate={animate}
          animationType="mix"
        />
      </div>
    );
  }

  return null;
}
