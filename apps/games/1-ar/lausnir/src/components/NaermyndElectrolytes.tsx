/**
 * Stig 0's Nærmynd — sodium chloride, glucose and acetic acid in water, particle by
 * particle, each with the conductivity bulb. Nothing is graded or stored.
 *
 * Built on the particle-view template (docs/particle-view-template.md), in the fixed-place
 * form: every count comes from `utils/naermynd.ts`, each particle stands for 0,10 mmól, and
 * every particle has a fixed place, so a scene always draws the same picture.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { PhoneDisclosure } from '@shared/components';
import { focusTarget, formatDecimal, revealTop } from '@shared/utils';

import { STEPS } from '../data/naermynd-steps';
import { PER_MMOL, beakerState, type NaermyndSolute } from '../utils/naermynd';

const W = 300;
const H = 250;
const TOP = 96;
const FLOOR = 232;
const LEFT = 58;
const RIGHT = W - 58;

/** A jittered grid of `cols` × `rows` places between the electrodes. */
function grid(cols: number, rows: number): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  const y0 = TOP + 16;
  const y1 = FLOOR - 14;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const jx = ((r * 7 + c * 13) % 5) - 2;
      const jy = ((r * 11 + c * 3) % 5) - 2;
      out.push({
        x: LEFT + (c + 0.5 + (r % 2 ? 0.25 : -0.25)) * ((RIGHT - LEFT) / cols) + jx,
        y: y0 + r * ((y1 - y0) / (rows - 1)) + jy,
      });
    }
  return out;
}

/** Forty places for single ions, twenty for molecules, which are drawn wider. */
const ION_SLOTS = grid(8, 5);
const MOLECULE_SLOTS = grid(4, 5);
/** Where acetic acid's one exaggerated pair sits, in place of a molecule near the middle. */
const PAIR_SLOT = 10;

const GLYPH = {
  'Na⁺': { fill: '#7c3aed', text: '#fff' },
  'Cl⁻': { fill: '#16a34a', text: '#fff' },
  'H⁺': { fill: '#dc2626', text: '#fff' },
  'CH₃COO⁻': { fill: '#fdba74', text: '#7c2d12' },
  'CH₃COOH': { fill: '#fb923c', text: '#431407' },
  'C₆H₁₂O₆': { fill: '#fde68a', text: '#713f12' },
} as const;
type Glyph = keyof typeof GLYPH;

function Ion({ glyph, x, y }: { glyph: Glyph; x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={8.5} fill={GLYPH[glyph].fill} stroke="#1f2937" strokeOpacity={0.35} />
      <text textAnchor="middle" dy="0.35em" fontSize={7} fontWeight={700} fill={GLYPH[glyph].text}>
        {glyph}
      </text>
    </g>
  );
}

function Molecule({ glyph, x, y }: { glyph: Glyph; x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x={-19}
        y={-7}
        width={38}
        height={14}
        rx={7}
        fill={GLYPH[glyph].fill}
        stroke="#1f2937"
        strokeOpacity={0.35}
      />
      <text textAnchor="middle" dy="0.35em" fontSize={6} fontWeight={700} fill={GLYPH[glyph].text}>
        {glyph}
      </text>
    </g>
  );
}

const BULB = {
  bright: { fill: '#facc15', label: 'Björt pera' },
  dim: { fill: '#fef3c7', label: 'Dauf pera' },
  off: { fill: '#e7e5e4', label: 'Slökkt pera' },
} as const;

