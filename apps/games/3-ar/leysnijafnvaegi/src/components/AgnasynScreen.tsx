/**
 * Agnasýn — the particles behind Ksp. Nothing is graded or stored.
 *
 * Four scenes: a saturated solution, a common ion, two solutions mixed with Q
 * against Ksp, and the Mohr titration. Built on the particle-view template
 * (docs/particle-view-template.md); every number from `engine/agnasyn.ts`. The
 * ions are exaggerated in every scene, since the real ones are far too few to
 * draw, and each scene says so.
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import {
  focusTarget,
  formatDecimal,
  formatScientific,
  prefersReducedMotion,
  revealTop,
} from '@shared/utils';

import { BackButton } from './BackButton';
import { STEPS, type IonKind, type Picture } from '../data/agnasyn-steps';
import {
  AGCL,
  AG_FOR_AG2CRO4,
  AG_FOR_AGCL,
  MIX_CONCENTRATIONS,
  MIX_VOLUME_ML,
  MOHR_CL,
  MOHR_LOG_MAX,
  MOHR_LOG_MIN,
  mixAt,
  mohrAt,
} from '../engine/agnasyn';

const ION: Record<
  IonKind,
  { label: string; fill: string; text: string; r: number; dim?: boolean }
> = {
  Ag: { label: 'Ag⁺', fill: '#64748b', text: '#fff', r: 9 },
  Cl: { label: 'Cl⁻', fill: '#16a34a', text: '#fff', r: 10 },
  Na: { label: 'Na⁺', fill: '#d6d3d1', text: '#57534e', r: 8, dim: true },
  NO3: { label: 'NO₃⁻', fill: '#e7e5e4', text: '#57534e', r: 10, dim: true },
  CrO4: { label: 'CrO₄²⁻', fill: '#eab308', text: '#422006', r: 11 },
};

const sci = (v: number) => formatScientific(v, 2);
const M = (c: number) => `${sci(c)} M`;

const W = 300;
const H = 220;
const FLOOR = 186;

function seeded(seed: number) {
  // Scramble the seed first: an LCG's first outputs from nearby seeds fall in a line.
  let s = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b);
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) ^ (s >>> 16);
  s = s >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** The Mohr flask: chromate throughout, chloride falling as AgCl comes down. */
function mohrPicture(logAg: number): Picture {
  const s = mohrAt(10 ** logAg);
  const cl = Math.round((10 * s.cl) / MOHR_CL);
  return {
    solid: { white: 10 - cl, red: s.ag2cro4 ? 4 : 0 },
    ions: [
      { kind: 'Cl', count: cl },
      { kind: 'CrO4', count: 5 },
    ],
    exchange: false,
  };
}

function mixPicture(c: number): Picture {
  const r = mixAt(c);
  return {
    solid: { white: r.precipitates ? 8 : 0, red: 0 },
    ions: [
      { kind: 'Ag', count: r.precipitates ? 2 : 5 },
      { kind: 'Cl', count: r.precipitates ? 2 : 5 },
      { kind: 'Na', count: 5 },
      { kind: 'NO3', count: 5 },
    ],
    exchange: r.precipitates,
  };
}

