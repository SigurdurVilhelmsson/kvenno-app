import { RatioFraction } from './RatioCard';
import { UnitsDisplay } from './UnitsDisplay';
import type { StepResult } from '../engine/units';

interface SolveTraceProps {
  start: StepResult['before'];
  steps: StepResult[];
  /** How many steps to show. The parent reveals them one at a time. */
  revealed: number;
  /** Index of the step that broke the chain, if any. */
  failedStep?: number;
  /** The starting measurement as written, trailing zeros included. */
  startLabel?: string;
}

/**
 * The chain worked one step at a time, with each step's cancellations struck out.
 *
 * A failing step is rendered like any other — the nonsense unit it produces is
 * shown rather than hidden behind an error. Seeing `g Mg·g Mg / mol Mg` on screen
 * is what makes an inverted ratio obvious; being told "wrong" does not.
 */
export function SolveTrace({ start, steps, revealed, failedStep, startLabel }: SolveTraceProps) {
  return (
    <ol className="space-y-3" aria-live="polite">
      <li className="rounded-lg bg-white p-3 shadow-sm">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-warm-500">
          Byrjun
        </span>
        <UnitsDisplay quantity={start} valueLabel={startLabel} className="text-lg" />
      </li>

      {steps.slice(0, revealed).map((step, index) => {
        const broke = index === failedStep;
        return (
          <li
            key={`${step.ratio.equivalence.id}-${index}`}
            className={`fade-in rounded-lg p-3 shadow-sm ${
              broke ? 'border-2 border-red-400 bg-red-50' : 'bg-white'
            }`}
          >
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-warm-500">
              Skref {index + 1}
            </span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-base">
              <UnitsDisplay quantity={step.before} marks={step.marks.quantity} />
              <span aria-hidden="true" className="text-warm-400">
                ×
              </span>
              <RatioFraction ratio={step.ratio} marks={step.marks.ratio} />
              <span aria-hidden="true" className="text-warm-400">
                =
              </span>
              <UnitsDisplay
                quantity={step.after}
                className={broke ? 'text-red-700' : 'text-warm-900'}
              />
            </div>
            <p className="mt-2 text-sm text-warm-600">
              {step.cancelCount > 0
                ? `${step.cancelCount === 1 ? 'Ein eining styttist' : `${step.cancelCount} einingar styttast`} út.`
                : 'Ekkert styttist út — engin eining á sér samsvörun hinum megin við strikið.'}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
