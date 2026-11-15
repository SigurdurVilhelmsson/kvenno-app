/**
 * Nærmynd — lead(II) nitrate and potassium iodide, particle by particle. Nothing is graded
 * or stored.
 *
 * Built on the particle-view template (docs/particle-view-template.md), in the fixed-place
 * form `2-ar/redox-reactions` uses: every count comes from `engine/naermynd.ts`, each
 * particle stands for a fixed amount, and every particle has a fixed place, so a scene
 * always draws the same picture. Each Pb²⁺ that meets two I⁻ leaves the solution and joins
 * the yellow PbI₂ on the floor; the K⁺ and NO₃⁻, the meðjónir, stay where they are.
 */

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { PhoneDisclosure } from '@shared/components';
import { focusTarget, formatDecimal, revealTop } from '@shared/utils';

import { STEPS, type Equation } from '../data/naermynd-steps';
import {
  IODIDE_MAX,
  LEAD_START,
  PER_MMOL,
  PRECIPITATE_FORMULA,
  SPECTATORS,
  amountsAt,
  countsAt,
  precipitateMass,
} from '../engine/naermynd';
import type { Term } from '../engine/precipitation';

const W = 300;
const H = 230;
const TOP = 34;
const FLOOR = 208;

/** Fixed places in the solution, on a jittered grid so ions never overlap. */
const SOLUTION_SLOTS: { x: number; y: number }[] = (() => {
  const cols = 6;
  const rows = 5;
  const x0 = 36;
  const x1 = W - 30;
  const y0 = TOP + 16;
  const y1 = FLOOR - 46;
  const out: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const jx = ((r * 7 + c * 13) % 5) - 2;
      const jy = ((r * 11 + c * 3) % 5) - 2;
      out.push({
        x: x0 + (c + (r % 2 ? 0.5 : 0)) * ((x1 - x0) / cols) + jx * 2,
        y: y0 + r * ((y1 - y0) / (rows - 1)) + jy * 2,
      });
    }
  return out;
})();

// Each kind keeps its own slots, in an order scattered through the beaker (7 is coprime
// with 30, so stepping by it visits every slot once), so a scene always draws the same
// picture and an ion never jumps to another place when a neighbour leaves.
const ORDER = SOLUTION_SLOTS.map((_, i) => SOLUTION_SLOTS[(i * 7) % SOLUTION_SLOTS.length]);
const NO3_SLOTS = ORDER.slice(0, 10);
const PB_SLOTS = ORDER.slice(10, 15);
const K_SLOTS = ORDER.slice(15, 27);
const I_SLOTS = ORDER.slice(27, 30);

/** Where the PbI₂ units settle: a low heap on the floor of the beaker. */
const HEAP: { x: number; y: number }[] = [0, -1, 1, -2, 2, -0.5, 0.5].map((k, i) => ({
  x: W / 2 + k * 34,
  y: i < 5 ? FLOOR - 14 : FLOOR - 32,
}));

const ION = {
  Pb2: { label: 'Pb²⁺', fill: '#475569', text: '#fff', r: 10 },
  I: { label: 'I⁻', fill: '#a855f7', text: '#fff', r: 9 },
  K: { label: 'K⁺', fill: '#e7e5e4', text: '#57534e', r: 9 },
  NO3: { label: 'NO₃⁻', fill: '#f5f5f4', text: '#78716c', r: 11 },
} as const;
type Kind = keyof typeof ION;

const SPECTATOR_KINDS: Kind[] = ['K', 'NO3'];

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
        y={TOP}
        width={W - 36}
        height={H - 10 - TOP}
        rx={10}
        fill="#bae6fd"
        fillOpacity={0.25}
      />
      {/* The meðjónir first, so the ions that react are drawn over them. */}
      {NO3_SLOTS.slice(0, c.NO3).map((p, i) => (
        <Ion key={`no3-${i}`} kind="NO3" x={p.x} y={p.y} dim={dim} />
      ))}
      {K_SLOTS.slice(0, c.K).map((p, i) => (
        <Ion key={`k-${i}`} kind="K" x={p.x} y={p.y} dim={dim} />
      ))}
      {PB_SLOTS.slice(0, c.Pb2).map((p, i) => (
        <Ion key={`pb-${i}`} kind="Pb2" x={p.x} y={p.y} dim={dim} />
      ))}
      {I_SLOTS.slice(0, c.I).map((p, i) => (
        <Ion key={`i-${i}`} kind="I" x={p.x} y={p.y} dim={dim} />
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
