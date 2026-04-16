import { useState } from 'react';

import { useEscapeKey } from '@shared/hooks';

import { challenges, MAX_SCORE } from '../data/level3-questions';
import type { MechanismStep } from '../data/level3-questions';

interface Level3Props {
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

export function Level3({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level3Props) {
  const [showIntro, setShowIntro] = useState(true);
  useEscapeKey(onBack, showIntro);
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

    const selectedOption = challenge.options.find((opt) => opt.id === selectedAnswer);
    if (selectedOption?.correct) {
      setScore((prev) => prev + 20);
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
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
      onComplete(score, MAX_SCORE, totalHintsUsed);
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
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="text-warm-500 hover:text-warm-700">
              ← Til baka
            </button>
            <h1 className="text-lg font-bold text-warm-800">
              Gangvegir og hraðaákveðandi skref — Kennsla
            </h1>
            <span className="text-sm text-warm-500">Stig 3</span>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4">
            <h2 className="font-bold text-purple-900 mb-2">Hvað er gangvegur?</h2>
            <p className="text-warm-700 text-sm leading-relaxed">
              Flest efnahvörf gerast ekki í einu skrefi — þau hafa <strong>gangveg</strong> með
              mörgum <strong>einþrepa skrefum</strong>. Hvert skref hefur sitt eigið hraðastig.
            </p>
          </div>

          <div className="bg-white border border-warm-200 rounded-lg p-4 space-y-3">
            <h3 className="font-bold text-warm-800">Þrjú lykilhugtök</h3>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
              <p className="font-bold text-amber-800 mb-1">Millistig (intermediate)</p>
              <p className="text-warm-700">
                Tegund sem <strong>myndast í einu skrefi og eyðist í öðru</strong>. Hún kemur ekki
                fram í heildarjöfnunni og má <strong>ekki</strong> birtast í hraðalögmálinu.
              </p>
              <p className="font-mono text-xs text-warm-800 mt-1">
                Skref 1: A + B → I &nbsp;&nbsp; Skref 2: I + C → D &nbsp;&nbsp; (I = millistig)
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
              <p className="font-bold text-red-800 mb-1">Hraðaákveðandi skref (RDS)</p>
              <p className="text-warm-700">
                <strong>Hægasta skrefið</strong> ákvarðar hraða alls hvarfsins — eins og hægasti
                hlaupari stýrir hraða boðhlaupsteyma. Hraðalögmálið kemur beint úr hvarfefnum
                hraðaákveðandi skrefsins.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="font-bold text-blue-800 mb-1">Hverfa um jafnvægi (fast equilibrium)</p>
              <p className="text-warm-700">
                Ef hraðaákveðandi skrefið inniheldur millistig, notum við jafnvægisstuðulinn úr
                hröðu skrefinu á undan til að losna við millistigið í lokajöfnunni.
              </p>
              <p className="font-mono text-xs text-warm-800 mt-1">
                NO + Br₂ ⇌ NOBr₂ (hratt) &nbsp;&nbsp; NOBr₂ + NO → 2NOBr (hægt)
              </p>
              <p className="text-xs text-warm-700 mt-1">
                [NOBr₂] = K[NO][Br₂] → Rate = k[NO]²[Br₂]
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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="text-warm-600 hover:text-warm-800 flex items-center gap-2"
          >
            <span>&larr;</span> Til baka
          </button>
          <div className="text-right">
            <div className="text-sm text-warm-600">
              Stig 3 / Þraut {currentChallenge + 1} af {challenges.length}
            </div>
            <div className="text-lg font-bold text-purple-600">{score} stig</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-warm-200 rounded-full h-2 mb-6">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentChallenge + 1) / challenges.length) * 100}%` }}
          />
        </div>

        {/* Main content */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-purple-800 mb-2">{challenge.title}</h2>
          <p className="text-warm-600 mb-4">{challenge.description}</p>

          {/* Overall reaction */}
          <div className="bg-purple-50 p-4 rounded-xl mb-6">
            <div className="text-sm text-purple-600 mb-1">Heildarhvarf:</div>
            <div className="text-center font-mono text-xl font-bold">
              {challenge.overallReaction}
            </div>
          </div>

          {/* Mechanism steps */}
          <div className="mb-6">
            <h3 className="font-bold text-warm-700 mb-3">Hvarfgangsháttur:</h3>
            <div className="space-y-3">
              {challenge.mechanism.map((step, idx) => (
                <div key={idx} className={`p-4 rounded-xl border-2 ${getStepStyle(step.type)}`}>
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-lg">{step.equation}</div>
                    {step.label && (
                      <span
                        className={`text-sm font-semibold px-2 py-1 rounded ${
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

          {/* Question */}
          <div className="bg-warm-50 p-4 rounded-xl mb-6">
            <div className="font-bold text-warm-800">{challenge.question}</div>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {challenge.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAnswerSelect(option.id)}
                disabled={showResult}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${getOptionStyle(option)}`}
              >
                <div className="flex items-start gap-3">
                  <span className="font-bold text-warm-500 uppercase">{option.id}.</span>
                  <span className="flex-1">{option.text}</span>
                  {showResult && option.correct && (
                    <span className="text-green-600 font-bold">✓</span>
                  )}
                  {showResult && selectedAnswer === option.id && !option.correct && (
                    <span className="text-red-600 font-bold">✗</span>
                  )}
                </div>
                {showResult && selectedAnswer === option.id && (
                  <div
                    className={`mt-2 text-sm ${option.correct ? 'text-green-700' : 'text-red-700'}`}
                  >
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
                setTotalHintsUsed((prev) => prev + 1);
              }}
              className="text-purple-600 hover:text-purple-800 text-sm underline mb-4"
            >
              Sýna vísbendingu
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
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-warm-300 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              Athuga svar
            </button>
          )}

          {/* Concept explanation */}
          {showResult && (
            <div className="bg-purple-50 p-4 rounded-xl mb-4">
              <div className="font-bold text-purple-800 mb-2">Hugtak:</div>
              <div className="text-purple-900 text-sm">{challenge.conceptExplanation}</div>
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
          <h3 className="font-bold text-warm-700 mb-3">Lykilhugtök</h3>
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
