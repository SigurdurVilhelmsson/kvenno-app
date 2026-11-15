import { useId, useRef, useState } from 'react';

import { ScientificInput } from '@shared/components';
import {
  DECIMAL_INPUT_PROPS,
  INVALID_ENTRY_MESSAGE,
  formatDecimal,
  formatScientific,
  gradeScientific,
  parseStudentNumber,
  useArmedAfter,
  useItemTop,
  useRevealAfterCommit,
  useScreenTop,
} from '@shared/utils';

import { GIBBS_K_PROBLEMS, problemDeltaG, type GibbsKProblem } from '../data/gibbs-k';
import { formatRounded } from '../utils/format';
import {
  K_TOLERANCE,
  R_J,
  deltaGFromK,
  deltaGSlip,
  isGibbsDeltaGCorrect,
  kFromDeltaG,
  kJPerDecade,
  kSlip,
  type GibbsSlip,
} from '../utils/gibbs-k';
import { toggleSign } from '../utils/sign';

/**
 * ΔG° og K: ΔG° = −RT ln K, taught, explored and then practised.
 *
 * The rest of the game stops at the sign of ΔG°. This screen says how large K is: the sign
 * decides whether K is above or below 1, and the size of ΔG° decides by how many powers of ten
 * (every 5,7 kJ/mól at 298 K is one). The book teaches it in m68819, "Frjáls orka og jafnvægi".
 *
 * Kanna is ungraded; Æfa grades six problems, one attempt each, and ends `N af M rétt` with no
 * running score. A wrong answer shows the worked solution, so it is not asked again.
 */

interface Props {
  rootRef: (el: HTMLDivElement | null) => void;
  onBack: () => void;
}

/** The ΔG° slider's range and start, kJ/mól. */
const SLIDER = { min: -60, max: 60, start: -10 } as const;
/** Kanna's temperature: the one the book's table of ΔG° and K assumes. */
const EXPLORE_T = 298;
/** The log bar's ends, powers of ten. ±60 kJ/mól at 298 K is about ±10,5. */
const BAR_DECADES = 10;

/** K as a student would write it: plain between 0,01 and 1000, else scientific. */
export function formatK(k: number): string {
  if (k >= 0.01 && k < 1000) {
    const rounded = Number(k.toPrecision(2));
    const decimals = Math.max(0, 1 - Math.floor(Math.log10(rounded)));
    return formatDecimal(rounded, decimals);
  }
  return formatScientific(k, 2);
}

type Composition = 'myndefni' | 'hvarfefni' | 'svipad';

function composition(deltaG: number): Composition {
  if (deltaG === 0) return 'svipad';
  return deltaG < 0 ? 'myndefni' : 'hvarfefni';
}

const COMPOSITION_TEXT: Record<Composition, string> = {
  myndefni: 'K > 1: meira af myndefnum við jafnvægi',
  hvarfefni: 'K < 1: meira af hvarfefnum við jafnvægi',
  svipad: 'K = 1: svipað magn af hvarfefnum og myndefnum',
};

const SLIP_TEXT: Record<GibbsSlip, string> = {
  formerki:
    'Formerkið snerist við: þú fékkst 1/K í stað K, eða −ΔG° í stað ΔG°. Í ΔG° = −RT ln K er mínus, og neikvætt ΔG° gefur K > 1.',
  kilojoule:
    'ΔG° var ekki breytt í J/mól. R er 8,314 J/(mól·K), svo ΔG° í kJ/mól þarf að margfalda með 1000 fyrst.',
  log10: 'Þú notaðir log (tugalógaritma) í stað ln. Jafnan notar náttúrlega lógaritmann, ln og eˣ.',
};

/** What a problem asks for, in one sentence. */
function question(p: GibbsKProblem): string {
  return p.kind === 'G-fra-K'
    ? `Reiknaðu ΔG° við ${p.temp} K.`
    : `Reiknaðu ${p.symbol} við ${p.temp} K.`;
}

function asksForK(p: GibbsKProblem): boolean {
  return p.kind !== 'G-fra-K';
}

/** The answer: K for the first two kinds, ΔG° (kJ/mól) for the third. */
export function answerOf(p: GibbsKProblem): number {
  if (p.kind === 'G-fra-K') return deltaGFromK(p.k, p.temp);
  return kFromDeltaG(problemDeltaG(p)!, p.temp);
}

