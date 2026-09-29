import { useState, useEffect, useRef, useCallback, useId } from 'react';

import {
  Header,
  HintSystem,
  LanguageSwitcher,
  ErrorBoundary,
  Presence,
  FadePresence,
  PhoneDisclosure,
} from '@shared/components';
import { useProgress, useAccessibility, useGameI18n } from '@shared/hooks';
import type { TieredHints } from '@shared/types';
import {
  focusTarget,
  formatDecimal,
  isPhone,
  revealTop,
  useArmedAfter,
  useItemTop,
  useRevealAfterCommit,
  revealSpan,
} from '@shared/utils';

import { NumbersPanel } from './components/NumbersPanel';
import { ParticleEquilibrium } from './components/ParticleEquilibrium';
import { QKComparison } from './components/QKComparison';
import { getRandomEquilibrium } from './data';
import { CONSTANTS, STARTING_MIXTURES } from './data/constants';
import { applyStress } from './engine/stress';
import { gameTranslations } from './i18n';
import {
  Equilibrium,
  Stress,
  ShiftDirection,
  GameMode,
  GameStats,
  ShiftResult,
  DifficultyLevel,
} from './types';
import { calculateShift, getStressDescriptionIs } from './utils/le-chatelier';
import './styles.css';

/** Time limit per question in challenge mode */
const CHALLENGE_SECONDS = 20;

/** How long the outgoing screen fades before it unmounts. */
const SCREEN_FADE_MS = 200;

/**
 * How long the prediction buttons fade out after an answer. Until they unmount
 * they still sit above the explanation, so the reveal waits for them.
 */
const PREDICT_EXIT_MS = 250;

/**
 * How long Keppnishamur waits before it moves on by itself: after an answer
 * (long enough to read the explanation) and after the clock runs out.
 */
const ADVANCE_AFTER_ANSWER_MS = 6000;
const ADVANCE_AFTER_TIMEOUT_MS = 3000;

/**
 * ΔH as the student reads it: decimal comma, `kJ/mól`, and útvermið or
 * innvermið only where ΔH has a sign. A ΔH of zero is neither, and one system
 * (the acetic-acid buffer) is stored at exactly zero.
 */
function heatLabel(deltaH: number): string {
  const value = `ΔH = ${formatDecimal(deltaH)} kJ/mól`;
  if (deltaH < 0) return `${value} (Útvermið)`;
  if (deltaH > 0) return `${value} (Innvermið)`;
  return value;
}

