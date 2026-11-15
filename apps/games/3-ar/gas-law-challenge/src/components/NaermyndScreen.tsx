/**
 * Nærmynd — the molecules behind PV = nRT. Nothing is graded or stored.
 *
 * One cylinder with a stimpill, four scenes (Boyle, Charles with the line to
 * absolute zero, Gay-Lussac, Avogadro), each holding two quantities fixed while
 * the student moves a third. Built on the particle-view template
 * (docs/particle-view-template.md): every number from `engine/naermynd.ts`, the
 * molecules on a fixed scale that the screen states, scenes as data, and a
 * still picture for reduced motion. Decision 94, reopened 2026-11-15.
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { Header } from '@shared/components';
import { focusTarget, formatDecimal, prefersReducedMotion, revealTop } from '@shared/utils';

import { STEPS } from '../data/naermynd-steps';
import {
  CONTROLS,
  FIXED,
  MOL_PER_PARTICLE,
  P_GAUGE_MAX,
  V_DRAW_MAX,
  celsius,
  kinetic,
  particleCount,
  stateAt,
  type GasState,
  type GasVariable,
  type SceneKind,
} from '../engine/naermynd';

const W = 240;
const H = 280;
const WALL_L = 40;
const WALL_R = 200;
const FLOOR = 262;
/** Drawn height of the cylinder at V_DRAW_MAX. */
const FULL = 236;
const R_DOT = 5;

const fmtP = (p: number) => formatDecimal(p, 2);
const fmtV = (v: number) => formatDecimal(v, 1);
const fmtN = (n: number) => formatDecimal(n, 2);

function seeded(seed: number) {
  let s = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b);
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) ^ (s >>> 16);
  s = s >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/** Positions are fractions of the gas space, so a moving stimpill carries them along. */
function makeDots(count: number): Dot[] {
  const rand = seeded(9173);
  return Array.from({ length: count }, () => {
    const a = rand() * Math.PI * 2;
    return { x: rand(), y: rand(), vx: Math.cos(a), vy: Math.sin(a) };
  });
}

