/**
 * Varmamælingar og tengjaorka: q = m·c·ΔT, calorimeters and bond energies, from the book's
 * ch. 5 (m68724, m68726) and ch. 7 (m68741). Skilja and an ungraded Kanna come first, then Æfa:
 * ten problems, one attempt each, ending `N af M rétt` with no running score. A wrong answer
 * shows the worked solution, so it is not asked again.
 */

import { useId, useLayoutEffect, useRef, useState } from 'react';

import { Header } from '@shared/components';
import {
  DECIMAL_INPUT_PROPS,
  focusTarget,
  formatDecimal,
  parseStudentNumber,
  useArmedAfter,
  useItemTop,
  useRevealAfterCommit,
  useScreenTop,
} from '@shared/utils';

import { KANNA_METALS, VARMI_PROBLEMS, type VarmiSlip } from '../data/varmi';
import { BOND_ENERGY, SPECIFIC_HEAT, finalTemperature, heat, within } from '../engine/varmi';

interface Props {
  onBack: () => void;
}

/** The slip a wrong answer matches, if any. */
export function matchSlip(value: number, slips: readonly VarmiSlip[]): VarmiSlip | null {
  return slips.find((s) => within(value, s.value)) ?? null;
}

const WATER_G = 200;
const WATER_T = 20;
const METAL_T = 100;

