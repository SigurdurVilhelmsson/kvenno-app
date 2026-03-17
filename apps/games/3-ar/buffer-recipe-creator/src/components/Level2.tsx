import { useState, useEffect, useRef } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import { HintSystem } from '@shared/components';

import FlaskComparison from './FlaskComparison';
import { LEVEL2_PUZZLES } from '../data/level2-puzzles';
import { BUFFER_PROBLEMS } from '../data/problems';

interface Level2Props {
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

type Step = 'direction' | 'ratio' | 'mass' | 'complete';
type Direction = 'higher' | 'equal' | 'lower' | null;

/**
 * Level 2: Henderson-Hasselbalch Calculations
 *
 * Learning Objectives:
 * - Apply Henderson-Hasselbalch equation: pH = pKa + log([Base]/[Acid])
 * - Calculate [Base]/[Acid] ratio from pH and pKa
 * - Calculate masses of acid and base components
 *
 * 3-Step Flow:
 * 1. Direction: Is target pH higher, equal, or lower than pKa?
 * 2. Ratio: Calculate the required [Base]/[Acid] ratio
 * 3. Mass: Calculate grams of acid and base needed
 */
export default function Level2({
  onComplete,
  onBack,
  onCorrectAnswer,
  onIncorrectAnswer,
}: Level2Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [step, setStep] = useState<Step>('direction');
  const [score, setScore] = useState(0);
  const [hintsUsedTotal, setHintsUsedTotal] = useState(0);
  const [hintMultiplier, setHintMultiplier] = useState(1.0);
  const [hintResetKey, setHintResetKey] = useState(0);
  const [completed, setCompleted] = useState(0);
  const levelCompleteReported = useRef(false);

  // Step 1: Direction
  const [selectedDirection, setSelectedDirection] = useState<Direction>(null);
  const [directionFeedback, setDirectionFeedback] = useState<string | null>(null);
  const [directionCorrect, setDirectionCorrect] = useState(false);

  // Step 2: Ratio
  const [ratioInput, setRatioInput] = useState('');
  const [ratioFeedback, setRatioFeedback] = useState<string | null>(null);
  const [ratioCorrect, setRatioCorrect] = useState(false);

  // Step 3: Mass
  const [acidMassInput, setAcidMassInput] = useState('');
  const [baseMassInput, setBaseMassInput] = useState('');
  const [massFeedback, setMassFeedback] = useState<string | null>(null);
  const [massCorrect, setMassCorrect] = useState(false);

  // Show explanation after puzzle completion
  const [showExplanation, setShowExplanation] = useState(false);

  const puzzle = LEVEL2_PUZZLES[currentIndex];
  const problem = BUFFER_PROBLEMS.find((p) => p.id === puzzle.problemId);
  const maxScore = LEVEL2_PUZZLES.length * 100;

  // Check completion - must be before conditional returns to satisfy rules-of-hooks
  useEffect(() => {
    if (completed >= LEVEL2_PUZZLES.length && !levelCompleteReported.current) {
      levelCompleteReported.current = true;
      onComplete(score, maxScore, hintsUsedTotal);
    }
  }, [completed, score, maxScore, hintsUsedTotal, onComplete]);

  // Safety check - should never happen with valid data
  if (!problem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
          <p className="text-red-600 font-bold">Villa: Gat ekki fundið verkefnagögn</p>
          <button onClick={onBack} className="mt-4 text-blue-600 underline">
            Til baka
          </button>
        </div>
      </div>
    );
  }

  // Determine correct direction
  const getCorrectDirection = (): Direction => {
    const diff = problem.targetPH - problem.pKa;
    if (Math.abs(diff) < 0.01) return 'equal';
    return diff > 0 ? 'higher' : 'lower';
  };

  // Handle hint usage
  const handleHintUsed = () => {
    setHintsUsedTotal((prev) => prev + 1);
  };