function Beaker({ id, title }: { id: NaermyndSolute; title: string }) {
  const s = beakerState(id);
  const bulb = BULB[s.bulb];
  const label =
    `${title}: ${bulb.label.toLowerCase()}; ` +
    (s.ionPairs > 0 && !s.exaggerated
      ? `${s.ionPairs} katjónir og ${s.ionPairs} anjónir, engin heil eining.`
      : s.exaggerated
        ? `${s.molecules} heilar sameindir og eitt jónapar, teiknað ýkt.`
        : `${s.molecules} heilar sameindir, engar jónir.`);

  const [cation, anion]: [Glyph, Glyph] = id === 'nacl' ? ['Na⁺', 'Cl⁻'] : ['H⁺', 'CH₃COO⁻'];
  const molecule: Glyph = id === 'c6h12o6' ? 'C₆H₁₂O₆' : 'CH₃COOH';

  const molecules = MOLECULE_SLOTS.filter((_, i) => !(s.exaggerated && i === PAIR_SLOT)).slice(
    0,
    s.molecules
  );
  const pair = MOLECULE_SLOTS[PAIR_SLOT];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={label}>
      {/* The bulb and its wires, down to the two electrodes. */}
      <path
        d={`M44 ${TOP + 10} V40 H${W / 2 - 14} M${W / 2 + 14} 40 H${W - 44} V${TOP + 10}`}
        fill="none"
        stroke="#78716c"
        strokeWidth="2"
      />
      <circle
        cx={W / 2}
        cy={34}
        r={16}
        fill={bulb.fill}
        stroke="#78716c"
        strokeWidth="2"
        data-testid={`bulb-${id}`}
        data-bulb={s.bulb}
      />
      {s.bulb === 'bright' && (
        <g stroke="#eab308" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <line x1={W / 2} y1={6} x2={W / 2} y2={12} />
          <line x1={W / 2 - 26} y1={22} x2={W / 2 - 21} y2={25} />
          <line x1={W / 2 + 26} y1={22} x2={W / 2 + 21} y2={25} />
        </g>
      )}
      <path
        d={`M16 ${TOP - 16} V${FLOOR + 4} Q16 ${H - 6} 30 ${H - 6} H${W - 30} Q${W - 16} ${H - 6} ${W - 16} ${FLOOR + 4} V${TOP - 16}`}
        fill="#f8fafc"
        stroke="#64748b"
        strokeWidth="2.5"
      />
      <rect
        x={18}
        y={TOP}
        width={W - 36}
        height={H - 8 - TOP}
        rx={10}
        fill="#bae6fd"
        fillOpacity={0.3}
      />
      <rect x={38} y={TOP - 6} width={12} height={FLOOR - TOP} fill="#a8a29e" />
      <rect x={W - 50} y={TOP - 6} width={12} height={FLOOR - TOP} fill="#a8a29e" />

      {s.ionPairs > 0 &&
        !s.exaggerated &&
        ION_SLOTS.slice(0, 2 * s.ionPairs).map((p, i) => (
          <Ion key={`ion-${i}`} glyph={i % 2 ? anion : cation} x={p.x} y={p.y} />
        ))}
      {molecules.map((p, i) => (
        <Molecule key={`m-${i}`} glyph={molecule} x={p.x} y={p.y} />
      ))}
      {s.exaggerated && (
        <g data-testid="exaggerated-pair">
          <ellipse
            cx={pair.x}
            cy={pair.y}
            rx={30}
            ry={14}
            fill="none"
            stroke="#b45309"
            strokeDasharray="3 2"
          />
          <Ion glyph={cation} x={pair.x - 19} y={pair.y} />
          <Molecule glyph={anion} x={pair.x + 8} y={pair.y} />
        </g>
      )}
    </svg>
  );
}

const LEGEND: Record<NaermyndSolute, Glyph[]> = {
  nacl: ['Na⁺', 'Cl⁻'],
  ch3cooh: ['CH₃COOH', 'H⁺', 'CH₃COO⁻'],
  c6h12o6: ['C₆H₁₂O₆'],
};

const mmol = (v: number) => `${formatDecimal(v, 2)} mmól`;

interface NaermyndElectrolytesProps {
  onBack: () => void;
}

