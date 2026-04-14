import { useState } from 'react';

import { FeedbackPanel } from '@shared/components';

import { CalculationBreakdown } from './CalculationBreakdown';
import { PeriodicTable } from './PeriodicTable';
import { COMPOUNDS, type Compound } from '../data/compounds';

/** Fisher-Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

interface Level1Props {
  onBack: () => void;
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

/** Pick 4 easy + 4 medium + 2 hard, shuffled */
function selectProblems(): Compound[] {
  const easy = pickRandom(
    COMPOUNDS.filter((c) => c.difficulty === 'easy'),
    4
  );
  const medium = pickRandom(
    COMPOUNDS.filter((c) => c.difficulty === 'medium'),
    4
  );
  const hard = pickRandom(
    COMPOUNDS.filter((c) => c.difficulty === 'hard'),
    2
  );
  return shuffle([...easy, ...medium, ...hard]);
}

function getTolerance(difficulty: Compound['difficulty']): number {
  if (difficulty === 'easy') return 0.5;
  if (difficulty === 'medium') return 1.0;
  return 2.0;
}

const TOTAL = 10;

export function Level1({ onBack, onComplete }: Level1Props) {
  const [problems, setProblems] = useState<Compound[]>(selectProblems);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showPeriodicTable, setShowPeriodicTable] = useState(false);
  const [done, setDone] = useState(false);

  const compound = problems[index];

  const handleSubmit = () => {
    const value = parseFloat(input.replace(',', '.'));
    if (isNaN(value)) return;
    const tolerance = getTolerance(compound.difficulty);
    const correct = Math.abs(value - compound.molarMass) <= tolerance;
    setIsCorrect(correct);
    if (correct) setCorrectCount((prev) => prev + 1);
    setAnswered(true);
  };

  const handleNext = () => {
    if (index + 1 >= TOTAL) {
      setDone(true);
      return;
    }
    setIndex((prev) => prev + 1);
    setInput('');
    setAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
  };

  const handleRetry = () => {
    setProblems(selectProblems());
    setIndex(0);
    setInput('');
    setCorrectCount(0);
    setHintsUsed(0);
    setAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
    setDone(false);
  };

  // --- Summary screen ---
  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
          <div className="text-5xl">
            {correctCount >= 7 ? '🎉' : correctCount >= 4 ? '👍' : '📚'}
          </div>
          <h2 className="text-2xl font-bold text-warm-800">Niðurstöður</h2>
          <p className="text-lg text-warm-700">
            Þú svaraðir <span className="font-bold text-kvenno-orange">{correctCount}</span> af{' '}
            <span className="font-bold">{TOTAL}</span> rétt
          </p>
          <div className="h-3 bg-warm-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-kvenno-orange transition-all duration-700"
              style={{ width: `${(correctCount / TOTAL) * 100}%` }}
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
              onClick={() => onComplete(correctCount, TOTAL, hintsUsed)}
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
            <h1 className="text-lg font-bold text-warm-800">Mólmassi – Stig 1</h1>
            <span className="text-sm font-semibold text-warm-600">
              {index + 1}/{TOTAL}
            </span>
          </div>
          <div className="mt-3 h-2 bg-warm-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-kvenno-orange transition-all duration-500"
              style={{ width: `${((index + 1) / TOTAL) * 100}%` }}
            />
          </div>
        </div>

        {/* Compound card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4 text-center" key={index}>
          <p className="text-sm text-warm-500 mb-1">Reiknaðu mólmassa:</p>
          <div className="text-5xl font-bold text-warm-800 mb-2">{compound.formula}</div>
          <p className="text-warm-600">{compound.name}</p>
          <span
            className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${
              compound.difficulty === 'easy'
                ? 'bg-green-100 text-green-700'
                : compound.difficulty === 'medium'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
            }`}
          >
            {compound.difficulty === 'easy'
              ? 'Auðvelt'
              : compound.difficulty === 'medium'
                ? 'Miðlungs'
                : 'Erfitt'}{' '}
            (±{getTolerance(compound.difficulty)} g/mol)
          </span>
        </div>

        {/* Input area */}
        {!answered && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-4">
            <label className="block text-sm font-medium text-warm-700 mb-2">Svar (g/mol):</label>
            <div className="flex gap-3">
              <input
                type="number"
                step="0.01"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="t.d. 18.02"
                className="flex-1 px-4 py-3 border-2 border-warm-300 rounded-xl focus:border-kvenno-orange focus:outline-none text-lg font-mono"
                autoFocus
              />
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="bg-kvenno-orange hover:bg-kvenno-orange-dark disabled:opacity-40 text-white font-bold px-6 py-3 rounded-xl transition-colors"
              >
                Athuga
              </button>
            </div>
          </div>
        )}

        {/* Toolbar: periodic table + hint */}
        {!answered && (
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setShowPeriodicTable(true)}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
            >
              Lotukerfið
            </button>
            {!showHint && (
              <button
                onClick={() => {
                  setShowHint(true);
                  setHintsUsed((prev) => prev + 1);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
              >
                Vísbending
              </button>
            )}
          </div>
        )}

        {/* Hint */}
        {showHint && !answered && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-4 text-sm text-yellow-800">
            <span className="font-bold">Vísbending:</span> Algeng atómmassi – H≈1, C≈12, N≈14, O≈16,
            Na≈23, S≈32, Cl≈35.5, K≈39, Ca≈40
          </div>
        )}

        {/* Feedback + breakdown */}
        {answered && (
          <div className="space-y-4 mb-4">
            <FeedbackPanel
              feedback={{
                isCorrect,
                explanation: isCorrect
                  ? `Rétt! Mólmassi ${compound.name} er ${compound.molarMass.toFixed(3)} g/mol.`
                  : `Rangt. Rétt svar er ${compound.molarMass.toFixed(3)} g/mol. Sjáðu útreikninginn hér að neðan.`,
              }}
              config={{ showExplanation: true }}
            />

            <CalculationBreakdown compound={compound} />

            <button
              onClick={handleNext}
              className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
            >
              {index + 1 < TOTAL ? 'Næsta dæmi →' : 'Sjá niðurstöður →'}
            </button>
          </div>
        )}
      </div>

      {/* Periodic table modal */}
      {showPeriodicTable && (
        <PeriodicTable
          onClose={() => setShowPeriodicTable(false)}
          showApproximate={true}
          highlightElements={compound.elements.map((e) => e.symbol)}
        />
      )}
    </div>
  );
}

export default Level1;
