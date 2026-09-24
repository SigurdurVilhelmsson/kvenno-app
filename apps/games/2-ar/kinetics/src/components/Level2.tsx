import { useState, useRef } from 'react';

import {
  formatDecimal,
  useArmedAfter,
  useItemTop,
  useRevealAfterCommit,
  useScreenTop,
} from '@shared/utils';

import { ConcentrationTimeGraph } from './ConcentrationTimeGraph';
import { challenges, rateConstantOf } from '../data/level2-questions';
import { formatSignificant } from '../utils/format';

interface Level2Props {
  onComplete: (score: number) => void;
  onBack: () => void;
}

export function Level2({ onComplete, onBack }: Level2Props) {
  const [showIntro, setShowIntro] = useState(true);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [orderA, setOrderA] = useState<number | null>(null);
  const [orderB, setOrderB] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [, setTotalHintsUsed] = useState(0);

  const challenge = challenges[currentChallenge];

  const checkAnswer = () => {
    const correctA = orderA === challenge.correctOrderA;
    const correctB =
      orderB === challenge.correctOrderB || (challenge.correctOrderB === 0 && orderB === null);

    const correct = correctA && correctB;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 20);
    }
    setShowResult(true);
  };

  const nextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge((prev) => prev + 1);
      setOrderA(null);
      setOrderB(null);
      setShowHint(false);
      setShowResult(false);
      setIsCorrect(false);
    } else {
      onComplete(score);
    }
  };

  const hasSecondReactant = challenge.data.some((d) => d.concentrationB > 0);

  // Kennsla → æfingar starts the practice at its top on a phone, heading focused; each new
  // puzzle brings the card's top back and focuses its title.
  useScreenTop(showIntro);
  const cardRef = useItemTop<HTMLDivElement>(currentChallenge);
  const ordersRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  // After Athuga: the student's orders through Næsta if they fit, else the verdict at the top,
  // and focus on the verdict, not on Næsta, so a second Enter lands on nothing (design P3).
  useRevealAfterCommit(showResult, () => ({
    bottom: nextRef.current,
    tops: [ordersRef.current, resultRef.current],
    focus: resultRef.current,
  }));
  // A double tap on Athuga must not land on Næsta.
  const armed = useArmedAfter(400, `${currentChallenge}:${showResult}`);
  // Opening the hint replaces its link with the hint: bring the hint through Athuga into view on
  // a phone, and move focus to the hint, not <body> (design §3, hints).
  const hintRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<HTMLButtonElement>(null);
  useRevealAfterCommit(showHint, () => ({
    bottom: checkRef.current,
    tops: [hintRef.current],
    focus: hintRef.current,
  }));

  // --- Teaching intro ---
  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
        <div className="max-w-lg mx-auto">
          <button
            onClick={onBack}
            className="text-warm-600 hover:text-warm-800 mb-4 pointer-coarse:min-h-11"
          >
            ← Til baka
          </button>
          <div className="bg-white rounded-2xl shadow-lg p-6 phone:p-4 space-y-4 animate-slide-in">
            <h2 className="text-xl font-bold text-warm-800">Hvernig finna röð hvörfunar?</h2>

            <p className="text-warm-700">
              Hraðalögmálið er: <strong className="font-mono">hraði = k[A]ᵐ[B]ⁿ</strong>.
              Veldisvísarnir m og n (röð hvörfunar) segja hversu mikil áhrif styrkur hefur á
              hraðann.
            </p>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">Hlutfallsaðferðin (3 skref)</h3>
              <div className="text-sm text-blue-700 space-y-2">
                <p>
                  <strong>1.</strong> Finndu tvö tilraunasett þar sem <em>aðeins eitt hvarfefni</em>{' '}
                  breytist (hitt er fast).
                </p>
                <p>
                  <strong>2.</strong> Reiknaðu hlutfall: hraði₂/hraði₁ og [A]₂/[A]₁
                </p>
                <p>
                  <strong>3.</strong> Ef styrkur tvöfaldaðist og hraðinn tvöfaldaðist → m = 1.
                  <br />
                  Ef styrkur tvöfaldaðist og hraðinn fjórfaldaðist → m = 2.
                  <br />
                  Ef styrkur tvöfaldaðist en hraðinn breyttist ekki → m = 0.
                </p>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-bold text-green-800 mb-2">Dæmi</h3>
              <div className="text-sm text-green-700 space-y-1">
                <p>Tilraun 1: [A] = 0,1; hraði = 2,0</p>
                <p>Tilraun 2: [A] = 0,2; hraði = 8,0 (styrkur × 2, hraði × 4)</p>
                <p className="font-mono mt-2">2ᵐ = 4 → m = 2 (annars stigs)</p>
              </div>
            </div>

            <button
              onClick={() => setShowIntro(false)}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Byrja æfingar →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header. On a phone the counters share one line (P4), so the row is one line tall. */}
        <div className="flex items-center justify-between mb-6 phone:mb-2 phone:gap-3">
          <button
            onClick={onBack}
            className="text-warm-600 hover:text-warm-800 flex items-center gap-2 pointer-coarse:min-h-11 phone:shrink-0"
          >
            <span>&larr;</span> Til baka
          </button>
          <div className="text-right phone:flex phone:flex-wrap phone:items-baseline phone:justify-end phone:gap-x-2 phone:min-w-0">
            <div className="text-sm text-warm-600">
              Stig 2 / Þraut {currentChallenge + 1} af {challenges.length}
            </div>
            <div className="text-lg font-bold text-green-600 phone:text-base">{score} stig</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-warm-200 rounded-full h-2 mb-6 phone:h-1.5 phone:mb-3">
          <div
            className="bg-green-500 h-2 phone:h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentChallenge + 1) / challenges.length) * 100}%` }}
          />
        </div>

        {/* Main content */}
        {/* A phone on its side: the equation and data | the orders, the check and the verdict.
            The two wrappers are display: contents everywhere else, so nothing else moves. */}
        <div
          ref={cardRef}
          className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 phone:p-3 phone-land:grid phone-land:grid-cols-2 phone-land:gap-4 phone-land:items-start"
        >
          <div className="contents phone-land:block">
            <h2
              data-item-start
              className="text-2xl font-bold text-green-800 mb-2 phone:text-xl phone:mb-1"
            >
              {challenge.title}
            </h2>
            <p className="text-warm-600 mb-4 phone:text-sm phone:mb-2">{challenge.description}</p>

            {/* Chemical equation */}
            <div className="bg-green-50 p-4 rounded-xl mb-6 phone:px-3 phone:py-2 phone:mb-3">
              <div className="text-center font-mono text-xl phone:text-lg">
                {challenge.equation}
              </div>
            </div>

            {/* Experimental data table */}
            <div className="overflow-x-auto mb-6 phone:mb-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-warm-100 text-xs sm:text-sm">
                    <th className="px-1.5 py-2 sm:p-3 phone:py-1 text-left">Tilraun</th>
                    <th className="px-1.5 py-2 sm:p-3 phone:py-1 text-center">[A] (M)</th>
                    {hasSecondReactant && (
                      <th className="px-1.5 py-2 sm:p-3 phone:py-1 text-center">[B] (M)</th>
                    )}
                    <th className="px-1.5 py-2 sm:p-3 phone:py-1 text-center">
                      Upphafshraði (M/s)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {challenge.data.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-warm-50'}>
                      <td className="px-1.5 py-2 sm:p-3 phone:py-1 font-bold">{row.experiment}</td>
                      <td className="px-1.5 py-2 sm:p-3 phone:py-1 text-center font-mono">
                        {formatDecimal(row.concentrationA, 2)}
                      </td>
                      {hasSecondReactant && (
                        <td className="px-1.5 py-2 sm:p-3 phone:py-1 text-center font-mono">
                          {formatDecimal(row.concentrationB, 2)}
                        </td>
                      )}
                      <td className="px-1.5 py-2 sm:p-3 phone:py-1 text-center font-mono">
                        {formatDecimal(row.initialRate, 4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="contents phone-land:block">
            {/* Order selection */}
            <div ref={ordersRef} className="bg-warm-50 p-3 sm:p-4 rounded-xl mb-6 phone:mb-3">
              <h3 className="font-bold text-warm-700 mb-4 phone:mb-2">Veldu röð hvörfunar:</h3>

              <div className="space-y-4 phone:space-y-2">
                {/* Order for A */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:flex-nowrap sm:gap-4 phone:flex-wrap">
                  <span className="font-mono font-bold whitespace-nowrap min-w-24 sm:w-32">
                    Röð í [A]:
                  </span>
                  <div className="flex gap-2">
                    {[0, 1, 2].map((order) => (
                      <button
                        key={order}
                        onClick={() => !showResult && setOrderA(order)}
                        disabled={showResult}
                        className={`w-12 h-12 rounded-full border-2 font-bold transition-all ${
                          orderA === order
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-warm-300 hover:border-green-400 hover:bg-green-50'
                        } ${showResult ? 'cursor-not-allowed' : ''}`}
                      >
                        {order}
                      </button>
                    ))}
                  </div>
                  {showResult && (
                    <span
                      className={`whitespace-nowrap ${
                        orderA === challenge.correctOrderA ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {orderA === challenge.correctOrderA
                        ? '✓'
                        : `✗ (rétt: ${challenge.correctOrderA})`}
                    </span>
                  )}
                </div>

                {/* Order for B (if applicable) */}
                {hasSecondReactant && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:flex-nowrap sm:gap-4 phone:flex-wrap">
                    <span className="font-mono font-bold whitespace-nowrap min-w-24 sm:w-32">
                      Röð í [B]:
                    </span>
                    <div className="flex gap-2">
                      {[0, 1, 2].map((order) => (
                        <button
                          key={order}
                          onClick={() => !showResult && setOrderB(order)}
                          disabled={showResult}
                          className={`w-12 h-12 rounded-full border-2 font-bold transition-all ${
                            orderB === order
                              ? 'border-green-500 bg-green-500 text-white'
                              : 'border-warm-300 hover:border-green-400 hover:bg-green-50'
                          } ${showResult ? 'cursor-not-allowed' : ''}`}
                        >
                          {order}
                        </button>
                      ))}
                    </div>
                    {showResult && (
                      <span
                        className={`whitespace-nowrap ${
                          orderB === challenge.correctOrderB ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {orderB === challenge.correctOrderB
                          ? '✓'
                          : `✗ (rétt: ${challenge.correctOrderB})`}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Rate law preview */}
              {(orderA !== null || orderB !== null) && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-green-200 phone:mt-2 phone:py-1.5">
                  <div className="font-mono text-center text-lg">
                    hraði = k[A]<sup>{orderA ?? '?'}</sup>
                    {hasSecondReactant && (
                      <>
                        [B]<sup>{orderB ?? '?'}</sup>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {showHint && !showResult && (
              <div
                ref={hintRef}
                className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-4 phone:p-3 phone:mb-3"
              >
                <span className="font-bold text-yellow-800">Vísbending: </span>
                <span className="text-yellow-900">{challenge.hint}</span>
              </div>
            )}

            {/* The hint link and Athuga, which share a row on a phone. Where both do not fit on one
                line (320 px) Athuga wraps under the link rather than squeezing. Athuga and Næsta
                are separate elements (keyed), never one button relabelled, and Næsta ignores a
                press within 400 ms of appearing. */}
            {!showResult && (
              <div className="contents phone:flex phone:flex-wrap phone:items-center phone:gap-x-4 phone:gap-y-2">
                {!showHint && (
                  <button
                    onClick={() => {
                      setShowHint(true);
                      setTotalHintsUsed((prev) => prev + 1);
                    }}
                    className="text-green-600 hover:text-green-800 text-sm underline mb-4 phone:mb-0 phone:shrink-0 pointer-coarse:min-h-11"
                  >
                    Sýna vísbendingu
                  </button>
                )}
                <button
                  key="check"
                  ref={checkRef}
                  onClick={checkAnswer}
                  disabled={orderA === null || (hasSecondReactant && orderB === null)}
                  className="w-full phone:w-auto phone:flex-[1_1_9rem] bg-green-500 hover:bg-green-600 disabled:bg-warm-300 text-white font-bold py-4 px-6 phone:py-3 phone:px-3 rounded-xl transition-colors"
                >
                  Athuga svar
                </button>
              </div>
            )}

            {/* Result feedback: the region focus moves to after Athuga (P3), named by its verdict. */}
            {showResult && (
              <div
                ref={resultRef}
                tabIndex={-1}
                role="group"
                aria-labelledby="kinetics-l2-verdict"
                className={`p-4 rounded-xl mb-4 phone:p-3 phone:mb-3 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
              >
                <div
                  id="kinetics-l2-verdict"
                  className={`font-bold text-lg mb-2 phone:mb-1 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}
                >
                  {isCorrect ? 'Rétt!' : 'Rangt'}
                </div>
                <div className="text-sm text-warm-700 mb-2">{challenge.explanation}</div>
                <div className="font-mono text-sm bg-white p-2 rounded border">
                  <strong>Hraðalögmál:</strong> hraði = k[A]<sup>{challenge.correctOrderA}</sup>
                  {hasSecondReactant && (
                    <>
                      [B]<sup>{challenge.correctOrderB}</sup>
                    </>
                  )}
                  <br />
                  <strong>Hraðafasti:</strong> k = {formatSignificant(rateConstantOf(challenge))}{' '}
                  {challenge.rateConstantUnit}
                </div>
              </div>
            )}

            {/* Next button */}
            {showResult && (
              <button
                key="next"
                ref={nextRef}
                onClick={armed(nextChallenge)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 phone:py-3 rounded-xl transition-colors"
              >
                {currentChallenge < challenges.length - 1 ? 'Næsta þraut' : 'Ljúka stigi 2'}
              </button>
            )}
          </div>
        </div>

        {/* Method reminder */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-warm-700 mb-2">Aðferð til að finna röð:</h3>
          <ol className="text-sm text-warm-600 space-y-1 list-decimal list-inside">
            <li>Finndu tvær tilraunir þar sem aðeins EINN styrkur breytist</li>
            <li>
              Reiknaðu hlutfallið: (hraði₂/hraði₁) = ([A]₂/[A]₁)<sup>m</sup>
            </li>
            <li>Ef styrkur tvöfaldast og hraðinn tvöfaldast → m = 1</li>
            <li>Ef styrkur tvöfaldast og hraðinn fjórfaldast → m = 2</li>
            <li>Ef styrkur breytist en hraðinn helst sá sami → m = 0</li>
          </ol>
        </div>

        {/* Concentration vs Time Graph */}
        <div className="mt-6">
          <ConcentrationTimeGraph
            initialConcentration={1.0}
            rateConstant={0.1}
            order={challenge.correctOrderA === 0 ? 0 : challenge.correctOrderA === 2 ? 2 : 1}
            showComparison={showResult}
            interactive={true}
          />
        </div>
      </div>
    </div>
  );
}
