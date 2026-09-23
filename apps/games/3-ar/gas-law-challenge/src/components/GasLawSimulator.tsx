import { useMemo, useRef } from 'react';

import { ParticleSimulation, PARTICLE_TYPES, PHYSICS_PRESETS } from '@shared/components';
import { useContainerWidth } from '@shared/components/ResponsiveContainer';
import { formatDecimal } from '@shared/utils';

import type { GasLawQuestion, Variable } from '../types';
import { R } from '../types';
import { unitFor } from '../utils/gas-calculations';
import {
  GAUGE_CX,
  GAUGE_CY,
  GAUGE_HEIGHT,
  GAUGE_LABEL_RADIUS,
  GAUGE_RADIUS,
  GAUGE_WIDTH,
  gaugePoint,
  pressureToAngle,
  simulatorLayout,
} from '../utils/simulator-layout';

// ── Types ──────────────────────────────────────────────────────────────────

interface GasLawSimulatorProps {
  question: GasLawQuestion;
  isRunning: boolean;
  /** When true, animate the visualization to the correct answer state */
  showAnswer?: boolean;
  /** The correct answer value */
  correctAnswer?: number;
}

// ── Icelandic labels ───────────────────────────────────────────────────────

const LABELS: Record<Variable, string> = {
  P: 'Þrýstingur',
  V: 'Rúmmál',
  T: 'Hitastig',
  n: 'Mólfjöldi',
};

// ── Helpers ────────────────────────────────────────────────────────────────

/** Max ranges for scaling the visual elements */
const V_MAX = 100; // L — clamped for visual scaling

/** Map volume to container width (200..400 px) */
function volumeToWidth(v: number): number {
  const clamped = Math.min(Math.max(v, 0.1), V_MAX);
  return 200 + (clamped / V_MAX) * 200;
}

/** Map moles to particle count (10..80) */
function molesToParticles(n: number): number {
  return Math.min(Math.max(Math.floor(n * 30), 10), 80);
}

/** Get effective values for all four variables, filling in the unknown with the answer */
function getEffectiveValues(question: GasLawQuestion, useAnswer: boolean, correctAnswer?: number) {
  const g = question.given;

  let P = g.P?.value ?? 0;
  let V = g.V?.value ?? 0;
  let T = g.T?.value ?? 300;
  let n = g.n?.value ?? 0;

  // Fill in the unknown variable
  const answerValue = useAnswer && correctAnswer != null ? correctAnswer : question.answer;

  if (question.find === 'P') P = answerValue;
  if (question.find === 'V') V = answerValue;
  if (question.find === 'T') T = answerValue;
  if (question.find === 'n') n = answerValue;

  return { P, V, T, n };
}

// ── Pressure Gauge (SVG) ───────────────────────────────────────────────────

