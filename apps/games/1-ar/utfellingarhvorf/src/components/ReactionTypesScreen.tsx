import { useLayoutEffect, useRef, useState } from 'react';

import { FeedbackPanel } from '@shared/components';
import {
  focusTarget,
  revealSpan,
  useArmedAfter,
  useItemTop,
  useRevealAfterCommit,
} from '@shared/utils';

import {
  REACTION_ITEMS,
  TYPE_LABEL,
  TYPE_ORDER,
  TYPE_SIGN,
  type ReactionType,
} from '../data/reaction-types';

interface Props {
  onComplete: (correct: number, total: number) => void;
  onBack: () => void;
}

/**
 * "Hvers konar hvarf?": recognising the four kinds of reaction in book
 * ch04/m68710 (Siggi's Phase 4 ruling, 2026-11-15). A practice beside the
 * phases, not a fifth one: the student names each equation's kind, and the
 * feedback says what in the equation shows it.
 */
export function ReactionTypesScreen({ onComplete, onBack }: Props) {
  const items = REACTION_ITEMS;
  const total = items.length;
  const [idx, setIdx] = useState(0);
  const item = items[idx];

  const [picked, setPicked] = useState<ReactionType | null>(null);
  const [answered, setAnswered] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  // A right answer counts after a retry unless the game had printed it first
  // (decision 1 (b)): the answer shows after a second wrong try.
  const [printed, setPrinted] = useState(false);
  const [done, setDone] = useState(false);
  const right = item.type;
  const isRight = answered && picked === right;

  const cardRef = useItemTop<HTMLDivElement>(idx, { anyWidth: true, gap: 0 });
  const promptRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const choicesRef = useRef<HTMLDivElement>(null);
  useRevealAfterCommit(answered, () => ({
    bottom: actionsRef.current,
    tops: [promptRef.current, feedbackRef.current],
    focus: feedbackRef.current,
  }));
  const armed = useArmedAfter(400, `${idx}:${answered}`);
  // "Reyna aftur" returns focus to the choices, not to <body>.
  const [retries, setRetries] = useState(0);
  const shownRetries = useRef(retries);
  useLayoutEffect(() => {
    if (shownRetries.current === retries) return;
    shownRetries.current = retries;
    revealSpan(actionsRef.current, [choicesRef.current]);
    focusTarget(choicesRef.current);
  }, [retries]);

  const check = () => {
    if (!picked || answered) return;
    setAnswered(true);
    setAttempts((a) => a + 1);
    if (picked === right && !printed) setCorrectCount((n) => n + 1);
    if (picked !== right && attempts >= 1) setPrinted(true);
  };

  const next = () => {
    if (idx + 1 >= total) {
      onComplete(correctCount, total);
      setDone(true);
      return;
    }
    setIdx(idx + 1);
    setAttempts(0);
    setPrinted(false);
    setPicked(null);
    setAnswered(false);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-3 sm:p-4">
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-warm-800 mb-2">Hvers konar hvarf?</h1>
          <p className="text-lg text-warm-700 mb-4">
            Æfingu lokið: {correctCount} af {total} rétt.
          </p>
          <button
            onClick={onBack}
            className="w-full bg-kvenno-orange hover:bg-kvenno-orange-600 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Til baka í valmynd
          </button>
        </div>
      </div>
    );
  }

  const showAnswer = answered && !isRight && attempts > 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-3 sm:p-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 mb-4 phone:py-2 phone:mb-3">
          <div className="flex flex-wrap justify-between items-center gap-x-2 gap-y-1">
            <button
              onClick={onBack}
              className="whitespace-nowrap text-warm-500 hover:text-warm-700 font-semibold text-sm pointer-coarse:py-3 pointer-coarse:-my-3 pointer-coarse:px-2 pointer-coarse:-mx-2"
            >
              Til baka
            </button>
            <h1 className="whitespace-nowrap text-base sm:text-lg font-bold text-warm-800">
              Hvers konar hvarf?
            </h1>
            <div className="text-lg font-bold text-warm-700">
              {idx + 1}/{total}
            </div>
          </div>
        </div>

        <p className="mb-4 text-sm text-warm-600 phone:sr-only">
          Hvert efnahvarf hér fellur í einn af fjórum flokkum. Hvað í jöfnunni segir til um
          flokkinn?
        </p>

        <div
          ref={cardRef}
          className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 phone:p-3 phone:mb-3"
        >
          <div ref={promptRef} data-item-start className="mb-4 phone:mb-2">
            {item.context && (
              <div className="text-center text-sm text-warm-500 mb-1">{item.context}</div>
            )}
            <div className="text-center font-mono text-lg sm:text-xl text-warm-800 break-words">
              {item.equation}
            </div>
          </div>

          {answered && (
            <div
              ref={feedbackRef}
              role="group"
              tabIndex={-1}
              aria-label="Niðurstaða"
              className="mb-4 phone:mb-3"
            >
              <FeedbackPanel
                feedback={{
                  isCorrect: isRight,
                  explanation:
                    isRight || showAnswer
                      ? [TYPE_SIGN[right], item.note].filter(Boolean).join(' ')
                      : 'Ekki rétt.',
                  misconception:
                    !isRight && picked !== null && !showAnswer
                      ? `${TYPE_LABEL[picked]}: ${TYPE_SIGN[picked]} Sést það hér?`
                      : undefined,
                }}
                config={{ showExplanation: true }}
              />
              {showAnswer && (
                <p className="mt-2 text-sm text-warm-700">Rétt svar: {TYPE_LABEL[right]}</p>
              )}
            </div>
          )}

          <div
            ref={choicesRef}
            role="group"
            tabIndex={-1}
            aria-label="Hvers konar hvarf?"
            className={`grid grid-cols-2 gap-2 outline-none ${answered ? 'phone:hidden' : ''}`}
          >
            {TYPE_ORDER.map((v) => (
              <button
                key={v}
                aria-pressed={picked === v}
                disabled={answered}
                onClick={() => setPicked(v)}
                className={`min-h-[44px] rounded-lg border-2 px-3 py-2 phone:px-2 phone:py-1.5 text-left text-sm sm:text-base font-semibold transition-colors disabled:cursor-not-allowed ${
                  picked === v
                    ? 'border-kvenno-orange bg-orange-50 text-warm-900'
                    : 'border-warm-200 bg-white text-warm-700 hover:border-warm-400'
                }`}
              >
                {TYPE_LABEL[v]}
              </button>
            ))}
          </div>
        </div>

        <div ref={actionsRef} className="flex gap-3">
          {!answered ? (
            <button
              key="check"
              onClick={check}
              disabled={!picked}
              className="flex-1 bg-kvenno-orange hover:bg-kvenno-orange-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Athuga
            </button>
          ) : (
            <>
              {!isRight && (
                <button
                  key="retry"
                  onClick={armed(() => {
                    setAnswered(false);
                    setPicked(null);
                    setRetries((n) => n + 1);
                  })}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Reyna aftur
                </button>
              )}
              <button
                key="next"
                onClick={armed(next)}
                className="flex-1 bg-kvenno-orange hover:bg-kvenno-orange-600 text-white font-bold py-3 rounded-xl transition-colors"
              >
                {idx + 1 < total ? 'Næsta →' : 'Sjá niðurstöður'}
              </button>
            </>
          )}
        </div>

        {/* Armed: the second tap of a double tap on the action must not leave the screen. */}
        <button
          onClick={armed(onBack)}
          className="mt-4 w-full text-warm-500 hover:text-warm-700 font-semibold py-2 text-sm pointer-coarse:py-3"
        >
          Til baka í valmynd
        </button>
      </div>
    </div>
  );
}
