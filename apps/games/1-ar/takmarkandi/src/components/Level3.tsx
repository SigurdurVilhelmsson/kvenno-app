import { useState } from 'react';

import { FeedbackPanel } from '@shared/components';
import { shuffleArray } from '@shared/utils';

import { Molecule } from './Molecule';
import { REACTIONS } from '../data/reactions';
import type { Reaction } from '../types';
import { calculateCorrectAnswer, generateReactantCounts } from '../utils/calculations';

interface Level3Props {
  onComplete: (score: number) => void;
  onBack: () => void;
}

type Step = 'limiting' | 'products' | 'excess' | 'review';
interface Problem {
  reaction: Reaction;
  r1Count: number;
  r2Count: number;
}

const TOTAL = 6;
const MAX_SCORE = TOTAL * 30;
const LEVEL3_REACTIONS = REACTIONS.filter(
  (r) => r.difficulty === 'medium' || r.difficulty === 'hard'
);

function buildProblems(): Problem[] {
  const pool = shuffleArray(LEVEL3_REACTIONS);
  return Array.from({ length: TOTAL }, (_, i) => {
    const reaction = pool[i % pool.length];
    const { r1Count, r2Count } = generateReactantCounts(reaction.difficulty);
    return { reaction, r1Count, r2Count };
  });
}

/** Reusable molecule-count card */
function ReactantCard({
  formula,
  color,
  count,
  coeff,
}: {
  formula: string;
  color: string;
  count: number;
  coeff: number;
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 text-center">
      <div className="text-lg font-bold">{formula}</div>
      <div className="flex flex-wrap justify-center gap-1 my-2">
        {Array.from({ length: Math.min(count, 8) }).map((_, i) => (
          <Molecule key={i} formula={formula} color={color} size={26} />
        ))}
        {count > 8 && <span className="text-warm-500 text-xs">+{count - 8}</span>}
      </div>
      <div className="text-sm text-warm-600">
        {count} sameindur (stuðull: {coeff})
      </div>
    </div>
  );
}

