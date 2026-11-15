/**
 * Nærmynd — liquids in closed flasks: the vapour above each, molecule by molecule. Nothing is
 * graded or stored.
 *
 * Built on the particle-view template (docs/particle-view-template.md): the vapour counts come
 * from `engine/naermynd.ts`, one whole molecule per kPa of the book's vapour pressure. The
 * molecules are drawn whole in the liquid, in the vapour and in the bubbles of boiling water,
 * which is the point: evaporating and boiling separate molecules, they do not break them.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { focusTarget, formatDecimal, revealTop } from '@shared/utils';

import { STEPS } from '../data/naermynd-steps';
import { LIQUIDS, type Liquid } from '../data/vapour-pressure';
import { LIQUID_MOLECULES, PER_KPA, liquid, sameindir, vapourCount } from '../engine/naermynd';

const W = 160;
const H = 200;
const SURFACE = 128;

/** Places in the vapour, 36 of them on a staggered grid, filled in a scattered order. */
const VAPOUR_SLOTS = (() => {
  const out: { x: number; y: number }[] = [];
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 6; c++)
      out.push({
        x: 24 + c * 22 + (r % 2 ? 9 : 0) + (((r * 5 + c * 3) % 7) - 3),
        y: 24 + r * 17 + (((r * 3 + c * 5) % 5) - 2) * 2,
      });
  // 37 is prime, so (i + 1) · 11 mod 37 runs through 1 … 36 once each, well scattered.
  return Array.from({ length: out.length }, (_, i) => out[(((i + 1) * 11) % 37) - 1]);
})();

const LIQUID_SLOTS = Array.from({ length: LIQUID_MOLECULES }, (_, i) => {
  const r = Math.floor(i / 5);
  const c = i % 5;
  return { x: 28 + c * 26 + (r % 2 ? 10 : 0), y: SURFACE + 14 + r * 17 };
});

/** A whole molecule: carbons in a chain, then O and its H; water as H–O–H. */
function Molecule({ id, x, y }: { id: Liquid['id']; x: number; y: number }) {
  if (id === 'vatn') {
    return (
      <g transform={`translate(${x} ${y})`}>
        <circle cx={-4} cy={2.5} r={2.2} fill="#fff" stroke="#64748b" strokeWidth={0.6} />
        <circle cx={4} cy={2.5} r={2.2} fill="#fff" stroke="#64748b" strokeWidth={0.6} />
        <circle cx={0} cy={0} r={3.6} fill="#dc2626" />
      </g>
    );
  }
  const n = liquid(id).carbons;
  const start = -((n + 1) * 5.4) / 2 + 2.7;
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: n }, (_, k) => (
        <circle key={k} cx={start + k * 5.4} cy={k % 2 ? 1.5 : -1.5} r={3.2} fill="#334155" />
      ))}
      <circle cx={start + n * 5.4} cy={n % 2 ? 1.5 : -1.5} r={3.3} fill="#dc2626" />
      <circle
        cx={start + n * 5.4 + 3.6}
        cy={n % 2 ? 4.5 : -4.5}
        r={2}
        fill="#fff"
        stroke="#64748b"
        strokeWidth={0.6}
      />
    </g>
  );
}

const BUBBLES = [
  { x: 52, y: 166, r: 13 },
  { x: 106, y: 150, r: 11 },
  { x: 82, y: 178, r: 9 },
];

