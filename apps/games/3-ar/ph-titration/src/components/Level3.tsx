import { useState, useRef, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import { LEVEL3_CHALLENGES } from '../data/level3-challenges';

interface Level3Props {
  onComplete: (score: number, maxScore?: number, hintsUsed?: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
  t?: (key: string, fallback?: string) => string;
}

export function Level3({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer, t }: Level3Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [completed, setCompleted] = useState(0);
  const levelCompleteReported = useRef(false);

  // Answer state
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const challenge = LEVEL3_CHALLENGES[currentIndex];
  const maxScore = LEVEL3_CHALLENGES.length * 20;

  // Reset state when changing challenges
  useEffect(() => {
    setUserAnswer('');
    setShowResult(false);
    setShowHint(false);
    setShowSolution(false);
    setIsCorrect(false);
  }, [currentIndex]);

  // Check completion
  useEffect(() => {
    if (completed >= LEVEL3_CHALLENGES.length && !levelCompleteReported.current) {
      levelCompleteReported.current = true;
      onComplete(score, maxScore, hintsUsed);
    }
  }, [completed, score, maxScore, hintsUsed, onComplete]);

  const handleSubmit = () => {
    if (!userAnswer.trim()) return;

    const numericAnswer = parseFloat(userAnswer.replace(',', '.'));
    if (isNaN(numericAnswer)) return;

    const relativeError =
      Math.abs(numericAnswer - challenge.correctAnswer) / challenge.correctAnswer;
    const correct = relativeError <= challenge.tolerance;

    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      const points = showHint ? 10 : 20;
      setScore((prev) => prev + points);
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
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

  const challengeTypeKeys: Record<string, string> = {
    'find-concentration': 'findConcentration',
    'find-volume': 'findVolume',
    polyprotic: 'polyprotic',
    'henderson-hasselbalch': 'hendersonHasselbalch',
    combined: 'combined',
  };

  const challengeTypeFallbacks: Record<string, string> = {
    'find-concentration': 'Styrkur',
    'find-volume': 'Rúmmál',
    polyprotic: 'Fjölprótón',
    'henderson-hasselbalch': 'H-H jafna',
    combined: 'Samansett',
  };

  const getChallengeTypeLabel = (type: string): string => {
    const key = challengeTypeKeys[type];
    if (key && t) return t(`challengeTypes.${key}`, challengeTypeFallbacks[type]);
    return challengeTypeFallbacks[type] || type;
  };

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-4">
          <div className="flex justify-between items-center">
            <button
              onClick={onBack}
              className="text-warm-600 hover:text-warm-800 flex items-center gap-2"
            >
              ← Til baka
            </button>
            <div className="flex items-center gap-4">
              <div className="text-sm text-warm-500">
                {completed + 1} / {LEVEL3_CHALLENGES.length}
              </div>
              <div className="text-lg font-bold text-purple-600">Stig: {score}</div>
            </div>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-purple-600 mt-2">
            📐 Stig 3: Útreikningar
          </h1>

          {/* Progress bar */}
          <div className="w-full bg-warm-200 rounded-full h-2 mt-3">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completed / LEVEL3_CHALLENGES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Challenge card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-4">
          <div className="flex items-start gap-3 mb-4">
            <span
              className={`${getChallengeTypeColor(challenge.type)} text-white text-xs font-bold px-3 py-1 rounded-full`}
            >
              {getChallengeTypeLabel(challenge.type)}
            </span>
            <h2 className="text-lg font-bold text-warm-800">{challenge.titleIs}</h2>
          </div>

          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-4">
            <p className="text-purple-900 text-lg">{challenge.descriptionIs}</p>
          </div>

          {/* Given data */}
          <div className="bg-warm-50 rounded-xl p-4 mb-4">
            <h3 className="font-bold text-warm-700 mb-2">Gefið:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {challenge.givenData.analyteVolume && (
                <div>
                  <span className="font-semibold">Rúmmál sýnis:</span>{' '}
                  {challenge.givenData.analyteVolume} mL
                </div>
              )}
              {challenge.givenData.analyteMolarity && (
                <div>
                  <span className="font-semibold">Styrkur sýnis:</span>{' '}
                  {challenge.givenData.analyteMolarity} M
                </div>
              )}
              {challenge.givenData.titrantMolarity && (
                <div>
                  <span className="font-semibold">Styrkur títrants:</span>{' '}
                  {challenge.givenData.titrantMolarity} M
                </div>
              )}
              {challenge.givenData.equivalenceVolume && (
                <div>
                  <span className="font-semibold">Jafngildisrúmmál:</span>{' '}
                  {challenge.givenData.equivalenceVolume} mL
                </div>
              )}
              {challenge.givenData.pKa && (
                <div>
                  <span className="font-semibold">pKₐ:</span> {challenge.givenData.pKa}
                </div>
              )}
              {challenge.givenData.pH && (
                <div>
                  <span className="font-semibold">pH:</span> {challenge.givenData.pH}
                </div>
              )}
              {challenge.givenData.acidConcentration && (
                <div>
                  <span className="font-semibold">[Sýra]:</span>{' '}
                  {challenge.givenData.acidConcentration} M
                </div>
              )}
              {challenge.givenData.baseConcentration && (
                <div>
                  <span className="font-semibold">[Basi]:</span>{' '}
                  {challenge.givenData.baseConcentration} M
                </div>
              )}
            </div>
            {challenge.givenData.formula && (
              <div className="mt-3 pt-3 border-t border-warm-200">
                <span className="font-semibold text-warm-700">Jafna:</span>
                <div className="font-mono text-purple-700 mt-1">{challenge.givenData.formula}</div>
              </div>
            )}
          </div>

          {/* Answer input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-warm-700 mb-2">
              Svar {challenge.unit && `(${challenge.unit})`}:
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={showResult}
                placeholder="Sláðu inn svar..."
                className={`flex-1 px-4 py-3 border-2 rounded-xl text-lg font-mono ${
                  showResult
                    ? isCorrect
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : 'border-warm-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
                }`}
              />
              {challenge.unit && (
                <span className="flex items-center px-4 py-3 bg-warm-100 rounded-xl font-semibold text-warm-700">
                  {challenge.unit}
                </span>
              )}
            </div>
            <p className="text-xs text-warm-500 mt-1">
              Skekkjumörk: ±{(challenge.tolerance * 100).toFixed(0)}%
            </p>
          </div>

          {/* Hint */}
          <AnimatePresence>
            {!showResult && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="mb-4"
              >
                {showHint ? (
                  <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4">
                    <div className="font-bold text-yellow-800 mb-1">💡 Vísbending:</div>
                    <p className="text-yellow-900">{challenge.hintIs}</p>
                  </div>
                ) : (
                  <button
                    onClick={handleShowHint}
                    className="text-yellow-600 hover:text-yellow-800 text-sm flex items-center gap-2"
                  >
                    💡 Sýna vísbendingu (-10 stig)
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <AnimatePresence>
            {!showResult && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  onClick={handleSubmit}
                  disabled={!userAnswer.trim()}
                  className={`w-full px-6 py-3 rounded-xl font-bold transition-colors ${
                    userAnswer.trim()
                      ? 'bg-purple-500 hover:bg-purple-600 text-white'
                      : 'bg-warm-200 text-warm-400 cursor-not-allowed'
                  }`}
                >
                  Staðfesta svar
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result feedback */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className={`p-4 rounded-xl ${isCorrect ? 'bg-green-50 border border-green-300' : 'bg-red-50 border border-red-300'}`}
              >
                <div className={`font-bold mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  {isCorrect ? '✓ Rétt!' : '✗ Rangt'}
                  {isCorrect && showHint && ' (10 stig)'}
                  {isCorrect && !showHint && ' (+20 stig)'}
                </div>

                <div className="text-sm mb-2">
                  <span className="font-semibold">Þitt svar:</span> {userAnswer} {challenge.unit}
                  <br />
                  <span className="font-semibold">Rétt svar:</span> {challenge.correctAnswer}{' '}
                  {challenge.unit}
                </div>

                <p className={`text-sm ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                  {challenge.explanationIs}
                </p>

                {/* Show solution button */}
                {!showSolution && (
                  <button
                    onClick={() => setShowSolution(true)}
                    className="mt-3 text-purple-600 hover:text-purple-800 text-sm font-semibold"
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
                  onClick={handleNext}
                  className="mt-4 w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold"
                >
                  {currentIndex < LEVEL3_CHALLENGES.length - 1 ? 'Næsta →' : 'Ljúka stigi →'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reference tables */}
        <div className="bg-white rounded-2xl shadow-xl p-4">
          <h3 className="font-bold text-warm-700 mb-3">📋 Uppflettitöflur</h3>
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
                    <td>3.17</td>
                  </tr>
                  <tr>
                    <td>HCOOH</td>
                    <td>3.75</td>
                  </tr>
                  <tr>
                    <td>CH₃COOH</td>
                    <td>4.74</td>
                  </tr>
                  <tr>
                    <td>H₂CO₃</td>
                    <td>6.35, 10.33</td>
                  </tr>
                  <tr>
                    <td>H₃PO₄</td>
                    <td>2.15, 7.20, 12.35</td>
                  </tr>
                  <tr>
                    <td>NH₄⁺</td>
                    <td>9.26</td>
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
        </div>
      </div>
    </div>
  );
}
