import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  type KeyboardEvent,
  type RefObject,
} from 'react';

import { HintSystem, Presence } from '@shared/components';
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
} from '@shared/utils';

import { BufferCapacityVisualization } from './BufferCapacityVisualization';
import FlaskComparison from './FlaskComparison';
import { LEVEL2_PUZZLES } from '../data/level2-puzzles';
import { BUFFER_PROBLEMS } from '../data/problems';
import { solveBuffer } from '../engine/buffer';

interface Level2Props {
  onComplete: (score: number) => void;
  onBack: () => void;
}

type Step = 'direction' | 'ratio' | 'mass' | 'complete';

/** How long an answered step takes to fade out (its Presence exitDuration). */
const STEP_EXIT_MS = 250;
/** A given value: on a phone its name and value share one line. */
const DATA_TILE =
  'bg-warm-50 p-3 rounded-lg text-center phone:px-2 phone:py-1 phone:text-left phone:flex ' +
  'phone:flex-wrap phone:items-baseline phone:justify-between phone:gap-x-2';
/** Presence mounts the feedback a frame after it is set; wait this long before measuring it. */
const FEEDBACK_MOUNT_MS = 60;
type Direction = 'higher' | 'equal' | 'lower' | null;

/**
 * Level 2: Henderson-Hasselbalch Calculations
 *
 * Learning Objectives:
 * - Apply Henderson-Hasselbalch equation: pH = pKa + log([Base]/[Acid])
 * - Calculate [Base]/[Acid] ratio from pH and pKa
 * - Calculate masses of acid and base components
 *
 * 3-Step Flow:
 * 1. Direction: Is target pH higher, equal, or lower than pKa?
 * 2. Ratio: Calculate the required [Base]/[Acid] ratio
 * 3. Mass: Calculate grams of acid and base needed
 */
