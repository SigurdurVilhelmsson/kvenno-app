import { useState, useCallback, useMemo } from 'react';

import { EnergyPathwayDiagram } from './EnergyPathwayDiagram';
import type { Equation } from '../data/challenges';
import { calculateSum } from '../utils/hess-calculations';

interface Puzzle {
  id: number;
  title: string;
  description: string;
  targetEquation: {
    reactants: string;
    products: string;
  };
  targetDeltaH: number;
  availableEquations: Equation[];
  solution: { equationId: string; reverse: boolean; multiply: number }[];
  hint: string;
  explanation: string;
}

const PUZZLES: Puzzle[] = [
  {
    id: 1,
    title: 'Kolmonoxíð - iðnaðargas',
    description:
      '🏭 CO er mikilvægt iðnaðargas notað í stálframleiðslu og efnasmíði. Finndu myndunarvarmans.',
    targetEquation: {
      reactants: 'C(s) + ½O₂(g)',
      products: 'CO(g)',
    },
    targetDeltaH: -110.5,
    availableEquations: [
      {
        id: 'eq1',
        reactants: 'C(s) + O₂(g)',
        products: 'CO₂(g)',
        deltaH: -393.5,
        isReversed: false,
        multiplier: 1,
      },
      {
        id: 'eq2',
        reactants: 'CO(g) + ½O₂(g)',
        products: 'CO₂(g)',
        deltaH: -283.0,
        isReversed: false,
        multiplier: 1,
      },
    ],
    solution: [
      { equationId: 'eq1', reverse: false, multiply: 1 },
      { equationId: 'eq2', reverse: true, multiply: 1 },
    ],
    hint: 'Þú vilt CO sem afurð, en í jöfnu 2 er CO hvarfefni. Hvað þarftu að gera?',
    explanation:
      'Nota jöfnu 1 (C → CO₂) og snúa við jöfnu 2 (CO₂ → CO). CO₂ styttist út: -393.5 + 283.0 = -110.5 kJ',
  },
  {
    id: 2,
    title: 'Vatn - vetnisorkugjafi',
    description:
      '🚀 Myndun vatns er grunnur að vetnisbrennslugögnum (fuel cells) og eldsneytisknippi eldflaugar. Finndu hvörfvarmann.',
    targetEquation: {
      reactants: 'H₂(g) + ½O₂(g)',
      products: 'H₂O(g)',
    },
    targetDeltaH: -241.8,
    availableEquations: [
      {
        id: 'eq1',
        reactants: 'H₂(g) + ½O₂(g)',
        products: 'H₂O(l)',
        deltaH: -285.8,
        isReversed: false,
        multiplier: 1,
      },
      {
        id: 'eq2',
        reactants: 'H₂O(l)',
        products: 'H₂O(g)',
        deltaH: 44.0,
        isReversed: false,
        multiplier: 1,
      },
    ],
    solution: [
      { equationId: 'eq1', reverse: false, multiply: 1 },
      { equationId: 'eq2', reverse: false, multiply: 1 },
    ],
    hint: 'Jafna 1 gefur fljótandi vatn, en þú vilt gas. Jafna 2 umbreytir vökva í gas.',
    explanation: 'Leggja saman báðar jöfnur: -285.8 + 44.0 = -241.8 kJ. H₂O(l) styttist út.',
  },
  {
    id: 3,
    title: 'Etanól - lífeldsneyti',
    description:
      '🌽 Etanól er umhverfisvænt lífeldsneyti framleitt úr korni og sykurreyr. Notað í bílum í Brasilíu og E85 blöndum.',
    targetEquation: {
      reactants: 'C₂H₅OH(l) + 3O₂(g)',
      products: '2CO₂(g) + 3H₂O(l)',
    },
    targetDeltaH: -1367,
    availableEquations: [
      {
        id: 'eq1',
        reactants: 'C(s) + O₂(g)',
        products: 'CO₂(g)',
        deltaH: -393.5,
        isReversed: false,
        multiplier: 1,
      },
      {
        id: 'eq2',
        reactants: 'H₂(g) + ½O₂(g)',
        products: 'H₂O(l)',
        deltaH: -285.8,
        isReversed: false,
        multiplier: 1,
      },
      {
        id: 'eq3',
        reactants: '2C(s) + 3H₂(g) + ½O₂(g)',
        products: 'C₂H₅OH(l)',
        deltaH: -277.0,
        isReversed: false,
        multiplier: 1,
      },
    ],
    solution: [
      { equationId: 'eq1', reverse: false, multiply: 2 },
      { equationId: 'eq2', reverse: false, multiply: 3 },
      { equationId: 'eq3', reverse: true, multiply: 1 },
    ],
    hint: 'Etanól er hvarfefni, en í jöfnu 3 er það afurð. Þú þarft 2 CO₂ og 3 H₂O.',
    explanation: '2×(-393.5) + 3×(-285.8) + (+277.0) = -787 - 857.4 + 277 = -1367.4 kJ',
  },
  {
    id: 4,
    title: 'NO₂ - loftmengun',
    description:
      '🚗 NO₂ myndast í bifreiðum og veldur loftmengun. Skilningur á þessu hjálpar við útblásturshreinsikerfi (catalytic converters).',
    targetEquation: {
      reactants: '½N₂(g) + O₂(g)',
      products: 'NO₂(g)',
    },
    targetDeltaH: 33.2,
    availableEquations: [
      {
        id: 'eq1',
        reactants: '½N₂(g) + ½O₂(g)',
        products: 'NO(g)',
        deltaH: 90.2,
        isReversed: false,
        multiplier: 1,
      },
      {
        id: 'eq2',
        reactants: 'NO(g) + ½O₂(g)',
        products: 'NO₂(g)',
        deltaH: -57.0,
        isReversed: false,
        multiplier: 1,
      },
    ],
    solution: [
      { equationId: 'eq1', reverse: false, multiply: 1 },
      { equationId: 'eq2', reverse: false, multiply: 1 },
    ],
    hint: 'NO er millistig. Leggðu saman til að NO styttist út.',
    explanation: 'Jöfnur 1 + 2: NO styttist út. 90.2 + (-57.0) = 33.2 kJ',
  },
  {
    id: 5,
    title: 'SO₃ - Snertiferlið (Contact Process)',
    description:
      '🏭 SO₃ framleiðsla er lykilskref í snertiferlinu (Contact Process) sem framleiðir brennisteinsýru - mest framleidda efnið í heiminum!',
    targetEquation: {
      reactants: 'SO₂(g) + ½O₂(g)',
      products: 'SO₃(g)',
    },
    targetDeltaH: -99.0,
    availableEquations: [
      {
        id: 'eq1',
        reactants: 'S(s) + O₂(g)',
        products: 'SO₂(g)',
        deltaH: -297.0,
        isReversed: false,
        multiplier: 1,
      },
      {
        id: 'eq2',
        reactants: 'S(s) + 3/2O₂(g)',
        products: 'SO₃(g)',
        deltaH: -396.0,
        isReversed: false,
        multiplier: 1,
      },
    ],
    solution: [
      { equationId: 'eq1', reverse: true, multiply: 1 },
      { equationId: 'eq2', reverse: false, multiply: 1 },
    ],
    hint: 'SO₂ er hvarfefni í markmiðinu, en afurð í jöfnu 1. Hvað þarftu að gera?',
    explanation: 'Snúa við jöfnu 1 og leggja við jöfnu 2: +297.0 + (-396.0) = -99.0 kJ',
  },
  {
    id: 6,
    title: 'Thermít - járnbrautaviðgerðir',
    description:
      '🔥 Thermítviðbrögð (2700°C!) eru notuð til að bræða saman járnbrautateina. Einnig notað í hernaði og eldflaugum.',
    targetEquation: {
      reactants: '2Al(s) + Fe₂O₃(s)',
      products: 'Al₂O₃(s) + 2Fe(s)',
    },
    targetDeltaH: -852,
    availableEquations: [
      {
        id: 'eq1',
        reactants: '2Al(s) + 3/2O₂(g)',
        products: 'Al₂O₃(s)',
        deltaH: -1676,
        isReversed: false,
        multiplier: 1,
      },
      {
        id: 'eq2',
        reactants: '2Fe(s) + 3/2O₂(g)',
        products: 'Fe₂O₃(s)',
        deltaH: -824,
        isReversed: false,
        multiplier: 1,
      },
    ],
    solution: [
      { equationId: 'eq1', reverse: false, multiply: 1 },
      { equationId: 'eq2', reverse: true, multiply: 1 },
    ],
    hint: 'Fe₂O₃ er hvarfefni í markmiðinu (neysla), en afurð í jöfnu 2 (myndun).',
    explanation: 'Jafna 1 + öfug jafna 2: -1676 + 824 = -852 kJ. Þetta er thermít-hvörfin!',
  },
];

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
      aria-label={`${equation.isReversed ? equation.products : equation.reactants} → ${equation.isReversed ? equation.reactants : equation.products}, ΔH = ${(equation.deltaH * equation.multiplier * (equation.isReversed ? -1 : 1)).toFixed(1)} kJ`}
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
      className={`p-4 rounded-xl border-3 cursor-pointer transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-400/50 ${
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
      <div className="text-center mb-3 font-mono">
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
      <div className="text-center mb-3">
        <span className={`font-bold ${effectiveDeltaH < 0 ? 'text-red-600' : 'text-blue-600'}`}>
          ΔH = {effectiveDeltaH > 0 ? '+' : ''}
          {effectiveDeltaH.toFixed(1)} kJ
        </span>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReverse();
          }}
          aria-label="Snúa við jöfnu"
          aria-pressed={equation.isReversed}
          className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
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
              className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
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
  onComplete: (score: number, maxScore?: number, hintsUsed?: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

export function Level2({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level2Props) {
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
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);

  const puzzle = PUZZLES[currentPuzzle];

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

  // Handle equation modifications
  const handleReverse = (id: string) => {
    setEquations((prev) =>
      prev.map((eq) => (eq.id === id ? { ...eq, isReversed: !eq.isReversed } : eq))
    );
  };

  const handleMultiply = (id: string, factor: number) => {
    setEquations((prev) => prev.map((eq) => (eq.id === id ? { ...eq, multiplier: factor } : eq)));
  };

  const toggleSelect = (id: string) => {
    setSelectedEquations((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Check solution
  const checkSolution = () => {
    const sum = calculateSelectedSum();
    const correct = Math.abs(sum - puzzle.targetDeltaH) < 0.5;

    setShowResult(true);
    setExplanation(
      correct
        ? puzzle.explanation
        : 'Ekki rétt. Athugaðu hvort þú hefur snúið við réttum jöfnum og valið rétta margfeldisstuðla.'
    );

    if (correct) {
      onCorrectAnswer?.();
      if (!completed.includes(puzzle.id)) {
        const points = showHint ? 50 : 100;
        setScore((prev) => prev + points);
        setCompleted((prev) => [...prev, puzzle.id]);
      }
    } else {
      onIncorrectAnswer?.();
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
      // Max score is 100 per puzzle × 5 puzzles = 500
      onComplete(score, 500, totalHintsUsed);
    }
  };

  const currentSum = calculateSelectedSum();
  const isCorrect = Math.abs(currentSum - puzzle.targetDeltaH) < 0.5;

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
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-green-600">
                Lögmál Hess - Stig 2
              </h1>
              <p className="text-sm text-warm-600">Þrautir - sameinaðu jöfnur</p>
            </div>

            <div className="flex gap-4 items-center">
              <button onClick={onBack} className="text-warm-600 hover:text-warm-800 text-sm">
                ← Til baka
              </button>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{score}</div>
                <div className="text-xs text-warm-600">Stig</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">
                  {completed.length}/{PUZZLES.length}
                </div>
                <div className="text-xs text-warm-600">Lokið</div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 bg-warm-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(completed.length / PUZZLES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          {/* Puzzle header */}
          <div className="mb-6">
            <div className="inline-block bg-green-100 px-4 py-2 rounded-full text-sm font-semibold text-green-800 mb-2">
              Þraut {currentPuzzle + 1}: {puzzle.title}
            </div>
            <p className="text-warm-700">{puzzle.description}</p>
          </div>

          {/* Target equation */}
          <div className="mb-6 p-4 bg-orange-50 rounded-xl border-2 border-orange-300">
            <h3 className="text-sm font-semibold text-orange-800 mb-2">🎯 Markmiðsjafna:</h3>
            <div className="text-center font-mono text-lg">
              <span className="text-blue-700">{puzzle.targetEquation.reactants}</span>
              <span className="mx-2">→</span>
              <span className="text-green-700">{puzzle.targetEquation.products}</span>
            </div>
            <div className="text-center mt-2">
              <span className="font-bold text-orange-600">ΔH = ? kJ (finndu þetta!)</span>
            </div>
          </div>

          {/* Available equations */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-warm-700 mb-3">
              📦 Tiltækar jöfnur (smelltu til að velja):
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
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

          {/* Energy Pathway Diagram */}
          {selectedEquations.length > 0 && (
            <div className="mb-6">
              <EnergyPathwayDiagram
                steps={energySteps}
                targetDeltaH={puzzle.targetDeltaH}
                isCorrect={isCorrect && showResult}
              />
            </div>
          )}

          {/* Current sum */}
          {selectedEquations.length > 0 && (
            <div
              className={`mb-6 p-4 rounded-xl border-2 ${
                showResult
                  ? isCorrect
                    ? 'bg-green-100 border-green-400'
                    : 'bg-red-100 border-red-400'
                  : 'bg-warm-100 border-warm-300'
              }`}
            >
              <h3 className="text-sm font-semibold text-warm-700 mb-2">📊 Heildar ΔH:</h3>
              <div className="text-center">
                <span
                  className={`text-2xl font-bold ${currentSum < 0 ? 'text-red-600' : 'text-blue-600'}`}
                >
                  ΔH = {currentSum > 0 ? '+' : ''}
                  {currentSum.toFixed(1)} kJ
                </span>
              </div>
              {showResult && (
                <div className={`mt-3 text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isCorrect ? '✓ Rétt!' : '✗ Ekki rétt.'} {explanation}
                </div>
              )}
            </div>
          )}

          {/* Hint */}
          {!showResult && (
            <div className="mb-6">
              {showHint ? (
                <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-xl">
                  <h4 className="font-semibold text-yellow-800 mb-2">💡 Vísbending:</h4>
                  <p className="text-yellow-900">{puzzle.hint}</p>
                </div>
              ) : (
                <button
                  onClick={handleShowHint}
                  className="text-yellow-600 hover:text-yellow-700 text-sm"
                >
                  💡 Sýna vísbendingu (-50 stig)
                </button>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => resetPuzzle(currentPuzzle)}
              className="px-6 py-3 bg-warm-200 hover:bg-warm-300 rounded-xl font-semibold transition-colors"
            >
              🔄 Byrja aftur
            </button>

            {!showResult ? (
              <button
                onClick={checkSolution}
                disabled={selectedEquations.length === 0}
                className={`flex-1 py-3 px-6 rounded-xl font-bold transition-colors ${
                  selectedEquations.length > 0
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-warm-300 text-warm-500 cursor-not-allowed'
                }`}
              >
                Athuga lausn
              </button>
            ) : (
              <button
                onClick={nextPuzzle}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                {currentPuzzle < PUZZLES.length - 1 ? 'Næsta þraut →' : 'Ljúka stigi →'}
              </button>
            )}
          </div>
        </div>

        {/* Puzzle navigation */}
        <div className="mt-6 flex justify-center gap-2">
          {PUZZLES.map((p, i) => (
            <button
              key={p.id}
              onClick={() => {
                setCurrentPuzzle(i);
                resetPuzzle(i);
              }}
              className={`w-10 h-10 rounded-full font-bold transition-colors ${
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
