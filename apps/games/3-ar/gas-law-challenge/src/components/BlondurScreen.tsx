/**
 * Gasblöndur og efnahvörf: Dalton's law, mole fractions, gas collected over water and volumes
 * in reactions, the book's ch. 9 module m68752. Skilja and an ungraded Kanna come first, then
 * Æfa as a screen of its own: eight problems, one attempt each, ending `N af M rétt` with no
 * running score. A wrong answer shows the worked solution, so it is not asked again.
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

import { BLONDUR_PROBLEMS, KANNA, shownAnswer, type BlondurSlip } from '../data/blondur';
import { kelvin, moleFractions, pressureOf, within } from '../engine/blondur';

interface Props {
  rootRef?: (el: HTMLDivElement | null) => void;
  onBack: () => void;
}

/** The Kanna bar's full scale, atm: 1,2 mól in 10,0 L at 25 °C is 2,93 atm. */
const BAR_MAX_ATM = 3;

/** The slip a wrong answer matches, if any. */
export function matchSlip(value: number, slips: readonly BlondurSlip[]): BlondurSlip | null {
  return slips.find((s) => within(value, s.value)) ?? null;
}

function Kanna() {
  const [moles, setMoles] = useState<number[]>(() => KANNA.gases.map((g) => g.start));
  const T = kelvin(KANNA.celsius);
  const fractions = moleFractions(moles);
  const partial = moles.map((n) => pressureOf(n, KANNA.volume, T));
  const total = partial.reduce((a, b) => a + b, 0);
  return (
    <section
      aria-labelledby="blondur-kanna"
      className="space-y-3 rounded-xl border border-indigo-200 bg-gradient-to-br from-blue-50 to-purple-50 p-4 phone:p-3"
    >
      <h3 id="blondur-kanna" className="text-lg font-bold text-indigo-800">
        Kannaðu: þrjár lofttegundir í {formatDecimal(KANNA.volume, 1)} L við {KANNA.celsius} °C
      </h3>
      {KANNA.gases.map((g, i) => (
        <div key={g.formula}>
          <label htmlFor={`gas-blondur-${i}`} className="block text-sm font-semibold">
            {g.name}, {g.formula}: {formatDecimal(moles[i], 2)} mól
          </label>
          <input
            id={`gas-blondur-${i}`}
            type="range"
            min={0}
            max={KANNA.maxMoles}
            step={KANNA.step}
            value={moles[i]}
            onChange={(e) => {
              const n = parseFloat(e.target.value);
              setMoles((m) => m.map((x, j) => (j === i ? n : x)));
            }}
            aria-valuetext={`${formatDecimal(moles[i], 2)} mól`}
            className="w-full"
            style={{ accentColor: g.colour }}
          />
        </div>
      ))}
      {/* The partial pressures stacked: the bar's length is the total, by Dalton's law. */}
      <div aria-hidden="true">
        <div className="flex h-6 overflow-hidden rounded-full bg-warm-100">
          {partial.map((p, i) => (
            <div
              key={KANNA.gases[i].formula}
              style={{
                width: `${(p / BAR_MAX_ATM) * 100}%`,
                backgroundColor: KANNA.gases[i].colour,
              }}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-xs text-warm-600">
          <span>0 atm</span>
          <span>{BAR_MAX_ATM} atm</span>
        </div>
      </div>
      <table className="w-full text-left text-sm" aria-live="polite">
        <caption className="sr-only">Mólbrot og hlutþrýstingur hverrar lofttegundar</caption>
        <thead>
          <tr className="text-indigo-800">
            <th scope="col" className="py-1 pr-2">
              Lofttegund
            </th>
            <th scope="col" className="py-1 pr-2">
              Mólbrot X
            </th>
            <th scope="col" className="py-1">
              Hlutþrýstingur
            </th>
          </tr>
        </thead>
        <tbody className="text-warm-900">
          {KANNA.gases.map((g, i) => (
            <tr key={g.formula}>
              <th scope="row" className="py-1 pr-2 font-normal">
                <span
                  className="mr-1.5 inline-block h-3 w-3 rounded-full align-middle"
                  style={{ backgroundColor: g.colour }}
                  aria-hidden="true"
                />
                {g.formula}
              </th>
              <td className="py-1 pr-2">{formatDecimal(fractions[i], 2)}</td>
              <td className="py-1">{formatDecimal(partial[i], 2)} atm</td>
            </tr>
          ))}
          <tr className="border-t border-indigo-200 font-semibold">
            <th scope="row" className="py-1 pr-2">
              Samtals
            </th>
            <td className="py-1 pr-2">{total > 0 ? '1,00' : '0'}</td>
            <td className="py-1" data-blondur-total>
              {formatDecimal(total, 2)} atm
            </td>
          </tr>
        </tbody>
      </table>
      <p className="text-sm text-warm-700">
        Bættu argoni við og sjáðu: hlutþrýstingur niturs og súrefnis breytist ekki, en mólbrot
        þeirra minnkar, því heildin vex. Hver lofttegund þrýstir eins og hún væri ein í flöskunni.
      </p>
    </section>
  );
}

export function BlondurScreen({ rootRef, onBack }: Props) {
  const [phase, setPhase] = useState<'skilja' | 'aefa'>('skilja');
  const titleRef = useRef<HTMLHeadingElement>(null);
  const startRef = useRef<HTMLHeadingElement>(null);
  useScreenTop(phase, { anyWidth: true, focus: phase === 'skilja' ? titleRef : startRef });
  // The button that opened the screen has gone with the menu, so the title takes focus.
  useLayoutEffect(() => {
    focusTarget(titleRef.current);
  }, []);

  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [outcome, setOutcome] = useState<'rett' | 'rangt' | null>(null);
  const [slip, setSlip] = useState<BlondurSlip | null>(null);
  const [invalid, setInvalid] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const problem = index < BLONDUR_PROBLEMS.length ? BLONDUR_PROBLEMS[index] : null;

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
    const value = parseStudentNumber(typed);
    if (!Number.isFinite(value)) {
      setInvalid(`Skrifaðu svarið sem tölu í ${problem.unit}, t.d. 1,25.`);
      return;
    }
    setInvalid(null);
    const right = within(value, problem.answer);
    setOutcome(right ? 'rett' : 'rangt');
    setSlip(right ? null : matchSlip(value, problem.slips));
    if (right) setCorrect((c) => c + 1);
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
    <div ref={rootRef} className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <Header variant="game" gameTitle="Gaslögmál" backLabel="Til baka í valmynd" onBack={onBack} />
      <main className="mx-auto max-w-3xl px-4 py-6 phone:py-3">
        <div className="space-y-5 rounded-xl bg-white p-4 shadow-lg sm:p-6 md:p-8 phone:space-y-3 phone:p-3">
          <h2
            ref={titleRef}
            tabIndex={-1}
            data-item-start={phase === 'skilja' ? '' : undefined}
            // In Æfa the problem's own name heads the card; on a phone the title steps aside so
            // the problem, its answer and Athuga share the first screen.
            className={`text-2xl font-bold text-indigo-700 phone:text-xl ${phase === 'aefa' ? 'phone:sr-only' : ''}`}
          >
            Gasblöndur og efnahvörf
          </h2>

          {phase === 'skilja' ? (
            <>
              <section
                aria-labelledby="blondur-dalton"
                className="space-y-2 rounded-xl bg-blue-50 p-4 phone:p-3"
              >
                <h3 id="blondur-dalton" className="text-lg font-bold text-blue-800">
                  Lögmál Daltons
                </h3>
                <p className="text-sm text-blue-900">
                  Í gasblöndu þrýstir hver lofttegund eins og hún væri ein í ílátinu, ef þær
                  hvarfast ekki hver við aðra. Þrýstingur einnar lofttegundar í blöndu heitir{' '}
                  <strong>hlutþrýstingur</strong> hennar, og heildarþrýstingurinn er summa þeirra:
                </p>
                <p className="text-center font-mono text-blue-900">
                  P(heild) = P<sub>A</sub> + P<sub>B</sub> + P<sub>C</sub> + …
                </p>
                <p className="text-sm text-blue-900">
                  Hlutur hverrar lofttegundar ræðst af <strong>mólbroti</strong> hennar, mólum
                  hennar deilt með mólum allrar blöndunnar:
                </p>
                <p className="text-center font-mono text-blue-900">
                  X<sub>A</sub> = n<sub>A</sub> / n(heild) <span className="mx-2">og</span> P
                  <sub>A</sub> = X<sub>A</sub> · P(heild)
                </p>
              </section>

              <section
                aria-labelledby="blondur-vatn"
                className="space-y-2 rounded-xl bg-cyan-50 p-4 phone:p-3"
              >
                <h3 id="blondur-vatn" className="text-lg font-bold text-cyan-800">
                  Gasi safnað yfir vatni
                </h3>
                <p className="text-sm text-cyan-900">
                  Gasi sem hvarfast ekki við vatn er oft safnað í flösku á hvolfi í vatnsbaði. Vatn
                  gufar upp, svo flaskan geymir líka vatnsgufu, og þegar vatnsborðið er jafnað er
                  heildarþrýstingurinn loftþrýstingurinn. Gasið eitt hefur því þrýstinginn
                </p>
                <p className="text-center font-mono text-cyan-900">P(gas) = P(heild) − P(H₂O)</p>
                <p className="text-sm text-cyan-900">
                  P(H₂O) er gufunarþrýstingur vatns, sem fer aðeins eftir hitastiginu: 17,5 torr við
                  20 °C, 23,8 torr við 25 °C og 31,8 torr við 30 °C.
                </p>
              </section>

              <section
                aria-labelledby="blondur-hlutfoll"
                className="space-y-2 rounded-xl bg-amber-50 p-4 phone:p-3"
              >
                <h3 id="blondur-hlutfoll" className="text-lg font-bold text-amber-800">
                  Lofttegundir í efnahvörfum
                </h3>
                <ul className="list-disc space-y-1 pl-5 text-sm text-amber-900">
                  <li>
                    Við sama hitastig og þrýsting er jafn fjöldi sameinda í jöfnu rúmmáli
                    (Avogadro). Rúmmál lofttegunda í hvarfi fylgja því stuðlunum: í N₂ + 3 H₂ → 2
                    NH₃ hvarfast 1 L af nitri við 3 L af vetni og 2 L af ammoníaki myndast.
                  </li>
                  <li>
                    Annars fer leiðin um mólin: frá grömmum í mól, mólhlutfallið úr jöfnunni, og frá
                    mólum í rúmmál með PV = nRT.
                  </li>
                  <li>T í kelvinum og P í atm, svo einingarnar passi við R = 0,08206.</li>
                </ul>
              </section>

              <Kanna />

              <button
                type="button"
                onClick={() => setPhase('aefa')}
                className="game-btn w-full rounded-xl bg-green-600 py-3 font-bold text-white hover:bg-green-700"
              >
                Æfa: átta dæmi →
              </button>
            </>
          ) : (
            <section aria-labelledby="blondur-aefa" className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h3 id="blondur-aefa" className="text-lg font-bold text-warm-800">
                  Æfðu þig
                </h3>
                <button
                  type="button"
                  onClick={() => setPhase('skilja')}
                  className="text-sm text-indigo-700 underline pointer-coarse:-my-3 pointer-coarse:py-3"
                >
                  Skýring og blanda
                </button>
              </div>
              {problem ? (
                <div
                  ref={cardRef}
                  className="space-y-3 rounded-xl border-2 border-warm-200 p-4 phone:p-3"
                >
                  <div ref={questionRef} className="space-y-2">
                    <p className="text-sm text-warm-500">
                      Dæmi {index + 1} af {BLONDUR_PROBLEMS.length}
                    </p>
                    <h4
                      ref={startRef}
                      id="gas-blondur-problem"
                      data-item-start
                      tabIndex={-1}
                      className="text-lg font-bold text-warm-800"
                    >
                      {problem.name}
                    </h4>
                    <p className="text-sm text-warm-700">{problem.setting}</p>
                    <ul className="space-y-0.5 font-mono text-sm text-warm-900" data-blondur-given>
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
                      id="gas-blondur-answer"
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
                        id="gas-blondur-feedback"
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
                            : `Ekki rétt. Svarið er ${shownAnswer(problem)} ${problem.unit}.`}
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
                        className="game-btn w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700"
                      >
                        {index + 1 < BLONDUR_PROBLEMS.length ? 'Næsta dæmi →' : 'Sjá niðurstöðu →'}
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
                    {correct} af {BLONDUR_PROBLEMS.length} rétt
                  </h4>
                  <p className="text-sm text-green-900">
                    Í blöndu þrýstir hver lofttegund fyrir sig. Í hvarfi fylgja mólin stuðlunum, og
                    rúmmálin líka ef þau eru mæld við sama hitastig og þrýsting.
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
      </main>
    </div>
  );
}
