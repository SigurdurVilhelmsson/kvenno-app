import { useState, useMemo } from 'react';

import { FeedbackPanel } from '@shared/components';

import { AtomCounter } from './AtomCounter';
import { EquationEditor } from './EquationEditor';
import { REACTIONS, type Reaction } from '../data/reactions';
import { checkBalance } from '../utils/balanceChecker';

/** Fisher-Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Level2Props {
  onBack: () => void;
  onComplete: () => void;
}

/** Pick all medium reactions, shuffled */
function selectProblems(): Reaction[] {
  return shuffle(REACTIONS.filter((r) => r.difficulty === 'medium'));
}

/**
 * Level 2: Miðlungs jöfnur (Medium Equations)
 * - 7 medium reactions (3-element, coefficients up to 6)
 * - AtomCounter always visible, real-time updates
 * - After balancing: FeedbackPanel
 */
export function Level2({ onBack, onComplete }: Level2Props) {
  const [problems, setProblems] = useState<Reaction[]>(selectProblems);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [done, setDone] = useState(false);

  const reaction = problems[index];
  const total = problems.length;

  const [reactantCoeffs, setReactantCoeffs] = useState<number[]>(() =>
    reaction.reactants.map(() => 1)
  );
  const [productCoeffs, setProductCoeffs] = useState<number[]>(() =>
    reaction.products.map(() => 1)
  );

  const balanceResult = useMemo(
    () => checkBalance(reaction.reactants, reaction.products, reactantCoeffs, productCoeffs),
    [reaction, reactantCoeffs, productCoeffs]
  );

  const handleCheck = () => {
    const correct = balanceResult.isBalanced;
    setIsCorrect(correct);
    if (correct) setCorrectCount((prev) => prev + 1);
    setAnswered(true);
  };

  const handleNext = () => {
    if (index + 1 >= total) {
      setDone(true);
      return;
    }
    const nextReaction = problems[index + 1];
    setIndex((prev) => prev + 1);
    setReactantCoeffs(nextReaction.reactants.map(() => 1));
    setProductCoeffs(nextReaction.products.map(() => 1));
    setAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
  };

  const handleRetry = () => {
    const newProblems = selectProblems();
    setProblems(newProblems);
    setIndex(0);
    setCorrectCount(0);
    setAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
    setDone(false);
    setReactantCoeffs(newProblems[0].reactants.map(() => 1));
    setProductCoeffs(newProblems[0].products.map(() => 1));
  };

  // --- Summary screen ---
  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
          <div className="text-5xl">
            {correctCount >= 5 ? '🎉' : correctCount >= 3 ? '👍' : '📚'}
          </div>
          <h2 className="text-2xl font-bold text-warm-800">Niðurstöður</h2>
          <p className="text-lg text-warm-700">
            Þú jafnaðir <span className="font-bold text-kvenno-orange">{correctCount}</span> af{' '}
            <span className="font-bold">{total}</span> jöfnum rétt
          </p>
          <div className="h-3 bg-warm-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-kvenno-orange transition-all duration-700"
              style={{ width: `${(correctCount / total) * 100}%` }}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 bg-warm-200 hover:bg-warm-300 text-warm-800 font-bold py-3 rounded-xl transition-colors"
            >
              Reyna aftur
            </button>
            <button
              onClick={onComplete}
              className="flex-1 bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
            >
              Ljúka stigi
            </button>
          </div>
          <button onClick={onBack} className="text-warm-500 hover:text-warm-700 text-sm">
            Til baka í valmynd
          </button>
        </div>
      </div>
    );
  }

  // --- Main gameplay ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex justify-between items-center">
            <button
              onClick={onBack}
              className="text-warm-500 hover:text-warm-700 font-semibold text-sm"
            >
              ← Til baka
            </button>
            <h1 className="text-lg font-bold text-warm-800">Miðlungs jöfnur – Stig 2</h1>
            <span className="text-sm font-semibold text-warm-600">
              {index + 1}/{total}
            </span>
          </div>
          <div className="mt-3 h-2 bg-warm-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-kvenno-orange progress-fill"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Equation Editor */}
        <div className="mb-4">
          <EquationEditor
            reactants={reaction.reactants}
            products={reaction.products}
            reactantCoeffs={reactantCoeffs}
            productCoeffs={productCoeffs}
            onReactantCoeffChange={(i, v) => {
              if (!answered) {
                const next = [...reactantCoeffs];
                next[i] = v;
                setReactantCoeffs(next);
              }
            }}
            onProductCoeffChange={(i, v) => {
              if (!answered) {
                const next = [...productCoeffs];
                next[i] = v;
                setProductCoeffs(next);
              }
            }}
            disabled={answered}
          />
        </div>

        {/* Atom Counter - always visible */}
        <div className="mb-4">
          <AtomCounter elements={balanceResult.elements} />
        </div>

        {/* Check button — primary action */}
        {!answered && (
          <button
            onClick={handleCheck}
            className="w-full mb-3 bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
          >
            Athuga
          </button>
        )}

        {/* Hint button — secondary */}
        {!answered && !showHint && reaction.hint && (
          <button
            onClick={() => setShowHint(true)}
            className="w-full mb-4 px-4 py-2.5 rounded-xl text-sm font-semibold bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
          >
            Vísbending
          </button>
        )}

        {/* Hint text */}
        {showHint && !answered && reaction.hint && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-4 text-sm text-yellow-800 animate-fade-in-up">
            <span className="font-bold">Vísbending:</span> {reaction.hint}
          </div>
        )}

        {/* Feedback */}
        {answered && (
          <div className="space-y-4">
            <FeedbackPanel
              feedback={{
                isCorrect,
                explanation: isCorrect
                  ? `Rétt! Jafnan er jöfn.`
                  : `Rangt. Réttir stuðlar eru: ${[
                      ...reaction.reactants.map((m) => m.coefficient),
                      ...reaction.products.map((m) => m.coefficient),
                    ].join(', ')}.`,
              }}
              config={{ showExplanation: true }}
            />

            <button
              onClick={handleNext}
              className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
            >
              {index + 1 < total ? 'Næsta jafna →' : 'Sjá niðurstöður →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Level2;
