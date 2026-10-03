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
  useScreenTop,
} from '@shared/utils';

import { BufferCapacityVisualization } from './BufferCapacityVisualization';
import { LEVEL3_PUZZLES } from '../data/level3-puzzles';
import { BUFFER_PROBLEMS } from '../data/problems';
import { solveStockRecipe } from '../engine/buffer';

interface Level3Props {
  /**
   * The level is done. It reports no count: a puzzle cannot be left unsolved (Næsta waits for
   * the last step to be right), so every run would read "N af N rétt" (mobile-pass decision
   * 1 (b), as item 23 did for Einingakeðjan).
   */
  onComplete: () => void;
  onBack: () => void;
}

type Step = 'ratio' | 'moles' | 'volumes' | 'complete';

/** How long an answered step takes to fade out (its Presence exitDuration). */
const STEP_EXIT_MS = 250;
/** Presence mounts the feedback a frame after it is set; wait this long before measuring it. */
const FEEDBACK_MOUNT_MS = 60;
/** A given value: on a phone its name and value share one line. */
const DATA_TILE =
  'bg-warm-50 p-3 rounded-lg text-center phone:px-2 phone:py-1 phone:text-left phone:flex ' +
  'phone:flex-wrap phone:items-baseline phone:justify-between phone:gap-x-2';

/**
 * Level 3: Design with Stock Solutions
 *
 * Learning Objectives:
 * - Calculate volumes from stock solutions
 * - Apply dilution formula: C1V1 = C2V2
 * - Design buffers with practical constraints
 *
 * 3-Step Flow:
 * 1. Ratio: Calculate required [Base]/[Acid] ratio
 * 2. Moles: Calculate moles of each component
 * 3. Volumes: Calculate volumes of stock solutions needed
 */