/** RT in J/mól, as the worked solution prints it. */
const rt = (temp: number) => R_J * temp;

function Solution({ p }: { p: GibbsKProblem }) {
  const RT = rt(p.temp);
  if (p.kind === 'G-fra-K') {
    const answer = deltaGFromK(p.k, p.temp);
    return (
      <ol className="list-decimal space-y-1 pl-5 text-sm">
        <li>
          ln {p.symbol} = ln {formatK(p.k)} = {formatDecimal(Math.log(p.k), 3)}
        </li>
        <li>
          RT = 8,314 × {p.temp} = {formatDecimal(RT, 0)} J/mól
        </li>
        <li>
          ΔG° = −RT ln {p.symbol} = −{formatDecimal(RT, 0)} × ({formatDecimal(Math.log(p.k), 3)}) ={' '}
          {formatDecimal(answer * 1000, 0)} J/mól ={' '}
          <strong className="whitespace-nowrap">{formatRounded(answer, 1)} kJ/mól</strong>
        </li>
      </ol>
    );
  }
  const deltaG = problemDeltaG(p)!;
  const exponent = (-deltaG * 1000) / RT;
  return (
    <ol className="list-decimal space-y-1 pl-5 text-sm">
      {p.kind === 'K-fra-HS' && (
        <li>
          ΔG° = ΔH° − TΔS° = {formatDecimal(p.deltaH)} − {p.temp} × (
          {formatDecimal(p.deltaS / 1000, 3)}) ={' '}
          <span className="whitespace-nowrap">{formatRounded(deltaG, 1)} kJ/mól</span>
        </li>
      )}
      <li>
        −ΔG°/RT = −({formatDecimal(deltaG * 1000, 0)} J/mól) / (8,314 × {p.temp} J/mól) ={' '}
        {formatDecimal(exponent, 2)}
      </li>
      <li>
        {p.symbol} = e<sup>{formatDecimal(exponent, 2)}</sup> ={' '}
        <strong className="whitespace-nowrap">{formatK(kFromDeltaG(deltaG, p.temp))}</strong>
      </li>
    </ol>
  );
}

