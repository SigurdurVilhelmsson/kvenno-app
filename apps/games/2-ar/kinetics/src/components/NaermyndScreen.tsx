/**
 * Nærmynd — half-life at first order against zero order. Nothing is graded or stored.
 *
 * Built on the particle-view template (docs/particle-view-template.md): the counts come
 * from `engine/naermynd.ts`, which reads the same rate-law functions the concentration graph
 * draws. Each particle has a fixed place and a fixed turn to react, so a time always draws
 * the same picture, and the particles that have reacted are left as faint outlines.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { focusTarget, formatDecimal, revealTop } from '@shared/utils';

import { STEPS } from '../data/naermynd-steps';
import {
  PARTICLES,
  T_HALF,
  T_MAX,
  firstOrderAt,
  zeroOrderAt,
  type FlaskState,
} from '../engine/naermynd';

const W = 160;
const H = 150;
const COLS = 8;

/** Slot positions in the flask. */
const SLOTS = Array.from({ length: PARTICLES }, (_, i) => {
  const r = Math.floor(i / COLS);
  const c = i % COLS;
  return { x: 22 + c * 16.5 + (r % 2 ? 4 : -2), y: 52 + r * 22 };
});

/**
 * The order in which the slots lose their particle: a fixed shuffle, so the particles that
 * react are scattered through the flask rather than taken row by row.
 */
const TURN = Array.from({ length: PARTICLES }, (_, i) => (i * 13 + 5) % PARTICLES);

const M = (c: number) => `${formatDecimal(c, 3)} M`;
const h = (t: number) => `${formatDecimal(t, 1)} klst.`;

function Flask({
  state,
  label,
  fill,
  name,
}: {
  state: FlaskState;
  label: string;
  fill: string;
  name: string;
}) {
  // Slot TURN[k] reacts k-th; with `count` left, the last `count` turns still hold particles.
  const gone = new Set(TURN.slice(0, PARTICLES - state.count));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={label}>
      <path
        d={`M8 32 V${H - 18} Q8 ${H - 6} 20 ${H - 6} H${W - 20} Q${W - 8} ${H - 6} ${W - 8} ${H - 18} V32`}
        fill="#f0fdfa"
        stroke="#64748b"
        strokeWidth="2"
      />
      <text x={W / 2} y={20} textAnchor="middle" fontSize={11} fontWeight={700} fill="#134e4a">
        {name}
      </text>
      {SLOTS.map((p, i) =>
        gone.has(i) ? (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={5}
            fill="none"
            stroke="#cbd5e1"
            strokeDasharray="2 2"
          />
        ) : (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={6.5}
            fill={fill}
            stroke="#1f2937"
            strokeOpacity={0.3}
          />
        )
      )}
    </svg>
  );
}

interface NaermyndScreenProps {
  onBack: () => void;
}

