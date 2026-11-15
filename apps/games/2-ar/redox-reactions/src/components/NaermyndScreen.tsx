/**
 * Nærmynd — zinc in CuSO₄, particle by particle. Nothing is graded or stored.
 *
 * Built on the particle-view template (docs/particle-view-template.md): every count comes
 * from `engine/naermynd.ts`, each particle stands for a fixed amount, and every particle has
 * a fixed place, so a scene always draws the same picture. Zinc atoms on the plate's surface
 * turn into copper atoms as Zn²⁺ goes out into the solution; the blue fades with [Cu²⁺];
 * the SO₄²⁻ ions, the meðjónir, never change.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { PhoneDisclosure } from '@shared/components';
import { focusTarget, formatDecimal, revealTop } from '@shared/utils';

import { STEPS } from '../data/naermynd-steps';
import { CU_START, PER_MMOL, ZINC_ATOMS, amountsAt, blueness, countsAt } from '../engine/naermynd';

const W = 300;
const H = 230;
const TOP = 40;
const FLOOR = 205;
const PLATE_X = 34;
const PLATE_W = 22;
/** Surface slots down the plate's right face. */
const SLOT_X = PLATE_X + PLATE_W + 7;
const slotY = (k: number) => TOP + 18 + k * ((FLOOR - TOP - 26) / (ZINC_ATOMS - 1));

/** Fixed places in the solution, laid out on a jittered grid so ions never overlap. */
const SOLUTION_SLOTS: { x: number; y: number }[] = (() => {
  const cols = 6;
  const rows = 5;
  const x0 = 92;
  const x1 = W - 30;
  const y0 = TOP + 22;
  const y1 = FLOOR - 16;
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

// Which slot each kind of ion keeps: SO₄²⁻ every third slot, copper and zinc ions the rest.
const SO4_SLOTS = SOLUTION_SLOTS.filter((_, i) => i % 3 === 0);
// The copper and zinc ions fill their slots in a scattered order, so ten of them spread
// through the solution rather than crowding its top rows.
const SPREAD = [0, 5, 2, 7, 4, 9, 1, 6, 3, 8];
const CU_SLOTS = SPREAD.map((k) => SOLUTION_SLOTS.filter((_, i) => i % 3 === 1)[k]);
const ZN_SLOTS = SPREAD.map((k) => SOLUTION_SLOTS.filter((_, i) => i % 3 === 2)[k]);

const ION = {
  Cu2: { label: 'Cu²⁺', fill: '#2563eb', text: '#fff', r: 10 },
  Zn2: { label: 'Zn²⁺', fill: '#cbd5e1', text: '#1e293b', r: 10 },
  SO4: { label: 'SO₄²⁻', fill: '#f5f5f4', text: '#78716c', r: 11 },
  Zn: { label: 'Zn', fill: '#94a3b8', text: '#0f172a', r: 7 },
  Cu: { label: 'Cu', fill: '#c2410c', text: '#fff', r: 7 },
} as const;

function Ion({ kind, x, y }: { kind: keyof typeof ION; x: number; y: number }) {
  const ion = ION[kind];
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle
        r={ion.r}
        fill={ion.fill}
        stroke={kind === 'SO4' ? '#a8a29e' : '#1f2937'}
        strokeOpacity={kind === 'SO4' ? 1 : 0.35}
        strokeDasharray={kind === 'SO4' ? '2 2' : undefined}
      />
      <text
        textAnchor="middle"
        dy="0.35em"
        fontSize={kind === 'SO4' ? 6 : kind === 'Zn' || kind === 'Cu' ? 6.5 : 7}
        fontWeight={700}
        fill={ion.text}
      >
        {ion.label}
      </text>
    </g>
  );
}

function Flask({ xi, electrons, label }: { xi: number; electrons: boolean; label: string }) {
  const c = countsAt(xi);
  const tint = blueness(xi);
  // Electrons are drawn moving down the plate from the zinc atoms to the slots copper took
  // most recently: the place on the surface where the transfer is happening.
  const busy = electrons && c.Cu > 0 && c.Zn > 0;
  const lastCu = c.Cu - 1;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={label}>
      <path
        d={`M16 ${TOP - 20} V${FLOOR + 6} Q16 ${H - 8} 30 ${H - 8} H${W - 30} Q${W - 16} ${H - 8} ${W - 16} ${FLOOR + 6} V${TOP - 20}`}
        fill="#f8fafc"
        stroke="#64748b"
        strokeWidth="2.5"
      />
      {/* The solution: blue in proportion to [Cu²⁺]. */}
      <rect
        x={18}
        y={TOP}
        width={W - 36}
        height={H - 10 - TOP}
        rx={10}
        fill="#3b82f6"
        fillOpacity={0.05 + 0.4 * tint}
        className="transition-[fill-opacity] duration-500 motion-reduce:transition-none"
        data-testid="solution"
        data-blueness={formatDecimal(tint, 2)}
      />
      {/* The zinc plate, standing in the solution. */}
      <rect x={PLATE_X} y={8} width={PLATE_W} height={FLOOR - 8} fill="#64748b" rx={2} />
      <text
        x={PLATE_X + PLATE_W / 2}
        y={24}
        textAnchor="middle"
        fontSize={9}
        fontWeight={700}
        fill="#fff"
      >
        Zn
      </text>
      {Array.from({ length: ZINC_ATOMS }, (_, k) => (
        <Ion key={`s${k}`} kind={k < c.Cu ? 'Cu' : 'Zn'} x={SLOT_X} y={slotY(k)} />
      ))}
      {busy && (
        <g aria-hidden="true">
          <path
            d={`M${SLOT_X + 9} ${slotY(Math.min(ZINC_ATOMS - 1, c.Cu + 1))} C${SLOT_X + 24} ${slotY(c.Cu)}, ${SLOT_X + 24} ${slotY(lastCu)}, ${SLOT_X + 10} ${slotY(lastCu) - 1}`}
            fill="none"
            stroke="#ca8a04"
            strokeWidth="1.5"
            markerEnd="url(#naermynd-arrow)"
          />
          <defs>
            <marker
              id="naermynd-arrow"
              viewBox="0 0 6 6"
              refX="5"
              refY="3"
              markerWidth="5"
              markerHeight="5"
              orient="auto"
            >
              <path d="M0 0 L6 3 L0 6 z" fill="#ca8a04" />
            </marker>
          </defs>
          <text
            x={SLOT_X + 22}
            y={(slotY(c.Cu) + slotY(lastCu)) / 2 + 3}
            fontSize={9}
            fontWeight={700}
            fill="#a16207"
          >
            2e⁻
          </text>
        </g>
      )}
      {SO4_SLOTS.slice(0, c.SO4).map((p, i) => (
        <Ion key={`so4-${i}`} kind="SO4" x={p.x} y={p.y} />
      ))}
      {CU_SLOTS.slice(0, c.Cu2).map((p, i) => (
        <Ion key={`cu-${i}`} kind="Cu2" x={p.x} y={p.y} />
      ))}
      {ZN_SLOTS.slice(0, c.Zn2).map((p, i) => (
        <Ion key={`zn-${i}`} kind="Zn2" x={p.x} y={p.y} />
      ))}
    </svg>
  );
}

