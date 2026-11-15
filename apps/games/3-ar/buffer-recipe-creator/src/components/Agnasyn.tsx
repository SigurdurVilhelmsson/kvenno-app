import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { PhoneDisclosure } from '@shared/components';
import {
  PARTICLE_LABEL,
  ParticleBeaker,
  ParticleGlyph,
  type Species,
} from '@shared/components/ParticleBeaker';
import { focusTarget, formatDecimal, prefersReducedMotion, revealTop } from '@shared/utils';

import { BufferCurve, CURVE_COLOR } from './BufferCurve';
import { STEPS } from '../data/agnasyn-steps';
import {
  ML_PER_PARTICLE,
  PARTICLES_PER_MMOL,
  PKA,
  V_CAPACITY_ACID,
  V_CAPACITY_BASE,
  V_MAX,
  V_SAMPLE,
  countsAfter,
  fillAt,
  pHAfter,
  type Glass,
  type Reagent,
} from '../engine/agnasyn';

/**
 * Agnasýn: a buffer beside pure water, with the same acid or base dripped into
 * both. The game's Explore phase: nothing is graded and nothing is stored.
 * Built on the shared particle view (docs/particle-view-template.md), with
 * every number from `engine/agnasyn.ts`.
 */

/** Seconds per particle's worth of reagent while a scene plays. */
const SECONDS_PER_DROP = 0.7;
const EXPLORE = STEPS.length;
const TOTAL = STEPS.length + 1;

const ROWS: Species[] = ['HA', 'A', 'H3O', 'OH', 'Na', 'Cl'];
const GLASS_NAME: Record<Glass, string> = { buffer: 'Stuðpúði', water: 'Hreint vatn' };
const REAGENT_NAME: Record<Reagent, string> = { HCl: 'saltsýru', NaOH: 'natríumhýdroxíði' };

interface AgnasynProps {
  onBack: () => void;
}

