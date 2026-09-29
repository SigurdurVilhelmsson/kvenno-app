import { useMemo, useRef, useState } from 'react';

import { useEscapeKey } from '@shared/hooks';
import {
  shuffleArray,
  useArmedAfter,
  useItemTop,
  useRevealAfterCommit,
  useScreenTop,
} from '@shared/utils';

import { challenges } from '../data/level3-questions';
import type { MechanismStep } from '../data/level3-questions';
import { keepFormulasWhole } from '../utils/keep-formulas-whole';

interface Level3Props {
  onComplete: (score: number) => void;
  onBack: () => void;
}

export function Level3({ onComplete, onBack }: Level3Props) {
  const [showIntro, setShowIntro] = useState(true);
  useEscapeKey(onBack, showIntro);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [, setTotalHintsUsed] = useState(0);

  const challenge = challenges[currentChallenge];

  /**
   * The correct option is first in the data on all six challenges, so rendering
   * them in order made "pick the top one" a winning strategy that needs no
   * chemistry. Level 1 of this same game already shuffles; Level 3 never did.
   *
   * Memoised on the challenge index so the buttons hold still while the student
   * is reading them, and the ids are reassigned a/b/c/d after shuffling so the
   * visible letters stay in order. That reassignment is why every lookup below
   * has to go through `shuffledOptions` and not `challenge.options` — the id the
   * student clicked no longer identifies the same option in the original array.
   */
  const shuffledOptions = useMemo(() => {
    return shuffleArray(challenge.options).map((option, idx) => ({
      ...option,
      id: String.fromCharCode(97 + idx),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: re-shuffle when challenge index changes
  }, [currentChallenge, challenge.options]);

  /**
   * On a phone, options that are all short (a formula, a formula and a word) sit two by two, so
   * the question, the options and Athuga fit together under the mechanism. Only while the student
   * is choosing: once the verdict shows, the chosen option carries its explanation, which needs a
   * full row. The limits keep every word whole in a 320 px column: at most 12 characters an
   * option and 7 a word.
   */
  const shortOptions = shuffledOptions.every(
    (option) => option.text.length <= 12 && option.text.split(/\s+/).every((w) => w.length <= 7)
  );

  // Kennsla → æfingar starts the practice at its top on a phone, heading focused; each new
  // puzzle brings the card's top back and focuses its title.
  useScreenTop(showIntro);
  const cardRef = useItemTop<HTMLDivElement>(currentChallenge);
  const questionRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const conceptRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const selectedIndex = shuffledOptions.findIndex((opt) => opt.id === selectedAnswer);
  // After Athuga: the question through Næsta if it fits, else the chosen option (and its
  // explanation), else the concept note at the top; focus on the concept note, not on Næsta, so
  // a second Enter lands on nothing (design P3).
  useRevealAfterCommit(showResult, () => ({
    bottom: nextRef.current,
    tops: [
      questionRef.current,
      selectedIndex < 0 ? null : (optionsRef.current?.children[selectedIndex] ?? null),
      conceptRef.current,
    ],
    focus: conceptRef.current,
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

  const handleAnswerSelect = (optionId: string) => {
    if (showResult) return;
    setSelectedAnswer(optionId);
  };

  const checkAnswer = () => {
    if (!selectedAnswer) return;

    const selectedOption = shuffledOptions.find((opt) => opt.id === selectedAnswer);
    if (selectedOption?.correct) {
      setScore((prev) => prev + 20);
    }
    setShowResult(true);
  };

  const nextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowHint(false);
    } else {
      onComplete(score);
    }
  };

  const getOptionStyle = (option: { id: string; correct: boolean }) => {
    if (!showResult) {
      return selectedAnswer === option.id
        ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
        : 'border-warm-300 hover:border-purple-400 hover:bg-purple-50';
    }

    if (option.correct) {
      return 'border-green-500 bg-green-50';
    }

    if (selectedAnswer === option.id && !option.correct) {
      return 'border-red-500 bg-red-50';
    }

    return 'border-warm-200 bg-warm-50 opacity-50';
  };

  const getStepStyle = (type: MechanismStep['type']) => {
    switch (type) {
      case 'slow':
        return 'border-red-400 bg-red-50';
      case 'fast':
        return 'border-green-400 bg-green-50';
      case 'equilibrium':
        return 'border-blue-400 bg-blue-50';
      default:
        return 'border-warm-300 bg-white';
    }
  };

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 space-y-5">
          {/* On a phone the title takes its own line below the back link and level tag */}
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 sm:flex-nowrap">
            <button
              onClick={onBack}
              className="text-warm-500 hover:text-warm-700 whitespace-nowrap pointer-coarse:min-h-11"
            >
              ← Til baka
            </button>
            <h1 className="text-lg font-bold text-warm-800 order-last w-full sm:order-none sm:w-auto">
              Hvarfgangar og hraðaákvarðandi skref — Kennsla
            </h1>
            <span className="text-sm text-warm-500 whitespace-nowrap">Stig 3</span>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4">
            <h2 className="font-bold text-purple-900 mb-2">Hvað er hvarfgangur?</h2>
            <p className="text-warm-700 text-sm leading-relaxed">
              Flest efnahvörf gerast ekki í einu skrefi — þau hafa <strong>hvarfgang</strong> með
              mörgum <strong>grunnskrefum</strong>. Hvert skref hefur sitt eigið hraðastig.
            </p>
          </div>

          <div className="bg-white border border-warm-200 rounded-lg p-4 space-y-3">
            <h3 className="font-bold text-warm-800">Þrjú lykilhugtök</h3>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
              <p className="font-bold text-amber-800 mb-1">Milliefni (intermediate)</p>
              <p className="text-warm-700">
                Tegund sem <strong>myndast í einu skrefi og eyðist í öðru</strong>. Hún kemur ekki
                fram í heildarjöfnunni og má <strong>ekki</strong> birtast í hraðalögmálinu.
              </p>
              <p className="font-mono text-xs text-warm-800 mt-1">
                <span className="whitespace-nowrap">Skref 1: A + B → I</span> &nbsp;&nbsp;{' '}
                <span className="whitespace-nowrap">Skref 2: I + C → D</span> &nbsp;&nbsp;{' '}
                <span className="whitespace-nowrap">(I = milliefni)</span>
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
              <p className="font-bold text-red-800 mb-1">Hraðaákvarðandi skref</p>
              <p className="text-warm-700">
                <strong>Hægasta skrefið</strong> ákvarðar hraða alls hvarfsins — eins og hægasti
                hlaupari stýrir hraða boðhlaupsteyma. Hraðalögmálið kemur beint úr hvarfefnum
                hraðaákvarðandi skrefsins.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="font-bold text-blue-800 mb-1">Hratt jafnvægi (fast equilibrium)</p>
              <p className="text-warm-700">
                Ef hraðaákvarðandi skrefið inniheldur milliefni, notum við jafnvægisfastann úr hröðu
                skrefinu á undan til að losna við milliefnið í lokajöfnunni.
              </p>
              <p className="font-mono text-xs text-warm-800 mt-1">
                <span className="whitespace-nowrap">NO + Br₂ ⇌ NOBr₂ (hratt)</span> &nbsp;&nbsp;{' '}
                <span className="whitespace-nowrap">NOBr₂ + NO → 2NOBr (hægt)</span>
              </p>
              <p className="text-xs text-warm-700 mt-1">
                {keepFormulasWhole('[NOBr₂] = K[NO][Br₂] → hraði = k[NO]²[Br₂]')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowIntro(false)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Byrja æfingar →
          </button>
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
              Stig 3 / Þraut {currentChallenge + 1} af {challenges.length}
            </div>
            <div className="text-lg font-bold text-purple-600 phone:text-base">{score} stig</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-warm-200 rounded-full h-2 mb-6 phone:h-1.5 phone:mb-3">
          <div
            className="bg-purple-500 h-2 phone:h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentChallenge + 1) / challenges.length) * 100}%` }}
          />
        </div>

        {/* Main content */}
        {/* A phone on its side: the reaction and its mechanism | the question, the options, the
            check and the concept note. The two wrappers are display: contents everywhere else,
            so nothing else moves. */}
        <div
          ref={cardRef}
          className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 phone:p-3 phone-land:grid phone-land:grid-cols-2 phone-land:gap-4 phone-land:items-start"
        >
          <div className="contents phone-land:block">
            <h2
              data-item-start
              className="text-2xl font-bold text-purple-800 mb-2 phone:text-xl phone:mb-1"
            >
              {challenge.title}
            </h2>
            <p className="text-warm-600 mb-4 phone:text-sm phone:mb-2">{challenge.description}</p>

            {/* Overall reaction */}
            <div className="bg-purple-50 p-4 rounded-xl mb-6 phone:px-3 phone:py-2 phone:mb-3">
              <div className="text-sm text-purple-600 mb-1 phone:mb-0">Heildarhvarf:</div>
              <div className="text-center font-mono text-lg sm:text-xl font-bold phone:text-lg">
                {challenge.overallReaction}
              </div>
            </div>

            {/* Mechanism steps */}
            <div className="mb-6 phone:mb-3">
              <h3 className="font-bold text-warm-700 mb-3 phone:mb-2">Hvarfgangur:</h3>
              <div className="space-y-3 phone:space-y-2">
                {challenge.mechanism.map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-3 sm:p-4 phone:px-3 phone:py-2 rounded-xl border-2 ${getStepStyle(step.type)}`}
                  >
                    {/* On a phone the step label runs on after its equation where both fit, and
                      wraps under it where they do not, rather than squeezing the equation */}
                    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between phone:flex-row phone:flex-wrap phone:items-center phone:justify-between phone:gap-x-2 phone:gap-y-1">
                      <div className="font-mono text-base sm:text-lg phone:text-base">
                        {step.equation}
                      </div>
                      {step.label && (
                        <span
                          className={`text-sm font-semibold px-2 py-1 phone:py-0.5 rounded ${
                            step.type === 'slow'
                              ? 'text-red-700 bg-red-100'
                              : step.type === 'fast'
                                ? 'text-green-700 bg-green-100'
                                : 'text-blue-700 bg-blue-100'
                          }`}
                        >
                          {step.label}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="contents phone-land:block">
            {/* Question */}
            <div ref={questionRef} className="bg-warm-50 p-4 rounded-xl mb-6 phone:p-3 phone:mb-3">
              <div className="font-bold text-warm-800">{challenge.question}</div>
            </div>

            {/* Options */}
            <div
              ref={optionsRef}
              // In the grid its gap is the only spacing. With phone:space-y-2 in the list as well,
              // it won over phone:space-y-0 and left a margin under every option but the last,
              // which stretched the last one taller than its neighbour.
              className={`space-y-3 mb-6 phone:mb-3 ${
                shortOptions && !showResult
                  ? 'phone:grid phone:grid-cols-2 phone:gap-2 phone:space-y-0'
                  : 'phone:space-y-2'
              }`}
            >
              {shuffledOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswerSelect(option.id)}
                  disabled={showResult}
                  className={`w-full p-4 phone:p-3 rounded-xl border-2 text-left transition-all ${getOptionStyle(option)}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-warm-500 uppercase">{option.id}.</span>
                    <span className="flex-1">{keepFormulasWhole(option.text)}</span>
                    {/* This level has no verdict line: the verdict is these marks. They carry
                      a name, and the chosen option's mark and explanation name and describe the
                      feedback region focus moves to after Athuga (P3). */}
                    {showResult && option.correct && (
                      <span
                        role="img"
                        aria-label="Rétt svar"
                        id={selectedAnswer === option.id ? 'kinetics-l3-verdict' : undefined}
                        className="text-green-600 font-bold"
                      >
                        ✓
                      </span>
                    )}
                    {showResult && selectedAnswer === option.id && !option.correct && (
                      <span
                        role="img"
                        aria-label="Rangt svar"
                        id="kinetics-l3-verdict"
                        className="text-red-600 font-bold"
                      >
                        ✗
                      </span>
                    )}
                  </div>
                  {showResult && selectedAnswer === option.id && (
                    <div
                      id="kinetics-l3-why"
                      className={`mt-2 text-sm ${option.correct ? 'text-green-700' : 'text-red-700'}`}
                    >
                      {keepFormulasWhole(option.explanation)}
                    </div>
                  )}
                </button>
              ))}
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
                    className="text-purple-600 hover:text-purple-800 text-sm underline mb-4 phone:mb-0 phone:shrink-0 pointer-coarse:min-h-11"
                  >
                    Sýna vísbendingu
                  </button>
                )}
                <button
                  key="check"
                  ref={checkRef}
                  onClick={checkAnswer}
                  disabled={!selectedAnswer}
                  className="w-full phone:w-auto phone:flex-[1_1_9rem] bg-purple-500 hover:bg-purple-600 disabled:bg-warm-300 text-white font-bold py-4 px-6 phone:py-3 phone:px-3 rounded-xl transition-colors"
                >
                  Athuga svar
                </button>
              </div>
            )}

            {/* Concept explanation: the feedback region focus moves to after Athuga (P3). The
              verdict itself is drawn on the options above, so the region is named by the chosen
              option's mark and described by its explanation. */}
            {showResult && (
              <div
                ref={conceptRef}
                tabIndex={-1}
                role="group"
                aria-labelledby="kinetics-l3-verdict"
                aria-describedby="kinetics-l3-why"
                className="bg-purple-50 p-4 rounded-xl mb-4 phone:p-3 phone:mb-3"
              >
                <div className="font-bold text-purple-800 mb-2 phone:mb-1">Hugtak:</div>
                <div className="text-purple-900 text-sm">{challenge.conceptExplanation}</div>
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
                {currentChallenge < challenges.length - 1 ? 'Næsta þraut' : 'Ljúka stigi 3'}
              </button>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-warm-700 mb-3">Lykilhugtök</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-red-400"></span>
              <span>Hægt skref (hraðaákvarðandi)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-green-400"></span>
              <span>Hratt skref</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-blue-400"></span>
              <span>Jafnvægi</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-purple-400"></span>
              <span>Milliefni</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
