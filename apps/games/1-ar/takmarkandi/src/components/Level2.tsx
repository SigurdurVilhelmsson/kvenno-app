import { useEffect, useRef, useState } from 'react';

import { FeedbackPanel } from '@shared/components';
import {
  isPhone,
  revealSpan,
  shuffleArray,
  useArmedAfter,
  useItemTop,
  useRevealAfterCommit,
  useScreenTop,
} from '@shared/utils';

import { Molecule } from './Molecule';
import { REACTIONS } from '../data/reactions';
import type { Reaction } from '../types';
import { calculateCorrectAnswer, generateReactantCounts } from '../utils/calculations';

interface Level2Props {
  onComplete: (score: number) => void;
  onBack: () => void;
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
    const { r1Count, r2Count } = generateReactantCounts(reaction.difficulty, reaction);
    const type: QuestionType = i % 2 === 0 ? 'times' : 'products';
    questions.push({ type, reaction, r1Count, r2Count });
  }
  return questions;
}

export function Level2({ onComplete, onBack }: Level2Props) {
  const [questions, setQuestions] = useState(buildQuestions);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [done, setDone] = useState(false);

  // The questions and the results are separate screens: each opens at the top
  // of the page, as it always has at every width (`anyWidth`), with its heading
  // focused, since the button that was pressed has unmounted.
  useScreenTop(done, { anyWidth: true });
  // Each new question opens at the top of the page too (at every width, and at
  // once, like the scrollIntoView this replaces), and focus moves to the new
  // equation (`data-item-start`).
  const itemRef = useItemTop<HTMLDivElement>(index, { anyWidth: true, gap: 0, instant: true });

  // After Athuga, focus moves to the feedback, not to Næsta, so a second Enter
  // does nothing; a phone shows Næsta with as much as fits above it: the
  // question, else the answer, else the verdict. The worked solution between
  // them is teaching, and is read in full.
  const questionRef = useRef<HTMLHeadingElement>(null);
  const answerRowRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const verdictRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  useRevealAfterCommit(answered, () => ({
    bottom: nextRef.current,
    tops: [questionRef.current, answerRowRef.current, verdictRef.current],
    focus: verdictRef.current,
  }));
  // Wider than a phone, the verdict, the solution and Næsta come into view as
  // they always have (the scrollIntoView 'nearest' this replaces).
  useEffect(() => {
    if (answered && !isPhone()) revealSpan(feedbackRef.current, [], { anyWidth: true, gap: 0 });
  }, [answered]);

  // A press within 400 ms of Næsta, or of the results buttons, appearing is
  // dropped, so the second tap of a double tap cannot skip what was just shown.
  const armed = useArmedAfter(400, `${index}:${answered}`);
  const armedResults = useArmedAfter(400, done);

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
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center space-y-6 phone:p-4 phone:space-y-4">
          <div className="text-5xl phone:text-4xl">
            {score >= 60 ? '🎉' : score >= 40 ? '👍' : '📚'}
          </div>
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
              onClick={armedResults(() => {
                // A new set: the worked solution to every question in the old
                // one has just been shown, so replaying it would test memory.
                setQuestions(buildQuestions());
                setIndex(0);
                setScore(0);
                setInput('');
                setAnswered(false);
                setIsCorrect(false);
                setDone(false);
              })}
              className="flex-1 bg-warm-200 hover:bg-warm-300 text-warm-800 font-bold py-3 rounded-xl transition-colors"
            >
              Reyna aftur
            </button>
            <button
              onClick={armedResults(() => onComplete(score))}
              className="flex-1 bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
            >
              Ljúka stigi
            </button>
          </div>
          <button
            onClick={armedResults(onBack)}
            className="text-warm-500 hover:text-warm-700 text-sm pointer-coarse:py-3 pointer-coarse:-my-3"
          >
            Til baka í valmynd
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
        `Lægri talan er ${answer.timesReactionRuns}, svo hvörfin geta gerst ${answer.timesReactionRuns} sinnum.`
      );
    }
    return (
      `Hvörfin geta gerst ${answer.timesReactionRuns} sinnum. ` +
      `Myndefni: ${answer.timesReactionRuns} × ${p.coeff} = ${answer.productsFormed[p.formula]} ${p.formula}.`
    );
  };

  // --- Question text ---
  const questionTitle =
    q.type === 'times'
      ? 'Hversu oft getur hvarfið átt sér stað?'
      : `Hversu mikið myndast af ${q.reaction.products[0].formula}?`;

  const questionHint =
    q.type === 'times'
      ? `Reiknaðu: min(${q.reaction.reactant1.formula} ÷ ${q.reaction.reactant1.coeff}, ${q.reaction.reactant2.formula} ÷ ${q.reaction.reactant2.coeff})`
      : `Hvörfin geta gerst ${answer.timesReactionRuns} sinnum. Stuðull ${q.reaction.products[0].formula} er ${q.reaction.products[0].coeff}.`;

  // --- Main gameplay ---
  return (
    <div
      ref={itemRef}
      className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-4 phone:py-3"
    >
      <div className="max-w-lg mx-auto phone-land:max-w-none">
        {/* Header. On a phone it is one row: back link, title, counter. */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4 phone:px-3 phone:py-2 phone:mb-3">
          <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-x-2 gap-y-1 phone:flex-nowrap phone:gap-x-3">
            <button
              onClick={onBack}
              className="text-warm-500 hover:text-warm-700 font-semibold text-sm whitespace-nowrap pointer-coarse:min-h-11 phone:shrink-0"
            >
              ← Til baka
            </button>
            <h1 className="order-last basis-full sm:order-none sm:basis-auto text-lg font-bold text-warm-800 phone:order-none phone:basis-auto phone:flex-1 phone:min-w-0 phone:text-base">
              Reikna myndefni – <span className="whitespace-nowrap">Stig 2</span>
            </h1>
            <span className="text-sm font-semibold text-warm-600 phone:shrink-0">
              {index + 1}/{TOTAL}
            </span>
          </div>
          <div className="mt-3 h-2 bg-warm-200 rounded-full overflow-hidden phone:mt-2 phone:h-1.5">
            <div
              className="h-full bg-kvenno-orange progress-fill"
              style={{ width: `${((index + 1) / TOTAL) * 100}%` }}
            />
          </div>
        </div>

        {/* On a phone on its side: the equation, the molecules and the method
            on the left, the question and its feedback on the right. */}
        <div className="phone-land:grid phone-land:grid-cols-2 phone-land:gap-3 phone-land:items-start">
          <div>
            {/* Equation. On a phone, one box rather than a box in a card. */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-4 phone:p-0 phone:mb-3">
              <div
                id="takmarkandi-l2-equation"
                data-item-start
                className="text-center text-xl font-mono bg-warm-50 p-3 rounded-lg phone:bg-white phone:p-2"
              >
                {q.reaction.equation}
              </div>
            </div>

            {/* Molecule counts */}
            <div className="grid grid-cols-2 gap-4 mb-4 phone:gap-3 phone:mb-3">
              <div className="bg-white rounded-xl shadow-md p-4 text-center phone:p-2">
                <div className="text-lg font-bold mb-2 phone:mb-1">
                  {q.reaction.reactant1.formula}
                </div>
                <div className="flex flex-wrap justify-center gap-1 mb-2 phone:mb-1">
                  {Array.from({ length: Math.min(q.r1Count, 8) }).map((_, i) => (
                    <Molecule
                      key={i}
                      formula={q.reaction.reactant1.formula}
                      color={q.reaction.reactant1.color}
                      size={28}
                    />
                  ))}
                  {q.r1Count > 8 && <span className="text-warm-500 text-sm">+{q.r1Count - 8}</span>}
                </div>
                {/* Balanced on a phone, so it breaks before the brackets, not inside them. */}
                <div className="text-sm text-warm-600 phone:text-balance">
                  {q.r1Count} sameindir (stuðull: {q.reaction.reactant1.coeff})
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4 text-center phone:p-2">
                <div className="text-lg font-bold mb-2 phone:mb-1">
                  {q.reaction.reactant2.formula}
                </div>
                <div className="flex flex-wrap justify-center gap-1 mb-2 phone:mb-1">
                  {Array.from({ length: Math.min(q.r2Count, 8) }).map((_, i) => (
                    <Molecule
                      key={i}
                      formula={q.reaction.reactant2.formula}
                      color={q.reaction.reactant2.color}
                      size={28}
                    />
                  ))}
                  {q.r2Count > 8 && <span className="text-warm-500 text-sm">+{q.r2Count - 8}</span>}
                </div>
                {/* Balanced on a phone, so it breaks before the brackets, not inside them. */}
                <div className="text-sm text-warm-600 phone:text-balance">
                  {q.r2Count} sameindir (stuðull: {q.reaction.reactant2.coeff})
                </div>
              </div>
            </div>

            {/* Method card — always visible */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-sm text-blue-800 phone:p-2 phone:mb-3 phone-land:mb-0">
              <strong>Aðferð:</strong> Deildu fjölda hverrar tegundar með stuðli hennar. Lægri talan
              = takmarkandi hvarfefni. Margfaldaðu þá tölu með stuðli myndefnisins.
            </div>
          </div>

          <div>
            {/* Question */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-4 phone:p-4 phone:mb-3">
              <h2
                ref={questionRef}
                className="text-xl font-bold text-warm-800 mb-2 phone:text-lg phone:mb-1"
              >
                {questionTitle}
              </h2>
              <p className="text-warm-600 text-sm mb-4 phone:mb-3">{questionHint}</p>

              {/* On a phone the answer and Athuga share one row. */}
              <div ref={answerRowRef} className="phone:flex phone:gap-2">
                <div className="flex gap-3 mb-4 phone:mb-0 phone:flex-1 phone:min-w-0">
                  <input
                    type="number"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                    enterKeyHint="done"
                    disabled={answered}
                    placeholder="Svar..."
                    className="flex-1 border-2 border-warm-200 rounded-xl px-4 py-3 text-lg font-bold text-center focus:border-kvenno-orange focus:outline-none phone:min-w-0"
                  />
                </div>

                {/* Athuga button above Vísbending */}
                {!answered && (
                  <button
                    key="check"
                    onClick={handleCheck}
                    disabled={input.trim() === ''}
                    className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark disabled:bg-warm-300 text-white font-bold py-3 rounded-xl transition-colors phone:w-auto phone:shrink-0 phone:px-5"
                  >
                    Athuga
                  </button>
                )}
              </div>
            </div>

            {/* Feedback. Focus moves to the verdict and the worked solution
                (FeedbackPanel keeps its own role="alert"); Næsta follows. */}
            {answered && (
              <div ref={feedbackRef} className="space-y-4 mb-4 phone:space-y-3 phone:mb-3">
                <div
                  ref={verdictRef}
                  role="group"
                  tabIndex={-1}
                  className="space-y-4 phone:space-y-3"
                >
                  <FeedbackPanel
                    feedback={{
                      isCorrect,
                      explanation: isCorrect
                        ? `Rétt! ${buildSolution()}`
                        : `Rétt svar: ${correctValue}. ${buildSolution()}`,
                      misconception: isCorrect
                        ? undefined
                        : q.type === 'times'
                          ? 'Deildu fjölda sameinda hvarfefnis með stuðli þess. Lægri talan segir hversu oft hvörfin geta gerst.'
                          : 'Margfaldaðu fjölda skipta með stuðli MYNDEFNISINS, ekki hvarfefnisins.',
                    }}
                    config={{ showExplanation: true, showMisconceptions: !isCorrect }}
                  />

                  {/* Step-by-step solution box */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 phone:p-3">
                    <h3 className="font-bold text-blue-800 mb-2 phone:mb-1">Útreikningur:</h3>
                    <div className="text-sm text-warm-700 space-y-1">
                      <div>
                        {q.reaction.reactant1.formula}: {q.r1Count} ÷ {q.reaction.reactant1.coeff} ={' '}
                        {answer.timesFromR1} skipti
                      </div>
                      <div>
                        {q.reaction.reactant2.formula}: {q.r2Count} ÷ {q.reaction.reactant2.coeff} ={' '}
                        {answer.timesFromR2} skipti
                      </div>
                      <div>
                        Takmarkandi:{' '}
                        <strong className="text-kvenno-orange">{answer.limitingReactant}</strong>{' '}
                        (færri skipti)
                      </div>
                      <div>
                        Hvörfin gerast: <strong>{answer.timesReactionRuns}</strong> sinnum
                      </div>
                      <div>
                        {q.reaction.products[0].formula} myndast: {answer.timesReactionRuns} ×{' '}
                        {q.reaction.products[0].coeff} ={' '}
                        <strong className="text-green-700">
                          {answer.productsFormed[q.reaction.products[0].formula]}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  key={`next-${index}`}
                  ref={nextRef}
                  onClick={armed(handleNext)}
                  className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
                >
                  {index + 1 < TOTAL ? 'Næsta spurning →' : 'Sjá niðurstöður →'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Level2;
