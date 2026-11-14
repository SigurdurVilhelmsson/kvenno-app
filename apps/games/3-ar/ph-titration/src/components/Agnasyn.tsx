import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { PhoneDisclosure } from '@shared/components';
import {
  focusTarget,
  formatDecimal,
  formatScientific,
  prefersReducedMotion,
  revealTop,
} from '@shared/utils';

import { NaOHDissolve } from './NaOHDissolve';
import { PARTICLE_LABEL, ParticleBeaker, ParticleGlyph } from './ParticleBeaker';
import { ProgressCurve } from './ProgressCurve';
import { STEPS, hhPH } from '../data/agnasyn-steps';
import {
  ML_PER_PARTICLE,
  PARTICLES_PER_MMOL,
  PKA,
  V_EQ,
  V_HALF,
  V_MAX,
  drawnCounts,
  isEquivalence,
  isStart,
  pHAt,
  particleCountsAt,
  speciesAt,
} from '../utils/agnasyn';

/**
 * Agnasýn: one titration, ediksýra with NaOH, shown three ways at once — the
 * particles in the flask, the equations, and the títrunarferill as it grows.
 * It is the game's Explore phase: nothing is graded and nothing is stored.
 *
 * Seven scenes walk the titration in order (`data/agnasyn-steps.tsx`), each
 * dripping in the NaOH from the previous scene's volume so the particles and
 * the curve move together; the eighth hands the student the búretta.
 */

/** Seconds per particle's worth of NaOH (1,25 mL) while a scene plays. */
const SECONDS_PER_DROP = 0.7;
const EXPLORE = STEPS.length;
const TOTAL = STEPS.length + 1;

interface AgnasynProps {
  onBack: () => void;
}

type SpeciesKey = 'HA' | 'A' | 'H3O' | 'OH' | 'Na';
const ROWS: SpeciesKey[] = ['HA', 'A', 'H3O', 'OH', 'Na'];

