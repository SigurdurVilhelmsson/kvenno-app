import { useState } from 'react';

import { FeedbackPanel } from '@shared/components';
import { shuffleArray } from '@shared/utils';

import { Molecule } from './Molecule';
import { REACTIONS } from '../data/reactions';
import type { Reaction } from '../types';
import { calculateCorrectAnswer, generateReactantCounts } from '../utils/calculations';

interface Level2Props {
  onComplete: (score: number, maxScore: number, hintsUsed: number) => void;
  onBack: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

type QuestionType = 'times' | 'products';

interface Question {
  type: QuestionType;
  reaction: Reaction;
  r1Count: number;
  r2Count: number;
}

const TOTAL = 8;
const POINTS_PER_Q = 10;
const LEVEL2_REACTIONS = REACTIONS.filter(
  (r) => (r.difficulty === 'easy' || r.difficulty === 'medium') && r.products.length === 1
);

/** Build 8 questions alternating between the two types */
function buildQuestions(): Question[] {
  const pool = shuffleArray(LEVEL2_REACTIONS);
  const questions: Question[] = [];

  for (let i = 0; i < TOTAL; i++) {
    const reaction = pool[i % pool.length];
    const { r1Count, r2Count } = generateReactantCounts(reaction.difficulty);
    const type: QuestionType = i % 2 === 0 ? 'times' : 'products';
    questions.push({ type, reaction, r1Count, r2Count });
  }
  return questions;
}

export function Level2({ onComplete, onBack, onCorrectAnswer, onIncorrectAnswer }: Level2Props) {
  const [questions] = useState(buildQuestions);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [done, setDone] = useState(false);

  const q = questions[index];
  const answer = calculateCorrectAnswer(q.reaction, q.r1Count, q.r2Count);

  const correctValue =
    q.type === 'times'
      ? answer.timesReactionRuns
      : answer.productsFormed[q.reaction.products[0].formula];

  const handleCheck = () => {
    if (answered || input.trim() === '') return;
    const num = parseFloat(input);
    const correct = num === correctValue;
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
    setInput('');
    setAnswered(false);
    setIsCorrect(false);
  };

  // --- Summary ---
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
                setInput('');
                setAnswered(false);
                setIsCorrect(false);
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

  // --- Step-by-step solution ---
  const buildSolution = (): string => {
    const r1 = q.reaction.reactant1;
    const r2 = q.reaction.reactant2;
    const p = q.reaction.products[0];

    if (q.type === 'times') {
      return (
        `${r1.formula}: ${q.r1Count} ÷ ${r1.coeff} = ${answer.timesFromR1} skipti. ` +
        `${r2.formula}: ${q.r2Count} ÷ ${r2.coeff} = ${answer.timesFromR2} skipti. ` +
        `Lægri talan er ${answer.timesReactionRuns}, svo hvorfin geta gerst ${answer.timesReactionRuns} sinnum.`
      );
    }
    return (
      `Hvorfin geta gerst ${answer.timesReactionRuns} sinnum. ` +
      `Afurðir: ${answer.timesReactionRuns} × ${p.coeff} = ${answer.productsFormed[p.formula]} ${p.formula}.`
    );
  };

  // --- Question text ---
  const questionTitle =
    q.type === 'times'
      ? 'Hversu oft getur hvarfid att ser stad?'
      : `Hversu mikid myndast af ${q.reaction.products[0].formula}?`;

  const questionHint =
    q.type === 'times'
      ? `Reiknaðu: min(${q.reaction.reactant1.formula} ÷ ${q.reaction.reactant1.coeff}, ${q.reaction.reactant2.formula} ÷ ${q.reaction.reactant2.coeff})`
      : `Hvorfin geta gerst ${answer.timesReactionRuns} sinnum. Stuðull ${q.reaction.products[0].formula} er ${q.reaction.products[0].coeff}.`;

  // --- Main gameplay ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex justify-between items-center">
            <button onClick={onBack} className="text-warm-500 hover:text-warm-700 font-semibold text-sm">
              ← Til baka
            </button>
            <h1 className="text-lg font-bold text-warm-800">Reikna afurðir – Stig 2</h1>
            <span className="text-sm font-semibold text-warm-600">{index + 1}/{TOTAL}</span>
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

        {/* Molecule counts */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="text-lg font-bold mb-2">{q.reaction.reactant1.formula}</div>
            <div className="flex flex-wrap justify-center gap-1 mb-2">
              {Array.from({ length: Math.min(q.r1Count, 8) }).map((_, i) => (
                <Molecule key={i} formula={q.reaction.reactant1.formula} color={q.reaction.reactant1.color} size={28} />
              ))}
              {q.r1Count > 8 && <span className="text-warm-500 text-sm">+{q.r1Count - 8}</span>}
            </div>
            <div className="text-sm text-warm-600">{q.r1Count} sameindur (stuðull: {q.reaction.reactant1.coeff})</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="text-lg font-bold mb-2">{q.reaction.reactant2.formula}</div>
            <div className="flex flex-wrap justify-center gap-1 mb-2">
              {Array.from({ length: Math.min(q.r2Count, 8) }).map((_, i) => (
                <Molecule key={i} formula={q.reaction.reactant2.formula} color={q.reaction.reactant2.color} size={28} />
              ))}
              {q.r2Count > 8 && <span className="text-warm-500 text-sm">+{q.r2Count - 8}</span>}
            </div>
            <div className="text-sm text-warm-600">{q.r2Count} sameindur (stuðull: {q.reaction.reactant2.coeff})</div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
          <h2 className="text-xl font-bold text-warm-800 mb-2">{questionTitle}</h2>
          <p className="text-warm-600 text-sm mb-4">{questionHint}</p>

          <div className="flex gap-3 mb-4">
            <input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
              disabled={answered}
              placeholder="Svar..."
              className="flex-1 border-2 border-warm-200 rounded-xl px-4 py-3 text-lg font-bold text-center focus:border-kvenno-orange focus:outline-none"
            />
          </div>

          {/* Athuga button above Visbending */}
          {!answered && (
            <button
              onClick={handleCheck}
              disabled={input.trim() === ''}
              className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark disabled:bg-warm-300 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Athuga
            </button>
          )}
        </div>

        {/* Feedback */}
        {answered && (
          <div className="space-y-4 mb-4">
            <FeedbackPanel
              feedback={{
                isCorrect,
                explanation: isCorrect
                  ? `Rett! ${buildSolution()}`
                  : `Rett svar: ${correctValue}. ${buildSolution()}`,
                misconception: isCorrect
                  ? undefined
                  : q.type === 'times'
                    ? 'Deildu fjolda sameinda hvarfefnis med stuðli þess. Lægri talan segir hversu oft hvorfin geta gerst.'
                    : 'Margfaldaðu fjolda skipta med stuðli AFURÐAR, ekki hvarfefnis.',
              }}
              config={{ showExplanation: true, showMisconceptions: !isCorrect }}
            />

            {/* Step-by-step solution box */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h3 className="font-bold text-blue-800 mb-2">Utreikningur:</h3>
              <div className="text-sm text-warm-700 space-y-1">
                <div>{q.reaction.reactant1.formula}: {q.r1Count} ÷ {q.reaction.reactant1.coeff} = {answer.timesFromR1} skipti</div>
                <div>{q.reaction.reactant2.formula}: {q.r2Count} ÷ {q.reaction.reactant2.coeff} = {answer.timesFromR2} skipti</div>
                <div>Takmarkandi: <strong className="text-kvenno-orange">{answer.limitingReactant}</strong> (faerri skipti)</div>
                <div>Hvorfin gerast: <strong>{answer.timesReactionRuns}</strong> sinnum</div>
                <div>
                  {q.reaction.products[0].formula} myndast: {answer.timesReactionRuns} × {q.reaction.products[0].coeff} ={' '}
                  <strong className="text-green-700">{answer.productsFormed[q.reaction.products[0].formula]}</strong>
                </div>
              </div>
            </div>

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

export default Level2;