function Flask({ id, boil }: { id: Liquid['id']; boil: boolean }) {
  const l = liquid(id);
  const count = vapourCount(id);
  const label = boil
    ? `${l.name} við 100 °C: gufubólur með heilum H₂O-sameindum inni í vökvanum.`
    : `${l.name} við 20 °C: ${sameindir(count)} í gufunni, ${formatDecimal(l.kPa, l.decimals)} kPa.`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={label}>
      <path
        d={`M10 10 H${W - 10} V${H - 14} Q${W - 10} ${H - 4} ${W - 22} ${H - 4} H22 Q10 ${H - 4} 10 ${H - 14} Z`}
        fill="#f8fafc"
        stroke="#64748b"
        strokeWidth="2"
      />
      <rect x={11} y={SURFACE} width={W - 22} height={H - 15 - SURFACE} fill="#bfdbfe" />
      {LIQUID_SLOTS.map((p, i) => (
        <Molecule key={`l${i}`} id={id} x={p.x} y={p.y} />
      ))}
      {boil
        ? BUBBLES.map((b, i) => (
            <g key={`b${i}`}>
              <circle cx={b.x} cy={b.y} r={b.r} fill="#f8fafc" stroke="#60a5fa" />
              <Molecule id="vatn" x={b.x - b.r / 3} y={b.y - b.r / 4} />
              <Molecule id="vatn" x={b.x + b.r / 3} y={b.y + b.r / 4} />
            </g>
          ))
        : VAPOUR_SLOTS.slice(0, count).map((p, i) => (
            <Molecule key={`v${i}`} id={id} x={p.x} y={p.y} />
          ))}
    </svg>
  );
}

interface NaermyndScreenProps {
  onBack: () => void;
}

export function NaermyndScreen({ onBack }: NaermyndScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [chosen, setChosen] = useState<Liquid['id']>('etanol');
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
  const flasks: Liquid['id'][] = step.flasks ?? ['vatn', chosen];
  const cols =
    flasks.length === 1
      ? 'max-w-56 grid-cols-1'
      : flasks.length === 2
        ? 'max-w-md grid-cols-2'
        : 'max-w-3xl grid-cols-2 sm:grid-cols-4';

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-3 sm:p-4 md:p-8 phone:p-3">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-4 shadow-2xl sm:p-6 md:p-8 phone:p-3">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="min-w-0 text-2xl font-bold text-warm-800 phone:text-base"
          >
            Nærmynd: gufa yfir vökva
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
          <h3 tabIndex={-1} className="mb-3 text-xl font-bold text-warm-800 phone:text-lg">
            {stepIndex + 1}. {step.title}
          </h3>
        </div>

        {step.flasks === null && (
          <fieldset className="mb-3 rounded-xl border-2 border-teal-200 bg-teal-50 p-3">
            <legend className="px-1 text-sm font-semibold text-teal-900">
              Vökvi við hlið vatns
            </legend>
            <div className="flex flex-wrap gap-2">
              {LIQUIDS.filter((l) => l.id !== 'vatn').map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setChosen(l.id)}
                  aria-pressed={l.id === chosen}
                  className={`rounded-lg border-2 px-3 py-1.5 text-sm pointer-coarse:min-h-11 ${
                    l.id === chosen
                      ? 'border-teal-700 bg-teal-700 text-white'
                      : 'border-teal-300 bg-white text-teal-900 hover:bg-teal-100'
                  }`}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <div className={`mx-auto mb-2 grid gap-3 phone:gap-2 ${cols}`}>
          {flasks.map((id) => {
            const l = liquid(id);
            return (
              <figure key={id} className="rounded-xl border border-warm-200 p-2">
                <Flask id={id} boil={!!step.boil} />
                <figcaption aria-live="polite" className="mt-1 text-center text-sm text-warm-800">
                  <span className="font-semibold">{l.name}</span> {l.formula}
                  <br />
                  {step.boil
                    ? '100 °C'
                    : `${formatDecimal(l.kPa, l.decimals)} kPa, ${sameindir(vapourCount(id))}`}
                </figcaption>
              </figure>
            );
          })}
        </div>
        <p className="mb-3 text-xs text-warm-500">
          {step.boil
            ? 'Bólurnar eru ekki teiknaðar á kvarða.'
            : `Hver sameind í gufunni stendur fyrir ${PER_KPA} kPa; í raun er gufan miklu þynnri en vökvinn.`}{' '}
          Rautt er súrefni, grátt kolefni og hvítt vetni; vetnisatómin á kolefninu eru ekki teiknuð.
          Gufunarþrýstingurinn er úr bókinni (kafli 10 og viðauki).
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