export function GibbsKScreen({ rootRef, onBack }: Props) {
  const [slider, setSlider] = useState<number>(SLIDER.start);
  const exploreK = kFromDeltaG(slider, EXPLORE_T);
  const decade = kJPerDecade(EXPLORE_T);
  const logK = Math.log10(exploreK);
  const barPos =
    (Math.max(-BAR_DECADES, Math.min(BAR_DECADES, logK)) + BAR_DECADES) / (2 * BAR_DECADES);

  // Skilja and Kanna first, then Æfa as a screen of its own, so a problem opens at the top of
  // the page with its name focused, as every other loop in the game does.
  const [phase, setPhase] = useState<'skilja' | 'aefa'>('skilja');
  const titleRef = useRef<HTMLHeadingElement>(null);
  const startRef = useRef<HTMLHeadingElement>(null);
  useScreenTop(phase, { anyWidth: true, focus: phase === 'skilja' ? titleRef : startRef });

  const [index, setIndex] = useState(0);
  const [mantissa, setMantissa] = useState('');
  const [exponent, setExponent] = useState('');
  const [typedG, setTypedG] = useState('');
  const [outcome, setOutcome] = useState<'rett' | 'rangt' | null>(null);
  const [slip, setSlip] = useState<GibbsSlip | null>(null);
  const [powerOff, setPowerOff] = useState(false);
  const [invalid, setInvalid] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const done = index >= GIBBS_K_PROBLEMS.length;
  const problem = done ? null : GIBBS_K_PROBLEMS[index];

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
  const answerLabelId = useId();

  const check = () => {
    if (!problem || outcome !== null) return;
    const answer = answerOf(problem);
    if (problem.kind !== 'G-fra-K') {
      const graded = gradeScientific({ mantissa, exponent }, answer, K_TOLERANCE);
      if (graded.outcome === 'ogilt') {
        setInvalid(
          graded.reason === 'tomt' || !graded.reason
            ? 'Fylltu í báða reitina, tölu og veldisvísi, t.d. 3,2 og −1.'
            : INVALID_ENTRY_MESSAGE[graded.reason]
        );
        return;
      }
      setInvalid(null);
      const right = graded.outcome === 'rett';
      setOutcome(right ? 'rett' : 'rangt');
      setPowerOff(graded.outcome === 'veldisvisir');
      setSlip(right ? null : kSlip(graded.value, problemDeltaG(problem)!, problem.temp));
      if (right) setCorrect((c) => c + 1);
    } else {
      const value = parseStudentNumber(typedG);
      if (!Number.isFinite(value)) {
        setInvalid('Skrifaðu ΔG° sem tölu í kJ/mól, t.d. 12,5 eða −12,5.');
        return;
      }
      setInvalid(null);
      const right = isGibbsDeltaGCorrect(typedG, answer);
      setOutcome(right ? 'rett' : 'rangt');
      setPowerOff(false);
      setSlip(right ? null : deltaGSlip(value, problem.k, problem.temp));
      if (right) setCorrect((c) => c + 1);
    }
  };

  const clear = () => {
    setMantissa('');
    setExponent('');
    setTypedG('');
    setOutcome(null);
    setSlip(null);
    setPowerOff(false);
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
    <div
      ref={rootRef}
      className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4 md:p-8 phone:p-3"
    >
      <div className="mx-auto max-w-3xl space-y-5 rounded-2xl bg-white p-4 shadow-2xl sm:p-6 md:p-8 phone:space-y-3 phone:p-3">
        <button
          onClick={onBack}
          className="text-sm text-warm-600 hover:text-warm-800 pointer-coarse:-mt-3 pointer-coarse:mb-2 pointer-coarse:py-3"
        >
          ← Til baka í valmynd
        </button>
        <h2
          ref={titleRef}
          data-item-start={phase === 'skilja' ? '' : undefined}
          // In Æfa the problem's own name heads the card; on a phone the title steps aside so the
          // problem, its answer and Athuga share the first screen (an SE is 548 px tall).
          className={`text-2xl font-bold text-indigo-700 phone:text-xl ${phase === 'aefa' ? 'phone:sr-only' : ''}`}
        >
          ΔG° og jafnvægisfastinn K
        </h2>

        {phase === 'skilja' ? (
          <>
            {/* Skilja */}
            <section
              aria-labelledby="gibbsk-skilja"
              className="space-y-3 rounded-xl bg-blue-50 p-4 phone:p-3"
            >
              <h3 id="gibbsk-skilja" className="text-lg font-bold text-blue-800">
                Frá formerki til stærðar
              </h3>
              <p className="text-sm text-blue-900">
                Formerki ΔG° segir hvort hvarf er sjálfgengt við staðalaðstæður. Jafnvægisfastinn K
                segir hversu langt það gengur. Við jafnvægi er ΔG = 0 og Q = K, og þá tengir þessi
                jafna þetta tvennt:
              </p>
              <p className="text-center font-mono text-lg text-blue-900">
                ΔG° = −RT ln K <span className="mx-2 text-blue-500">⇔</span> K = e<sup>−ΔG°/RT</sup>
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-blue-900">
                <li>
                  R = 8,314 J/(mól·K), svo ΔG° þarf að vera í <strong>J/mól</strong>: margfaldaðu
                  kJ/mól með 1000.
                </li>
                <li>T er í kelvinum.</li>
                <li>
                  Fyrir lofttegundir er K reiknað út frá þrýstingi (Kp), fyrir lausnir út frá styrk.
                  Ksp og Ka eru líka jafnvægisfastar.
                </li>
                <li>
                  Hér eru ΔH° og ΔS° talin óháð hitastigi, eins og alls staðar í leiknum. Það er
                  nálgun, en góð.
                </li>
              </ul>
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Samband ΔG° og K</caption>
                <thead>
                  <tr className="text-blue-800">
                    <th scope="col" className="py-1 pr-2">
                      ΔG°
                    </th>
                    <th scope="col" className="py-1 pr-2">
                      K
                    </th>
                    <th scope="col" className="py-1">
                      Við jafnvægi
                    </th>
                  </tr>
                </thead>
                <tbody className="text-blue-900">
                  <tr>
                    <td className="py-1 pr-2">&lt; 0</td>
                    <td className="py-1 pr-2">&gt; 1</td>
                    <td className="py-1">Meira af myndefnum</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-2">= 0</td>
                    <td className="py-1 pr-2">= 1</td>
                    <td className="py-1">Svipað magn af hvarfefnum og myndefnum</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-2">&gt; 0</td>
                    <td className="py-1 pr-2">&lt; 1</td>
                    <td className="py-1">Meira af hvarfefnum</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Kanna */}
            <section
              aria-labelledby="gibbsk-kanna"
              className="space-y-3 rounded-xl border border-indigo-200 bg-gradient-to-br from-blue-50 to-purple-50 p-4 phone:p-3"
            >
              <h3 id="gibbsk-kanna" className="text-lg font-bold text-indigo-800">
                Kannaðu: ΔG° og K við {EXPLORE_T} K
              </h3>
              <label htmlFor="thermo-gibbsk-dg" className="block font-semibold">
                ΔG° = {formatRounded(slider, 0)} kJ/mól
              </label>
              <input
                id="thermo-gibbsk-dg"
                type="range"
                min={SLIDER.min}
                max={SLIDER.max}
                step={1}
                value={slider}
                onChange={(e) => setSlider(parseInt(e.target.value, 10))}
                className="w-full"
                aria-valuetext={`${formatRounded(slider, 0)} kílójúl á mól`}
              />
              <div className="flex justify-between text-xs text-warm-500">
                <span>{SLIDER.min} kJ/mól</span>
                <span>+{SLIDER.max} kJ/mól</span>
              </div>
              <div
                aria-live="polite"
                className="rounded-lg border-2 border-indigo-300 bg-white p-3"
              >
                <div className="text-xl font-bold text-indigo-900" data-gibbsk-k>
                  K = {formatK(exploreK)}
                </div>
                <div className="text-sm text-indigo-800">
                  {COMPOSITION_TEXT[composition(slider)]}
                </div>
              </div>
              {/* K on a log axis: the marker moves one tenth of the bar per power of ten. */}
              <div aria-hidden="true">
                <div className="relative h-4 rounded-full bg-gradient-to-r from-red-200 via-yellow-100 to-green-200">
                  <div className="absolute inset-y-0 left-1/2 w-px bg-warm-500" />
                  <div
                    className="absolute top-1/2 h-6 w-2 -translate-x-1/2 -translate-y-1/2 rounded bg-indigo-700"
                    style={{ left: `${barPos * 100}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs text-warm-600">
                  <span>10⁻¹⁰</span>
                  <span>K = 1</span>
                  <span>10¹⁰</span>
                </div>
              </div>
              <p className="text-sm text-warm-700">
                K breytist ekki línulega með ΔG°: við {EXPLORE_T} K tífaldast K fyrir hverja{' '}
                <strong className="whitespace-nowrap">{formatDecimal(decade, 1)} kJ/mól</strong> sem
                ΔG° lækkar (RT ln 10). Hvarf með ΔG° = −60 kJ/mól hefur K um 10¹⁰.
              </p>
            </section>

            <button
              type="button"
              onClick={() => setPhase('aefa')}
              className="game-btn w-full rounded-xl bg-green-600 py-3 font-bold text-white hover:bg-green-700"
            >
              Æfa: sex dæmi →
            </button>
          </>
        ) : (
          <section aria-labelledby="gibbsk-aefa" className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <h3 id="gibbsk-aefa" className="text-lg font-bold text-warm-800">
                Æfðu þig
              </h3>
              <button
                type="button"
                onClick={() => setPhase('skilja')}
                className="text-sm text-indigo-700 underline pointer-coarse:-my-3 pointer-coarse:py-3"
              >
                Skýring og sleði
              </button>
            </div>
            <p className="font-mono text-sm text-warm-700">ΔG° = −RT ln K, R = 8,314 J/(mól·K)</p>
            {problem ? (
              <div
                ref={cardRef}
                className="space-y-3 rounded-xl border-2 border-warm-200 p-4 phone:p-3"
              >
                <div ref={questionRef} className="space-y-2">
                  <p className="text-sm text-warm-500">
                    Dæmi {index + 1} af {GIBBS_K_PROBLEMS.length}
                  </p>
                  <h4
                    ref={startRef}
                    id="thermo-gibbsk-problem"
                    data-item-start
                    className="text-lg font-bold text-warm-800"
                  >
                    {problem.name}
                  </h4>
                  <p className="font-mono text-lg text-warm-900">{problem.reaction}</p>
                  <ul className="space-y-0.5 text-sm text-warm-800" data-gibbsk-given>
                    {problem.kind === 'K-fra-G' && (
                      <li>
                        ΔG° = {formatRounded(problem.deltaG, 1)} kJ/mól ({problem.source})
                      </li>
                    )}
                    {problem.kind === 'K-fra-HS' && (
                      <>
                        <li>ΔH° = {formatDecimal(problem.deltaH)} kJ/mól</li>
                        <li>ΔS° = {formatDecimal(problem.deltaS)} J/(mól·K)</li>
                      </>
                    )}
                    {problem.kind === 'G-fra-K' && (
                      <li>
                        {problem.symbol} = {formatK(problem.k)} við {problem.temp} K (
                        {problem.source})
                      </li>
                    )}
                    <li>T = {problem.temp} K</li>
                  </ul>
                  <p className="text-sm text-warm-600">{problem.note}</p>
                  <p className="font-semibold text-warm-900">{question(problem)}</p>
                </div>

                <div ref={answerRef} role="group" aria-labelledby={answerLabelId}>
                  <p id={answerLabelId} className="mb-1 text-sm font-semibold text-warm-700">
                    {asksForK(problem) ? `Svar: ${problem.symbol}` : 'Svar: ΔG° (kJ/mól)'}
                  </p>
                  {asksForK(problem) ? (
                    <ScientificInput
                      mantissa={mantissa}
                      exponent={exponent}
                      onMantissaChange={setMantissa}
                      onExponentChange={setExponent}
                      mantissaPlaceholder="3,2"
                      exponentPlaceholder="-1"
                      disabled={outcome !== null}
                      onSubmit={check}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        {...DECIMAL_INPUT_PROPS}
                        autoComplete="off"
                        id="thermo-gibbsk-answer"
                        value={typedG}
                        onChange={(e) => setTypedG(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key !== 'Enter') return;
                          e.preventDefault();
                          check();
                        }}
                        enterKeyHint="done"
                        disabled={outcome !== null}
                        placeholder="12,5"
                        aria-label="ΔG° í kJ/mól"
                        className="w-32 min-w-0 rounded-lg border-2 border-warm-300 px-3 py-2 text-center font-mono text-lg disabled:bg-warm-100"
                      />
                      <span className="font-mono text-warm-700">kJ/mól</span>
                      <button
                        type="button"
                        onClick={() => setTypedG(toggleSign(typedG))}
                        disabled={outcome !== null}
                        aria-label="Skipta um formerki"
                        className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-warm-300 bg-white font-mono text-lg text-warm-700 disabled:opacity-60 pointer-coarse:inline-flex"
                      >
                        ±
                      </button>
                    </div>
                  )}
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
                      id="thermo-gibbsk-feedback"
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
                        {outcome === 'rett' ? 'Rétt!' : 'Ekki rétt.'}
                      </p>
                      {slip && <p className="text-sm">{SLIP_TEXT[slip]}</p>}
                      {!slip && powerOff && (
                        <p className="text-sm">
                          Tölustafirnir eru réttir en veldisvísirinn ekki. Athugaðu hvernig e
                          <sup>x</sup> var breytt í tíu í veldi.
                        </p>
                      )}
                      <Solution p={problem} />
                    </div>
                    <button
                      ref={nextRef}
                      type="button"
                      onClick={armed(next)}
                      className="game-btn w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700"
                    >
                      {index + 1 < GIBBS_K_PROBLEMS.length ? 'Næsta dæmi →' : 'Sjá niðurstöðu →'}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div
                ref={cardRef}
                className="space-y-3 rounded-xl border-2 border-green-300 bg-green-50 p-4"
              >
                <h4 ref={startRef} data-item-start className="text-lg font-bold text-green-900">
                  {correct} af {GIBBS_K_PROBLEMS.length} rétt
                </h4>
                <p className="text-sm text-green-900">
                  Formerki ΔG° segir í hvora áttina hvarf gengur, og stærð þess segir hversu langt.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={restart}
                    className="flex-1 rounded-xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700"
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
    </div>
  );
}
