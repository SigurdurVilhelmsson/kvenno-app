import { type ReactNode, useMemo, useState } from 'react';

import { FeedbackPanel } from '@shared/components';
import { useEscapeKey } from '@shared/hooks';
import { shuffleArray } from '@shared/utils';

import { AtomCounter } from './AtomCounter';
import { EquationEditor } from './EquationEditor';
import { REACTIONS, type Reaction } from '../data/reactions';
import { checkBalance, buildUnbalancedDiagnostic } from '../utils/balanceChecker';

type Difficulty = Reaction['difficulty'];
type HintSource = 'reaction-hint' | 'dynamic-unbalanced';

export interface LevelConfig {
  difficulty: Difficulty;
  /** Page title shown in the header (e.g. "Einfaldar jöfnur – Stig 1") */
  title: string;
  /** Tailwind background class for the page gradient, e.g. "from-green-50" */
  bgFrom: string;
  /** Optional teaching intro shown before the first problem (Level 1 only) */
  intro?: ReactNode;
  /** Optional inline instructions banner shown above the editor */
  instructions?: string;
  /** Whether hint mode highlights unbalanced elements in the AtomCounter */
  highlightUnbalancedOnHint?: boolean;
  /** How hints are generated — from reaction data or dynamically from balance state */
  hintSource: HintSource;
}

interface LevelProps {
  config: LevelConfig;
  onBack: () => void;
  onComplete: () => void;
}

function selectProblems(difficulty: Difficulty): Reaction[] {
  return shuffleArray(REACTIONS.filter((r) => r.difficulty === difficulty));
}

export function Level({ config, onBack, onComplete }: LevelProps) {
  const [showIntro, setShowIntro] = useState(Boolean(config.intro));
  useEscapeKey(onBack, showIntro);
  const [problems, setProblems] = useState<Reaction[]>(() => selectProblems(config.difficulty));
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
    const newProblems = selectProblems(config.difficulty);
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

  const hintAvailable = config.hintSource === 'dynamic-unbalanced' || Boolean(reaction.hint);

  const hintText = (): string => {
    if (config.hintSource === 'reaction-hint') return reaction.hint ?? '';
    const unbalanced = balanceResult.elements.filter((e) => !e.balanced);
    if (unbalanced.length === 0) {
      return 'Jafnan lítur út fyrir að vera jöfn — smelltu á Athuga!';
    }
    const el = unbalanced[0];
    const direction =
      el.left < el.right ? 'Auktu stuðla á vinstri hlið.' : 'Auktu stuðla á hægri hlið.';
    return `${el.element} er ójafnað: ${el.left} á vinstri, ${el.right} á hægri. ${direction}`;
  };

  // --- Teaching intro ---
  if (showIntro && config.intro) {
    return (
      <div className={`min-h-screen bg-gradient-to-b ${config.bgFrom} to-white p-4`}>
        <div className="max-w-lg mx-auto">
          <button
            onClick={onBack}
            className="text-warm-500 hover:text-warm-700 font-semibold text-sm mb-4"
          >
            ← Til baka
          </button>
          {config.intro}
          <button
            onClick={() => setShowIntro(false)}
            className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors text-lg"
          >
            Byrja æfingar →
          </button>
        </div>
      </div>
    );
  }

  // --- Summary screen ---
  if (done) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-b ${config.bgFrom} to-white p-4 flex items-center justify-center`}
      >
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
    <div className={`min-h-screen bg-gradient-to-b ${config.bgFrom} to-white p-4`}>
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
            <h1 className="text-lg font-bold text-warm-800">{config.title}</h1>
            <span className="text-sm font-semibold text-warm-600">
              {index + 1}/{total}
            </span>
          </div>
          <div className="mt-3 h-2 bg-warm-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-kvenno-orange transition-all duration-500"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        {config.instructions && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-sm text-green-800">
            {config.instructions}
          </div>
        )}

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

        <div className="mb-4">
          <AtomCounter
            elements={balanceResult.elements}
            highlightUnbalanced={config.highlightUnbalancedOnHint && showHint}
          />
        </div>

        {!answered && (
          <button
            onClick={handleCheck}
            className="w-full mb-3 bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
          >
            Athuga
          </button>
        )}

        {!answered && !showHint && hintAvailable && (
          <button
            onClick={() => setShowHint(true)}
            className="w-full mb-4 px-4 py-2.5 rounded-xl text-sm font-semibold bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
          >
            Vísbending
          </button>
        )}

        {showHint && !answered && hintAvailable && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-4 text-sm text-yellow-800 animate-fade-in-up">
            <span className="font-bold">Vísbending:</span> {hintText()}
          </div>
        )}

        {answered && (
          <div className="space-y-4">
            <FeedbackPanel
              feedback={{
                isCorrect,
                explanation: isCorrect
                  ? 'Rétt! Jafnan er jöfn.'
                  : `Rangt. ${buildUnbalancedDiagnostic(balanceResult.elements)} Réttir stuðlar eru: ${[
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

export default Level;
