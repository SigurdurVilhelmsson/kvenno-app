import { useMemo } from 'react';

import { ParticleSimulation, PARTICLE_TYPES, PHYSICS_PRESETS } from '@shared/components';

import type { GasLawQuestion, Variable } from '../types';
import { R } from '../types';

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
const V_MAX = 50; // L
const P_MAX = 10; // atm

/** Map volume to container width (200..400 px) */
function volumeToWidth(v: number): number {
  const clamped = Math.min(Math.max(v, 0.1), V_MAX);
  return 200 + (clamped / V_MAX) * 200;
}

/** Map moles to particle count (10..80) */
function molesToParticles(n: number): number {
  return Math.min(Math.max(Math.floor(n * 30), 10), 80);
}

/** Map pressure to gauge needle angle (0 atm = -90deg left, P_MAX = +90deg right) */
function pressureToAngle(p: number): number {
  const clamped = Math.min(Math.max(p, 0), P_MAX);
  return -90 + (clamped / P_MAX) * 180;
}

/** Get effective values for all four variables, filling in the unknown with the answer */
function getEffectiveValues(question: GasLawQuestion, useAnswer: boolean, correctAnswer?: number) {
  const g = question.given;

  let P = g.P?.value ?? 0;
  let V = g.V?.value ?? 0;
  let T = g.T?.value ?? 0;
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
}: {
  pressure: number;
  animateTransition: boolean;
}) {
  const angle = pressureToAngle(pressure);
  const transitionStyle = animateTransition
    ? 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
    : 'none';

  // Tick marks at 0, 2, 4, 6, 8, 10 atm
  const ticks = [0, 2, 4, 6, 8, 10];

  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-warm-300 font-semibold mb-1">{LABELS.P}</span>
      <svg width="100" height="65" viewBox="0 0 100 65" aria-label="Þrýstingsmælir">
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

        {/* Tick marks and labels */}
        {ticks.map((val) => {
          const tickAngle = -90 + (val / P_MAX) * 180;
          const rad = (tickAngle * Math.PI) / 180;
          const cx = 50;
          const cy = 55;
          const r = 40;
          const innerR = r - 6;
          const labelR = r + 8;
          const x1 = cx + innerR * Math.cos(rad);
          const y1 = cy + innerR * Math.sin(rad);
          const x2 = cx + r * Math.cos(rad);
          const y2 = cy + r * Math.sin(rad);
          const lx = cx + labelR * Math.cos(rad);
          const ly = cy + labelR * Math.sin(rad);
          return (
            <g key={val}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="1" />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#94a3b8"
                fontSize="6"
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
            transformOrigin: '50px 55px',
            transition: transitionStyle,
          }}
        >
          <line
            x1={50}
            y1={55}
            x2={50}
            y2={20}
            stroke="#f36b22"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* Center dot */}
        <circle cx={50} cy={55} r={3} fill="#f36b22" />
      </svg>
      <span className="text-xs text-warm-300 font-mono mt-0.5">{pressure.toFixed(1)} atm</span>
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
}: {
  P: number;
  V: number;
  T: number;
  n: number;
  findVar: Variable;
  showAnswer: boolean;
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
        {isTarget && !showAnswer ? '?' : value.toFixed(2)}{' '}
        <span className="text-[10px]">{unit}</span>
      </span>
    );
  }

  return (
    <div className="bg-slate-800/60 rounded-lg px-3 py-2 text-xs font-mono">
      <div className="text-warm-400 font-bold text-center mb-1">PV = nRT</div>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5">
        {varSpan('P', P, 'atm', 'P')}
        {varSpan('V', V, 'L', 'V')}
        {varSpan('n', n, 'mol', 'n')}
        {varSpan('T', T, 'K', 'T')}
      </div>
      <div className="text-center text-warm-500 mt-1 text-[10px]">R = {R} L·atm/(mol·K)</div>
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
  const containerWidth = useMemo(() => volumeToWidth(values.V), [values.V]);
  const containerHeight = 240;

  // Particle count keyed to moles
  const numParticles = useMemo(() => molesToParticles(values.n), [values.n]);

  // Temperature for particle speed
  const temperature = values.T;

  // Transition duration for animated changes
  const animateTransition = showAnswer;

  return (
    <div className="bg-warm-900 rounded-lg p-4">
      {/* Simulator layout: container + gauge side by side */}
      <div className="flex items-center gap-3 justify-center">
        {/* Gas container with resizable width */}
        <div
          className="relative rounded border-2 border-slate-600 overflow-hidden"
          style={{
            width: containerWidth,
            height: containerHeight,
            transition: animateTransition ? 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
          }}
        >
          <ParticleSimulation
            container={{
              width: containerWidth,
              height: containerHeight,
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
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-slate-900/70 px-2 py-0.5 rounded text-[10px] text-warm-300 font-mono pointer-events-none">
            V = {values.V.toFixed(1)} L
          </div>

          {/* Temperature label overlay */}
          <div className="absolute top-1 right-1 bg-slate-900/70 px-1.5 py-0.5 rounded text-[10px] text-warm-300 font-mono pointer-events-none">
            T = {Math.round(temperature)} K
          </div>

          {/* Particle count overlay */}
          <div className="absolute top-1 left-1 bg-slate-900/70 px-1.5 py-0.5 rounded text-[10px] text-warm-300 font-mono pointer-events-none">
            n ~ {numParticles} agnir
          </div>
        </div>

        {/* Pressure gauge */}
        <PressureGauge pressure={values.P} animateTransition={animateTransition} />
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