function Kanna() {
  const [metal, setMetal] = useState<(typeof KANNA_METALS)[number]['id']>('al');
  const [mass, setMass] = useState(100);
  const c = SPECIFIC_HEAT[metal];
  const tf = finalTemperature([
    { massG: mass, c, t: METAL_T },
    { massG: WATER_G, c: SPECIFIC_HEAT.vatn, t: WATER_T },
  ]);
  const q = heat(WATER_G, SPECIFIC_HEAT.vatn, tf - WATER_T);
  const pos = ((tf - WATER_T) / (METAL_T - WATER_T)) * 100;
  return (
    <section
      aria-labelledby="varmi-kanna"
      className="space-y-3 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 p-4 phone:p-3"
    >
      <h3 id="varmi-kanna" className="text-lg font-bold text-teal-800">
        Kannaðu: heitur málmur í {WATER_G} g af vatni
      </h3>
      <p className="text-sm text-teal-900">
        Málmurinn er hitaður í sjóðandi vatni, {METAL_T} °C, og settur í vatn við {WATER_T} °C.
      </p>
      <fieldset>
        <legend className="mb-1 text-sm font-semibold text-teal-900">Málmur</legend>
        <div className="flex flex-wrap gap-2">
          {KANNA_METALS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMetal(m.id)}
              aria-pressed={m.id === metal}
              className={`rounded-lg border-2 px-3 py-1.5 text-sm pointer-coarse:min-h-11 ${
                m.id === metal
                  ? 'border-teal-700 bg-teal-700 text-white'
                  : 'border-teal-300 bg-white text-teal-900 hover:bg-teal-100'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="varmi-massi" className="block text-sm font-semibold text-teal-900">
          Massi málmsins: {mass} g
        </label>
        <input
          id="varmi-massi"
          type="range"
          min={20}
          max={400}
          step={10}
          value={mass}
          onChange={(e) => setMass(Number(e.target.value))}
          aria-valuetext={`${mass} g`}
          className="w-full"
        />
      </div>
      <div aria-hidden="true">
        <div className="relative h-4 rounded-full bg-gradient-to-r from-sky-200 to-red-300">
          <div
            className="absolute top-[-4px] h-6 w-1.5 -translate-x-1/2 rounded bg-warm-900"
            style={{ left: `${pos}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-warm-600">
          <span>{WATER_T} °C</span>
          <span>{METAL_T} °C</span>
        </div>
      </div>
      <p aria-live="polite" className="text-sm text-warm-900">
        Lokahitastig: <strong>{formatDecimal(tf, 1)} °C</strong>. Vatnið tók til sín{' '}
        {formatDecimal(q / 1000, 2)} kJ, og málmurinn gaf jafnmikið frá sér. Eðlisvarmi:{' '}
        {formatDecimal(c, 3)} J/(g·°C).
      </p>
      <p className="text-sm text-warm-700">
        Berðu saman ál og blý með sama massa: ál hefur næstum sjöfaldan eðlisvarma blýs og hitar
        vatnið miklu meira, þótt báðir málmarnir séu jafnheitir í upphafi.
      </p>
    </section>
  );
}

export function VarmiScreen({ onBack }: Props) {
  const [phase, setPhase] = useState<'skilja' | 'aefa'>('skilja');
  const titleRef = useRef<HTMLHeadingElement>(null);
  const startRef = useRef<HTMLHeadingElement>(null);
  useScreenTop(phase, { anyWidth: true, focus: phase === 'skilja' ? titleRef : startRef });
  useLayoutEffect(() => {
    focusTarget(titleRef.current);
  }, []);

  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [outcome, setOutcome] = useState<'rett' | 'rangt' | null>(null);
  const [slip, setSlip] = useState<VarmiSlip | null>(null);
  const [invalid, setInvalid] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const problem = index < VARMI_PROBLEMS.length ? VARMI_PROBLEMS[index] : null;

  const cardRef = useItemTop<HTMLDivElement>(index);
  const questionRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);
  const verdictRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  useRevealAfterCommit(outcome !== null, () => ({
    bottom: nextRef.current,
    tops: [questionRef.current, answerRef.current, verdictRef.current],
    focus: verdictRef.current,
  }));
  const armed = useArmedAfter(400, `${index}:${outcome !== null}`);
  const verdictId = useId();

  const check = () => {
    if (!problem || outcome !== null) return;
    const value = parseStudentNumber(typed.replace(/^\+/, ''));
    if (!Number.isFinite(value)) {
      setInvalid(`Skrifaðu svarið sem tölu í ${problem.unit}, t.d. −2,5.`);
      return;
    }
    setInvalid(null);
    const right = within(value, problem.answer);
    setOutcome(right ? 'rett' : 'rangt');
    setSlip(right ? null : matchSlip(value, problem.slips));
    if (right) setCorrect((n) => n + 1);
  };
  const clear = () => {
    setTyped('');
    setOutcome(null);
    setSlip(null);
    setInvalid(null);
  };
  const next = () => {
    clear();
    setIndex((i) => i + 1);
  };
  const restart = () => {
    clear();
    setCorrect(0);
    setIndex(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
      <Header
        variant="game"
        gameTitle="Lögmál Hess"
        backLabel="Til baka í valmynd"
        onBack={onBack}
      />
      <main className="mx-auto max-w-3xl px-4 py-6 phone:py-3">
        <div className="space-y-5 rounded-xl bg-white p-4 shadow-lg sm:p-6 md:p-8 phone:space-y-3 phone:p-3">
          <h2
            ref={titleRef}
            tabIndex={-1}
            data-item-start={phase === 'skilja' ? '' : undefined}
            className={`text-2xl font-bold text-teal-700 phone:text-xl ${phase === 'aefa' ? 'phone:sr-only' : ''}`}
          >
            Varmamælingar og tengjaorka
          </h2>

          {phase === 'skilja' ? (
            <>
              <section
                aria-labelledby="varmi-mcdt"
                className="space-y-2 rounded-xl bg-blue-50 p-4 phone:p-3"
              >
                <h3 id="varmi-mcdt" className="text-lg font-bold text-blue-800">
                  Varmi og eðlisvarmi
                </h3>
                <p className="text-sm text-blue-900">
                  <strong>Eðlisvarmi</strong> efnis, c, er varminn sem þarf til að hita 1 g af því
                  um 1 °C. Vatn hefur háan eðlisvarma, {formatDecimal(SPECIFIC_HEAT.vatn, 3)}{' '}
                  J/(g·°C); flestir málmar innan við 1 J/(g·°C). Varminn sem efni tekur til sín eða
                  gefur frá sér er
                </p>
                <p className="text-center font-mono text-blue-900">q = m · c · ΔT</p>
                <p className="text-sm text-blue-900">
                  með ΔT = T(lok) − T(upphaf). Hitni efnið er q jákvætt, kólni það er q neikvætt.
                  Massi sinnum eðlisvarmi, m·c, er <strong>varmarýmd</strong> hlutarins.
                </p>
              </section>

              <section
                aria-labelledby="varmi-maelir"
                className="space-y-2 rounded-xl bg-cyan-50 p-4 phone:p-3"
              >
                <h3 id="varmi-maelir" className="text-lg font-bold text-cyan-800">
                  Varmamælir
                </h3>
                <p className="text-sm text-cyan-900">
                  Í varmamæli fer enginn varmi út í umhverfið. Varminn sem hvarfið gefur frá sér
                  tekur lausnin til sín, svo
                </p>
                <p className="text-center font-mono text-cyan-900">q(hvarf) = −q(lausn)</p>
                <p className="text-sm text-cyan-900">
                  Hitni lausnin er hvarfið útvermið og q(hvarf) neikvætt. Í kaffibollavarmamæli er
                  lausnin talin eins og vatn, 1,0 g/mL og {formatDecimal(SPECIFIC_HEAT.vatn, 3)}{' '}
                  J/(g·°C). Í sprengivarmamæli hitnar sprengjan líka og varmarýmd hennar bætist við.
                </p>
              </section>

              <Kanna />

              <section
                aria-labelledby="varmi-tengi"
                className="space-y-2 rounded-xl bg-amber-50 p-4 phone:p-3"
              >
                <h3 id="varmi-tengi" className="text-lg font-bold text-amber-800">
                  Tengjaorka
                </h3>
                <p className="text-sm text-amber-900">
                  <strong>Tengjaorka</strong>, D, er orkan sem þarf til að rjúfa eitt mól af
                  tilteknu tengi í gasfasa, alltaf jákvæð tala. Að rjúfa tengi kostar orku, að mynda
                  tengi losar hana, svo vermibreyting hvarfs er um það bil
                </p>
                <p className="text-center font-mono text-amber-900">
                  ΔH ≈ Σ D(rofin tengi) − Σ D(mynduð tengi)
                </p>
                <p className="text-sm text-amber-900">
                  Gildin eru meðaltöl úr mörgum sameindum, svo þetta er mat. Til dæmis H₂ + Cl₂ →
                  2HCl: rofin eru H–H ({BOND_ENERGY['H–H']}) og Cl–Cl ({BOND_ENERGY['Cl–Cl']}),
                  mynduð tvö H–Cl ({BOND_ENERGY['H–Cl']}), svo ΔH ≈ {BOND_ENERGY['H–H']} +{' '}
                  {BOND_ENERGY['Cl–Cl']} − 2 × {BOND_ENERGY['H–Cl']} = −185 kJ. Myndunarvermi
                  bókarinnar gefur −184,6 kJ.
                </p>
              </section>

              <button
                type="button"
                onClick={() => setPhase('aefa')}
                className="game-btn w-full rounded-xl bg-green-600 py-3 font-bold text-white hover:bg-green-700"
              >
                Æfa: tíu dæmi →
              </button>
            </>
          ) : (
            <section aria-labelledby="varmi-aefa" className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h3 id="varmi-aefa" className="text-lg font-bold text-warm-800">
                  Æfðu þig
                </h3>
                <button
                  type="button"
                  onClick={() => setPhase('skilja')}
                  className="text-sm text-teal-700 underline pointer-coarse:-my-3 pointer-coarse:py-3"
                >
                  Skýring
                </button>
              </div>
              {problem ? (
                <div
                  ref={cardRef}
                  className="space-y-3 rounded-xl border-2 border-warm-200 p-4 phone:p-3"
                >
                  <div ref={questionRef} className="space-y-2">
                    <p className="text-sm text-warm-500">
                      Dæmi {index + 1} af {VARMI_PROBLEMS.length}
                    </p>
                    <h4
                      ref={startRef}
                      data-item-start
                      tabIndex={-1}
                      className="text-lg font-bold text-warm-800"
                    >
                      {problem.name}
                    </h4>
                    <p className="text-sm text-warm-700">{problem.setting}</p>
                    <ul className="space-y-0.5 font-mono text-sm text-warm-900">
                      {problem.given.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                    <p className="font-semibold text-warm-900">{problem.question}</p>
                  </div>

                  <div ref={answerRef} className="flex items-center gap-2">
                    <input
                      {...DECIMAL_INPUT_PROPS}
                      autoComplete="off"
                      value={typed}
                      onChange={(e) => setTyped(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter') return;
                        e.preventDefault();
                        check();
                      }}
                      enterKeyHint="done"
                      disabled={outcome !== null}
                      aria-label={`Svar í ${problem.unit}`}
                      className="w-36 min-w-0 rounded-lg border-2 border-warm-300 px-3 py-2 text-center font-mono text-lg disabled:bg-warm-100"
                    />
                    <span className="font-mono text-warm-700">{problem.unit}</span>
                  </div>

                  {outcome === null ? (
                    <>
                      {invalid && (
                        <p role="alert" className="text-sm font-semibold text-amber-800">
                          {invalid}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={check}
                        className="game-btn w-full rounded-lg bg-kvenno-orange px-4 py-3 font-semibold text-white hover:bg-kvenno-orange-600"
                      >
                        Athuga
                      </button>
                    </>
                  ) : (
                    <>
                      <div
                        ref={verdictRef}
                        role="group"
                        tabIndex={-1}
                        aria-labelledby={verdictId}
                        className={`space-y-2 rounded-lg border-2 p-3 ${
                          outcome === 'rett'
                            ? 'border-green-500 bg-green-50 text-green-900'
                            : 'border-red-400 bg-red-50 text-red-900'
                        }`}
                      >
                        <p id={verdictId} className="font-bold">
                          {outcome === 'rett'
                            ? 'Rétt!'
                            : `Ekki rétt. Svarið er ${problem.answerText} ${problem.unit}.`}
                        </p>
                        {slip && <p className="text-sm">{slip.text}</p>}
                        <ol className="list-decimal space-y-1 pl-5 text-sm">
                          {problem.steps.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ol>
                        <p className="text-xs opacity-80">Heimild: {problem.source}.</p>
                      </div>
                      <button
                        ref={nextRef}
                        type="button"
                        onClick={armed(next)}
                        className="game-btn w-full rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800"
                      >
                        {index + 1 < VARMI_PROBLEMS.length ? 'Næsta dæmi →' : 'Sjá niðurstöðu →'}
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div
                  ref={cardRef}
                  className="space-y-3 rounded-xl border-2 border-green-300 bg-green-50 p-4"
                >
                  <h4
                    ref={startRef}
                    data-item-start
                    tabIndex={-1}
                    className="text-lg font-bold text-green-900"
                  >
                    {correct} af {VARMI_PROBLEMS.length} rétt
                  </h4>
                  <p className="text-sm text-green-900">
                    Varmamælir mælir q með q = m·c·ΔT, og tengjaorka metur ΔH út frá tengjunum sem
                    rofna og myndast. Myndunarvermi gefur nákvæmara gildi.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={restart}
                      className="flex-1 rounded-xl bg-teal-700 py-3 font-bold text-white hover:bg-teal-800"
                    >
                      Byrja aftur
                    </button>
                    <button
                      type="button"
                      onClick={onBack}
                      className="flex-1 rounded-xl bg-warm-200 py-3 font-bold text-warm-700 hover:bg-warm-300"
                    >
                      ← Valmynd
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
