import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';

import { Presence } from '@shared/components';
import {
  focusTarget,
  formatDecimal,
  isPhone,
  parseStudentNumber,
  revealSpan,
  revealTop,
  useArmedAfter,
  useIsPhone,
  useItemTop,
  useRevealAfterCommit,
} from '@shared/utils';

import { BenchReadings } from './BenchReadings';
import { IndicatorSelector } from './IndicatorSelector';
import { TitrationApparatus } from './TitrationApparatus';
import { TitrationCurve } from './TitrationCurve';
import { indicators } from '../data/indicators';
import {
  acceptableIndicatorsFor,
  colourChangeWindow,
  CONCENTRATION_TOLERANCE,
  ENDPOINT_WINDOW_ML,
  LEVEL2_PUZZLES,
  formatMolarity,
  molarityFromEndpoint,
  randomMolarity,
  sampleOf,
} from '../data/level2-puzzles';
import { getTitrationById } from '../data/titrations';
import type { MonoproticTitration, IndicatorType } from '../types';
import { calculatePH, generateTitrationCurve } from '../utils/ph-calculations';

interface Level2Props {
  /** How many of the problems were answered right. Hints never change it. */
  onComplete: (correct: number, total: number) => void;
  onBack: () => void;
  /**
   * Draws the sample's concentration for a puzzle. Random by default, so a
   * classmate's answer does not carry over; tests pass a fixed one.
   */
  drawMolarity?: (base: MonoproticTitration) => number;
}

/** Exit duration of the Presences here (the indicator list, the pour controls, the hint). */
const PANEL_EXIT_MS = 250;

type Phase = 'choose' | 'titrating' | 'calculate' | 'result';

/** Tailwind's `lg`: the width at which the level runs in two columns. */
const WIDE_QUERY = '(min-width: 1024px)';

function subscribeWide(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
  const list = window.matchMedia(WIDE_QUERY);
  list.addEventListener?.('change', onChange);
  return () => list.removeEventListener?.('change', onChange);
}

function isWide(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(WIDE_QUERY).matches
  );
}

/**
 * Stig 2 runs as a titration in the lab does (2026-11-14, Siggi's go-ahead):
 * choose the litvísir, titrate until it changes colour and read the burette
 * (the endpoint), then work out the sample's concentration, which the task
 * does not give. Until then the concentration was printed, so the titration
 * found nothing, and the litvísir was picked after pouring, from a flask that
 * had shown a rainbow of pH colours, so no endpoint was ever seen.
 *
 * A puzzle is right when the endpoint is within the puzzle's tolerance of the
 * equivalence volume, the litvísir changes colour there (Siggi's rule,
 * `acceptableIndicatorsFor`), and the concentration follows from the
 * student's own endpoint.
 */
