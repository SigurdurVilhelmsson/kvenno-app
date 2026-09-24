import { useState, useCallback, useMemo, useRef } from 'react';

import { PinnedActions, TaskStrip } from '@shared/components';
import { formatDecimal, useArmedAfter, useItemTop, useRevealAfterCommit } from '@shared/utils';

import { EnergyPathwayDiagram } from './EnergyPathwayDiagram';
import type { Equation } from '../data/challenges';
import { PUZZLES } from '../data/puzzles';
import { reachesTarget } from '../utils/equation-math';
import { calculateSum } from '../utils/hess-calculations';

// Equation block component
function EquationBlock({
  equation,
  onReverse,
  onMultiply,
  isSelected,
  onSelect,
}: {
  equation: Equation;
  onReverse: () => void;
  onMultiply: (n: number) => void;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const effectiveDeltaH = equation.deltaH * equation.multiplier * (equation.isReversed ? -1 : 1);
  const displayMultiplier = equation.multiplier !== 1 ? `${equation.multiplier} × ` : '';

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${equation.isReversed ? equation.products : equation.reactants} → ${equation.isReversed ? equation.reactants : equation.products}, ΔH = ${formatDecimal(effectiveDeltaH, 1)} kJ`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
        if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          onReverse();
        }
      }}
      className={`p-4 phone:p-3 rounded-xl border-3 cursor-pointer transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-400/50 ${
        isSelected ? 'ring-4 ring-orange-400/50' : ''
      } ${
        equation.isReversed
          ? 'bg-red-50 border-red-300'
          : equation.multiplier !== 1
            ? 'bg-blue-50 border-blue-300'
            : 'bg-white border-warm-300 hover:border-orange-300'
      }`}
    >
      {/* Equation display */}
      <div className="text-center mb-3 phone:mb-1 font-mono">
        {displayMultiplier && (
          <span className="text-orange-600 font-bold">{displayMultiplier}</span>
        )}
        (
        <span className="text-blue-700">
          {equation.isReversed ? equation.products : equation.reactants}
        </span>
        <span className="mx-2">→</span>
        <span className="text-green-700">
          {equation.isReversed ? equation.reactants : equation.products}
        </span>
        )
      </div>

      {/* ΔH */}
      <div className="text-center mb-3 phone:mb-2">
        <span className={`font-bold ${effectiveDeltaH < 0 ? 'text-red-600' : 'text-blue-600'}`}>
          ΔH = {effectiveDeltaH > 0 ? '+' : ''}
          {formatDecimal(effectiveDeltaH, 1)} kJ
        </span>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReverse();
          }}
          aria-label="Snúa við jöfnu"
          aria-pressed={equation.isReversed}
          className={`px-3 py-1 pointer-coarse:min-h-11 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors ${
            equation.isReversed ? 'bg-red-500 text-white' : 'bg-warm-200 hover:bg-red-100'
          }`}
        >
          🔄 Snúa
        </button>

        <div className="flex gap-1" role="group" aria-label="Margfaldari">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={(e) => {
                e.stopPropagation();
                onMultiply(n);
              }}
              aria-label={`Margfalda með ${n}`}
              aria-pressed={equation.multiplier === n}
              className={`w-8 h-8 pointer-coarse:w-11 pointer-coarse:h-11 rounded-lg text-sm font-bold transition-colors ${
                equation.multiplier === n
                  ? 'bg-blue-500 text-white'
                  : 'bg-warm-200 hover:bg-blue-100'
              }`}
            >
              ×{n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface Level2Props {
  onComplete: (score: number) => void;
  onBack: () => void;
}

export function Level2({ onComplete, onBack }: Level2Props) {
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [equations, setEquations] = useState<Equation[]>(
    PUZZLES[0].availableEquations.map((eq) => ({ ...eq }))
  );
  const [selectedEquations, setSelectedEquations] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [explanation, setExplanation] = useState('');
  const [, setTotalHintsUsed] = useState(0);

  const puzzle = PUZZLES[currentPuzzle];

  // Each new puzzle brings the card's top back and focuses the puzzle pill.
  const cardRef = useItemTop<HTMLDivElement>(currentPuzzle);
  const resultRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // Calculate current sum of selected equations
  const calculateSelectedSum = useCallback(() => {
    return calculateSum(equations.filter((eq) => selectedEquations.includes(eq.id)));
  }, [equations, selectedEquations]);

  // Reset puzzle
  const resetPuzzle = useCallback((puzzleIndex: number) => {
    setEquations(PUZZLES[puzzleIndex].availableEquations.map((eq) => ({ ...eq })));
    setSelectedEquations([]);
    setShowResult(false);
    setShowHint(false);
    setExplanation('');
  }, []);

  // A checked verdict belongs to the combination that was checked. Changing the
  // combination afterwards withdraws it, so the student checks again: the verdict line
  // used to follow the cards live, and read "✓ Rétt!" beside the wrong-answer explanation,
  // with no point awarded, once a wrong answer had been fixed after checking.
  const clearResult = () => {
    setShowResult(false);
    setExplanation('');
  };

  // Handle equation modifications
  const handleReverse = (id: string) => {
    clearResult();
    setEquations((prev) =>
      prev.map((eq) => (eq.id === id ? { ...eq, isReversed: !eq.isReversed } : eq))
    );
  };

  const handleMultiply = (id: string, factor: number) => {
    if (equations.find((eq) => eq.id === id)?.multiplier !== factor) clearResult();
    setEquations((prev) => prev.map((eq) => (eq.id === id ? { ...eq, multiplier: factor } : eq)));
  };

  const toggleSelect = (id: string) => {
    clearResult();
    setSelectedEquations((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Solved when the chosen equations, as reversed and scaled, add up to the target
  // equation itself. Comparing only the summed ΔH accepted a wrong combination on puzzle 5.
  const reachesPuzzleTarget = () =>
    reachesTarget(
      equations.filter((eq) => selectedEquations.includes(eq.id)),
      puzzle.targetEquation
    );

  // Check solution
  const checkSolution = () => {
    const correct = reachesPuzzleTarget();

    setShowResult(true);
    // The result line already opens with "✓ Rétt!" or "✗ Ekki rétt.", so the
    // explanation must not repeat it.
    setExplanation(
      correct
        ? puzzle.explanation
        : 'Athugaðu hvort þú hefur snúið við réttum jöfnum og valið rétta margfeldisstuðla.'
    );

    if (correct) {
      if (!completed.includes(puzzle.id)) {
        const points = 100;
        setScore((prev) => prev + points);
        setCompleted((prev) => [...prev, puzzle.id]);
      }
    }
  };

  // Handle hint usage
  const handleShowHint = () => {
    setShowHint(true);
    setTotalHintsUsed((prev) => prev + 1);
  };

  // Next puzzle
  const nextPuzzle = () => {
    if (currentPuzzle < PUZZLES.length - 1) {
      const next = currentPuzzle + 1;
      setCurrentPuzzle(next);
      resetPuzzle(next);
    } else {
      // Max score is 100 per puzzle × 6 puzzles = 600
      onComplete(score);
    }
  };

  const currentSum = calculateSelectedSum();
  const isCorrect = reachesPuzzleTarget();

  // After Athuga lausn: bring the result box into view with Næsta and move
  // focus to it, not to Næsta (design P3). While the action row is pinned to
  // the bottom of a portrait phone Næsta is already on screen, so only the
  // result box has to be.
  useRevealAfterCommit(showResult, () => {
    const pinned = !!actionsRef.current?.closest('[data-pinned-bottom]');
    return {
      bottom: pinned ? resultRef.current : nextRef.current,
      tops: [resultRef.current],
      focus: resultRef.current,
    };
  });
  // A double tap on Athuga lausn must not land on Næsta, which renders in its place.
  const armed = useArmedAfter(400, `${currentPuzzle}:${showResult}`);

  // Calculate energy pathway steps for the diagram
  const energySteps = useMemo(() => {
    return equations
      .filter((eq) => selectedEquations.includes(eq.id))
      .map((eq) => ({
        label: eq.isReversed
          ? `${eq.products} → ${eq.reactants}`
          : `${eq.reactants} → ${eq.products}`,
        deltaH: eq.deltaH * eq.multiplier * (eq.isReversed ? -1 : 1),
      }));
  }, [equations, selectedEquations]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        {/* On a phone the header folds to one row (P4). Til baka keeps its DOM
            place after the title, so focus order matches what is seen. */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 phone:px-3 phone:py-2 phone:mb-3">
          <div className="flex justify-between items-center flex-wrap gap-4 phone:flex-nowrap phone:gap-3">
            <div className="phone:flex-1 phone:min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-green-600 phone:text-base">
                Lögmál Hess - Stig&nbsp;2
              </h1>
              <p className="text-sm text-warm-600 phone:sr-only">Þrautir - sameinaðu jöfnur</p>
            </div>

            <div className="flex gap-4 items-center phone:contents">
              <button
                onClick={onBack}
                className="text-warm-600 hover:text-warm-800 text-sm pointer-coarse:py-3 pointer-coarse:-my-3"
              >
                ← Til baka
              </button>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600 phone:text-base">{score}</div>
                <div className="text-xs text-warm-600">Stig</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600 phone:text-base">
                  {completed.length}/{PUZZLES.length}
                </div>
                <div className="text-xs text-warm-600">Lokið</div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 bg-warm-200 rounded-full h-2 phone:mt-2 phone:h-1.5">
            <div
              className="bg-green-500 h-2 phone:h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${(completed.length / PUZZLES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Main content */}
        <div ref={cardRef} className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 phone:p-3">
          {/* Puzzle header */}
          <div className="mb-6 phone:mb-3">
            <div
              data-item-start
              className="inline-block bg-green-100 px-4 py-2 rounded-full text-sm font-semibold text-green-800 mb-2 phone:py-1 phone:mb-1"
            >
              Þraut {currentPuzzle + 1}: {puzzle.title}
            </div>
            <p className="text-warm-700">{puzzle.description}</p>
          </div>

          {/* Target equation: on a portrait phone it stays pinned under the
              top edge while the student builds toward it (P7). */}
          <TaskStrip>
            <div className="mb-6 p-4 bg-orange-50 rounded-xl border-2 border-orange-300 phone:mb-3 phone:px-3 phone:py-2">
              <h3 className="text-sm font-semibold text-orange-800 mb-2 phone:mb-0 phone:text-xs">
                🎯 Markmiðsjafna:
              </h3>
              <div className="text-center font-mono text-lg phone:text-base">
                <span className="text-blue-700">{puzzle.targetEquation.reactants}</span>
                <span className="mx-2">→</span>
                <span className="text-green-700">{puzzle.targetEquation.products}</span>
              </div>
              <div className="text-center mt-2 phone:mt-0 phone:text-sm">
                <span className="font-bold text-orange-600">ΔH = ? kJ (finndu þetta!)</span>
              </div>
            </div>
          </TaskStrip>

          {/* Available equations */}
          <div className="mb-6 phone:mb-3">
            <h3 className="text-sm font-semibold text-warm-700 mb-3 phone:mb-2">
              📦 Tiltækar jöfnur (smelltu til að velja):
            </h3>
            <div className="grid md:grid-cols-2 gap-4 phone:gap-2 phone-land:grid-cols-2">
              {equations.map((eq) => (
                <EquationBlock
                  key={eq.id}
                  equation={eq}
                  isSelected={selectedEquations.includes(eq.id)}
                  onSelect={() => toggleSelect(eq.id)}
                  onReverse={() => handleReverse(eq.id)}
                  onMultiply={(n) => handleMultiply(eq.id, n)}
                />
              ))}
            </div>
          </div>

          {/* A phone on its side: the energy path | the running ΔH and the
              actions. The wrappers are display:contents everywhere else, so
              desktop is unchanged and on a portrait phone the pinned action bar
              is still bounded by the whole card, not by a column. */}
          <div
            className={
              selectedEquations.length > 0
                ? 'contents phone-land:grid phone-land:grid-cols-2 phone-land:gap-4 phone-land:items-start'
                : 'contents'
            }
          >
            <div className="contents phone-land:block">
              {/* Energy Pathway Diagram */}
              {selectedEquations.length > 0 && (
                <div className="mb-6 phone:mb-3">
                  <EnergyPathwayDiagram
                    steps={energySteps}
                    targetDeltaH={puzzle.targetDeltaH}
                    isCorrect={isCorrect && showResult}
                  />
                </div>
              )}
            </div>
            <div className="contents phone-land:block">
              {/* Current sum */}
              {/* After Athuga lausn this box holds the verdict, and focus moves to it (P3). */}
              {selectedEquations.length > 0 && (
                <div
                  ref={resultRef}
                  tabIndex={showResult ? -1 : undefined}
                  role={showResult ? 'group' : undefined}
                  aria-labelledby={showResult ? 'hess-l2-result' : undefined}
                  className={`mb-6 p-4 phone:mb-3 phone:p-3 rounded-xl border-2 focus:outline-none ${
                    showResult
                      ? isCorrect
                        ? 'bg-green-100 border-green-400'
                        : 'bg-red-100 border-red-400'
                      : 'bg-warm-100 border-warm-300'
                  }`}
                >
                  <h3 className="text-sm font-semibold text-warm-700 mb-2 phone:mb-1">
                    📊 Heildar-ΔH:
                  </h3>
                  <div className="text-center">
                    <span
                      className={`text-2xl font-bold ${currentSum < 0 ? 'text-red-600' : 'text-blue-600'}`}
                    >
                      ΔH = {currentSum > 0 ? '+' : ''}
                      {formatDecimal(currentSum, 1)} kJ
                    </span>
                  </div>
                  {showResult && (
                    <div
                      id="hess-l2-result"
                      className={`mt-3 phone:mt-2 text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}
                    >
                      {isCorrect ? '✓ Rétt!' : '✗ Ekki rétt.'} {explanation}
                    </div>
                  )}
                </div>
              )}

              {/* Hint */}
              {!showResult && (
                <div className="mb-6 phone:mb-3">
                  {showHint ? (
                    <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-xl">
                      <h4 className="font-semibold text-yellow-800 mb-2">💡 Vísbending:</h4>
                      <p className="text-yellow-900">{puzzle.hint}</p>
                    </div>
                  ) : (
                    <button
                      onClick={handleShowHint}
                      className="text-yellow-600 hover:text-yellow-700 text-sm pointer-coarse:py-3 pointer-coarse:-my-3"
                    >
                      💡 Sýna vísbendingu
                    </button>
                  )}
                </div>
              )}

              {/* Action buttons: one row on a phone, pinned to the bottom of a
              portrait phone with the running ΔH beside the target (P8). Athuga
              lausn and Næsta are separate (keyed) elements, and Næsta ignores a
              press within 400 ms of appearing. */}
              <PinnedActions
                status={
                  selectedEquations.length > 0 ? (
                    <>
                      Heildar-ΔH: {currentSum > 0 ? '+' : ''}
                      {formatDecimal(currentSum, 1)} kJ
                    </>
                  ) : undefined
                }
              >
                <div
                  ref={actionsRef}
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 phone:flex-row phone:gap-2"
                >
                  <button
                    onClick={() => resetPuzzle(currentPuzzle)}
                    className="px-6 phone:px-3 py-3 phone:py-2 pointer-coarse:min-h-11 phone:whitespace-nowrap bg-warm-200 hover:bg-warm-300 rounded-xl font-semibold transition-colors"
                  >
                    🔄 Byrja aftur
                  </button>

                  {!showResult ? (
                    <button
                      key="check"
                      onClick={checkSolution}
                      disabled={selectedEquations.length === 0}
                      className={`flex-1 py-3 px-6 phone:py-2 phone:px-3 pointer-coarse:min-h-11 phone:min-w-0 rounded-xl font-bold transition-colors ${
                        selectedEquations.length > 0
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-warm-300 text-warm-500 cursor-not-allowed'
                      }`}
                    >
                      Athuga lausn
                    </button>
                  ) : (
                    <button
                      key="next"
                      ref={nextRef}
                      onClick={armed(nextPuzzle)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 phone:py-2 phone:px-3 pointer-coarse:min-h-11 phone:min-w-0 rounded-xl transition-colors"
                    >
                      {currentPuzzle < PUZZLES.length - 1 ? 'Næsta þraut →' : 'Ljúka stigi →'}
                    </button>
                  )}
                </div>
              </PinnedActions>
            </div>
          </div>
        </div>

        {/* Puzzle navigation */}
        <div className="mt-6 flex flex-wrap justify-center gap-1 min-[360px]:gap-2">
          {PUZZLES.map((p, i) => (
            <button
              key={p.id}
              onClick={() => {
                setCurrentPuzzle(i);
                resetPuzzle(i);
              }}
              className={`w-10 h-10 pointer-coarse:w-11 pointer-coarse:h-11 rounded-full font-bold transition-colors ${
                completed.includes(p.id)
                  ? 'bg-green-500 text-white'
                  : i === currentPuzzle
                    ? 'bg-blue-500 text-white'
                    : 'bg-warm-200 text-warm-600 hover:bg-warm-300'
              }`}
            >
              {completed.includes(p.id) ? '✓' : i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Level2;
