import { useState, useEffect, useMemo, useCallback } from 'react';
import { level2Problems } from '../data/problems';
import { UnitCancellationVisualizer } from './UnitCancellationVisualizer';
import { UnitBlock, ConversionFactorBlock } from './UnitBlock';
import { DragDropBuilder, FeedbackPanel } from '@shared/components';
import type { DraggableItemData, DropZoneData, DropResult, ZoneState, DetailedFeedback } from '@shared/components';

// Misconceptions for common errors
const MISCONCEPTIONS: Record<string, string> = {
  wrong_direction: 'Stuðullinn er rangur snúinn - einingin sem þú vilt losna við þarf að vera á gagnstæðri hlið (ef þú hefur g, settu g í nefnara).',
  missing_step: 'Þú gætir þurft fleiri umbreytingarstuðla til að komast frá upphafseiningu til markeiningar.',
  extra_step: 'Þú gætir notað of marga stuðla. Reyndu að finna beina leið.',
};

// Related concepts
const RELATED_CONCEPTS = ['Umbreytingarstuðlar', 'Strikun eininga', 'Víddargreining', 'Factor-label aðferð'];

interface Level2Progress {
  problemsCompleted: number;
  predictionsMade: number;
  predictionsCorrect: number;
  finalAnswersCorrect: number;
  mastered: boolean;
}

interface Level2Props {
  onComplete: (progress: Level2Progress, maxScore?: number, hintsUsed?: number) => void;
  onBack: () => void;
  initialProgress?: Level2Progress;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

// Generate distractor factors for a problem
function generateDistractors(problem: typeof level2Problems[0]): string[] {
  const distractors: string[] = [];
  const correctFactors = new Set(problem.correctPath);

  // Common conversion factors to use as distractors
  const commonFactors = [
    '1000 g / 1 kg', '1 kg / 1000 g',
    '1000 mL / 1 L', '1 L / 1000 mL',
    '100 cm / 1 m', '1 m / 100 cm',
    '1000 m / 1 km', '1 km / 1000 m',
    '1000 mg / 1 g', '1 g / 1000 mg',
    '60 s / 1 mín', '1 mín / 60 s',
    '3600 s / 1 klst', '1 klst / 3600 s',
    '1000 mm / 1 m', '1 m / 1000 mm',
  ];

  // Add inverted versions of correct factors as distractors
  for (const factor of problem.correctPath) {
    const [num, den] = factor.split(' / ');
    const inverted = `${den} / ${num}`;
    if (!correctFactors.has(inverted)) {
      distractors.push(inverted);
    }
  }

  // Add some common factors that aren't correct
  for (const factor of commonFactors) {
    if (!correctFactors.has(factor) && !distractors.includes(factor)) {
      distractors.push(factor);
      if (distractors.length >= 3) break;
    }
  }

  return distractors.slice(0, 3);
}

export function Level2({ onComplete, onBack, initialProgress, onCorrectAnswer, onIncorrectAnswer }: Level2Props) {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(
    initialProgress?.problemsCompleted || 0
  );
  const [progress, setProgress] = useState<Level2Progress>(
    initialProgress || {
      problemsCompleted: 0,
      predictionsMade: 0,
      predictionsCorrect: 0,
      finalAnswersCorrect: 0,
      mastered: false
    }
  );

  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [predictedUnit, setPredictedUnit] = useState('');
  const [showPredictionPrompt, setShowPredictionPrompt] = useState(false);
  const [predictionPhase, setPredictionPhase] = useState<'unit' | 'rationale'>('unit');
  const [selectedRationale, setSelectedRationale] = useState<string | null>(null);
  const [pendingFactor, setPendingFactor] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [totalHintsUsed] = useState(0); // Level 2 doesn't have hints, but we track for consistency
  const [, setRationaleCorrectCount] = useState(0);
  const [zoneState, setZoneState] = useState<ZoneState>({});
  const [useDragDrop, setUseDragDrop] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);
  const [showCancellationAnimation, setShowCancellationAnimation] = useState(false);

  const problem = level2Problems[currentProblemIndex];