function Cylinder({
  kind,
  state,
  still,
  label,
}: {
  kind: SceneKind;
  state: GasState;
  still: boolean;
  label: string;
}) {
  const count = particleCount(state.n);
  const dots = useRef<Dot[]>(makeDots(40));
  const [, setFrame] = useState(0);
  const { speed } = kinetic(state);
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const top = FLOOR - (state.V / V_DRAW_MAX) * FULL;
  const gasH = FLOOR - top;
  const gasHRef = useRef(gasH);
  gasHRef.current = gasH;

  useEffect(() => {
    if (still) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const width = WALL_R - WALL_L;
      // Pixels per second at 300 K, as fractions of each side of the gas space.
      const fx = (70 * speedRef.current * dt) / width;
      const fy = (70 * speedRef.current * dt) / Math.max(gasHRef.current, 1);
      for (const d of dots.current) {
        d.x += d.vx * fx;
        d.y += d.vy * fy;
        if (d.x < 0 || d.x > 1) {
          d.x = d.x < 0 ? -d.x : 2 - d.x;
          d.vx = -d.vx;
        }
        if (d.y < 0 || d.y > 1) {
          d.y = d.y < 0 ? -d.y : 2 - d.y;
          d.vy = -d.vy;
        }
      }
      setFrame((f) => f + 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [still]);

  const pad = R_DOT + 2;
  const innerW = WALL_R - WALL_L - 2 * pad;
  const innerH = Math.max(gasH - 2 * pad, 1);
  const locked = kind === 'gayLussac';
  const weighted = kind === 'charles' || kind === 'avogadro';

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mx-auto block h-auto w-full max-w-xs phone:max-w-[11rem]"
      role="img"
      aria-label={label}
      data-live
    >
      {/* Cylinder walls and floor */}
      <path
        d={`M${WALL_L} 12 V${FLOOR} H${WALL_R} V12`}
        fill="none"
        stroke="#475569"
        strokeWidth="4"
      />
      <rect x={WALL_L + 2} y={top} width={WALL_R - WALL_L - 4} height={gasH} fill="#eef2ff" />
      {/* Stimpill and rod */}
      <rect
        x={WALL_R / 2 + WALL_L / 2 - 4}
        y={Math.max(0, top - 60)}
        width="8"
        height={Math.min(60, top)}
        fill="#94a3b8"
      />
      <rect
        data-piston
        x={WALL_L + 2}
        y={top - 10}
        width={WALL_R - WALL_L - 4}
        height="10"
        rx="2"
        fill="#64748b"
        style={{ transition: still ? undefined : 'y 150ms linear' }}
      />
      {weighted && top - 34 > 0 && (
        <g>
          <rect
            x={(WALL_L + WALL_R) / 2 - 26}
            y={top - 34}
            width="52"
            height="22"
            rx="3"
            fill="#334155"
          />
          <text
            x={(WALL_L + WALL_R) / 2}
            y={top - 19}
            textAnchor="middle"
            fontSize="10"
            fill="#fff"
            fontWeight="700"
          >
            lóð
          </text>
        </g>
      )}
      {locked && (
        <g fill="#b91c1c">
          <rect x={WALL_L - 14} y={top - 8} width="16" height="6" rx="1" />
          <rect x={WALL_R - 2} y={top - 8} width="16" height="6" rx="1" />
        </g>
      )}
      {/* Molecules: the first `count` of a fixed set, so adding gas adds circles */}
      {dots.current.slice(0, count).map((d, i) => (
        <circle
          key={i}
          cx={WALL_L + pad + d.x * innerW}
          cy={top + pad + d.y * innerH}
          r={R_DOT}
          fill="#7c3aed"
          fillOpacity="0.85"
        />
      ))}
    </svg>
  );
}

/** Pressure gauge, 0 to P_GAUGE_MAX, which every scene stays under. */
function Gauge({ p }: { p: number }) {
  const frac = Math.min(p / P_GAUGE_MAX, 1);
  const angle = Math.PI * (1 - frac);
  const cx = 60;
  const cy = 58;
  const r = 44;
  const ticks = [0, 0.5, 1, 1.5, 2, 2.5];
  return (
    <svg viewBox="0 0 120 70" className="block w-full max-w-[9rem]" aria-hidden="true">
      <path
        d={`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="6"
      />
      {ticks.map((t) => {
        const a = Math.PI * (1 - t / P_GAUGE_MAX);
        return (
          <text
            key={t}
            x={cx + (r - 14) * Math.cos(a)}
            y={cy - (r - 14) * Math.sin(a) + 3}
            textAnchor="middle"
            fontSize="7"
            fill="#475569"
          >
            {formatDecimal(t, t % 1 ? 1 : 0)}
          </text>
        );
      })}
      <line
        x1={cx}
        y1={cy}
        x2={cx + (r - 4) * Math.cos(angle)}
        y2={cy - (r - 4) * Math.sin(angle)}
        stroke="#dc2626"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="3" fill="#1f2937" />
    </svg>
  );
}

/** Two factors of the kinetic model that multiply to P/P₀. */
function KineticBars({ state }: { state: GasState }) {
  const k = kinetic(state);
  const rows = [
    { key: 'hits', label: 'Árekstrar á stimpilinn á sekúndu', value: k.hits },
    { key: 'push', label: 'Högg hvers áreksturs', value: k.push },
    { key: 'p', label: 'Þrýstingur (margfeldið)', value: k.pressureRatio },
  ];
  const max = 2.5;
  return (
    <div className="rounded-xl border border-warm-200 p-3">
      <div className="mb-2 text-sm font-semibold text-warm-700">Miðað við upphafsstöðuna</div>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.key} className={r.key === 'p' ? 'border-t border-warm-200 pt-2' : ''}>
            <div className="flex justify-between text-xs text-warm-700">
              <span>{r.label}</span>
              <span className="font-semibold tabular-nums" data-kinetic={r.key}>
                × {formatDecimal(r.value, 2)}
              </span>
            </div>
            <div className="relative mt-0.5 h-2.5 rounded bg-warm-100">
              <div
                className="absolute inset-y-0 w-px bg-warm-500"
                style={{ left: `${100 / max}%` }}
              />
              <div
                className={`h-full rounded ${r.key === 'p' ? 'bg-red-600' : 'bg-purple-500'} transition-all duration-150 motion-reduce:transition-none`}
                style={{ width: `${(Math.min(r.value, max) / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-warm-500">
        Árekstrum fjölgar með fleiri ögnum, hraðari ögnum og minna rúmmáli; hvert högg verður
        fastara með hraðanum. Hraðinn fylgir √T.
      </p>
    </div>
  );
}

/** V against t in °C, with the line carried down to absolute zero. */
function AbsoluteZero({ state }: { state: GasState }) {
  const { min, max } = CONTROLS.charles;
  const tMin = -300;
  const tMax = 350;
  const gx = (t: number) => 28 + ((t - tMin) / (tMax - tMin)) * 200;
  const gy = (v: number) => 104 - (v / V_DRAW_MAX) * 90;
  const at = (k: number) => stateAt('charles', k).V;
  const zero = celsius(0);
  return (
    <figure className="rounded-xl border border-warm-200 p-3">
      <figcaption className="mb-1 text-sm font-semibold text-warm-700">
        Rúmmál á móti hitastigi í °C
      </figcaption>
      <svg
        viewBox="0 0 240 124"
        className="block w-full"
        role="img"
        aria-label={`Bein lína frá alkuli, −273,15 °C og 0 L, upp í ${fmtV(at(max))} L við ${formatDecimal(celsius(max), 0)} °C. Gasið er nú við ${formatDecimal(celsius(state.T), 0)} °C og ${fmtV(state.V)} L.`}
      >
        <line x1={gx(tMin)} y1={gy(0)} x2={gx(tMax)} y2={gy(0)} stroke="#94a3b8" />
        <line x1={gx(0)} y1={gy(0)} x2={gx(0)} y2={gy(V_DRAW_MAX)} stroke="#cbd5e1" />
        <line
          x1={gx(zero)}
          y1={gy(0)}
          x2={gx(celsius(min))}
          y2={gy(at(min))}
          stroke="#7c3aed"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
        <line
          x1={gx(celsius(min))}
          y1={gy(at(min))}
          x2={gx(celsius(max))}
          y2={gy(at(max))}
          stroke="#7c3aed"
          strokeWidth="2.5"
        />
        <circle cx={gx(zero)} cy={gy(0)} r="3.5" fill="#1f2937" />
        <text x={gx(zero)} y={gy(0) + 13} textAnchor="middle" fontSize="8" fill="#1f2937">
          −273,15 °C
        </text>
        <text x={gx(0)} y={gy(0) + 13} textAnchor="middle" fontSize="8" fill="#475569">
          0 °C
        </text>
        <circle cx={gx(celsius(state.T))} cy={gy(state.V)} r="5" fill="#dc2626" />
      </svg>
      <p className="text-xs text-warm-500">
        Heila línan er það sem sleðinn nær yfir; strikaða línan er framlengingin niður í alkul.
      </p>
    </figure>
  );
}

const NAMES: Record<GasVariable, string> = {
  P: 'Þrýstingur',
  V: 'Rúmmál',
  T: 'Hitastig',
  n: 'Mólfjöldi',
};

function readout(v: GasVariable, s: GasState): string {
  switch (v) {
    case 'P':
      return `${fmtP(s.P)} atm`;
    case 'V':
      return `${fmtV(s.V)} L`;
    case 'T':
      return `${formatDecimal(s.T, 0)} K (${formatDecimal(celsius(s.T), 0)} °C)`;
    case 'n':
      return `${fmtN(s.n)} mól`;
  }
}

interface NaermyndScreenProps {
  onBack: () => void;
}

export function NaermyndScreen({ onBack }: NaermyndScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<Record<SceneKind, number>>(() => ({
    boyle: CONTROLS.boyle.start,
    charles: CONTROLS.charles.start,
    gayLussac: CONTROLS.gayLussac.start,
    avogadro: CONTROLS.avogadro.start,
  }));
  const [still] = useState(prefersReducedMotion);
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
  const control = CONTROLS[step.kind];
  const x = values[step.kind];
  const state = useMemo(() => stateAt(step.kind, x), [step.kind, x]);
  const fixed = FIXED[step.kind];
  const count = particleCount(state.n);

  const label = `${step.title}: ${count} agnir í strokknum, ${readout('V', state)}, ${readout('T', state)}, ${readout('P', state)}.`;

  const controlText =
    control.variable === 'V'
      ? `V = ${readout('V', state)}`
      : control.variable === 'T'
        ? `T = ${readout('T', state)}`
        : `n = ${readout('n', state)} (${count} agnir)`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <Header variant="game" gameTitle="Gaslögmál" backLabel="Til baka í valmynd" onBack={onBack} />
      <main className="mx-auto max-w-5xl px-4 py-6 phone:py-3">
        <div className="rounded-xl bg-white p-4 shadow-lg sm:p-6 md:p-8 phone:p-3">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="mb-2 text-2xl font-bold text-warm-800 phone:text-base"
          >
            Nærmynd: sameindirnar á bak við PV = nRT
          </h2>

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
                        ? 'border-purple-600 bg-purple-600 text-white'
                        : 'border-purple-200 bg-white text-purple-800 hover:bg-purple-50'
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
            <div className="mb-3 space-y-1 rounded-xl border border-purple-200 bg-purple-50 p-3 text-center">
              {step.equations.map((e) => (
                <p key={e} className="font-mono text-sm text-purple-900 sm:text-base">
                  {e}
                </p>
              ))}
            </div>
          </div>

          <div className="mb-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="rounded-xl border border-warm-200 p-2 md:sticky md:top-20 md:self-start">
              <Cylinder kind={step.kind} state={state} still={still} label={label} />
              <p className="mt-1 text-xs text-warm-500">
                Hver hringur er {formatDecimal(MOL_PER_PARTICLE, 3)} mól, um 3,0 × 10²² sameindir,
                námundað. Í raun eru sameindirnar óteljandi og ósýnilegar; tölurnar eru réttar.
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-3">
                <label
                  htmlFor="gas-naermynd-control"
                  className="mb-1 block text-sm font-semibold text-purple-900"
                >
                  {step.action}: {controlText}
                </label>
                <input
                  id="gas-naermynd-control"
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={x}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [step.kind]: Number(e.target.value) }))
                  }
                  aria-valuetext={controlText}
                  className="w-full"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-warm-200 p-3">
                <Gauge p={state.P} />
                <dl className="grid min-w-[13rem] flex-1 grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-sm">
                  {(['P', 'V', 'T', 'n'] as GasVariable[]).map((v) => (
                    <div key={v} className="contents">
                      <dt className="text-warm-600">{NAMES[v]}</dt>
                      <dd
                        className="whitespace-nowrap font-semibold tabular-nums text-warm-900"
                        data-readout={v}
                      >
                        {readout(v, state)}
                        {fixed.includes(v) && (
                          <span className="ml-1 text-xs font-normal text-warm-500">fast</span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div aria-live="polite" className="sr-only">
                {readout('P', state)}, {readout('V', state)}
              </div>

              <KineticBars state={state} />
              {step.kind === 'charles' && <AbsoluteZero state={state} />}
              <div className="space-y-3 leading-relaxed text-warm-800">{step.body}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
              disabled={stepIndex === 0}
              className="min-w-24 flex-1 rounded-xl border-2 border-purple-300 px-4 py-3 font-semibold text-purple-800 hover:bg-purple-50 disabled:opacity-40"
            >
              ← Fyrra skref
            </button>
            {stepIndex < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStepIndex((i) => i + 1)}
                className="min-w-24 flex-1 rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white hover:bg-purple-700"
              >
                Næsta skref →
              </button>
            ) : (
              <button
                type="button"
                onClick={onBack}
                className="min-w-24 flex-1 rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white hover:bg-purple-700"
              >
                Til baka í valmynd
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
