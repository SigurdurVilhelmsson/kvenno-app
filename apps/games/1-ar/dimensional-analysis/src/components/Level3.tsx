import { useState, useEffect } from 'react';

import { level3Challenges } from '../data/challenges';
import {
  scoreExplanation,
  calculateCompositeScore,
  countSignificantFigures,
} from '../utils/scoring';

interface ScoreResult {
  answer: number;
  method: number;
  explanation: number;
  efficiency: number;
  composite: number;
  sigFig: number | null;
  userSigFigs: number | null;
  hintPenalty: number;
}

interface Level3Progress {
  problemsCompleted: number;
  compositeScores: number[];
  totalSteps?: number;
  achievements: string[];
  mastered: boolean;
  hintsUsed: number;
}

interface Level3Props {
  onComplete: (progress: Level3Progress, maxScore?: number, hintsUsed?: number) => void;
  onBack: () => void;
  initialProgress?: Level3Progress;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

export function Level3({
  onComplete,
  onBack,
  initialProgress,
  onCorrectAnswer,
  onIncorrectAnswer,
}: Level3Props) {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(
    initialProgress?.problemsCompleted || 0
  );
  const [progress, setProgress] = useState<Level3Progress>(
    initialProgress
      ? {
          ...initialProgress,
          totalSteps: initialProgress.totalSteps || 0,
          hintsUsed: initialProgress.hintsUsed || 0,
        }
      : {
          problemsCompleted: 0,
          compositeScores: [],
          totalSteps: 0,
          achievements: [],
          mastered: false,
          hintsUsed: 0,
        }
  );
  const [totalHintsUsed, setTotalHintsUsed] = useState(initialProgress?.hintsUsed || 0);

  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedPath, setSelectedPath] = useState<number | null>(null);
  const [explanation, setExplanation] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [scores, setScores] = useState<ScoreResult | null>(null);
  const [, setHintUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const problem = level3Challenges[currentProblemIndex];

  useEffect(() => {
    if (problem) {
      setUserAnswer('');
      setSelectedOption(null);
      setSelectedPath(null);
      setExplanation('');
      setShowFeedback(false);
      setScores(null);
      setHintUsed(false);
      setShowHint(false);
    }
  }, [currentProblemIndex, problem]);

  const getHint = () => {
    const hints: Record<string, string> = {
      reverse:
        'Byrjaðu með upphafsgildinu og spyrðu þig: Hvaða stuðlar myndu breyta því í lokagildið?',
      error_analysis:
        'Athugaðu hvort stuðullinn sé snúinn rétt - einingin sem á að hverfa þarf að vera í nefnara.',
      efficiency: 'Leitaðu að beinum stuðlum í stað þess að fara í gegnum margar millistig.',
      synthesis:
        'Byrjaðu á að margfalda rúmmál með eðlismassa til að fá massa, síðan umbreyttu einingum.',
      real_world: 'Umbreyttu öllum gildum í sömu einingar áður en þú reiknar fjölda skammta.',
      derivation: 'Notaðu vísindatölustafi (t.d. 3.00e8) fyrir mjög stórar eða litlar tölur.',
    };
    return hints[problem.type] || 'Hugsaðu vel um hvaða stuðla þú þarft og í hvaða röð.';
  };

  const handleSubmit = () => {
    let answerScore = 0;
    let methodScore = 0;
    const explanationScore = scoreExplanation(explanation, problem.type);
    let efficiencyScore = 0;
    let sigFigScore: number | null = null;
    let userSigFigs: number | null = null;

    // Score based on problem type
    if (problem.type === 'reverse' && problem.options) {
      const selected = problem.options[selectedOption!];
      if (selected && selected.correct) {
        answerScore = 1;
        methodScore = 1;
        // Efficiency bonus for fewer steps
        if (selected.steps === 1) efficiencyScore = 1;
        else if (selected.steps === 2) efficiencyScore = 0.8;
      }
    } else if (problem.type === 'error_analysis') {
      const userNum = parseFloat(userAnswer);
      if (Math.abs(userNum - (problem.correctAnswer || 0)) < 0.01) {
        answerScore = 1;
      }
      if (
        explanation.toLowerCase().includes('öfug') ||
        explanation.toLowerCase().includes('rang')
      ) {
        methodScore = 1;
      }
    } else if (problem.type === 'efficiency') {
      const userNum = parseFloat(userAnswer);
      if (Math.abs(userNum - (problem.targetAnswer || 0)) < 0.01) {
        answerScore = 1;
      }
      if (selectedPath !== null && problem.possiblePaths) {
        const path = problem.possiblePaths[selectedPath];
        if (path.efficient) {
          efficiencyScore = 1;
          methodScore = 1;
        } else {
          methodScore = 0.5;
        }
      }
    } else if (problem.type === 'synthesis' || problem.type === 'derivation') {
      const userNum = parseFloat(userAnswer);
      const tolerance = (problem.expectedAnswer || 0) * 0.01; // 1% tolerance
      if (Math.abs(userNum - (problem.expectedAnswer || 0)) < tolerance) {
        answerScore = 1;
      }

      // Check significant figures if required (only for synthesis type)
      // Note: sig figs are tracked and displayed as feedback only — not penalized in answerScore
      if (problem.type === 'synthesis' && problem.significantFigures) {
        userSigFigs = countSignificantFigures(userAnswer);
        sigFigScore = userSigFigs === problem.significantFigures ? 1 : 0;
      }

      if (explanation.length > 20) {
        methodScore = 1;
      }
    } else if (problem.type === 'real_world') {
      const userNum = parseInt(userAnswer);
      if (userNum === problem.expectedAnswer) {
        answerScore = 1;
        methodScore = 1;
      }
    }

    const composite = calculateCompositeScore(
      answerScore,
      methodScore,
      explanationScore,
      efficiencyScore
    );

    // No hint penalty — hints are free for learning

    setScores({
      answer: answerScore,
      method: methodScore,
      explanation: explanationScore,
      efficiency: efficiencyScore,
      composite: composite,
      sigFig: sigFigScore,
      userSigFigs: userSigFigs,
      hintPenalty: 0,
    });

    setShowFeedback(true);

    // Track achievements
    if (composite >= 0.75) {
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
    }

    // Update progress
    const newProgress = {
      ...progress,
      compositeScores: [...progress.compositeScores, composite],
      totalSteps:
        (progress.totalSteps || 0) +
        (selectedPath !== null && problem.type === 'efficiency' && problem.possiblePaths
          ? problem.possiblePaths[selectedPath].stepCount
          : 2),
    };
    setProgress(newProgress);
  };

  const handleContinue = () => {
    const newProgress = {
      ...progress,
      problemsCompleted: progress.problemsCompleted + 1,
      hintsUsed: totalHintsUsed,
    };

    // Check mastery after 10 problems
    if (newProgress.problemsCompleted >= 10) {
      const avgScore =
        newProgress.compositeScores.reduce((a, b) => a + b, 0) / newProgress.compositeScores.length;
      newProgress.mastered = avgScore >= 0.75;
    }

    setProgress(newProgress);

    if (currentProblemIndex < level3Challenges.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
    } else {
      // Max score is 100 per problem x 10 problems = 1000
      onComplete(newProgress, 1000, totalHintsUsed);
    }
  };

  if (!problem) return null;

  const avgScore =
    progress.compositeScores.length > 0
      ? Math.round(
          (progress.compositeScores.reduce((a, b) => a + b, 0) / progress.compositeScores.length) *
            100
        )
      : 0;

  const problemTypeLabels: Record<string, string> = {
    reverse: 'Öfug greining',
    error_analysis: 'Villugreining',
    efficiency: 'Skilvirkni',
    synthesis: 'Samsetning',
    real_world: 'Raunveruleiki',
    derivation: 'Afleiðing',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={onBack}
            className="text-warm-600 hover:text-warm-800 flex items-center gap-2 text-lg"
          >
            ← Til baka
          </button>
          <div className="text-sm text-warm-600 flex items-center gap-2 sm:gap-4 flex-wrap">
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-semibold">
              Stig 3: Útreikningar
            </span>
            <span>Áskorun {progress.problemsCompleted + 1} / 10</span>
            <span
              className={`px-2 py-1 rounded text-xs ${
                avgScore >= 75 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              Meðal: {avgScore}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-warm-200 rounded-full h-2 mb-6">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(progress.problemsCompleted / 10) * 100}%` }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Problem type badge */}
          <div className="mb-4 flex items-center gap-3">
            <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-xl text-sm font-bold">
              {problemTypeLabels[problem.type] || problem.type}
            </span>
            <span className="text-2xl">
              {problem.type === 'reverse' && '🔄'}
              {problem.type === 'error_analysis' && '🔍'}
              {problem.type === 'efficiency' && '⚡'}
              {problem.type === 'synthesis' && '🧪'}
              {problem.type === 'real_world' && '🌍'}
              {problem.type === 'derivation' && '📐'}
            </span>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-warm-800">{problem.prompt}</h2>

          {/* Display problem-specific context */}
          {problem.type === 'synthesis' && problem.density && (
            <div className="mb-6 p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <p className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2">
                <span className="text-lg">📊</span> Gefnar upplýsingar:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {problem.startValue && problem.startUnit && (
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-warm-500">Rúmmál</p>
                    <p className="font-bold text-purple-700">
                      {problem.startValue} {problem.startUnit}
                    </p>
                  </div>
                )}
                {problem.density && problem.densityUnit && (
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-warm-500">Eðlismassi</p>
                    <p className="font-bold text-purple-700">
                      {problem.density} {problem.densityUnit}
                    </p>
                  </div>
                )}
                {problem.targetUnit && (
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-warm-500">Markeining</p>
                    <p className="font-bold text-green-700">{problem.targetUnit}</p>
                  </div>
                )}
                {problem.significantFigures && (
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-warm-500">Markverðir stafir</p>
                    <p className="font-bold text-blue-700">{problem.significantFigures}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {problem.type === 'real_world' && (problem.startValue || problem.portionSize) && (
            <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200">
              <p className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
                <span className="text-lg">📊</span> Gefnar upplýsingar:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {problem.startValue && problem.startUnit && (
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-warm-500">Heildarmagn</p>
                    <p className="font-bold text-green-700">
                      {problem.startValue} {problem.startUnit}
                    </p>
                  </div>
                )}
                {problem.portionSize && problem.portionUnit && (
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-warm-500">Skammtastærð</p>
                    <p className="font-bold text-green-700">
                      {problem.portionSize} {problem.portionUnit}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {problem.type === 'error_analysis' && problem.incorrectWork && (
            <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200">
              <p className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
                <span className="text-lg">⚠️</span> Röng vinna:
              </p>
              <div className="bg-white p-4 rounded-lg border-2 border-red-200">
                <p className="font-mono text-red-700 text-lg">{problem.incorrectWork}</p>
              </div>
            </div>
          )}

          {!showFeedback && (
            <div className="space-y-6">
              {/* Reverse problem options */}
              {problem.type === 'reverse' && problem.options && (
                <div className="space-y-3">
                  <p className="font-bold text-warm-800">Veldu rétta leið:</p>
                  {problem.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedOption(idx)}
                      className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                        selectedOption === idx
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-warm-200 hover:border-purple-300 hover:bg-warm-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option.text}</span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            selectedOption === idx
                              ? 'bg-purple-200 text-purple-800'
                              : 'bg-warm-100 text-warm-600'
                          }`}
                        >
                          {option.steps} skref
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Efficiency problem paths */}
              {problem.type === 'efficiency' && problem.possiblePaths && (
                <div className="space-y-3">
                  <p className="font-bold text-warm-800">Veldu leið:</p>
                  {problem.possiblePaths.map((path, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPath(idx)}
                      className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                        selectedPath === idx
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-warm-200 hover:border-purple-300 hover:bg-warm-50'
                      }`}
                    >
                      <div className="space-y-2 mb-3">
                        {path.steps.map((step, sidx) => (
                          <div
                            key={sidx}
                            className="font-mono text-sm bg-white px-3 py-2 rounded-lg border border-warm-100"
                          >
                            {step}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            path.efficient
                              ? 'bg-green-100 text-green-700'
                              : 'bg-warm-100 text-warm-600'
                          }`}
                        >
                          {path.stepCount} skref
                        </span>
                        {path.efficient && (
                          <span className="text-green-600 text-sm">⚡ Skilvirkt</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Answer input */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
                <label className="block font-bold mb-3 text-warm-800">
                  {problem.type === 'error_analysis' ? 'Hvað er rétta svarið?' : 'Þitt svar:'}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder={
                      problem.type === 'derivation' && problem.scientificNotation
                        ? 't.d. 1.08e12'
                        : 'Sláðu inn svar'
                    }
                    className="flex-1 p-4 border-2 border-warm-300 rounded-xl font-mono text-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-hidden transition-all"
                  />
                  {problem.type !== 'reverse' &&
                    problem.type !== 'error_analysis' &&
                    'targetUnit' in problem &&
                    problem.targetUnit && (
                      <div className="px-4 py-3 bg-green-100 text-green-800 rounded-xl font-bold text-lg">
                        {problem.targetUnit}
                      </div>
                    )}
                </div>
              </div>

              {/* Explanation */}
              <div className="p-4 bg-warm-50 rounded-xl border border-warm-200">
                <label className="block font-bold mb-2 text-warm-800">
                  Útskýring (hvernig leystir þú þetta?):
                </label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="T.d. 'Fyrst breytti ég X í Y með stuðlinum Z...'"
                  className="w-full p-4 border-2 border-warm-300 rounded-xl h-28 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-hidden transition-all resize-none"
                />
                <p className="text-xs text-warm-500 mt-2 flex items-center gap-1">
                  <span className="text-base">💡</span> Notaðu orð eins og "umbreyti", "stuðull",
                  "eining" fyrir betri einkunn
                </p>
              </div>

              {/* Hint */}
              {showHint && (
                <div className="p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <p className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                    <span className="text-xl">💡</span> Vísbending:
                  </p>
                  <p className="text-blue-700 mb-3">{getHint()}</p>
                  <p className="text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg inline-block">
                    ⚠️ 10% dregið frá heildareinkunn
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-3">
                {!showHint && (
                  <button
                    onClick={() => {
                      setShowHint(true);
                      setHintUsed(true);
                      setTotalHintsUsed((prev) => prev + 1);
                      setProgress((prev) => ({
                        ...prev,
                        hintsUsed: prev.hintsUsed + 1,
                      }));
                    }}
                    className="w-full border-2 border-blue-400 text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
                  >
                    💡 Sýna vísbendingu (kostar 15% af einkunn)
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={!userAnswer.trim() || !explanation.trim()}
                  className="w-full py-4 rounded-xl font-bold text-lg transition-all disabled:bg-warm-300 disabled:cursor-not-allowed disabled:text-warm-500 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Senda inn →
                </button>
              </div>
            </div>
          )}

          {/* Feedback */}
          {showFeedback && scores && (
            <div
              className={`p-6 rounded-xl border-2 ${
                scores.composite >= 0.75
                  ? 'bg-green-100 border-green-300'
                  : 'bg-yellow-100 border-yellow-300'
              }`}
            >
              {/* Header with emoji */}
              <div className="text-center mb-6">
                <div className="text-5xl mb-2">
                  {scores.composite >= 0.9
                    ? '🏆'
                    : scores.composite >= 0.75
                      ? '🎉'
                      : scores.composite >= 0.5
                        ? '💪'
                        : '📚'}
                </div>
                <h3 className="text-2xl font-bold">
                  {scores.composite >= 0.9
                    ? 'Frábært!'
                    : scores.composite >= 0.75
                      ? 'Vel gert!'
                      : scores.composite >= 0.5
                        ? 'Gott!'
                        : 'Þú getur gert betur'}
                </h3>
              </div>

              {/* Simple feedback — no weighted scoring grid */}
              <div className="bg-white p-5 rounded-xl text-center mb-6">
                <p className="text-sm text-warm-600 mb-1">
                  {scores.answer >= 0.75 ? 'Svarið er rétt!' : 'Svarið er ekki alveg rétt'}
                </p>
                {scores.method >= 0.75 && (
                  <p className="text-sm text-green-600">✓ Rétt aðferð valin</p>
                )}
                {scores.method < 0.75 && (
                  <p className="text-sm text-amber-600">
                    Athugaðu aðferðina — sjáðu lausnina hér að neðan
                  </p>
                )}
              </div>

              {/* Error explanation */}
              {problem.type === 'error_analysis' && problem.errorExplanation && (
                <div className="mb-6 p-4 bg-white rounded-xl border border-warm-200">
                  <p className="text-sm font-bold text-warm-800 mb-2 flex items-center gap-2">
                    <span>🔍</span> Útskýring á villunni:
                  </p>
                  <p className="text-warm-700">{problem.errorExplanation}</p>
                </div>
              )}

              {/* Step-by-step solution display */}
              {'correctMethod' in problem && problem.correctMethod && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <p className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <span>📝</span> Rétt aðferð (stuðlaleiðin):
                  </p>
                  <div className="space-y-2">
                    {problem.correctMethod.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-mono bg-white px-3 py-2 rounded-lg border border-blue-200 flex-1">
                          × {step}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-white rounded-lg border border-blue-100">
                    <p className="text-xs text-warm-600">
                      <span className="font-bold text-blue-700">Mundu:</span> Einingin sem á að
                      hverfa fer í nefnara, einingin sem á að koma út fer í teljara. Margfaldaðu
                      gildið með öllum stuðlum.
                    </p>
                  </div>
                </div>
              )}

              {'requiredSteps' in problem &&
                problem.requiredSteps &&
                !('correctMethod' in problem) && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <p className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
                      <span>📋</span> Nauðsynleg skref:
                    </p>
                    <div className="space-y-2">
                      {problem.requiredSteps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="bg-white px-3 py-2 rounded-lg border border-green-200 flex-1 text-sm">
                            {step === 'multiply by density' &&
                              '🧪 Margfaldaðu með eðlismassa (g = mL × g/mL)'}
                            {step === 'convert g to kg' && '⚖️ Umbreyttu g í kg (deila með 1000)'}
                            {step === 'convert cm³ to m³' &&
                              '📐 Umbreyttu cm³ í m³ (deila með 1000000)'}
                            {![
                              'multiply by density',
                              'convert g to kg',
                              'convert cm³ to m³',
                            ].includes(step) && step}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Significant figures feedback */}
              {problem.type === 'synthesis' &&
                problem.significantFigures &&
                scores.sigFig !== null && (
                  <div
                    className={`mb-6 p-4 rounded-xl ${scores.sigFig === 1 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
                  >
                    <p className="font-bold mb-1 flex items-center gap-2">
                      {scores.sigFig === 1 ? (
                        <>
                          <span>✓</span> Markverðir stafir réttir
                        </>
                      ) : (
                        <>
                          <span>✗</span> Markverðir stafir rangir
                        </>
                      )}
                    </p>
                    <p className="text-sm">
                      Þitt svar: {scores.userSigFigs} stafir · Ætti: {problem.significantFigures}{' '}
                      stafir
                    </p>
                  </div>
                )}

              <button
                onClick={handleContinue}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
                  scores.composite >= 0.75
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {currentProblemIndex < level3Challenges.length - 1
                  ? 'Næsta áskorun →'
                  : 'Ljúka stigi'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