  // Generate draggable items for DragDropBuilder
  const { draggableItems, dropZones, availableFactors } = useMemo(() => {
    if (!problem) return { draggableItems: [], dropZones: [], availableFactors: [] };

    // Combine correct path with distractors and shuffle
    const distractors = generateDistractors(problem);
    const allFactors = [...problem.correctPath, ...distractors];
    const shuffled = allFactors.sort(() => Math.random() - 0.5);

    const items: DraggableItemData[] = shuffled.map((factor, idx) => {
      const [numPart, denPart] = factor.split(' / ');
      return {
        id: `factor-${idx}`,
        content: (
          <div className="flex flex-col items-center p-2 min-w-[100px]">
            <div className="font-bold text-blue-600 text-sm">{numPart}</div>
            <div className="w-full h-0.5 bg-gray-800 my-1" />
            <div className="font-bold text-green-600 text-sm">{denPart}</div>
          </div>
        ),
        data: { factor, numPart, denPart },
      };
    });

    const zones: DropZoneData[] = [
      {
        id: 'conversion-chain',
        label: 'Dragðu stuðla hingað til að byggja umbreytingakeðju',
        maxItems: 5,
        placeholder: '← Dragðu umbreytingarstuðla hingað',
      },
    ];

    return { draggableItems: items, dropZones: zones, availableFactors: shuffled };
  }, [currentProblemIndex, problem]);

  useEffect(() => {
    if (problem) {
      setSelectedFactors([]);
      setUserAnswer('');
      setPredictedUnit('');
      setShowFeedback(false);
      setZoneState({});
    }
  }, [currentProblemIndex, problem]);

  const handleFactorSelect = (factor: string) => {
    setPendingFactor(factor);
    setPredictionPhase('unit');
    setSelectedRationale(null);
    setShowPredictionPrompt(true);
  };

  // Handle drag-drop events
  const handleDrop = (result: DropResult) => {
    const { itemId, zoneId, index } = result;

    // Update zone state manually
    setZoneState(prev => {
      const newState = { ...prev };
      // Remove item from pool/other zones
      for (const key of Object.keys(newState)) {
        newState[key] = newState[key].filter(id => id !== itemId);
      }
      // Add item to target zone at the specified index
      if (!newState[zoneId]) {
        newState[zoneId] = [];
      }
      newState[zoneId].splice(index, 0, itemId);
      return newState;
    });

    // Get the factor from the dropped item
    const item = draggableItems.find(i => i.id === itemId);
    if (item && zoneId === 'conversion-chain' && item.data?.factor) {
      // Trigger prediction prompt for the dropped factor
      setPendingFactor(item.data.factor as string);
      setPredictionPhase('unit');
      setSelectedRationale(null);
      setShowPredictionPrompt(true);
    }
  };

  // Handle reordering within a zone
  const handleReorder = (zoneId: string, newOrder: string[]) => {
    setZoneState(prev => ({
      ...prev,
      [zoneId]: newOrder,
    }));
  };

  // Sync selectedFactors with zone state
  useEffect(() => {
    const chainItems = zoneState['conversion-chain'] || [];
    const factors = chainItems.map(itemId => {
      const item = draggableItems.find(i => i.id === itemId);
      return item?.data?.factor as string;
    }).filter(Boolean);
    setSelectedFactors(factors);
  }, [zoneState, draggableItems]);