const mmol = (v: number) => `${formatDecimal(v, 2)} mmól`;

interface NaermyndScreenProps {
  onBack: () => void;
}

export function NaermyndScreen({ onBack }: NaermyndScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [freeXi, setFreeXi] = useState(CU_START / 2);
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
  const xi = step.xi ?? freeXi;
  const c = countsAt(xi);
  const a = amountsAt(xi);

  const label =
    `${step.title}: ${c.Cu2} Cu²⁺, ${c.Zn2} Zn²⁺ og ${c.SO4} SO₄²⁻ í lausn; ` +
    `${c.Zn} sinkatóm og ${c.Cu} koparatóm á yfirborði plötunnar.`;

  const rows: [string, number][] = [
    ['Cu²⁺(aq)', a.Cu2],
    ['Zn²⁺(aq)', a.Zn2],
    ['SO₄²⁻(aq), meðjón', a.SO4],
    ['Cu(s) á plötunni', a.Cu],
    ['Rafeindir fluttar', a.electrons],
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
            Nærmynd: sink í koparsúlfatlausn
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
          <div className="mb-3 space-y-1 rounded-xl border border-teal-200 bg-teal-50 p-3 text-center">
            {step.equations.map((e, i) => (
              <p key={e} className="font-mono text-sm text-teal-900 sm:text-base">
                {stepIndex === 2 && i === 0 ? (
                  <>
                    Zn(s) + Cu<s className="text-warm-500">SO₄</s>(aq) → Zn
                    <s className="text-warm-500">SO₄</s>(aq) + Cu(s)
                  </>
                ) : (
                  e
                )}
              </p>
            ))}
          </div>
        </div>

        <div className="mb-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="mx-auto w-full max-w-sm rounded-xl border border-warm-200 p-2">
            <Flask xi={xi} electrons={!!step.electrons} label={label} />
            <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-warm-700">
              {(['Cu2', 'Zn2', 'SO4', 'Zn', 'Cu'] as const).map((k) => (
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
                  {k === 'Zn' ? 'Zn(s)' : k === 'Cu' ? 'Cu(s)' : ION[k].label}
                  {k === 'SO4' && ' (meðjón)'}
                </li>
              ))}
            </ul>
            <p className="mt-1 text-xs text-warm-500">
              Hver jón í lausninni stendur fyrir {mmol(1 / PER_MMOL)}. Aðeins yfirborð plötunnar er
              teiknað.
            </p>
          </div>

          <div className="space-y-3">
            {step.xi === null && (
              <div className="rounded-xl border-2 border-teal-200 bg-teal-50 p-3">
                <label
                  htmlFor="naermynd-xi"
                  className="mb-1 block text-sm font-semibold text-teal-900"
                >
                  Kopar sem hefur sest á plötuna: {mmol(a.Cu)}
                </label>
                <input
                  id="naermynd-xi"
                  type="range"
                  min={0}
                  max={CU_START}
                  step={1 / PER_MMOL}
                  value={freeXi}
                  onChange={(e) => setFreeXi(Number(e.target.value))}
                  aria-valuetext={`${mmol(a.Cu)} af kopar á plötunni`}
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
                      <td className="py-1 text-right font-mono text-warm-900">{mmol(v)}</td>
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