export function NaermyndScreen({ onBack }: NaermyndScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [freeT, setFreeT] = useState(9);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const stepTopRef = useRef<HTMLDivElement>(null);
  const firstStep = useRef(true);

  useLayoutEffect(() => {
    focusTarget(headingRef.current);
  }, []);

  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    revealTop(stepTopRef.current, { anyWidth: true });
    focusTarget(stepTopRef.current?.querySelector('h3') ?? null);
  }, [stepIndex]);

  const step = STEPS[stepIndex];
  const t = step.t ?? freeT;
  const first = firstOrderAt(t);
  const zero = zeroOrderAt(t);

  const flasks = [
    { key: 'first', name: 'Fyrsta stig: H₂O₂', fill: '#0d9488', state: first },
    { key: 'zero', name: 'Núllta stig (hugsað)', fill: '#d97706', state: zero },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-3 sm:p-4 md:p-8 phone:p-3">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-4 shadow-2xl sm:p-6 md:p-8 phone:p-3">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="min-w-0 text-2xl font-bold text-warm-800 phone:text-base"
          >
            Nærmynd: helmingunartími
          </h2>
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 text-sm text-warm-600 hover:text-warm-800 pointer-coarse:py-3 pointer-coarse:-my-3"
          >
            ← Til baka
          </button>
        </div>

        <nav aria-label="Skref" className="mb-4 phone:mb-3">
          <ol className="flex flex-wrap gap-1.5">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <button
                  type="button"
                  onClick={() => setStepIndex(i)}
                  aria-current={i === stepIndex ? 'step' : undefined}
                  title={s.title}
                  className={`h-9 min-w-9 rounded-lg border-2 px-2 text-sm font-semibold transition-colors pointer-coarse:min-h-11 ${
                    i === stepIndex
                      ? 'border-teal-700 bg-teal-700 text-white'
                      : 'border-teal-200 bg-white text-teal-800 hover:bg-teal-50'
                  }`}
                >
                  <span aria-hidden="true">{i + 1}</span>
                  <span className="sr-only">
                    {i + 1}. {s.title}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div ref={stepTopRef} className="scroll-mt-4">
          <h3 tabIndex={-1} className="mb-2 text-xl font-bold text-warm-800 phone:text-lg">
            {stepIndex + 1}. {step.title}
          </h3>
          <p className="mb-3 rounded-xl border border-teal-200 bg-teal-50 p-3 text-center font-semibold text-teal-900">
            t = {h(t)}
            <span className="font-normal text-teal-800">
              {' '}
              ({formatDecimal(t / T_HALF, 2)} × fyrsti helmingunartími)
            </span>
          </p>
        </div>

        {step.t === null && (
          <div className="mb-3 rounded-xl border-2 border-teal-200 bg-teal-50 p-3">
            <label htmlFor="naermynd-t" className="mb-1 block text-sm font-semibold text-teal-900">
              Tími: {h(t)}
            </label>
            <input
              id="naermynd-t"
              type="range"
              min={0}
              max={T_MAX}
              step={0.5}
              value={freeT}
              onChange={(e) => setFreeT(Number(e.target.value))}
              aria-valuetext={h(t)}
              className="w-full"
            />
          </div>
        )}

        <div className="mx-auto mb-3 grid max-w-xl grid-cols-2 gap-3 phone:gap-2">
          {flasks.map((f) => (
            <figure key={f.key} className="rounded-xl border border-warm-200 p-2">
              <Flask
                state={f.state}
                fill={f.fill}
                name={f.name}
                label={`${f.name}: ${f.state.count} af ${PARTICLES} ögnum eftir.`}
              />
              <figcaption aria-live="polite" className="mt-1 text-sm text-warm-800">
                <div>
                  [A] = <span className="font-mono">{M(f.state.concentration)}</span>
                </div>
                <div className="text-warm-600">
                  {f.state.count > 0 ? `Helmingast á ${h(f.state.halfLifeNow)}` : 'Ekkert eftir'}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mb-3 text-xs text-warm-500">
          Hver ögn stendur fyrir 1/32 af upphafsstyrknum; agnir sem hafa hvarfast eru strikaðar.
          Núllta stigs hvarfið er hugsað til samanburðar, með sama upphafsstyrk og sama fyrsta
          helmingunartíma.
        </p>

        <div className="mb-4 space-y-3 leading-relaxed text-warm-800">{step.body}</div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
            className="min-w-24 flex-1 rounded-xl border-2 border-teal-300 px-4 py-3 font-semibold text-teal-800 hover:bg-teal-50 disabled:opacity-40"
          >
            ← Fyrra skref
          </button>
          {stepIndex < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStepIndex((i) => i + 1)}
              className="min-w-24 flex-1 rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800"
            >
              Næsta skref →
            </button>
          ) : (
            <button
              type="button"
              onClick={onBack}
              className="min-w-24 flex-1 rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800"
            >
              Til baka í valmynd
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
