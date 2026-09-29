import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';

import { Presence } from '@shared/components';
import {
  focusTarget,
  formatDecimal,
  isPhone,
  revealSpan,
  revealTop,
  useArmedAfter,
  useIsPhone,
  useItemTop,
  useRevealAfterCommit,
} from '@shared/utils';

import { Burette } from './Burette';
import { Flask } from './Flask';
import { IndicatorSelector } from './IndicatorSelector';
import { TitrationCurve } from './TitrationCurve';
import { indicators } from '../data/indicators';
import { LEVEL2_PUZZLES } from '../data/level2-puzzles';
import { getTitrationById } from '../data/titrations';
import type { MonoproticTitration, IndicatorType } from '../types';
import { calculatePH, generateTitrationCurve } from '../utils/ph-calculations';

interface Level2Props {
  onComplete: (score: number) => void;
  onBack: () => void;
}

/** Exit duration of the marking panel's Presence. */
const MARKING_EXIT_MS = 250;

/** Exit duration of the other Presences here (the pour controls, the hint, Staðfesta val). */
const PANEL_EXIT_MS = 250;

/** Below lg the indicator list is stacked under the apparatus. */
const isBelowLg = () =>
  typeof window.matchMedia === 'function' && !window.matchMedia('(min-width: 1024px)').matches;

