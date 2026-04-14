import { useState } from 'react';

import { FeedbackPanel } from '@shared/components';
import { shuffleArray } from '@shared/utils';

import { Molecule } from './Molecule';
import { ReactionAnimation } from './ReactionAnimation';
import { REACTIONS } from '../data/reactions';
import type { Reaction } from '../types';

interface Level1Props {
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

interface Question {
  reaction: Reaction;
  r1Count: number;
  r2Count: number;
}

const TOTAL = 8;
const POINTS_PER_Q = 10;

/** Pick 8 questions from easy reactions with clear limiting reactants */
function buildQuestions(): Question[] {
  const easy = REACTIONS.filter((r) => r.difficulty === 'easy');
  const pool = shuffleArray(easy);
  const questions: Question[] = [];

  for (let i = 0; i < TOTAL; i++) {
    const reaction = pool[i % pool.length];
    const c1 = reaction.reactant1.coeff;
    const c2 = reaction.reactant2.coeff;

    // Alternate which reactant is limiting
    let r1Count: number, r2Count: number;
    if (i % 2 === 0) {
      r1Count = c1 * 2;
      r2Count = c2 * 4;
    } else {
      r1Count = c1 * 4;
      r2Count = c2 * 2;
    }
    questions.push({ reaction, r1Count, r2Count });
  }
  return questions;
}

export function Level1({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level1Props) {
  const [questions] = useState(buildQuestions);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [done, setDone] = useState(false);

  const q = questions[index];
  const timesR1 = q.r1Count / q.reaction.reactant1.coeff;
  const timesR2 = q.r2Count / q.reaction.reactant2.coeff;
  const limiting = timesR1 <= timesR2 ? q.reaction.reactant1.formula : q.reaction.reactant2.formula;

  const handleSelect = (formula: string) => {
    if (answered) return;
    setSelected(formula);
    const correct = formula === limiting;
    setIsCorrect(correct);
    setAnswered(true);
    if (correct) {
      setScore((s) => s + POINTS_PER_Q);
      onCorrectAnswer?.();
    } else {
      onIncorrectAnswer?.();
    }
  };

  const handleNext = () => {
    if (index + 1 >= TOTAL) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setAnswered(false);
    setIsCorrect(false);
    setSelected(null);
    setShowAnimation(false);
  };

  // --- Summary screen ---
  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
          <div className="text-5xl">{score >= 60 ? '🎉' : score >= 40 ? '👍' : '📚'}</div>
          <h2 className="text-2xl font-bold text-warm-800">Niðurstöður</h2>
          <p className="text-lg text-warm-700">
            Þú fékkst <span className="font-bold text-kvenno-orange">{score}</span> af{' '}
            <span className="font-bold">{TOTAL * POINTS_PER_Q}</span> stigum
          </p>
          <div className="h-3 bg-warm-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-kvenno-orange transition-all duration-700"
              style={{ width: `${(score / (TOTAL * POINTS_PER_Q)) * 100}%` }}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setIndex(0);
                setScore(0);
                setAnswered(false);
                setIsCorrect(false);
                setSelected(null);
                setShowAnimation(false);
                setDone(false);
              }}
              className="flex-1 bg-warm-200 hover:bg-warm-300 text-warm-800 font-bold py-3 rounded-xl transition-colors"
            >
              Reyna aftur
            </button>
            <button
              onClick={() => onComplete(score, TOTAL * POINTS_PER_Q, 0)}
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

  // --- Reactant button helper ---
  const reactantBtn = (
    reactant: { formula: string; coeff: number; color: string },
    count: number
  ) => {
    const isSelected = selected === reactant.formula;
    const isAnswer = limiting === reactant.formula;
    let border = 'border-warm-200 hover:border-orange-300 hover:bg-orange-50';
    if (answered && isSelected) {
      border = isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50';
    } else if (answered && isAnswer) {
      border = 'border-green-500 bg-green-50';
    }

    return (
      <button
        key={reactant.formula}
        onClick={() => handleSelect(reactant.formula)}
        disabled={answered}
        className={`p-6 rounded-xl border-4 transition-all ${border}`}
      >
        <div className="text-center mb-3">
          <div className="text-2xl font-bold">{reactant.formula}</div>
          <div className="text-sm text-warm-600">{count} sameindur</div>
          <div className="text-xs text-warm-500">Studull: {reactant.coeff}</div>
        </div>
        <div className="flex flex-wrap justify-center gap-1">
          {Array.from({ length: Math.min(count, 8) }).map((_, i) => (
            <Molecule key={i} formula={reactant.formula} color={reactant.color} size={30} />
          ))}
          {count > 8 && <span className="text-warm-500 text-sm">+{count - 8}</span>}
        </div>
      </button>
    );
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
            <h1 className="text-lg font-bold text-warm-800">Sjonraen greining – Stig 1</h1>
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
        </div>

        {/* Equation */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="text-center text-xl font-mono bg-warm-50 p-3 rounded-lg">
            {q.reaction.equation}
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
          <h2 className="text-xl font-bold text-warm-800 mb-2">Hvort hvarfefnid eydist fyrst?</h2>
          <p className="text-warm-600 mb-6">
            Skoðaðu stuðlana og fjolda sameinda. Hvort hvarfefnid mun klarast fyrst?
          </p>

          <div className="grid grid-cols-2 gap-4">
            {reactantBtn(q.reaction.reactant1, q.r1Count)}
            {reactantBtn(q.reaction.reactant2, q.r2Count)}
          </div>
        </div>

        {/* Feedback */}
        {answered && (
          <div className="space-y-4 mb-4">
            <FeedbackPanel
              feedback={{
                isCorrect,
                explanation: isCorrect
                  ? `Rett! ${q.reaction.reactant1.formula}: ${q.r1Count}÷${q.reaction.reactant1.coeff}=${timesR1} skipti. ${q.reaction.reactant2.formula}: ${q.r2Count}÷${q.reaction.reactant2.coeff}=${timesR2} skipti. ${limiting} eydist fyrst.`
                  : `Rett svar: ${limiting}. ${q.reaction.reactant1.formula}: ${q.r1Count}÷${q.reaction.reactant1.coeff}=${timesR1}. ${q.reaction.reactant2.formula}: ${q.r2Count}÷${q.reaction.reactant2.coeff}=${timesR2}.`,
                misconception: isCorrect
                  ? undefined
                  : 'Þad er ekki alltaf þad sem er minna af — stuðlarnir skipta mali.',
              }}
              config={{ showExplanation: true, showMisconceptions: !isCorrect }}
            />

            {/* Optional animation toggle */}
            <button
              onClick={() => setShowAnimation(!showAnimation)}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                showAnimation
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              {showAnimation ? 'Fela hreyfimynd' : 'Sja hvorfin i hreyfimynd'}
            </button>

            {showAnimation && (
              <ReactionAnimation
                reactant1={q.reaction.reactant1}
                reactant2={q.reaction.reactant2}
                products={q.reaction.products}
                r1Count={q.r1Count}
                r2Count={q.r2Count}
                showResult
                autoPlay={false}
              />
            )}

            <button
              onClick={handleNext}
              className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
            >
              {index + 1 < TOTAL ? 'Naesta spurning →' : 'Sja nidurstodur →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Level1;