export function Level2({ onComplete, onBack, drawMolarity = randomMolarity }: Level2Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Puzzles solved, counted flat: the hint never changes it, and there is no
  // running score on screen (mobile-pass decisions 1 (b) and 2 (b)).
  const [correctCount, setCorrectCount] = useState(0);
  // Whether this puzzle's result has been shown. The result prints the
  // equivalence volume, the concentration and the good indicators, so a
  // "Reyna aftur" after it does not count.
  const [answerShown, setAnswerShown] = useState(false);
  const [, setHintsUsed] = useState(0);
  const [completed, setCompleted] = useState(0);
  const levelCompleteReported = useRef(false);
  const [attempt, setAttempt] = useState(0);
  const phone = useIsPhone();
  // From a laptop up the curve sits in the right-hand column, beside the bench, so the
  // burette, the flask, the pour controls and the curve are on one screen together.
  // Below that it stays under the bench, where the column is the whole width.
  const wide = useSyncExternalStore(subscribeWide, isWide, () => false);

  const [volumeAdded, setVolumeAdded] = useState(0);
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorType | null>(null);
  const [isPouring, setIsPouring] = useState(false);
  const [isSwirling, setIsSwirling] = useState(false);

  const [showHint, setShowHint] = useState(false);
  const [phase, setPhase] = useState<Phase>('choose');
  const [endpoint, setEndpoint] = useState<number | null>(null);
  const [answer, setAnswer] = useState('');
  const [verdict, setVerdict] = useState({
    endpoint: false,
    indicator: false,
    concentration: false,
  });
  const isCorrect = verdict.endpoint && verdict.indicator && verdict.concentration;

  const puzzle = LEVEL2_PUZZLES[currentIndex];
  const base = getTitrationById(puzzle.titrationId) as MonoproticTitration | undefined;

  // A new sample for each puzzle and each "Reyna aftur".
  // eslint-disable-next-line react-hooks/exhaustive-deps -- drawn once per puzzle and attempt, on purpose
  const molarity = useMemo(() => (base ? drawMolarity(base) : 0), [currentIndex, attempt]);
  const titration = useMemo(
    () => (base ? sampleOf(base, molarity) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the sample follows the drawn molarity
    [base?.id, molarity]
  );
  const acceptable = useMemo(
    () => (titration ? acceptableIndicatorsFor(titration) : []),
    [titration]
  );
  const curveData = useMemo(
    () => (titration ? generateTitrationCurve(titration, 60) : []),
    [titration]
  );

  const currentPH = titration ? calculatePH(titration, volumeAdded) : 7;

  // Reset when the puzzle changes.
  useEffect(() => {
    setVolumeAdded(0);
    setSelectedIndicator(null);
    setPhase('choose');
    setShowHint(false);
    setEndpoint(null);
    setAnswer('');
    setAnswerShown(false);
  }, [currentIndex]);

  // The level heading takes focus as the level mounts.
  const headingRef = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    focusTarget(headingRef.current);
  }, []);

  // "Næsta" and "Reyna aftur" start the puzzle again at the level's top and
  // focus the indicator list's heading (`data-item-start`).
  const levelRef = useItemTop<HTMLDivElement>(`${currentIndex}:${attempt}`, { anyWidth: true });

  // After "Staðfesta val" the list leaves and the pour controls take its
  // place: focus goes to the first of them, and on a phone the bench comes up.
  const benchRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (phase !== 'titrating') return;
    const timer = window.setTimeout(() => {
      // On a phone the bench comes to the top. Wider, the whole bench is brought on
      // screen if it is not, by the least scroll, so the flask is never cut off.
      if (isPhone()) revealTop(benchRef.current);
      else revealSpan(benchRef.current, [benchRef.current], { anyWidth: true });
      focusTarget(controlsRef.current?.querySelector('button'));
    }, PANEL_EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [phase, attempt]);

  // At 320 px and in landscape the list is taller than the screen: once a
  // litvísir is picked, bring "Staðfesta val" up with the list's heading and
  // the chosen card where they fit (phone only, as `revealSpan` is).
  const chooseRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (phase !== 'choose' || !selectedIndicator) return;
    const list = chooseRef.current;
    revealSpan(confirmRef.current, [
      list?.querySelector('h3') ?? null,
      list?.querySelector('[aria-pressed="true"]') ?? null,
    ]);
  }, [phase, selectedIndicator]);

  // "Skrá endapunkt" opens the calculation: its heading takes focus as it
  // mounts and, on a phone, the panel comes to the top once the pour controls
  // have gone. Done as the heading mounts, since the panel's Presence mounts
  // it a frame after the phase changes.
  const calcRef = useRef<HTMLDivElement>(null);
  const calcHeadingRef = useCallback((el: HTMLHeadingElement | null) => {
    if (!el) return;
    focusTarget(el);
    if (isPhone()) revealTop(el.parentElement, { afterExit: PANEL_EXIT_MS, always: true });
    // Wider, the panel comes on screen by the least scroll, keeping the bench in view.
    else revealSpan(el.parentElement, [], { anyWidth: true, afterExit: PANEL_EXIT_MS });
  }, []);

  // The result: focus goes to it, not to "Næsta" (P3).
  const resultRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  useRevealAfterCommit(
    phase === 'result',
    () => ({ bottom: nextRef.current, tops: [resultRef.current], focus: resultRef.current }),
    // At every width: on a laptop the result sits in the right-hand column, under the
    // curve, and the student is lower down, at the calculation.
    { afterExit: PANEL_EXIT_MS + 50, anyWidth: true }
  );
  const hintRef = useRef<HTMLDivElement>(null);
  useRevealAfterCommit(showHint, () => ({
    bottom: hintRef.current,
    tops: [hintRef.current],
    focus: hintRef.current,
  }));
  // A double tap on a commit must not press what replaces it.
  const armed = useArmedAfter(400, `${currentIndex}:${attempt}:${phase}`);

  useEffect(() => {
    if (completed >= LEVEL2_PUZZLES.length && !levelCompleteReported.current) {
      levelCompleteReported.current = true;
      onComplete(correctCount, LEVEL2_PUZZLES.length);
    }
  }, [completed, correctCount, onComplete]);

  // Pouring interval
  useEffect(() => {
    if (!isPouring || !titration) return;
    const interval = setInterval(() => {
      setVolumeAdded((prev) => Math.round(Math.min(prev + 0.1, 60) * 100) / 100);
      setIsSwirling(true);
    }, 50);
    return () => {
      clearInterval(interval);
      setIsSwirling(false);
    };
  }, [isPouring, titration]);

  const pour = (ml: number, swirlMs: number) => {
    if (phase !== 'titrating') return;
    setVolumeAdded((prev) => Math.round(Math.min(prev + ml, 60) * 1000) / 1000);
    setIsSwirling(true);
    setTimeout(() => setIsSwirling(false), swirlMs);
  };

  const handleConfirmIndicator = () => {
    if (selectedIndicator) setPhase('titrating');
  };

  const handleRecordEndpoint = () => {
    setIsPouring(false);
    setEndpoint(volumeAdded);
    setPhase('calculate');
  };

  const handleSubmitAnswer = () => {
    if (!titration || endpoint === null || !selectedIndicator) return;
    const value = parseStudentNumber(answer);
    if (!Number.isFinite(value)) return;
    const fromEndpoint = molarityFromEndpoint(titration, endpoint);
    const next = {
      endpoint: Math.abs(endpoint - titration.equivalenceVolume) <= puzzle.volumeTolerance + 1e-9,
      indicator: acceptable.includes(selectedIndicator),
      concentration: Math.abs(value - fromEndpoint) <= CONCENTRATION_TOLERANCE * fromEndpoint,
    };
    setVerdict(next);
    setPhase('result');
    if (next.endpoint && next.indicator && next.concentration && !answerShown) {
      setCorrectCount((prev) => prev + 1);
    }
    setAnswerShown(true);
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
      setPhase('choose');
    }
  };

  // A new sample, from the start: the result printed this one's answers.
  const handleReset = () => {
    setVolumeAdded(0);
    setSelectedIndicator(null);
    setPhase('choose');
    setEndpoint(null);
    setAnswer('');
    setAttempt((prev) => prev + 1);
  };

  if (!titration) {
    return <div className="p-8 text-center text-red-600">Villa: Títrun fannst ekki</div>;
  }

  const chosen = indicators.find((i) => i.id === selectedIndicator);
  const fromEndpoint = endpoint !== null ? molarityFromEndpoint(titration, endpoint) : null;
  const sampleWord = titration.type === 'strong-weak' ? 'basans' : 'sýrunnar';

  const hint = (
    <Presence show={phase !== 'result'} exitDuration={PANEL_EXIT_MS}>
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

  const STAGES: [Phase, string][] = [
    ['choose', 'Litvísir'],
    ['titrating', 'Títra'],
    ['calculate', 'Reikna'],
    ['result', 'Niðurstaða'],
  ];
  const stageIndex = STAGES.findIndex(([p]) => p === phase);
  const phaseBar = (
    <div className="bg-warm-100 rounded-xl p-3 phone:px-2 phone:py-1.5">
      <div className="text-xs text-warm-500 mb-2 phone:sr-only">Framvinda:</div>
      <div className="flex gap-2">
        {STAGES.map(([p], i) => (
          <div
            key={p}
            className={`flex-1 h-2 rounded ${i === stageIndex ? 'bg-green-500' : i < stageIndex ? 'bg-green-200' : 'bg-warm-300'}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-warm-600 mt-1">
        {STAGES.map(([p, label]) => (
          <span key={p}>{label}</span>
        ))}
      </div>
    </div>
  );

  // The curve a pH meter in the flask would draw, as far as poured.
  const curve = (
    <TitrationCurve
      curveData={curveData.filter((p) => p.volume <= volumeAdded)}
      currentVolume={volumeAdded}
      currentPH={currentPH}
      titration={titration}
      showEquivalencePoints={phase === 'result'}
      markedVolume={phase === 'calculate' || phase === 'result' ? endpoint : null}
      markedLabel="Endapunktur"
      width={600}
      height={300}
    />
  );

  const endpointOk = verdict.endpoint;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 md:p-8 phone:px-3 phone:py-3">
      <div ref={levelRef} className="max-w-7xl mx-auto scroll-mt-4 phone:scroll-mt-3">
        {/* Header. On a phone it folds to one row (design P4). */}
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
            </div>
          </div>

          <h1
            ref={headingRef}
            className="text-xl md:text-2xl font-bold text-green-600 mt-2 phone:order-2 phone:flex-1 phone:min-w-0 phone:mt-0 phone:text-base"
          >
            🧪 Stig 2: Gagnvirk títrun
          </h1>

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
              <h2 className="text-lg font-bold text-green-800 mb-1 phone:text-base phone:mb-0.5">
                {titration.name}
              </h2>
              <p className="text-green-900">{puzzle.taskIs}</p>
              {/* The names are nominative, so they stand after the colon. */}
              <p className="text-sm text-green-700 mt-2 phone:mt-1">
                <span className="font-semibold">Sýni:</span> {titration.analyte.name} (
                {titration.analyte.formula}),{' '}
                <span className="whitespace-nowrap">
                  {formatDecimal(titration.analyte.volume, 1)} mL
                </span>
                , <span className="whitespace-nowrap">styrkur óþekktur</span>
                <br />
                <span className="font-semibold">Títrantur:</span> {titration.titrant.name} (
                {titration.titrant.formula}),{' '}
                <span className="whitespace-nowrap">
                  {formatDecimal(titration.titrant.molarity, 3)} M
                </span>
                {chosen && phase !== 'choose' && (
                  <>
                    <br />
                    <span className="font-semibold">Litvísir:</span> {chosen.name}
                  </>
                )}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: the indicator, the bench, the curve and the calculation */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-3 md:p-4">
            {/* Stage 1: the indicator goes in first, as in the lab. */}
            <Presence show={phase === 'choose'} exitDuration={PANEL_EXIT_MS}>
              <div ref={chooseRef} className="mb-4 phone:mb-3">
                <div data-item-start="" className="scroll-mt-4 phone:scroll-mt-3">
                  <IndicatorSelector
                    selectedIndicator={selectedIndicator}
                    onSelect={setSelectedIndicator}
                    intro="Litvísirinn fer í flöskuna áður en þú títrar. Þú stöðvar þegar hann skiptir um lit."
                  />
                </div>
                <button
                  ref={confirmRef}
                  onClick={handleConfirmIndicator}
                  disabled={!selectedIndicator}
                  className="mt-3 w-full px-6 py-3 phone:py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-warm-300 disabled:cursor-not-allowed text-white rounded-xl font-bold"
                >
                  Staðfesta val →
                </button>
              </div>
            </Presence>

            {/* The bench: the apparatus, with the readings beside it and the
                pour controls under the readings (under both below md). */}
            <div
              ref={benchRef}
              className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-4 md:items-start md:gap-x-8 phone:gap-x-3 phone:gap-y-3 scroll-mt-4 phone:scroll-mt-3"
            >
              <div className="flex justify-center">
                <TitrationApparatus
                  volumeAdded={volumeAdded}
                  maxVolume={60}
                  volumeAnalyte={titration.analyte.volume}
                  pH={currentPH}
                  selectedIndicator={phase === 'choose' ? null : selectedIndicator}
                  colourless={phase === 'choose'}
                  isPouring={isPouring || isSwirling}
                />
              </div>

              <div className="contents md:flex md:flex-col md:gap-6 md:pt-4">
                <BenchReadings
                  volumeAdded={volumeAdded}
                  totalVolume={titration.analyte.volume + volumeAdded}
                  pH={currentPH}
                />

                <div className="col-span-2 empty:hidden">
                  <Presence show={phase === 'titrating'} exitDuration={PANEL_EXIT_MS}>
                    <div ref={controlsRef} className="space-y-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => pour(0.05, 200)}
                          aria-label="Bæta við 0,05 mL títrants"
                          className="flex-1 md:flex-none whitespace-nowrap px-3 py-2 pointer-coarse:py-3 bg-blue-100 hover:bg-blue-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 text-blue-800 rounded-lg text-sm font-semibold"
                        >
                          +0,05 mL
                        </button>
                        <button
                          onClick={() => pour(1, 300)}
                          aria-label="Bæta við 1 mL títrants"
                          className="flex-1 md:flex-none whitespace-nowrap px-3 py-2 pointer-coarse:py-3 bg-blue-200 hover:bg-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 text-blue-800 rounded-lg text-sm font-semibold"
                        >
                          +1 mL
                        </button>
                        <button
                          onClick={() => pour(5, 500)}
                          aria-label="Bæta við 5 mL títrants"
                          className="flex-1 md:flex-none whitespace-nowrap px-3 py-2 pointer-coarse:py-3 bg-blue-300 hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 text-blue-800 rounded-lg text-sm font-semibold"
                        >
                          +5 mL
                        </button>
                      </div>
                      {/* Pointer events cover mouse, touch and pen in one path,
                          and pointercancel stops a hold the browser cancelled. */}
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
                          if (e.code === 'Space' || e.code === 'Enter') setIsPouring(false);
                        }}
                        onBlur={() => setIsPouring(false)}
                        aria-label="Halda inni til að hella títranti samfellt"
                        className="w-full px-4 py-3 bg-indigo-500 hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 text-white rounded-lg font-bold touch-none select-none"
                      >
                        Halda inni til að hella
                      </button>
                      <p className="text-sm text-indigo-800 bg-indigo-50 border border-indigo-200 rounded-lg p-2">
                        Bættu við títranti þar til liturinn í flöskunni breytist og helst. Farðu
                        dropa fyrir dropa (+0,05 mL) þegar nálgast. Lestu þá af búrettunni: það er
                        endapunkturinn.{' '}
                        <span className="whitespace-nowrap">
                          Leyfilegt svigrúm: ±{formatDecimal(puzzle.volumeTolerance, 1)} mL
                        </span>{' '}
                        frá jafngildispunktinum.
                      </p>
                      <button
                        onClick={handleRecordEndpoint}
                        disabled={volumeAdded <= 0}
                        className="w-full px-6 py-3 phone:py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-warm-300 disabled:cursor-not-allowed text-white rounded-xl font-bold"
                      >
                        Liturinn breyttist — skrá endapunkt
                      </button>
                    </div>
                  </Presence>
                </div>
              </div>
            </div>

            {!wide && <div className="mt-6 phone:mt-3">{curve}</div>}

            {/* Stage 3: the concentration from the endpoint. */}
            <Presence
              show={phase === 'calculate' || phase === 'result'}
              exitDuration={PANEL_EXIT_MS}
            >
              <div
                ref={calcRef}
                className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4 phone:mt-3 phone:p-3 scroll-mt-4 phone:scroll-mt-3"
              >
                <h3
                  ref={calcHeadingRef}
                  tabIndex={-1}
                  data-item-start={phase === 'calculate' || phase === 'result' ? '' : undefined}
                  className="font-bold text-orange-800 mb-2 phone:mb-1 focus:outline-none"
                >
                  Reiknaðu styrk {sampleWord}
                </h3>
                <ul className="text-sm text-orange-900 mb-3 space-y-0.5 phone:mb-2">
                  <li>
                    Endapunktur:{' '}
                    <strong>{endpoint !== null ? formatDecimal(endpoint, 2) : '?'} mL</strong> af{' '}
                    {formatDecimal(titration.titrant.molarity, 3)} M {titration.titrant.formula}
                  </li>
                  <li>
                    Sýni: {formatDecimal(titration.analyte.volume, 1)} mL af{' '}
                    {titration.analyte.formula}
                  </li>
                  <li>Hvarfið gengur 1:1.</li>
                </ul>
                <label
                  htmlFor="ph-l2-concentration"
                  className="block text-sm font-semibold text-orange-800 mb-1"
                >
                  Styrkur {titration.analyte.formula} (M):
                </label>
                <div className="flex gap-2 phone:flex-wrap">
                  <input
                    id="ph-l2-concentration"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    enterKeyHint="done"
                    value={answer}
                    disabled={phase !== 'calculate'}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSubmitAnswer();
                    }}
                    placeholder="t.d. 0,0950"
                    className="flex-1 min-w-0 phone:basis-24 px-4 py-3 phone:px-3 phone:py-2 border-2 border-warm-300 rounded-xl text-lg font-mono focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                  <span className="flex items-center px-4 py-3 phone:px-3 phone:py-2 bg-warm-100 rounded-xl font-semibold text-warm-700">
                    M
                  </span>
                  {phase === 'calculate' && (
                    <button
                      onClick={armed(handleSubmitAnswer)}
                      className="px-6 py-3 phone:grow phone:py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold"
                    >
                      Staðfesta svar
                    </button>
                  )}
                </div>
                <p className="text-xs text-warm-600 mt-1">
                  Skekkjumörk: ±{formatDecimal(CONCENTRATION_TOLERANCE * 100, 0)}% af því sem þinn
                  endapunktur gefur.
                </p>
              </div>
            </Presence>
          </div>

          {/* Right: hint, stage bar and result */}
          <div className="space-y-4">
            {wide && <div className="bg-white rounded-xl shadow-lg p-3">{curve}</div>}
            {!phone && hint}

            <Presence show={phase === 'result'} exitDuration={PANEL_EXIT_MS}>
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
                </div>

                <div className="text-sm space-y-2">
                  <div>
                    <span className="font-semibold">Þinn endapunktur:</span>{' '}
                    {endpoint !== null ? formatDecimal(endpoint, 2) : '?'} mL
                    <br />
                    <span className="font-semibold">Jafngildisrúmmál:</span>{' '}
                    {formatDecimal(titration.equivalenceVolume, 2)} mL
                    <br />
                    <span className={endpointOk ? 'text-green-600' : 'text-red-600'}>
                      Skekkja:{' '}
                      {endpoint !== null
                        ? formatDecimal(Math.abs(endpoint - titration.equivalenceVolume), 2)
                        : '?'}{' '}
                      mL (leyfilegt ±{formatDecimal(puzzle.volumeTolerance, 1)}){' '}
                      {endpointOk ? '✓' : '✗'}
                    </span>
                  </div>

                  <div>
                    <span className="font-semibold">Þinn litvísir:</span> {chosen?.name}
                    <br />
                    <span className={verdict.indicator ? 'text-green-600' : 'text-red-600'}>
                      {verdict.indicator ? '✓ Góður litvísir' : '✗ Ekki góður litvísir hér'}
                    </span>
                    <br />
                    <span className="text-xs italic text-warm-600">{chosen?.description}</span>
                  </div>

                  <div>
                    <span className="font-semibold">Þinn styrkur:</span> {answer} M
                    <br />
                    <span className="font-semibold">Út frá þínum endapunkti:</span>{' '}
                    {fromEndpoint !== null ? formatMolarity(fromEndpoint) : '?'} M{' '}
                    <span className={verdict.concentration ? 'text-green-600' : 'text-red-600'}>
                      {verdict.concentration ? '✓' : '✗'}
                    </span>
                    <br />
                    <span className="font-semibold">Raunverulegur styrkur:</span>{' '}
                    {formatMolarity(molarity)} M
                  </div>
                </div>

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
                {chosen && (
                  <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm phone:p-2">
                    <div className="font-bold text-purple-800 mb-1">
                      Jafngildispunktur ≠ Endapunktur
                    </div>
                    <div className="text-purple-700">
                      <strong>Jafngildispunktur:</strong>{' '}
                      {formatDecimal(titration.equivalenceVolume, 2)} mL (pH{' '}
                      {formatDecimal(calculatePH(titration, titration.equivalenceVolume), 1)}) — þar
                      sem mólfjöldi sýru = mólfjöldi basa.
                      <br />
                      <strong>Endapunktur:</strong> þar sem litvísirinn skiptir um lit.{' '}
                      {chosen.name} breytist við pH{' '}
                      {chosen.pHRange.map((pH) => formatDecimal(pH, 1)).join('–')}, sem þessi ferill
                      nær milli{' '}
                      {colourChangeWindow(titration, chosen.id)
                        .map((dv) => formatDecimal(titration.equivalenceVolume + dv, 2))
                        .join(' og ')}{' '}
                      mL.
                      <br />
                      Góður litvísir skiptir um lit innan við {formatDecimal(
                        ENDPOINT_WINDOW_ML,
                        1
                      )}{' '}
                      mL frá jafngildispunktinum.
                    </div>
                  </div>
                )}

                <div className={`mt-3 text-sm ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                  {puzzle.explanationIs}
                </div>
              </div>
            </Presence>

            {!phone && phaseBar}
          </div>
        </div>
      </div>
    </div>
  );
}
