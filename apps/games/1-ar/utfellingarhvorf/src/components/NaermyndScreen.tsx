/**
 * Nærmynd — lead(II) nitrate and potassium iodide, particle by particle. Nothing is graded
 * or stored.
 *
 * Built on the particle-view template (docs/particle-view-template.md), drawn without motion:
 * every count comes from `engine/naermynd.ts`, each particle stands for a fixed amount, and the
 * layout is fixed for each amount added, so a scene always draws the same picture. The liquid
 * rises as the KI solution goes in (25,0 to 55,0 mL, Siggi's ruling on C23, 2026-11-15), and
 * the ions spread through it. Each Pb²⁺ that meets two I⁻ leaves the solution and joins the
 * yellow PbI₂ on the floor; the K⁺ and NO₃⁻, the meðjónir, stay in solution.
 */

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { PhoneDisclosure } from '@shared/components';
import { focusTarget, formatDecimal, revealTop } from '@shared/utils';

import { STEPS, type Equation } from '../data/naermynd-steps';
import {
  IODIDE_MAX,
  LEAD_START,
  LEAD_VOLUME_ML,
  PER_MMOL,
  PRECIPITATE_FORMULA,
  SPECTATORS,
  amountsAt,
  countsAt,
  type Counts,
  precipitateMass,
} from '../engine/naermynd';
import type { Term } from '../engine/precipitation';

const W = 300;
const H = 282;
/** Where the liquid stands once the largest volume on the slider is in. */
const TOP = 34;
const FLOOR = 260;
/** The liquid's bottom edge, inside the glass. */
const BOTTOM = H - 10;

/** mL in the beaker after `iodide` mmól of I⁻ has been added as KI solution. */
function volumeAt(iodide: number): number {
  return LEAD_VOLUME_ML + amountsAt(iodide).addedMl;
}
const VOLUME_MAX = volumeAt(IODIDE_MAX);

/** The top of the liquid: the solution rises as the KI solution is poured in. */
function liquidTop(iodide: number): number {
  return BOTTOM - ((BOTTOM - TOP) * volumeAt(iodide)) / VOLUME_MAX;
}

/** Where the PbI₂ units settle: one low row on the floor of the beaker. */
const HEAP: { x: number; y: number }[] = [0, -1, 1, -2, 2, -3, 3].map((k) => ({
  x: W / 2 + k * 34,
  y: FLOOR - 14,
}));
/** The solution's ions stay above this line, clear of the heap. */
const SOLUTION_FLOOR = FLOOR - 30;
const COLS = 8;

type SolutionKind = 'NO3' | 'K' | 'Pb2' | 'I';

/**
 * Lays the ions out in the liquid as it stands: rows of up to eight, spread evenly from the top
 * of the liquid down to the heap. The order is a fixed scatter by kind and index, so a scene
 * always draws the same picture and the kinds stay mixed.
 */
function layout(c: Counts, top: number): { kind: SolutionKind; x: number; y: number }[] {
  const kinds: [SolutionKind, number][] = [
    ['NO3', c.NO3],
    ['K', c.K],
    ['Pb2', c.Pb2],
    ['I', c.I],
  ];
  const ions = kinds
    .flatMap(([kind, n], k) =>
      Array.from({ length: n }, (_, i) => ({ kind, key: (k * 31 + i * 17) % 97 }))
    )
    .sort((a, b) => a.key - b.key);
  const rows = Math.max(1, Math.ceil(ions.length / COLS));
  const y0 = top + 14;
  const rowH = (SOLUTION_FLOOR - y0) / rows;
  const x0 = 34;
  const x1 = W - 34;
  return ions.map((ion, n) => {
    const r = Math.floor(n / COLS);
    const inRow = Math.min(COLS, ions.length - r * COLS);
    const c0 = n % COLS;
    const step = (x1 - x0) / COLS;
    const jx = ((r * 7 + c0 * 13) % 5) - 2;
    const jy = ((r * 11 + c0 * 3) % 5) - 2;
    return {
      kind: ion.kind,
      x: x0 + (W - 2 * x0 - inRow * step) / 2 + (c0 + 0.5 + (r % 2 ? 0.25 : -0.25)) * step + jx,
      y: y0 + (r + 0.5) * rowH + jy,
    };
  });
}

const ION = {
  Pb2: { label: 'Pb²⁺', fill: '#475569', text: '#fff', r: 10 },
  I: { label: 'I⁻', fill: '#a855f7', text: '#fff', r: 9 },
  K: { label: 'K⁺', fill: '#e7e5e4', text: '#57534e', r: 9 },
  NO3: { label: 'NO₃⁻', fill: '#f5f5f4', text: '#78716c', r: 11 },
} as const;
type Kind = keyof typeof ION;

