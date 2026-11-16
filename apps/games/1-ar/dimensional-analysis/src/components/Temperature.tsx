import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import { FeedbackPanel } from '@shared/components';
import {
  focusTarget,
  parseStudentNumber,
  revealSpan,
  shuffleArray,
  useArmedAfter,
  useItemTop,
  useRevealAfterCommit,
} from '@shared/utils';

import {
  SCALE_SYMBOL,
  TEMPERATURE_EQUATIONS,
  TEMPERATURE_ITEMS,
  answerOf,
  judgeTemperature,
  stepsFor,
  withUnit,
  type TemperatureVerdict,
} from '../data/temperature';

/** Items per run, drawn from the book's twelve. */
export const TEMPERATURE_RUN = 8;

interface Props {
  onComplete: (correct: number, total: number) => void;
  onBack: () => void;
}

/**
 * "Hitastig": converting between °C, K and °F (year-1 plan item 14, book
 * ch01/m68683). A practice beside the levels, not a fifth level: temperature
 * is the chapter's one conversion that is not a factor, so it does not fit a
 * chain. The three equations stay on screen; what is practised is choosing
 * the right one and doing the steps in order.
 */
export function Temperature({ onComplete, onBack }: Props) {
  const items = useMemo(() => shuffleArray(TEMPERATURE_ITEMS).slice(0, TEMPERATURE_RUN), []);
  const total = items.length;
  const [idx, setIdx] = useState(0);
  const item = items[idx];

  const [typed, setTyped] = useState('');
  const [verdict, setVerdict] = useState<TemperatureVerdict | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  // A right answer counts after a retry unless the game had printed it first
  // (decision 1 (b)): the worked steps appear after a second wrong try.
  const [printed, setPrinted] = useState(false);
  const answered = verdict !== null;

  const cardRef = useItemTop<HTMLDivElement>(idx, { anyWidth: true, gap: 0 });
  const promptRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useRevealAfterCommit(answered, () => ({
    bottom: actionsRef.current,
    tops: [promptRef.current, feedbackRef.current],
    focus: feedbackRef.current,
  }));
  const armed = useArmedAfter(400, `${idx}:${answered}`);
  // "Reyna aftur" returns focus to the answer field, not to <body>.
  const [retries, setRetries] = useState(0);
  const shownRetries = useRef(retries);
  useLayoutEffect(() => {
    if (shownRetries.current === retries) return;
    shownRetries.current = retries;
    revealSpan(actionsRef.current, [promptRef.current]);
    focusTarget(inputRef.current);
  }, [retries]);

  const value = parseStudentNumber(typed);
  const canCheck = Number.isFinite(value);

  const check = () => {
    if (!canCheck || answered) return;
    const v = judgeTemperature(item, value);
    setVerdict(v);
    setAttempts((a) => a + 1);
    if (v.kind === 'right' && !printed) setCorrectCount((n) => n + 1);
    if (v.kind !== 'right' && attempts >= 1) setPrinted(true);
  };

  const [done, setDone] = useState(false);
  const next = () => {
    if (idx + 1 >= total) {
      onComplete(correctCount, total);
      setDone(true);
      return;
    }
    setIdx(idx + 1);
    setAttempts(0);
    setPrinted(false);
    setTyped('');
    setVerdict(null);
  };

  const showSteps = verdict !== null && (verdict.kind === 'right' || attempts > 1);
  const explanation =
    verdict === null
      ? ''
      : verdict.kind === 'right'
        ? `Rétt: ${withUnit(answerOf(item), item.to)}.`
        : verdict.kind === 'route'
          ? verdict.message
          : 'Ekki rétt. Finndu jöfnuna sem fer úr ' +
            `${SCALE_SYMBOL[item.from]} í ${SCALE_SYMBOL[item.to]}` +
            (item.from !== 'C' && item.to !== 'C' ? ', í gegnum °C.' : '.');

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-3 sm:p-4">
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-warm-800 mb-2">Hitastig</h1>
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
              Hitastig
            </h1>
            <div className="text-lg font-bold text-warm-700">
              {idx + 1}/{total}
            </div>
          </div>
        </div>

        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 mb-4 phone:mb-3">
          <h2 className="text-sm font-semibold text-sky-900 mb-1">Jöfnurnar</h2>
          <ul className="font-mono text-sm text-sky-900 space-y-0.5">
            {TEMPERATURE_EQUATIONS.map((eq) => (
              <li key={eq}>{eq}</li>
            ))}
          </ul>
          <p className="text-xs text-sky-800 mt-1 phone:sr-only">
            °C og °F hafa ekki sama núllpunkt, svo hér dugar ekki að margfalda með stuðli.
          </p>
        </div>

        <div
          ref={cardRef}
          className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 phone:p-3 phone:mb-3"
        >
          <div ref={promptRef} data-item-start className="text-center mb-4 phone:mb-2">
            {item.context && <div className="text-sm text-warm-500">{item.context}</div>}
            <div className="text-2xl sm:text-3xl font-bold text-warm-800">
              {withUnit(item.value, item.from)}
            </div>
            <label htmlFor="temperature-answer" className="block mt-2 text-warm-700">
              Hvað er þetta í {SCALE_SYMBOL[item.to]}?
            </label>
            <form
              className="mt-2 flex items-center justify-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                check();
              }}
            >
              <input
                ref={inputRef}
                id="temperature-answer"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={typed}
                readOnly={answered}
                onChange={(e) => setTyped(e.target.value)}
                className="w-36 rounded-lg border-2 border-warm-300 px-3 py-2 text-center text-lg focus:border-kvenno-orange focus:outline-none"
              />
              <span className="text-lg font-semibold text-warm-700">{SCALE_SYMBOL[item.to]}</span>
            </form>
          </div>

          {verdict !== null && (
            <div
              ref={feedbackRef}
              role="group"
              tabIndex={-1}
              aria-label="Niðurstaða"
              className="mb-2"
            >
              <FeedbackPanel
                feedback={{
                  isCorrect: verdict.kind === 'right',
                  explanation,
                  misconception: verdict.kind === 'route' ? verdict.message : undefined,
                }}
                config={{ showExplanation: verdict.kind !== 'route' }}
              />
              {showSteps && (
                <div className="mt-2 text-sm text-warm-700">
                  <div className="font-semibold">Útreikningur:</div>
                  <ul className="font-mono">
                    {stepsFor(item).map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div ref={actionsRef} className="flex gap-3">
          {!answered ? (
            <button
              key="check"
              onClick={check}
              disabled={!canCheck}
              className="flex-1 bg-kvenno-orange hover:bg-kvenno-orange-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Athuga
            </button>
          ) : (
            <>
              {verdict !== null && verdict.kind !== 'right' && (
                <button
                  key="retry"
                  onClick={armed(() => {
                    setVerdict(null);
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
