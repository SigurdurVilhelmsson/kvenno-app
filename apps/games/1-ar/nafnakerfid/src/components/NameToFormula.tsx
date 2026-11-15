import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { FeedbackPanel } from '@shared/components';
import {
  focusTarget,
  revealSpan,
  shuffleArray,
  useArmedAfter,
  useItemTop,
  useRevealAfterCommit,
} from '@shared/utils';

import { formulaOf, ionLabel, ionPart, nameToFormulaPool, type Ion } from '../data/ions';
import { dropEarlyClicks } from '../utils/dropEarlyClicks';
import { explainVerdict, ionChoices, judgeFormula, type Verdict } from '../utils/nameToFormula';

/** Items per run, drawn from every simple ionic compound the game names. */
export const NAME_TO_FORMULA_ITEMS = 8;
const MAX_COUNT = 4;

interface Props {
  onComplete: (correct: number, total: number) => void;
  onBack: () => void;
}

/**
 * "Frá nafni til formúlu": Stig 3 the other way round (year-1 plan item 13).
 * The name gives the two ions, a Roman numeral gives a metal's charge, and the
 * student sets how many of each make the compound neutral. The charge sum is
 * shown as they go, the way Stilla efnajöfnur counts atoms; what is graded is
 * reading the ions off the name and choosing the lowest whole numbers.
 */
