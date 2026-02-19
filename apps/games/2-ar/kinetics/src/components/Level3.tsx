import { useState } from 'react';

import { challenges, MAX_SCORE } from '../data/level3-questions';
import type { MechanismStep } from '../data/level3-questions';

interface Level3Props {
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

export function Level3({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level3Props) {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);

  const challenge = challenges[currentChallenge];

  const handleAnswerSelect = (optionId: string) => {
    if (showResult) return;
    setSelectedAnswer(optionId);
  };

  const checkAnswer = () => {
    if (!selectedAnswer) return;

    const selectedOption = challenge.options.find(opt => opt.id === selectedAnswer);
    if (selectedOption?.correct) {
      setScore(prev => prev + (showHint ? 10 : 20));
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
    }
    setShowResult(true);
  };

  const nextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowHint(false);
    } else {
      onComplete(score, MAX_SCORE, totalHintsUsed);
    }
  };

  const getOptionStyle = (option: { id: string; correct: boolean }) => {
    if (!showResult) {
      return selectedAnswer === option.id
        ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
        : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50';
    }

    if (option.correct) {
      return 'border-green-500 bg-green-50';
    }

    if (selectedAnswer === option.id && !option.correct) {
      return 'border-red-500 bg-red-50';
    }

    return 'border-gray-200 bg-gray-50 opacity-50';
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
        return 'border-gray-300 bg-white';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            <span>&larr;</span> Til baka
          </button>
          <div className="text-right">
            <div className="text-sm text-gray-600">Stig 3 / Þraut {currentChallenge + 1} af {challenges.length}</div>
            <div className="text-lg font-bold text-purple-600">{score} stig</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentChallenge + 1) / challenges.length) * 100}%` }}
          />
        </div>

        {/* Main content */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-purple-800 mb-2">
            {challenge.title}
          </h2>
          <p className="text-gray-600 mb-4">{challenge.description}</p>

          {/* Overall reaction */}
          <div className="bg-purple-50 p-4 rounded-xl mb-6">
            <div className="text-sm text-purple-600 mb-1">Heildarhvarf:</div>
            <div className="text-center font-mono text-xl font-bold">
              {challenge.overallReaction}
            </div>
          </div>

          {/* Mechanism steps */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-700 mb-3">Hvarfgangsháttur:</h3>
            <div className="space-y-3">
              {challenge.mechanism.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border-2 ${getStepStyle(step.type)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-lg">{step.equation}</div>
                    {step.label && (
                      <span className={`text-sm font-semibold px-2 py-1 rounded ${
                        step.type === 'slow' ? 'text-red-700 bg-red-100' :
                        step.type === 'fast' ? 'text-green-700 bg-green-100' :
                        'text-blue-700 bg-blue-100'
                      }`}>
                        {step.label}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Question */}
          <div className="bg-gray-50 p-4 rounded-xl mb-6">
            <div className="font-bold text-gray-800">{challenge.question}</div>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {challenge.options.map(option => (
              <button
                key={option.id}
                onClick={() => handleAnswerSelect(option.id)}
                disabled={showResult}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${getOptionStyle(option)}`}
              >
                <div className="flex items-start gap-3">
                  <span className="font-bold text-gray-500 uppercase">{option.id}.</span>
                  <span className="flex-1">{option.text}</span>
                  {showResult && option.correct && (
                    <span className="text-green-600 font-bold">✓</span>
                  )}
                  {showResult && selectedAnswer === option.id && !option.correct && (
                    <span className="text-red-600 font-bold">✗</span>
                  )}
                </div>
                {showResult && selectedAnswer === option.id && (
                  <div className={`mt-2 text-sm ${option.correct ? 'text-green-700' : 'text-red-700'}`}>
                    {option.explanation}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Hint button */}
          {!showResult && !showHint && (
            <button
              onClick={() => {
                setShowHint(true);
                setTotalHintsUsed(prev => prev + 1);
              }}
              className="text-purple-600 hover:text-purple-800 text-sm underline mb-4"
            >
              Sýna vísbendingu (-10 stig)
            </button>
          )}

          {showHint && !showResult && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-4">
              <span className="font-bold text-yellow-800">Vísbending: </span>
              <span className="text-yellow-900">{challenge.hint}</span>
            </div>
          )}

          {/* Check answer button */}
          {!showResult && (
            <button
              onClick={checkAnswer}
              disabled={!selectedAnswer}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              Athuga svar
            </button>
          )}

          {/* Concept explanation */}
          {showResult && (
            <div className="bg-purple-50 p-4 rounded-xl mb-4">
              <div className="font-bold text-purple-800 mb-2">Hugtak:</div>
              <div className="text-purple-900 text-sm">
                {challenge.conceptExplanation}
              </div>
            </div>
          )}

          {/* Next button */}
          {showResult && (
            <button
              onClick={nextChallenge}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              {currentChallenge < challenges.length - 1 ? 'Næsta þraut' : 'Ljúka stigi 3'}
            </button>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-3">Lykilhugtök</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-red-400"></span>
              <span>Hægt skref (RDS)</span>
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
              <span>Millistig</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