  // Step 1: Check direction answer
  const checkDirection = () => {
    const correct = getCorrectDirection();
    if (selectedDirection === correct) {
      setDirectionCorrect(true);
      setDirectionFeedback('Rétt! Nú skaltu reikna hlutfallið.');
      setStep('ratio');
    } else {
      const correctDir = getCorrectDirection();
      setDirectionFeedback(
        selectedDirection === 'higher'
          ? `Ekki rétt. Markmiðs-pH (${problem.targetPH.toFixed(2)}) er ${correctDir === 'lower' ? 'minna' : 'jafnt'} pKa (${problem.pKa.toFixed(2)}), þannig að svarið er ekki "hærra".`
          : selectedDirection === 'lower'
            ? `Ekki rétt. Markmiðs-pH (${problem.targetPH.toFixed(2)}) er ${correctDir === 'higher' ? 'stærra' : 'jafnt'} pKa (${problem.pKa.toFixed(2)}), þannig að svarið er ekki "lægra".`
            : `Ekki rétt. Markmiðs-pH (${problem.targetPH.toFixed(2)}) er ${correctDir === 'higher' ? 'stærra en' : correctDir === 'lower' ? 'minna en' : 'jafnt'} pKa (${problem.pKa.toFixed(2)}).`
      );
      onIncorrectAnswer?.();
    }
  };

  // Step 2: Check ratio answer
  const checkRatio = () => {
    const userRatio = parseFloat(ratioInput);
    if (isNaN(userRatio) || userRatio <= 0) {
      setRatioFeedback('Vinsamlegast sláðu inn jákvæða tölu.');
      return;
    }

    const correctRatio = problem.ratio;
    const tolerance = puzzle.ratioTolerance;
    const relativeError = Math.abs(userRatio - correctRatio) / correctRatio;

    if (relativeError <= tolerance) {
      setRatioCorrect(true);
      setRatioFeedback(`Rétt! Hlutfall = ${correctRatio.toFixed(2)}. Nú skaltu reikna massa.`);
      setStep('mass');
    } else {
      setRatioFeedback(
        `Ekki rétt. Mundu: hlutfall = 10^(pH - pKa) = 10^(${problem.targetPH.toFixed(2)} - ${problem.pKa.toFixed(2)})`
      );
      onIncorrectAnswer?.();
    }
  };

  // Step 3: Check mass answers
  const checkMass = () => {
    const userAcidMass = parseFloat(acidMassInput);
    const userBaseMass = parseFloat(baseMassInput);

    if (isNaN(userAcidMass) || isNaN(userBaseMass) || userAcidMass <= 0 || userBaseMass <= 0) {
      setMassFeedback('Vinsamlegast sláðu inn jákvæðar tölur fyrir báða massa.');
      return;
    }

    const correctAcidMass = problem.correctAcidMass;
    const correctBaseMass = problem.correctBaseMass;
    const tolerance = puzzle.massTolerance;

    const acidError = Math.abs(userAcidMass - correctAcidMass) / correctAcidMass;
    const baseError = Math.abs(userBaseMass - correctBaseMass) / correctBaseMass;

    const acidOk = acidError <= tolerance;
    const baseOk = baseError <= tolerance;

    if (acidOk && baseOk) {
      setMassCorrect(true);
      const points = Math.round(100 * hintMultiplier);
      setScore((prev) => prev + points);
      setMassFeedback(`Frábært! +${points} stig`);
      setShowExplanation(true);
      setStep('complete');
      onCorrectAnswer?.();
    } else {
      let feedback = 'Ekki rétt. ';
      if (!acidOk)
        feedback += `Sýrumassi er ${userAcidMass > correctAcidMass ? 'of hár' : 'of lágur'}. `;
      if (!baseOk)
        feedback += `Basamassi er ${userBaseMass > correctBaseMass ? 'of hár' : 'of lágur'}.`;
      setMassFeedback(feedback);
      onIncorrectAnswer?.();
    }
  };

  // Next puzzle
  const nextPuzzle = () => {
    setCompleted((prev) => prev + 1);

    if (currentIndex < LEVEL2_PUZZLES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      resetPuzzleState();
    }
  };

