import { useState, useRef, useEffect, useLayoutEffect } from 'react';

import { PhoneDisclosure, Presence } from '@shared/components';
import {
  focusTarget,
  formatDecimal,
  parseStudentNumber,
  useArmedAfter,
  useIsPhone,
  useItemTop,
  useRevealAfterCommit,
} from '@shared/utils';

import { LEVEL3_CHALLENGES } from '../data/level3-challenges';

/** Exit duration of the hint and submit Presences, which leave as the result enters. */
const ANSWER_EXIT_MS = 250;

interface Level3Props {
  onComplete: (score: number) => void;
  onBack: () => void;
}

export function Level3({ onComplete, onBack }: Level3Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [, setHintsUsed] = useState(0);
  const [completed, setCompleted] = useState(0);
  const levelCompleteReported = useRef(false);
  const phone = useIsPhone();

  // Answer state
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const challenge = LEVEL3_CHALLENGES[currentIndex];

  // Reset state when changing challenges
  useEffect(() => {
    setUserAnswer('');
    setShowResult(false);
    setShowHint(false);
    setShowSolution(false);
    setIsCorrect(false);
  }, [currentIndex]);

  // The level heading takes focus as the level mounts (the menu button that
  // opened it has gone).
  const headingRef = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    focusTarget(headingRef.current);
  }, []);

  // Each "Næsta" opens the next problem at the level's top when that top has
  // scrolled above the screen, and focuses the problem's title
  // (`data-item-start`). It did this at every width before it moved to the
  // shared helper, so it still does (`anyWidth`).
  const levelRef = useItemTop<HTMLDivElement>(currentIndex, { anyWidth: true });

  // After "Staðfesta svar": on a phone, the answer row through "Næsta" if it
  // fits, else the verdict at the top; measured once the hint and the submit
  // button above have left. Focus goes to the result, not to "Næsta" (P3).
  const answerRowRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  useRevealAfterCommit(
    showResult,
    () => ({
      bottom: nextRef.current,
      tops: [answerRowRef.current, resultRef.current],
      focus: resultRef.current,
    }),
    { afterExit: ANSWER_EXIT_MS + 50 }
  );
  // Opening the hint replaces its button with the hint, which dropped focus to
  // <body> (P3.5): bring the answer row through the hint into view on a phone
  // and move focus to the hint.
  const hintRef = useRef<HTMLDivElement>(null);
  useRevealAfterCommit(showHint, () => ({
    bottom: hintRef.current,
    tops: [answerRowRef.current, hintRef.current],
    focus: hintRef.current,
  }));
  // A double tap or Enter on the answer must not press "Næsta".
  const armed = useArmedAfter(400, `${currentIndex}:${showResult}`);

  // Check completion
  useEffect(() => {
    if (completed >= LEVEL3_CHALLENGES.length && !levelCompleteReported.current) {
      levelCompleteReported.current = true;
      onComplete(score);
    }
  }, [completed, score, onComplete]);

  const handleSubmit = () => {
    if (!userAnswer.trim()) return;

    const numericAnswer = parseStudentNumber(userAnswer);
    if (isNaN(numericAnswer)) return;

    const relativeError =
      Math.abs(numericAnswer - challenge.correctAnswer) / challenge.correctAnswer;
    const correct = relativeError <= challenge.tolerance;

    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      const points = 20;
      setScore((prev) => prev + points);
    }
  };

  const handleShowHint = () => {
    if (!showHint) {
      setShowHint(true);
      setHintsUsed((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setCompleted((prev) => prev + 1);

    if (currentIndex < LEVEL3_CHALLENGES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showResult) {
      handleSubmit();
    }
  };

  // "Staðfesta svar". On a phone it sits on the answer row, after the field
  // and its unit (design P12), and wraps under them where the row is too
  // narrow for all three; elsewhere it is the full-width button under the hint.
  const submit = (
    <Presence show={!showResult} exitDuration={250}>
      <button
        key="check"
        onClick={handleSubmit}
        disabled={!userAnswer.trim()}
        className={`w-full px-6 py-3 phone:px-4 phone:py-2 phone:min-h-11 phone:whitespace-nowrap rounded-xl font-bold transition-colors ${
          userAnswer.trim()
            ? 'bg-purple-500 hover:bg-purple-600 text-white'
            : 'bg-warm-200 text-warm-400 cursor-not-allowed'
        }`}
      >
        Staðfesta svar
      </button>
    </Presence>
  );

  const hintButton = (
    <button
      onClick={handleShowHint}
      className="text-yellow-600 hover:text-yellow-800 text-sm flex items-center gap-2 pointer-coarse:min-h-11"
    >
      💡 Sýna vísbendingu
    </button>
  );

  // These five badge labels were this game's only `t()` call. The i18n wiring
  // was stripped 2026-09-19 (Siggi's ruling) and the Icelandic here is the same
  // string the lookup already fell back to, so nothing a student sees changed.
  const challengeTypeLabels: Record<string, string> = {
    'find-concentration': 'Styrkur',
    'find-volume': 'Rúmmál',
    polyprotic: 'Fjölvirk sýra',
    'henderson-hasselbalch': 'H-H jafna',
    combined: 'Samansett',
  };

  const getChallengeTypeLabel = (type: string): string => challengeTypeLabels[type] || type;

  const getChallengeTypeColor = (type: string): string => {
    switch (type) {
      case 'find-concentration':
        return 'bg-blue-500';
      case 'find-volume':
        return 'bg-green-500';
      case 'polyprotic':
        return 'bg-orange-500';
      case 'henderson-hasselbalch':
        return 'bg-purple-500';
      case 'combined':
        return 'bg-red-500';
      default:
        return 'bg-warm-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 md:p-8 phone:px-3 phone:py-3">
      <div ref={levelRef} className="max-w-4xl mx-auto scroll-mt-4 phone:scroll-mt-3">
        {/* Header. On a phone it folds to one row (design P4): Til baka, the
            title, the counters, with the progress bar under them. Til baka
            comes first in the DOM as well as on screen. */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-4 phone:flex phone:flex-wrap phone:items-center phone:gap-x-1.5 phone:px-2.5 phone:py-2 phone:mb-3">
          <div className="flex justify-between items-center phone:contents">
            <button
              onClick={onBack}
              className="text-warm-600 hover:text-warm-800 flex items-center gap-2 pointer-coarse:py-3 pointer-coarse:-my-3 phone:order-1 phone:shrink-0 phone:text-sm"
            >
              ← Til baka
            </button>
            <div className="flex items-center gap-4 phone:order-3 phone:shrink-0 phone:flex-col phone:items-end phone:gap-0">
              <div className="text-sm text-warm-500 phone:text-xs">
                {currentIndex + 1} / {LEVEL3_CHALLENGES.length}
              </div>
              <div className="text-lg font-bold text-purple-600 phone:text-sm">Stig: {score}</div>
            </div>
          </div>

          <h1
            ref={headingRef}
            className="text-xl md:text-2xl font-bold text-purple-600 mt-2 phone:order-2 phone:flex-1 phone:min-w-0 phone:mt-0 phone:text-base"
          >
            📐 Stig 3: Útreikningar
          </h1>

          {/* Progress bar */}
          <div className="w-full bg-warm-200 rounded-full h-2 mt-3 phone:order-4 phone:basis-full phone:mt-1.5 phone:h-1.5">
            <div
              className="bg-purple-500 h-2 phone:h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(completed / LEVEL3_CHALLENGES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Challenge card */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-4 phone:p-3 phone:mb-3">
          {/* Wraps on a phone: titles like "Finndu jafngildisrúmmál" hold a
              word too long to sit beside the badge at 320 px. */}
          <div className="flex flex-wrap items-start gap-x-3 gap-y-2 mb-4 phone:mb-2 phone:gap-y-1">
            <span
              className={`${getChallengeTypeColor(challenge.type)} text-white text-xs font-bold px-3 py-1 rounded-full`}
            >
              {getChallengeTypeLabel(challenge.type)}
            </span>
            <h2 data-item-start className="text-lg font-bold text-warm-800 phone:text-base">
              {challenge.titleIs}
            </h2>
          </div>

          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-4 phone:px-3 phone:py-2 phone:mb-2">
            <p className="text-purple-900 text-lg phone:text-base">{challenge.descriptionIs}</p>
          </div>

          {/* Given data */}
          <div className="bg-warm-50 rounded-xl p-4 mb-4 phone:px-3 phone:py-2 phone:mb-2">
            <h3 className="font-bold text-warm-700 mb-2 phone:mb-1">Gefið:</h3>
            {/* Two columns on a phone where a label fits its column whole
                (from about 375 px); one column below that. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm phone:grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] phone:gap-x-3 phone:gap-y-1">
              {challenge.givenData.analyteVolume && (
                <div>
                  <span className="font-semibold">Rúmmál sýnis:</span>{' '}
                  {formatDecimal(challenge.givenData.analyteVolume)} mL
                </div>
              )}
              {challenge.givenData.analyteMolarity && (
                <div>
                  <span className="font-semibold">Styrkur sýnis:</span>{' '}
                  {formatDecimal(challenge.givenData.analyteMolarity)} M
                </div>
              )}
              {challenge.givenData.titrantMolarity && (
                <div>
                  <span className="font-semibold">Styrkur títrants:</span>{' '}
                  {formatDecimal(challenge.givenData.titrantMolarity)} M
                </div>
              )}
              {challenge.givenData.equivalenceVolume && (
                <div>
                  <span className="font-semibold">Jafngildisrúmmál:</span>{' '}
                  {formatDecimal(challenge.givenData.equivalenceVolume)} mL
                </div>
              )}
              {challenge.givenData.pKa && (
                <div>
                  <span className="font-semibold">pKₐ:</span>{' '}
                  {formatDecimal(challenge.givenData.pKa)}
                </div>
              )}
              {challenge.givenData.pH && (
                <div>
                  <span className="font-semibold">pH:</span> {formatDecimal(challenge.givenData.pH)}
                </div>
              )}
              {challenge.givenData.acidConcentration && (
                <div>
                  <span className="font-semibold">[Sýra]:</span>{' '}
                  {formatDecimal(challenge.givenData.acidConcentration)} M
                </div>
              )}
              {challenge.givenData.baseConcentration && (
                <div>
                  <span className="font-semibold">[Basi]:</span>{' '}
                  {formatDecimal(challenge.givenData.baseConcentration)} M
                </div>
              )}
            </div>
            {challenge.givenData.formula && (
              <div className="mt-3 pt-3 border-t border-warm-200 phone:mt-2 phone:pt-2">
                <span className="font-semibold text-warm-700">Jafna:</span>
                <div className="font-mono text-purple-700 mt-1">{challenge.givenData.formula}</div>
              </div>
            )}
          </div>

          {/* Answer input */}
          <div className="mb-4 phone:mb-3">
            <div className="phone:flex phone:items-center phone:justify-between phone:gap-2 phone:mb-1">
              <label
                htmlFor="ph-titration-l3-answer"
                className="block text-sm font-semibold text-warm-700 mb-2 phone:mb-0"
              >
                Svar {challenge.unit && `(${challenge.unit})`}:
              </label>
              {phone && !showHint && !showResult && hintButton}
            </div>
            <div ref={answerRowRef} className="flex gap-3 phone:flex-wrap phone:gap-2">
              <input
                id="ph-titration-l3-answer"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                enterKeyHint="done"
                disabled={showResult}
                placeholder="Sláðu inn svar..."
                className={`flex-1 min-w-0 phone:basis-20 px-4 py-3 phone:px-3 phone:py-2 border-2 rounded-xl text-lg font-mono ${
                  showResult
                    ? isCorrect
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : 'border-warm-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
                }`}
              />
              {challenge.unit && (
                <span className="flex items-center px-4 py-3 phone:px-3 phone:py-2 bg-warm-100 rounded-xl font-semibold text-warm-700">
                  {challenge.unit}
                </span>
              )}
              {phone && <div className="grow">{submit}</div>}
            </div>
            <p className="text-xs text-warm-500 mt-1">
              Skekkjumörk: ±{formatDecimal(challenge.tolerance * 100, 0)}%
            </p>
          </div>

          {/* Hint. On a phone the button sits on the answer's label row
              (rendered there instead of here, never twice); the opened hint
              still opens here, under the field. */}
          <Presence show={!showResult} exitDuration={250}>
            <div className={`mb-4 ${phone && !showHint ? 'hidden' : 'phone:mb-3'}`}>
              {showHint ? (
                <div
                  ref={hintRef}
                  className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 phone:p-3"
                >
                  <div className="font-bold text-yellow-800 mb-1">💡 Vísbending:</div>
                  <p className="text-yellow-900">{challenge.hintIs}</p>
                </div>
              ) : (
                !phone && hintButton
              )}
            </div>
          </Presence>

          {/* Submit button (on a phone it ends the answer row instead) */}
          {!phone && submit}

          {/* Result feedback */}
          <Presence show={showResult} exitDuration={250}>
            {/* The feedback region focus moves to after the check (P3), named
                by its verdict. */}
            <div
              ref={resultRef}
              tabIndex={-1}
              role="group"
              aria-labelledby="ph-l3-verdict"
              className={`p-4 phone:p-3 rounded-xl focus:outline-none ${isCorrect ? 'bg-green-50 border border-green-300' : 'bg-red-50 border border-red-300'}`}
            >
              <div
                id="ph-l3-verdict"
                className={`font-bold mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}
              >
                {isCorrect ? '✓ Rétt!' : '✗ Rangt'}
                {isCorrect && ' (+20 stig)'}
              </div>

              <div className="text-sm mb-2">
                <span className="font-semibold">Þitt svar:</span> {userAnswer} {challenge.unit}
                <br />
                <span className="font-semibold">Rétt svar:</span>{' '}
                {formatDecimal(challenge.correctAnswer)} {challenge.unit}
              </div>

              <p className={`text-sm ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                {challenge.explanationIs}
              </p>

              {/* Show solution button */}
              {!showSolution && (
                <button
                  onClick={() => setShowSolution(true)}
                  className="mt-3 text-purple-600 hover:text-purple-800 text-sm font-semibold pointer-coarse:min-h-11"
                >
                  📝 Sýna útreikningsgang
                </button>
              )}

              {/* Solution steps */}
              {showSolution && (
                <div className="mt-3 bg-white rounded-lg p-3 border border-warm-200">
                  <h4 className="font-bold text-warm-700 mb-2">Útreikningur:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm font-mono text-warm-800">
                    {challenge.solutionStepsIs.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              <button
                key="next"
                ref={nextRef}
                onClick={armed(handleNext)}
                className="mt-4 phone:mt-3 w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold"
              >
                {currentIndex < LEVEL3_CHALLENGES.length - 1 ? 'Næsta →' : 'Ljúka stigi →'}
              </button>
            </div>
          </Presence>
        </div>

        {/* Reference tables: a disclosure on a phone, closed at first (design
            P9), always open from sm up. The button carries the heading, so the
            heading itself is kept for screen readers only there. */}
        <PhoneDisclosure
          summary="📋 Uppflettitöflur"
          className="bg-white rounded-2xl shadow-xl p-4 phone:p-3"
          buttonClassName="text-warm-700"
        >
          <h3 className="font-bold text-warm-700 mb-3 phone:sr-only">📋 Uppflettitöflur</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Common pKa values */}
            <div className="bg-blue-50 rounded-xl p-3">
              <h4 className="font-semibold text-blue-800 mb-2">Algeng pKₐ gildi</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-blue-600">
                    <th>Sýra</th>
                    <th>pKₐ</th>
                  </tr>
                </thead>
                <tbody className="text-blue-900">
                  <tr>
                    <td>HF</td>
                    <td>3,17</td>
                  </tr>
                  <tr>
                    <td>HCOOH</td>
                    <td>3,74</td>
                  </tr>
                  <tr>
                    <td>CH₃COOH</td>
                    <td>4,74</td>
                  </tr>
                  <tr>
                    <td>H₂CO₃</td>
                    <td>6,37; 10,25</td>
                  </tr>
                  <tr>
                    <td>H₃PO₄</td>
                    <td>2,12; 7,21; 12,38</td>
                  </tr>
                  <tr>
                    <td>NH₄⁺</td>
                    <td>9,26</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Key formulas */}
            <div className="bg-purple-50 rounded-xl p-3">
              <h4 className="font-semibold text-purple-800 mb-2">Lykiljöfnur</h4>
              <div className="space-y-2 text-sm text-purple-900">
                <div>
                  <span className="font-semibold">Títrun:</span>
                  <div className="font-mono">M₁V₁ = M₂V₂</div>
                </div>
                <div>
                  <span className="font-semibold">Henderson-Hasselbalch:</span>
                  <div className="font-mono">pH = pKₐ + log([A⁻]/[HA])</div>
                </div>
                <div>
                  <span className="font-semibold">Hálfur jafngildispunktur:</span>
                  <div className="font-mono">pH = pKₐ (þegar [HA] = [A⁻])</div>
                </div>
              </div>
            </div>
          </div>
        </PhoneDisclosure>
      </div>
    </div>
  );
}