export function Level3({ onComplete, onBack }: Level3Props) {
  const [problems] = useState(buildProblems);
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState<Step>('limiting');
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [selectedLimiting, setSelectedLimiting] = useState<string | null>(null);
  const [productInput, setProductInput] = useState('');
  const [excessInput, setExcessInput] = useState('');
  const [stepAnswered, setStepAnswered] = useState(false);
  const [stepCorrect, setStepCorrect] = useState(false);
  const [problemScore, setProblemScore] = useState(0);

  const prob = problems[index];
  const ans = calculateCorrectAnswer(prob.reaction, prob.r1Count, prob.r2Count);
  const product = prob.reaction.products[0];
  const r1 = prob.reaction.reactant1;
  const r2 = prob.reaction.reactant2;

  const resetProblemState = () => {
    setStep('limiting');
    setSelectedLimiting(null);
    setProductInput('');
    setExcessInput('');
    setStepAnswered(false);
    setStepCorrect(false);
    setProblemScore(0);
  };

  const handleCheck = () => {
    if (stepAnswered) return;
    let correct = false;
    if (step === 'limiting') correct = selectedLimiting === ans.limitingReactant;
    else if (step === 'products')
      correct = parseInt(productInput) === ans.productsFormed[product.formula];
    else if (step === 'excess') correct = parseInt(excessInput) === ans.excessRemaining;

    setStepCorrect(correct);
    setStepAnswered(true);
    if (correct) {
      setScore((s) => s + 10);
      setProblemScore((s) => s + 10);
    }
  };

  const nextStep = () => {
    setStepAnswered(false);
    setStepCorrect(false);
    if (step === 'limiting') setStep('products');
    else if (step === 'products') setStep('excess');
    else setStep('review');
  };

  const retryStep = () => {
    setStepAnswered(false);
    setStepCorrect(false);
    if (step === 'limiting') setSelectedLimiting(null);
    else if (step === 'products') setProductInput('');
    else if (step === 'excess') setExcessInput('');
  };

  const nextProblem = () => {
    if (index + 1 >= TOTAL) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    resetProblemState();
  };

  const feedbackForStep = (): { explanation: string; misconception?: string } => {
    if (step === 'limiting')
      return {
        explanation: stepCorrect
          ? `Rett! ${ans.limitingReactant} er takmarkandi hvarfefnid.`
          : `Rett svar: ${ans.limitingReactant}. ${r1.formula}: ${ans.timesFromR1} skipti, ${r2.formula}: ${ans.timesFromR2} skipti.`,
        misconception: stepCorrect
          ? undefined
          : 'Berðu saman fjolda deilt med stuðli. Lægri talan segir hvad er takmarkandi.',
      };
    if (step === 'products') {
      const exp = ans.productsFormed[product.formula];
      return {
        explanation: stepCorrect
          ? `Rett! ${ans.timesReactionRuns} × ${product.coeff} = ${exp}.`
          : `Rett svar: ${exp}. ${ans.timesReactionRuns} × ${product.coeff} = ${exp}.`,
        misconception: stepCorrect ? undefined : 'Margfaldaðu fjolda skipta med stuðli afurðar.',
      };
    }
    return {
      explanation: stepCorrect
        ? `Rett! ${ans.excessRemaining} ${ans.excessReactant} verða eftir.`
        : `Rett svar: ${ans.excessRemaining}. Upphaf - notad = ${ans.excessRemaining}.`,
      misconception: stepCorrect
        ? undefined
        : 'Afgangur = upphaflegur fjoldi - (fjoldi skipta × stuðull).',
    };
  };

  // --- Summary ---
  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
          <div className="text-5xl">{score >= 140 ? '🎉' : score >= 90 ? '👍' : '📚'}</div>
          <h2 className="text-2xl font-bold text-warm-800">Niðurstöður</h2>
          <p className="text-lg text-warm-700">
            Þú fékkst <span className="font-bold text-kvenno-orange">{score}</span> af{' '}
            <span className="font-bold">{MAX_SCORE}</span> stigum
          </p>
          <div className="h-3 bg-warm-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-kvenno-orange transition-all duration-700"
              style={{ width: `${(score / MAX_SCORE) * 100}%` }}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setIndex(0);
                setScore(0);
                resetProblemState();
                setDone(false);
              }}
              className="flex-1 bg-warm-200 hover:bg-warm-300 text-warm-800 font-bold py-3 rounded-xl transition-colors"
            >
              Reyna aftur
            </button>
            <button
              onClick={() => onComplete(score)}
              className="flex-1 bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
            >
              Ljuka stigi
            </button>
          </div>
          <button onClick={onBack} className="text-warm-500 hover:text-warm-700 text-sm">
            Til baka i valmynd
          </button>
        </div>
      </div>
    );
  }

  // --- Review screen ---
  if (step === 'review') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{problemScore === 30 ? '✅' : '📝'}</div>
              <h2 className="text-xl font-bold text-warm-800">
                {problemScore === 30 ? 'Fullkomid!' : 'Verkefni lokid'}
              </h2>
              <p className="text-warm-600 text-sm">{problemScore}/30 stig</p>
            </div>
            <div className="bg-warm-50 rounded-xl p-4 mb-4">
              <h3 className="font-bold text-warm-800 mb-3">Utreikningur:</h3>
              <div className="text-center text-lg font-mono bg-white p-2 rounded-lg mb-3">
                {prob.reaction.equation}
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>{r1.formula}:</span>
                  <span>
                    {prob.r1Count} ÷ {r1.coeff} = <strong>{ans.timesFromR1}</strong>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{r2.formula}:</span>
                  <span>
                    {prob.r2Count} ÷ {r2.coeff} = <strong>{ans.timesFromR2}</strong>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Takmarkandi:</span>
                  <strong className="text-kvenno-orange">{ans.limitingReactant}</strong>
                </div>
                <div className="flex justify-between">
                  <span>{product.formula} myndast:</span>
                  <strong className="text-green-700">{ans.productsFormed[product.formula]}</strong>
                </div>
                <div className="flex justify-between">
                  <span>{ans.excessReactant} eftir:</span>
                  <strong className="text-blue-700">{ans.excessRemaining}</strong>
                </div>
              </div>
            </div>
            <button
              onClick={nextProblem}
              className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
            >
              {index + 1 < TOTAL ? 'Naesta verkefni →' : 'Sja nidurstodur →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Helpers ---
  const stepNumber = step === 'limiting' ? 1 : step === 'products' ? 2 : 3;
  const limitingBtnCls = (formula: string) => {
    const sel = selectedLimiting === formula;
    const right = ans.limitingReactant === formula;
    if (stepAnswered && sel)
      return right ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50';
    if (stepAnswered && right) return 'border-green-500 bg-green-50';
    if (sel) return 'border-kvenno-orange bg-orange-50';
    return 'border-warm-200 hover:border-orange-300 hover:bg-orange-50';
  };

  // --- Main gameplay ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-4">
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
            <h1 className="text-lg font-bold text-warm-800">Heildarverkefni – Stig 3</h1>
            <span className="text-sm font-semibold text-warm-600">
              {index + 1}/{TOTAL}
            </span>
          </div>
          <div className="mt-3 h-2 bg-warm-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-kvenno-orange progress-fill"
              style={{ width: `${((index + 1) / TOTAL) * 100}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-warm-500">
            <span>Skref {stepNumber}/3</span>
            <span>{score} stig</span>
          </div>
        </div>

        {/* Equation */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="text-center text-xl font-mono bg-warm-50 p-3 rounded-lg">
            {prob.reaction.equation}
          </div>
        </div>

        {/* Molecule counts */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <ReactantCard
            formula={r1.formula}
            color={r1.color}
            count={prob.r1Count}
            coeff={r1.coeff}
          />
          <ReactantCard
            formula={r2.formula}
            color={r2.color}
            count={prob.r2Count}
            coeff={r2.coeff}
          />
        </div>

        {/* Sub-question */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
          {step === 'limiting' && (
            <>
              <h2 className="text-xl font-bold text-warm-800 mb-2">
                1. Hvort er takmarkandi hvarfefnid?
              </h2>
              <p className="text-warm-600 text-sm mb-4">Hvort hvarfefnid eydist fyrst?</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[r1.formula, r2.formula].map((f) => (
                  <button
                    key={f}
                    onClick={() => !stepAnswered && setSelectedLimiting(f)}
                    disabled={stepAnswered}
                    className={`p-4 rounded-xl border-4 font-bold text-lg transition-all ${limitingBtnCls(f)}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 'products' && (
            <>
              <h2 className="text-xl font-bold text-warm-800 mb-2">
                2. Hversu margar {product.formula} myndast?
              </h2>
              <p className="text-warm-600 text-sm mb-4">
                Stuðull {product.formula} er {product.coeff}.
              </p>
              <input
                type="number"
                value={productInput}
                onChange={(e) => setProductInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                disabled={stepAnswered}
                placeholder="Fjoldi..."
                className="w-full border-2 border-warm-200 rounded-xl px-4 py-3 text-lg font-bold text-center mb-4 focus:border-kvenno-orange focus:outline-none"
              />
            </>
          )}
          {step === 'excess' && (
            <>
              <h2 className="text-xl font-bold text-warm-800 mb-2">
                3. Hversu margar {ans.excessReactant} verða eftir?
              </h2>
              <p className="text-warm-600 text-sm mb-4">
                Reiknaðu afganginn af {ans.excessReactant}.
              </p>
              <input
                type="number"
                value={excessInput}
                onChange={(e) => setExcessInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                disabled={stepAnswered}
                placeholder="Afgangur..."
                className="w-full border-2 border-warm-200 rounded-xl px-4 py-3 text-lg font-bold text-center mb-4 focus:border-kvenno-orange focus:outline-none"
              />
            </>
          )}
          {!stepAnswered && (
            <button
              onClick={handleCheck}
              disabled={
                (step === 'limiting' && !selectedLimiting) ||
                (step === 'products' && !productInput.trim()) ||
                (step === 'excess' && !excessInput.trim())
              }
              className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark disabled:bg-warm-300 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Athuga
            </button>
          )}
        </div>

        {/* Feedback */}
        {stepAnswered && (
          <div className="space-y-4 mb-4">
            <FeedbackPanel
              feedback={{ isCorrect: stepCorrect, ...feedbackForStep() }}
              config={{ showExplanation: true, showMisconceptions: !stepCorrect }}
            />
            <div className="flex gap-3">
              {!stepCorrect && (
                <button
                  onClick={retryStep}
                  className="flex-1 bg-warm-200 hover:bg-warm-300 text-warm-800 font-bold py-3 rounded-xl transition-colors"
                >
                  Reyna aftur
                </button>
              )}
              <button
                onClick={nextStep}
                className="flex-1 bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
              >
                {step === 'excess' ? 'Sja utreikninginn →' : 'Naesta skref →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Level3;
