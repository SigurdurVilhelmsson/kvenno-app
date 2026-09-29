import { useEffect, useState, useRef } from 'react';

import { FeedbackPanel } from '@shared/components';
import {
  focusTarget,
  parseStudentNumber,
  revealSpan,
  shuffleArray,
  useArmedAfter,
  useItemTop,
  useRevealAfterCommit,
  useScreenTop,
} from '@shared/utils';

import { Problem, ProblemType } from '../types';
import { FormulaCard } from './FormulaCard';
import { StepBySolution } from './StepBySolution';
import { generateProblem } from '../utils/problem-generator';
import {
  validateInput,
  checkAnswer,
  formatAnswer,
  getContextualFeedback,
} from '../utils/validation';

const TOTAL = 8;
const THEME = '#8b5cf6';

interface Level3Props {
  onComplete: (score: number) => void;
  onBack: () => void;
}

/** Pre-generate 8 problems: 4 easier then 4 harder, shuffled within each group */
function generateAllProblems(): Problem[] {
  const easyTypes: ProblemType[] = ['molarity', 'dilution', 'molarity', 'dilution'];
  const hardTypes: ProblemType[] = [
    'molarityFromMass',
    'massFromMolarity',
    'mixing',
    'molarityFromMass',
  ];
  const gen = (types: ProblemType[], diff: 'easy' | 'medium') =>
    shuffleArray(types).map((type) => {
      let p = generateProblem(diff);
      while (p.type !== type) p = generateProblem(diff);
      return p;
    });
  return [...gen(easyTypes, 'easy'), ...gen(hardTypes, 'medium')];
}