function Beaker({ picture, label, still }: { picture: Picture; label: string; still: boolean }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (still || !picture.exchange) return;
    const id = setInterval(() => setTick((t) => t + 1), 2200);
    return () => clearInterval(id);
  }, [still, picture.exchange]);

  const ions = useMemo(() => {
    const list: { kind: IonKind; i: number }[] = [];
    for (const g of picture.ions) for (let i = 0; i < g.count; i++) list.push({ kind: g.kind, i });
    return list;
  }, [picture]);

  // Each ion has a home; on every tick a few drift elsewhere, so the solution is seen to move.
  const place = (kind: IonKind, i: number) => {
    const rand = seeded(
      (kind.charCodeAt(0) * 131 + kind.length * 17 + i * 7919) ^ (tick * 2654435761)
    );
    return { x: 24 + rand() * (W - 48), y: 28 + rand() * (FLOOR - 70) };
  };

  const solid: { x: number; y: number; red: boolean }[] = [];
  const perRow = 10;
  const total = picture.solid.white + picture.solid.red;
  for (let k = 0; k < total; k++) {
    const row = Math.floor(k / perRow);
    const col = k % perRow;
    solid.push({
      x: W / 2 - (perRow * 14) / 2 + col * 14 + (row % 2 ? 7 : 0),
      y: FLOOR - 8 - row * 12,
      red: k >= picture.solid.white,
    });
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block h-auto w-full"
      role="img"
      aria-label={label}
      data-live
    >
      <path
        d={`M16 10 V${FLOOR + 14} Q16 ${H - 8} 30 ${H - 8} H${W - 30} Q${W - 16} ${H - 8} ${W - 16} ${FLOOR + 14} V10`}
        fill="#eff6ff"
        stroke="#64748b"
        strokeWidth="2.5"
      />
      {solid.map((p, k) => (
        <rect
          key={k}
          x={p.x - 6}
          y={p.y - 5}
          width={12}
          height={10}
          rx={2}
          fill={p.red ? '#b45309' : '#f8fafc'}
          stroke={p.red ? '#7c2d12' : '#94a3b8'}
        />
      ))}
      {ions.map(({ kind, i }) => {
        const ion = ION[kind];
        const p = place(kind, i);
        return (
          <g
            key={`${kind}-${i}`}
            style={{
              transform: `translate(${p.x}px, ${p.y}px)`,
              transition: still ? undefined : 'transform 1800ms ease-in-out',
              opacity: ion.dim ? 0.8 : 1,
            }}
          >
            <circle r={ion.r} fill={ion.fill} stroke="#1f2937" strokeOpacity="0.3" />
            {!ion.dim && (
              <circle
                r={ion.r + 3}
                fill="none"
                stroke="#475569"
                strokeDasharray="3 2"
                strokeWidth="1"
              />
            )}
            <text
              textAnchor="middle"
              dy="0.35em"
              fontSize={kind === 'CrO4' ? 6 : 7}
              fontWeight={700}
              fill={ion.text}
            >
              {ion.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Q against Ksp on a log axis, from 10⁻¹⁴ to 10⁻⁴. */
function QMeter({ q, ksp }: { q: number; ksp: number }) {
  const min = -14;
  const max = -4;
  const pos = (v: number) => ((Math.log10(v) - min) / (max - min)) * 100;
  const over = q > ksp;
  return (
    <div className="rounded-xl border border-warm-200 p-3">
      <div className="mb-2 text-sm font-semibold text-warm-700">Q á móti Ksp (lograkvarði)</div>
      <div className="relative h-10">
        <div className="absolute inset-x-0 top-4 h-2 rounded bg-gradient-to-r from-sky-100 via-warm-100 to-amber-200" />
        <div className="absolute top-1 h-8 w-0.5 bg-warm-800" style={{ left: `${pos(ksp)}%` }} />
        <div
          className={`absolute top-2 h-6 w-3 -translate-x-1/2 rounded ${over ? 'bg-red-600' : 'bg-sky-600'} transition-all duration-500 motion-reduce:transition-none`}
          style={{ left: `${Math.max(0, Math.min(100, pos(q)))}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-warm-500">
        <span>10⁻¹⁴</span>
        <span>10⁻⁴</span>
      </div>
      <p className="mt-1 text-sm text-warm-800">
        Q = {sci(q)}, Ksp = {sci(ksp)}:{' '}
        <strong>{over ? 'Q > Ksp, silfurklóríð fellur út' : 'Q < Ksp, ekkert botnfall'}</strong>
      </p>
    </div>
  );
}

interface AgnasynScreenProps {
  onBack: () => void;
}

export function AgnasynScreen({ onBack }: AgnasynScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [mixC, setMixC] = useState<number>(MIX_CONCENTRATIONS[1]);
  const [logAg, setLogAg] = useState(MOHR_LOG_MIN);
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
  const picture =
    step.kind === 'mix'
      ? mixPicture(mixC)
      : step.kind === 'mohr'
        ? mohrPicture(logAg)
        : step.picture!;
  const mix = mixAt(mixC);
  const mohr = mohrAt(10 ** logAg);

  const label = `${step.title}: ${picture.ions
    .filter((g) => g.count > 0)
    .map((g) => `${g.count} ${ION[g.kind].label}`)
    .join(', ')}${
    picture.solid.white + picture.solid.red > 0
      ? `; botnfall${picture.solid.white ? `, hvítt silfurklóríð` : ''}${picture.solid.red ? ', rautt silfurkrómat' : ''}`
      : '; ekkert botnfall'
  }.`;

  const legend = (['Ag', 'Cl', 'Na', 'NO3', 'CrO4'] as IonKind[]).filter((k) =>
    picture.ions.some((g) => g.kind === k && g.count > 0)
  );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:p-8 phone:p-3">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="min-w-0 text-2xl font-bold text-warm-800 phone:text-base"
          >
            Agnasýn: jónirnar á bak við Ksp
          </h2>
          <BackButton onClick={onBack} />
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
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-green-200 bg-white text-green-800 hover:bg-green-50'
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
          <div className="mb-3 space-y-1 rounded-xl border border-green-200 bg-green-50 p-3 text-center">
            {step.equations.map((e) => (
              <p key={e} className="font-mono text-sm text-green-900 sm:text-base">
                {e}
              </p>
            ))}
          </div>
        </div>

        <div className="mb-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="mx-auto w-full max-w-sm rounded-xl border border-warm-200 p-2">
            <Beaker picture={picture} label={label} still={still} />
            <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-warm-700">
              {legend.map((k) => (
                <li key={k} className="flex items-center gap-1">
                  <svg width="12" height="12" aria-hidden="true">
                    <circle cx="6" cy="6" r="5" fill={ION[k].fill} />
                  </svg>
                  {ION[k].label}
                  {ION[k].dim && ' (meðjón)'}
                </li>
              ))}
              {picture.solid.white > 0 && (
                <li className="flex items-center gap-1">
                  <svg width="12" height="12" aria-hidden="true">
                    <rect x="1" y="2" width="10" height="8" fill="#f8fafc" stroke="#94a3b8" />
                  </svg>
                  AgCl(s)
                </li>
              )}
              {picture.solid.red > 0 && (
                <li className="flex items-center gap-1">
                  <svg width="12" height="12" aria-hidden="true">
                    <rect x="1" y="2" width="10" height="8" fill="#b45309" />
                  </svg>
                  Ag₂CrO₄(s)
                </li>
              )}
            </ul>
            <p className="mt-1 text-xs text-warm-500">
              Jónirnar eru ýktar (strikaður hringur): í raun eru þær allt of fáar til að teikna.
              Tölurnar í textanum eru réttar.
            </p>
          </div>

          <div className="space-y-3">
            {step.kind === 'mix' && (
              <>
                <fieldset className="rounded-xl border-2 border-green-200 bg-green-50 p-3">
                  <legend className="px-1 text-sm font-semibold text-green-900">
                    Styrkur beggja lausna fyrir blöndun ({MIX_VOLUME_ML} mL af hvorri)
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {MIX_CONCENTRATIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setMixC(c)}
                        aria-pressed={c === mixC}
                        className={`rounded-lg border-2 px-3 py-1.5 text-sm pointer-coarse:min-h-11 ${
                          c === mixC
                            ? 'border-green-600 bg-green-600 text-white'
                            : 'border-green-300 bg-white text-green-900 hover:bg-green-100'
                        }`}
                      >
                        {M(c)}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <p className="text-sm text-warm-800">
                  Eftir blöndun: [Ag⁺] = [Cl⁻] = {M(mix.diluted.cation)}.
                </p>
                <div aria-live="polite">
                  <QMeter q={mix.q} ksp={AGCL.ksp} />
                </div>
              </>
            )}
            {step.kind === 'mohr' && (
              <>
                <div className="rounded-xl border-2 border-green-200 bg-green-50 p-3">
                  <label
                    htmlFor="mohr-ag"
                    className="mb-1 block text-sm font-semibold text-green-900"
                  >
                    Silfurjónum bætt við: [Ag⁺] = {M(mohr.ag)}
                  </label>
                  <input
                    id="mohr-ag"
                    type="range"
                    min={MOHR_LOG_MIN}
                    max={MOHR_LOG_MAX}
                    step="0.05"
                    value={logAg}
                    onChange={(e) => setLogAg(Number(e.target.value))}
                    aria-valuetext={`[Ag⁺] ${M(mohr.ag)}`}
                    className="w-full"
                  />
                </div>
                <div
                  aria-live="polite"
                  className="rounded-xl border border-warm-200 p-3 text-sm text-warm-800"
                >
                  <p>
                    [Cl⁻] í lausn: {M(mohr.cl)} ({formatDecimal((mohr.cl / MOHR_CL) * 100, 1)} %
                    eftir)
                  </p>
                  <p className="mt-1 font-semibold">
                    {mohr.ag2cro4
                      ? 'Rautt silfurkrómat fellur út: klóríðið er nær búið.'
                      : mohr.agcl
                        ? 'Hvítt silfurklóríð fellur út; ekkert rautt enn.'
                        : 'Ekkert botnfall enn.'}
                  </p>
                  <p className="mt-1 text-xs text-warm-500">
                    AgCl við [Ag⁺] = {M(AG_FOR_AGCL)}, Ag₂CrO₄ við {M(AG_FOR_AG2CRO4)}.
                  </p>
                </div>
              </>
            )}
            <div className="space-y-3 leading-relaxed text-warm-800">{step.body}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
            className="min-w-24 flex-1 rounded-xl border-2 border-green-300 px-4 py-3 font-semibold text-green-800 hover:bg-green-50 disabled:opacity-40"
          >
            ← Fyrra skref
          </button>
          {stepIndex < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStepIndex((i) => i + 1)}
              className="min-w-24 flex-1 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
            >
              Næsta skref →
            </button>
          ) : (
            <button
              type="button"
              onClick={onBack}
              className="min-w-24 flex-1 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
            >
              Til baka í valmynd
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