export function Agnasyn({ onBack }: AgnasynProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [reagent, setReagent] = useState<Reagent>('HCl');
  const [volume, setVolume] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [replay, setReplay] = useState(0);
  const [drip, setDrip] = useState(false);
  const [still] = useState(prefersReducedMotion);
  const fromRef = useRef(0);
  const volumeRef = useRef(0);
  volumeRef.current = volume;

  const headingRef = useRef<HTMLHeadingElement>(null);
  const stepTopRef = useRef<HTMLDivElement>(null);
  const firstStep = useRef(true);

  useLayoutEffect(() => {
    focusTarget(headingRef.current);
  }, []);

  const step = stepIndex < EXPLORE ? STEPS[stepIndex] : null;

  // Play a scene: drip from where the last one ended to this one's volume.
  useEffect(() => {
    if (!step) {
      setPlaying(false);
      setDrip(false);
      return;
    }
    const to = step.volume;
    const from = fromRef.current;
    if (!step.drip || to <= from || still) {
      setDrip(false);
      setVolume(to);
      setPlaying(false);
      return;
    }
    setDrip(true);
    setPlaying(true);
    const duration = Math.max(1, ((to - from) / ML_PER_PARTICLE) * SECONDS_PER_DROP) * 1000;
    const begin = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - begin) / duration);
      setVolume(from + (to - from) * k);
      if (k < 1) raf = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stepIndex, replay, step, still]);

  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(TOTAL - 1, index));
    if (next < EXPLORE) {
      const target = STEPS[next];
      // A scene plays from the one before it only when stepped to in order with the same
      // reagent; a jump, a step back or a change of reagent starts it from fresh glasses or
      // shows it as it ends.
      const inOrder = next === stepIndex + 1 && target.reagent === reagent;
      if (target.reagent !== reagent) {
        fromRef.current = 0;
        setVolume(0);
      } else if (!inOrder || volumeRef.current > target.volume) {
        fromRef.current = target.volume;
      } else {
        fromRef.current = volumeRef.current;
      }
      setReagent(target.reagent);
    }
    setStepIndex(next);
  };

  const replayStep = () => {
    if (!step) return;
    const prev =
      stepIndex > 0 && STEPS[stepIndex - 1].reagent === step.reagent
        ? STEPS[stepIndex - 1].volume
        : 0;
    fromRef.current = prev;
    setDrip(false);
    setVolume(prev);
    setReplay((r) => r + 1);
  };

  const chooseReagent = (r: Reagent) => {
    if (r === reagent) return;
    setReagent(r);
    setVolume(0);
  };

  // Each new scene: its title takes focus, and its top comes on screen.
  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    revealTop(stepTopRef.current, { anyWidth: true });
    focusTarget(stepTopRef.current?.querySelector('h3') ?? null);
  }, [stepIndex]);

  const glasses = (['buffer', 'water'] as const).map((glass) => {
    const counts = countsAfter(glass, reagent, volume);
    const pH = pHAfter(glass, reagent, volume);
    const parts = ROWS.filter((k) => (counts[k] ?? 0) > 0).map(
      (k) => `${counts[k]} ${PARTICLE_LABEL[k]}`
    );
    const label =
      `${GLASS_NAME[glass]} eftir ${formatDecimal(volume, 2)} mL af ${REAGENT_NAME[reagent]}: ` +
      (parts.length > 0 ? `${parts.join(', ')}.` : 'engar agnir sýndar.') +
      ` pH ${formatDecimal(pH, 2)}.`;
    return { glass, counts, pH, label };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 md:p-8 phone:px-3 phone:py-3 [overflow-anchor:none]">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 phone:p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <button
            onClick={onBack}
            className="text-warm-600 hover:text-warm-800 text-sm pointer-coarse:min-h-11"
          >
            ← Til baka
          </button>
          <div className="text-sm text-warm-600 whitespace-nowrap">
            Skref {stepIndex + 1} af {TOTAL}
          </div>
        </div>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-bold text-purple-700 phone:text-xl"
        >
          Agnasýn: stuðpúði og vatn
        </h2>
        <p className="text-sm text-warm-600 mb-3">
          Sama sýra eða basi fer í stuðpúða og í hreint vatn. Sjáðu hvað verður um agnirnar og
          pH-gildið.
        </p>

        {/* Every scene, for a teacher who wants to go straight to one. */}
        <nav aria-label="Skref" className="mb-4 phone:mb-3">
          <ol className="flex flex-wrap gap-1.5">
            {[...STEPS.map((s) => s.title), 'Kannaðu sjálf/ur'].map((title, i) => (
              <li key={title}>
                <button
                  onClick={() => goTo(i)}
                  aria-current={i === stepIndex ? 'step' : undefined}
                  title={title}
                  className={`min-w-9 h-9 px-2 rounded-lg text-sm font-semibold border-2 transition-colors pointer-coarse:min-h-11 ${
                    i === stepIndex
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50'
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

        {/* The scene's title and its equations. */}
        <div ref={stepTopRef} className="scroll-mt-4">
          <h3 tabIndex={-1} className="text-xl font-bold text-warm-800 mb-2 phone:text-lg">
            {stepIndex + 1}. {step ? step.title : 'Kannaðu sjálf/ur'}
          </h3>
          {step && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 space-y-1.5 mb-3 text-center">
              {step.equations.map((e, i) => (
                <p key={i} className="font-mono text-sm sm:text-base text-purple-900">
                  {e}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 mb-3">
          {/* The two glasses, side by side at every width: the comparison is the point. The
              curve sits beside them on a wide screen and below them on a narrow one. */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {glasses.map(({ glass, counts, pH, label }) => (
              <div key={glass} className="rounded-xl border border-warm-200 p-1.5 sm:p-2">
                <div className="flex items-baseline justify-between gap-1 mb-1">
                  <span className="text-sm font-semibold" style={{ color: CURVE_COLOR[glass] }}>
                    {GLASS_NAME[glass]}
                  </span>
                </div>
                <ParticleBeaker
                  counts={counts}
                  fill={fillAt(volume)}
                  drip={drip}
                  still={still}
                  dimSpectator
                  label={label}
                  reagent={reagent}
                />
                <div
                  className="text-center text-2xl font-bold phone:text-xl"
                  style={{ color: CURVE_COLOR[glass] }}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {playing ? (
                    <span aria-hidden="true">pH = {formatDecimal(pH, 2)}</span>
                  ) : (
                    <>
                      <span className="sr-only">{GLASS_NAME[glass]}: </span>pH ={' '}
                      {formatDecimal(pH, 2)}
                    </>
                  )}
                </div>
              </div>
            ))}
            <div className="col-span-2 lg:col-span-1 rounded-xl border border-warm-200 p-2 flex flex-col">
              <div className="text-sm font-semibold text-warm-700 mb-1">
                pH á móti viðbættri {reagent === 'HCl' ? 'saltsýru' : 'natríumhýdroxíði'}
              </div>
              <BufferCurve reagent={reagent} volume={volume} />
              <p className="text-xs text-warm-500 mt-1">
                Strikalínan sýnir hvar stuðpúðinn þrýtur. pH er reiknað nákvæmlega, út frá K
                <sub>a</sub> og öllum jónum lausnarinnar.
              </p>
            </div>
          </div>

          {/* What each kind of particle is. */}
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-warm-700">
            {ROWS.map((k) => (
              <li key={k} className="flex items-center gap-1">
                <ParticleGlyph kind={k} />
                {PARTICLE_LABEL[k]}
                {(k === 'Na' || k === 'Cl') && ' (meðjón)'}
              </li>
            ))}
          </ul>
          <p className="text-xs text-warm-500">
            Hver ögn táknar {formatDecimal(1 / PARTICLES_PER_MMOL, 2)} mmól, og hvert glas geymir{' '}
            {V_SAMPLE} mL. Vatnssameindir eru ekki sýndar, og ekki heldur þær H⁺ og OH⁻ sem vatnið
            og stuðpúðinn eiga sjálf: þær eru langt undir einni ögn.
          </p>

          {stepIndex === EXPLORE && (
            <ExploreControls
              reagent={reagent}
              volume={volume}
              onReagent={chooseReagent}
              onVolume={setVolume}
            />
          )}
        </div>

        {/* Back, replay, onward. */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => goTo(stepIndex - 1)}
            disabled={stepIndex === 0}
            className="flex-1 min-w-24 py-3 px-4 rounded-xl border-2 border-purple-300 text-purple-700 font-semibold hover:bg-purple-50 disabled:opacity-40"
          >
            ← Fyrra skref
          </button>
          {step?.drip && (
            <button
              onClick={replayStep}
              className="flex-1 min-w-24 py-3 px-4 rounded-xl border-2 border-purple-300 text-purple-700 font-semibold hover:bg-purple-50"
            >
              Spila aftur
            </button>
          )}
          {stepIndex < TOTAL - 1 ? (
            <button
              onClick={() => goTo(stepIndex + 1)}
              className="flex-1 min-w-24 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold"
            >
              Næsta skref →
            </button>
          ) : (
            <button
              onClick={onBack}
              className="flex-1 min-w-24 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold"
            >
              Til baka í valmynd
            </button>
          )}
        </div>

        {/* What the scene means, and the particles behind the picture. */}
        <div className="lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-6">
          <div className="space-y-3 text-warm-800 leading-relaxed mb-4">
            {step ? step.body : <ExploreText reagent={reagent} volume={volume} />}
          </div>
          <div>
            <PhoneDisclosure summary="Agnir í hvoru glasi">
              <table className="w-full text-sm">
                <caption className="sr-only">Fjöldi agna af hverju efni í hvoru glasi</caption>
                <thead>
                  <tr className="text-left text-warm-600">
                    <th className="font-semibold py-1">Efni</th>
                    <th className="font-semibold py-1 text-right">{GLASS_NAME.buffer}</th>
                    <th className="font-semibold py-1 text-right">{GLASS_NAME.water}</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((k) => (
                    <tr key={k} className="border-t border-warm-100">
                      <td className="py-1">{PARTICLE_LABEL[k]}</td>
                      {glasses.map(({ glass, counts }) => (
                        <td key={glass} className="py-1 text-right tabular-nums">
                          {counts[k] ?? 0}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-warm-500 mt-2">
                Hver ögn er {formatDecimal(1 / PARTICLES_PER_MMOL, 2)} mmól. Agnirnar eru reiknaðar
                af hlutföllum efnahvarfsins og eru heilar tölur, svo ekkert er námundað.
              </p>
            </PhoneDisclosure>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ExploreControlsProps {
  reagent: Reagent;
  volume: number;
  onReagent: (r: Reagent) => void;
  onVolume: (v: number) => void;
}

function ExploreControls({ reagent, volume, onReagent, onVolume }: ExploreControlsProps) {
  return (
    <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-3">
      <fieldset className="mb-2">
        <legend className="text-sm font-semibold text-purple-900 mb-1">Hvað fer í glösin?</legend>
        <div className="flex flex-wrap gap-2">
          {(['HCl', 'NaOH'] as const).map((r) => (
            <button
              key={r}
              onClick={() => onReagent(r)}
              aria-pressed={reagent === r}
              className={`text-sm px-3 py-1.5 rounded-lg border-2 pointer-coarse:min-h-11 ${
                reagent === r
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'bg-white border-purple-300 text-purple-800 hover:bg-purple-100'
              }`}
            >
              {r === 'HCl' ? 'Saltsýra, HCl' : 'Natríumhýdroxíð, NaOH'}
            </button>
          ))}
        </div>
      </fieldset>
      <label htmlFor="agnasyn-volume" className="block text-sm font-semibold text-purple-900 mb-2">
        Rúmmál {reagent}: {formatDecimal(volume, 2)} mL
      </label>
      <input
        id="agnasyn-volume"
        type="range"
        min={0}
        max={V_MAX}
        step={ML_PER_PARTICLE}
        value={volume}
        onChange={(e) => onVolume(Number(e.target.value))}
        aria-valuetext={`${formatDecimal(volume, 2)} mL, pH stuðpúðans ${formatDecimal(
          pHAfter('buffer', reagent, volume),
          2
        )}, pH vatnsins ${formatDecimal(pHAfter('water', reagent, volume), 2)}`}
        className="w-full accent-purple-600 pointer-coarse:h-11"
      />
    </div>
  );
}

/** What the explore scene says, by where the slider is. */
function ExploreText({ reagent, volume }: { reagent: Reagent; volume: number }) {
  const capacity = reagent === 'HCl' ? V_CAPACITY_ACID : V_CAPACITY_BASE;
  const c = countsAfter('buffer', reagent, volume);
  const ion = reagent === 'HCl' ? 'H⁺' : 'OH⁻';
  if (volume === 0) {
    return (
      <p>
        Veldu saltsýru eða natríumhýdroxíð og dragðu sleðann. Stuðpúðinn byrjar í pH ={' '}
        {formatDecimal(PKA, 2)}, vatnið í pH {formatDecimal(pHAfter('water', reagent, 0), 2)}.
      </p>
    );
  }
  if (volume < capacity) {
    return (
      <>
        <p>
          Stuðpúðinn hefur tekið við hverri {ion} sem bætt var við. Nú eru {c.HA} CH₃COOH og {c.A}{' '}
          CH₃COO⁻:
        </p>
        <p>
          pH ≈ {formatDecimal(PKA, 2)} + log({c.A}/{c.HA}) ={' '}
          {formatDecimal(PKA + Math.log10(c.A / c.HA), 2)}
        </p>
        <p>
          Vatnið hefur ekkert til að taka við þeim og er komið í pH{' '}
          {formatDecimal(pHAfter('water', reagent, volume), 2)}.
        </p>
      </>
    );
  }
  return (
    <p>
      Stuðpúðinn er búinn: {reagent === 'HCl' ? 'engin CH₃COO⁻' : 'engin CH₃COOH'} er eftir til að
      taka við {ion}, svo hún verður eftir í lausninni eins og í vatninu. pH stuðpúðans er{' '}
      {formatDecimal(pHAfter('buffer', reagent, volume), 2)}.
    </p>
  );
}