const SPECTATOR_KINDS: Kind[] = ['K', 'NO3'];
const isSpectator = (k: Kind) => SPECTATOR_KINDS.includes(k);

function Ion({ kind, x, y, dim }: { kind: Kind; x: number; y: number; dim: boolean }) {
  const ion = ION[kind];
  const spectator = SPECTATOR_KINDS.includes(kind);
  return (
    <g transform={`translate(${x} ${y})`} opacity={dim && spectator ? 0.45 : 1}>
      <circle
        r={ion.r}
        fill={ion.fill}
        stroke={spectator ? '#a8a29e' : '#1f2937'}
        strokeOpacity={spectator ? 1 : 0.35}
        strokeDasharray={spectator ? '2 2' : undefined}
      />
      <text
        textAnchor="middle"
        dy="0.35em"
        fontSize={kind === 'NO3' ? 6 : 7}
        fontWeight={700}
        fill={ion.text}
      >
        {ion.label}
      </text>
    </g>
  );
}

/** One PbI₂ unit: a lead ion with its two iodide ions, yellow because the solid is. */
function Precipitate({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-15} y={-9} width={30} height={18} rx={6} fill="#facc15" stroke="#a16207" />
      <text textAnchor="middle" dy="0.35em" fontSize={7} fontWeight={700} fill="#422006">
        PbI₂
      </text>
    </g>
  );
}

function Beaker({ iodide, dim, label }: { iodide: number; dim: boolean; label: string }) {
  const c = countsAt(iodide);
  const top = liquidTop(iodide);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={label}>
      <path
        d={`M16 ${TOP - 20} V${FLOOR + 6} Q16 ${H - 8} 30 ${H - 8} H${W - 30} Q${W - 16} ${H - 8} ${W - 16} ${FLOOR + 6} V${TOP - 20}`}
        fill="#f8fafc"
        stroke="#64748b"
        strokeWidth="2.5"
      />
      <rect
        x={18}
        y={top}
        width={W - 36}
        height={BOTTOM - top}
        rx={10}
        fill="#bae6fd"
        fillOpacity={0.25}
      />
      {/* The meðjónir first, so the ions that react are drawn over them. */}
      {layout(c, top)
        .sort((a, b) => Number(isSpectator(b.kind)) - Number(isSpectator(a.kind)))
        .map((p, i) => (
          <Ion key={`${p.kind}-${i}`} kind={p.kind} x={p.x} y={p.y} dim={dim} />
        ))}
      {HEAP.slice(0, c.PbI2).map((p, i) => (
        <Precipitate key={`pbi2-${i}`} x={p.x} y={p.y} />
      ))}
    </svg>
  );
}

/** A term, kept on one line so a 360 px phone never splits a species. */
function TermText({ term, struck }: { term: Term; struck: boolean }) {
  const text = `${term.coefficient === 1 ? '' : term.coefficient}${term.species}(${term.state})`;
  return (
    <span className="whitespace-nowrap">
      {struck ? <s className="text-warm-500">{text}</s> : text}
    </span>
  );
}

function Side({ terms, strike }: { terms: Term[]; strike: boolean }) {
  return (
    <>
      {terms.map((t, i) => (
        <Fragment key={`${t.species}-${i}`}>
          {i > 0 && ' + '}
          <TermText
            term={t}
            struck={strike && t.state === 'aq' && SPECTATORS.includes(t.species)}
          />
        </Fragment>
      ))}
    </>
  );
}

function EquationLine({ eq }: { eq: Equation }) {
  return (
    <p className="font-mono text-sm text-teal-900 sm:text-base">
      <Side terms={eq.left} strike={!!eq.strike} /> <span className="whitespace-nowrap">→</span>{' '}
      <Side terms={eq.right} strike={!!eq.strike} />
    </p>
  );
}

const mmol = (v: number) => `${formatDecimal(v, 2)} mmól`;

interface NaermyndScreenProps {
  onBack: () => void;
}

