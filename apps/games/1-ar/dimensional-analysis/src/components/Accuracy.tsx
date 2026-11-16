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
  ACCURACY_ITEMS,
  VERDICT_LABEL,
  VERDICT_ORDER,
  explain,
  fmtValue,
  verdictOf,
  type AccuracyItem,
  type AccuracyVerdict,
  type TargetItem,
} from '../data/accuracy';

interface Props {
  onComplete: (correct: number, total: number) => void;
  onBack: () => void;
}

function Target({ item }: { item: TargetItem }) {
  const r = 60;
  return (
    <svg
      viewBox="-70 -70 140 140"
      className="mx-auto h-40 w-40 phone:h-28 phone:w-28"
      role="img"
      aria-label={`${item.name}: skotskífa með ${item.hits.length} örvum`}
    >
      {[1, 0.75, 0.5, 0.25].map((f, i) => (
        <circle
          key={f}
          r={r * f}
          fill={i % 2 === 0 ? '#fff7ed' : '#fed7aa'}
          stroke="#c2410c"
          strokeWidth={0.8}
        />
      ))}
      <circle r={r * 0.08} fill="#c2410c" />
      {item.hits.map((h, i) => (
        <circle key={i} cx={h.x * r} cy={h.y * r} r={4} fill="#1e3a8a" stroke="#fff" />
      ))}
    </svg>
  );
}

function SetTable({ item }: { item: AccuracyItem & { kind: 'set' } }) {
  const d = Math.max(...item.values.map((v) => (String(v).split('.')[1] ?? '').length));
  return (
    <div className="text-center">
      <div className="text-sm text-warm-600">
        Rétt gildi: {fmtValue(item.target, (String(item.target).split('.')[1] ?? '').length)}{' '}
        {item.unit}
      </div>
      <ul className="mt-1 flex flex-wrap justify-center gap-2 font-mono text-lg text-warm-800">
        {item.values.map((v, i) => (
          <li key={i} className="rounded bg-warm-100 px-2 py-0.5">
            {fmtValue(v, d)}
          </li>
        ))}
      </ul>
      <div className="text-sm text-warm-600 mt-1">{item.unit}</div>
    </div>
  );
}

/**
 * "Hittni og nákvæmni": the second half of year-1 plan item 14, from book
 * ch01/m68690. A practice beside the levels. Each item is one of the book's
 * own: three archers, three cough-syrup dispensers and two measurement sets;
 * the student says whether it shows accuracy, precision, both or neither.
 */
export function Accuracy({ onComplete, onBack }: Props) {
  const items = ACCURACY_ITEMS;
  const total = items.length;
  const [idx, setIdx] = useState(0);
  const item = items[idx];

  const [picked, setPicked] = useState<AccuracyVerdict | null>(null);
  const [answered, setAnswered] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  // A right answer counts after a retry unless the game had printed it first
  // (decision 1 (b)): the answer shows after a second wrong try.
  const [printed, setPrinted] = useState(false);
  const [done, setDone] = useState(false);
  const right = verdictOf(item);
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
          <h1 className="text-2xl font-bold text-warm-800 mb-2">Hittni og nákvæmni</h1>
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
              Hittni og nákvæmni
            </h1>
            <div className="text-lg font-bold text-warm-700">
              {idx + 1}/{total}
            </div>
          </div>
        </div>

        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 mb-4 phone:p-2 phone:mb-2 text-sm phone:text-xs text-sky-900">
          <p>
            <strong>Hittni:</strong> hversu nálægt mælingarnar eru réttu gildi.
          </p>
          <p>
            <strong>Nákvæmni:</strong> hversu nálægt endurteknar mælingar eru hver annarri.
          </p>
        </div>

        <div
          ref={cardRef}
          className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 phone:p-3 phone:mb-3"
        >
          <div ref={promptRef} data-item-start className="mb-4 phone:mb-2">
            <div className="text-center text-lg phone:text-base font-bold text-warm-800 mb-2 phone:mb-1">
              {item.name}
            </div>
            {item.kind === 'target' ? <Target item={item} /> : <SetTable item={item} />}
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
                  explanation: isRight || showAnswer ? explain(item) : 'Ekki rétt.',
                  misconception: !isRight && picked !== null ? hint(picked, right) : undefined,
                }}
                config={{ showExplanation: true }}
              />
              {showAnswer && (
                <p className="mt-2 text-sm text-warm-700">Rétt svar: {VERDICT_LABEL[right]}</p>
              )}
            </div>
          )}

          <div
            ref={choicesRef}
            role="group"
            tabIndex={-1}
            aria-label="Hvað sýna mælingarnar?"
            className={`grid grid-cols-2 gap-2 outline-none ${answered ? 'phone:hidden' : ''}`}
          >
            {VERDICT_ORDER.map((v) => (
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
                {VERDICT_LABEL[v]}
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

const hasHittni = (v: AccuracyVerdict) => v === 'baedi' || v === 'hittni';
const hasNakvaemni = (v: AccuracyVerdict) => v === 'baedi' || v === 'nakvaemni';

/** Which half the student got wrong, without giving the verdict away. */
export function hint(picked: AccuracyVerdict, right: AccuracyVerdict): string {
  const h = hasHittni(picked) !== hasHittni(right);
  const n = hasNakvaemni(picked) !== hasNakvaemni(right);
  if (h && n)
    return 'Skoðaðu bæði hvar mælingarnar lenda miðað við rétta gildið og hve þétt þær liggja.';
  if (h)
    return 'Nákvæmnin er rétt metin. Skoðaðu hittnina: hve nálægt réttu gildi lenda mælingarnar?';
  return 'Hittnin er rétt metin. Skoðaðu nákvæmnina: hve nálægt liggja mælingarnar hver annarri?';
}