function PressureGauge({
  pressure,
  animateTransition,
  scale,
}: {
  pressure: number;
  animateTransition: boolean;
  /** Drawing scale; above 1 the scale labels are also set larger so they stay readable. */
  scale: number;
}) {
  const angle = pressureToAngle(pressure);
  const transitionStyle = animateTransition
    ? 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
    : 'none';
  const labelFontSize = scale > 1 ? 8.5 : 6;

  // Tick marks at 0, 2, 4, 6, 8, 10 atm
  const ticks = [0, 2, 4, 6, 8, 10];

  return (
    <div className="flex flex-col items-center shrink-0">
      <span className="text-xs text-warm-300 font-semibold mb-1">{LABELS.P}</span>
      <svg
        width={GAUGE_WIDTH * scale}
        height={GAUGE_HEIGHT * scale}
        viewBox={`0 0 ${GAUGE_WIDTH} ${GAUGE_HEIGHT}`}
        aria-label="Þrýstingsmælir"
      >
        {/* Background arc */}
        <path
          d="M 10 55 A 40 40 0 0 1 90 55"
          fill="none"
          stroke="#334155"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Colored arc: green->yellow->red */}
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        <path
          d="M 10 55 A 40 40 0 0 1 90 55"
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Tick marks and labels, on the needle's own sweep (0 atm left, P_MAX right) */}
        {ticks.map((val) => {
          const inner = gaugePoint(val, GAUGE_RADIUS - 6);
          const outer = gaugePoint(val, GAUGE_RADIUS);
          const label = gaugePoint(val, GAUGE_LABEL_RADIUS);
          return (
            <g key={val}>
              <line
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="#94a3b8"
                strokeWidth="1"
              />
              <text
                x={label.x}
                y={label.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#94a3b8"
                fontSize={labelFontSize}
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Needle */}
        <g
          style={{
            transform: `rotate(${angle}deg)`,
            transformOrigin: `${GAUGE_CX}px ${GAUGE_CY}px`,
            transition: transitionStyle,
          }}
        >
          <line
            x1={GAUGE_CX}
            y1={GAUGE_CY}
            x2={GAUGE_CX}
            y2={20}
            stroke="#f36b22"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* Center dot */}
        <circle cx={GAUGE_CX} cy={GAUGE_CY} r={3} fill="#f36b22" />
      </svg>
      <span className="text-xs text-warm-300 font-mono mt-0.5">
        {formatDecimal(pressure, 1)} atm
      </span>
    </div>
  );
}

// ── Equation Display ───────────────────────────────────────────────────────

function EquationDisplay({
  P,
  V,
  T,
  n,
  findVar,
  showAnswer,
  units,
}: {
  P: number;
  V: number;
  T: number;
  n: number;
  findVar: Variable;
  showAnswer: boolean;
  units: Record<Variable, string>;
}) {
  const highlightClass = 'text-orange-400 font-bold';
  const normalClass = 'text-warm-300';
  const answerClass = showAnswer ? 'text-green-400 font-bold' : 'text-warm-500 font-bold';

  function varSpan(label: string, value: number, unit: string, variable: Variable) {
    const isTarget = variable === findVar;
    return (
      <span className={isTarget ? answerClass : normalClass}>
        <span className={isTarget ? highlightClass : 'font-semibold'}>{label}</span>
        {' = '}
        {isTarget && !showAnswer ? '?' : formatDecimal(value, 2)}{' '}
        <span className="text-[10px] pointer-coarse:text-xs">{unit}</span>
      </span>
    );
  }

  return (
    <div className="bg-slate-800/60 rounded-lg px-3 py-2 text-xs font-mono">
      <div className="text-warm-400 font-bold text-center mb-1">PV = nRT</div>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5">
        {varSpan('P', P, units.P, 'P')}
        {varSpan('V', V, units.V, 'V')}
        {varSpan('n', n, units.n, 'n')}
        {varSpan('T', T, units.T, 'T')}
      </div>
      <div className="text-center text-warm-500 mt-1 text-[10px] pointer-coarse:text-xs">
        R = {formatDecimal(R)} L·atm/(mol·K)
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export function GasLawSimulator({
  question,
  isRunning,
  showAnswer = false,
  correctAnswer,
}: GasLawSimulatorProps) {
  // When showing the answer, use the correct answer for visualisation;
  // otherwise show the "given" state (unknown variable uses the question answer
  // so the simulation shows a realistic state from the start).
  const values = useMemo(
    () => getEffectiveValues(question, showAnswer, correctAnswer),
    [question, showAnswer, correctAnswer]
  );

  // Container dimensions keyed to volume
  const units = useMemo(
    () => ({
      P: unitFor(question, 'P'),
      V: unitFor(question, 'V'),
      T: unitFor(question, 'T'),
      n: unitFor(question, 'n'),
    }),
    [question]
  );
  const containerWidth = useMemo(() => volumeToWidth(values.V), [values.V]);

  // The row is measured so the container never grows past the space it has: on a phone it
  // is capped to the row and the gauge moves underneath; on desktop nothing changes until
  // the volume asks for more width than the column holds (it used to overflow there).
  const rowRef = useRef<HTMLDivElement>(null);
  const rowWidth = useContainerWidth(rowRef);
  const layout = simulatorLayout(rowWidth, containerWidth);
  // The physics runs in the box's content area (inside its 2px border), 1:1 with the canvas.
  const worldWidth = Math.max(layout.width - 4, 1);
  const worldHeight = layout.height - 4;

  // Particle count keyed to moles
  const numParticles = useMemo(() => molesToParticles(values.n), [values.n]);

  // Temperature for particle speed
  const temperature = values.T;

  // Transition duration for animated changes
  const animateTransition = showAnswer;

  return (
    <div className="bg-warm-900 rounded-lg p-3 sm:p-4">
      {/* Simulator layout: container + gauge side by side, gauge underneath on a narrow row */}
      <div
        ref={rowRef}
        className={`flex items-center gap-3 justify-center ${layout.stacked ? 'flex-col' : ''}`}
      >
        {/* Gas container with resizable width */}
        <div
          className="relative rounded border-2 border-slate-600 overflow-hidden shrink-0"
          style={{
            width: layout.width,
            height: layout.height,
            transition: animateTransition ? 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
          }}
        >
          <ParticleSimulation
            container={{
              width: worldWidth,
              height: worldHeight,
              backgroundColor: '#0f172a',
            }}
            particleTypes={[PARTICLE_TYPES.reactantA]}
            particles={[{ typeId: 'A', count: numParticles }]}
            physics={PHYSICS_PRESETS.idealGas}
            temperature={temperature}
            running={isRunning}
            ariaLabel="Hermun á gasögnum sem sýnir hegðun lofttegunda"
          />

          {/* Volume label overlay */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/70 px-2 py-0.5 rounded text-[10px] pointer-coarse:text-xs text-warm-300 font-mono pointer-events-none">
            V = {formatDecimal(values.V, 1)} {units.V}
          </div>

          {/* Temperature label overlay */}
          <div className="absolute top-1 right-1 bg-slate-900/70 px-1.5 py-0.5 rounded text-[10px] pointer-coarse:text-xs text-warm-300 font-mono pointer-events-none">
            T = {Math.round(temperature)} K
          </div>

          {/* Particle count overlay */}
          <div className="absolute top-1 left-1 bg-slate-900/70 px-1.5 py-0.5 rounded text-[10px] pointer-coarse:text-xs text-warm-300 font-mono pointer-events-none">
            {numParticles} agnir
          </div>
        </div>

        {/* Pressure gauge */}
        <PressureGauge
          pressure={values.P}
          animateTransition={animateTransition}
          scale={layout.gaugeScale}
        />
      </div>

      {/* Equation display */}
      <div className="mt-3">
        <EquationDisplay
          P={values.P}
          V={values.V}
          T={values.T}
          n={values.n}
          findVar={question.find}
          showAnswer={showAnswer}
          units={units}
        />
      </div>

      {/* Legend */}
      <p className="text-xs text-warm-500 mt-2 text-center">
        Breidd íláts = rúmmál (V) · Hraði agna = hitastig (T) · Fjöldi agna = mólfjöldi (n) · Mælir
        = þrýstingur (P)
      </p>
    </div>
  );
}