export function NaermyndScreen({ onBack }: NaermyndScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [freeIodide, setFreeIodide] = useState(LEAD_START);
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
  const iodide = step.iodide ?? freeIodide;
  const c = countsAt(iodide);
  const a = amountsAt(iodide);

  const label =
    `${step.title}: ${c.Pb2} Pb²⁺, ${c.I} I⁻, ${c.K} K⁺ og ${c.NO3} NO₃⁻ í lausn; ` +
    `${c.PbI2} einingar af ${PRECIPITATE_FORMULA} í botnfallinu.`;

  const rows: [string, string][] = [
    ['Kalíumjoðíðlausn bætt við', `${formatDecimal(a.addedMl, 1)} mL`],
    ['Rúmmál lausnar', `${formatDecimal(volumeAt(iodide), 1)} mL`],
    ['Pb²⁺(aq)', mmol(a.Pb2)],
    ['I⁻(aq)', mmol(a.I)],
    ['K⁺(aq), meðjón', mmol(a.K)],
    ['NO₃⁻(aq), meðjón', mmol(a.NO3)],
    [`${PRECIPITATE_FORMULA}(s), botnfall`, mmol(a.PbI2)],
    [`${PRECIPITATE_FORMULA}(s), massi`, `${formatDecimal(precipitateMass(iodide), 2)} g`],
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:p-8 phone:p-3">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="min-w-0 text-xl font-bold text-warm-800 sm:text-2xl phone:text-base"
          >
            Nærmynd: blýnítrat og kalíumjoðíð
          </h2>
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 whitespace-nowrap text-sm text-warm-500 underline pointer-coarse:-my-3 pointer-coarse:py-3"
          >
            Til baka
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

        <div ref={stepTopRef} className="scroll-mt-4 [overflow-anchor:none]">
          <h3 tabIndex={-1} className="mb-2 text-lg font-bold text-warm-800 sm:text-xl">
            {stepIndex + 1}. {step.title}
          </h3>
          <div className="mb-3 space-y-1 rounded-xl border border-teal-200 bg-teal-50 p-3 text-center">
            {step.equations.map((eq, i) => (
              <EquationLine key={i} eq={eq} />
            ))}
          </div>
        </div>

        <div className="mb-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="mx-auto w-full max-w-sm rounded-xl border border-warm-200 p-2">
            <Beaker iodide={iodide} dim={!!step.dimSpectators} label={label} />
            <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-warm-700">
              {(['Pb2', 'I', 'K', 'NO3'] as const).map((k) => (
                <li key={k} className="flex items-center gap-1">
                  <svg width="12" height="12" aria-hidden="true">
                    <circle
                      cx="6"
                      cy="6"
                      r="5"
                      fill={ION[k].fill}
                      stroke="#78716c"
                      strokeWidth={0.5}
                    />
                  </svg>
                  {ION[k].label}
                  {SPECTATOR_KINDS.includes(k) && ' (meðjón)'}
                </li>
              ))}
              <li className="flex items-center gap-1">
                <svg width="14" height="12" aria-hidden="true">
                  <rect
                    x="1"
                    y="2"
                    width="12"
                    height="8"
                    rx="3"
                    fill="#facc15"
                    stroke="#a16207"
                    strokeWidth={0.5}
                  />
                </svg>
                {PRECIPITATE_FORMULA}(s)
              </li>
            </ul>
            <p className="mt-1 text-xs text-warm-500">
              Hver jón og hver eining af {PRECIPITATE_FORMULA} stendur fyrir {mmol(1 / PER_MMOL)}.
              Botnfallið myndast í raun sem gult ský sem sest á botninn.
            </p>
          </div>

          <div className="space-y-3">
            {step.iodide === null && (
              <div className="rounded-xl border-2 border-teal-200 bg-teal-50 p-3">
                <label
                  htmlFor="naermynd-iodide"
                  className="mb-1 block text-sm font-semibold text-teal-900"
                >
                  Joðíð sem hefur bæst við: {mmol(iodide)}
                </label>
                <input
                  id="naermynd-iodide"
                  type="range"
                  min={0}
                  max={IODIDE_MAX}
                  step={1}
                  value={freeIodide}
                  onChange={(e) => setFreeIodide(Number(e.target.value))}
                  aria-valuetext={`${mmol(iodide)} af joðíði bætt við`}
                  className="w-full"
                />
              </div>
            )}
            <div className="space-y-3 leading-relaxed text-warm-800">{step.body}</div>
            <PhoneDisclosure summary="Efnamagn í bikarnum">
              <table className="w-full text-sm" aria-live="polite">
                <caption className="sr-only">Efnamagn í bikarnum</caption>
                <tbody>
                  {rows.map(([name, v]) => (
                    <tr key={name} className="border-b border-warm-100 last:border-0">
                      <th scope="row" className="py-1 pr-2 text-left font-normal text-warm-700">
                        {name}
                      </th>
                      <td className="py-1 text-right font-mono text-warm-900">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </PhoneDisclosure>
          </div>
        </div>

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