export function NameToFormula({ onComplete, onBack }: Props) {
  const items = useMemo(() => shuffleArray(nameToFormulaPool).slice(0, NAME_TO_FORMULA_ITEMS), []);
  const total = items.length;
  const [idx, setIdx] = useState(0);
  const item = items[idx];
  const choices = useMemo(
    () => ({ cations: ionChoices(item.cation), anions: ionChoices(item.anion) }),
    [item]
  );

  const [cation, setCation] = useState<Ion | null>(null);
  const [anion, setAnion] = useState<Ion | null>(null);
  const [cationCount, setCationCount] = useState(1);
  const [anionCount, setAnionCount] = useState(1);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  // A right answer counts after a retry unless the game had printed it first
  // (decision 1 (b)): the lowest-ratio verdict names it, and so does the line
  // shown after a second wrong try.
  const [printed, setPrinted] = useState(false);
  const answered = verdict !== null;

  const cardRef = useItemTop<HTMLDivElement>(idx, { anyWidth: true, gap: 0 });
  const promptRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  useRevealAfterCommit(answered, () => ({
    bottom: actionsRef.current,
    tops: [promptRef.current, feedbackRef.current],
    focus: feedbackRef.current,
  }));
  const armed = useArmedAfter(400, `${idx}:${answered}`);
  // "Reyna aftur" brings the controls back: focus moves to them, not to
  // <body>, and a phone shows them with the buttons below.
  const controlsRef = useRef<HTMLDivElement>(null);
  const [retries, setRetries] = useState(0);
  const shownRetries = useRef(retries);
  useLayoutEffect(() => {
    if (shownRetries.current === retries) return;
    shownRetries.current = retries;
    revealSpan(actionsRef.current, [controlsRef.current]);
    focusTarget(controlsRef.current);
  }, [retries]);

  const clear = () => {
    setCation(null);
    setAnion(null);
    setCationCount(1);
    setAnionCount(1);
    setVerdict(null);
  };

  const check = useCallback(() => {
    if (!cation || !anion) return;
    const v = judgeFormula(item, cation, anion, cationCount, anionCount);
    setVerdict(v);
    setAttempts((a) => a + 1);
    if (v === 'right' && !printed) setCorrectCount((n) => n + 1);
    if (v === 'lowest' || (v !== 'right' && attempts >= 1)) setPrinted(true);
  }, [item, cation, anion, cationCount, anionCount, attempts, printed]);

  const next = () => {
    if (idx + 1 >= total) {
      onComplete(correctCount, total);
      return;
    }
    setIdx(idx + 1);
    setAttempts(0);
    setPrinted(false);
    clear();
  };

  const charge = cation && anion ? cation.charge * cationCount + anion.charge * anionCount : null;
  const built =
    (cation ? ionPart(cation, cationCount) : '') + (anion ? ionPart(anion, anionCount) : '');

  const ionButtons = (
    list: Ion[],
    picked: Ion | null,
    pick: (ion: Ion) => void,
    groupLabel: string
  ) => (
    <div role="group" aria-label={groupLabel} className="flex flex-wrap gap-2">
      {list.map((ion) => (
        <button
          key={ion.id}
          aria-pressed={picked?.id === ion.id}
          disabled={answered}
          onClick={() => pick(ion)}
          className={`min-w-[4.5rem] px-3 py-2.5 min-h-[44px] rounded-lg font-mono text-base font-semibold border-2 transition-colors disabled:cursor-not-allowed ${
            picked?.id === ion.id
              ? 'border-kvenno-orange bg-orange-50 text-warm-900'
              : 'border-warm-200 bg-white text-warm-700 hover:border-warm-400'
          }`}
        >
          {ionLabel(ion)}
        </button>
      ))}
    </div>
  );

  const stepper = (ion: Ion | null, count: number, set: (n: number) => void) => (
    <div className="flex items-center gap-2">
      <button
        aria-label={`Færri ${ion ? ionLabel(ion) : ''}`.trim()}
        disabled={answered || !ion || count <= 1}
        onClick={() => set(count - 1)}
        className="h-11 w-11 rounded-lg bg-warm-100 text-xl font-bold text-warm-700 disabled:opacity-40"
      >
        −
      </button>
      <span className="w-6 text-center text-lg font-bold text-warm-800" aria-live="polite">
        {count}
      </span>
      <button
        aria-label={`Fleiri ${ion ? ionLabel(ion) : ''}`.trim()}
        disabled={answered || !ion || count >= MAX_COUNT}
        onClick={() => set(count + 1)}
        className="h-11 w-11 rounded-lg bg-warm-100 text-xl font-bold text-warm-700 disabled:opacity-40"
      >
        +
      </button>
      <span className="font-mono text-sm text-warm-600">× {ion ? ionLabel(ion) : '?'}</span>
    </div>
  );

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
              Frá nafni til formúlu
            </h1>
            <div className="text-lg font-bold text-warm-700">
              {idx + 1}/{total}
            </div>
          </div>
        </div>

        <div
          ref={cardRef}
          className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 phone:p-3 phone:mb-3"
        >
          <div ref={promptRef} data-item-start className="text-center mb-4 phone:mb-2">
            <div className="text-sm text-warm-500">Nafn:</div>
            <div className="text-2xl sm:text-3xl font-bold text-warm-800">{item.compound.name}</div>
            <div
              className="mt-2 font-mono text-2xl text-warm-800 min-h-[2rem]"
              aria-label={built ? `Formúlan þín: ${built}` : 'Formúlan þín er tóm'}
            >
              {built || '?'}
            </div>
            {charge !== null && (
              <div className="text-sm text-warm-600">
                Heildarhleðsla: {charge > 0 ? `+${charge}` : charge < 0 ? `−${-charge}` : '0'}
              </div>
            )}
          </div>

          {verdict !== null && (
            <div
              ref={feedbackRef}
              role="group"
              tabIndex={-1}
              aria-label="Niðurstaða"
              className="mb-4 phone:mb-3"
              onClickCapture={dropEarlyClicks(armed)}
            >
              <FeedbackPanel
                feedback={{
                  isCorrect: verdict === 'right',
                  explanation: explainVerdict(verdict, item, cationCount, anionCount),
                  misconception:
                    verdict === 'lowest'
                      ? 'Formúla jónaefnis segir hlutfall jónanna, ekki fjölda þeirra.'
                      : undefined,
                }}
                config={{ showExplanation: true }}
              />
              {verdict !== 'right' && attempts > 1 && (
                <p className="mt-2 text-sm text-warm-700">
                  Rétt formúla:{' '}
                  <span className="font-mono">{formulaOf(item.cation, item.anion)}</span>
                </p>
              )}
            </div>
          )}

          <div
            ref={controlsRef}
            tabIndex={-1}
            aria-label="Veldu jónir og fjölda"
            className={`space-y-3 outline-none ${answered ? 'phone:hidden' : ''}`}
          >
            <div>
              <div className="text-xs text-warm-600 mb-1">Katjón (jákvæð jón):</div>
              {ionButtons(choices.cations, cation, setCation, 'Katjón')}
            </div>
            <div>
              <div className="text-xs text-warm-600 mb-1">Anjón (neikvæð jón):</div>
              {ionButtons(choices.anions, anion, setAnion, 'Anjón')}
            </div>
            <div>
              <div className="text-xs text-warm-600 mb-1">Hve margar af hvorri?</div>
              <div className="space-y-2">
                {stepper(cation, cationCount, setCationCount)}
                {stepper(anion, anionCount, setAnionCount)}
              </div>
            </div>
          </div>
        </div>

        <div ref={actionsRef} className="flex gap-3">
          {!answered ? (
            <>
              <button
                key="clear"
                onClick={clear}
                className="flex-1 bg-warm-200 hover:bg-warm-300 text-warm-700 font-bold py-3 rounded-xl transition-colors"
              >
                Hreinsa
              </button>
              <button
                key="check"
                onClick={check}
                disabled={!cation || !anion}
                className="flex-1 bg-kvenno-orange hover:bg-kvenno-orange-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Athuga
              </button>
            </>
          ) : (
            <>
              {verdict !== 'right' && (
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
                {idx + 1 < total ? 'Næsta nafn →' : 'Sjá niðurstöður'}
              </button>
            </>
          )}
        </div>

        <button
          onClick={onBack}
          className="mt-4 w-full text-warm-500 hover:text-warm-700 font-semibold py-2 text-sm pointer-coarse:py-3"
        >
          Til baka í valmynd
        </button>
      </div>
    </div>
  );
}