export default function Level2({ onComplete, onBack }: Level2Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [step, setStep] = useState<Step>('direction');
  const [score, setScore] = useState(0);
  const [, setHintsUsedTotal] = useState(0);
  const [hintMultiplier, setHintMultiplier] = useState(1.0);
  const [hintResetKey, setHintResetKey] = useState(0);
  const [completed, setCompleted] = useState(0);
  // How many hint tiers are open, so the hints keep them when a phone layout moves them.
  const [hintTiers, setHintTiers] = useState(0);
  // Each wrong or unreadable answer, so a repeated one still brings its feedback into view.
  const [wrongChecks, setWrongChecks] = useState(0);
  const levelCompleteReported = useRef(false);
  const stepCardRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const directionFeedbackRef = useRef<HTMLDivElement>(null);
  const ratioFeedbackRef = useRef<HTMLDivElement>(null);
  const massFeedbackRef = useRef<HTMLDivElement>(null);
  const directionAnswerRef = useRef<HTMLDivElement>(null);
  const ratioAnswerRef = useRef<HTMLDivElement>(null);
  const massAnswerRef = useRef<HTMLDivElement>(null);
  const ratioHeadingRef = useRef<HTMLHeadingElement>(null);
  const massHeadingRef = useRef<HTMLHeadingElement>(null);
  const ratioCheckRef = useRef<HTMLButtonElement>(null);
  const massCheckRef = useRef<HTMLButtonElement>(null);
  const verdictRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const acidMassRef = useRef<HTMLInputElement>(null);
  const baseMassRef = useRef<HTMLInputElement>(null);
  // On a phone the hints sit under the step card, and the context and the flask comparison
  // after it, so the given data, the step and its answer share one screen. Rendered in one
  // place or the other, never twice.
  const phone = useIsPhone();

  // Step 1: Direction
  const [selectedDirection, setSelectedDirection] = useState<Direction>(null);
  const [directionFeedback, setDirectionFeedback] = useState<string | null>(null);
  const [directionCorrect, setDirectionCorrect] = useState(false);

  // Step 2: Ratio
  const [ratioInput, setRatioInput] = useState('');
  const [ratioFeedback, setRatioFeedback] = useState<string | null>(null);
  const [ratioCorrect, setRatioCorrect] = useState(false);

  // Step 3: Mass
  const [acidMassInput, setAcidMassInput] = useState('');
  const [baseMassInput, setBaseMassInput] = useState('');
  const [massFeedback, setMassFeedback] = useState<string | null>(null);
  const [massCorrect, setMassCorrect] = useState(false);

  // Show explanation after puzzle completion
  const [showExplanation, setShowExplanation] = useState(false);

  const puzzle = LEVEL2_PUZZLES[currentIndex];
  const problem = BUFFER_PROBLEMS.find((p) => p.id === puzzle.problemId);
  // Every correct answer on this screen is derived, never stored — see engine/buffer.ts.
  const solution = problem ? solveBuffer(problem) : null;

  // Check completion - must be before conditional returns to satisfy rules-of-hooks
  useEffect(() => {
    if (completed >= LEVEL2_PUZZLES.length && !levelCompleteReported.current) {
      levelCompleteReported.current = true;
      onComplete(score);
    }
  }, [completed, score, onComplete]);

  // The level opens with its heading focused: the menu card that opened it has gone.
  useLayoutEffect(() => {
    focusTarget(headingRef.current);
  }, []);

  // "Næsta verkefni" ends a long worked solution, so the next puzzle's top is above the
  // screen: bring it back (at any width, as the game always did, only when it is off screen)
  // and focus the new puzzle's name.
  const levelTopRef = useItemTop<HTMLDivElement>(currentIndex, { anyWidth: true, gap: 0 });

  // A correct step fades out and the next one takes its place. Once it has, focus its
  // heading (the button pressed has gone) and, on a phone, show it through its Athuga.
  useEffect(() => {
    if (step !== 'ratio' && step !== 'mass') return;
    const timer = window.setTimeout(() => {
      const heading = step === 'ratio' ? ratioHeadingRef.current : massHeadingRef.current;
      const check = step === 'ratio' ? ratioCheckRef.current : massCheckRef.current;
      revealSpan(check, [heading]);
      focusTarget(heading);
    }, STEP_EXIT_MS + 10);
    return () => window.clearTimeout(timer);
  }, [step]);

  // A wrong answer: on a phone, the answer through its feedback if that fits, else the
  // feedback at the top; at every width focus moves to the feedback (P3).
  useEffect(() => {
    if (!wrongChecks) return;
    const timer = window.setTimeout(() => {
      const [answer, fb] =
        step === 'direction'
          ? [directionAnswerRef.current, directionFeedbackRef.current]
          : step === 'ratio'
            ? [ratioAnswerRef.current, ratioFeedbackRef.current]
            : [massAnswerRef.current, massFeedbackRef.current];
      if (!fb) return;
      revealSpan(fb, [answer, fb]);
      focusTarget(fb);
    }, FEEDBACK_MOUNT_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only a new check moves the page
  }, [wrongChecks]);

  // Finishing a puzzle hides the hint tiers above this card and, 250 ms later, the step just
  // answered. A student who opened the hints therefore landed in the middle of the worked
  // solution on a phone, with "Rétt svar!" scrolled past. Once both have gone: on a phone,
  // "Rétt svar!" through "Næsta verkefni" (or "Rétt svar!" at the top); off a phone the
  // card's top, only when it has gone above the screen, as it always was. At every width
  // focus moves to "Rétt svar!", not to Næsta (P3).
  useEffect(() => {
    if (step !== 'complete') return;
    const timer = window.setTimeout(() => {
      if (isPhone()) {
        revealSpan(nextRef.current, [verdictRef.current]);
      } else if ((stepCardRef.current?.getBoundingClientRect().top ?? 0) < 0) {
        revealTop(stepCardRef.current, { anyWidth: true, always: true, gap: 0 });
      }
      focusTarget(verdictRef.current);
    }, STEP_EXIT_MS + 50);
    return () => window.clearTimeout(timer);
  }, [step]);
  // A double tap on the last Athuga must not land on "Næsta verkefni" as it appears.
  const armed = useArmedAfter(400, `${currentIndex}:${step}`);

  // Safety check - should never happen with valid data
  if (!problem || !solution) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
          <p className="text-red-600 font-bold">Villa: Gat ekki fundið verkefnagögn</p>
          <button onClick={onBack} className="mt-4 text-blue-600 underline">
            Til baka
          </button>
        </div>
      </div>
    );
  }

  // Determine correct direction
  const getCorrectDirection = (): Direction => {
    const diff = problem.targetPH - problem.pKa;
    if (Math.abs(diff) < 0.01) return 'equal';
    return diff > 0 ? 'higher' : 'lower';
  };

  // Handle hint usage
  const handleHintUsed = (tier: number) => {
    setHintsUsedTotal((prev) => prev + 1);
    setHintTiers(tier);
  };

  // Enter answers the step; in the first of two fields it moves on to the second while that
  // one is still empty.
  const onEnter =
    (check: () => void, next?: { ref: RefObject<HTMLInputElement | null>; empty: boolean }) =>
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      if (next?.empty) next.ref.current?.focus();
      else check();
    };

  // A step fades out for 250 ms after it is answered and its button stays live
  // meanwhile, so each check ignores a tap that arrives after its step is over.
  // Step 1: Check direction answer
  const checkDirection = () => {
    if (step !== 'direction') return;
    const correct = getCorrectDirection();
    if (selectedDirection === correct) {
      setDirectionCorrect(true);
      setDirectionFeedback('Rétt! Nú skaltu reikna hlutfallið.');
      setStep('ratio');
    } else {
      setWrongChecks((n) => n + 1);
      const correctDir = getCorrectDirection();
      setDirectionFeedback(
        selectedDirection === 'higher'
          ? `Ekki rétt. Markmiðs-pH (${formatDecimal(problem.targetPH, 2)}) er ${correctDir === 'lower' ? 'minna en' : 'jafnt'} pKa (${formatDecimal(problem.pKa, 2)}), þannig að svarið er ekki "hærra".`
          : selectedDirection === 'lower'
            ? `Ekki rétt. Markmiðs-pH (${formatDecimal(problem.targetPH, 2)}) er ${correctDir === 'higher' ? 'stærra en' : 'jafnt'} pKa (${formatDecimal(problem.pKa, 2)}), þannig að svarið er ekki "lægra".`
            : `Ekki rétt. Markmiðs-pH (${formatDecimal(problem.targetPH, 2)}) er ${correctDir === 'higher' ? 'stærra en' : correctDir === 'lower' ? 'minna en' : 'jafnt'} pKa (${formatDecimal(problem.pKa, 2)}).`
      );
    }
  };

  // Step 2: Check ratio answer
  const checkRatio = () => {
    if (step !== 'ratio') return;
    const userRatio = parseStudentNumber(ratioInput);
    if (isNaN(userRatio) || userRatio <= 0) {
      setWrongChecks((n) => n + 1);
      setRatioFeedback('Vinsamlegast sláðu inn jákvæða tölu.');
      return;
    }

    const correctRatio = solution.ratio;
    const tolerance = puzzle.ratioTolerance;
    const relativeError = Math.abs(userRatio - correctRatio) / correctRatio;

    if (relativeError <= tolerance) {
      setRatioCorrect(true);
      setRatioFeedback(
        `Rétt! Hlutfall = ${formatDecimal(correctRatio, 2)}. Nú skaltu reikna massa.`
      );
      setStep('mass');
    } else {
      setWrongChecks((n) => n + 1);
      setRatioFeedback(
        `Ekki rétt. Mundu: hlutfall = 10^(pH - pKa) = 10^(${formatDecimal(problem.targetPH, 2)} - ${formatDecimal(problem.pKa, 2)})`
      );
    }
  };

  // Step 3: Check mass answers
  const checkMass = () => {
    if (step !== 'mass') return;
    const userAcidMass = parseStudentNumber(acidMassInput);
    const userBaseMass = parseStudentNumber(baseMassInput);

    if (isNaN(userAcidMass) || isNaN(userBaseMass) || userAcidMass <= 0 || userBaseMass <= 0) {
      setWrongChecks((n) => n + 1);
      setMassFeedback('Vinsamlegast sláðu inn jákvæðar tölur fyrir báða massa.');
      return;
    }

    const correctAcidMass = solution.acidMass;
    const correctBaseMass = solution.baseMass;
    const tolerance = puzzle.massTolerance;

    const acidError = Math.abs(userAcidMass - correctAcidMass) / correctAcidMass;
    const baseError = Math.abs(userBaseMass - correctBaseMass) / correctBaseMass;

    const acidOk = acidError <= tolerance;
    const baseOk = baseError <= tolerance;

    if (acidOk && baseOk) {
      setMassCorrect(true);
      const points = Math.round(100 * hintMultiplier);
      setScore((prev) => prev + points);
      setMassFeedback(`Frábært! +${points} stig`);
      setShowExplanation(true);
      setStep('complete');
    } else {
      setWrongChecks((n) => n + 1);
      let feedback = 'Ekki rétt. ';
      if (!acidOk)
        feedback += `Sýrumassi er ${userAcidMass > correctAcidMass ? 'of hár' : 'of lágur'}. `;
      if (!baseOk)
        feedback += `Basamassi er ${userBaseMass > correctBaseMass ? 'of hár' : 'of lágur'}.`;
      setMassFeedback(feedback);
    }
  };

  // Next puzzle
  const nextPuzzle = () => {
    if (step !== 'complete') return;
    setCompleted((prev) => prev + 1);

    if (currentIndex < LEVEL2_PUZZLES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      resetPuzzleState();
    }
  };

  // Reset puzzle state
  const resetPuzzleState = () => {
    setStep('direction');
    setSelectedDirection(null);
    setDirectionFeedback(null);
    setDirectionCorrect(false);
    setRatioInput('');
    setRatioFeedback(null);
    setRatioCorrect(false);
    setAcidMassInput('');
    setBaseMassInput('');
    setMassFeedback(null);
    setMassCorrect(false);
    setShowExplanation(false);
    setHintMultiplier(1.0);
    setHintTiers(0);
    setHintResetKey((prev) => prev + 1);
  };

  // Rendered once, in the task card on desktop and under the step card on a phone. The
  // "Stig: x / y" line stays where it always was and is not carried to the new place (design
  // §4, §7). `startRevealed` keeps the student's open tiers when the move remounts it.
  const hintSystem = (
    <HintSystem
      hints={puzzle.hints}
      basePoints={100}
      onHintUsed={handleHintUsed}
      onPointsChange={setHintMultiplier}
      disabled={step === 'complete'}
      resetKey={hintResetKey}
      startRevealed={hintTiers}
      showPointCost={!phone}
    />
  );

  const contextBox = problem.context && (
    <div className="bg-purple-50 border-l-4 border-purple-400 p-3 mb-4 phone:mb-0">
      <p className="text-sm text-purple-800">{problem.context}</p>
    </div>
  );

  const flaskComparison = (
    <div className="mb-4 phone:mb-0">
      <FlaskComparison
        targetPH={problem.targetPH}
        pKa={problem.pKa}
        addedAcidMoles={0.01}
        addedBaseMoles={0}
        bufferConcentration={problem.totalConcentration}
      />
    </div>
  );

  const nextButton = (
    <button
      ref={nextRef}
      onClick={armed(nextPuzzle)}
      className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors"
    >
      {currentIndex < LEVEL2_PUZZLES.length - 1 ? 'Næsta verkefni →' : 'Ljúka stigi →'}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 md:p-8 phone:p-3">
      {/* A phone on its side: the task card on the left, the steps on the right. */}
      <div
        ref={levelTopRef}
        className="max-w-4xl mx-auto phone-land:grid phone-land:grid-cols-2 phone-land:gap-x-3 phone-land:items-start"
      >
        {/* Header (on a phone: Til baka and the counters, then the title and the bar) */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-4 phone:px-3 phone:py-2 phone:mb-3 phone-land:col-span-2">
          <div className="flex justify-between items-center">
            <button
              onClick={onBack}
              className="text-warm-600 hover:text-warm-800 flex items-center gap-2 pointer-coarse:py-2.5 pointer-coarse:-my-2.5"
            >
              ← Til baka
            </button>
            <div className="flex items-center gap-4 phone:gap-3">
              <div className="text-sm text-warm-500">
                {Math.min(completed + 1, LEVEL2_PUZZLES.length)} / {LEVEL2_PUZZLES.length}
              </div>
              <div className="text-lg font-bold text-kvenno-orange phone:text-base">
                Stig: {score}
              </div>
            </div>
          </div>

          <h1
            ref={headingRef}
            className="text-xl md:text-2xl font-bold mt-2 text-kvenno-orange phone:text-base phone:mt-1"
          >
            Stuðpúðasmíði - Stig 2
          </h1>
          <p className="text-warm-600 text-sm phone:sr-only">Henderson-Hasselbalch útreikningar</p>

          {/* Progress bar */}
          <div className="w-full bg-warm-200 rounded-full h-2 mt-3 phone:h-1.5 phone:mt-2">
            <div
              className="h-2 phone:h-1.5 rounded-full transition-all duration-300 bg-kvenno-orange"
              style={{ width: `${(completed / LEVEL2_PUZZLES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Task Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 border-t-4 border-kvenno-orange phone:p-3 phone:mb-3 phone-land:col-start-1 phone-land:row-start-2 phone-land:row-span-2">
          <div className="flex items-start gap-3 mb-4 phone:gap-2 phone:mb-2">
            <span className="text-white text-sm font-bold px-3 py-1 rounded-full bg-kvenno-orange phone:px-2 phone:py-0.5">
              #{puzzle.id}
            </span>
            <div className="flex-1 phone:min-w-0">
              <h2 data-item-start className="text-lg font-bold text-warm-800 phone:text-base">
                {problem.system}
              </h2>
              <p className="text-warm-700 mt-1 phone:mt-0 phone:text-sm">{puzzle.taskIs}</p>
            </div>
          </div>

          {/* Problem Details (on a phone each on one line: the name, then the value) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 phone:gap-2 phone:mb-2">
            <div className={DATA_TILE}>
              <div className="text-xs text-warm-500">pKa</div>
              <div className="text-lg font-bold text-warm-800 phone:text-sm">
                {formatDecimal(problem.pKa)}
              </div>
            </div>
            <div className={DATA_TILE}>
              <div className="text-xs text-warm-500">Markmiðs-pH</div>
              <div className="text-lg font-bold text-kvenno-orange phone:text-sm">
                {formatDecimal(problem.targetPH)}
              </div>
            </div>
            <div className={DATA_TILE}>
              <div className="text-xs text-warm-500">Rúmmál</div>
              <div className="text-lg font-bold text-warm-800 phone:text-sm">
                {formatDecimal(problem.volume)} L
              </div>
            </div>
            <div className={DATA_TILE}>
              <div className="text-xs text-warm-500">Heildarstyrkur</div>
              <div className="text-lg font-bold text-warm-800 phone:text-sm">
                {formatDecimal(problem.totalConcentration)} M
              </div>
            </div>
          </div>

          {/* Component Info */}
          <div className="grid grid-cols-2 gap-3 mb-4 phone:gap-2 phone:mb-0">
            <div className="bg-red-50 p-3 rounded-lg phone:p-2">
              <div className="text-xs text-red-600 font-semibold">Sýra</div>
              <div className="font-bold text-red-800">{problem.acidName}</div>
              <div className="text-xs text-red-600">
                M = {formatDecimal(problem.acidMolarMass)} g/mól
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg phone:p-2">
              <div className="text-xs text-blue-600 font-semibold">Basi</div>
              <div className="font-bold text-blue-800">{problem.baseName}</div>
              <div className="text-xs text-blue-600">
                M = {formatDecimal(problem.baseMolarMass)} g/mól
              </div>
            </div>
          </div>

          {/* Context */}
          {!phone && contextBox}

          {/* Hint System */}
          {!phone && <div className="mb-4">{hintSystem}</div>}
        </div>

        {/* Flask Comparison - static demo with 0.01 mol HCl added */}
        {!phone && flaskComparison}

        {/* Step Progress Indicator */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4 phone:px-3 phone:py-2 phone:mb-3 phone-land:col-start-2 phone-land:row-start-2">
          <div className="flex items-center justify-between">
            <div className={`flex-1 text-center ${step === 'direction' ? 'font-bold' : ''}`}>
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 phone:w-7 phone:h-7 phone:mb-0.5 ${
                  directionCorrect
                    ? 'bg-green-500 text-white'
                    : step === 'direction'
                      ? 'bg-orange-500 text-white'
                      : 'bg-warm-200'
                }`}
              >
                {directionCorrect ? '✓' : '1'}
              </div>
              <div className="text-xs text-warm-600">Stefna</div>
            </div>
            <div className="flex-shrink-0 w-12 h-0.5 bg-warm-200" />
            <div className={`flex-1 text-center ${step === 'ratio' ? 'font-bold' : ''}`}>
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 phone:w-7 phone:h-7 phone:mb-0.5 ${
                  ratioCorrect
                    ? 'bg-green-500 text-white'
                    : step === 'ratio'
                      ? 'bg-orange-500 text-white'
                      : 'bg-warm-200'
                }`}
              >
                {ratioCorrect ? '✓' : '2'}
              </div>
              <div className="text-xs text-warm-600">Hlutfall</div>
            </div>
            <div className="flex-shrink-0 w-12 h-0.5 bg-warm-200" />
            <div
              className={`flex-1 text-center ${step === 'mass' || step === 'complete' ? 'font-bold' : ''}`}
            >
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 phone:w-7 phone:h-7 phone:mb-0.5 ${
                  massCorrect
                    ? 'bg-green-500 text-white'
                    : step === 'mass'
                      ? 'bg-orange-500 text-white'
                      : 'bg-warm-200'
                }`}
              >
                {massCorrect ? '✓' : '3'}
              </div>
              <div className="text-xs text-warm-600">Massi</div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div
          ref={stepCardRef}
          className={`bg-white rounded-xl shadow-lg p-4 sm:p-6 phone:p-3 ${
            // Solved: the worked solution is read across the whole width, under the task.
            step === 'complete'
              ? 'phone-land:col-span-2 phone-land:row-start-4'
              : 'phone-land:col-start-2 phone-land:row-start-3'
          }`}
        >
          {/* Step 1: Direction */}
          <Presence show={step === 'direction'} exitDuration={STEP_EXIT_MS}>
            {/* On a phone the feedback follows "Athuga svar" rather than pushing it down. */}
            <div className="phone:flex phone:flex-col">
              <h3 className="text-lg font-bold text-warm-800 mb-4 phone:text-base phone:mb-2">
                Skref 1: Er markmiðs-pH hærra, jafnt eða lægra en pKa?
              </h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 phone:p-2 phone:mb-2">
                <p className="text-sm text-yellow-800">
                  <strong>Munið:</strong> pH = pKa + log([Basi]/[Sýra]). Ef pH {'>'} pKa, þá er
                  [Basi] {'>'} [Sýra].
                </p>
              </div>

              <div
                ref={directionAnswerRef}
                className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 phone:mb-3"
              >
                <button
                  onClick={() => setSelectedDirection('higher')}
                  className={`px-1 py-4 sm:p-4 phone:py-2 rounded-lg border-2 transition-all ${
                    selectedDirection === 'higher'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-warm-200 hover:border-warm-300'
                  }`}
                >
                  <div className="text-2xl mb-1 phone:text-xl phone:mb-0">📈</div>
                  <div className="font-semibold">Hærra</div>
                  <div className="text-xs text-warm-500 whitespace-nowrap">pH {'>'} pKa</div>
                </button>
                <button
                  onClick={() => setSelectedDirection('equal')}
                  className={`px-1 py-4 sm:p-4 phone:py-2 rounded-lg border-2 transition-all ${
                    selectedDirection === 'equal'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-warm-200 hover:border-warm-300'
                  }`}
                >
                  <div className="text-2xl mb-1 phone:text-xl phone:mb-0">⚖️</div>
                  <div className="font-semibold">Jafnt</div>
                  <div className="text-xs text-warm-500 whitespace-nowrap">pH = pKa</div>
                </button>
                <button
                  onClick={() => setSelectedDirection('lower')}
                  className={`px-1 py-4 sm:p-4 phone:py-2 rounded-lg border-2 transition-all ${
                    selectedDirection === 'lower'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-warm-200 hover:border-warm-300'
                  }`}
                >
                  <div className="text-2xl mb-1 phone:text-xl phone:mb-0">📉</div>
                  <div className="font-semibold">Lægra</div>
                  <div className="text-xs text-warm-500 whitespace-nowrap">pH {'<'} pKa</div>
                </button>
              </div>

              <div className="phone:order-last">
                <Presence show={!!directionFeedback} exitDuration={250}>
                  <div
                    ref={directionFeedbackRef}
                    className={`p-3 rounded-lg mb-4 phone:mb-0 phone:mt-3 ${
                      directionFeedback?.includes('Rétt')
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {directionFeedback}
                  </div>
                </Presence>
              </div>

              <button
                onClick={checkDirection}
                disabled={!selectedDirection}
                className={`w-full py-3 text-white font-bold rounded-lg transition-colors disabled:bg-warm-300 disabled:cursor-not-allowed ${selectedDirection ? 'bg-kvenno-orange' : ''}`}
              >
                Athuga svar
              </button>
            </div>
          </Presence>

          {/* Step 2: Ratio */}
          <Presence show={step === 'ratio'} exitDuration={STEP_EXIT_MS}>
            {/* On a phone the field and "Athuga svar" share a row, and the feedback follows. */}
            <div className="phone:flex phone:flex-wrap phone:items-end phone:gap-x-2">
              <h3
                ref={ratioHeadingRef}
                className="text-lg font-bold text-warm-800 mb-4 phone:basis-full phone:text-base phone:mb-2"
              >
                Skref 2: Reiknaðu [Basi]/[Sýra] hlutfallið
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 phone:basis-full phone:p-2 phone:mb-2">
                <p className="text-sm text-blue-800">
                  <strong>Formúla:</strong> pH = pKa + log(hlutfall) → hlutfall = 10^(pH - pKa)
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  hlutfall = 10^({formatDecimal(problem.targetPH)} - {formatDecimal(problem.pKa)}) =
                  10^
                  {formatDecimal(problem.targetPH - problem.pKa, 2)}
                </p>
              </div>

              <div ref={ratioAnswerRef} className="mb-4 phone:mb-0 phone:flex-1 phone:min-w-0">
                <label
                  htmlFor="buffer-l2-ratio"
                  className="block text-sm font-medium text-warm-700 mb-1"
                >
                  Hlutfall [Basi]/[Sýra]:
                </label>
                <input
                  id="buffer-l2-ratio"
                  type="text"
                  inputMode="decimal"
                  enterKeyHint="done"
                  value={ratioInput}
                  onChange={(e) => setRatioInput(e.target.value)}
                  onKeyDown={onEnter(() => ratioInput && checkRatio())}
                  placeholder="0,00"
                  className="w-full p-3 border-2 border-warm-300 rounded-lg focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="phone:order-last phone:basis-full">
                <Presence show={!!ratioFeedback} exitDuration={250}>
                  <div
                    ref={ratioFeedbackRef}
                    className={`p-3 rounded-lg mb-4 phone:mb-0 phone:mt-3 ${
                      ratioFeedback?.includes('Rétt')
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {ratioFeedback}
                  </div>
                </Presence>
              </div>

              <button
                ref={ratioCheckRef}
                onClick={checkRatio}
                disabled={!ratioInput}
                className={`w-full phone:w-auto phone:shrink-0 phone:px-4 py-3 text-white font-bold rounded-lg transition-colors disabled:bg-warm-300 disabled:cursor-not-allowed ${ratioInput ? 'bg-kvenno-orange' : ''}`}
              >
                Athuga svar
              </button>
            </div>
          </Presence>

          {/* Step 3: Mass */}
          <Presence show={step === 'mass'} exitDuration={STEP_EXIT_MS}>
            {/* On a phone the feedback follows "Athuga svar" rather than pushing it down. */}
            <div className="phone:flex phone:flex-col">
              <h3
                ref={massHeadingRef}
                className="text-lg font-bold text-warm-800 mb-4 phone:text-base phone:mb-2"
              >
                Skref 3: Reiknaðu massa sýru og basa (í grömmum)
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 phone:p-2 phone:mb-2">
                <p className="text-sm text-green-800">
                  <strong>Útreikningur:</strong> Notaðu heildarstyrkinn (
                  {formatDecimal(problem.totalConcentration)} M) og rúmmálið (
                  {formatDecimal(problem.volume)} L) til að finna heildarmól. Skiptu síðan á milli
                  sýru og basa samkvæmt hlutfallinu.
                </p>
                <p className="text-sm text-green-800 mt-1">massi = mól × mólmassi</p>
              </div>

              <div
                ref={massAnswerRef}
                className="grid grid-cols-2 gap-4 mb-4 phone:gap-2 phone:mb-3"
              >
                <div className="phone:min-w-0">
                  <label
                    htmlFor="buffer-l2-acid-mass"
                    className="block text-sm font-medium text-red-700 mb-1"
                  >
                    Sýrumassi (g):
                  </label>
                  <input
                    ref={acidMassRef}
                    id="buffer-l2-acid-mass"
                    type="text"
                    inputMode="decimal"
                    enterKeyHint="next"
                    value={acidMassInput}
                    onChange={(e) => setAcidMassInput(e.target.value)}
                    onKeyDown={onEnter(() => acidMassInput && baseMassInput && checkMass(), {
                      ref: baseMassRef,
                      empty: !baseMassInput,
                    })}
                    placeholder={`${problem.acidName}`}
                    className="w-full p-3 border-2 border-red-300 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div className="phone:min-w-0">
                  <label
                    htmlFor="buffer-l2-base-mass"
                    className="block text-sm font-medium text-blue-700 mb-1"
                  >
                    Basamassi (g):
                  </label>
                  <input
                    ref={baseMassRef}
                    id="buffer-l2-base-mass"
                    type="text"
                    inputMode="decimal"
                    enterKeyHint="done"
                    value={baseMassInput}
                    onChange={(e) => setBaseMassInput(e.target.value)}
                    onKeyDown={onEnter(() => acidMassInput && baseMassInput && checkMass(), {
                      ref: acidMassRef,
                      empty: !acidMassInput,
                    })}
                    placeholder={`${problem.baseName}`}
                    className="w-full p-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="phone:order-last">
                <Presence show={!!massFeedback} exitDuration={250}>
                  <div
                    ref={massFeedbackRef}
                    className={`p-3 rounded-lg mb-4 phone:mb-0 phone:mt-3 ${
                      massFeedback?.includes('Frábært')
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {massFeedback}
                  </div>
                </Presence>
              </div>

              <button
                ref={massCheckRef}
                onClick={checkMass}
                disabled={!acidMassInput || !baseMassInput}
                className={`w-full py-3 text-white font-bold rounded-lg transition-colors disabled:bg-warm-300 disabled:cursor-not-allowed ${acidMassInput && baseMassInput ? 'bg-kvenno-orange' : ''}`}
              >
                Athuga svar
              </button>
            </div>
          </Presence>

          {/* Completion & Explanation */}
          <Presence show={step === 'complete' && showExplanation} exitDuration={250}>
            <div>
              {/* The region focus moves to once the puzzle is solved (P3). */}
              <div
                ref={verdictRef}
                role="group"
                aria-labelledby="buffer-l2-verdict"
                className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4 phone:p-3 phone:mb-3"
              >
                <h3 id="buffer-l2-verdict" className="font-bold text-green-800 mb-2">
                  Rétt svar!
                </h3>
                <p className="text-green-700 mb-3 phone:mb-2">{puzzle.explanationIs}</p>

                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <h4 className="font-semibold text-warm-700 mb-2">Útreikningur:</h4>
                  <ul className="text-sm text-warm-600 space-y-1">
                    <li>
                      • pH - pKa = {formatDecimal(problem.targetPH)} - {formatDecimal(problem.pKa)}{' '}
                      = {formatDecimal(problem.targetPH - problem.pKa, 2)}
                    </li>
                    <li>
                      • Hlutfall = 10^{formatDecimal(problem.targetPH - problem.pKa, 2)} ={' '}
                      {formatDecimal(solution.ratio, 2)}
                    </li>
                    <li>
                      • Heildarmól = {formatDecimal(problem.totalConcentration)} M ×{' '}
                      {formatDecimal(problem.volume)} L ={' '}
                      {formatDecimal(problem.totalConcentration * problem.volume, 4)} mól
                    </li>
                    <li>
                      • Sýra: {formatDecimal(solution.acidMoles, 4)} mól ×{' '}
                      {formatDecimal(problem.acidMolarMass)} g/mól ={' '}
                      {formatDecimal(solution.acidMass, 2)} g
                    </li>
                    <li>
                      • Basi: {formatDecimal(solution.baseMoles, 4)} mól ×{' '}
                      {formatDecimal(problem.baseMolarMass)} g/mól ={' '}
                      {formatDecimal(solution.baseMass, 2)} g
                    </li>
                  </ul>
                </div>
              </div>

              {/* On a phone "Næsta verkefni" comes straight after the worked solution, and the
                  buffer-capacity explorer stays in the flow after it. */}
              {phone && nextButton}

              {/* Interactive buffer capacity viz — lets students see that the buffer they
                  designed actually holds pH steady against added acid/base. */}
              <div className="mb-4 phone:mb-0 phone:mt-3">
                <BufferCapacityVisualization
                  pKa={problem.pKa}
                  acidConc={solution.acidConc}
                  baseConc={solution.baseConc}
                  totalConc={problem.totalConcentration}
                  acidName={problem.acidName}
                  baseName={problem.baseName}
                />
              </div>

              {!phone && nextButton}
            </div>
          </Presence>
        </div>

        {/* On a phone: the hints under the step card, then the context and the comparison */}
        {phone && (
          <>
            <div className="mt-3 phone-land:col-span-2">{hintSystem}</div>
            {problem.context && <div className="mt-3 phone-land:col-span-2">{contextBox}</div>}
            <div className="mt-3 phone-land:col-span-2">{flaskComparison}</div>
          </>
        )}

        {/* Formula Reference */}
        <div className="mt-6 phone:mt-3 bg-white rounded-xl shadow-lg p-4 phone-land:col-span-2">
          <h3 className="font-semibold text-warm-700 mb-2">📐 Henderson-Hasselbalch</h3>
          <div className="bg-warm-50 rounded-lg p-3 text-center">
            <p className="text-lg font-mono">
              pH = pK<sub>a</sub> + log([A⁻]/[HA])
            </p>
            <p className="text-sm text-warm-600 mt-2">
              Þar sem [A⁻] = styrkur basa og [HA] = styrkur sýru
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