export default function Level3({ onComplete, onBack }: Level3Props) {
  const [showIntro, setShowIntro] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [step, setStep] = useState<Step>('ratio');
  const [, setHintsUsedTotal] = useState(0);
  const [hintResetKey, setHintResetKey] = useState(0);
  const [completed, setCompleted] = useState(0);
  // How many hint tiers are open, so the hints keep them when a phone layout moves them.
  const [hintTiers, setHintTiers] = useState(0);
  // Each wrong or unreadable answer, so a repeated one still brings its feedback into view.
  const [wrongChecks, setWrongChecks] = useState(0);
  const levelCompleteReported = useRef(false);
  const stepCardRef = useRef<HTMLDivElement>(null);
  const introHeadingRef = useRef<HTMLHeadingElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const ratioFeedbackRef = useRef<HTMLDivElement>(null);
  const molesFeedbackRef = useRef<HTMLDivElement>(null);
  const volumeFeedbackRef = useRef<HTMLDivElement>(null);
  const ratioAnswerRef = useRef<HTMLDivElement>(null);
  const molesAnswerRef = useRef<HTMLDivElement>(null);
  const volumeAnswerRef = useRef<HTMLDivElement>(null);
  const molesHeadingRef = useRef<HTMLHeadingElement>(null);
  const volumeHeadingRef = useRef<HTMLHeadingElement>(null);
  const molesCheckRef = useRef<HTMLButtonElement>(null);
  const volumeCheckRef = useRef<HTMLButtonElement>(null);
  const verdictRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const acidMolesRef = useRef<HTMLInputElement>(null);
  const baseMolesRef = useRef<HTMLInputElement>(null);
  const acidVolumeRef = useRef<HTMLInputElement>(null);
  const baseVolumeRef = useRef<HTMLInputElement>(null);
  // On a phone the hints sit under the step card and the context after it, so the given data,
  // the step and its answer share one screen. Rendered in one place or the other, never twice.
  const phone = useIsPhone();

  // Step 1: Ratio
  const [ratioInput, setRatioInput] = useState('');
  const [ratioFeedback, setRatioFeedback] = useState<string | null>(null);
  const [ratioCorrect, setRatioCorrect] = useState(false);

  // Step 2: Moles
  const [acidMolesInput, setAcidMolesInput] = useState('');
  const [baseMolesInput, setBaseMolesInput] = useState('');
  const [molesFeedback, setMolesFeedback] = useState<string | null>(null);
  const [molesCorrect, setMolesCorrect] = useState(false);

  // Step 3: Volumes
  const [acidVolumeInput, setAcidVolumeInput] = useState('');
  const [baseVolumeInput, setBaseVolumeInput] = useState('');
  const [volumeFeedback, setVolumeFeedback] = useState<string | null>(null);
  const [volumeCorrect, setVolumeCorrect] = useState(false);

  // Show explanation after puzzle completion
  const [showExplanation, setShowExplanation] = useState(false);

  const puzzle = LEVEL3_PUZZLES[currentIndex];
  const problem = BUFFER_PROBLEMS.find((p) => p.id === puzzle.problemId);

  // Check completion - must be before conditional returns to satisfy rules-of-hooks
  useEffect(() => {
    if (completed >= LEVEL3_PUZZLES.length && !levelCompleteReported.current) {
      levelCompleteReported.current = true;
      onComplete();
    }
  }, [completed, onComplete]);

  // The level opens on its introduction with the heading focused: the menu card that opened
  // it has gone.
  useLayoutEffect(() => {
    focusTarget(introHeadingRef.current ?? headingRef.current);
  }, []);

  // "Byrja" ends the intro, so on a phone it is tapped part-way down the page; open the first
  // task from its top rather than at that offset (at every width, as the game always did),
  // with the level's heading focused.
  useScreenTop(showIntro, { anyWidth: true, focus: headingRef });

  // "Næsta verkefni" ends a long worked solution, so the next puzzle's top is above the
  // screen: bring it back (at any width, as the game always did, only when it is off screen)
  // and focus the new puzzle's name.
  const levelTopRef = useItemTop<HTMLDivElement>(currentIndex, { anyWidth: true, gap: 0 });

  // A correct step fades out and the next one takes its place. Once it has, focus its
  // heading (the button pressed has gone) and, on a phone, show it through its Athuga.
  useEffect(() => {
    if (step !== 'moles' && step !== 'volumes') return;
    const timer = window.setTimeout(() => {
      const heading = step === 'moles' ? molesHeadingRef.current : volumeHeadingRef.current;
      const check = step === 'moles' ? molesCheckRef.current : volumeCheckRef.current;
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
        step === 'ratio'
          ? [ratioAnswerRef.current, ratioFeedbackRef.current]
          : step === 'moles'
            ? [molesAnswerRef.current, molesFeedbackRef.current]
            : [volumeAnswerRef.current, volumeFeedbackRef.current];
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

  // Safety check
  if (!problem) {
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

  // Every correct answer on this screen is derived, never stored — see engine/buffer.ts.
  const recipe = solveStockRecipe(problem, puzzle);
  const targetMoles = recipe.totalMoles;
  const correctRatio = recipe.ratio;
  const correctBaseMoles = recipe.baseMoles;
  const correctAcidMoles = recipe.acidMoles;

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

  // Step 1: Check ratio answer
  // A step fades out for 250 ms after it is answered and its button stays live
  // meanwhile, so each check ignores a tap that arrives after its step is over.
  const checkRatio = () => {
    if (step !== 'ratio') return;
    const userRatio = parseStudentNumber(ratioInput);
    if (isNaN(userRatio) || userRatio <= 0) {
      setWrongChecks((n) => n + 1);
      setRatioFeedback('Vinsamlegast sláðu inn jákvæða tölu.');
      return;
    }

    const tolerance = 0.1; // 10% tolerance
    const relativeError = Math.abs(userRatio - correctRatio) / correctRatio;

    if (relativeError <= tolerance) {
      setRatioCorrect(true);
      setRatioFeedback(`Rétt! Hlutfall = ${formatDecimal(correctRatio, 2)}. Nú skaltu reikna mól.`);
      setStep('moles');
    } else {
      setWrongChecks((n) => n + 1);
      setRatioFeedback(
        `Ekki rétt. Hlutfall = 10^(pH - pKa) = 10^(${formatDecimal(problem.targetPH, 2)} - ${formatDecimal(problem.pKa, 2)}) = 10^${formatDecimal(problem.targetPH - problem.pKa, 2)}`
      );
    }
  };

  // Step 2: Check moles answer
  const checkMoles = () => {
    if (step !== 'moles') return;
    const userAcidMoles = parseStudentNumber(acidMolesInput);
    const userBaseMoles = parseStudentNumber(baseMolesInput);

    if (isNaN(userAcidMoles) || isNaN(userBaseMoles) || userAcidMoles <= 0 || userBaseMoles <= 0) {
      setWrongChecks((n) => n + 1);
      setMolesFeedback('Vinsamlegast sláðu inn jákvæðar tölur.');
      return;
    }

    const tolerance = 0.1;
    const acidError = Math.abs(userAcidMoles - correctAcidMoles) / correctAcidMoles;
    const baseError = Math.abs(userBaseMoles - correctBaseMoles) / correctBaseMoles;

    if (acidError <= tolerance && baseError <= tolerance) {
      setMolesCorrect(true);
      setMolesFeedback(`Rétt! Nú skaltu reikna rúmmál af birgðalausnum.`);
      setStep('volumes');
    } else {
      setWrongChecks((n) => n + 1);
      let feedback = 'Ekki rétt. ';
      feedback += `Heildarmól = ${formatDecimal(puzzle.targetConcentration)} M × ${formatDecimal(puzzle.targetVolume / 1000)} L = ${formatDecimal(targetMoles, 4)} mól. `;
      feedback += `Skiptu samkvæmt hlutfalli ${formatDecimal(correctRatio, 2)}.`;
      setMolesFeedback(feedback);
    }
  };

  // Step 3: Check volumes answer
  const checkVolumes = () => {
    if (step !== 'volumes') return;
    const userAcidVolume = parseStudentNumber(acidVolumeInput);
    const userBaseVolume = parseStudentNumber(baseVolumeInput);

    if (
      isNaN(userAcidVolume) ||
      isNaN(userBaseVolume) ||
      userAcidVolume <= 0 ||
      userBaseVolume <= 0
    ) {
      setWrongChecks((n) => n + 1);
      setVolumeFeedback('Vinsamlegast sláðu inn jákvæðar tölur.');
      return;
    }

    const tolerance = puzzle.volumeTolerance;
    const acidError = Math.abs(userAcidVolume - recipe.acidVolume) / recipe.acidVolume;
    const baseError = Math.abs(userBaseVolume - recipe.baseVolume) / recipe.baseVolume;

    if (acidError <= tolerance && baseError <= tolerance) {
      setVolumeCorrect(true);
      // Hints are free (mobile-pass decision 2 (b)): this used to pay 100 points times the
      // HintSystem tier multiplier, down to 40 with every tier open, and said so here.
      setVolumeFeedback('Frábært!');
      setShowExplanation(true);
      setStep('complete');
    } else {
      setWrongChecks((n) => n + 1);
      let feedback = 'Ekki rétt. ';
      feedback += `Muna: V = n / C (rúmmál = mól / styrkur birgðalausnar).`;
      if (acidError > tolerance) {
        feedback += ` Sýrurúmmál er ${userAcidVolume > recipe.acidVolume ? 'of hátt' : 'of lágt'}.`;
      }
      if (baseError > tolerance) {
        feedback += ` Basarúmmál er ${userBaseVolume > recipe.baseVolume ? 'of hátt' : 'of lágt'}.`;
      }
      setVolumeFeedback(feedback);
    }
  };

  // Next puzzle
  const nextPuzzle = () => {
    if (step !== 'complete') return;
    setCompleted((prev) => prev + 1);

    if (currentIndex < LEVEL3_PUZZLES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      resetPuzzleState();
    }
  };

  // Reset puzzle state
  const resetPuzzleState = () => {
    setStep('ratio');
    setRatioInput('');
    setRatioFeedback(null);
    setRatioCorrect(false);
    setAcidMolesInput('');
    setBaseMolesInput('');
    setMolesFeedback(null);
    setMolesCorrect(false);
    setAcidVolumeInput('');
    setBaseVolumeInput('');
    setVolumeFeedback(null);
    setVolumeCorrect(false);
    setShowExplanation(false);
    setHintTiers(0);
    setHintResetKey((prev) => prev + 1);
  };

  // Rendered once, in the task card on desktop and under the step card on a phone.
  // `startRevealed` keeps the student's open tiers when the move remounts it. No point cost is
  // shown: hints are free (mobile-pass decision 2 (b)), where the "Stig: x / y" line here once
  // showed the award shrinking with each tier.
  const hintSystem = (
    <HintSystem
      hints={puzzle.hints}
      onHintUsed={handleHintUsed}
      disabled={step === 'complete'}
      resetKey={hintResetKey}
      startRevealed={hintTiers}
      showPointCost={false}
    />
  );

  const contextBox = problem.context && (
    <div className="bg-green-50 border-l-4 border-green-400 p-3 mb-4 phone:mb-0">
      <p className="text-sm text-green-800">{problem.context}</p>
    </div>
  );

  const nextButton = (
    <button
      ref={nextRef}
      onClick={armed(nextPuzzle)}
      className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors"
    >
      {currentIndex < LEVEL3_PUZZLES.length - 1 ? 'Næsta verkefni →' : 'Ljúka stigi →'}
    </button>
  );

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-4 md:p-8 phone:p-3">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8 space-y-4 phone:p-4 phone:space-y-3">
          <button
            onClick={onBack}
            className="text-warm-600 hover:text-warm-800 text-sm pointer-coarse:py-3 pointer-coarse:-mt-3"
          >
            ← Til baka
          </button>
          <h2 ref={introHeadingRef} className="text-2xl font-bold text-green-700 phone:text-xl">
            Stig 3 — frá massa til rúmmála
          </h2>
          <p className="text-warm-700">
            Í stigi 2 reiknuðum við út <strong>massa</strong> hreinna efna (n × M). Í þessu stigi
            notum við <strong>birgðalausnir</strong> sem þegar eru leystar upp í vatni — við mælum
            því út rúmmál í stað þess að vigta.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="font-bold text-blue-800 mb-1">Þynningarformúlan: C₁V₁ = C₂V₂</div>
            <p className="text-sm text-blue-900">
              Þegar við þynnum birgðalausn (C₁) í lokalausn með styrk C₂ og rúmmál V₂, helst
              mólfjöldinn óbreyttur: n = C₁V₁ = C₂V₂. Við vitum mólfjöldann sem við þurfum (úr
              hlutfalli og heildarstyrk) og birgðastyrkinn — þannig leysum við fyrir V₁.
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="font-bold text-green-800 mb-1">Skrefin þrjú:</div>
            <ol className="text-sm text-green-900 space-y-1 list-decimal list-inside">
              <li>
                <strong>Hlutfall</strong> [basi]/[sýra] úr Henderson-Hasselbalch
              </li>
              <li>
                <strong>Mólfjöldi</strong> hvers efnis úr markmiðsstyrk × lokarúmmáli
              </li>
              <li>
                <strong>Rúmmál</strong> birgðalausnar: V = n / C₁
              </li>
            </ol>
          </div>
          <button
            onClick={() => setShowIntro(false)}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl"
          >
            Byrja →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-4 md:p-8 phone:p-3">
      {/* A phone on its side: the task card on the left, the steps on the right. */}
      <div
        ref={levelTopRef}
        className="max-w-4xl mx-auto phone-land:grid phone-land:grid-cols-2 phone-land:gap-x-3 phone-land:items-start"
      >
        {/* Header (on a phone: Til baka and the puzzle counter, then the title and the bar) */}
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
                {Math.min(completed + 1, LEVEL3_PUZZLES.length)} / {LEVEL3_PUZZLES.length}
              </div>
            </div>
          </div>

          <h1
            ref={headingRef}
            className="text-xl md:text-2xl font-bold mt-2 text-green-700 phone:text-base phone:mt-1"
          >
            Stuðpúðasmíði - Stig 3
          </h1>
          <p className="text-warm-600 text-sm phone:sr-only">
            Birgðalausnir og rúmmálsútreikningar
          </p>

          {/* Progress bar */}
          <div className="w-full bg-warm-200 rounded-full h-2 mt-3 phone:h-1.5 phone:mt-2">
            <div
              className="h-2 phone:h-1.5 rounded-full transition-all duration-300 bg-green-500"
              style={{ width: `${(completed / LEVEL3_PUZZLES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Task Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 border-t-4 border-green-500 phone:p-3 phone:mb-3 phone-land:col-start-1 phone-land:row-start-2 phone-land:row-span-2">
          <div className="flex items-start gap-3 mb-4 phone:gap-2 phone:mb-2">
            <span className="text-white text-sm font-bold px-3 py-1 rounded-full bg-green-600 phone:px-2 phone:py-0.5">
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
              <div className="text-lg font-bold text-green-600 phone:text-sm">
                {formatDecimal(problem.targetPH)}
              </div>
            </div>
            <div className={DATA_TILE}>
              <div className="text-xs text-warm-500">Lokarúmmál</div>
              <div className="text-lg font-bold text-warm-800 phone:text-sm">
                {formatDecimal(puzzle.targetVolume)} mL
              </div>
            </div>
            <div className={DATA_TILE}>
              <div className="text-xs text-warm-500">Lokastyrkur</div>
              <div className="text-lg font-bold text-warm-800 phone:text-sm">
                {formatDecimal(puzzle.targetConcentration)} M
              </div>
            </div>
          </div>

          {/* Stock Solution Info (p-2 below sm, or CH₃COONa splits mid-formula at 320 px) */}
          <div className="grid grid-cols-2 gap-3 mb-4 phone:gap-2 phone:mb-0">
            <div className="bg-red-50 p-2 sm:p-3 rounded-lg border-2 border-red-200">
              <div className="text-xs text-red-600 font-semibold flex items-center gap-1">
                <span className="text-lg">🧪</span> Sýrubirgð
              </div>
              <div className="font-bold text-red-800">{problem.acidName}</div>
              <div className="text-sm text-red-600">
                {formatDecimal(puzzle.stockAcidConc)} M birgðalausn
              </div>
            </div>
            <div className="bg-blue-50 p-2 sm:p-3 rounded-lg border-2 border-blue-200">
              <div className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                <span className="text-lg">🧪</span> Basabirgð
              </div>
              <div className="font-bold text-blue-800">{problem.baseName}</div>
              <div className="text-sm text-blue-600">
                {formatDecimal(puzzle.stockBaseConc)} M birgðalausn
              </div>
            </div>
          </div>

          {/* Context */}
          {!phone && contextBox}

          {/* Hint System */}
          {!phone && <div className="mb-4">{hintSystem}</div>}
        </div>

        {/* Step Progress Indicator */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4 phone:px-3 phone:py-2 phone:mb-3 phone-land:col-start-2 phone-land:row-start-2">
          <div className="flex items-center justify-between">
            <div className={`flex-1 text-center ${step === 'ratio' ? 'font-bold' : ''}`}>
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 phone:w-7 phone:h-7 phone:mb-0.5 ${
                  ratioCorrect
                    ? 'bg-green-500 text-white'
                    : step === 'ratio'
                      ? 'bg-green-500 text-white'
                      : 'bg-warm-200'
                }`}
              >
                {ratioCorrect ? '✓' : '1'}
              </div>
              <div className="text-xs text-warm-600">Hlutfall</div>
            </div>
            <div className="flex-shrink-0 w-12 h-0.5 bg-warm-200" />
            <div className={`flex-1 text-center ${step === 'moles' ? 'font-bold' : ''}`}>
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 phone:w-7 phone:h-7 phone:mb-0.5 ${
                  molesCorrect
                    ? 'bg-green-500 text-white'
                    : step === 'moles'
                      ? 'bg-green-500 text-white'
                      : 'bg-warm-200'
                }`}
              >
                {molesCorrect ? '✓' : '2'}
              </div>
              <div className="text-xs text-warm-600">Mól</div>
            </div>
            <div className="flex-shrink-0 w-12 h-0.5 bg-warm-200" />
            <div
              className={`flex-1 text-center ${step === 'volumes' || step === 'complete' ? 'font-bold' : ''}`}
            >
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 phone:w-7 phone:h-7 phone:mb-0.5 ${
                  volumeCorrect
                    ? 'bg-green-500 text-white'
                    : step === 'volumes'
                      ? 'bg-green-500 text-white'
                      : 'bg-warm-200'
                }`}
              >
                {volumeCorrect ? '✓' : '3'}
              </div>
              <div className="text-xs text-warm-600">Rúmmál</div>
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
          {/* Step 1: Ratio */}
          <Presence show={step === 'ratio'} exitDuration={STEP_EXIT_MS}>
            {/* On a phone the field and "Athuga svar" share a row, and the feedback follows. */}
            <div className="phone:flex phone:flex-wrap phone:items-end phone:gap-x-2">
              <h3 className="text-lg font-bold text-warm-800 mb-4 phone:basis-full phone:text-base phone:mb-2">
                Skref 1: Reiknaðu [Basi]/[Sýra] hlutfallið
              </h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 phone:basis-full phone:p-2 phone:mb-2">
                <p className="text-sm text-yellow-800">
                  <strong>Formúla:</strong> Hlutfall = 10<sup>(pH - pKa)</sup> = 10
                  <sup>
                    ({formatDecimal(problem.targetPH)} - {formatDecimal(problem.pKa)})
                  </sup>
                </p>
              </div>

              <div ref={ratioAnswerRef} className="mb-4 phone:mb-0 phone:flex-1 phone:min-w-0">
                <label
                  htmlFor="buffer-l3-ratio"
                  className="block text-sm font-medium text-warm-700 mb-1"
                >
                  Hlutfall [Basi]/[Sýra]:
                </label>
                <input
                  id="buffer-l3-ratio"
                  type="text"
                  inputMode="decimal"
                  enterKeyHint="done"
                  value={ratioInput}
                  onChange={(e) => setRatioInput(e.target.value)}
                  onKeyDown={onEnter(() => ratioInput && checkRatio())}
                  placeholder="0,00"
                  className="w-full p-3 border-2 border-warm-300 rounded-lg focus:border-green-500 focus:outline-none"
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
                onClick={checkRatio}
                disabled={!ratioInput}
                className="w-full phone:w-auto phone:shrink-0 phone:px-4 py-3 text-white font-bold rounded-lg transition-colors disabled:bg-warm-300 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700"
              >
                Athuga svar
              </button>
            </div>
          </Presence>

          {/* Step 2: Moles */}
          <Presence show={step === 'moles'} exitDuration={STEP_EXIT_MS}>
            {/* On a phone the feedback follows "Athuga svar" rather than pushing it down. */}
            <div className="phone:flex phone:flex-col">
              <h3
                ref={molesHeadingRef}
                className="text-lg font-bold text-warm-800 mb-4 phone:text-base phone:mb-2"
              >
                Skref 2: Reiknaðu mól af sýru og basa
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 phone:p-2 phone:mb-2">
                <p className="text-sm text-blue-800">
                  <strong>Heildarmól:</strong> n = C × V ={' '}
                  {formatDecimal(puzzle.targetConcentration)} M ×{' '}
                  {formatDecimal(puzzle.targetVolume / 1000)} L = {formatDecimal(targetMoles, 4)}{' '}
                  mól
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  <strong>Skipting:</strong> Notaðu hlutfallið {formatDecimal(correctRatio, 2)} til
                  að skipta mólum.
                </p>
              </div>

              <div
                ref={molesAnswerRef}
                className="grid grid-cols-2 gap-4 mb-4 phone:gap-2 phone:mb-3"
              >
                <div className="phone:min-w-0">
                  <label
                    htmlFor="buffer-l3-acid-moles"
                    className="block text-sm font-medium text-red-700 mb-1"
                  >
                    Mól sýru:
                  </label>
                  <input
                    ref={acidMolesRef}
                    id="buffer-l3-acid-moles"
                    type="text"
                    inputMode="decimal"
                    enterKeyHint="next"
                    value={acidMolesInput}
                    onChange={(e) => setAcidMolesInput(e.target.value)}
                    onKeyDown={onEnter(() => acidMolesInput && baseMolesInput && checkMoles(), {
                      ref: baseMolesRef,
                      empty: !baseMolesInput,
                    })}
                    placeholder="0,0000"
                    className="w-full p-3 border-2 border-red-300 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div className="phone:min-w-0">
                  <label
                    htmlFor="buffer-l3-base-moles"
                    className="block text-sm font-medium text-blue-700 mb-1"
                  >
                    Mól basa:
                  </label>
                  <input
                    ref={baseMolesRef}
                    id="buffer-l3-base-moles"
                    type="text"
                    inputMode="decimal"
                    enterKeyHint="done"
                    value={baseMolesInput}
                    onChange={(e) => setBaseMolesInput(e.target.value)}
                    onKeyDown={onEnter(() => acidMolesInput && baseMolesInput && checkMoles(), {
                      ref: acidMolesRef,
                      empty: !acidMolesInput,
                    })}
                    placeholder="0,0000"
                    className="w-full p-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="phone:order-last">
                <Presence show={!!molesFeedback} exitDuration={250}>
                  <div
                    ref={molesFeedbackRef}
                    className={`p-3 rounded-lg mb-4 phone:mb-0 phone:mt-3 ${
                      molesFeedback?.includes('Rétt')
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {molesFeedback}
                  </div>
                </Presence>
              </div>

              <button
                ref={molesCheckRef}
                onClick={checkMoles}
                disabled={!acidMolesInput || !baseMolesInput}
                className="w-full py-3 text-white font-bold rounded-lg transition-colors disabled:bg-warm-300 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700"
              >
                Athuga svar
              </button>
            </div>
          </Presence>

          {/* Step 3: Volumes */}
          <Presence show={step === 'volumes'} exitDuration={STEP_EXIT_MS}>
            {/* On a phone the feedback follows "Athuga svar" rather than pushing it down. */}
            <div className="phone:flex phone:flex-col">
              <h3
                ref={volumeHeadingRef}
                className="text-lg font-bold text-warm-800 mb-4 phone:text-base phone:mb-2"
              >
                Skref 3: Reiknaðu rúmmál af birgðalausnum (í mL)
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 phone:p-2 phone:mb-2">
                <p className="text-sm text-green-800">
                  <strong>Formúla:</strong> V = n / C (rúmmál = mól / styrkur birgðalausnar)
                </p>
                <p className="text-sm text-green-800 mt-1">
                  Sýrubirgð er {formatDecimal(puzzle.stockAcidConc)} M, basabirgð er{' '}
                  {formatDecimal(puzzle.stockBaseConc)} M
                </p>
              </div>

              <div
                ref={volumeAnswerRef}
                className="grid grid-cols-2 gap-4 mb-4 phone:gap-2 phone:mb-3"
              >
                <div className="phone:min-w-0">
                  <label
                    htmlFor="buffer-l3-acid-volume"
                    className="block text-sm font-medium text-red-700 mb-1"
                  >
                    Rúmmál sýru (mL):
                  </label>
                  <input
                    ref={acidVolumeRef}
                    id="buffer-l3-acid-volume"
                    type="text"
                    inputMode="decimal"
                    enterKeyHint="next"
                    value={acidVolumeInput}
                    onChange={(e) => setAcidVolumeInput(e.target.value)}
                    onKeyDown={onEnter(() => acidVolumeInput && baseVolumeInput && checkVolumes(), {
                      ref: baseVolumeRef,
                      empty: !baseVolumeInput,
                    })}
                    placeholder="0,00"
                    className="w-full p-3 border-2 border-red-300 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div className="phone:min-w-0">
                  <label
                    htmlFor="buffer-l3-base-volume"
                    className="block text-sm font-medium text-blue-700 mb-1"
                  >
                    Rúmmál basa (mL):
                  </label>
                  <input
                    ref={baseVolumeRef}
                    id="buffer-l3-base-volume"
                    type="text"
                    inputMode="decimal"
                    enterKeyHint="done"
                    value={baseVolumeInput}
                    onChange={(e) => setBaseVolumeInput(e.target.value)}
                    onKeyDown={onEnter(() => acidVolumeInput && baseVolumeInput && checkVolumes(), {
                      ref: acidVolumeRef,
                      empty: !acidVolumeInput,
                    })}
                    placeholder="0,00"
                    className="w-full p-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="phone:order-last">
                <Presence show={!!volumeFeedback} exitDuration={250}>
                  <div
                    ref={volumeFeedbackRef}
                    className={`p-3 rounded-lg mb-4 phone:mb-0 phone:mt-3 ${
                      volumeFeedback?.includes('Frábært')
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {volumeFeedback}
                  </div>
                </Presence>
              </div>

              <button
                ref={volumeCheckRef}
                onClick={checkVolumes}
                disabled={!acidVolumeInput || !baseVolumeInput}
                className="w-full py-3 text-white font-bold rounded-lg transition-colors disabled:bg-warm-300 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700"
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
                aria-labelledby="buffer-l3-verdict"
                className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4 phone:p-3 phone:mb-3"
              >
                <h3 id="buffer-l3-verdict" className="font-bold text-green-800 mb-2">
                  Rétt svar!
                </h3>
                <p className="text-green-700 mb-3 phone:mb-2">{puzzle.explanationIs}</p>

                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <h4 className="font-semibold text-warm-700 mb-2">Útreikningur:</h4>
                  <ul className="text-sm text-warm-600 space-y-1">
                    <li>
                      • Hlutfall = 10^({formatDecimal(problem.targetPH)} -{' '}
                      {formatDecimal(problem.pKa)}) = {formatDecimal(correctRatio, 2)}
                    </li>
                    <li>
                      • Heildarmól = {formatDecimal(puzzle.targetConcentration)} M ×{' '}
                      {formatDecimal(puzzle.targetVolume / 1000)} L ={' '}
                      {formatDecimal(targetMoles, 4)} mól
                    </li>
                    <li>
                      • Sýra: {formatDecimal(correctAcidMoles, 5)} mól /{' '}
                      {formatDecimal(puzzle.stockAcidConc)} M ={' '}
                      {formatDecimal(recipe.acidVolume / 1000, 5)} L ={' '}
                      {formatDecimal(recipe.acidVolume, 2)} mL
                    </li>
                    <li>
                      • Basi: {formatDecimal(correctBaseMoles, 5)} mól /{' '}
                      {formatDecimal(puzzle.stockBaseConc)} M ={' '}
                      {formatDecimal(recipe.baseVolume / 1000, 5)} L ={' '}
                      {formatDecimal(recipe.baseVolume, 2)} mL
                    </li>
                    <li>
                      • Vatn: {formatDecimal(puzzle.targetVolume)} -{' '}
                      {formatDecimal(recipe.acidVolume, 2)} - {formatDecimal(recipe.baseVolume, 2)}{' '}
                      ≈ {formatDecimal(recipe.waterVolume, 1)} mL
                    </li>
                  </ul>
                </div>

                {/* Visual Recipe Card */}
                <div className="mt-4 bg-gradient-to-r from-green-100 to-teal-100 rounded-lg p-4 border-2 border-green-300 phone:mt-3 phone:p-3">
                  <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                    <span className="text-xl">📋</span> Uppskrift
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 shrink-0 rounded-full bg-red-500 text-white flex items-center justify-center text-xs">
                        1
                      </span>
                      <span>
                        Bættu <strong>{formatDecimal(recipe.acidVolume, 2)} mL</strong> af{' '}
                        {formatDecimal(puzzle.stockAcidConc)} M {problem.acidName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 shrink-0 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                        2
                      </span>
                      <span>
                        Bættu <strong>{formatDecimal(recipe.baseVolume, 2)} mL</strong> af{' '}
                        {formatDecimal(puzzle.stockBaseConc)} M {problem.baseName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 shrink-0 rounded-full bg-warm-500 text-white flex items-center justify-center text-xs">
                        3
                      </span>
                      <span>
                        Fylltu upp í <strong>{formatDecimal(puzzle.targetVolume)} mL</strong> með
                        eimuðu vatni
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* On a phone "Næsta verkefni" comes straight after the recipe, and the
                  buffer-capacity explorer stays in the flow after it. */}
              {phone && nextButton}

              {/* Interactive buffer-capacity check: proves the recipe actually buffers. */}
              <div className="mb-4 phone:mb-0 phone:mt-3">
                <BufferCapacityVisualization
                  pKa={problem.pKa}
                  acidConc={correctAcidMoles / (puzzle.targetVolume / 1000)}
                  baseConc={correctBaseMoles / (puzzle.targetVolume / 1000)}
                  totalConc={puzzle.targetConcentration}
                  acidName={problem.acidName}
                  baseName={problem.baseName}
                />
              </div>

              {!phone && nextButton}
            </div>
          </Presence>
        </div>

        {/* On a phone: the hints under the step card, then the context */}
        {phone && (
          <>
            <div className="mt-3 phone-land:col-span-2">{hintSystem}</div>
            {problem.context && <div className="mt-3 phone-land:col-span-2">{contextBox}</div>}
          </>
        )}

        {/* Formula Reference */}
        <div className="mt-6 phone:mt-3 bg-white rounded-xl shadow-lg p-4 phone-land:col-span-2">
          <h3 className="font-semibold text-warm-700 mb-2">📐 Lykilformúlur</h3>
          <div className="bg-warm-50 rounded-lg p-3 space-y-2 text-sm">
            <p>
              <strong>Henderson-Hasselbalch:</strong> pH = pK<sub>a</sub> + log([A⁻]/[HA])
            </p>
            <p>
              <strong>Hlutfall:</strong> [A⁻]/[HA] = 10
              <sup>
                (pH - pK<sub>a</sub>)
              </sup>
            </p>
            <p>
              <strong>Mól:</strong> n = C × V
            </p>
            <p>
              <strong>Þynning:</strong> V<sub>birgð</sub> = n / C<sub>birgð</sub>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
