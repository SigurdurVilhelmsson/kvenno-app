import { useState } from 'react';

import { FORMATION_ENTHALPIES, checkAnswer as checkAnswerTolerance } from '../utils/hess-calculations';

interface Level3Props {
  t: (key: string, fallback?: string) => string;
  onComplete: (score: number, maxScore?: number, hintsUsed?: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

interface Challenge {
  id: number;
  titleKey: string;
  descKey: string;
  type: 'calculate' | 'reverse' | 'compare';
  equation: string;
  reactants: { formula: string; coefficient: number; deltaHf: number }[];
  products: { formula: string; coefficient: number; deltaHf: number }[];
  correctAnswer: number;
  unit: string;
  hintKey: string;
  explanationKey: string;
  unknownCompound?: string;
  givenDeltaHrxn?: number;
}

const challenges: Challenge[] = [
  {
    id: 1,
    titleKey: 'level3.c1title',
    descKey: 'level3.c1desc',
    type: 'calculate',
    equation: 'CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(l)',
    reactants: [
      { formula: 'CH4(g)', coefficient: 1, deltaHf: -74.8 },
      { formula: 'O2(g)', coefficient: 2, deltaHf: 0 },
    ],
    products: [
      { formula: 'CO2(g)', coefficient: 1, deltaHf: -393.5 },
      { formula: 'H2O(l)', coefficient: 2, deltaHf: -285.8 },
    ],
    correctAnswer: -890.3,
    unit: 'kJ/mol',
    hintKey: 'level3.c1hint',
    explanationKey: 'level3.c1explanation',
  },
  {
    id: 2,
    titleKey: 'level3.c2title',
    descKey: 'level3.c2desc',
    type: 'calculate',
    equation: 'N₂(g) + 3H₂(g) → 2NH₃(g)',
    reactants: [
      { formula: 'N2(g)', coefficient: 1, deltaHf: 0 },
      { formula: 'H2(g)', coefficient: 3, deltaHf: 0 },
    ],
    products: [
      { formula: 'NH3(g)', coefficient: 2, deltaHf: -46.1 },
    ],
    correctAnswer: -92.2,
    unit: 'kJ/mol',
    hintKey: 'level3.c2hint',
    explanationKey: 'level3.c2explanation',
  },
  {
    id: 3,
    titleKey: 'level3.c3title',
    descKey: 'level3.c3desc',
    type: 'calculate',
    equation: 'CaCO₃(s) → CaO(s) + CO₂(g)',
    reactants: [
      { formula: 'CaCO3(s)', coefficient: 1, deltaHf: -1206.9 },
    ],
    products: [
      { formula: 'CaO(s)', coefficient: 1, deltaHf: -635.1 },
      { formula: 'CO2(g)', coefficient: 1, deltaHf: -393.5 },
    ],
    correctAnswer: 178.3,
    unit: 'kJ/mol',
    hintKey: 'level3.c3hint',
    explanationKey: 'level3.c3explanation',
  },
  {
    id: 4,
    titleKey: 'level3.c4title',
    descKey: 'level3.c4desc',
    type: 'reverse',
    equation: 'S(s) + O₂(g) → SO₂(g)',
    reactants: [
      { formula: 'S(s)', coefficient: 1, deltaHf: 0 },
      { formula: 'O2(g)', coefficient: 1, deltaHf: 0 },
    ],
    products: [
      { formula: 'SO2(g)', coefficient: 1, deltaHf: -296.8 },
    ],
    unknownCompound: 'SO2(g)',
    givenDeltaHrxn: -296.8,
    correctAnswer: -296.8,
    unit: 'kJ/mol',
    hintKey: 'level3.c4hint',
    explanationKey: 'level3.c4explanation',
  },
  {
    id: 5,
    titleKey: 'level3.c5title',
    descKey: 'level3.c5desc',
    type: 'calculate',
    equation: 'C₂H₅OH(l) + 3O₂(g) → 2CO₂(g) + 3H₂O(l)',
    reactants: [
      { formula: 'C2H5OH(l)', coefficient: 1, deltaHf: -277.7 },
      { formula: 'O2(g)', coefficient: 3, deltaHf: 0 },
    ],
    products: [
      { formula: 'CO2(g)', coefficient: 2, deltaHf: -393.5 },
      { formula: 'H2O(l)', coefficient: 3, deltaHf: -285.8 },
    ],
    correctAnswer: -1366.7,
    unit: 'kJ/mol',
    hintKey: 'level3.c5hint',
    explanationKey: 'level3.c5explanation',
  },
  {
    id: 6,
    titleKey: 'level3.c6title',
    descKey: 'level3.c6desc',
    type: 'calculate',
    equation: '2Al(s) + Fe₂O₃(s) → Al₂O₃(s) + 2Fe(s)',
    reactants: [
      { formula: 'Al(s)', coefficient: 2, deltaHf: 0 },
      { formula: 'Fe2O3(s)', coefficient: 1, deltaHf: -824.2 },
    ],
    products: [
      { formula: 'Al2O3(s)', coefficient: 1, deltaHf: -1675.7 },
      { formula: 'Fe(s)', coefficient: 2, deltaHf: 0 },
    ],
    correctAnswer: -851.5,
    unit: 'kJ/mol',
    hintKey: 'level3.c6hint',
    explanationKey: 'level3.c6explanation',
  }
];

export function Level3({ t, onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level3Props) {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showTable, setShowTable] = useState(false);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);

  const challenge = challenges[currentChallenge];

  const checkAnswer = () => {
    const userNum = parseFloat(userAnswer);
    const correct = checkAnswerTolerance(userNum, challenge.correctAnswer);

    setIsCorrect(correct);
    if (correct) {
      onCorrectAnswer?.();
      if (!showHint) {
        setScore(prev => prev + 20);
      } else {
        setScore(prev => prev + 10);
      }
    } else {
      onIncorrectAnswer?.();
    }
    setShowExplanation(true);
  };

  const handleShowHint = () => {
    setShowHint(true);
    setTotalHintsUsed(prev => prev + 1);
  };

  const nextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(prev => prev + 1);
      setUserAnswer('');
      setShowHint(false);
      setShowExplanation(false);
      setIsCorrect(null);
    } else {
      // Max score is 20 per challenge × 6 challenges = 120
      onComplete(score, 120, totalHintsUsed);
    }
  };

  // Calculate products sum for display
  const productsSum = challenge.products.reduce(
    (sum, p) => sum + p.coefficient * p.deltaHf,
    0
  );

  // Calculate reactants sum for display
  const reactantsSum = challenge.reactants.reduce(
    (sum, r) => sum + r.coefficient * r.deltaHf,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="text-warm-600 hover:text-warm-800 flex items-center gap-2"
          >
            <span>&larr;</span> {t('common.back')}
          </button>
          <div className="text-right">
            <div className="text-sm text-warm-600">{t('levels.level3.name')} / {currentChallenge + 1} / {challenges.length}</div>
            <div className="text-lg font-bold text-purple-600">{score} {t('progress.points')}</div>
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
          <h2 className="text-2xl font-bold text-purple-800 mb-2">
            {t(challenge.titleKey)}
          </h2>
          <p className="text-warm-600 mb-6">{t(challenge.descKey)}</p>

          {/* Chemical equation display */}
          <div className="bg-purple-50 p-4 rounded-xl mb-6">
            <div className="text-center font-mono text-xl">
              {challenge.equation}
            </div>
          </div>

          {/* Toggle formation enthalpy table */}
          <button
            onClick={() => setShowTable(!showTable)}
            className="mb-4 text-purple-600 hover:text-purple-800 underline text-sm"
          >
            {showTable ? t('level3.hideTable') : t('level3.showTable')}
          </button>

          {/* Formation enthalpy table */}
          {showTable && (
            <div className="bg-warm-50 p-4 rounded-xl mb-6 max-h-64 overflow-y-auto">
              <h3 className="font-bold text-warm-700 mb-3">{t('level3.tableTitle')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {Object.entries(FORMATION_ENTHALPIES)
                  .filter(([formula]) =>
                    challenge.reactants.some(r => r.formula === formula) ||
                    challenge.products.some(p => p.formula === formula)
                  )
                  .map(([formula, { value, name }]) => (
                    <div key={formula} className="bg-white p-2 rounded border">
                      <div className="font-mono font-bold">{formula}</div>
                      <div className="text-warm-600 text-xs">{name}</div>
                      <div className={`font-bold ${value < 0 ? 'text-blue-600' : value > 0 ? 'text-red-600' : 'text-warm-600'}`}>
                        {value} kJ/mol
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Calculation workspace */}
          <div className="bg-warm-50 p-4 rounded-xl mb-6">
            <h3 className="font-bold text-warm-700 mb-3">{t('level3.calculation')}</h3>

            {/* Formula reminder */}
            <div className="bg-white p-3 rounded-lg border border-purple-200 mb-4">
              <p className="font-mono text-sm text-center text-purple-800">
                ΔH°<sub>rxn</sub> = Σ(n × ΔH°<sub>f</sub> {t('level3.products').replace(':', '')}) - Σ(n × ΔH°<sub>f</sub> {t('level3.reactants').replace(':', '')})
              </p>
            </div>

            {/* Products calculation */}
            <div className="mb-4">
              <div className="font-semibold text-green-700 mb-2">{t('level3.products')}</div>
              <div className="space-y-1 text-sm font-mono">
                {challenge.products.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span>{p.coefficient} × ΔH°f({p.formula}) = {p.coefficient} × ({p.deltaHf}) = </span>
                    <span className="font-bold">{(p.coefficient * p.deltaHf).toFixed(1)} kJ</span>
                  </div>
                ))}
                <div className="border-t pt-1 font-bold">
                  {t('level3.totalProducts')} {productsSum.toFixed(1)} kJ
                </div>
              </div>
            </div>

            {/* Reactants calculation */}
            <div className="mb-4">
              <div className="font-semibold text-blue-700 mb-2">{t('level3.reactants')}</div>
              <div className="space-y-1 text-sm font-mono">
                {challenge.reactants.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span>{r.coefficient} × ΔH°f({r.formula}) = {r.coefficient} × ({r.deltaHf}) = </span>
                    <span className="font-bold">{(r.coefficient * r.deltaHf).toFixed(1)} kJ</span>
                  </div>
                ))}
                <div className="border-t pt-1 font-bold">
                  {t('level3.totalReactants')} {reactantsSum.toFixed(1)} kJ
                </div>
              </div>
            </div>
          </div>

          {/* Answer input */}
          <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-warm-700 mb-2">
                {challenge.type === 'reverse'
                  ? `ΔH°f(${challenge.unknownCompound}) = `
                  : 'ΔH°rxn = '}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="flex-1 p-3 border-2 border-warm-300 rounded-xl focus:border-purple-500 focus:outline-none text-lg font-mono"
                  placeholder={t('level3.placeholder')}
                  disabled={isCorrect !== null}
                />
                <span className="flex items-center text-warm-600 font-mono">
                  {challenge.unit}
                </span>
              </div>
            </div>

            {isCorrect === null && (
              <button
                onClick={checkAnswer}
                disabled={!userAnswer}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-warm-300 text-white font-bold py-3 px-8 rounded-xl transition-colors"
              >
                {t('level3.check')}
              </button>
            )}
          </div>

          {/* Hint button */}
          {isCorrect === null && !showHint && (
            <button
              onClick={handleShowHint}
              className="text-purple-600 hover:text-purple-800 text-sm underline mb-4"
            >
              {t('level3.showHint')}
            </button>
          )}

          {showHint && !showExplanation && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-4">
              <span className="font-bold text-yellow-800">{t('level3.hintLabel')} </span>
              <span className="text-yellow-900">{t(challenge.hintKey)}</span>
            </div>
          )}

          {/* Result feedback */}
          {isCorrect !== null && (
            <div className={`p-4 rounded-xl mb-4 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className={`font-bold text-lg mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? t('common.correct') : t('common.incorrect')}
              </div>
              <div className={`font-mono ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {t('level3.correctAnswer')} {challenge.correctAnswer} {challenge.unit}
              </div>
            </div>
          )}

          {/* Explanation */}
          {showExplanation && (
            <div className="bg-purple-50 p-4 rounded-xl mb-6">
              <div className="font-bold text-purple-800 mb-2">{t('level3.explanationLabel')}</div>
              <div className="text-purple-900 font-mono text-sm">
                {t(challenge.explanationKey)}
              </div>
            </div>
          )}

          {/* Next button */}
          {isCorrect !== null && (
            <button
              onClick={nextChallenge}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              {currentChallenge < challenges.length - 1 ? t('level3.nextChallenge') : t('level3.completeLevel')}
            </button>
          )}
        </div>

        {/* Key concepts reminder */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-warm-700 mb-2">{t('level3.keyPoints')}</h3>
          <ul className="text-sm text-warm-600 space-y-1">
            <li>• {t('level3.keyPoint1')}</li>
            <li>• {t('level3.keyPoint2')}</li>
            <li>• {t('level3.keyPoint3')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