export function Level2({ onComplete, onBack }: Level2Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [, setHintsUsed] = useState(0);
  const [completed, setCompleted] = useState(0);
  const levelCompleteReported = useRef(false);
  const [attempt, setAttempt] = useState(0);
  const phone = useIsPhone();

  // Titration state
  const [volumeAdded, setVolumeAdded] = useState(0);
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorType | null>(null);
  const [isPouring, setIsPouring] = useState(false);
  const [isSwirling, setIsSwirling] = useState(false);
  const [curveData, setCurveData] = useState<{ volume: number; pH: number }[]>([]);

  // UI state
  const [showHint, setShowHint] = useState(false);
  const [phase, setPhase] = useState<'titrating' | 'marking' | 'select-indicator' | 'result'>(
    'titrating'
  );
  const [submittedVolume, setSubmittedVolume] = useState<number | null>(null);
  const [markedVolume, setMarkedVolume] = useState<number>(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [indicatorCorrect, setIndicatorCorrect] = useState(false);

  // The indicator list is where the student is working from choosing an
  // indicator until the next puzzle: the item's start (`data-item-start`)
  // moves to it for those two stages and back to the titration's name after.
  const indicatorStage = phase === 'select-indicator' || phase === 'result';

  const puzzle = LEVEL2_PUZZLES[currentIndex];
  const titration = getTitrationById(puzzle.titrationId) as MonoproticTitration | null;

  // Calculate current pH
  const currentPH = titration ? calculatePH(titration, volumeAdded) : 7;

  // Generate curve data for current titration
  useEffect(() => {
    if (titration) {
      const fullCurve = generateTitrationCurve(titration, 60);
      setCurveData(fullCurve);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only regenerate curve when titration ID changes
  }, [titration?.id]);

  // Reset state when changing puzzles
  useEffect(() => {
    setVolumeAdded(0);
    setSelectedIndicator(null);
    setPhase('titrating');
    setShowHint(false);
    setSubmittedVolume(null);
    setMarkedVolume(0);
    setIsCorrect(false);
    setIndicatorCorrect(false);
  }, [currentIndex]);

  // The level heading takes focus as the level mounts (the menu button that
  // opened it has gone).
  const headingRef = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    focusTarget(headingRef.current);
  }, []);

  // "Næsta" and "Reyna aftur" start the puzzle again at the level's top when
  // that top has scrolled above the screen, and focus the titration's name
  // (`data-item-start`). It did this at every width before it moved to the
  // shared helper, so it still does (`anyWidth`).
  const levelRef = useItemTop<HTMLDivElement>(`${currentIndex}:${attempt}`, { anyWidth: true });

  // Marking (design P10): on a phone the curve comes to the top with the
  // marking panel under it, once the pour controls above it have left; focus
  // goes to the panel's heading at every width.
  const curveRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (phase !== 'marking') return;
    revealTop(curveRef.current, { always: true, afterExit: PANEL_EXIT_MS });
  }, [phase]);
  // The panel mounts a render after the phase changes (Presence), so its
  // heading is focused as it attaches.
  const markingHeadingRef = useCallback((el: HTMLDivElement | null) => {
    if (el) focusTarget(el);
  }, []);

  // The result: on a phone the verdict through "Næsta" where it fits, else the
  // verdict at the top, once "Staðfesta val" and the hint above it have left.
  // Focus goes to the result, not to "Næsta" (P3).
  const resultRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  useRevealAfterCommit(
    phase === 'result',
    () => ({ bottom: nextRef.current, tops: [resultRef.current], focus: resultRef.current }),
    { afterExit: PANEL_EXIT_MS + 50 }
  );
  // Opening the hint replaces its button with the hint, which dropped focus to
  // <body> (P3.5): bring the hint into view on a phone and move focus to it.
  // The hint renders in one place or the other, never both, so one ref serves.
  const hintRef = useRef<HTMLDivElement>(null);
  useRevealAfterCommit(showHint, () => ({
    bottom: hintRef.current,
    tops: [hintRef.current],
    focus: hintRef.current,
  }));
  // A double tap on "Staðfesta val" must not press what the result puts there.
  const armed = useArmedAfter(400, `${currentIndex}:${attempt}:${phase}`);

  // Check completion
  useEffect(() => {
    if (completed >= LEVEL2_PUZZLES.length && !levelCompleteReported.current) {
      levelCompleteReported.current = true;
      onComplete(score);
    }
  }, [completed, score, onComplete]);

  // Pouring interval
  useEffect(() => {
    if (!isPouring || !titration) return;

    const interval = setInterval(() => {
      setVolumeAdded((prev) => {
        const newVolume = Math.min(prev + 0.1, 60);
        return Math.round(newVolume * 100) / 100;
      });
      setIsSwirling(true);
    }, 50);

    return () => {
      clearInterval(interval);
      setIsSwirling(false);
    };
  }, [isPouring, titration]);

  const handleAddDrop = useCallback(() => {
    if (phase !== 'titrating') return;
    setVolumeAdded((prev) => {
      const newVolume = Math.min(prev + 0.05, 60);
      return Math.round(newVolume * 1000) / 1000;
    });
    setIsSwirling(true);
    setTimeout(() => setIsSwirling(false), 200);
  }, [phase]);

  const handleAdd1mL = useCallback(() => {
    if (phase !== 'titrating') return;
    setVolumeAdded((prev) => {
      const newVolume = Math.min(prev + 1, 60);
      return Math.round(newVolume * 100) / 100;
    });
    setIsSwirling(true);
    setTimeout(() => setIsSwirling(false), 300);
  }, [phase]);

  const handleAdd5mL = useCallback(() => {
    if (phase !== 'titrating') return;
    setVolumeAdded((prev) => {
      const newVolume = Math.min(prev + 5, 60);
      return Math.round(newVolume * 100) / 100;
    });
    setIsSwirling(true);
    setTimeout(() => setIsSwirling(false), 500);
  }, [phase]);

  const handleEnterMarking = () => {
    if (!titration) return;
    // Default marker to midpoint of added volume range
    setMarkedVolume(Math.round((volumeAdded / 2) * 10) / 10);
    setPhase('marking');
  };

  // Touch cannot place a range thumb to 0.1 mL, so the marking step also
  // takes ±0.1 mL nudges (the arrow keys already do this on a keyboard).
  const nudgeMarkedVolume = (delta: number) => {
    setMarkedVolume((prev) =>
      Math.min(volumeAdded, Math.max(0, Math.round((prev + delta) * 10) / 10))
    );
  };

  // "← Til baka" from marking reopens the pour controls, which took focus's
  // place: focus goes to the first of them, and on a phone the controls come
  // on screen with the curve under them.
  const controlsRef = useRef<HTMLDivElement>(null);
  const backToTitrating = useRef(false);
  const handleBackToTitrating = () => {
    backToTitrating.current = true;
    setPhase('titrating');
  };
  useEffect(() => {
    if (phase !== 'titrating' || !backToTitrating.current) return;
    backToTitrating.current = false;
    // The controls mount a render later (Presence) and the marking panel
    // leaves over MARKING_EXIT_MS, so both wait for it.
    const timer = window.setTimeout(() => {
      revealSpan(curveRef.current, [controlsRef.current]);
      focusTarget(controlsRef.current?.querySelector('button'));
    }, MARKING_EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const handleSubmitMarkedVolume = () => {
    if (!titration) return;
    setSubmittedVolume(markedVolume);
    setPhase('select-indicator');
  };

  const handleIndicatorSelect = (indicator: IndicatorType) => {
    if (phase === 'select-indicator') {
      setSelectedIndicator(indicator);
    }
  };

  const handleSubmitIndicator = () => {
    if (!titration || submittedVolume === null || !selectedIndicator) return;

    const equivalenceVolume = titration.equivalenceVolume;
    const volumeError = Math.abs(submittedVolume - equivalenceVolume);
    const volumeCorrect = volumeError <= puzzle.volumeTolerance;
    const indicatorOk = puzzle.acceptableIndicators.includes(selectedIndicator);

    setIsCorrect(volumeCorrect && indicatorOk);
    setIndicatorCorrect(indicatorOk);
    setPhase('result');

    if (volumeCorrect && indicatorOk) {
      const points = 100;
      setScore((prev) => prev + points);
    }
  };

  const handleShowHint = () => {
    if (!showHint) {
      setShowHint(true);
      setHintsUsed((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setCompleted((prev) => prev + 1);

    if (currentIndex < LEVEL2_PUZZLES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      // In the same render as the new puzzle, not a render later in the reset
      // effect, so the titration's name is the item start "Næsta" focuses.
      setPhase('titrating');
    }
  };

  // Below lg the indicator list sits under the apparatus, off screen on a
  // phone, so confirming the marked volume looked like it did nothing. The
  // scroll waits out the marking panel's exit: that panel sits above the list,
  // and scrolling while it was still in the page left the top of the list
  // 200-300 px above the screen once it unmounted (at 320 px and in landscape).
  // Focus moves to the list's heading at every width.
  const indicatorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (phase !== 'select-indicator') return;
    const timer = window.setTimeout(() => {
      if (isBelowLg()) revealTop(indicatorRef.current, { anyWidth: true, always: true });
      focusTarget(indicatorRef.current?.querySelector('h3'));
    }, MARKING_EXIT_MS + 50);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // The confirm button appears under the list once an indicator is picked. At
  // 320 px and in landscape the list is taller than the screen, so bring the
  // button up instead of leaving it below the fold (the least move, as it
  // always was below lg).
  // On a phone it waits out the button's own entry (it rises into place) and
  // keeps the list's heading on screen with it where both fit.
  const revealConfirmIndicator = useCallback((el: HTMLButtonElement | null) => {
    if (!el) return;
    if (isPhone()) {
      const list = indicatorRef.current;
      revealSpan(el, [list?.querySelector('h3'), list?.querySelector('button.border-orange-500')], {
        afterExit: PANEL_EXIT_MS,
      });
    } else if (isBelowLg()) {
      revealSpan(el, [], { anyWidth: true, gap: 0 });
    }
  }, []);

  const handleReset = () => {
    setVolumeAdded(0);
    setSelectedIndicator(null);
    setPhase('titrating');
    setSubmittedVolume(null);
    setMarkedVolume(0);
    setIsCorrect(false);
    setIndicatorCorrect(false);
    setAttempt((prev) => prev + 1);
  };

  if (!titration) {
    return <div className="p-8 text-center text-red-600">Villa: Títrun fannst ekki</div>;
  }

  // The hint and the stage bar sit at the foot of the right-hand column. On a
  // phone that column comes after the whole bench, so they are rendered in
  // the task card instead (never in both places).
  const hint = (
    <Presence show={phase !== 'result'} exitDuration={250}>
      {showHint ? (
        <div
          ref={hintRef}
          className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 phone:p-3"
        >
          <div className="font-bold text-yellow-800 mb-1">💡 Vísbending:</div>
          <p className="text-yellow-900 text-sm">{puzzle.hintIs}</p>
        </div>
      ) : (
        <button
          onClick={handleShowHint}
          className="text-yellow-600 hover:text-yellow-800 text-sm flex items-center gap-2 pointer-coarse:min-h-11"
        >
          💡 Sýna vísbendingu
        </button>
      )}
    </Presence>
  );

  const phaseBar = (
    <div className="bg-warm-100 rounded-xl p-3 phone:px-2 phone:py-1.5">
      <div className="text-xs text-warm-500 mb-2 phone:sr-only">Framvinda:</div>
      <div className="flex gap-2">
        <div
          className={`flex-1 h-2 rounded ${phase === 'titrating' ? 'bg-blue-500' : 'bg-blue-200'}`}
        />
        <div
          className={`flex-1 h-2 rounded ${phase === 'marking' ? 'bg-orange-500' : phase === 'select-indicator' || phase === 'result' ? 'bg-orange-200' : 'bg-warm-300'}`}
        />
        <div
          className={`flex-1 h-2 rounded ${phase === 'select-indicator' ? 'bg-amber-500' : phase === 'result' ? 'bg-amber-200' : 'bg-warm-300'}`}
        />
        <div
          className={`flex-1 h-2 rounded ${phase === 'result' ? 'bg-green-500' : 'bg-warm-300'}`}
        />
      </div>
      <div className="flex justify-between text-xs text-warm-600 mt-1">
        <span>Títra</span>
        <span>Merkja</span>
        <span>Vísi</span>
        <span>Niðurstaða</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 md:p-8 phone:px-3 phone:py-3">
      <div ref={levelRef} className="max-w-7xl mx-auto scroll-mt-4 phone:scroll-mt-3">
        {/* Header. On a phone it folds to one row (design P4): Til baka, the
            title, the counters, with the progress bar under them. Til baka
            comes first in the DOM as well as on screen. */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-4 phone:flex phone:flex-wrap phone:items-center phone:gap-x-1.5 phone:px-2.5 phone:py-2 phone:mb-3">
          <div className="flex justify-between items-center phone:contents">
            <button
              onClick={onBack}
              className="text-warm-600 hover:text-warm-800 flex items-center gap-2 pointer-coarse:py-3 pointer-coarse:-my-3 phone:order-1 phone:shrink-0 phone:text-sm"
            >
              ← Til baka
            </button>
            <div className="flex items-center gap-4 phone:order-3 phone:shrink-0 phone:flex-col phone:items-end phone:gap-0">
              <div className="text-sm text-warm-500 phone:text-xs">
                {currentIndex + 1} / {LEVEL2_PUZZLES.length}
              </div>
              <div className="text-lg font-bold text-green-600 phone:text-sm">Stig: {score}</div>
            </div>
          </div>

          <h1
            ref={headingRef}
            className="text-xl md:text-2xl font-bold text-green-600 mt-2 phone:order-2 phone:flex-1 phone:min-w-0 phone:mt-0 phone:text-base"
          >
            🧪 Stig 2: Gagnvirk títrun
          </h1>

          {/* Progress bar */}
          <div className="w-full bg-warm-200 rounded-full h-2 mt-3 phone:order-4 phone:basis-full phone:mt-1.5 phone:h-1.5">
            <div
              className="bg-green-500 h-2 phone:h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(completed / LEVEL2_PUZZLES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Task card */}
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-4 phone:p-3 phone:mb-3">
          <div className="flex items-start gap-3 phone:gap-2">
            <span className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              {puzzle.id}
            </span>
            <div className="flex-1">
              <h2
                data-item-start={indicatorStage ? undefined : ''}
                className="text-lg font-bold text-green-800 mb-1 phone:text-base phone:mb-0.5"
              >
                {titration.name}
              </h2>
              <p className="text-green-900">{puzzle.taskIs}</p>
              {/* The names are nominative, so they stand after the colon rather
                  than after "af", which would need them in the dative. */}
              <p className="text-sm text-green-700 mt-2 phone:mt-1">
                <span className="font-semibold">Sýni:</span> {titration.analyte.name} (
                {titration.analyte.formula}),{' '}
                <span className="whitespace-nowrap">
                  {formatDecimal(titration.analyte.volume, 1)} mL
                </span>
                ,{' '}
                <span className="whitespace-nowrap">
                  {formatDecimal(titration.analyte.molarity, 3)} M
                </span>
                <br />
                <span className="font-semibold">Títrantur:</span> {titration.titrant.name} (
                {titration.titrant.formula}),{' '}
                <span className="whitespace-nowrap">
                  {formatDecimal(titration.titrant.molarity, 3)} M
                </span>
              </p>
            </div>
          </div>
          {phone && (
            <div className="mt-2 space-y-1">
              {phaseBar}
              {hint}
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Apparatus */}
          {/* On a phone on its side: the bench | the curve and the marking
              panel (auto-placed into the second column). */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-3 md:p-4 phone-land:grid phone-land:grid-cols-2 phone-land:gap-x-4 phone-land:items-start">
            {/* Below md the burette and flask stand side by side with the
                controls under both, so the curve is on screen while pouring.
                `contents` lets the burette column's two children join that
                grid; from md it is the original column again. */}
            <div className="grid grid-cols-2 items-end gap-x-2 gap-y-4 md:flex md:flex-row md:items-start md:justify-center md:gap-8 phone:gap-y-3 phone-land:row-span-3">
              {/* Burette */}
              <div className="contents md:flex md:flex-col md:items-center">
                <div className="col-start-1 row-start-1 flex justify-center">
                  <Burette volumeAdded={volumeAdded} maxVolume={60} isAnimating={isPouring} />
                </div>

                {/* Controls */}
                <div className="col-span-2 row-start-2 empty:hidden">
                  <Presence show={phase === 'titrating'} exitDuration={250}>
                    <div ref={controlsRef} className="md:mt-4 space-y-2">
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddDrop}
                          aria-label="Bæta við 0,05 mL títrants"
                          className="flex-1 md:flex-none whitespace-nowrap px-3 py-2 pointer-coarse:py-3 bg-blue-100 hover:bg-blue-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 text-blue-800 rounded-lg text-sm font-semibold"
                        >
                          +0,05 mL
                        </button>
                        <button
                          onClick={handleAdd1mL}
                          aria-label="Bæta við 1 mL títrants"
                          className="flex-1 md:flex-none whitespace-nowrap px-3 py-2 pointer-coarse:py-3 bg-blue-200 hover:bg-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 text-blue-800 rounded-lg text-sm font-semibold"
                        >
                          +1 mL
                        </button>
                        <button
                          onClick={handleAdd5mL}
                          aria-label="Bæta við 5 mL títrants"
                          className="flex-1 md:flex-none whitespace-nowrap px-3 py-2 pointer-coarse:py-3 bg-blue-300 hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 text-blue-800 rounded-lg text-sm font-semibold"
                        >
                          +5 mL
                        </button>
                      </div>
                      {/* Pointer events cover mouse, touch and pen in one path. The
                        touch handlers this replaced had no touchcancel, so a hold
                        the browser cancelled kept pouring to 60 mL. */}
                      <button
                        onPointerDown={() => setIsPouring(true)}
                        onPointerUp={() => setIsPouring(false)}
                        onPointerLeave={() => setIsPouring(false)}
                        onPointerCancel={() => setIsPouring(false)}
                        onContextMenu={(e) => e.preventDefault()}
                        onKeyDown={(e) => {
                          if (e.code === 'Space' || e.code === 'Enter') {
                            e.preventDefault();
                            setIsPouring(true);
                          }
                        }}
                        onKeyUp={(e) => {
                          if (e.code === 'Space' || e.code === 'Enter') {
                            setIsPouring(false);
                          }
                        }}
                        onBlur={() => setIsPouring(false)}
                        aria-label="Halda inni til að hella títranti samfellt"
                        className="w-full px-4 py-3 bg-indigo-500 hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 text-white rounded-lg font-bold touch-none select-none"
                      >
                        Halda inni til að hella
                      </button>
                    </div>
                  </Presence>
                </div>
              </div>

              {/* Flask */}
              <div className="col-start-2 row-start-1 flex flex-col items-center">
                <Flask
                  pH={currentPH}
                  selectedIndicator={selectedIndicator}
                  volumeAnalyte={titration.analyte.volume}
                  volumeTitrant={volumeAdded}
                  isSwirling={isSwirling}
                />
              </div>
            </div>

            {/* Titration Curve */}
            <div ref={curveRef} className="mt-6 phone:mt-3 phone-land:mt-0">
              <TitrationCurve
                curveData={curveData.filter((p) => p.volume <= volumeAdded)}
                currentVolume={volumeAdded}
                currentPH={currentPH}
                titration={titration}
                showEquivalencePoints={phase === 'result'}
                markedVolume={
                  phase === 'marking' || phase === 'select-indicator' || phase === 'result'
                    ? markedVolume
                    : null
                }
                width={600}
                height={300}
              />
            </div>

            {/* Transition to marking */}
            <Presence show={phase === 'titrating' && volumeAdded >= 5} exitDuration={250}>
              <div className="mt-4 phone:mt-3">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-3 phone:p-2 phone:mb-2">
                  <p className="text-sm text-indigo-800">
                    <strong>Leiðbeiningar:</strong> Bættu við títranti þar til þú sérð{' '}
                    <strong>snögga pH-breytingu</strong> á ferilnum (brattur halli). Smelltu síðan á
                    hnappinn til að merkja jafngildispunktinn.
                  </p>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={handleEnterMarking}
                    className="px-6 py-3 phone:py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold"
                  >
                    Títrun lokið — merkja jafngildispunkt →
                  </button>
                </div>
              </div>
            </Presence>

            {/* Marking phase: slider to identify equivalence point */}
            <Presence show={phase === 'marking'} exitDuration={MARKING_EXIT_MS}>
              <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4 phone:mt-3 phone:p-3">
                <div ref={markingHeadingRef} className="font-bold text-orange-800 mb-2 phone:mb-1">
                  📍 Merktu jafngildispunktinn á ferilnum
                </div>
                <p className="text-sm text-orange-700 mb-1">
                  Dragðu sleðann þangað sem pH-ferillinn breytist mest (brattasti hluti ferilsins).
                  Þetta er jafngildispunkturinn — þar sem mólfjöldi sýru = mólfjöldi basa.
                </p>
                <p className="text-xs text-orange-600 mb-4 phone:mb-2">
                  Leyfilegt svigrúm: ±{formatDecimal(puzzle.volumeTolerance, 1)} mL.
                </p>
                <div className="space-y-3 phone:space-y-2">
                  <input
                    type="range"
                    min={0}
                    max={volumeAdded}
                    step={0.1}
                    value={markedVolume}
                    onChange={(e) => setMarkedVolume(parseFloat(e.target.value))}
                    aria-label="Jafngildisrúmmál"
                    className="w-full accent-orange-500 pointer-coarse:h-11"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => nudgeMarkedVolume(-0.1)}
                      aria-label="Minnka um 0,1 mL"
                      className="hidden pointer-coarse:flex shrink-0 items-center justify-center min-w-11 min-h-11 px-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg font-bold"
                    >
                      −0,1
                    </button>
                    <div className="flex-1 min-w-0 text-center">
                      <span className="font-mono text-xl font-bold text-orange-800 whitespace-nowrap">
                        {formatDecimal(markedVolume, 1)} mL
                      </span>
                      <span className="text-sm text-orange-600 ml-2 whitespace-nowrap">
                        (pH ≈{' '}
                        {titration ? formatDecimal(calculatePH(titration, markedVolume), 1) : '?'})
                      </span>
                    </div>
                    <button
                      onClick={() => nudgeMarkedVolume(0.1)}
                      aria-label="Auka um 0,1 mL"
                      className="hidden pointer-coarse:flex shrink-0 items-center justify-center min-w-11 min-h-11 px-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg font-bold"
                    >
                      +0,1
                    </button>
                  </div>
                  {/* Wraps below ~340 px: "Staðfesta:" alone is wider than
                      what the back button leaves at 320 px. */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleBackToTitrating}
                      className="shrink-0 whitespace-nowrap px-4 py-2 pointer-coarse:py-3 bg-warm-200 hover:bg-warm-300 text-warm-700 rounded-lg font-medium"
                    >
                      ← Til baka
                    </button>
                    <button
                      onClick={handleSubmitMarkedVolume}
                      className="flex-1 px-6 py-3 phone:py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold"
                    >
                      Staðfesta: {formatDecimal(markedVolume, 1)} mL →
                    </button>
                  </div>
                </div>
              </div>
            </Presence>
          </div>

          {/* Right: Indicator selector and info */}
          <div className="space-y-4">
            {/* Indicator selector */}
            {/* Before its stage the list is a greyed preview; on a phone it is
                not shown until then, and after it the result names the choice
                (design P10). */}
            <div
              ref={indicatorRef}
              data-item-start={indicatorStage ? '' : undefined}
              className={`scroll-mt-4 phone:scroll-mt-3 ${phase === 'select-indicator' ? '' : 'opacity-50 phone:hidden'}`}
            >
              <IndicatorSelector
                selectedIndicator={selectedIndicator}
                onSelect={handleIndicatorSelect}
                disabled={phase !== 'select-indicator'}
              />
            </div>

            {/* Submit indicator button */}
            <Presence show={phase === 'select-indicator' && !!selectedIndicator} exitDuration={250}>
              <button
                ref={revealConfirmIndicator}
                onClick={handleSubmitIndicator}
                className="w-full px-6 py-3 phone:py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold"
              >
                Staðfesta val →
              </button>
            </Presence>

            {/* Hint (on a phone it is in the task card instead) */}
            {!phone && hint}

            {/* Result feedback */}
            <Presence show={phase === 'result' && submittedVolume !== null} exitDuration={250}>
              {/* The feedback region focus moves to after the check (P3), named
                  by its verdict. */}
              <div
                ref={resultRef}
                tabIndex={-1}
                role="group"
                aria-labelledby="ph-l2-verdict"
                className={`p-4 phone:p-3 rounded-xl focus:outline-none ${isCorrect ? 'bg-green-50 border border-green-300' : 'bg-red-50 border border-red-300'}`}
              >
                <div
                  id="ph-l2-verdict"
                  className={`font-bold mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}
                >
                  {isCorrect ? '✓ Rétt!' : '✗ Ekki rétt'}
                  {isCorrect && ' (+100 stig)'}
                </div>

                <div className="text-sm space-y-2">
                  <div>
                    <span className="font-semibold">Þitt rúmmál:</span>{' '}
                    {submittedVolume !== null ? formatDecimal(submittedVolume, 2) : '?'} mL
                    <br />
                    <span className="font-semibold">Jafngildisrúmmál:</span>{' '}
                    {formatDecimal(titration.equivalenceVolume, 2)} mL
                    <br />
                    <span
                      className={
                        submittedVolume !== null &&
                        Math.abs(submittedVolume - titration.equivalenceVolume) <=
                          puzzle.volumeTolerance
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      Skekkja: ±
                      {submittedVolume !== null
                        ? formatDecimal(Math.abs(submittedVolume - titration.equivalenceVolume), 2)
                        : '?'}{' '}
                      mL
                      {submittedVolume !== null &&
                      Math.abs(submittedVolume - titration.equivalenceVolume) <=
                        puzzle.volumeTolerance
                        ? ' ✓'
                        : ' ✗'}
                    </span>
                  </div>

                  <div>
                    <span className="font-semibold">Þinn vísir:</span>{' '}
                    {indicators.find((i) => i.id === selectedIndicator)?.name}
                    <br />
                    <span className={indicatorCorrect ? 'text-green-600' : 'text-red-600'}>
                      {indicatorCorrect ? '✓ Góður vísir' : '✗ Ekki besti vísirinn'}
                    </span>
                  </div>
                </div>

                {/* Endpoint vs equivalence teaching */}
                {selectedIndicator && (
                  <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm phone:p-2">
                    <div className="font-bold text-purple-800 mb-1">
                      Jafngildispunktur ≠ Endapunktur
                    </div>
                    <div className="text-purple-700">
                      {/* The pH is derived, as the flask's and the marking readout's
                          are, so all three agree at the same volume. */}
                      <strong>Jafngildispunktur:</strong>{' '}
                      {formatDecimal(titration.equivalenceVolume, 1)} mL (pH{' '}
                      {formatDecimal(calculatePH(titration, titration.equivalenceVolume), 1)}) — þar
                      sem mólfjöldi sýru = mólfjöldi basa.
                      <br />
                      <strong>Endapunktur:</strong> þar sem vísirinn breytir um lit (
                      {indicators.find((i) => i.id === selectedIndicator)?.name} breytist við pH{' '}
                      {indicators
                        .find((i) => i.id === selectedIndicator)
                        ?.pHRange.map((pH) => formatDecimal(pH, 1))
                        .join('–')}
                      ).
                      <br />
                      Góður vísir hefur endapunkt nálægt jafngildispunktinum.
                    </div>
                  </div>
                )}

                <div className={`mt-3 text-sm ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                  {puzzle.explanationIs}
                </div>

                {/* Separate from "Staðfesta val", and each drops a press within
                    400 ms of appearing. */}
                <div className="mt-4 flex gap-2 phone:mt-3">
                  <button
                    key="retry"
                    onClick={armed(handleReset)}
                    className="flex-1 px-4 py-2 pointer-coarse:py-3 bg-warm-200 hover:bg-warm-300 text-warm-800 rounded-lg font-semibold"
                  >
                    Reyna aftur
                  </button>
                  <button
                    key="next"
                    ref={nextRef}
                    onClick={armed(handleNext)}
                    className="flex-1 px-4 py-2 pointer-coarse:py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold"
                  >
                    {currentIndex < LEVEL2_PUZZLES.length - 1 ? 'Næsta →' : 'Ljúka →'}
                  </button>
                </div>
              </div>
            </Presence>

            {/* Phase indicator (on a phone it is in the task card instead) */}
            {!phone && phaseBar}
          </div>
        </div>
      </div>
    </div>
  );
}