export function Level3({ onComplete, onBack }: Level3Props) {
  const [problems, setProblems] = useState<Problem[]>(generateAllProblems);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const [feedback, setFeedback] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [done, setDone] = useState(false);
  const questionRef = useRef<HTMLParagraphElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  const problem = problems[idx];

  // "Næsta dæmi" is below the worked solution, so on a phone the next
  // question would otherwise start above the screen. The card's top comes back
  // into view, as it always has at every width (`anyWidth`; no gap, as with the
  // scrollIntoView this replaces), and focus moves to the new answer field
  // (`data-item-start`), as it always has.
  const cardRef = useItemTop<HTMLDivElement>(idx, { anyWidth: true, gap: 0 });
  // The results screen, and a new set after it, replace the screen: it opens
  // at its heading, or at the answer field on a new set. Declared after the
  // item hook, so that on a new set, where both fire, this one has the last
  // word.
  useScreenTop(done, {
    focus: {
      get current() {
        return document.querySelector<HTMLElement>('input[data-item-start]');
      },
    },
  });

  // After Athuga, focus moves to the feedback, not to Næsta (a second Enter
  // then does nothing), and a phone shows Næsta with as much as fits above it:
  // the question, else the verdict. The worked solution between them is
  // teaching, so on a phone the verdict usually comes to the top and the
  // student reads down to Næsta.
  useRevealAfterCommit(feedback, () => ({
    bottom: nextRef.current,
    tops: [questionRef.current, feedbackRef.current],
    focus: feedbackRef.current,
  }));

  // Each hint adds a line above the answer field, and the "Ábending" button
  // that was pressed is replaced by the next one (or goes, after the third).
  // A phone keeps the answer field and Athuga on screen with the new hint.
  // After the third, the button is gone, so focus moves to the hints.
  useEffect(() => {
    if (hintLevel === 0) return;
    const id = requestAnimationFrame(() => {
      revealSpan(actionsRef.current, [hintRef.current]);
      if (hintLevel >= 3) focusTarget(hintRef.current);
    });
    return () => cancelAnimationFrame(id);
  }, [hintLevel]);

  // A press within 400 ms of Næsta appearing is dropped, so the second tap of a
  // double tap on Athuga cannot skip the feedback.
  const armed = useArmedAfter(400, `${idx}:${feedback}`);
  const armedDone = useArmedAfter(400, done);

  const submit = () => {
    if (feedback) return;
    const v = validateInput(input);
    if (!v.valid) {
      if (v.error) setInputError(v.error);
      return;
    }
    setInputError(null);
    const ok = checkAnswer(v.value!, problem.answer);
    setCorrect(ok);
    setFeedback(true);
    if (ok) {
      setCorrectCount((c) => c + 1);
    }
  };

  const next = () => {
    if (idx + 1 >= TOTAL) {
      setDone(true);
      return;
    }
    setIdx((i) => i + 1);
    setInput('');
    setInputError(null);
    setFeedback(false);
    setHintLevel(0);
  };

  const showHint = () => {
    if (hintLevel >= 3) return;
    setHintLevel((h) => h + 1);
  };

  if (done) {
    const passed = correctCount >= 5;
    // A new set: the worked solution to every problem in the old one has
    // just been shown, so replaying it would test copying, not calculating.
    const retry = () => {
      setProblems(generateAllProblems());
      setIdx(0);
      setInput('');
      setCorrectCount(0);
      setHintLevel(0);
      setFeedback(false);
      setDone(false);
    };
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center">
            <div className="text-5xl mb-4">{passed ? '🎉' : '📚'}</div>
            <h2 className="text-2xl font-bold text-warm-800 mb-2">
              {passed ? 'Vel gert!' : 'Haltu áfram að æfa!'}
            </h2>
            <p className="text-warm-600 mb-6">
              Þú svaraðir {correctCount} af {TOTAL} rétt
            </p>
            <div className="h-3 bg-warm-200 rounded-full overflow-hidden mb-6">
              <div
                className={`h-full transition-all duration-700 ${passed ? 'bg-green-500' : 'bg-kvenno-orange'}`}
                style={{ width: `${(correctCount / TOTAL) * 100}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={armedDone(retry)}
                className="bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                Reyna aftur
              </button>
              {passed && (
                <button
                  onClick={armedDone(() => onComplete(correctCount))}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  Ljúka stigi →
                </button>
              )}
            </div>
            <button
              onClick={armedDone(onBack)}
              className="mt-4 text-warm-500 hover:text-warm-700 font-semibold py-2 pointer-coarse:min-h-11"
            >
              ← Til baka í valmynd
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      {/* Flex column so the order can differ: below 1184 px the formula card is
          in the flow (styles.css), and above the question it pushed the
          question and the answer field off a phone's first screen, so there it
          follows the question card instead. Wider, it is fixed to the side.
          Scroll anchoring is off because, with the formula card below the
          question, the browser anchored on it and scrolled the page down by
          the height of the worked solution the moment it appeared, leaving
          the student looking at the formulas instead of the feedback. */}
      <div className="max-w-lg mx-auto flex flex-col [overflow-anchor:none]">
        {/* Header */}
        {/* Header: already one row; on a phone it is tighter (design P4), with
            the tagline for screen readers only. */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4 phone:px-3 phone:py-2 phone:mb-3">
          <div className="flex justify-between items-center gap-3">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-warm-800 phone:text-base">
                Reikna styrk - Stig 3
              </h1>
              <p className="text-sm text-warm-600 phone:sr-only">
                Notaðu formúlurnar til að reikna
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-kvenno-orange phone:text-base">
                {correctCount}/{TOTAL}
              </div>
              <div className="text-xs text-warm-600">Rétt</div>
            </div>
          </div>
          <div className="mt-3 phone:mt-1">
            <div className="text-xs text-warm-500 mb-1">
              Dæmi {idx + 1}/{TOTAL}
            </div>
            <div className="h-2 bg-warm-200 rounded-full overflow-hidden phone:h-1.5">
              <div
                className="h-full transition-all duration-500"
                style={{ width: `${((idx + 1) / TOTAL) * 100}%`, backgroundColor: THEME }}
              />
            </div>
          </div>
        </div>

        {/* Formula reference -- always visible */}
        <div className="order-1 min-[1184px]:order-none bg-white/80 border border-warm-200 rounded-xl p-3 mb-4">
          <FormulaCard themeColor={THEME} />
        </div>

        {/* Question card */}
        <div
          ref={cardRef}
          className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 phone:p-3 phone:mb-3"
          key={idx}
        >
          <div
            className="inline-block bg-purple-100 px-3 py-1 rounded-full text-sm font-semibold mb-3 phone:mb-2"
            style={{ color: THEME }}
          >
            {problem.description}
          </div>
          <p ref={questionRef} className="text-lg text-warm-800 font-medium mb-4 phone:mb-3">
            {problem.question}
          </p>

          {hintLevel > 0 && (
            <div
              ref={hintRef}
              className="mb-4 bg-yellow-50 border border-yellow-300 p-3 rounded-lg phone:mb-3 phone:p-2"
            >
              {problem.hints.slice(0, hintLevel).map((h, i) => (
                <p key={i} className="text-sm text-yellow-900">
                  <span className="font-semibold">Ábending {i + 1}:</span> {h}
                </p>
              ))}
            </div>
          )}

          {!feedback && (
            <div className="space-y-3">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-warm-700 mb-1">Svar:</label>
                  <input
                    data-item-start
                    type="text"
                    inputMode="decimal"
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      setInputError(null);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && submit()}
                    enterKeyHint="done"
                    placeholder="0,000"
                    autoFocus
                    className={`w-full border-2 rounded-lg px-4 py-3 text-lg text-center font-bold outline-none transition-colors ${
                      inputError ? 'border-red-500' : 'border-purple-300 focus:border-purple-500'
                    }`}
                  />
                  {inputError && <p className="text-red-500 text-sm mt-1">{inputError}</p>}
                </div>
                <div className="text-lg font-bold text-warm-600 pb-3">{problem.unit}</div>
              </div>
              <div ref={actionsRef} className="flex gap-2">
                {hintLevel < 3 && (
                  <button
                    onClick={showHint}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    Ábending {hintLevel + 1}
                  </button>
                )}
                <button
                  onClick={submit}
                  disabled={!input.trim()}
                  className="flex-1 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-warm-200 disabled:text-warm-500 disabled:cursor-not-allowed"
                  style={{ backgroundColor: input.trim() ? THEME : undefined }}
                >
                  Athuga
                </button>
              </div>
            </div>
          )}

          {feedback && (
            <div className="mt-2 space-y-3 phone:space-y-2">
              {/* The region focus moves to after Athuga: the verdict and the
                  worked solution. FeedbackPanel keeps its own role="alert" and
                  exposes no id to label the group with. */}
              <div
                ref={feedbackRef}
                role="group"
                tabIndex={-1}
                className="space-y-3 phone:space-y-2"
              >
                <FeedbackPanel
                  feedback={{
                    isCorrect: correct,
                    explanation: `Rétt svar: ${formatAnswer(problem.answer)} ${problem.unit}`,
                    misconception: correct
                      ? undefined
                      : getContextualFeedback(parseStudentNumber(input), problem.answer),
                  }}
                  config={{
                    showExplanation: true,
                    showMisconceptions: !correct,
                    showRelatedConcepts: false,
                    showNextSteps: false,
                  }}
                />
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 phone:p-2">
                  <StepBySolution problem={problem} />
                </div>
              </div>
              <button
                ref={nextRef}
                onClick={armed(next)}
                className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
              >
                {idx + 1 < TOTAL ? 'Næsta dæmi →' : 'Sjá niðurstöður →'}
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onBack}
          className="order-2 min-[1184px]:order-none w-full text-warm-500 hover:text-warm-700 font-semibold py-2 pointer-coarse:min-h-11"
        >
          ← Til baka í valmynd
        </button>
      </div>
    </div>
  );
}

export default Level3;
