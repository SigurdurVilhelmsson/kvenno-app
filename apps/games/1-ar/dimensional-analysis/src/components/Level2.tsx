import { useState, useEffect, useMemo, useCallback } from 'react';

import { DragDropBuilder, FeedbackPanel } from '@shared/components';
import type {
  DraggableItemData,
  DropZoneData,
  DropResult,
  ZoneState,
  DetailedFeedback,
} from '@shared/components';
import { useEscapeKey } from '@shared/hooks';
import { shuffleArray } from '@shared/utils';

import { UnitBlock, ConversionFactorBlock } from './UnitBlock';
import { UnitCancellationVisualizer } from './UnitCancellationVisualizer';
import { level2Problems } from '../data/problems';

// Misconceptions for common errors
const MISCONCEPTIONS: Record<string, string> = {
  wrong_direction:
    'Stuðullinn er rangur snúinn - einingin sem þú vilt losna við þarf að vera á gagnstæðri hlið (ef þú hefur g, settu g í nefnara).',
  missing_step:
    'Þú gætir þurft fleiri umbreytingarstuðla til að komast frá upphafseiningu til markeiningar.',
  extra_step: 'Þú gætir notað of marga stuðla. Reyndu að finna beina leið.',
};

// Related concepts
const RELATED_CONCEPTS = [
  'Umbreytingarstuðlar',
  'Strikun eininga',
  'Víddargreining',
  'Factor-label aðferð',
];

