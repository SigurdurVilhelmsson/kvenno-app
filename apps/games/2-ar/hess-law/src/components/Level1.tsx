import { useState, useEffect, useMemo } from 'react';

import { FeedbackPanel } from '@shared/components';
import { shuffleArray } from '@shared/utils';

import { StatePathComparison } from './StatePathComparison';
import { CHALLENGES } from '../data/challenges';
import type { Equation } from '../data/challenges';
import { multiplyEquationCoefficients } from '../utils/equation-math';

// Misconceptions for Hess's Law concepts
const MISCONCEPTIONS: Record<number, string> = {
  1: 'Neikvætt ΔH þýðir að orka fer ÚT úr kerfinu (exothermic), ekki inn. Jákvætt þýðir að orka fer inn (endothermic).',
  2: 'Þegar þú snýrð við hvörfum, snýrðu við FORMERKINU á ΔH. Ef ΔH = -X, þá verður öfugt hvarf ΔH = +X.',
  3: 'Við margföldun breytist formerkið EKKI. Ef ΔH = -X, þá er 2×ΔH = -2X (enn neikvætt).',
  4: 'Mundu röðina: snúðu fyrst við (breytir formerki), SÍÐAN margfaldaðu.',
  5: 'Til að nota Hess, þarftu að stilla jöfnur þannig að hvarfefni og afurðir strikist út rétt.',
  6: 'Orkubraut: leiðin skiptir ekki máli, aðeins upphafs- og lokastaða. Heildar ΔH er summa allra skrefa.',
};

// Related concepts for each challenge
const RELATED_CONCEPTS: Record<number, string[]> = {
  1: ['Exothermic', 'Endothermic', 'Skammtavarmi'],
  2: ['Öfug hvörf', 'Formerkisbreyting', 'Hverfanleiki'],
  3: ['Stökefnafræði', 'Mólhlutföll', 'Hlutfallsleg orka'],
  4: ['Samsett aðgerðir', 'Sundrun vs myndun', 'Margföldun'],
  5: ['Lögmál Hess', 'Orkuvarðveisla', 'Hverfanleiki'],
  6: ['Orkubraut', 'Ferlisstuðull', 'Heildar ΔH'],
};

// Energy diagram component
function EnergyDiagram({
  equation,
  showPath = true
}: {
  equation: Equation;
  showPath?: boolean;
}) {
  const effectiveDeltaH = equation.deltaH * equation.multiplier * (equation.isReversed ? -1 : 1);
  const isExothermic = effectiveDeltaH < 0;

  // Calculate positions based on ΔH magnitude
  // Base gap (at multiplier=1) is 20% from center, scales with multiplier
  // Center is at 50%, so positions range from ~20% to ~80%
  const baseGap = 15; // Base distance from center (%)
  const gapPerMultiplier = 10; // Additional gap per multiplier level
  const totalGap = baseGap + (equation.multiplier - 1) * gapPerMultiplier;

  // Clamp the gap to keep bars within visible range (max 35% from center)
  const clampedGap = Math.min(totalGap, 35);

  // Calculate positions (0-100 scale, lower value = higher on screen = higher energy)
  // For exothermic: reactants high (small top%), products low (large top%)
  // For endothermic: reactants low (large top%), products high (small top%)
  const reactantLevel = isExothermic ? (50 - clampedGap) : (50 + clampedGap);
  const productLevel = isExothermic ? (50 + clampedGap) : (50 - clampedGap);

  return (
    <div className="relative bg-gradient-to-b from-red-50 via-white to-blue-50 rounded-xl p-6 h-64 border-2 border-warm-200">
      {/* Y-axis label */}
      <div className="absolute left-2 top-1/2 -tranwarm-y-1/2 -rotate-90 text-xs text-warm-500 font-semibold">
        Orka
      </div>

      {/* Energy levels */}
      <div className="relative h-full ml-8">
        {/* Reactants level */}
        <div
          className="absolute left-0 w-1/3 h-3 bg-blue-500 rounded-full flex items-center justify-center transition-all duration-500"
          style={{ top: `${reactantLevel}%` }}
        >
          <span className="absolute -top-6 text-xs font-semibold text-blue-700">
            {equation.isReversed ? equation.products : equation.reactants}
          </span>
        </div>

        {/* Products level */}
        <div
          className="absolute right-0 w-1/3 h-3 bg-green-500 rounded-full flex items-center justify-center transition-all duration-500"
          style={{ top: `${productLevel}%` }}
        >
          <span className="absolute -top-6 text-xs font-semibold text-green-700">
            {equation.isReversed ? equation.reactants : equation.products}
          </span>
        </div>

        {/* Arrow showing energy change */}
        {showPath && (
          <div className="absolute left-1/2 -tranwarm-x-1/2 flex flex-col items-center"
            style={{
              top: `${Math.min(reactantLevel, productLevel) + 5}%`,
              height: `${Math.abs(productLevel - reactantLevel) - 10}%`
            }}
          >
            <div className={`w-1 flex-1 ${isExothermic ? 'bg-red-400' : 'bg-blue-400'}`} />
            <div className={`text-2xl ${isExothermic ? 'text-red-500' : 'text-blue-500'}`}>
              {isExothermic ? '↓' : '↑'}
            </div>
          </div>
        )}

        {/* ΔH label */}
        <div className="absolute left-1/2 -tranwarm-x-1/2 top-1/2 -tranwarm-y-1/2 bg-white px-3 py-1 rounded-lg border-2 border-warm-300 shadow-sm">
          <span className={`font-bold text-lg ${effectiveDeltaH < 0 ? 'text-red-600' : 'text-blue-600'}`}>
            ΔH = {effectiveDeltaH > 0 ? '+' : ''}{effectiveDeltaH} kJ
          </span>
        </div>
      </div>
    </div>
  );
}

