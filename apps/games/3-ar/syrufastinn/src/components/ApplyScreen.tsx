/**
 * Beita — independent problems, including the ones where the rule fails.
 *
 * No scaffolding: one question, one field. The mix is one of each kind (pH from
 * Ka, Ka from a measured pH, Kb of the conjugate base, klofnunarhlutfall) and
 * then every pair in the pool where the 5 % rule breaks.
 *
 * The rule-breakers are the point of the phase. A student who substitutes
 * √(Ka·C) without checking lands on a specific wrong number, and because it is
 * predictable the feedback names it — that is what the `misconception` slot is
 * for, and why it renders outside the collapse.
 *
 * Grading goes through `gradeApply`, so the comparison is the one the problem
 * declares. Each screen inventing its own is how a game comes to disagree with
 * itself about the same answer.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { FeedbackPanel } from '@shared/components';
import {
  DECIMAL_INPUT_PROPS,
  focusTarget,
  isPhone,
  parseStudentNumber,
  revealSpan,
  usableArea,
  useArmedAfter,
  useItemTop,
  useRevealAfterCommit,
} from '@shared/utils';

import { useBackButton } from './BackButton';
import { KlofnunBar } from './KlofnunBar';
import { ScientificKeys } from './ScientificKeys';
import { APPLY_PROBLEMS, gradeApply } from '../data/problems';
import { percentDissociation } from '../engine/grade';

const fmt = (n: number, dp: number) => n.toFixed(dp).replace('.', ',');

interface ApplyScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export function ApplyScreen({ onComplete, onBack }: ApplyScreenProps) {
  const [index, setIndex] = useState(0);
  const [entry, setEntry] = useState('');
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [retries, setRetries] = useState(0);
  const back = useBackButton(onBack);
  const inputRef = useRef<HTMLInputElement>(null);
  const questionRef = useRef<HTMLParagraphElement>(null);
  const answerRowRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const verdictRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // Each "Næsta dæmi": on a phone, the card's top back under the header if it
  // has scrolled away, and focus to the new question.
  const cardRef = useItemTop<HTMLDivElement>(index);

  // After "Svara": on a phone, from the question through "Næsta dæmi" if it
  // fits, else from the answer, the bar or the verdict, the most that fits —
  // the whole block, not only the verdict line. Where the explanation is long
  // the verdict lands at the top and the student reads down to the button.
  // Focus moves to the feedback, not to the button (design P3).
  useRevealAfterCommit(verdict !== null, () => ({
    bottom: nextRef.current,
    tops: [questionRef.current, answerRowRef.current, feedbackRef.current, verdictRef.current],
    focus: verdictRef.current,
  }));
  // A desktop window keeps what the game's own helper did there, at any width:
  // a verdict that opened within 48 px of the bottom edge brings the feedback
  // block in.
  useEffect(() => {
    const el = verdictRef.current;
    if (verdict === null || !el || isPhone()) return;
    if (el.getBoundingClientRect().top + 48 > usableArea().bottom) {
      revealSpan(feedbackRef.current, [], { anyWidth: true, gap: 16 });
    }
  }, [verdict]);
  // "Reyna aftur" unmounts with the feedback: focus goes back to the field.
  useLayoutEffect(() => {
    if (retries > 0) focusTarget(inputRef.current);
  }, [retries]);
  // A double tap on "Svara" must not press "Næsta dæmi" or "Reyna aftur".
  const armed = useArmedAfter(400, `${index}:${verdict !== null}`);

  const problem = APPLY_PROBLEMS[index];
  const last = index + 1 === APPLY_PROBLEMS.length;
  // Ka and Kb are answered in scientific notation; pH and percent are not.
  const scientific = problem.kind === 'ka' || problem.kind === 'kb';

  const submit = () => {
    if (verdict !== null) return;
    setVerdict(gradeApply(problem, parseStudentNumber(entry)));
  };

  const next = () => {
    if (last) {
      onComplete();
      return;
    }
    setIndex(index + 1);
    setEntry('');
    setVerdict(null);
  };

  const retry = () => {
    setEntry('');
    setVerdict(null);
    setRetries((n) => n + 1);
  };

  return (
    <div className="mx-auto max-w-3xl">
      {back.above}

      <div ref={cardRef} className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:p-8 phone:p-3">
        <div className="mb-4 flex items-baseline justify-between phone:mb-3 phone:gap-3">
          {back.inRow}
          <h2 className="text-2xl font-bold text-warm-800 phone:min-w-0 phone:flex-1 phone:text-base">
            Beita
          </h2>
          <span className="text-sm text-warm-500 phone:shrink-0">
            Dæmi {index + 1} af {APPLY_PROBLEMS.length}
          </span>
        </div>

        {!problem.approximationValid && (
          <p className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 phone:mb-3 phone:px-3 phone:py-2">
            Ekki ganga út frá því að nálgunin megi standa. Athugaðu klofnunarhlutfallið fyrst.
          </p>
        )}

        <p ref={questionRef} data-item-start className="mb-5 text-lg text-warm-800 phone:mb-3">
          {problem.question}
        </p>

        {/* On a portrait phone the field, the two keys and Svara share one row,
            and the answer hint takes the line under them. */}
        <div ref={answerRowRef} className="flex flex-wrap items-center gap-2 max-sm:gap-1.5">
          <label htmlFor="apply-answer" className="sr-only">
            Svar
          </label>
          <input
            id="apply-answer"
            ref={inputRef}
            {...DECIMAL_INPUT_PROPS}
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && verdict === null) submit();
            }}
            enterKeyHint="done"
            disabled={verdict !== null}
            className="w-36 rounded-lg border border-warm-300 p-3 font-mono text-warm-800 disabled:bg-warm-50 sm:w-48 max-sm:w-auto max-sm:min-w-0 max-sm:flex-[0_1_6.5rem] max-sm:px-2"
          />
          {scientific && verdict === null && (
            <ScientificKeys inputRef={inputRef} value={entry} onChange={setEntry} />
          )}
          <span className="text-sm text-warm-600 max-sm:order-last max-sm:basis-full">
            {problem.answerHint}
          </span>
          {verdict === null && (
            <button
              key="svara"
              type="button"
              onClick={submit}
              className="game-btn rounded-lg bg-kvenno-orange px-5 py-2.5 text-white hover:bg-kvenno-orange-dark max-sm:shrink-0 max-sm:px-4"
            >
              Svara
            </button>
          )}
        </div>

        {verdict !== null && (
          <div ref={feedbackRef} className="fade-in mt-5 phone:mt-3">
            {/* The bar shows the solution the question is about, so the 5 %
                verdict is visible next to the answer. Kb is a property of the
                conjugate base rather than of a solution, so it gets no bar. */}
            {problem.kind !== 'kb' && (
              <div className="mb-4 phone:mb-3">
                <KlofnunBar
                  percent={percentDissociation(problem.acid.ka, problem.concentration)}
                  valid={problem.approximationValid}
                />
              </div>
            )}

            {/* The group focus moves to after Svara; FeedbackPanel is itself
                role=alert and announces the verdict. */}
            <div ref={verdictRef} tabIndex={-1} role="group">
              <FeedbackPanel
                feedback={{
                  isCorrect: verdict,
                  explanation: problem.explanation,
                  misconception: verdict ? undefined : problem.misconception,
                }}
              />
            </div>

            <button
              key="next"
              ref={nextRef}
              type="button"
              onClick={armed(next)}
              className="game-btn mt-4 rounded-lg bg-kvenno-orange px-5 py-2.5 text-white hover:bg-kvenno-orange-dark"
            >
              {last ? 'Ljúka Beita' : 'Næsta dæmi'}
            </button>
            {!verdict && (
              <button
                type="button"
                onClick={armed(retry)}
                className="ml-3 rounded-lg px-4 py-2.5 text-warm-600 hover:text-warm-800"
              >
                Reyna aftur
              </button>
            )}
          </div>
        )}

        <p className="mt-6 border-t border-warm-200 pt-4 text-xs text-warm-500">
          Svar upp á{' '}
          {fmt(
            problem.grading.tolerance * (problem.grading.mode === 'relative' ? 100 : 1),
            problem.grading.mode === 'relative' ? 0 : 2
          )}
          {problem.grading.mode === 'relative' ? ' % ' : ' '}
          frá réttu gildi telst rétt.
        </p>
      </div>
    </div>
  );
}