interface Level2Progress {
  problemsCompleted: number;
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
function generateDistractors(problem: (typeof level2Problems)[0]): string[] {
  const distractors: string[] = [];
  const correctFactors = new Set(problem.correctPath);

  // Common conversion factors to use as distractors
  const commonFactors = [
    '1000 g / 1 kg',
    '1 kg / 1000 g',
    '1000 mL / 1 L',
    '1 L / 1000 mL',
    '100 cm / 1 m',
    '1 m / 100 cm',
    '1000 m / 1 km',
    '1 km / 1000 m',
    '1000 mg / 1 g',
    '1 g / 1000 mg',
    '60 s / 1 mín',
    '1 mín / 60 s',
    '3600 s / 1 klst',
    '1 klst / 3600 s',
    '1000 mm / 1 m',
    '1 m / 1000 mm',
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

export function Level2({
  onComplete,
  onBack,
  initialProgress,
  onCorrectAnswer,
  onIncorrectAnswer,
}: Level2Props) {
  const [showIntro, setShowIntro] = useState(!initialProgress);
  useEscapeKey(onBack, showIntro);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(
    initialProgress?.problemsCompleted || 0
  );
  const [progress, setProgress] = useState<Level2Progress>(
    initialProgress || {
      problemsCompleted: 0,
      finalAnswersCorrect: 0,
      mastered: false,
    }
  );

  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);
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
    const shuffled = shuffleArray([...problem.correctPath, ...distractors]);

    const items: DraggableItemData[] = shuffled.map((factor, idx) => {
      const [numPart, denPart] = factor.split(' / ');
      return {
        id: `factor-${idx}`,
        content: (
          <div className="flex flex-col items-center p-2 min-w-[100px]">
            <div className="font-bold text-blue-600 text-sm">{numPart}</div>
            <div className="w-full h-0.5 bg-warm-800 my-1" />
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: reset memoized items when problem index changes
  }, [currentProblemIndex, problem]);

  useEffect(() => {
    if (problem) {
      setSelectedFactors([]);
      setUserAnswer('');
      setShowFeedback(false);
      setZoneState({});
      setHintUsed(false);
      setShowHint(false);
    }
  }, [currentProblemIndex, problem]);

  const handleFactorSelect = (factor: string) => {
    // Add factor directly — no prediction prompt
    setSelectedFactors((prev) => [...prev, factor]);
  };

  // Handle drag-drop events
  const handleDrop = (result: DropResult) => {
    const { itemId, zoneId, index } = result;

    // Update zone state manually
    setZoneState((prev) => {
      const newState = { ...prev };
      // Remove item from pool/other zones
      for (const key of Object.keys(newState)) {
        newState[key] = newState[key].filter((id) => id !== itemId);
      }
      // Add item to target zone at the specified index
      if (!newState[zoneId]) {
        newState[zoneId] = [];
      }
      newState[zoneId].splice(index, 0, itemId);
      return newState;
    });

    // Get the factor from the dropped item
    const item = draggableItems.find((i) => i.id === itemId);
    const factor = item?.data?.factor;
    if (zoneId === 'conversion-chain' && typeof factor === 'string') {
      setSelectedFactors((prev) => [...prev, factor]);
    }
  };

  // Handle reordering within a zone
  const handleReorder = (zoneId: string, newOrder: string[]) => {
    setZoneState((prev) => ({
      ...prev,
      [zoneId]: newOrder,
    }));
  };

  // Sync selectedFactors with zone state
  useEffect(() => {
    const chainItems = zoneState['conversion-chain'] || [];
    const factors = chainItems
      .map((itemId) => draggableItems.find((i) => i.id === itemId)?.data?.factor)
      .filter((f): f is string => typeof f === 'string');
    setSelectedFactors(factors);
  }, [zoneState, draggableItems]);

  // Trigger cancellation animation when factors change
  const triggerCancellationAnimation = useCallback(() => {
    setAnimationKey((prev) => prev + 1);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-run animation when factor count changes
  }, [selectedFactors.length]);

  // Generate feedback for FeedbackPanel
  const getDetailedFeedback = (): DetailedFeedback => {
    const pathCorrect = problem.correctPath.every((step, idx) => selectedFactors[idx] === step);
    const userNum = parseFloat(userAnswer);
    let expectedAnswer = problem.startValue;
    problem.correctPath.forEach((factor) => {
      const [num, den] = factor.split(' / ');
      const numVal = parseFloat(num.split(' ')[0]);
      const denVal = parseFloat(den.split(' ')[0]);
      expectedAnswer = (expectedAnswer * numVal) / denVal;
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

  const handleSubmit = () => {
    // Check if path matches correct path
    const pathCorrect = problem.correctPath.every((step, idx) => selectedFactors[idx] === step);

    // Check final answer
    const userNum = parseFloat(userAnswer);
    let expectedAnswer = problem.startValue;
    problem.correctPath.forEach((factor) => {
      const [num, den] = factor.split(' / ');
      const numVal = parseFloat(num.split(' ')[0]);
      const denVal = parseFloat(den.split(' ')[0]);
      expectedAnswer = (expectedAnswer * numVal) / denVal;
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
      finalAnswersCorrect: progress.finalAnswersCorrect + (finalCorrect ? 1 : 0),
    };
    setProgress(newProgress);
  };

  const handleContinue = () => {
    const newProgress = {
      ...progress,
      problemsCompleted: progress.problemsCompleted + 1,
    };

    // Check mastery after 15 problems
    if (newProgress.problemsCompleted >= 15) {
      const answerAccuracy =
        newProgress.problemsCompleted > 0
          ? newProgress.finalAnswersCorrect / newProgress.problemsCompleted
          : 0;
      newProgress.mastered = answerAccuracy >= 0.8;
    }

    setProgress(newProgress);

    if (currentProblemIndex < level2Problems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
    } else {
      // Max score is 100 per problem x 15 problems = 1500
      onComplete(newProgress, 1500, totalHintsUsed);
    }
  };

  if (!problem && !showIntro) return null;

  // Calculate current units for visualization
  const numeratorUnits = [
    ...(problem ? [problem.startUnit] : []),
    ...selectedFactors.map((f) => f.split(' / ')[0].split(' ')[1]),
  ];
  const denominatorUnits = selectedFactors.map((f) => f.split(' / ')[1].split(' ')[1]);

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4">
            <button
              onClick={onBack}
              className="text-warm-600 hover:text-warm-800 flex items-center gap-2 text-lg"
            >
              ← Til baka
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <h2 className="text-2xl font-bold text-warm-800 text-center">
              Af hverju virkar einingagreining?
            </h2>

            {/* Core principle: WHY */}
            <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
              <h3 className="font-bold text-blue-800 mb-3">Lykilhugmyndin</h3>
              <p className="text-warm-700 mb-3">
                Umbreytingarstuðull er <strong>brot sem jafngildir 1</strong>. Til dæmis:
              </p>
              <div className="flex justify-center my-4">
                <div className="inline-flex flex-col items-center bg-white px-6 py-3 rounded-lg shadow-sm border">
                  <span className="font-bold text-blue-600 text-lg">1000 mL</span>
                  <div className="w-full h-0.5 bg-warm-800 my-1" />
                  <span className="font-bold text-green-600 text-lg">1 L</span>
                </div>
                <span className="self-center mx-4 text-xl text-warm-600">= 1</span>
              </div>
              <p className="text-warm-700">
                Þetta er eins og 1 vegna þess að 1000 mL og 1 L er{' '}
                <strong>nákvæmlega sama magnið</strong>. Þegar þú margfaldar með 1 breytist gildið
                ekki — aðeins einingarnar.
              </p>
            </div>

            {/* HOW: Unit cancellation */}
            <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-500">
              <h3 className="font-bold text-green-800 mb-3">Hvernig einingar styttast út</h3>
              <p className="text-warm-700 mb-3">
                Einingar hegða sér eins og breytur í stærðfræði. Sama einingin í teljara og nefnara
                styttist út:
              </p>
              <div className="bg-white p-4 rounded-lg text-center font-mono text-lg">
                <span>500 </span>
                <span className="line-through text-red-500 decoration-2">mg</span>
                <span> × </span>
                <span className="inline-flex flex-col items-center mx-2">
                  <span>1 g</span>
                  <span className="w-full h-0.5 bg-warm-800" />
                  <span>
                    1000 <span className="line-through text-red-500 decoration-2">mg</span>
                  </span>
                </span>
                <span> = </span>
                <span className="font-bold text-green-700">0,5 g</span>
              </div>
              <p className="text-warm-700 mt-3 text-sm">
                mg kemur fyrir í teljara (frá byrjunargildinu) og í nefnara stuðulsins — þær
                styttast út og g verður eftir.
              </p>
            </div>

            {/* Connection to other subjects */}
            <div className="bg-amber-50 rounded-xl p-6 border-l-4 border-amber-500">
              <h3 className="font-bold text-amber-800 mb-3">Stærðfræði og eðlisfræði</h3>
              <p className="text-warm-700">
                Þetta er nákvæmlega sama regla og þegar þú styttir brot í stærðfræði. Í eðlisfræði
                notar þú sömu aðferð til að breyta t.d. km/klst í m/s. Í efnafræði umbreytir þú
                millilítrum í lítra, grömm í kílógrömm, o.s.frv.
              </p>
            </div>

            {/* What they'll practice */}
            <div className="bg-warm-50 rounded-xl p-6">
              <h3 className="font-bold text-warm-800 mb-2">Hvað gerist á þessu stigi?</h3>
              <p className="text-warm-700">
                Þú velur umbreytingarstuðla og byggir keðjur til að breyta einingum. Byrjað er á
                einföldum (eitt skref) og síðan flóknari (tvö skref).
              </p>
            </div>

            <button
              onClick={() => setShowIntro(false)}
              className="w-full py-4 rounded-xl font-bold text-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Byrja æfingar →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
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
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
              Stig 2: Beiting
            </span>
            <span>Verkefni {progress.problemsCompleted + 1} / 15</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-warm-200 rounded-full h-2 mb-6">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(progress.problemsCompleted / 15) * 100}%` }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-warm-600 mb-1">Samhengi:</p>
            <p className="font-semibold">{problem.context}</p>
          </div>

          {showHint && (
            <div className="mb-4 bg-yellow-50 border-2 border-yellow-300 p-4 rounded-xl">
              <h4 className="font-semibold text-yellow-800 mb-1">💡 Vísbending:</h4>
              <p className="text-yellow-900">{problem.hint}</p>
            </div>
          )}

          <div className="mb-6 p-6 bg-gradient-to-b from-warm-50 to-warm-100 rounded-xl text-center">
            <p className="text-sm text-warm-600 mb-3">Byrja með:</p>
            <div className="flex justify-center mb-4">
              <UnitBlock
                value={problem.startValue}
                unit={problem.startUnit}
                color="orange"
                size="large"
              />
            </div>
            <div className="flex items-center justify-center gap-2 text-warm-600">
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
            <div className="mb-6 p-4 bg-warm-50 rounded-xl">
              <p className="text-sm font-semibold mb-3 text-warm-700">Stuðlar notaðir:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {selectedFactors.map((factor, idx) => {
                  const [numPart, denPart] = factor.split(' / ');
                  const numValue = parseFloat(numPart.split(' ')[0]);
                  const numUnit = numPart.split(' ').slice(1).join(' ');
                  const denValue = parseFloat(denPart.split(' ')[0]);
                  const denUnit = denPart.split(' ').slice(1).join(' ');

                  return (
                    <div key={idx} className="flex items-center gap-2">
                      {idx > 0 && <span className="text-xl text-warm-400">×</span>}
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
              {/* Hint button */}
              {!hintUsed && !showFeedback && (
                <div className="mb-4 flex justify-start">
                  <button
                    onClick={() => {
                      setShowHint(true);
                      setHintUsed(true);
                      setTotalHintsUsed((prev) => prev + 1);
                    }}
                    className="text-sm px-4 py-2 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-medium transition-colors"
                  >
                    💡 Vísbending
                  </button>
                </div>
              )}

              {/* Mode toggle */}
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => setUseDragDrop(!useDragDrop)}
                  className="text-xs px-3 py-1 rounded-full bg-warm-100 hover:bg-warm-200 text-warm-600"
                >
                  {useDragDrop ? '🖱️ Skipta í smella-ham' : '✋ Skipta í draga-ham'}
                </button>
              </div>

              {/* Drag-and-drop factor selection */}
              {useDragDrop ? (
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-3">
                    Dragðu umbreytingarstuðla til að byggja keðju:
                  </p>
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
                    {availableFactors
                      .slice(0, Math.min(6, problem.correctPath.length + 3))
                      .map((factor, idx) => {
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
                <label className="block font-semibold mb-3 text-warm-800">
                  Hvað er lokagildið?
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Sláðu inn svar"
                    className="flex-1 p-4 border-2 border-warm-300 rounded-xl font-mono text-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-hidden transition-all"
                  />
                  <div className="px-4 py-3 bg-green-100 text-green-800 rounded-xl font-bold text-lg">
                    {problem.targetUnit}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={selectedFactors.length === 0 || !userAnswer.trim()}
                className="w-full py-4 rounded-xl font-bold text-lg transition-all disabled:bg-warm-300 disabled:cursor-not-allowed disabled:text-warm-500 bg-blue-600 hover:bg-blue-700 text-white"
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

              <div className="p-4 bg-white rounded-lg border border-warm-200">
                <p className="text-sm text-warm-600 mb-2">Rétt umbreytingarleið:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {problem.correctPath.map((factor, idx) => {
                    const [numPart, denPart] = factor.split(' / ');
                    const numValue = parseFloat(numPart.split(' ')[0]);
                    const numUnit = numPart.split(' ').slice(1).join(' ');
                    const denValue = parseFloat(denPart.split(' ')[0]);
                    const denUnit = denPart.split(' ').slice(1).join(' ');

                    return (
                      <div key={idx} className="flex items-center gap-1">
                        {idx > 0 && <span className="text-warm-400 mx-1">×</span>}
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

              <button
                onClick={handleContinue}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
                  isCorrect
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {currentProblemIndex < level2Problems.length - 1
                  ? 'Næsta verkefni →'
                  : 'Ljúka stigi'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
