import { useState, useCallback } from 'react';
import { FeedbackPanel } from '@shared/components';

/**
 * StructureFromNameChallenge
 *
 * Reverse challenge: Given an IUPAC name, students must build
 * the correct molecular structure by:
 * 1. Setting the correct number of carbons
 * 2. Setting the correct bond type(s) at the right position(s)
 *
 * Tests bidirectional understanding of nomenclature.
 */

type BondType = 'single' | 'double' | 'triple';

interface TargetStructure {
  carbons: number;
  bonds: { position: number; type: BondType }[];
}

interface Challenge {
  id: number;
  name: string;
  formula: string;
  target: TargetStructure;
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const CHALLENGES: Challenge[] = [
  // Easy - Alkanes
  {
    id: 1,
    name: 'propan',
    formula: 'C₃H₈',
    target: { carbons: 3, bonds: [] }, // all single bonds
    hint: 'prop = 3 kolefni, an = eintengi',
    difficulty: 'easy',
  },
  {
    id: 2,
    name: 'pentan',
    formula: 'C₅H₁₂',
    target: { carbons: 5, bonds: [] },
    hint: 'pent = 5 kolefni, an = eintengi',
    difficulty: 'easy',
  },
  // Easy - Alkenes
  {
    id: 3,
    name: 'eten',
    formula: 'C₂H₄',
    target: { carbons: 2, bonds: [{ position: 1, type: 'double' }] },
    hint: 'eth = 2 kolefni, en = tvítengi',
    difficulty: 'easy',
  },
  {
    id: 4,
    name: 'propen',
    formula: 'C₃H₆',
    target: { carbons: 3, bonds: [{ position: 1, type: 'double' }] },
    hint: 'prop = 3 kolefni, en = tvítengi',
    difficulty: 'easy',
  },
  // Medium - Position numbers
  {
    id: 5,
    name: '1-buten',
    formula: 'C₄H₈',
    target: { carbons: 4, bonds: [{ position: 1, type: 'double' }] },
    hint: '1- = tvítengi á stað 1, but = 4 kolefni',
    difficulty: 'medium',
  },
  {
    id: 6,
    name: '2-buten',
    formula: 'C₄H₈',
    target: { carbons: 4, bonds: [{ position: 2, type: 'double' }] },
    hint: '2- = tvítengi á stað 2, but = 4 kolefni',
    difficulty: 'medium',
  },
  // Medium - Alkynes
  {
    id: 7,
    name: 'etyn',
    formula: 'C₂H₂',
    target: { carbons: 2, bonds: [{ position: 1, type: 'triple' }] },
    hint: 'eth = 2 kolefni, yn = þrítengi',
    difficulty: 'medium',
  },
  {
    id: 8,
    name: '1-butyn',
    formula: 'C₄H₆',
    target: { carbons: 4, bonds: [{ position: 1, type: 'triple' }] },
    hint: '1- = þrítengi á stað 1, but = 4 kolefni',
    difficulty: 'medium',
  },
  // Hard - More complex
  {
    id: 9,
    name: '2-pentyn',
    formula: 'C₅H₈',
    target: { carbons: 5, bonds: [{ position: 2, type: 'triple' }] },
    hint: '2- = þrítengi á stað 2, pent = 5 kolefni',
    difficulty: 'hard',
  },
  {
    id: 10,
    name: '1-hexen',
    formula: 'C₆H₁₂',
    target: { carbons: 6, bonds: [{ position: 1, type: 'double' }] },
    hint: '1- = tvítengi á stað 1, hex = 6 kolefni',
    difficulty: 'hard',
  },
];

// Misconceptions
const MISCONCEPTIONS = {
  carbons: 'Forskeytið segir til um fjölda kolefna: meth=1, eth=2, prop=3, but=4, pent=5, hex=6.',
  suffix: 'Viðskeytið segir til um tengjategund: -an (eintengi), -en (tvítengi), -yn (þrítengi).',
  position: 'Staðsetningartalan segir hvar ómettuð tenging byrjar (t.d. 2-buten = tvítengi milli C2 og C3).',
};

interface StructureFromNameChallengeProps {
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

export function StructureFromNameChallenge({
  onComplete,
  onBack,
  onCorrectAnswer,
  onIncorrectAnswer,
}: StructureFromNameChallengeProps) {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [carbonCount, setCarbonCount] = useState(4);
  const [bonds, setBonds] = useState<{ position: number; type: BondType }[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);

  const challenge = CHALLENGES[currentChallenge];
  const maxScore = CHALLENGES.length * 15;

  // Initialize bonds when carbon count changes
  const updateCarbonCount = (newCount: number) => {
    if (newCount < 2 || newCount > 8) return;
    setCarbonCount(newCount);
    // Keep only valid bonds
    setBonds(prev => prev.filter(b => b.position < newCount));
  };

  // Cycle bond type at position
  const cycleBond = (position: number) => {
    setBonds(prev => {
      const existing = prev.find(b => b.position === position);
      if (!existing) {
        // Add double bond
        return [...prev, { position, type: 'double' as BondType }];
      }
      if (existing.type === 'double') {
        // Change to triple
        return prev.map(b =>
          b.position === position ? { ...b, type: 'triple' as BondType } : b
        );
      }
      // Remove (back to single)
      return prev.filter(b => b.position !== position);
    });
  };

  // Check if current structure matches target
  const checkAnswer = useCallback(() => {
    const target = challenge.target;

    // Check carbon count
    if (carbonCount !== target.carbons) {
      setIsCorrect(false);
      setShowFeedback(true);
      onIncorrectAnswer?.();
      return;
    }

    // Check bonds
    const userUnsaturated = bonds.filter(b => b.type !== 'single');
    const targetUnsaturated = target.bonds;

    // Same number of unsaturated bonds?
    if (userUnsaturated.length !== targetUnsaturated.length) {
      setIsCorrect(false);
      setShowFeedback(true);
      onIncorrectAnswer?.();
      return;
    }

    // Check each bond matches
    const allMatch = targetUnsaturated.every(tb =>
      userUnsaturated.some(ub => ub.position === tb.position && ub.type === tb.type)
    );

    setIsCorrect(allMatch);
    setShowFeedback(true);

    if (allMatch) {
      const points = showHint ? 8 : 15;
      setScore(prev => prev + points);
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
    }
  }, [carbonCount, bonds, challenge, showHint, onCorrectAnswer, onIncorrectAnswer]);

  // Get feedback details
  const getFeedback = () => {
    const target = challenge.target;

    if (isCorrect) {
      return {
        isCorrect: true,
        explanation: `Rétt! ${challenge.name} hefur ${target.carbons} kolefni${
          target.bonds.length > 0
            ? ` og ${target.bonds[0].type === 'double' ? 'tvítengi' : 'þrítengi'} á stað ${target.bonds[0].position}`
            : ' og eingöngu eintengi'
        }.`,
        relatedConcepts: ['IUPAC nafnakerfi', 'Kolefniskeðjur', 'Vetniskolefni'],
        nextSteps: 'Frábært! Þú getur greint byggingu sameindar út frá nafni.',
      };
    }

    // Determine what went wrong
    let misconception = MISCONCEPTIONS.carbons;
    if (carbonCount !== target.carbons) {
      misconception = MISCONCEPTIONS.carbons;
    } else if (bonds.length !== target.bonds.length) {
      misconception = MISCONCEPTIONS.suffix;
    } else {
      misconception = MISCONCEPTIONS.position;
    }

    return {
      isCorrect: false,
      explanation: `Rétt svar: ${target.carbons} kolefni${
        target.bonds.length > 0
          ? `, ${target.bonds[0].type === 'double' ? 'tvítengi' : 'þrítengi'} á stað ${target.bonds[0].position}`
          : ', öll eintengi'
      }.`,
      misconception,
      relatedConcepts: ['IUPAC nafnakerfi', 'Kolefniskeðjur', 'Vetniskolefni'],
      nextSteps: 'Skoðaðu nafnið vandlega: forskeyti → fjöldi, viðskeyti → tengi, tala → staðsetning.',
    };
  };

  // Next challenge
  const handleNext = () => {
    if (currentChallenge < CHALLENGES.length - 1) {
      setCurrentChallenge(prev => prev + 1);
      setCarbonCount(4);
      setBonds([]);
      setShowFeedback(false);
      setShowHint(false);
    } else {
      onComplete(score, maxScore, hintsUsed);
    }
  };

  // Reset current
  const handleReset = () => {
    setCarbonCount(4);
    setBonds([]);
  };

  const atomSize = 40;
  const bondLength = 50;
  const bondHeight = 5;

  const getDifficultyColor = () => {
    switch (challenge.difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'hard': return 'bg-red-100 text-red-700 border-red-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
            ← Til baka
          </button>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Áskorun {currentChallenge + 1} af {CHALLENGES.length}
            </div>
            <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">
              Stig: {score}
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-emerald-600">
          🔬 Byggðu sameindina
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Lestu nafnið og byggðu rétta byggingu
        </p>

        {/* Challenge card */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border-2 border-emerald-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor()}`}>
              {challenge.difficulty === 'easy' ? 'Auðvelt' :
               challenge.difficulty === 'medium' ? 'Miðlungs' : 'Erfitt'}
            </span>
            <span className="text-gray-500 font-mono">{challenge.formula}</span>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Byggðu þessa sameind:</div>
            <div className="text-4xl font-bold text-emerald-700">{challenge.name}</div>
          </div>
        </div>

        {/* Molecule builder */}
        {!showFeedback && (
          <div className="mb-6">
            {/* Carbon chain visualization */}
            <div className="bg-slate-900 rounded-xl p-4 mb-4 overflow-x-auto">
              <div className="flex items-center justify-center min-w-fit">
                {Array.from({ length: carbonCount }).map((_, i) => (
                  <div key={i} className="flex items-center">
                    {/* Carbon atom */}
                    <div
                      className="flex items-center justify-center rounded-full bg-gray-700 border-2 border-gray-500 text-white font-bold select-none"
                      style={{ width: atomSize, height: atomSize, fontSize: atomSize * 0.35 }}
                    >
                      C{i + 1}
                    </div>

                    {/* Bond */}
                    {i < carbonCount - 1 && (
                      <button
                        onClick={() => cycleBond(i + 1)}
                        className="relative flex flex-col justify-center items-center hover:scale-110 transition-transform cursor-pointer group"
                        style={{ width: bondLength, height: atomSize }}
                        title="Smelltu til að breyta tengingu"
                      >
                        {(() => {
                          const bond = bonds.find(b => b.position === i + 1);
                          const bondType = bond?.type || 'single';

                          if (bondType === 'single' || !bond) {
                            return (
                              <div
                                className="bg-gray-400 group-hover:bg-gray-300 rounded-full"
                                style={{ width: '100%', height: bondHeight }}
                              />
                            );
                          }

                          if (bondType === 'double') {
                            return (
                              <>
                                <div
                                  className="bg-green-400 group-hover:bg-green-300 rounded-full"
                                  style={{ width: '100%', height: bondHeight, marginBottom: 3 }}
                                />
                                <div
                                  className="bg-green-400 group-hover:bg-green-300 rounded-full"
                                  style={{ width: '100%', height: bondHeight }}
                                />
                              </>
                            );
                          }

                          return (
                            <>
                              <div
                                className="bg-purple-400 group-hover:bg-purple-300 rounded-full"
                                style={{ width: '100%', height: bondHeight - 1, marginBottom: 2 }}
                              />
                              <div
                                className="bg-purple-400 group-hover:bg-purple-300 rounded-full"
                                style={{ width: '100%', height: bondHeight - 1, marginBottom: 2 }}
                              />
                              <div
                                className="bg-purple-400 group-hover:bg-purple-300 rounded-full"
                                style={{ width: '100%', height: bondHeight - 1 }}
                              />
                            </>
                          );
                        })()}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-3 flex justify-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="w-4 h-1 bg-gray-400 rounded" /> ein
                </span>
                <span className="flex items-center gap-1">
                  <span className="flex flex-col gap-0.5">
                    <span className="w-4 h-0.5 bg-green-400 rounded" />
                    <span className="w-4 h-0.5 bg-green-400 rounded" />
                  </span>
                  tví
                </span>
                <span className="flex items-center gap-1">
                  <span className="flex flex-col gap-0.5">
                    <span className="w-4 h-0.5 bg-purple-400 rounded" />
                    <span className="w-4 h-0.5 bg-purple-400 rounded" />
                    <span className="w-4 h-0.5 bg-purple-400 rounded" />
                  </span>
                  þrí
                </span>
              </div>
            </div>

            {/* Carbon controls */}
            <div className="flex justify-center items-center gap-4 mb-4">
              <button
                onClick={() => updateCarbonCount(carbonCount - 1)}
                disabled={carbonCount <= 2}
                className={`w-10 h-10 rounded-full font-bold text-xl transition-all ${
                  carbonCount > 2
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                -
              </button>

              <div className="text-center px-4">
                <div className="text-xl font-bold text-gray-800">{carbonCount}</div>
                <div className="text-xs text-gray-500">kolefni</div>
              </div>

              <button
                onClick={() => updateCarbonCount(carbonCount + 1)}
                disabled={carbonCount >= 8}
                className={`w-10 h-10 rounded-full font-bold text-xl transition-all ${
                  carbonCount < 8
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                +
              </button>

              <button
                onClick={handleReset}
                className="ml-4 px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
              >
                Endurstilla
              </button>
            </div>

            {/* Hint */}
            {!showHint ? (
              <button
                onClick={() => {
                  setShowHint(true);
                  setHintsUsed(prev => prev + 1);
                }}
                className="w-full text-yellow-600 hover:text-yellow-700 text-sm mb-4"
              >
                💡 Sýna vísbendingu (-7 stig)
              </button>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
                <span className="text-yellow-800">{challenge.hint}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={checkAnswer}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl"
            >
              Athuga svar
            </button>
          </div>
        )}

        {/* Feedback */}
        {showFeedback && (
          <div className="space-y-4">
            <FeedbackPanel
              feedback={getFeedback()}
              config={{
                showExplanation: true,
                showMisconceptions: !isCorrect,
                showRelatedConcepts: true,
                showNextSteps: true,
              }}
            />

            <button
              onClick={handleNext}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl"
            >
              {currentChallenge < CHALLENGES.length - 1 ? 'Næsta áskorun →' : 'Ljúka →'}
            </button>
          </div>
        )}

        {/* Reference */}
        <div className="mt-6 bg-gray-50 p-4 rounded-xl">
          <h3 className="font-semibold text-gray-700 mb-2">📋 Minnisblað:</h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="font-bold text-gray-600 mb-1">Forskeytir:</div>
              <div className="grid grid-cols-3 gap-1">
                {['meth-1', 'eth-2', 'prop-3', 'but-4', 'pent-5', 'hex-6'].map(p => {
                  const [prefix, count] = p.split('-');
                  return (
                    <div key={p} className="bg-white p-1 rounded border text-center">
                      {count}: {prefix}
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="font-bold text-gray-600 mb-1">Viðskeytir:</div>
              <div className="space-y-1">
                <div className="bg-white p-1 rounded border text-center">-an = eintengi</div>
                <div className="bg-green-50 p-1 rounded border border-green-200 text-center">-en = tvítengi</div>
                <div className="bg-purple-50 p-1 rounded border border-purple-200 text-center">-yn = þrítengi</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentChallenge + (showFeedback && isCorrect ? 1 : 0)) / CHALLENGES.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default StructureFromNameChallenge;