export function NaermyndElectrolytes({ onBack }: NaermyndElectrolytesProps) {
  const [stepIndex, setStepIndex] = useState(0);
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
  const several = step.beakers.length > 1;
  const glyphs = [...new Set(step.beakers.flatMap((id) => LEGEND[id]))];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-xl bg-white p-4 shadow-lg sm:p-6 md:p-8 phone:p-3">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="min-w-0 text-xl font-bold text-warm-800 sm:text-2xl phone:text-base"
          >
            Nærmynd: jónir í lausn
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
          {step.equations.length > 0 && (
            <div className="mb-3 space-y-1 rounded-xl border border-teal-200 bg-teal-50 p-3 text-center">
              {step.equations.map((e) => {
                const [left, right] = e.split(/ (→|⇌) /).filter((_, i) => i !== 1);
                const arrow = e.includes('⇌') ? '⇌' : '→';
                return (
                  <p key={e} className="font-mono text-sm text-teal-900 sm:text-base">
                    <span className="whitespace-nowrap">{left}</span> {arrow}{' '}
                    <span className="whitespace-nowrap">{right}</span>
                  </p>
                );
              })}
            </div>
          )}
        </div>

        <div className={`mb-3 grid gap-3 ${several ? '' : 'md:grid-cols-2'}`}>
          <div className="rounded-xl border border-warm-200 p-2">
            <div className={several ? 'grid gap-2 sm:grid-cols-3' : 'mx-auto max-w-sm'}>
              {step.beakers.map((id) => (
                <figure key={id}>
                  <Beaker id={id} title={beakerState(id).solute.name} />
                  {several && (
                    <figcaption className="text-center text-sm font-semibold text-warm-700">
                      {beakerState(id).solute.name}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
            <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-warm-700">
              {glyphs.map((g) => (
                <li key={g} className="flex items-center gap-1">
                  <svg width="12" height="12" aria-hidden="true">
                    <circle
                      cx="6"
                      cy="6"
                      r="5"
                      fill={GLYPH[g].fill}
                      stroke="#78716c"
                      strokeWidth={0.5}
                    />
                  </svg>
                  {g}
                </li>
              ))}
            </ul>
            <p className="mt-1 text-xs text-warm-500">
              Hver ögn stendur fyrir {mmol(1 / PER_MMOL)}. Vatnssameindirnar eru ekki teiknaðar.
            </p>
            {step.note && (
              <p
                className="mt-2 rounded-lg border border-dashed border-amber-500 bg-amber-50 p-2 text-sm text-amber-900"
                data-testid="exaggeration-note"
              >
                {step.note}
              </p>
            )}
          </div>

          <div className="space-y-3 leading-relaxed text-warm-800">
            {step.body}
            <PhoneDisclosure summary="Efnamagn í bikurunum">
              <table className="w-full text-sm">
                <caption className="sr-only">Efnamagn í bikurunum</caption>
                <thead>
                  <tr className="border-b border-warm-200 text-left text-warm-600">
                    <th scope="col" className="py-1 pr-2 font-normal">
                      Efni
                    </th>
                    <th scope="col" className="py-1 pr-2 text-right font-normal">
                      Heilar einingar
                    </th>
                    <th scope="col" className="py-1 text-right font-normal">
                      Jónir
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {step.beakers.map((id) => {
                    const s = beakerState(id);
                    const units = s.molecules + s.ionPairs;
                    return (
                      <tr key={id} className="border-b border-warm-100 last:border-0">
                        <th scope="row" className="py-1 pr-2 text-left font-normal text-warm-700">
                          {s.solute.name}
                        </th>
                        <td className="py-1 pr-2 text-right font-mono text-warm-900">
                          {mmol((units - s.trueIonPairs) / PER_MMOL)}
                        </td>
                        <td className="py-1 text-right font-mono text-warm-900">
                          {mmol((2 * s.trueIonPairs) / PER_MMOL)}
                        </td>
                      </tr>
                    );
                  })}
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
              Aftur í kennsluna
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
