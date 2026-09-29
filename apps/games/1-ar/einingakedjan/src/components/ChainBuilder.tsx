import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { PinnedActions, TaskStrip } from '@shared/components';
import { useEscapeKey } from '@shared/hooks';
import {
  PIN_QUERY,
  focusTarget,
  isPhone,
  revealSpan,
  shuffleArray,
  useArmedAfter,
  useScreenTop,
} from '@shared/utils';

import { ChainRow } from './ChainRow';
import { PoolCard } from './RatioCard';
import { SolveTrace } from './SolveTrace';
import { UnitsDisplay } from './UnitsDisplay';
import { UnitText } from './UnitText';
import type { Problem } from '../data/problems';
import { ratioById } from '../data/ratios';
import {
  correctionPrompt,
  predictionOptions,
  solveChain,
  type ChainSlot,
  type FixAction,
} from '../engine/chain';
import { flip, formatSignature, orient, type Orientation } from '../engine/units';
import { revealOnDesktop } from '../utils/desktopReveal';

/** How long each step of the worked solution stays on screen before the next appears. */
const STEP_REVEAL_MS = 1200;

function subscribePinLayout(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
  const list = window.matchMedia(PIN_QUERY);
  if (typeof list.addEventListener === 'function') {
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }
  list.addListener?.(onChange);
  return () => list.removeListener?.(onChange);
}

const pinLayoutNow = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia(PIN_QUERY).matches;

/**
 * True on a portrait phone (`PIN_QUERY`, the `pin:` variant): the one layout in
 * which the chain can be pinned under the header and the actions to the foot of
 * the screen. There the actions move below the pool in the DOM, so they sit
 * where the finger is and the tab order stays what is seen. False on a desktop,
 * on a phone on its side and in jsdom, where the board is laid out as it always
 * was.
 */
function usePinLayout(): boolean {
  return useSyncExternalStore(subscribePinLayout, pinLayoutNow, () => false);
}

type Mode = 'building' | 'predicting' | 'tracing' | 'correcting' | 'solved';

interface ChainBuilderProps {
  problems: Problem[];
  /**
   * Ask the student which unit will survive before running the chain.
   *
   * On in the practice phase, off in the apply phase. One tap, no typing — it is
   * what stops the level being beatable by shuffling cards until the game turns
   * green, without turning into another thing to type.
   */
  predictBeforeSolving: boolean;
  onComplete: () => void;
  onBack: () => void;
}