  // Trigger cancellation animation when factors change
  const triggerCancellationAnimation = useCallback(() => {
    setAnimationKey(prev => prev + 1);
    setShowCancellationAnimation(true);
    // Reset animation flag after animation completes
    const timer = setTimeout(() => {
      setShowCancellationAnimation(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-trigger animation when a new factor is added
  useEffect(() => {
    if (selectedFactors.length > 0) {
      triggerCancellationAnimation();
    }
  }, [selectedFactors.length]);

  // Generate feedback for FeedbackPanel
  const getDetailedFeedback = (): DetailedFeedback => {
    const pathCorrect = problem.correctPath.every((step, idx) => selectedFactors[idx] === step);
    const userNum = parseFloat(userAnswer);
    let expectedAnswer = problem.startValue;
    problem.correctPath.forEach(factor => {
      const [num, den] = factor.split(' / ');
      const numVal = parseFloat(num.split(' ')[0]);
      const denVal = parseFloat(den.split(' ')[0]);
      expectedAnswer = expectedAnswer * numVal / denVal;
    });
    const answerCorrect = Math.abs(userNum - expectedAnswer) < 0.01;

    if (pathCorrect && answerCorrect) {
      return {
        isCorrect: true,
        explanation: `Rétt! ${problem.startValue} ${problem.startUnit} = ${expectedAnswer} ${problem.targetUnit}`,
        relatedConcepts: RELATED_CONCEPTS,
        nextSteps: 'Þú getur nú prófað flóknari umbreytingar með fleiri skrefum.',
      };
    }

    let misconception = MISCONCEPTIONS.wrong_direction;
    if (selectedFactors.length < problem.correctPath.length) {
      misconception = MISCONCEPTIONS.missing_step;
    } else if (selectedFactors.length > problem.correctPath.length) {
      misconception = MISCONCEPTIONS.extra_step;
    }

    return {
      isCorrect: false,
      explanation: `Rétta leiðin er: ${problem.correctPath.join(' × ')}`,
      misconception,
      relatedConcepts: RELATED_CONCEPTS,
      nextSteps: 'Athugaðu hvort einingarnar strikist rétt út í hverju skrefi.',
    };
  };

  // Generate rationale options based on the pending factor
  const getRationaleOptions = () => {
    if (!pendingFactor) return [];

    const [numPart, denPart] = pendingFactor.split(' / ');
    const numUnit = numPart.split(' ').slice(1).join(' ');
    const denUnit = denPart.split(' ').slice(1).join(' ');

    // Current unit before applying this factor (used for context)
    const _currentUnit = selectedFactors.length > 0
      ? selectedFactors[selectedFactors.length - 1].split(' / ')[0].split(' ').slice(1).join(' ')
      : problem.startUnit;
    void _currentUnit; // Mark as intentionally unused for now

    // Correct answer: the denominator unit cancels with current unit
    const correctRationale = `${denUnit} styttist út og ${numUnit} verður eftir`;

    // Distractor options
    const distractors = [
      `${numUnit} styttist út og ${denUnit} verður eftir`,
      `Báðar einingar styttast út`,
      `Engar einingar styttast út`
    ];

    // Shuffle correct answer with distractors
    const options = [correctRationale, ...distractors.slice(0, 2)];
    return options.sort(() => Math.random() - 0.5).map(text => ({
      text,
      isCorrect: text === correctRationale
    }));
  };

  const handleUnitPredictionSubmit = () => {
    // Move to rationale phase after unit prediction
    setPredictionPhase('rationale');
  };

  const handleRationaleSubmit = () => {
    // Track prediction
    const numeratorUnits = [problem.startUnit, ...selectedFactors.map(f => f.split(' / ')[0].split(' ')[1])];
    const denominatorUnits = selectedFactors.map(f => f.split(' / ')[1].split(' ')[1]);

    // Simple unit tracking - check if prediction makes sense
    const newNumeratorUnits = [...numeratorUnits, pendingFactor.split(' / ')[0].split(' ')[1]];
    const newDenominatorUnits = [...denominatorUnits, pendingFactor.split(' / ')[1].split(' ')[1]];

    // Remove cancelled units
    const cancelledUnits = newNumeratorUnits.filter(u => newDenominatorUnits.includes(u));
    const finalNumerator = newNumeratorUnits.filter(u => !cancelledUnits.includes(u) || newNumeratorUnits.filter(x => x === u).length > newDenominatorUnits.filter(x => x === u).length);
    const finalDenominator = newDenominatorUnits.filter(u => !cancelledUnits.includes(u) || newDenominatorUnits.filter(x => x === u).length > newNumeratorUnits.filter(x => x === u).length);

    const actualUnit = finalDenominator.length > 0
      ? `${finalNumerator[finalNumerator.length - 1]}/${finalDenominator[finalDenominator.length - 1]}`
      : finalNumerator[finalNumerator.length - 1];

    const predictionCorrect = predictedUnit.trim() === actualUnit;

    // Check if rationale is correct
    const rationaleOptions = getRationaleOptions();
    const selectedOption = rationaleOptions.find(opt => opt.text === selectedRationale);
    const rationaleCorrect = selectedOption?.isCorrect || false;

    if (rationaleCorrect) {
      setRationaleCorrectCount(prev => prev + 1);
    }

    const newProgress = {
      ...progress,
      predictionsMade: progress.predictionsMade + 1,
      predictionsCorrect: progress.predictionsCorrect + (predictionCorrect ? 1 : 0)
    };
    setProgress(newProgress);

    // Apply the factor
    setSelectedFactors([...selectedFactors, pendingFactor]);
    setShowPredictionPrompt(false);
    setPredictedUnit('');
    setSelectedRationale(null);
    setPredictionPhase('unit');
  };

  const handleSubmit = () => {
    // Check if path matches correct path
    const pathCorrect = problem.correctPath.every((step, idx) => selectedFactors[idx] === step);

    // Check final answer
    const userNum = parseFloat(userAnswer);
    let expectedAnswer = problem.startValue;
    problem.correctPath.forEach(factor => {
      const [num, den] = factor.split(' / ');
      const numVal = parseFloat(num.split(' ')[0]);
      const denVal = parseFloat(den.split(' ')[0]);
      expectedAnswer = expectedAnswer * numVal / denVal;
    });

    const answerCorrect = Math.abs(userNum - expectedAnswer) < 0.01;
    const finalCorrect = pathCorrect && answerCorrect;

    setIsCorrect(finalCorrect);
    setShowFeedback(true);

    // Track achievements
    if (finalCorrect) {
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
    }

    const newProgress = {
      ...progress,
      finalAnswersCorrect: progress.finalAnswersCorrect + (finalCorrect ? 1 : 0)
    };
    setProgress(newProgress);
  };

  const handleContinue = () => {
    const newProgress = {
      ...progress,
      problemsCompleted: progress.problemsCompleted + 1
    };

    // Check mastery after 15 problems
    if (newProgress.problemsCompleted >= 15) {
      const predictionAccuracy = newProgress.predictionsMade > 0 ? newProgress.predictionsCorrect / newProgress.predictionsMade : 0;
      const answerAccuracy = newProgress.problemsCompleted > 0 ? newProgress.finalAnswersCorrect / newProgress.problemsCompleted : 0;
      newProgress.mastered = predictionAccuracy >= 0.7 && answerAccuracy >= 0.8;
    }

    setProgress(newProgress);

    if (currentProblemIndex < level2Problems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
    } else {
      // Max score is 100 per problem x 15 problems = 1500
      onComplete(newProgress, 1500, totalHintsUsed);
    }
  };

  if (!problem) return null;

  const predictionAccuracy = progress.predictionsMade > 0
    ? Math.round((progress.predictionsCorrect / progress.predictionsMade) * 100)
    : 0;

  // Calculate current units for visualization
  const numeratorUnits = [problem.startUnit, ...selectedFactors.map(f => f.split(' / ')[0].split(' ')[1])];
  const denominatorUnits = selectedFactors.map(f => f.split(' / ')[1].split(' ')[1]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2 text-lg"
          >
            ← Til baka
          </button>
          <div className="text-sm text-gray-600 flex items-center gap-2 sm:gap-4 flex-wrap">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
              Stig 2: Beiting
            </span>
            <span>Verkefni {progress.problemsCompleted + 1} / 15</span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
              Spánákvæmni: {predictionAccuracy}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((progress.problemsCompleted) / 15) * 100}%` }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Samhengi:</p>
            <p className="font-semibold">{problem.context}</p>
          </div>

          <div className="mb-6 p-6 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl text-center">
            <p className="text-sm text-gray-600 mb-3">Byrja með:</p>
            <div className="flex justify-center mb-4">
              <UnitBlock
                value={problem.startValue}
                unit={problem.startUnit}
                color="orange"
                size="large"
              />
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <span className="text-2xl">→</span>
              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-bold">
                {problem.targetUnit}
              </span>
            </div>
          </div>

          {/* Unit visualization with animated cancellation */}
          <div className="mb-6">
            <UnitCancellationVisualizer
              key={animationKey}
              numeratorUnits={numeratorUnits}
              denominatorUnits={denominatorUnits}
              showCancelButton={showCancellationAnimation}
              enhancedAnimation={true}
              autoAnimate={showCancellationAnimation}
            />
          </div>

          {selectedFactors.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm font-semibold mb-3 text-gray-700">Stuðlar notaðir:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {selectedFactors.map((factor, idx) => {
                  const [numPart, denPart] = factor.split(' / ');
                  const numValue = parseFloat(numPart.split(' ')[0]);
                  const numUnit = numPart.split(' ').slice(1).join(' ');
                  const denValue = parseFloat(denPart.split(' ')[0]);
                  const denUnit = denPart.split(' ').slice(1).join(' ');

                  return (
                    <div key={idx} className="flex items-center gap-2">
                      {idx > 0 && <span className="text-xl text-gray-400">×</span>}
                      <ConversionFactorBlock
                        numeratorValue={numValue}
                        numeratorUnit={numUnit}
                        denominatorValue={denValue}
                        denominatorUnit={denUnit}
                        isCorrect={true}
                        size="small"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!showFeedback && (
            <>
              {/* Mode toggle */}
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => setUseDragDrop(!useDragDrop)}
                  className="text-xs px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                >
                  {useDragDrop ? '🖱️ Skipta í smella-ham' : '✋ Skipta í draga-ham'}
                </button>
              </div>

              {/* Drag-and-drop factor selection */}
              {useDragDrop ? (
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-3">Dragðu umbreytingarstuðla til að byggja keðju:</p>
                  <DragDropBuilder
                    items={draggableItems}
                    zones={dropZones}
                    initialState={zoneState}
                    onDrop={handleDrop}
                    onReorder={handleReorder}
                    orientation="horizontal"
                  />
                </div>
              ) : (
                /* Classic button-based factor selection */
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-3">Veldu umbreytingarstuðul:</p>
                  <div className="flex flex-wrap justify-center gap-4">
                    {availableFactors.slice(0, Math.min(6, problem.correctPath.length + 3)).map((factor, idx) => {
                      // Parse factor string like "1 L / 1000 mL"
                      const [numPart, denPart] = factor.split(' / ');
                      const numValue = parseFloat(numPart.split(' ')[0]);
                      const numUnit = numPart.split(' ').slice(1).join(' ');
                      const denValue = parseFloat(denPart.split(' ')[0]);
                      const denUnit = denPart.split(' ').slice(1).join(' ');
                      const isUsed = selectedFactors.includes(factor);

                      return (
                        <ConversionFactorBlock
                          key={idx}
                          numeratorValue={numValue}
                          numeratorUnit={numUnit}
                          denominatorValue={denValue}
                          denominatorUnit={denUnit}
                          onClick={isUsed ? undefined : () => handleFactorSelect(factor)}
                          size="medium"
                          isSelected={isUsed}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Answer input */}
              <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200">
                <label className="block font-semibold mb-3 text-gray-800">Hvað er lokagildið?</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Sláðu inn svar"
                    className="flex-1 p-4 border-2 border-gray-300 rounded-xl font-mono text-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  />
                  <div className="px-4 py-3 bg-green-100 text-green-800 rounded-xl font-bold text-lg">
                    {problem.targetUnit}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={selectedFactors.length === 0 || !userAnswer.trim()}
                className="w-full py-4 rounded-xl font-bold text-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Athuga svar →
              </button>
            </>
          )}

          {showFeedback && (
            <div className="space-y-4">
              <FeedbackPanel
                feedback={getDetailedFeedback()}
                config={{
                  showExplanation: true,
                  showMisconceptions: !isCorrect,
                  showRelatedConcepts: true,
                  showNextSteps: true,
                }}
              />

              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Rétt umbreytingarleið:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {problem.correctPath.map((factor, idx) => {
                    const [numPart, denPart] = factor.split(' / ');
                    const numValue = parseFloat(numPart.split(' ')[0]);
                    const numUnit = numPart.split(' ').slice(1).join(' ');
                    const denValue = parseFloat(denPart.split(' ')[0]);
                    const denUnit = denPart.split(' ').slice(1).join(' ');

                    return (
                      <div key={idx} className="flex items-center gap-1">
                        {idx > 0 && <span className="text-gray-400 mx-1">×</span>}
                        <ConversionFactorBlock
                          numeratorValue={numValue}
                          numeratorUnit={numUnit}
                          denominatorValue={denValue}
                          denominatorUnit={denUnit}
                          isCorrect={true}
                          size="small"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-600">Spánákvæmni</p>
                  <p className={`text-2xl font-bold ${predictionAccuracy >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {predictionAccuracy}%
                  </p>
                </div>
              </div>

              <button
                onClick={handleContinue}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
                  isCorrect
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {currentProblemIndex < level2Problems.length - 1 ? 'Næsta verkefni →' : 'Ljúka stigi'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Prediction modal */}
      {showPredictionPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-slide-up">
            {/* Phase indicator */}
            <div className="flex justify-center gap-2 mb-4">
              <div className={`w-3 h-3 rounded-full ${predictionPhase === 'unit' ? 'bg-blue-500' : 'bg-green-500'}`} />
              <div className={`w-3 h-3 rounded-full ${predictionPhase === 'rationale' ? 'bg-blue-500' : 'bg-gray-300'}`} />
            </div>

            <div className="text-center mb-6">
              <div className="text-4xl mb-2">{predictionPhase === 'unit' ? '🔮' : '🧠'}</div>
              <h3 className="text-2xl font-bold text-gray-800">
                {predictionPhase === 'unit' ? 'Spáðu fyrir um útkomunna!' : 'Af hverju?'}
              </h3>
            </div>

            <div className="mb-6 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-3">Þú ætlar að nota þennan stuðul:</p>
              <div className="flex justify-center">
                {(() => {
                  const [numPart, denPart] = pendingFactor.split(' / ');
                  const numValue = parseFloat(numPart.split(' ')[0]);
                  const numUnit = numPart.split(' ').slice(1).join(' ');
                  const denValue = parseFloat(denPart.split(' ')[0]);
                  const denUnit = denPart.split(' ').slice(1).join(' ');
                  return (
                    <ConversionFactorBlock
                      numeratorValue={numValue}
                      numeratorUnit={numUnit}
                      denominatorValue={denValue}
                      denominatorUnit={denUnit}
                      size="medium"
                    />
                  );
                })()}
              </div>
            </div>

            {/* Phase 1: Unit prediction */}
            {predictionPhase === 'unit' && (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hvaða eining verður útkoman?
                  </label>
                  <input
                    type="text"
                    value={predictedUnit}
                    onChange={(e) => setPredictedUnit(e.target.value)}
                    placeholder="t.d. kg, m/s, osfrv."
                    className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowPredictionPrompt(false);
                      setPredictedUnit('');
                      setPredictionPhase('unit');
                    }}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Hætta við
                  </button>
                  <button
                    onClick={handleUnitPredictionSubmit}
                    disabled={!predictedUnit.trim()}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Áfram →
                  </button>
                </div>
              </>
            )}

            {/* Phase 2: Rationale selection */}
            {predictionPhase === 'rationale' && (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Þú spáðir:</p>
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold text-center">
                    {predictedUnit}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Hvaða einingar styttast út?
                  </label>
                  <div className="space-y-2">
                    {getRationaleOptions().map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedRationale(option.text)}
                        className={`w-full p-3 rounded-xl text-left transition-all border-2 ${
                          selectedRationale === option.text
                            ? 'border-blue-500 bg-blue-50 text-blue-800'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {option.text}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setPredictionPhase('unit')}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    ← Til baka
                  </button>
                  <button
                    onClick={handleRationaleSubmit}
                    disabled={!selectedRationale}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Staðfesta →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