// Equation display with controls
function EquationDisplay({
  equation,
  onReverse,
  onMultiply,
  showControls = true
}: {
  equation: Equation;
  onReverse?: () => void;
  onMultiply?: (factor: number) => void;
  showControls?: boolean;
}) {
  const effectiveDeltaH = equation.deltaH * equation.multiplier * (equation.isReversed ? -1 : 1);

  // Get the displayed reactants and products with multiplied coefficients
  const displayReactants = multiplyEquationCoefficients(
    equation.isReversed ? equation.products : equation.reactants,
    equation.multiplier
  );
  const displayProducts = multiplyEquationCoefficients(
    equation.isReversed ? equation.reactants : equation.products,
    equation.multiplier
  );

  return (
    <div className={`p-4 rounded-xl border-2 transition-all ${
      equation.isReversed ? 'bg-red-50 border-red-300' :
      equation.multiplier !== 1 ? 'bg-blue-50 border-blue-300' :
      'bg-white border-warm-300'
    }`}>
      {/* Equation */}
      <div className="text-center mb-3">
        <span className="font-mono text-lg">
          <span className="text-blue-700">{displayReactants}</span>
          <span className="mx-2 text-warm-600">→</span>
          <span className="text-green-700">{displayProducts}</span>
        </span>
      </div>

      {/* ΔH value */}
      <div className="text-center mb-4">
        <span className={`font-bold text-xl ${effectiveDeltaH < 0 ? 'text-red-600' : 'text-blue-600'}`}>
          ΔH = {effectiveDeltaH > 0 ? '+' : ''}{effectiveDeltaH} kJ/mol
        </span>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex justify-center gap-4">
          <button
            onClick={onReverse}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              equation.isReversed
                ? 'bg-red-500 text-white'
                : 'bg-warm-200 hover:bg-red-100 text-warm-700'
            }`}
          >
            🔄 Snúa við
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-warm-600">×</span>
            {[1, 2, 3].map(n => (
              <button
                key={n}
                onClick={() => onMultiply?.(n)}
                className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                  equation.multiplier === n
                    ? 'bg-blue-500 text-white'
                    : 'bg-warm-200 hover:bg-blue-100 text-warm-700'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface Level1Props {
  onComplete: (score: number, maxScore?: number, hintsUsed?: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

export function Level1({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level1Props) {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [equation, setEquation] = useState<Equation>(CHALLENGES[0].equation);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);

  const challenge = CHALLENGES[currentChallenge];

  // Shuffle options for current challenge - memoize to keep stable during challenge
  const shuffledOptions = useMemo(() => {
    return shuffleArray(challenge.options);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: re-shuffle when challenge index changes
  }, [currentChallenge, challenge.options]);

  // Reset equation when challenge changes
  useEffect(() => {
    setEquation({ ...CHALLENGES[currentChallenge].equation });
    setSelectedAnswer(null);
    setShowResult(false);
    setShowHint(false);
  }, [currentChallenge]);

  // Handle equation modifications
  const handleReverse = () => {
    setEquation(prev => ({ ...prev, isReversed: !prev.isReversed }));
  };

  const handleMultiply = (factor: number) => {
    setEquation(prev => ({ ...prev, multiplier: factor }));
  };

  // Check answer
  const checkAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = shuffledOptions[selectedAnswer].correct;
    setShowResult(true);

    if (isCorrect) {
      onCorrectAnswer?.();
      if (!completed.includes(challenge.id)) {
        const points = showHint ? 50 : 100;
        setScore(prev => prev + points);
        setCompleted(prev => [...prev, challenge.id]);
      }
    } else {
      onIncorrectAnswer?.();
    }
  };

  // Next challenge
  const nextChallenge = () => {
    if (currentChallenge < CHALLENGES.length - 1) {
      setCurrentChallenge(prev => prev + 1);
      // useEffect will reset the equation when currentChallenge changes
    } else {
      // Max score is 100 per challenge × 6 challenges = 600
      onComplete(score, 600, totalHintsUsed);
    }
  };

  // Handle hint usage
  const handleShowHint = () => {
    setShowHint(true);
    setTotalHintsUsed(prev => prev + 1);
  };

  // Show interactive controls for challenges 2-4
  const showEquationControls = challenge.id >= 2 && challenge.id <= 4;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-blue-600">
                Lögmál Hess - Stig 1
              </h1>
              <p className="text-sm text-warm-600">Skildu hugtökin - byggðu innsæi</p>
            </div>

            <div className="flex gap-4 items-center">
              <button
                onClick={onBack}
                className="text-warm-600 hover:text-warm-800 text-sm"
              >
                ← Til baka
              </button>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{score}</div>
                <div className="text-xs text-warm-600">Stig</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">
                  {completed.length}/{CHALLENGES.length}
                </div>
                <div className="text-xs text-warm-600">Lokið</div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 bg-warm-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(completed.length / CHALLENGES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          {/* Challenge header */}
          <div className="mb-6">
            <div className="inline-block bg-blue-100 px-4 py-2 rounded-full text-sm font-semibold text-blue-800 mb-2">
              {currentChallenge + 1}. {challenge.title}
            </div>
            <p className="text-warm-700 mb-2">{challenge.description}</p>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-800">
                <strong>Lykillhugtak:</strong> {challenge.concept}
              </p>
            </div>
          </div>

          {/* Energy diagram */}
          <div className="mb-6">
            <EnergyDiagram equation={equation} />
          </div>

          {/* Equation with optional controls */}
          <div className="mb-6">
            <EquationDisplay
              equation={equation}
              onReverse={handleReverse}
              onMultiply={handleMultiply}
              showControls={showEquationControls && !showResult}
            />
          </div>

          {/* Question */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-warm-800 mb-4">{challenge.question}</h3>

            <div className="space-y-3">
              {shuffledOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !showResult && setSelectedAnswer(index)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    showResult
                      ? option.correct
                        ? 'bg-green-100 border-green-500'
                        : selectedAnswer === index
                        ? 'bg-red-100 border-red-500'
                        : 'bg-warm-50 border-warm-200'
                      : selectedAnswer === index
                      ? 'bg-blue-100 border-blue-500'
                      : 'bg-white border-warm-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="font-semibold">{option.text}</div>
                  {showResult && (selectedAnswer === index || option.correct) && (
                    <div className={`mt-2 text-sm ${option.correct ? 'text-green-700' : 'text-red-700'}`}>
                      {option.explanation}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Hint */}
          {!showResult && (
            <div className="mb-6">
              {showHint ? (
                <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-xl">
                  <h4 className="font-semibold text-yellow-800 mb-2">💡 Vísbending:</h4>
                  <p className="text-yellow-900">{challenge.hints?.method || ''}</p>
                </div>
              ) : (
                <button
                  onClick={handleShowHint}
                  className="text-yellow-600 hover:text-yellow-700 text-sm"
                >
                  💡 Sýna vísbendingu (-50 stig)
                </button>
              )}
            </div>
          )}

          {/* Detailed Feedback Panel */}
          {showResult && (
            <div className="mb-6">
              <FeedbackPanel
                feedback={{
                  isCorrect: shuffledOptions[selectedAnswer!]?.correct || false,
                  explanation: shuffledOptions[selectedAnswer!]?.explanation || '',
                  misconception: shuffledOptions[selectedAnswer!]?.correct
                    ? undefined
                    : MISCONCEPTIONS[challenge.id],
                  relatedConcepts: RELATED_CONCEPTS[challenge.id],
                  nextSteps: shuffledOptions[selectedAnswer!]?.correct
                    ? 'Frábært! Þú skilur þetta hugtak vel. Haltu áfram.'
                    : 'Skoðaðu útskýringuna og reyndu að muna regluna.',
                }}
                config={{
                  showExplanation: true,
                  showMisconceptions: !shuffledOptions[selectedAnswer!]?.correct,
                  showRelatedConcepts: true,
                  showNextSteps: true,
                }}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-4">
            {!showResult ? (
              <button
                onClick={checkAnswer}
                disabled={selectedAnswer === null}
                className={`flex-1 py-3 px-6 rounded-xl font-bold transition-colors ${
                  selectedAnswer !== null
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-warm-300 text-warm-500 cursor-not-allowed'
                }`}
              >
                Athuga svar
              </button>
            ) : (
              <button
                onClick={nextChallenge}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                {currentChallenge < CHALLENGES.length - 1 ? 'Næsta verkefni →' : 'Ljúka stigi →'}
              </button>
            )}
          </div>
        </div>

        {/* State Path Comparison - Educational visualization */}
        <div className="mt-6">
          <StatePathComparison compact={true} />
        </div>

        {/* Challenge navigation */}
        <div className="mt-6 flex justify-center gap-2">
          {CHALLENGES.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setCurrentChallenge(i)}
              className={`w-10 h-10 rounded-full font-bold transition-colors ${
                completed.includes(c.id)
                  ? 'bg-green-500 text-white'
                  : i === currentChallenge
                  ? 'bg-blue-500 text-white'
                  : 'bg-warm-200 text-warm-600 hover:bg-warm-300'
              }`}
            >
              {completed.includes(c.id) ? '✓' : i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Level1;