export function ChainBuilder({
  problems,
  predictBeforeSolving,
  onComplete,
  onBack,
}: ChainBuilderProps) {
  const [index, setIndex] = useState(0);
  const [slots, setSlots] = useState<ChainSlot[]>([]);
  const [mode, setMode] = useState<Mode>('building');
  const [revealed, setRevealed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [chosenFix, setChosenFix] = useState<FixAction | null>(null);

  const problem = problems[index];

  const pinLayout = usePinLayout();
  const ids = useId();
  const domId = (part: string) => `${ids}-${part}`;

  const scenarioRef = useRef<HTMLDivElement>(null);
  const chainBoxRef = useRef<HTMLDivElement>(null);
  const chainHeadingRef = useRef<HTMLHeadingElement>(null);
  const chainRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const predictionOptionsRef = useRef<HTMLDivElement>(null);
  const predictionButtonsRef = useRef<Record<string, HTMLButtonElement | null>>({});
  const skipRef = useRef<HTMLButtonElement>(null);
  const outcomeRef = useRef<HTMLDivElement>(null);
  const fixButtonsRef = useRef<Record<string, HTMLButtonElement | null>>({});
  const predictionFeedbackRef = useRef<HTMLDivElement>(null);
  const fixFeedbackRef = useRef<HTMLDivElement>(null);
  const fixOptionsRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);

  // Shuffled once per problem: position in the pool must not hint at the answer.
  const pool = useMemo(
    () => shuffleArray(problem.poolIds.map(ratioById)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [problem.id]
  );

  const result = useMemo(
    () => solveChain(problem.start, slots, [...pool], problem.target),
    [problem, slots, pool]
  );

  const predictions = useMemo(
    () =>
      mode === 'predicting'
        ? shuffleArray(predictionOptions(problem.start, slots, [...pool], problem.target))
        : [],
    [mode, problem, slots, pool]
  );

  // Shuffled once per prompt, for the same reason as the pool: correctionPrompt
  // lists the correct fix first in every branch, so in that order a student could
  // learn to tap the top option without reading any of them.
  const prompt = useMemo(() => {
    if (mode !== 'correcting') return null;
    const built = correctionPrompt(result, problem.target, [...pool]);
    return built && { ...built, options: shuffleArray(built.options) };
  }, [mode, result, problem.target, pool]);

  const resetProblem = useCallback(() => {
    setSlots([]);
    setMode('building');
    setRevealed(0);
    setShowHint(false);
    setPrediction(null);
    setChosenFix(null);
  }, []);

  // Escape backs out one layer at a time: out of the worked solution first, and
  // only out of the game itself once the student is back at the board.
  const handleEscape = useCallback(() => {
    if (mode === 'building') {
      onBack();
      return;
    }
    setMode('building');
    setRevealed(0);
    setPrediction(null);
    setChosenFix(null);
  }, [mode, onBack]);

  useEscapeKey(handleEscape);

  // Reveal the worked solution one step at a time, then settle into the outcome.
  useEffect(() => {
    if (mode !== 'tracing') return undefined;

    if (revealed >= result.steps.length) {
      const settle = setTimeout(
        () => setMode(result.status === 'solved' ? 'solved' : 'correcting'),
        600
      );
      return () => clearTimeout(settle);
    }

    const tick = setTimeout(() => setRevealed((r) => r + 1), STEP_REVEAL_MS);
    return () => clearTimeout(tick);
  }, [mode, revealed, result]);

  // Every change below lands away from the finger that caused it on a phone,
  // where the board is several screens tall. On a phone the shared helpers in
  // `@shared/utils` bring in as much of what the student needs as fits — never
  // just the button — and focus moves to what changed, since most of these
  // taps unmount the button pressed (design P2, P3). A desktop window keeps the
  // game's old reveals exactly (`revealOnDesktop`), and focus moves there too.

  // A new problem replaces the statement at the top of the page: start there,
  // at any width, as the game always did, with focus on the new problem.
  useScreenTop(index, { anyWidth: true, focus: scenarioRef });

  // The failed step of the worked solution, for the correction's reveal.
  const failedStepEl = () =>
    result.failedSlot === undefined
      ? null
      : (panelRef.current?.querySelectorAll('ol > li')[result.failedSlot + 1] ?? null);

  // A pool card is added to the chain. On a portrait phone the chain is pinned
  // under the header, where the new card is already on screen (ChainRow scrolls
  // it in sideways); where it is not pinned, the least move that shows the
  // chain. A desktop window keeps the old reveal of the card and the buttons.
  const shownSlotCount = useRef(slots.length);
  useEffect(() => {
    const added = slots.length > shownSlotCount.current;
    shownSlotCount.current = slots.length;
    if (!added || mode !== 'building') return;
    if (isPhone()) {
      const row = chainRef.current;
      if (row && !row.closest('[data-pinned-top]')) revealSpan(row);
      return;
    }
    const placed = chainRef.current?.querySelectorAll('[data-slot]');
    revealOnDesktop(placed?.[placed.length - 1], actionsRef.current);
  }, [slots.length, mode]);

  // The board is swapped for the prediction, the worked solution or its outcome,
  // and back again. "Næsta dæmi" also returns to the board, but there the new
  // statement at the top of the page is what to show, and useScreenTop above
  // has done it.
  const shownMode = useRef(mode);
  const modeIndex = useRef(index);
  useEffect(() => {
    const sameProblem = modeIndex.current === index;
    modeIndex.current = index;
    if (shownMode.current === mode) return;
    const from = shownMode.current;
    shownMode.current = mode;
    if (!sameProblem) return;
    const phone = isPhone();
    const trace = () => panelRef.current?.querySelector<HTMLElement>('ol') ?? null;
    if (mode === 'building') {
      // Back from the worked solution: the chain, with focus on its heading.
      if (phone) revealSpan(chainRef.current, [chainHeadingRef.current]);
      else revealOnDesktop(chainBoxRef.current);
      focusTarget(chainHeadingRef.current);
    } else if (mode === 'predicting') {
      if (phone) revealSpan(predictionOptionsRef.current, [panelRef.current]);
      else revealOnDesktop(panelRef.current);
      focusTarget(panelRef.current);
    } else if (mode === 'tracing') {
      if (phone) revealSpan(skipRef.current ?? trace(), [panelRef.current]);
      else revealOnDesktop(panelRef.current);
      focusTarget(trace());
    } else if (from === 'tracing' || from === 'predicting') {
      // The worked solution settled into its outcome: the verdict and what to
      // do next, with the step that broke the chain above them where it fits.
      if (phone) {
        const lastStep = panelRef.current?.querySelector('ol > li:last-child') ?? null;
        // The correction: the step that broke the chain and the fixes on offer
        // together where they fit (design §4).
        if (mode === 'solved') revealSpan(outcomeRef.current, [lastStep, outcomeRef.current]);
        else revealSpan(fixOptionsRef.current, [failedStepEl(), outcomeRef.current]);
      } else revealOnDesktop(outcomeRef.current);
      focusTarget(outcomeRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, index]);

  // The worked solution grows downwards one step at a time.
  useEffect(() => {
    if (mode !== 'tracing' || revealed === 0) return;
    const shown = panelRef.current?.querySelectorAll('ol > li');
    const last = shown?.[shown.length - 1];
    if (isPhone()) revealSpan(skipRef.current ?? last, [last]);
    else revealOnDesktop(last);
  }, [mode, revealed]);

  // The prediction is answered: its feedback and "Sýna útreikninginn", with the
  // chosen option above them where it fits; focus on the feedback, not on the
  // button (design P3).
  useEffect(() => {
    if (prediction === null) return;
    const feedback = predictionFeedbackRef.current;
    if (isPhone()) {
      revealSpan(feedback, [
        panelRef.current,
        predictionButtonsRef.current[prediction] ?? null,
        feedback,
      ]);
    } else revealOnDesktop(feedback);
    focusTarget(feedback);
  }, [prediction]);

  // A fix is chosen: its explanation and the button that follows, with the
  // step that broke the chain above them where it fits. "Velja aftur" returns
  // focus to the question.
  const shownFix = useRef(chosenFix);
  useEffect(() => {
    const before = shownFix.current;
    shownFix.current = chosenFix;
    if (chosenFix === null) {
      if (before !== null && mode === 'correcting') focusTarget(outcomeRef.current);
      return;
    }
    const feedback = fixFeedbackRef.current;
    if (isPhone()) {
      revealSpan(feedback, [failedStepEl(), fixButtonsRef.current[chosenFix] ?? null, feedback]);
    } else revealOnDesktop(feedback);
    focusTarget(feedback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosenFix]);

  // The hint opens away from the button: on a desktop and a phone on its side
  // below the buttons, which are usually at the bottom edge of the screen when
  // tapped; on a portrait phone just above the pinned buttons, under the pool.
  useEffect(() => {
    if (!showHint) return;
    if (isPhone()) revealSpan(hintRef.current);
    else revealOnDesktop(hintRef.current);
  }, [showHint]);

  // The button that follows each commit ignores a press within 400 ms of
  // appearing, so the second tap of a double tap cannot skip what the first one
  // brought up (design P3). The prediction's options and the fixes are guarded
  // too, and so is "Sýna öll skrefin strax": each appears where "Leysa" or the
  // last button was.
  const armedMode = useArmedAfter(400, `${index}:${mode}`);
  const armedPrediction = useArmedAfter(400, prediction);
  const armedFix = useArmedAfter(400, chosenFix);

  // The board's own controls are guarded the same way once the student has
  // left it and come back — "Laga og reyna aftur", "Prófa aðra leið" or "Næsta
  // dæmi". On a portrait phone the pinned bar is at the foot of the screen,
  // where those buttons were, so without this the second tap of a double tap
  // landed on "Byrja upp á nýtt" and emptied the chain just fixed. Not before
  // the first change: the board the phase opens on has nothing to skip.
  const boardReturned = useRef(false);
  const boardKey = useRef(`${index}:${mode}`);
  useLayoutEffect(() => {
    const key = `${index}:${mode}`;
    if (boardKey.current !== key) boardReturned.current = true;
    boardKey.current = key;
  }, [index, mode]);
  const armedBoard =
    <A extends unknown[]>(fn: (...args: A) => void) =>
    (...args: A) =>
      boardReturned.current ? armedMode(fn)(...args) : fn(...args);

  // "Byrja upp á nýtt" and a card's ✕ unmount the button just pressed: keep
  // focus in the chain, on its heading, rather than let it fall to <body>.
  const refocusChain = useRef(false);
  const keepFocusInChain = () => {
    refocusChain.current = true;
  };
  useLayoutEffect(() => {
    if (!refocusChain.current) return;
    refocusChain.current = false;
    const active = document.activeElement;
    if (!active || active === document.body) focusTarget(chainHeadingRef.current);
  }, [slots]);

  const addRatio = (id: string) => {
    setSlots((current) => [...current, { equivalenceId: id, orientation: 'forward' }]);
  };

  const flipSlot = (position: number) => {
    setSlots((current) =>
      current.map((slot, i) =>
        i === position ? { ...slot, orientation: flip(slot.orientation) } : slot
      )
    );
  };

  const removeSlot = (position: number) => {
    setSlots((current) => current.filter((_, i) => i !== position));
  };

  const startSolving = () => {
    setChosenFix(null);
    setRevealed(0);
    setPrediction(null);
    setMode(predictBeforeSolving ? 'predicting' : 'tracing');
  };

  const applyFix = (action: FixAction) => {
    if (action === 'flip' && result.failedSlot !== undefined) flipSlot(result.failedSlot);
    if (action === 'remove' && result.failedSlot !== undefined) removeSlot(result.failedSlot);
    // 'addStep' needs no edit — the student goes back and lengthens the chain.
    setMode('building');
    setRevealed(0);
    setChosenFix(null);
  };

  const nextProblem = () => {
    if (index + 1 >= problems.length) {
      onComplete();
      return;
    }
    setIndex(index + 1);
    setSlots([]);
    setMode('building');
    setRevealed(0);
    setShowHint(false);
    setPrediction(null);
    setChosenFix(null);
  };

  const orientedSlots = slots.map((slot) => ({
    slot,
    ratio: orient(ratioById(slot.equivalenceId), slot.orientation as Orientation),
  }));

  const chosenOption = prompt?.options.find((o) => o.id === chosenFix) ?? null;

  // Each half of the prediction feedback is said only where it is true of this
  // chain. Predicting a broken chain's outcome is worth crediting, but that chain
  // will not "ganga upp"; and a chain that works does not "sveigja af leið".
  const predictedRight = predictions.find((o) => o.label === prediction)?.correct ?? false;
  const predictionFeedback = predictedRight
    ? `Rétt lesið úr keðjunni.${
        result.status === 'solved' ? ' Sjáum hana ganga upp skref fyrir skref.' : ''
      }`
    : `Ekki alveg — keðjan þín endar á annarri einingu en þú bjóst við.${
        result.failedSlot !== undefined ? ' Fylgstu með hvar hún sveigir af leið.' : ''
      }`;

  const orientedRatios = orientedSlots.map(({ ratio }, position) => ({
    key: `${ratio.equivalence.id}-${position}`,
    ratio,
  }));

  const leysaClasses = `game-btn rounded-lg bg-kvenno-orange py-2.5 font-semibold text-white hover:bg-kvenno-orange-dark disabled:opacity-40 ${
    pinLayout ? 'px-4' : 'px-5'
  }`;
  // In the pinned bar on a portrait phone the two secondary buttons may wrap
  // their words onto two lines rather than push the bar onto a second row;
  // "Leysa" keeps its width.
  const secondaryClasses = pinLayout
    ? 'game-btn rounded-lg border border-warm-300 px-2.5 py-1.5 text-sm leading-tight text-warm-700 hover:bg-warm-50 pointer-coarse:min-h-11'
    : 'game-btn rounded-lg border border-warm-300 px-4 py-2.5 text-warm-700 hover:bg-warm-50';

  const leysa = (
    <button
      key="leysa"
      type="button"
      onClick={armedBoard(startSolving)}
      disabled={slots.length === 0}
      className={leysaClasses}
    >
      Leysa
    </button>
  );
  const hintToggle = (
    <button
      key="hint"
      type="button"
      onClick={armedBoard(() => setShowHint((s) => !s))}
      className={secondaryClasses}
      aria-expanded={showHint}
    >
      {showHint ? 'Fela vísbendingu' : 'Vísbending'}
    </button>
  );
  const startOver = slots.length > 0 && (
    <button
      key="reset"
      type="button"
      onClick={armedBoard(() => {
        resetProblem();
        keepFocusInChain();
      })}
      className={secondaryClasses}
    >
      Byrja upp á nýtt
    </button>
  );
  const hint = showHint && (
    <p
      ref={hintRef}
      className="fade-in mt-3 rounded-lg bg-sky-50 p-3 text-sm text-sky-900 phone:mt-2 phone:p-2.5"
    >
      {problem.hint}
    </p>
  );

  const poolContent = (
    <>
      <h3 className="mb-1 font-semibold text-warm-800">Hlutföll í boði</h3>
      <p className="mb-3 text-sm text-warm-600 phone:mb-2">
        Hvert spjald er staðreynd sem má nota í báðar áttir. Þegar þú setur það í keðjuna velur þú
        hvorum megin við strikið hvor einingin lendir.
      </p>
      {/* On a phone two cards to a row where they fit; a card whose text is
          wider than half the row takes the whole row rather than break a unit
          apart. */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 phone:flex phone:flex-wrap phone:gap-2">
        {pool.map((equivalence) => (
          <PoolCard
            key={equivalence.id}
            equivalence={equivalence}
            className="phone:flex-[1_1_9rem]"
            onAdd={armedBoard(() => addRatio(equivalence.id))}
          />
        ))}
      </div>
    </>
  );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center justify-between phone:mb-2">
        <button
          type="button"
          onClick={onBack}
          className="game-btn rounded-lg border border-warm-300 px-3 py-1.5 text-sm text-warm-700 hover:bg-warm-50 pointer-coarse:min-h-11"
        >
          ← Aftur í valmynd
        </button>
        <span className="text-sm text-warm-600">
          Dæmi {index + 1} af {problems.length}
        </span>
      </div>

      {/* Scenario */}
      <div
        ref={scenarioRef}
        data-item-start
        className="mb-4 rounded-xl bg-white p-5 shadow-sm phone:mb-3 phone:p-3"
      >
        <div className="flex gap-3 sm:gap-4">
          <span className="text-3xl sm:text-4xl phone:text-2xl" aria-hidden="true">
            {problem.icon}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-warm-800">{problem.context}</p>
            <p className="mt-3 text-warm-800 phone:mt-2">
              <strong>Finndu {problem.goal}.</strong>
            </p>
            {/* Stacked on a phone, where the two chips never fit on one line and the
                arrow was left dangling at the end of the first. */}
            <div className="mt-3 flex flex-col items-start gap-2 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 phone:mt-2 phone:gap-1">
              <span className="rounded-lg bg-warm-100 px-3 py-1.5 phone:py-1">
                Þú ert með:{' '}
                <UnitsDisplay quantity={problem.start} valueLabel={problem.startLabel} />
              </span>
              <span
                aria-hidden="true"
                className="ml-4 rotate-90 text-warm-400 sm:ml-0 sm:rotate-0 phone:leading-none"
              >
                →
              </span>
              <span className="rounded-lg bg-orange-100 px-3 py-1.5 text-orange-900 phone:py-1">
                Markið: <UnitText text={formatSignature(problem.target)} />
              </span>
            </div>
            {problem.equation && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 font-mono text-sm text-amber-900 phone:mt-2 phone:py-1.5">
                {problem.equation}
              </p>
            )}
          </div>
        </div>
      </div>

      {mode === 'building' && (
        // On a phone on its side the chain and the pool sit side by side, so a
        // card and what it did are on screen together. Plain blocks elsewhere.
        <div className="phone-land:grid phone-land:grid-cols-2 phone-land:items-start phone-land:gap-3">
          {/* The chain under construction. On a portrait phone this card holds
              the pool as well, so the chain can stay pinned under the header
              while the student picks from the pool below it, and the actions
              stay pinned at the foot of the screen (design §4, P7, P8): both
              stick only inside the card that holds them. */}
          <div
            ref={chainBoxRef}
            role="group"
            aria-labelledby={domId('chain')}
            className="mb-4 rounded-xl bg-white p-5 shadow-sm phone:mb-3 phone:p-3 phone-land:mb-0"
          >
            <h3
              ref={chainHeadingRef}
              id={domId('chain')}
              className="mb-3 font-semibold text-warm-800 phone:mb-2"
            >
              Keðjan þín
            </h3>
            <TaskStrip pinnedClassName="pin:-mx-3 pin:px-3 pin:py-2">
              <ChainRow
                rowRef={chainRef}
                start={problem.start}
                startLabel={problem.startLabel}
                ratios={orientedRatios}
                markSlots
                className="flex-wrap"
                onFlip={armedBoard(flipSlot)}
                onRemove={armedBoard((position: number) => {
                  removeSlot(position);
                  keepFocusInChain();
                })}
                empty={
                  <p className="flex items-center text-sm text-warm-500 phone:min-w-0">
                    Veldu hlutfall úr safninu hér að neðan til að byrja keðjuna.
                  </p>
                }
              />
            </TaskStrip>

            {pinLayout ? (
              <>
                <div className="mt-4 border-t border-warm-200 pt-3">{poolContent}</div>
                {hint}
                <PinnedActions pinnedClassName="pin:-mx-3 pin:px-3">
                  <div ref={actionsRef} className="mt-3 flex gap-1.5 [[data-pinned-bottom]>&]:mt-0">
                    {hintToggle}
                    {startOver}
                    <span className="ml-auto flex shrink-0">{leysa}</span>
                  </div>
                </PinnedActions>
              </>
            ) : (
              <>
                <div ref={actionsRef} className="mt-4 flex flex-wrap gap-3 phone:mt-3 phone:gap-2">
                  {leysa}
                  {hintToggle}
                  {startOver}
                </div>
                {hint}
              </>
            )}
          </div>

          {/* The pool */}
          {!pinLayout && (
            <div className="rounded-xl bg-white p-5 shadow-sm phone:p-3">{poolContent}</div>
          )}
        </div>
      )}

      {mode === 'predicting' && (
        <div
          ref={panelRef}
          role="group"
          aria-labelledby={domId('predict')}
          className="fade-in rounded-xl bg-white p-5 shadow-sm phone:p-3"
        >
          <h3 id={domId('predict')} className="mb-1 font-semibold text-warm-800">
            Áður en við reiknum
          </h3>
          <p className="mb-4 text-sm text-warm-600 phone:mb-2">
            Horfðu á keðjuna sem þú byggðir. Hvaða eining stendur eftir þegar allt hefur styst út?
          </p>
          {/* The chain that sentence is about. Read-only: once the options are on
              screen it is too late to change it. */}
          <ChainRow
            groupLabel="Keðjan þín"
            start={problem.start}
            startLabel={problem.startLabel}
            ratios={orientedRatios}
            className="mb-4 flex-wrap rounded-lg bg-warm-50 p-3 phone:mb-3 phone:p-2"
          />
          <div ref={predictionOptionsRef} className="grid gap-2 sm:grid-cols-2">
            {predictions.map((option) => {
              const chosen = prediction === option.label;
              return (
                <button
                  key={option.label}
                  ref={(el) => {
                    predictionButtonsRef.current[option.label] = el;
                  }}
                  type="button"
                  onClick={armedMode(() => setPrediction(option.label))}
                  disabled={prediction !== null}
                  className={`game-btn rounded-lg border-2 px-4 py-3 text-left transition disabled:cursor-default phone:py-2.5 ${
                    prediction === null
                      ? 'border-warm-200 hover:border-kvenno-orange hover:bg-orange-50'
                      : option.correct
                        ? 'border-green-500 bg-green-50 text-green-900'
                        : chosen
                          ? 'border-red-400 bg-red-50 text-red-900'
                          : 'border-warm-200 opacity-50'
                  }`}
                >
                  <UnitText text={option.label} />
                </button>
              );
            })}
          </div>

          {prediction !== null && (
            <div
              ref={predictionFeedbackRef}
              role="group"
              aria-labelledby={domId('predict-feedback')}
              className="fade-in mt-4 phone:mt-3"
            >
              <p id={domId('predict-feedback')} className="text-sm text-warm-700">
                {predictionFeedback}
              </p>
              <button
                key="show-trace"
                type="button"
                onClick={armedPrediction(() => setMode('tracing'))}
                className="game-btn mt-3 rounded-lg bg-kvenno-orange px-5 py-2.5 font-semibold text-white hover:bg-kvenno-orange-dark phone:mt-2"
              >
                Sýna útreikninginn
              </button>
            </div>
          )}
        </div>
      )}

      {(mode === 'tracing' || mode === 'correcting' || mode === 'solved') && (
        <div ref={panelRef} className="rounded-xl bg-warm-50 p-5 shadow-sm phone:p-3">
          <SolveTrace
            start={problem.start}
            startLabel={problem.startLabel}
            steps={result.steps}
            revealed={mode === 'tracing' ? revealed : result.steps.length}
            failedStep={result.failedSlot}
          />

          {mode === 'tracing' && revealed < result.steps.length && (
            <button
              key="skip"
              ref={skipRef}
              type="button"
              onClick={armedMode(() => {
                setRevealed(result.steps.length);
                // The button goes; keep focus in the worked solution.
                focusTarget(panelRef.current?.querySelector<HTMLElement>('ol'));
              })}
              className="game-btn mt-4 rounded-lg border border-warm-300 bg-white px-4 py-2 text-sm text-warm-700 hover:bg-warm-100 pointer-coarse:min-h-11 phone:mt-3"
            >
              Sýna öll skrefin strax
            </button>
          )}

          {mode === 'solved' && (
            <div
              ref={outcomeRef}
              role="group"
              aria-labelledby={domId('solved')}
              className="fade-in mt-4 rounded-lg border-2 border-green-400 bg-green-50 p-4 phone:mt-3 phone:p-3"
            >
              <p id={domId('solved')} className="font-semibold text-green-900">
                Keðjan gengur upp. Allar einingar styttust út nema markið.
              </p>
              <p className="mt-2 text-lg text-green-900">
                Svar: <UnitsDisplay quantity={result.final} className="font-bold" />
              </p>
              <p className="mt-3 rounded-lg bg-white/70 p-3 text-sm text-green-900 phone:mt-2 phone:p-2.5">
                <strong>Af hverju skiptir þetta máli?</strong> {problem.why}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 phone:mt-3 phone:gap-2">
                <button
                  key="next"
                  type="button"
                  onClick={armedMode(nextProblem)}
                  className="game-btn rounded-lg bg-kvenno-orange px-5 py-2.5 font-semibold text-white hover:bg-kvenno-orange-dark"
                >
                  {index + 1 >= problems.length ? 'Ljúka' : 'Næsta dæmi'}
                </button>
                <button
                  key="again"
                  type="button"
                  onClick={armedMode(resetProblem)}
                  className="game-btn rounded-lg border border-warm-300 bg-white px-4 py-2.5 text-warm-700 hover:bg-warm-50"
                >
                  Prófa aðra leið
                </button>
              </div>
            </div>
          )}

          {mode === 'correcting' && prompt && (
            <div
              ref={outcomeRef}
              role="group"
              aria-labelledby={domId('fix-question')}
              className="fade-in mt-4 rounded-lg border-2 border-amber-400 bg-amber-50 p-4 phone:mt-3 phone:p-3"
            >
              <p className="text-amber-900">
                <UnitText text={prompt.problem} />
              </p>
              <p
                id={domId('fix-question')}
                className="mt-3 font-semibold text-amber-900 phone:mt-2"
              >
                {prompt.question}
              </p>
              <div ref={fixOptionsRef} className="mt-3 grid gap-2 phone:mt-2">
                {prompt.options.map((option) => {
                  const chosen = chosenFix === option.id;
                  return (
                    <button
                      key={option.id}
                      ref={(el) => {
                        fixButtonsRef.current[option.id] = el;
                      }}
                      type="button"
                      onClick={armedMode(() => setChosenFix(option.id))}
                      className={`game-btn rounded-lg border-2 px-4 py-2.5 text-left transition ${
                        chosen
                          ? option.correct
                            ? 'border-green-500 bg-green-50 text-green-900'
                            : 'border-red-400 bg-red-50 text-red-900'
                          : 'border-warm-200 bg-white hover:border-amber-500'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {chosenOption && (
                <div
                  ref={fixFeedbackRef}
                  role="group"
                  aria-labelledby={domId('fix-feedback')}
                  className="fade-in mt-3"
                >
                  <p
                    id={domId('fix-feedback')}
                    className={`rounded-lg p-3 text-sm phone:p-2.5 ${
                      chosenOption.correct
                        ? 'bg-green-100 text-green-900'
                        : 'bg-red-100 text-red-900'
                    }`}
                  >
                    <UnitText text={chosenOption.explanation} />
                  </p>
                  {chosenOption.correct ? (
                    <button
                      key="apply-fix"
                      type="button"
                      onClick={armedFix(() => applyFix(chosenOption.id))}
                      className="game-btn mt-3 rounded-lg bg-kvenno-orange px-5 py-2.5 font-semibold text-white hover:bg-kvenno-orange-dark"
                    >
                      {chosenOption.id === 'addStep' ? 'Lengja keðjuna' : 'Laga og reyna aftur'}
                    </button>
                  ) : (
                    <button
                      key="choose-again"
                      type="button"
                      onClick={armedFix(() => setChosenFix(null))}
                      className="game-btn mt-3 rounded-lg border border-warm-300 bg-white px-4 py-2 text-sm text-warm-700 hover:bg-warm-50 pointer-coarse:min-h-11"
                    >
                      Velja aftur
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