function App() {
  const { progress, updateProgress } = useProgress({
    gameId: 'equilibrium-shifter',
    initialProgress: {
      currentLevel: 0,
      problemsCompleted: 0,
      lastPlayedDate: new Date().toISOString(),
      totalTimeSpent: 0,
      levelProgress: {},
    },
  });

  const { settings, toggleHighContrast, setTextSize } = useAccessibility();
  const { t, language, setLanguage } = useGameI18n({ gameTranslations });

  // Game state
  const [screen, setScreen] = useState<'menu' | 'mode-select' | 'game' | 'feedback' | 'results'>(
    'menu'
  );
  const [gameMode, setGameMode] = useState<GameMode>('learning');
  const [currentEquilibrium, setCurrentEquilibrium] = useState<Equilibrium | null>(null);
  const [appliedStress, setAppliedStress] = useState<Stress | null>(null);
  const [userPrediction, setUserPrediction] = useState<ShiftDirection | null>(null);
  const [correctShift, setCorrectShift] = useState<ShiftResult | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [, setHintsUsedTier] = useState(0);
  const [hintResetKey, setHintResetKey] = useState(0);

  // Stats
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    streak: 0,
    bestStreak: 0,
    hintsUsed: 0,
    totalTime: 0,
    correctByDifficulty: {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
    },
  });

  // Challenge mode state
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions] = useState(10);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const [lastPoints, setLastPoints] = useState(0);

  // Ref to track if timeout has been handled for current question
  const timeoutHandledRef = useRef(false);

  // Keppnishamur's automatic advance. It is held here so that anything else
  // that moves on — «Næsta strax →», «← Til baka», a new round — cancels it.
  // Left running, it fired on whatever question was showing six seconds later,
  // so tapping «Næsta strax →» skipped the next question unanswered and a
  // round ended with fewer than ten answered.
  const advanceTimerRef = useRef<number | null>(null);
  const [advanceSeconds, setAdvanceSeconds] = useState(ADVANCE_AFTER_ANSWER_MS / 1000);
  // The timer calls the latest handleNextQuestion, not the one from the render
  // that scheduled it: that one still held the score from before the answer.
  const nextQuestionRef = useRef<() => void>(() => {});

  const cancelAdvance = () => {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  };

  const scheduleAdvance = (ms: number) => {
    cancelAdvance();
    setAdvanceSeconds(ms / 1000);
    advanceTimerRef.current = window.setTimeout(() => {
      advanceTimerRef.current = null;
      nextQuestionRef.current();
    }, ms);
  };

  useEffect(() => cancelAdvance, []);

  // The top of each screen. The game's own screens fade in and out
  // (FadePresence), so a new screen mounts a frame after `screen` changes and
  // the old one stays above or below it for SCREEN_FADE_MS.
  const pageTopRef = useRef<HTMLDivElement | null>(null);
  const menuTopRef = useRef<HTMLDivElement | null>(null);
  const gameTopRef = useRef<HTMLDivElement | null>(null);
  const resultsTopRef = useRef<HTMLDivElement | null>(null);
  const learningCardRef = useRef<HTMLButtonElement | null>(null);
  const equationRef = useRef<HTMLDivElement | null>(null);
  const resultsHeadingRef = useRef<HTMLHeadingElement | null>(null);

  // Each screen swap. The game's screens fade (FadePresence), which mounts the
  // new screen a render after `screen` changes, so `useScreenTop`'s layout
  // effect would run before there is a heading to focus. The same steps run
  // instead as the new screen's root attaches, with the same shared helpers:
  // on a phone the new screen starts at the top of the page, or back on the
  // menu with Lærdómshamur revealed; at every width focus moves to the new
  // heading (the equation, the results heading) or to Lærdómshamur, since the
  // button that caused the swap has unmounted. No state is set here: every
  // render of this component re-seeds the particle picture from Math.random,
  // so an extra render would change which equilibrium comes next.
  const lastShownRef = useRef<string>(screen);
  const screenShown = (which: 'menu' | 'game' | 'results') => {
    if (lastShownRef.current === which) return;
    lastShownRef.current = which;
    if (isPhone()) revealTop(pageTopRef.current, { always: true, gap: 0, instant: true });
    if (which === 'menu') {
      revealSpan(learningCardRef.current);
      focusTarget(learningCardRef.current);
    } else {
      focusTarget(which === 'game' ? equationRef.current : resultsHeadingRef.current);
    }
  };
  const screenShownRef = useRef(screenShown);
  screenShownRef.current = screenShown;
  const menuRoot = useCallback((el: HTMLDivElement | null) => {
    menuTopRef.current = el;
    if (el) screenShownRef.current('menu');
  }, []);
  const gameRoot = useCallback((el: HTMLDivElement | null) => {
    gameTopRef.current = el;
    if (el) screenShownRef.current('game');
  }, []);
  const resultsRoot = useCallback((el: HTMLDivElement | null) => {
    resultsTopRef.current = el;
    if (el) screenShownRef.current('results');
  }, []);

  // Each new equilibrium (Næsta jafnvægi, Næsta strax, the automatic advance)
  // brings the top of the game back when it is above the screen, and focuses
  // the equation. At any width, as the game always did.
  const itemTopRef = useItemTop<HTMLDivElement>(hintResetKey, { anyWidth: true });
  const setGameTop = useCallback(
    (el: HTMLDivElement | null) => {
      gameRoot(el);
      itemTopRef.current = el;
    },
    [gameRoot, itemTopRef]
  );

  // Off a phone the page moves on a screen swap exactly as it always did:
  // after the old screen has faded out, the menu opens at the very top of the
  // page, and the game or the results come back into view when their top is
  // above the screen. (On a phone `screenShown` above has done it already.)
  const screenSeenRef = useRef(screen);
  useEffect(() => {
    if (screenSeenRef.current === screen) return;
    screenSeenRef.current = screen;
    const id = window.setTimeout(() => {
      if (isPhone()) return;
      const instant = settings.reducedMotion;
      if (screen === 'menu') {
        const top = menuTopRef.current?.getBoundingClientRect().top ?? 0;
        if (top < 0)
          revealTop(pageTopRef.current, { anyWidth: true, always: true, gap: 0, instant });
      } else {
        revealTop(screen === 'game' ? gameTopRef.current : resultsTopRef.current, {
          anyWidth: true,
          instant,
        });
      }
    }, SCREEN_FADE_MS + 20);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only a new screen moves the page
  }, [screen]);

  // Inside one equilibrium (Lærdómshamur): choosing a stress replaces the
  // stress list with the question, and «Prófa annað álag» brings the list
  // back. On a phone the card's top comes back into view when it has gone
  // above the screen, so the reaction and its ΔH are read with the question;
  // at every width focus moves to the new heading, since the button pressed
  // has unmounted.
  const cardRef = useRef<HTMLDivElement | null>(null);
  const stressHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const questionRef = useRef<HTMLHeadingElement | null>(null);
  const pendingStepRef = useRef<'question' | 'stress' | null>(null);
  useEffect(() => {
    const step = pendingStepRef.current;
    if (!step) return;
    pendingStepRef.current = null;
    revealTop(cardRef.current);
    focusTarget(step === 'question' ? questionRef.current : stressHeadingRef.current);
  }, [appliedStress]);

  // After an answer: once the prediction buttons have faded out, show the
  // stress through Næsta if it fits, else the verdict at the top of the screen
  // and the student reads down (the explanation is long, and read in full).
  // Focus goes to the explanation, not to Næsta, so a second Enter or tap
  // lands on nothing (design P3).
  const stressBoxRef = useRef<HTMLDivElement | null>(null);
  const feedbackRef = useRef<HTMLDivElement | null>(null);
  const verdictRef = useRef<HTMLDivElement | null>(null);
  const verdictId = useId();
  const nextRef = useRef<HTMLButtonElement | null>(null);
  useRevealAfterCommit(
    showExplanation && isCorrect !== null,
    () => ({
      bottom: nextRef.current,
      tops: [stressBoxRef.current, verdictRef.current],
      focus: feedbackRef.current,
    }),
    { afterExit: PREDICT_EXIT_MS + 20 }
  );
  // A double tap on a prediction must not land on a button of the feedback.
  const armed = useArmedAfter(400, `${hintResetKey}:${showExplanation}`);

  // Timer for challenge mode
  useEffect(() => {
    if (
      screen === 'game' &&
      gameMode === 'challenge' &&
      timeRemaining !== null &&
      timeRemaining > 0 &&
      !showExplanation
    ) {
      const timer = setTimeout(() => {
        setTimeRemaining((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && gameMode === 'challenge' && !timeoutHandledRef.current) {
      // Time's up - mark as incorrect and move on
      timeoutHandledRef.current = true;
      setIsCorrect(false);
      setShowExplanation(true);
      setStats((prev) => ({
        ...prev,
        questionsAnswered: prev.questionsAnswered + 1,
        streak: 0,
      }));

      scheduleAdvance(ADVANCE_AFTER_TIMEOUT_MS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only trigger on screen/mode/timer/explanation state changes
  }, [screen, gameMode, timeRemaining, showExplanation]);

  // Start game flow
  const startGame = (mode: GameMode) => {
    cancelAdvance();
    setGameMode(mode);
    setScreen('game');
    setStats({
      score: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      streak: 0,
      bestStreak: 0,
      hintsUsed: 0,
      totalTime: 0,
      correctByDifficulty: {
        beginner: 0,
        intermediate: 0,
        advanced: 0,
      },
    });
    setQuestionNumber(1);
    loadNewQuestion(mode);
  };

  const loadNewQuestion = (mode: GameMode) => {
    const eq = getRandomEquilibrium();
    setCurrentEquilibrium(eq);

    // Reset timeout handler ref for new question
    timeoutHandledRef.current = false;

    // In challenge mode, randomly select a stress
    if (mode === 'challenge') {
      const randomStress =
        eq.possibleStresses[Math.floor(Math.random() * eq.possibleStresses.length)];
      setAppliedStress(randomStress);
      const shift = calculateShift(eq, randomStress);
      setCorrectShift(shift);
      setTimeRemaining(CHALLENGE_SECONDS);
    } else {
      // In learning mode, let user select stress
      setAppliedStress(null);
      setCorrectShift(null);
      setTimeRemaining(null);
    }

    setUserPrediction(null);
    setShowExplanation(false);
    setHintsUsedTier(0);
    setHintResetKey((prev) => prev + 1);
    setIsCorrect(null);
  };

  // Generate tiered hints based on current equilibrium and stress
  const generateHints = (): TieredHints => {
    if (!currentEquilibrium || !appliedStress) {
      return {
        topic: 'Le Chatelier meginreglan fjallar um hvernig jafnvægi bregst við álagi.',
        strategy: 'Hugsaðu um hvernig kerfið reynir að minnka áhrif álagsins.',
        method: 'Athugaðu hvort álagið eykur eða minnkar magn á hvorri hlið.',
        solution: 'Veldu álag til að sjá vísbendingu.',
      };
    }

    const eq = currentEquilibrium;
    const stress = appliedStress;
    const isExothermic = eq.thermodynamics.type === 'exothermic';
    const moreGasOnRight = (eq.gasMoles?.products || 0) > (eq.gasMoles?.reactants || 0);
    const moreGasOnLeft = (eq.gasMoles?.reactants || 0) > (eq.gasMoles?.products || 0);

    // Topic hint - general concept area
    let topic: string;
    if (stress.type.includes('temp')) {
      topic = 'Þetta snýst um áhrif hitastigsbreytinga á jafnvægi og útvermin eða innvermin hvörf.';
    } else if (stress.type.includes('pressure')) {
      topic = 'Þetta snýst um áhrif þrýstingsbreytinga á gasjafnvægi og fjölda móla.';
    } else if (stress.type.includes('catalyst')) {
      topic = 'Þetta snýst um hlutverk hvata í efnahvörfum.';
    } else {
      topic = 'Þetta snýst um áhrif styrkbreytinga á jafnvægi.';
    }

    // Strategy hint - approach to solve
    let strategy = 'Hugsaðu um hvernig kerfið reynir að minnka áhrif álagsins.';
    if (stress.type === 'increase-temp') {
      strategy = isExothermic
        ? 'Hvarf sem losar varma (útvermið) mun hliðrast í áttina sem „eyðir" viðbætta varmanum.'
        : 'Hvarf sem bindur varma (innvermið) mun hliðrast í áttina sem „nýtir" viðbætta varmann.';
    } else if (stress.type === 'decrease-temp') {
      // Cooling adds no heat, so the heating sentence above does not apply.
      strategy = isExothermic
        ? 'Hvarf sem losar varma (útvermið) mun hliðrast í áttina sem „myndar" varma í stað þess sem var tekinn burt.'
        : 'Hvarf sem bindur varma (innvermið) mun hliðrast í áttina sem „myndar" varma í stað þess sem var tekinn burt.';
    } else if (stress.type === 'increase-pressure') {
      strategy = 'Hærri þrýstingur mun hliðra jafnvæginu í áttina með FÆRRI mólum af gasi.';
    } else if (stress.type === 'decrease-pressure') {
      strategy = 'Lægri þrýstingur mun hliðra jafnvæginu í áttina með FLEIRI mólum af gasi.';
    } else if (stress.type === 'add-catalyst') {
      strategy = 'Hvatar flýta fyrir bæði fram- og bakhvarfi jafnt mikið.';
    } else if (stress.type.includes('add')) {
      strategy = 'Að bæta við efni veldur hliðrun BURT frá þeirri hlið.';
    } else if (stress.type.includes('remove')) {
      strategy = 'Að fjarlægja efni veldur hliðrun Í ÁTTINA að þeirri hlið.';
    }

    // Method hint - specific technique/formula
    let method = '';
    if (stress.type === 'increase-temp') {
      method = isExothermic
        ? 'Útvermið hvarf: Varmi er „myndefni". Meiri varmi → hliðrun til vinstri.'
        : 'Innvermið hvarf: Varmi er „hvarfefni". Meiri varmi → hliðrun til hægri.';
    } else if (stress.type === 'decrease-temp') {
      method = isExothermic
        ? 'Útvermið hvarf: Minni varmi → hliðrun til hægri til að framleiða varma.'
        : 'Innvermið hvarf: Minni varmi → hliðrun til vinstri.';
    } else if (stress.type === 'increase-pressure') {
      if (moreGasOnRight) {
        method = `Hvarfefni: ${eq.gasMoles?.reactants} mól gas. Myndefni: ${eq.gasMoles?.products} mól gas. Hliðrun til vinstri (færri mól).`;
      } else if (moreGasOnLeft) {
        method = `Hvarfefni: ${eq.gasMoles?.reactants} mól gas. Myndefni: ${eq.gasMoles?.products} mól gas. Hliðrun til hægri (færri mól).`;
      } else {
        method = `Hvarfefni: ${eq.gasMoles?.reactants || 0} mól gas. Myndefni: ${eq.gasMoles?.products || 0} mól gas. Jafnt → engin hliðrun.`;
      }
    } else if (stress.type === 'decrease-pressure') {
      if (moreGasOnRight) {
        method = `Myndefni hafa fleiri mól gas (${eq.gasMoles?.products}). Hliðrun til hægri.`;
      } else if (moreGasOnLeft) {
        method = `Hvarfefni hafa fleiri mól gas (${eq.gasMoles?.reactants}). Hliðrun til vinstri.`;
      } else {
        method = `Jafnt magn gass beggja megin → engin hliðrun.`;
      }
    } else if (stress.type === 'add-catalyst') {
      method = 'Hvati breytir EKKI jafnvæginu - aðeins hraða til að ná því.';
    } else if (stress.type === 'add-reactant') {
      method = `Bætt við hvarfefni (${stress.target}). Kerfið eyðir því → hliðrun til hægri.`;
    } else if (stress.type === 'add-product') {
      method = `Bætt við myndefni (${stress.target}). Kerfið eyðir því → hliðrun til vinstri.`;
    } else if (stress.type === 'remove-reactant') {
      method = `Hvarfefni fjarlægt (${stress.target}). Kerfið bætir upp → hliðrun til vinstri.`;
    } else if (stress.type === 'remove-product') {
      method = `Myndefni fjarlægt (${stress.target}). Kerfið bætir upp → hliðrun til hægri.`;
    }

    // Solution hint - full worked answer
    let solution: string;
    if (correctShift) {
      const directionText =
        correctShift.direction === 'left'
          ? 'til vinstri ←'
          : correctShift.direction === 'right'
            ? 'til hægri →'
            : 'engin hliðrun ⇌';
      solution = `Rétt svar: ${directionText}. ${correctShift.explanationIs || ''}`;
    } else {
      solution = 'Veldu spá til að sjá lausn.';
    }

    return { topic, strategy, method, solution };
  };

  // Learning mode: Apply stress
  const handleApplyStress = (stress: Stress) => {
    if (!currentEquilibrium) return;

    pendingStepRef.current = 'question';
    setAppliedStress(stress);
    const shift = calculateShift(currentEquilibrium, stress);
    setCorrectShift(shift);
    setUserPrediction(null);
    setShowExplanation(false);
  };

  // Make prediction
  const handlePrediction = (prediction: ShiftDirection) => {
    if (!correctShift || !currentEquilibrium) return;

    setUserPrediction(prediction);
    const correct = prediction === correctShift.direction;
    setIsCorrect(correct);
    setShowExplanation(true);

    // No hint penalty — hints are free for learning
    const points = calculatePoints(correct, currentEquilibrium.difficulty);
    // What the feedback shows is what was added. Recomputing it after the
    // answer counted the streak bonus of the streak this answer had just
    // extended, five points more than the score received.
    setLastPoints(points);

    setStats((prev) => ({
      ...prev,
      questionsAnswered: prev.questionsAnswered + 1,
      correctAnswers: correct ? prev.correctAnswers + 1 : prev.correctAnswers,
      score: correct ? prev.score + points : prev.score,
      streak: correct ? prev.streak + 1 : 0,
      bestStreak: correct ? Math.max(prev.bestStreak, prev.streak + 1) : prev.bestStreak,
      correctByDifficulty: {
        ...prev.correctByDifficulty,
        [currentEquilibrium.difficulty]: correct
          ? prev.correctByDifficulty[currentEquilibrium.difficulty] + 1
          : prev.correctByDifficulty[currentEquilibrium.difficulty],
      },
    }));

    // In challenge mode, auto-advance after 6 seconds (was 3 — too fast to read explanation).
    // «Næsta strax →» is rendered alongside so users can advance immediately if they want.
    if (gameMode === 'challenge') {
      scheduleAdvance(ADVANCE_AFTER_ANSWER_MS);
    }
  };

  const calculatePoints = (correct: boolean, difficulty: DifficultyLevel): number => {
    if (!correct) return 0;

    const basePoints = difficulty === 'beginner' ? 10 : difficulty === 'intermediate' ? 20 : 30;
    const streakBonus = Math.min(stats.streak * 5, 25);
    const timeBonus = gameMode === 'challenge' && timeRemaining && timeRemaining > 15 ? 5 : 0;

    return basePoints + streakBonus + timeBonus;
  };

  const handleNextQuestion = () => {
    cancelAdvance();
    if (gameMode === 'challenge') {
      if (questionNumber >= totalQuestions) {
        // Game over - show results
        setScreen('results');
        updateProgress({
          problemsCompleted: progress.problemsCompleted + stats.correctAnswers,
          totalTimeSpent: progress.totalTimeSpent + stats.totalTime,
        });
      } else {
        // Next question
        setQuestionNumber((prev) => prev + 1);
        loadNewQuestion(gameMode);
      }
    } else {
      // Learning mode - load new question
      loadNewQuestion(gameMode);
    }
  };

  useEffect(() => {
    nextQuestionRef.current = handleNextQuestion;
  });

  const goToMenu = () => {
    cancelAdvance();
    setScreen('menu');
  };

  // Handle hint usage from HintSystem
  const handleHintUsed = (tier: 1 | 2 | 3 | 4) => {
    setHintsUsedTier(tier);
    setStats((prev) => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1,
    }));
  };

  // Render functions
  const renderMenu = () => (
    <div ref={menuRoot} className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-8 phone:p-3">
        <p className="text-lg text-warm-600 mb-6 text-center phone:text-base phone:mb-3">
          Lærðu Le Chatelier meginregluna í gegnum gagnvirkar æfingar
        </p>

        {/* Conceptual intro — WHY does Le Chatelier work? */}
        {/* A teaching blurb, read before the modes on purpose (design §5). */}
        <div className="bg-indigo-50 p-4 sm:p-6 rounded-xl mb-8 border border-indigo-200 phone:p-3 phone:mb-4">
          <h2 className="font-bold text-indigo-800 mb-3">Af hverju hliðrast jafnvægi?</h2>
          <p className="text-sm text-indigo-700 mb-3">
            Þegar efnahvörf ná <strong>jafnvægi</strong> er hraði framhvarfsins jafn hraða
            bakhvarfsins. Ef við truflum kerfið (bætum við efni, breytum hitastigi eða þrýstingi) er
            jafnvægið rofið.
          </p>

          <div className="bg-white p-4 rounded-lg mb-3 phone:p-3">
            <h3 className="font-bold text-indigo-800 mb-2 text-sm">Q vs K — lykillinn</h3>
            <div className="text-sm text-indigo-700 space-y-1">
              <p>
                <strong>K</strong> = jafnvægisfastinn (breytist EKKI nema T breytist)
              </p>
              <p>
                <strong>Q</strong> = hvarfstuðullinn (reiknað úr núverandi styrk)
              </p>
              <p className="mt-2">
                • Ef Q &lt; K → framhvarf er hraðara → hliðrun <strong>til hægri →</strong>
              </p>
              <p>
                • Ef Q &gt; K → bakhvarf er hraðara → hliðrun <strong>← til vinstri</strong>
              </p>
              <p>• Ef Q = K → jafnvægi ⇌</p>
            </div>
          </div>

          <p className="text-xs text-indigo-600">
            <strong>Le Chatelier:</strong> Kerfið bregst við álagi þannig að það dragi úr áhrifum
            álagsins — það er afleiðing þess að Q ≠ K eftir truflun.
          </p>
        </div>

        {/* Mode Selection */}
        {/* On a phone each card puts its icon beside its title, and on its
            side the two cards sit side by side. */}
        <div className="grid md:grid-cols-2 gap-6 mb-6 phone:gap-3 phone:mb-4 phone-land:grid-cols-2">
          <button
            ref={learningCardRef}
            onClick={() => startGame('learning')}
            className="game-card mode-card bg-white border-2 border-blue-200 hover:border-blue-400 rounded-lg p-4 sm:p-6 text-left transition-all phone:p-3"
          >
            <div className="text-3xl mb-3 phone:inline phone:text-2xl phone:mr-2 phone:align-middle">
              📚
            </div>
            <h3 className="text-xl font-bold text-warm-800 mb-2 phone:inline phone:align-middle phone:text-lg">
              Lærdómshamur
            </h3>
            <p className="text-warm-600 text-sm mb-3 phone:mt-1 phone:mb-2">
              Taktu þér tíma, notaðu vísbendingar og lærðu á þínum hraða
            </p>
            <ul className="text-sm text-warm-500 space-y-1 phone:space-y-0">
              <li>✓ Engin tímatakmörkun</li>
              <li>✓ Ítarlegar útskýringar</li>
              <li>✓ Vísbendingakerfi</li>
              <li>✓ Veltudæmi</li>
            </ul>
          </button>

          {(() => {
            const CHALLENGE_UNLOCK_THRESHOLD = 5;
            const challengeUnlocked = progress.problemsCompleted >= CHALLENGE_UNLOCK_THRESHOLD;
            const remaining = CHALLENGE_UNLOCK_THRESHOLD - progress.problemsCompleted;
            return (
              <button
                onClick={() => challengeUnlocked && startGame('challenge')}
                disabled={!challengeUnlocked}
                aria-disabled={!challengeUnlocked}
                className={`game-card mode-card bg-white border-2 rounded-lg p-4 sm:p-6 text-left transition-all phone:p-3 ${
                  challengeUnlocked
                    ? 'border-orange-200 hover:border-orange-400 cursor-pointer'
                    : 'border-warm-200 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="text-3xl mb-3 phone:inline phone:text-2xl phone:mr-2 phone:align-middle">
                  {challengeUnlocked ? '🏆' : '🔒'}
                </div>
                <h3 className="text-xl font-bold text-warm-800 mb-2 phone:inline phone:align-middle phone:text-lg">
                  Keppnishamur
                </h3>
                <p className="text-warm-600 text-sm mb-3 phone:mt-1 phone:mb-2">
                  {challengeUnlocked
                    ? 'Prófaðu kunnáttu þína með tímasettum spurningum'
                    : `Opnast þegar þú hefur klárað ${CHALLENGE_UNLOCK_THRESHOLD} verkefni í lærdómshamri (${remaining} eftir).`}
                </p>
                <ul className="text-sm text-warm-500 space-y-1 phone:space-y-0">
                  <li>✓ 20 sekúndur á spurningu</li>
                  <li>✓ 10 spurningar</li>
                  <li>✓ Stigagjöf og raðir</li>
                  <li>✓ Hraðbónus</li>
                </ul>
              </button>
            );
          })()}
        </div>

        {/* Progress Summary */}
        <div className="bg-warm-50 rounded-lg p-4 phone:p-3">
          <h3 className="font-semibold text-warm-700 mb-2 phone:mb-1">Framvinda þín</h3>
          <p className="text-sm text-warm-600">Verkefni kláruð: {progress.problemsCompleted}</p>
        </div>

        {/* Why this matters + curriculum */}
        <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h3 className="font-semibold text-amber-800 mb-2">Af hverju efnajafnvægi?</h3>
          <p className="text-sm text-amber-700">
            Haber-ferlið framleiðir ammóníak til áburðargerðar og nærir milljarða manna. Le
            Chatelier meginreglan hjálpar verkfræðingum að hámarka framleiðslu í iðnaði.
          </p>
        </div>
        <div className="mt-3 text-center text-xs text-warm-500">
          <strong>Námsleiðin:</strong> Gaslögmál → Jafnvægisfastinn → <u>Hliðrun jafnvægis</u> →
          Sýrufastinn → Varmafræði → pH Títrun → Stuðpúðar → Leysnijafnvægi
        </div>
      </div>
    </div>
  );

  const renderGame = () => {
    if (!currentEquilibrium) return null;

    return (
      <div ref={setGameTop} className="max-w-6xl mx-auto scroll-mt-4">
        {/* Header with stats. On a phone it is the top strip of the game card
            below it rather than a card of its own. */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4 phone:mb-0 phone:rounded-b-none phone:shadow-none phone:px-3 phone:pt-3 phone:pb-1">
          <div className="flex justify-between items-center flex-wrap gap-4 phone:gap-2">
            <button
              onClick={goToMenu}
              className="pointer-coarse:min-h-11 phone:py-1 phone:px-3 phone:text-sm bg-warm-500 hover:bg-warm-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warm-700 text-white rounded-lg px-4 py-2 transition-colors"
            >
              ← Til baka
            </button>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              {gameMode === 'challenge' && (
                <>
                  <div className="text-sm text-warm-600 whitespace-nowrap">
                    Spurning {questionNumber} / {totalQuestions}
                  </div>
                  <div
                    className={`timer-display ${timeRemaining && timeRemaining <= 5 ? 'warning' : ''}`}
                  >
                    {timeRemaining}s
                  </div>
                </>
              )}
              {/* Points and streaks belong to Keppnishamur: no scoring during learning. */}
              {gameMode === 'challenge' && (
                <>
                  <div className="score-display">Stig: {stats.score}</div>
                  {stats.streak > 0 && (
                    <div className="streak-indicator">🔥 {stats.streak} röð</div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main game area. On a phone the task (stress, question, answer)
            comes straight after the reaction, and the pictures of it follow:
            CSS order moves only the pictures, which hold nothing focusable.
            On its side, the reaction and its pictures on the left and the
            task on the right. */}
        <div
          ref={cardRef}
          className="bg-white rounded-lg shadow-md p-3 sm:p-6 mb-4 phone:rounded-t-none phone:flex phone:flex-col phone-land:grid phone-land:grid-cols-2 phone-land:grid-rows-[auto_auto_auto_auto_1fr] phone-land:gap-x-4"
        >
          {/* Chemical Equation */}
          <div className="text-center mb-6 phone:mb-3 phone-land:col-start-1 phone-land:row-start-1">
            <div
              ref={equationRef}
              data-item-start
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-warm-800 mb-3 phone:text-xl phone:mb-1"
            >
              {currentEquilibrium.equation}
            </div>
            {/* Name and ΔH share a line on a phone when they fit. */}
            <div className="phone:flex phone:flex-wrap phone:items-center phone:justify-center phone:gap-x-2 phone:gap-y-1">
              <div className="text-lg text-warm-600 mb-2 phone:text-sm phone:mb-0">
                {language === 'is' ? currentEquilibrium.nameIs : currentEquilibrium.name}
              </div>
              {(() => {
                const { deltaH, type } = currentEquilibrium.thermodynamics;
                // A ΔH of zero is neither útvermið nor innvermið, so it gets
                // neither colour nor icon.
                const kind = deltaH === 0 ? 'neutral' : type;
                return (
                  <div
                    className={`thermo-indicator ${kind} phone:gap-1! phone:px-3! phone:py-1! phone:text-sm`}
                  >
                    {kind === 'exothermic' ? '🔥' : kind === 'endothermic' ? '❄️' : null}
                    {heatLabel(deltaH)}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Visual Equilibrium Display */}
          {/* Side by side at every width: the game is about "left" and "right",
              so the reactants must stay on the left and the products on the right.
              Below md each molecule is an inline-block, so a long side (Ostwald's
              four NH₃ and five O₂) wraps between molecules instead of running out
              of its half-width box. So too on a phone on its side at any width,
              where this row has only half the card. */}
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:grid-cols-3 gap-2 md:gap-4 phone-land:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] phone-land:gap-2 items-center mb-6 phone:order-1 phone:mt-4 phone:mb-3 phone-land:col-start-1 phone-land:row-start-2 phone-land:mt-0">
            {/* Reactants */}
            <div
              className={`molecule-container reactants-side ${isCorrect !== null && correctShift?.direction === 'left' ? 'glowing' : ''}`}
            >
              <div className="text-center min-w-0 md:min-w-auto phone-land:min-w-0">
                <div className="text-sm text-warm-600 mb-2 font-semibold">Hvarfefni</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {currentEquilibrium.reactants.map((r, idx) => (
                    <div key={idx} className="molecule">
                      {Array.from({ length: r.coefficient }, (_, i) => (
                        <span key={i} className="inline-block md:inline phone-land:inline-block">
                          {r.display}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Arrows */}
            <div className="text-center">
              <div
                className={`equilibrium-arrows ${isCorrect !== null ? (correctShift?.direction === 'right' ? 'shift-right' : correctShift?.direction === 'left' ? 'shift-left' : 'no-shift') : ''}`}
              >
                ⇌
              </div>
            </div>

            {/* Products */}
            <div
              className={`molecule-container products-side ${isCorrect !== null && correctShift?.direction === 'right' ? 'glowing' : ''}`}
            >
              <div className="text-center min-w-0 md:min-w-auto phone-land:min-w-0">
                <div className="text-sm text-warm-600 mb-2 font-semibold">Myndefni</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {currentEquilibrium.products.map((p, idx) => (
                    <div key={idx} className="molecule">
                      {Array.from({ length: p.coefficient }, (_, i) => (
                        <span key={i} className="inline-block md:inline phone-land:inline-block">
                          {p.display}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Particle Equilibrium Visualization */}
          <div className="flex justify-center mb-6 phone:order-1 phone:mb-3 phone-land:col-start-1 phone-land:row-start-3">
            <ParticleEquilibrium
              reactantCount={20}
              productCount={20}
              shiftDirection={showExplanation ? correctShift?.direction : null}
              isExothermic={
                currentEquilibrium.thermodynamics.deltaH === 0
                  ? null
                  : currentEquilibrium.thermodynamics.type === 'exothermic'
              }
              running={screen === 'game'}
            />
          </div>

          {/* Context/Description */}
          <div className="bg-warm-50 rounded-lg px-2 py-4 sm:p-4 mb-6 phone:order-1 phone:py-2 phone:mb-0 phone-land:col-start-1 phone-land:row-start-4">
            <p className="text-sm text-warm-700 text-center">
              {language === 'is'
                ? currentEquilibrium.descriptionIs
                : currentEquilibrium.description}
            </p>
          </div>

          {/* The task: a plain block, so desktop margins are as they were. */}
          <div className="phone-land:col-start-2 phone-land:row-start-1 phone-land:row-span-5">
            {/* Learning Mode: Stress Selection */}
            {gameMode === 'learning' && !appliedStress && (
              <div>
                <h3
                  ref={stressHeadingRef}
                  className="text-lg font-semibold text-warm-800 mb-3 phone:text-base phone:mb-2"
                >
                  Veldu álag sem þú vilt beita:
                </h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 phone:gap-2">
                  {currentEquilibrium.possibleStresses.map((stress, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleApplyStress(stress)}
                      className="stress-btn"
                    >
                      {getStressDescriptionIs(stress)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Challenge Mode or Stress Applied: Show applied stress */}
            {appliedStress && correctShift && (
              <div>
                <div
                  role="status"
                  aria-live="polite"
                  ref={stressBoxRef}
                  className={`bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-4 phone:px-3 phone:py-2 phone:mb-3 ${appliedStress ? 'selected' : ''}`}
                >
                  <div className="font-semibold text-warm-800 mb-1 phone:mb-0 phone:text-sm">
                    Álag sem beitt er:
                  </div>
                  <div className="text-lg text-warm-700 phone:text-base">
                    {getStressDescriptionIs(appliedStress)}
                  </div>
                </div>

                {/* Prediction Buttons / Explanation */}
                <Presence show={!showExplanation} exitDuration={250}>
                  <h3
                    ref={questionRef}
                    className="text-lg font-semibold text-warm-800 mb-3 phone:text-base phone:mb-2"
                  >
                    Hvert mun jafnvægið hliðrast?
                  </h3>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 phone:mb-3 phone:gap-2">
                    <button
                      onClick={() => handlePrediction('left')}
                      className="predict-btn left"
                      disabled={userPrediction !== null}
                    >
                      ← Til vinstri
                    </button>
                    <button
                      onClick={() => handlePrediction('none')}
                      className="predict-btn none"
                      disabled={userPrediction !== null}
                    >
                      ⇌ Engin hliðrun
                    </button>
                    <button
                      onClick={() => handlePrediction('right')}
                      className="predict-btn right"
                      disabled={userPrediction !== null}
                    >
                      Til hægri →
                    </button>
                  </div>

                  {/* Tiered Hint System (Learning Mode Only) */}
                  {gameMode === 'learning' && (
                    <div className="mt-4 phone:mt-3">
                      <HintSystem
                        hints={generateHints()}
                        basePoints={calculatePoints(true, currentEquilibrium.difficulty)}
                        onHintUsed={handleHintUsed}
                        showPointCost={false}
                        disabled={showExplanation}
                        resetKey={hintResetKey}
                      />
                    </div>
                  )}
                </Presence>

                {/* Explanation */}
                <Presence show={showExplanation && isCorrect !== null} exitDuration={250}>
                  <div
                    ref={feedbackRef}
                    role="group"
                    aria-labelledby={verdictId}
                    className={`explanation-box ${isCorrect ? 'correct' : 'incorrect'} slide-in-right`}
                  >
                    <div
                      ref={verdictRef}
                      id={verdictId}
                      className="text-2xl font-bold mb-3 phone:text-xl phone:mb-2"
                    >
                      {isCorrect ? '✅ Rétt!' : '❌ Rangt'}
                    </div>

                    <div className="mb-4 phone:mb-3">
                      <div className="font-semibold mb-2 phone:mb-1">Rétt svar:</div>
                      <div className="text-lg phone:text-base">
                        Hliðrun:{' '}
                        <strong>
                          {correctShift.direction === 'left'
                            ? 'Til vinstri ←'
                            : correctShift.direction === 'right'
                              ? 'Til hægri →'
                              : 'Engin hliðrun ⇌'}
                        </strong>
                      </div>
                    </div>

                    <div className="mb-4 phone:mb-3">
                      <div className="font-semibold mb-2 phone:mb-1">Útskýring:</div>
                      <p className="text-warm-700">
                        {language === 'is' ? correctShift.explanationIs : correctShift.explanation}
                      </p>
                    </div>

                    {/* Q vs K Comparison - shows in learning mode or for wrong answers */}
                    {(gameMode === 'learning' || !isCorrect) && appliedStress && (
                      <div className="mb-4 phone:mb-3">
                        <QKComparison
                          shiftDirection={correctShift.direction}
                          stress={appliedStress}
                          isExothermic={currentEquilibrium.thermodynamics.type === 'exothermic'}
                          gasMoles={currentEquilibrium.gasMoles}
                          animate={true}
                        />
                      </div>
                    )}

                    {/* The same comparison in real numbers, where the system
                      carries a sourced constant. Twenty of the thirty do; the
                      rest show the reasoning above and no figures, rather than
                      figures nobody can source. */}
                    {(gameMode === 'learning' || !isCorrect) &&
                      appliedStress &&
                      (() => {
                        const constant = CONSTANTS[currentEquilibrium.id];
                        const start = STARTING_MIXTURES[currentEquilibrium.id];
                        if (!constant || !start) return null;
                        const outcome = applyStress(
                          currentEquilibrium,
                          constant,
                          start,
                          appliedStress
                        );
                        if (!outcome) return null;
                        return (
                          <div className="mb-4 phone:mb-3">
                            <NumbersPanel
                              outcome={outcome}
                              constant={constant}
                              order={[
                                ...currentEquilibrium.reactants.map((m) => m.formula),
                                ...currentEquilibrium.products.map((m) => m.formula),
                              ]}
                            />
                          </div>
                        );
                      })()}

                    {gameMode === 'learning' && (
                      <div className="mb-4 phone:mb-3">
                        <div className="font-semibold mb-2 phone:mb-1">Rökstuðningur:</div>
                        <ul className="list-disc list-inside space-y-1 text-sm text-warm-700">
                          {(language === 'is'
                            ? correctShift.reasoningIs
                            : correctShift.reasoning
                          ).map((r, idx) => (
                            <li key={idx}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mb-4 phone:mb-3">
                      <div className="font-semibold mb-2 phone:mb-1">Sameindasjónarhorn:</div>
                      <p className="text-sm text-warm-700 italic">
                        {language === 'is'
                          ? correctShift.molecularViewIs
                          : correctShift.molecularView}
                      </p>
                    </div>

                    {/* Points Earned (Keppnishamur only: no scoring during learning) */}
                    {gameMode === 'challenge' && isCorrect && (
                      <div className="bg-green-100 rounded-lg p-3 mt-4">
                        <div className="font-semibold text-green-800">+{lastPoints} stig!</div>
                      </div>
                    )}

                    {/* Next Button (Learning Mode) */}
                    {gameMode === 'learning' && (
                      // Side by side on a phone too: two short labels.
                      <div className="mt-6 flex flex-col sm:flex-row gap-3 phone:mt-4 phone:flex-row phone:gap-2">
                        <button
                          onClick={armed(() => {
                            pendingStepRef.current = 'stress';
                            setAppliedStress(null);
                            setShowExplanation(false);
                            setIsCorrect(null);
                          })}
                          className="flex-1 phone:px-3 bg-blue-500 hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 text-white rounded-lg px-6 py-3 transition-colors"
                        >
                          Prófa annað álag
                        </button>
                        <button
                          ref={nextRef}
                          onClick={armed(handleNextQuestion)}
                          className="flex-1 phone:px-3 bg-green-500 hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 text-white rounded-lg px-6 py-3 transition-colors"
                        >
                          Næsta jafnvægi →
                        </button>
                      </div>
                    )}

                    {/* Challenge Mode - Auto advance message + manual continue */}
                    {gameMode === 'challenge' && (
                      <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-warm-600">
                        <span className="text-center">
                          Næsta spurning birtist sjálfkrafa ({advanceSeconds} sek)...
                        </span>
                        <button
                          ref={nextRef}
                          onClick={armed(handleNextQuestion)}
                          className="shrink-0 whitespace-nowrap pointer-coarse:min-h-11 bg-orange-500 hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700 text-white rounded-lg px-4 py-2 transition-colors text-sm font-semibold"
                        >
                          Næsta strax →
                        </button>
                      </div>
                    )}
                  </div>
                </Presence>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderResults = () => (
    <div ref={resultsRoot} className="max-w-4xl mx-auto scroll-mt-4">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-8">
        <h2 ref={resultsHeadingRef} className="text-3xl font-bold text-warm-800 mb-6 text-center">
          🏆 Niðurstöður
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
            <div className="text-3xl font-bold text-purple-800 mb-2">{stats.score}</div>
            <div className="text-sm text-purple-600">Heildarstig</div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
            <div className="text-3xl font-bold text-blue-800 mb-2">
              {stats.correctAnswers} / {stats.questionsAnswered}
            </div>
            <div className="text-sm text-blue-600">Rétt svör</div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
            <div className="text-3xl font-bold text-orange-800 mb-2">{stats.bestStreak}</div>
            <div className="text-sm text-orange-600">Besta röð</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
            <div className="text-3xl font-bold text-green-800 mb-2">
              {Math.round((stats.correctAnswers / stats.questionsAnswered) * 100)}%
            </div>
            <div className="text-sm text-green-600">Nákvæmni</div>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="bg-warm-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-warm-800 mb-4">Niðurstöður eftir erfiðleikastigi:</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-warm-700">Byrjandi:</span>
              <span className="font-semibold text-warm-800">
                {stats.correctByDifficulty.beginner}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-warm-700">Miðlungs:</span>
              <span className="font-semibold text-warm-800">
                {stats.correctByDifficulty.intermediate}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-warm-700">Erfitt:</span>
              <span className="font-semibold text-warm-800">
                {stats.correctByDifficulty.advanced}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={() => startGame(gameMode)}
            className="flex-1 bg-primary-orange hover:bg-dark-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700 text-white rounded-lg px-6 py-3 transition-colors"
          >
            🔄 Spila aftur
          </button>
          <button
            onClick={goToMenu}
            className="flex-1 bg-warm-500 hover:bg-warm-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warm-700 text-white rounded-lg px-6 py-3 transition-colors"
          >
            📋 Aðalvalmynd
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div ref={pageTopRef} className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {screen === 'menu' && (
        <Header
          variant="game"
          backHref="/efnafraedi/3-ar/"
          gameTitle="Jafnvægisstjóri"
          authSlot={
            <LanguageSwitcher
              language={language}
              onLanguageChange={setLanguage}
              variant="compact"
            />
          }
        />
      )}
      <div
        className={`min-h-screen ${settings.highContrast ? 'high-contrast' : ''} ${settings.reducedMotion ? 'reduced-motion' : ''}`}
      >
        {/* Accessibility Skip Link */}
        <a href="#main-content" className="skip-link">
          {t('accessibility.skipToContent', 'Fara beint í efni')}
        </a>

        {/* Main Content */}
        <main id="main-content" className="container mx-auto px-4 py-8 phone:py-3">
          {/* Accessibility Menu: settings, not part of the game, so on a
              phone it starts closed under its own heading (design P9). */}
          <PhoneDisclosure
            summary={t('accessibility.menuTitle', 'Aðgengisval')}
            className="bg-white rounded-lg shadow-xs p-4 mb-6 max-w-4xl mx-auto phone:p-1 phone:mb-3"
            buttonClassName="text-sm text-warm-700 border-transparent"
          >
            <h2 className="text-sm font-semibold text-warm-700 mb-3 phone:sr-only">
              {t('accessibility.menuTitle', 'Aðgengisval')}
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 sm:gap-4">
              {/* On touch the whole label is a 44 px row and the box is 24 px;
                  the pointer-coarse variants leave the desktop panel as it was. */}
              <label className="flex items-center gap-2 pointer-coarse:min-h-11">
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={toggleHighContrast}
                  className="rounded shrink-0 pointer-coarse:h-6 pointer-coarse:w-6"
                />
                <span className="text-sm">{t('accessibility.highContrast', 'Há birtuskil')}</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-sm">{t('accessibility.textSize', 'Leturstærð')}:</span>
                <select
                  value={settings.textSize}
                  onChange={(e) => setTextSize(e.target.value as 'small' | 'medium' | 'large')}
                  className="text-sm border rounded px-2 py-1 pointer-coarse:min-h-11"
                >
                  <option value="small">{t('accessibility.textSizeSmall', 'Lítil')}</option>
                  <option value="medium">{t('accessibility.textSizeMedium', 'Miðlungs')}</option>
                  <option value="large">{t('accessibility.textSizeLarge', 'Stór')}</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm">Tungumál:</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'is' | 'en' | 'pl')}
                  className="text-sm border rounded px-2 py-1 pointer-coarse:min-h-11"
                >
                  <option value="is">Íslenska</option>
                  <option value="en">English</option>
                  <option value="pl">Polski</option>
                </select>
              </div>
            </div>
          </PhoneDisclosure>

          {/* Screen Routing */}
          <FadePresence show={screen === 'menu'} exitDuration={SCREEN_FADE_MS}>
            {renderMenu()}
          </FadePresence>
          <FadePresence show={screen === 'game'} exitDuration={SCREEN_FADE_MS}>
            {renderGame()}
          </FadePresence>
          <FadePresence show={screen === 'results'} exitDuration={SCREEN_FADE_MS}>
            {renderResults()}
          </FadePresence>
        </main>

        {/* Footer */}
        <footer className="text-center text-sm text-warm-500 py-4">
          <p>© 2024 Kvennaskólinn - Efnafræðileikir</p>
        </footer>
      </div>
    </div>
  );
}

function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

export default AppWithErrorBoundary;
