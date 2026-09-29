import { useEffect, useRef, useState } from 'react';

import { FeedbackPanel } from '@shared/components';
import { useEscapeKey } from '@shared/hooks';
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

interface Level1Props {
  onComplete: (score: number) => void;
  onBack: () => void;
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

  // Which reactant is limiting: half the questions each way, in a shuffled
  // order. It used to alternate left, right, left, … so the level could be
  // scored in full without reading a question (CURRICULUM_REVIEW.md:198).
  const firstIsLimiting = shuffleArray(Array.from({ length: TOTAL }, (_, i) => i < TOTAL / 2));

  for (let i = 0; i < TOTAL; i++) {
    const reaction = pool[i % pool.length];
    const c1 = reaction.reactant1.coeff;
    const c2 = reaction.reactant2.coeff;

    let r1Count: number, r2Count: number;
    if (firstIsLimiting[i]) {
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

export function Level1({ onComplete, onBack }: Level1Props) {
  const [questions, setQuestions] = useState(buildQuestions);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  useEscapeKey(onBack, showIntro);

  // The intro, the questions and the results are separate screens: each opens
  // at the top of the page, as it always has at every width (`anyWidth`), with
  // its heading focused, since the button that was pressed has unmounted.
  useScreenTop(`${showIntro}:${done}`, { anyWidth: true });
  // Each new question opens at the top of the page too (at every width, and at
  // once, like the scrollIntoView this replaces), and focus moves to the new
  // equation (`data-item-start`).
  const itemRef = useItemTop<HTMLDivElement>(index, { anyWidth: true, gap: 0, instant: true });

  // Once answered, focus moves to the feedback, not to Næsta, so a second
  // Enter does nothing; a phone shows Næsta with as much as fits above it:
  // the question, else the student's own choice, else the verdict.
  const questionRef = useRef<HTMLHeadingElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const verdictRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  useRevealAfterCommit(answered, () => ({
    bottom: nextRef.current,
    tops: [
      questionRef.current,
      optionsRef.current?.querySelector('[data-chosen]') ?? null,
      verdictRef.current,
    ],
    focus: verdictRef.current,
  }));
  // Wider than a phone, the verdict and Næsta come into view as they always
  // have (the scrollIntoView 'nearest' this replaces).
  useEffect(() => {
    if (answered && !isPhone()) revealSpan(feedbackRef.current, [], { anyWidth: true, gap: 0 });
  }, [answered]);

  // A press within 400 ms of Næsta, or of the results buttons, appearing is
  // dropped, so the second tap of a double tap cannot skip what was just shown.
  const armed = useArmedAfter(400, `${index}:${answered}`);
  const armedResults = useArmedAfter(400, done);

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
  };

  // --- Summary screen ---
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
                // A new set: every answer in the old one has just been shown,
                // so replaying it would test memory, not the method.
                setQuestions(buildQuestions());
                setIndex(0);
                setScore(0);
                setAnswered(false);
                setIsCorrect(false);
                setSelected(null);
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

  // --- Teaching intro ---
  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-4 flex items-center justify-center">
        <div className="max-w-lg w-full space-y-6 phone:space-y-4">
          <div className="bg-white rounded-xl shadow-lg p-5 sm:p-8 phone:p-4">
            <h1 className="text-2xl font-bold text-warm-800 mb-2">Takmarkandi hvarfefni</h1>
            <p className="text-warm-600 mb-6 phone:mb-4">
              Af hverju skiptir máli hvaða hvarfefni er takmarkandi?
            </p>

            {/* Core principle */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-5 phone:p-4 phone:mb-4">
              <h2 className="font-bold text-red-800 mb-2">Meginreglan</h2>
              <p className="text-red-700">
                Þegar eitt hvarfefni klárast, <strong>stöðvast hvarfið</strong> — sama hversu mikið
                er eftir af hinu hvarfefninu. Hvarfefnið sem klárast fyrst kallast{' '}
                <strong>takmarkandi hvarfefni</strong>.
              </p>
            </div>

            {/* Cooking analogy */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-5 phone:p-4 phone:mb-4">
              <h2 className="font-bold text-amber-800 mb-2">Samlokudæmið</h2>
              <p className="text-amber-700">
                Ef þú hefur 10 brauðsneiðar og 3 osta, geturðu bara gert 3 samlokur —{' '}
                <strong>osturinn er takmarkandi</strong>. Þú átt 4 brauðsneiðar eftir sem þú getur
                ekki notað.
              </p>
            </div>

            {/* Math principle */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-5 phone:p-4 phone:mb-4">
              <h2 className="font-bold text-blue-800 mb-2">Aðferðin</h2>
              <p className="text-blue-700 mb-3">
                Deildu fjölda sameinda með stuðlinum — <strong>lægri talan</strong> segir þér hvað
                rennur fyrst út.
              </p>
              <div className="bg-white rounded-lg p-4 font-mono text-sm text-warm-700 space-y-1">
                <div>2 Mg + O₂ → 2 MgO</div>
                <div className="mt-2">
                  Mg: 6 ÷ 2 = <strong>3</strong> skipti
                </div>
                <div>
                  O₂: 2 ÷ 1 = <strong>2</strong> skipti
                </div>
                <div className="mt-2 text-kvenno-orange font-bold">
                  O₂ er takmarkandi <span className="whitespace-nowrap">(2 &lt; 3)</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowIntro(false)}
            className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-4 rounded-xl transition-colors text-lg"
          >
            Byrja æfingar →
          </button>
          <button
            onClick={onBack}
            className="w-full text-warm-500 hover:text-warm-700 text-sm py-2 pointer-coarse:py-3"
          >
            ← Til baka í valmynd
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
        data-chosen={isSelected || undefined}
        className={`p-3 sm:p-6 rounded-xl border-4 transition-all ${border}`}
      >
        <div className="text-center mb-3 phone:mb-2">
          <div className="text-2xl font-bold">{reactant.formula}</div>
          <div className="text-sm text-warm-600">{count} sameindir</div>
          <div className="text-xs text-warm-500">Stuðull: {reactant.coeff}</div>
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
              Sjónræn greining – <span className="whitespace-nowrap">Stig 1</span>
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

        {/* Equation. On a phone, one box rather than a box in a card. */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4 phone:p-0 phone:mb-3">
          <div
            id="takmarkandi-l1-equation"
            data-item-start
            className="text-center text-xl font-mono bg-warm-50 p-3 rounded-lg phone:bg-white phone:p-2"
          >
            {q.reaction.equation}
          </div>
        </div>

        {/* Question. On a phone on its side the question sits beside the two
            reactants, so the feedback below them is on screen after a tap. */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 phone:p-3 phone:mb-3 phone-land:grid phone-land:grid-cols-2 phone-land:grid-rows-[auto_1fr] phone-land:gap-x-3">
          <h2
            ref={questionRef}
            className="text-xl font-bold text-warm-800 mb-2 phone:text-lg phone:mb-1"
          >
            Hvort hvarfefnið eyðist fyrst?
          </h2>
          <p className="text-warm-600 mb-6 phone:mb-3 phone:text-sm phone-land:col-start-1 phone-land:mb-0">
            Skoðaðu stuðlana og fjölda sameinda. Hvort hvarfefnið mun klárast fyrst?
          </p>

          <div
            ref={optionsRef}
            className="grid grid-cols-2 gap-3 sm:gap-4 phone-land:col-start-2 phone-land:row-start-1 phone-land:row-span-2"
          >
            {reactantBtn(q.reaction.reactant1, q.r1Count)}
            {reactantBtn(q.reaction.reactant2, q.r2Count)}
          </div>
        </div>

        {/* Feedback. Focus moves to the verdict group (FeedbackPanel keeps
            its own role="alert"); Næsta follows it, so the next Tab reaches it. */}
        {answered && (
          <div ref={feedbackRef} className="space-y-4 mb-4 phone:space-y-3 phone:mb-3">
            <div ref={verdictRef} role="group" tabIndex={-1}>
              <FeedbackPanel
                feedback={{
                  isCorrect,
                  explanation: isCorrect
                    ? `Rétt! ${q.reaction.reactant1.formula}: ${q.r1Count}÷${q.reaction.reactant1.coeff}=${timesR1} skipti. ${q.reaction.reactant2.formula}: ${q.r2Count}÷${q.reaction.reactant2.coeff}=${timesR2} skipti. ${limiting} eyðist fyrst.`
                    : `Rétt svar: ${limiting}. ${q.reaction.reactant1.formula}: ${q.r1Count}÷${q.reaction.reactant1.coeff}=${timesR1}. ${q.reaction.reactant2.formula}: ${q.r2Count}÷${q.reaction.reactant2.coeff}=${timesR2}.`,
                  misconception: isCorrect
                    ? undefined
                    : 'Það er ekki alltaf það sem er minna af — stuðlarnir skipta máli.',
                }}
                config={{ showExplanation: true, showMisconceptions: !isCorrect }}
              />
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
  );
}

export default Level1;