export function Agnasyn({ onBack }: AgnasynProps) {
  const [stepIndex, setStepIndex] = useState(0);
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
    // A scene plays from the one before it only when stepped to in order;
    // a jump, or a step back, shows the scene as it ends.
    if (next < EXPLORE) {
      const target = STEPS[next];
      fromRef.current = next === stepIndex + 1 ? volumeRef.current : target.volume;
      if (next === stepIndex + 1 && target.drip && volumeRef.current > target.volume) {
        fromRef.current = target.volume;
      }
    }
    setStepIndex(next);
  };

  const replayStep = () => {
    if (!step) return;
    const prev = stepIndex > 0 ? STEPS[stepIndex - 1].volume : 0;
    fromRef.current = prev;
    setDrip(false);
    setVolume(prev);
    setReplay((r) => r + 1);
  };

  // Each new scene: its title takes focus, and on a phone its top comes on screen.
  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    // At every width: a scene that adds a panel above (the NaOH dissolving) must not leave
    // its title above the screen. A title already on screen stays put.
    revealTop(stepTopRef.current, { anyWidth: true });
    focusTarget(stepTopRef.current?.querySelector('h3') ?? null);
  }, [stepIndex]);

  const counts = particleCountsAt(volume);
  const drawn = drawnCounts(counts);
  const species = speciesAt(volume);
  const pH = pHAt(volume);
  const exaggerated = counts.flag !== null;
  const dimSpectator = stepIndex >= 1;

  const beakerLabel =
    `Agnirnar í lausninni eftir ${formatDecimal(volume, 2)} mL af NaOH: ` +
    `${drawn.HA} CH₃COOH, ${drawn.A} CH₃COO⁻, ${drawn.H3O} H₃O⁺, ${drawn.OH} OH⁻ og ${drawn.Na} Na⁺.` +
    (exaggerated ? ' Ein jón er ýkt, svo hún sjáist.' : '');

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
          Agnasýn: ediksýra títruð með NaOH
        </h2>
        <p className="text-sm text-warm-600 mb-3">
          Sjáðu agnirnar í lausninni, jöfnurnar og títrunarferilinn breytast saman.
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
                <p key={i} className="font-mono text-sm sm:text-base lg:text-lg text-purple-900">
                  {e}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* The flask and the curve, side by side from a tablet up. */}
        <div className="space-y-3 mb-3">
          {step?.dissolve && (
            <div className="rounded-xl border border-warm-200 p-2">
              <div className="text-sm font-semibold text-warm-700 mb-1">Í búrettunni</div>
              <NaOHDissolve still={still} />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-warm-200 p-2">
              <div className="text-sm font-semibold text-warm-700 mb-1">
                Lausnin í keiluflöskunni, stækkuð
              </div>
              <ParticleBeaker
                volume={volume}
                drip={drip}
                still={still}
                dimSpectator={dimSpectator}
                label={beakerLabel}
              />
            </div>
            <div className="rounded-xl border border-warm-200 p-2 flex flex-col">
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <span className="text-sm font-semibold text-warm-700">Títrunarferill</span>
                <span className="text-sm text-warm-600 whitespace-nowrap">
                  {formatDecimal(volume, 2)} mL NaOH
                </span>
              </div>
              <ProgressCurve volume={volume} />
              <div
                className="mt-auto pt-1 text-center text-3xl font-bold text-purple-700 phone:text-2xl"
                aria-live="polite"
                aria-atomic="true"
              >
                {playing ? (
                  <span aria-hidden="true">pH = {formatDecimal(pH, 2)}</span>
                ) : (
                  <>pH = {formatDecimal(pH, 2)}</>
                )}
              </div>
            </div>
          </div>

          {/* What each kind of particle is. */}
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-warm-700">
            {ROWS.map((k) => (
              <li key={k} className="flex items-center gap-1">
                <ParticleGlyph kind={k} />
                {PARTICLE_LABEL[k]}
                {k === 'Na' && ' (meðjón)'}
              </li>
            ))}
            <li className="flex items-center gap-1">
              <ParticleGlyph kind="H3O" flag />
              strikahringur: ýkt, svo hún sjáist
            </li>
          </ul>
          <p className="text-xs text-warm-500">
            Hver ögn táknar {formatDecimal(1 / PARTICLES_PER_MMOL, 3)} mmól. Vatnssameindir eru ekki
            sýndar.
          </p>

          {stepIndex === EXPLORE && <ExploreControls volume={volume} onChange={setVolume} />}
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

        {/* What the scene means, and the numbers behind the picture. */}
        <div className="lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-6">
          <div className="space-y-3 text-warm-800 leading-relaxed mb-4">
            {step ? step.body : <ExploreText volume={volume} />}
            {(step?.note || (!step && exaggerated)) && (
              <p className="text-sm bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900">
                <strong>Ýkt:</strong>{' '}
                {step?.note ??
                  'Strikahringirnir sýna jón sem er í raun langt undir einni ögn, svo hún sjáist.'}
              </p>
            )}
          </div>
          <PhoneDisclosure summary="Agnir og styrkur">
            <table className="w-full text-sm">
              <caption className="sr-only">Agnir og styrkur hvers efnis</caption>
              <thead>
                <tr className="text-left text-warm-600">
                  <th className="font-semibold py-1">Efni</th>
                  <th className="font-semibold py-1 text-right">Agnir</th>
                  <th className="font-semibold py-1 text-right">Styrkur (M)</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((k) => (
                  <tr key={k} className="border-t border-warm-100">
                    <td className="py-1">{PARTICLE_LABEL[k]}</td>
                    <td className="py-1 text-right tabular-nums">{drawn[k]}</td>
                    <td className="py-1 text-right tabular-nums">
                      {species.conc[k] === 0 ? '0' : formatScientific(species.conc[k], 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-warm-500 mt-2">
              Fjöldi agna er námundaður, og ýktur þar sem strikahringur er. Styrkurinn er nákvæmur,
              reiknaður út frá K<sub>a</sub> og pH-gildinu.
            </p>
          </PhoneDisclosure>
        </div>
      </div>
    </div>
  );
}

function ExploreControls({ volume, onChange }: { volume: number; onChange: (v: number) => void }) {
  return (
    <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-3">
      <label htmlFor="agnasyn-volume" className="block text-sm font-semibold text-purple-900 mb-2">
        Rúmmál NaOH: {formatDecimal(volume, 2)} mL
      </label>
      <input
        id="agnasyn-volume"
        type="range"
        min={0}
        max={V_MAX}
        step={0.25}
        value={volume}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${formatDecimal(volume, 2)} mL, pH ${formatDecimal(pHAt(volume), 2)}`}
        className="w-full accent-purple-600 pointer-coarse:h-11"
      />
      <div className="flex flex-wrap gap-2 mt-2">
        {[
          { v: 0, label: 'Upphaf' },
          { v: V_HALF, label: 'Hálfjafngildispunktur' },
          { v: V_EQ, label: 'Jafngildispunktur' },
        ].map(({ v, label }) => (
          <button
            key={label}
            onClick={() => onChange(v)}
            className="text-sm px-3 py-1.5 rounded-lg border border-purple-300 bg-white text-purple-800 hover:bg-purple-100 pointer-coarse:min-h-11"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** What the explore scene says, by where the slider is. */
function ExploreText({ volume }: { volume: number }) {
  const c = particleCountsAt(volume);
  if (isStart(volume)) {
    return (
      <p>
        Engu NaOH hefur verið bætt við. Ediksýran er nær öll óklofin og pH ræðst af því litla sem
        klofnar: pH = {formatDecimal(pHAt(0), 2)}.
      </p>
    );
  }
  if (volume < V_EQ && !isEquivalence(volume)) {
    return (
      <>
        <p>
          Stuðpúðasvæði: hver OH⁻ sem bætt er við hefur breytt einni CH₃COOH í CH₃COO⁻. Bæði eru í
          lausninni og pH fylgir hlutfalli þeirra.
        </p>
        {c.HA > 0 && c.A > 0 && (
          <p>
            pH ≈ pK<sub>a</sub> + log({c.A}/{c.HA}) = {formatDecimal(PKA, 2)} + log({c.A}/{c.HA}) ={' '}
            {formatDecimal(hhPH(volume), 2)}
          </p>
        )}
        <p className="text-sm text-warm-600">
          Henderson-Hasselbalch reiknar hér með ögnum, sem eru námundaðar; pH-mælirinn notar
          nákvæman mólfjölda.
        </p>
      </>
    );
  }
  if (isEquivalence(volume)) {
    return (
      <p>
        Jafngildispunktur: öll CH₃COOH hefur hvarfast. Asetatjónirnar eru veikur basi og taka
        róteind frá vatni, svo pH = {formatDecimal(pHAt(V_EQ), 2)}, yfir 7.
      </p>
    );
  }
  return (
    <p>
      Eftir jafngildispunkt: {c.OH} OH⁻ hafa safnast upp, því engin CH₃COOH er eftir til að taka við
      þeim. pH ræðst af umfram OH⁻.
    </p>
  );
}
