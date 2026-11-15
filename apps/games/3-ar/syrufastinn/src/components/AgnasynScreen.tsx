/**
 * Agnasýn — the particles behind percent dissociation.
 *
 * Nothing is graded or stored. Three scenes show the same weak acid at three
 * concentrations and a weak acid beside a strong one; the fourth lets the
 * student pick any acid and concentration. Built on the shared particle view
 * (docs/particle-view-template.md), every number from `engine/agnasyn.ts`.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import {
  ParticleBeaker,
  ParticleGlyph,
  type GlyphText,
  type Species,
} from '@shared/components/ParticleBeaker';
import { focusTarget, formatDecimal, prefersReducedMotion, revealTop } from '@shared/utils';

import { useBackButton } from './BackButton';
import { CONCENTRATIONS, isAnswerable } from '../data/acids';
import type { WeakAcid } from '../data/acids';
import { STEPS, type GlassSpec } from '../data/agnasyn-steps';
import { EXPLORABLE_ACIDS } from '../data/problems';
import {
  UNITS,
  fraction,
  glyphText,
  strongCounts,
  strongPH,
  trueIons,
  weakCounts,
  weakPH,
  SCENE_ACID,
} from '../engine/agnasyn';

const EXPLORE = STEPS.length;
const TOTAL = STEPS.length + 1;

const M = (c: number) => `${formatDecimal(c, c < 0.1 ? 3 : c < 1 ? 2 : 1)} M`;

interface AgnasynScreenProps {
  onBack: () => void;
}

export function AgnasynScreen({ onBack }: AgnasynScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [acid, setAcid] = useState<WeakAcid>(SCENE_ACID);
  const [c, setC] = useState(0.1);
  const [still] = useState(prefersReducedMotion);
  const back = useBackButton(onBack);

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

  const step = stepIndex < EXPLORE ? STEPS[stepIndex] : null;
  const shownAcid = step ? SCENE_ACID : acid;
  const glasses: GlassSpec[] = step
    ? step.glasses
    : [
        { strong: true, c },
        { strong: false, c },
      ];

  const chooseAcid = (id: string) => {
    const next = EXPLORABLE_ACIDS.find((a) => a.id === id);
    if (!next) return;
    setAcid(next);
    if (!isAnswerable(next, c)) setC(CONCENTRATIONS.find((x) => isAnswerable(next, x)) ?? 1);
  };

  const text = glyphText(shownAcid);
  const legend: { kind: Species; label: string; text?: GlyphText }[] = [
    { kind: 'HA', label: `${shownAcid.formula}, óklofin sýra`, text },
    { kind: 'A', label: shownAcid.conjugateBase, text },
    { kind: 'H3O', label: 'H⁺' },
    ...(glasses.some((g) => g.strong) ? [{ kind: 'Cl' as const, label: 'Cl⁻' }] : []),
  ];

  // The set of glasses changes between the dilution scenes and the other two; a new set
  // starts its flasks fresh rather than morphing one picture into another.
  const setKey = glasses.map((g) => (g.strong ? 's' : 'w')).join('');

  return (
    <div className="mx-auto max-w-5xl">
      {back.above}

      <div className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:p-8 phone:p-3">
        <div className="phone:mb-2 phone:flex phone:items-baseline phone:gap-3">
          {back.inRow}
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="mb-2 text-2xl font-bold text-warm-800 phone:mb-0 phone:min-w-0 phone:flex-1 phone:text-base"
          >
            Agnasýn: hversu mikið klofnar?
          </h2>
          <span className="text-sm text-warm-600 whitespace-nowrap">
            Skref {stepIndex + 1} af {TOTAL}
          </span>
        </div>

        <nav aria-label="Skref" className="mb-4 phone:mb-3">
          <ol className="flex flex-wrap gap-1.5">
            {[...STEPS.map((s) => s.title), 'Kannaðu sjálf/ur'].map((title, i) => (
              <li key={title}>
                <button
                  type="button"
                  onClick={() => setStepIndex(i)}
                  aria-current={i === stepIndex ? 'step' : undefined}
                  title={title}
                  className={`min-w-9 h-9 px-2 rounded-lg text-sm font-semibold border-2 transition-colors pointer-coarse:min-h-11 ${
                    i === stepIndex
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'bg-white border-green-200 text-green-800 hover:bg-green-50'
                  }`}
                >
                  <span aria-hidden="true">{i + 1}</span>
                  <span className="sr-only">
                    {i + 1}. {title}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div ref={stepTopRef} className="scroll-mt-4">
          <h3 tabIndex={-1} className="mb-2 text-xl font-bold text-warm-800 phone:text-lg">
            {stepIndex + 1}. {step ? step.title : 'Kannaðu sjálf/ur'}
          </h3>
          {step && (
            <div className="mb-3 space-y-1 rounded-xl border border-green-200 bg-green-50 p-3 text-center">
              {step.equations.map((e) => (
                <p key={e} className="font-mono text-sm text-green-900 sm:text-base">
                  {e}
                </p>
              ))}
            </div>
          )}
        </div>

        <div
          className={`mb-3 grid gap-2 sm:gap-3 ${glasses.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'}`}
        >
          {glasses.map((g, i) => {
            const counts = g.strong ? strongCounts() : weakCounts(shownAcid, g.c);
            const pH = g.strong ? strongPH(g.c) : weakPH(shownAcid, g.c);
            const pct = g.strong ? 100 : fraction(shownAcid, g.c) * 100;
            const name = g.strong ? 'HCl' : shownAcid.formula;
            const label = g.strong
              ? `${M(g.c)} HCl: ${UNITS} H⁺ og ${UNITS} Cl⁻, engin óklofin sameind. pH ${formatDecimal(pH, 2)}.`
              : `${M(g.c)} ${name}: ${counts.HA} óklofnar sameindir, ${counts.A} ${shownAcid.conjugateBase} og ${counts.H3O} H⁺. pH ${formatDecimal(pH, 2)}.`;
            return (
              <div
                key={`${setKey}-${i}`}
                className="rounded-xl border border-warm-200 p-1.5 sm:p-2"
              >
                <div className="mb-1 text-sm font-semibold text-warm-700">
                  {M(g.c)} {name}
                </div>
                <ParticleBeaker
                  counts={counts}
                  fill={1}
                  drip={false}
                  still={still}
                  dimSpectator
                  label={label}
                  reagent={null}
                  height={glasses.length === 3 ? 220 : 260}
                  exchange={!g.strong}
                  text={text}
                />
                <div className="mt-1 text-center" aria-live="polite" aria-atomic="true">
                  <div className="text-xl font-bold text-green-800 phone:text-lg">
                    pH = {formatDecimal(pH, 2)}
                  </div>
                  <div className="text-sm text-warm-600">
                    {g.strong ? 'Klofnar öll' : `${formatDecimal(pct, 1)} % klofnað`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <ul className="mb-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-warm-700">
          {legend.map((l) => (
            <li key={l.kind} className="flex items-center gap-1">
              <ParticleGlyph kind={l.kind} text={l.text} />
              {l.label}
              {l.kind === 'Cl' && ' (meðjón)'}
            </li>
          ))}
        </ul>
        <p className="mb-4 text-xs text-warm-500">
          Hvert glas geymir {UNITS} sýrusameindir; vatnssameindir eru ekki sýndar. Fjöldi jóna er
          námundaður að heilli ögn; prósentan er nákvæm.
        </p>

        {!step && <ExploreControls acid={acid} c={c} onAcid={chooseAcid} onConcentration={setC} />}

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
            className="min-w-24 flex-1 rounded-xl border-2 border-green-300 px-4 py-3 font-semibold text-green-800 hover:bg-green-50 disabled:opacity-40"
          >
            ← Fyrra skref
          </button>
          {stepIndex < TOTAL - 1 ? (
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

        <div className="space-y-3 leading-relaxed text-warm-800">
          {step ? step.body : <ExploreText acid={acid} c={c} />}
        </div>
      </div>
    </div>
  );
}

interface ExploreControlsProps {
  acid: WeakAcid;
  c: number;
  onAcid: (id: string) => void;
  onConcentration: (c: number) => void;
}

function ExploreControls({ acid, c, onAcid, onConcentration }: ExploreControlsProps) {
  return (
    <div className="mb-4 space-y-3 rounded-xl border-2 border-green-200 bg-green-50 p-3">
      <div>
        <label htmlFor="agnasyn-acid" className="mb-1 block text-sm font-semibold text-green-900">
          Veik sýra
        </label>
        <select
          id="agnasyn-acid"
          value={acid.id}
          onChange={(e) => onAcid(e.target.value)}
          className="w-full rounded-lg border border-green-300 bg-white p-2 pointer-coarse:min-h-11"
        >
          {EXPLORABLE_ACIDS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}, {a.formula}
            </option>
          ))}
        </select>
      </div>
      <fieldset>
        <legend className="mb-1 text-sm font-semibold text-green-900">Styrkur beggja sýra</legend>
        <div className="flex flex-wrap gap-2">
          {CONCENTRATIONS.filter((x) => isAnswerable(acid, x)).map((x) => (
            <button
              key={x}
              type="button"
              onClick={() => onConcentration(x)}
              aria-pressed={x === c}
              className={`rounded-lg border-2 px-3 py-1.5 text-sm pointer-coarse:min-h-11 ${
                x === c
                  ? 'border-green-600 bg-green-600 text-white'
                  : 'border-green-300 bg-white text-green-900 hover:bg-green-100'
              }`}
            >
              {M(x)}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

function ExploreText({ acid, c }: { acid: WeakAcid; c: number }) {
  const ions = trueIons(acid, c);
  return (
    <>
      <p>
        Í {M(c)} lausn af {acid.nameDative} klofna {formatDecimal(fraction(acid, c) * 100, 1)} %
        sameindanna: {formatDecimal(ions, 1)} af {UNITS}
        {Math.round(ions) === 0 ? ', minna en ein ögn, svo engin jón er sýnd' : ''}. Í saltsýru af
        sama styrk klofna þær allar.
      </p>
      <p>
        Prófaðu aðra styrki: því þynnri sem lausnin er, því stærri hluti sýrunnar klofnar, en pH
        hækkar samt, því styrkur H⁺ lækkar.
      </p>
    </>
  );
}