  // Reset puzzle state
  const resetPuzzleState = () => {
    setStep('direction');
    setSelectedDirection(null);
    setDirectionFeedback(null);
    setDirectionCorrect(false);
    setRatioInput('');
    setRatioFeedback(null);
    setRatioCorrect(false);
    setAcidMassInput('');
    setBaseMassInput('');
    setMassFeedback(null);
    setMassCorrect(false);
    setShowExplanation(false);
    setHintMultiplier(1.0);
    setHintResetKey((prev) => prev + 1);
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
                {completed + 1} / {LEVEL2_PUZZLES.length}
              </div>
              <div className="text-lg font-bold text-kvenno-orange">Stig: {score}</div>
            </div>
          </div>

          <h1 className="text-xl md:text-2xl font-bold mt-2 text-kvenno-orange">
            Stuðpúðasmíði - Stig 2
          </h1>
          <p className="text-warm-600 text-sm">Henderson-Hasselbalch útreikningar</p>

          {/* Progress bar */}
          <div className="w-full bg-warm-200 rounded-full h-2 mt-3">
            <div
              className="h-2 rounded-full transition-all duration-300 bg-kvenno-orange"
              style={{ width: `${(completed / LEVEL2_PUZZLES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Task Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4 border-t-4 border-kvenno-orange">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-white text-sm font-bold px-3 py-1 rounded-full bg-kvenno-orange">
              #{puzzle.id}
            </span>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-warm-800">{problem.system}</h2>
              <p className="text-warm-700 mt-1">{puzzle.taskIs}</p>
            </div>
          </div>

          {/* Problem Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-warm-50 p-3 rounded-lg text-center">
              <div className="text-xs text-warm-500">pKa</div>
              <div className="text-lg font-bold text-warm-800">{problem.pKa}</div>
            </div>
            <div className="bg-warm-50 p-3 rounded-lg text-center">
              <div className="text-xs text-warm-500">Markmið pH</div>
              <div className="text-lg font-bold text-kvenno-orange">{problem.targetPH}</div>
            </div>
            <div className="bg-warm-50 p-3 rounded-lg text-center">
              <div className="text-xs text-warm-500">Rúmmál</div>
              <div className="text-lg font-bold text-warm-800">{problem.volume} L</div>
            </div>
            <div className="bg-warm-50 p-3 rounded-lg text-center">
              <div className="text-xs text-warm-500">Heildarstyrkur</div>
              <div className="text-lg font-bold text-warm-800">{problem.totalConcentration} M</div>
            </div>
          </div>

          {/* Component Info */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-xs text-red-600 font-semibold">Sýra</div>
              <div className="font-bold text-red-800">{problem.acidName}</div>
              <div className="text-xs text-red-600">M = {problem.acidMolarMass} g/mol</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-xs text-blue-600 font-semibold">Basi</div>
              <div className="font-bold text-blue-800">{problem.baseName}</div>
              <div className="text-xs text-blue-600">M = {problem.baseMolarMass} g/mol</div>
            </div>
          </div>

          {/* Context */}
          {problem.context && (
            <div className="bg-purple-50 border-l-4 border-purple-400 p-3 mb-4">
              <p className="text-sm text-purple-800">{problem.context}</p>
            </div>
          )}

          {/* Hint System */}
          <div className="mb-4">
            <HintSystem
              hints={puzzle.hints}
              basePoints={100}
              onHintUsed={handleHintUsed}
              onPointsChange={setHintMultiplier}
              disabled={step === 'complete'}
              resetKey={hintResetKey}
            />
          </div>
        </div>

        {/* Flask Comparison - static demo with 0.01 mol HCl added */}
        <div className="mb-4">
          <FlaskComparison
            targetPH={problem.targetPH}
            pKa={problem.pKa}
            addedAcidMoles={0.01}
            addedBaseMoles={0}
            bufferConcentration={problem.totalConcentration}
          />
        </div>

        {/* Step Progress Indicator */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className={`flex-1 text-center ${step === 'direction' ? 'font-bold' : ''}`}>
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 ${
                  directionCorrect
                    ? 'bg-green-500 text-white'
                    : step === 'direction'
                      ? 'bg-orange-500 text-white'
                      : 'bg-warm-200'
                }`}
              >
                {directionCorrect ? '✓' : '1'}
              </div>
              <div className="text-xs text-warm-600">Stefna</div>
            </div>
            <div className="flex-shrink-0 w-12 h-0.5 bg-warm-200" />
            <div className={`flex-1 text-center ${step === 'ratio' ? 'font-bold' : ''}`}>
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 ${
                  ratioCorrect
                    ? 'bg-green-500 text-white'
                    : step === 'ratio'
                      ? 'bg-orange-500 text-white'
                      : 'bg-warm-200'
                }`}
              >
                {ratioCorrect ? '✓' : '2'}
              </div>
              <div className="text-xs text-warm-600">Hlutfall</div>
            </div>
            <div className="flex-shrink-0 w-12 h-0.5 bg-warm-200" />
            <div
              className={`flex-1 text-center ${step === 'mass' || step === 'complete' ? 'font-bold' : ''}`}
            >
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 ${
                  massCorrect
                    ? 'bg-green-500 text-white'
                    : step === 'mass'
                      ? 'bg-orange-500 text-white'
                      : 'bg-warm-200'
                }`}
              >
                {massCorrect ? '✓' : '3'}
              </div>
              <div className="text-xs text-warm-600">Massi</div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Direction */}
            {step === 'direction' && (
              <motion.div
                key="step-direction"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <h3 className="text-lg font-bold text-warm-800 mb-4">
                  Skref 1: Er markmiðs-pH hærra, jafnt eða lægra en pKa?
                </h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Munið:</strong> pH = pKa + log([Basi]/[Sýra]). Ef pH {'>'} pKa, þá er
                    [Basi] {'>'} [Sýra].
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <button
                    onClick={() => setSelectedDirection('higher')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedDirection === 'higher'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-warm-200 hover:border-warm-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">📈</div>
                    <div className="font-semibold">Hærra</div>
                    <div className="text-xs text-warm-500">pH {'>'} pKa</div>
                  </button>
                  <button
                    onClick={() => setSelectedDirection('equal')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedDirection === 'equal'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-warm-200 hover:border-warm-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">⚖️</div>
                    <div className="font-semibold">Jafnt</div>
                    <div className="text-xs text-warm-500">pH = pKa</div>
                  </button>
                  <button
                    onClick={() => setSelectedDirection('lower')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedDirection === 'lower'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-warm-200 hover:border-warm-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">📉</div>
                    <div className="font-semibold">Lægra</div>
                    <div className="text-xs text-warm-500">pH {'<'} pKa</div>
                  </button>
                </div>

                <AnimatePresence>
                  {directionFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className={`p-3 rounded-lg mb-4 ${
                        directionFeedback.includes('Rétt')
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {directionFeedback}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={checkDirection}
                  disabled={!selectedDirection}
                  className={`w-full py-3 text-white font-bold rounded-lg transition-colors disabled:bg-warm-300 disabled:cursor-not-allowed ${selectedDirection ? 'bg-kvenno-orange' : ''}`}
                >
                  Athuga svar
                </button>
              </motion.div>
            )}

            {/* Step 2: Ratio */}
            {step === 'ratio' && (
              <motion.div
                key="step-ratio"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <h3 className="text-lg font-bold text-warm-800 mb-4">
                  Skref 2: Reiknaðu [Basi]/[Sýra] hlutfallið
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Formúla:</strong> pH = pKa + log(hlutfall) → hlutfall = 10^(pH - pKa)
                  </p>
                  <p className="text-sm text-blue-800 mt-1">
                    hlutfall = 10^({problem.targetPH} - {problem.pKa}) = 10^
                    {(problem.targetPH - problem.pKa).toFixed(2)}
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-warm-700 mb-1">
                    Hlutfall [Basi]/[Sýra]:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={ratioInput}
                    onChange={(e) => setRatioInput(e.target.value)}
                    placeholder="t.d. 1.58"
                    className="w-full p-3 border-2 border-warm-300 rounded-lg focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <AnimatePresence>
                  {ratioFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className={`p-3 rounded-lg mb-4 ${
                        ratioFeedback.includes('Rétt')
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {ratioFeedback}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={checkRatio}
                  disabled={!ratioInput}
                  className={`w-full py-3 text-white font-bold rounded-lg transition-colors disabled:bg-warm-300 disabled:cursor-not-allowed ${ratioInput ? 'bg-kvenno-orange' : ''}`}
                >
                  Athuga svar
                </button>
              </motion.div>
            )}

            {/* Step 3: Mass */}
            {step === 'mass' && (
              <motion.div
                key="step-mass"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <h3 className="text-lg font-bold text-warm-800 mb-4">
                  Skref 3: Reiknaðu massa sýru og basa (í grömmum)
                </h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-green-800">
                    <strong>Útreikningur:</strong> Notaðu heildarstyrkinn (
                    {problem.totalConcentration} M) og rúmmálið ({problem.volume} L) til að finna
                    heildar mól. Skiptu síðan á milli sýru og basa samkvæmt hlutfallinu.
                  </p>
                  <p className="text-sm text-green-800 mt-1">massi = mól × mólmassi</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-red-700 mb-1">
                      Sýrumassi (g):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={acidMassInput}
                      onChange={(e) => setAcidMassInput(e.target.value)}
                      placeholder={`${problem.acidName}`}
                      className="w-full p-3 border-2 border-red-300 rounded-lg focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">
                      Basamassi (g):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={baseMassInput}
                      onChange={(e) => setBaseMassInput(e.target.value)}
                      placeholder={`${problem.baseName}`}
                      className="w-full p-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {massFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className={`p-3 rounded-lg mb-4 ${
                        massFeedback.includes('Frábært')
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {massFeedback}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={checkMass}
                  disabled={!acidMassInput || !baseMassInput}
                  className={`w-full py-3 text-white font-bold rounded-lg transition-colors disabled:bg-warm-300 disabled:cursor-not-allowed ${acidMassInput && baseMassInput ? 'bg-kvenno-orange' : ''}`}
                >
                  Athuga svar
                </button>
              </motion.div>
            )}

            {/* Completion & Explanation */}
            {step === 'complete' && showExplanation && (
              <motion.div
                key="step-complete"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4">
                  <h3 className="font-bold text-green-800 mb-2">Rétt svar!</h3>
                  <p className="text-green-700 mb-3">{puzzle.explanationIs}</p>

                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <h4 className="font-semibold text-warm-700 mb-2">Útreikningur:</h4>
                    <ul className="text-sm text-warm-600 space-y-1">
                      <li>
                        • pH - pKa = {problem.targetPH} - {problem.pKa} ={' '}
                        {(problem.targetPH - problem.pKa).toFixed(2)}
                      </li>
                      <li>
                        • Hlutfall = 10^{(problem.targetPH - problem.pKa).toFixed(2)} ={' '}
                        {problem.ratio.toFixed(2)}
                      </li>
                      <li>
                        • Heildar mól = {problem.totalConcentration} M × {problem.volume} L ={' '}
                        {(problem.totalConcentration * problem.volume).toFixed(4)} mol
                      </li>
                      <li>
                        • Sýra: {problem.correctAcidMoles?.toFixed(4)} mol × {problem.acidMolarMass}{' '}
                        g/mol = {problem.correctAcidMass} g
                      </li>
                      <li>
                        • Basi: {problem.correctBaseMoles?.toFixed(4)} mol × {problem.baseMolarMass}{' '}
                        g/mol = {problem.correctBaseMass} g
                      </li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={nextPuzzle}
                  className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors"
                >
                  {currentIndex < LEVEL2_PUZZLES.length - 1 ? 'Næsta verkefni →' : 'Ljúka stigi →'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Formula Reference */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-4">
          <h3 className="font-semibold text-warm-700 mb-2">📐 Henderson-Hasselbalch</h3>
          <div className="bg-warm-50 rounded-lg p-3 text-center">
            <p className="text-lg font-mono">
              pH = pK<sub>a</sub> + log([A⁻]/[HA])
            </p>
            <p className="text-sm text-warm-600 mt-2">
              Þar sem [A⁻] = styrkur basa og [HA] = styrkur sýru
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
