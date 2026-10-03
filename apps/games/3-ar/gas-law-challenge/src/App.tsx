import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';

import { ErrorBoundary, FadePresence } from '@shared/components';
import { useGameProgress } from '@shared/hooks';
import { focusTarget, parseStudentNumber, revealSpan, revealTop } from '@shared/utils';

import { FeedbackScreen } from './components/FeedbackScreen';
import { GameScreen } from './components/GameScreen';
import { MenuScreen } from './components/MenuScreen';
import { getPracticeDeck, getRandomQuestionForLevel, type Level } from './data';
import {
  GasLawProgress,
  GasLawQuestion,
  GameMode,
  GameStats,
  QuestionFeedback,
  GasLaw,
  GAS_LAW_INFO,
  RoundResult,
} from './types';
import { checkAnswer, calculateError } from './utils/gas-calculations';

const DEFAULT_PROGRESS: GasLawProgress = {};

/** A Keppnishamur run before its first answer: every run starts from 0. */
const NEW_RUN: GameStats = {
  score: 0,
  questionsAnswered: 0,
  correctAnswers: 0,
  streak: 0,
  bestStreak: 0,
  hintsUsed: 0,
};

function App() {
  const [screen, setScreen] = useState<'menu' | 'game' | 'feedback'>('menu');
  const [gameMode, setGameMode] = useState<GameMode>('practice');
  const [selectedLevel, setSelectedLevel] = useState<Level>(1);
  const [currentQuestion, setCurrentQuestion] = useState<GasLawQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [feedback, setFeedback] = useState<QuestionFeedback | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [sessionHintsUsed, setSessionHintsUsed] = useState(0);

  // Æfingahamur plays a level as a round: every question once, then `N af M rétt`. Nothing
  // is scored while it runs (mobile-pass decision 1 (b)).
  const [deck, setDeck] = useState<GasLawQuestion[]>([]);
  const [deckPos, setDeckPos] = useState(0);
  const [round, setRound] = useState<RoundResult>({ correct: 0, total: 0 });
  /** The finished round, once its last question is answered. */
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  // Whether the worked solution, which prints the answer, was opened before the answer was
  // checked. A right answer copied from it is not counted; a hint never changes a count.
  const [solutionSeen, setSolutionSeen] = useState(false);

  // Keppnishamur keeps its points and streak, and only for the run being played.
  const [run, setRun] = useState<GameStats>(NEW_RUN);

  const [gameStep, setGameStep] = useState<'select-law' | 'solve'>('select-law');
  const [selectedLaw, setSelectedLaw] = useState<GasLaw | null>(null);
  const [lawFeedback, setLawFeedback] = useState<{ correct: boolean; message: string } | null>(
    null
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const { progress, updateProgress, resetProgress } = useGameProgress<GasLawProgress>(
    'gas-law-challenge-progress',
    DEFAULT_PROGRESS
  );

  // Open a question. Level 1 is always ideal gas law so the law-selection step is skipped;
  // Levels 2/3 include multiple laws so the "identify the law first" scaffolding stays in
  // practice mode.
  const showQuestion = (mode: GameMode, level: Level, question: GasLawQuestion) => {
    setGameMode(mode);
    setCurrentQuestion(question);
    setUserAnswer('');
    setShowHint(0);
    setShowSolution(false);
    setSolutionSeen(false);
    setFeedback(null);
    setValidationError(null);
    setTimeRemaining(mode === 'challenge' ? 90 : null);
    const needsLawSelection = mode === 'practice' && level !== 1;
    setGameStep(needsLawSelection ? 'select-law' : 'solve');
    setSelectedLaw(null);
    setLawFeedback(null);
    setScreen('game');
  };

  /** Start a mode from the menu (or a practice round again), on the selected level. */
  const startRun = (mode: GameMode) => {
    if (mode === 'practice') {
      const newDeck = getPracticeDeck(selectedLevel);
      setDeck(newDeck);
      setDeckPos(0);
      setRound({ correct: 0, total: 0 });
      setRoundResult(null);
      showQuestion(mode, selectedLevel, newDeck[0]);
    } else {
      setRun(NEW_RUN);
      showQuestion(mode, selectedLevel, getRandomQuestionForLevel(selectedLevel));
    }
  };

  /** Næsta spurning: the round's next question, or a new draw in Keppnishamur. */
  const nextQuestion = () => {
    if (gameMode === 'practice') {
      const pos = Math.min(deckPos + 1, deck.length - 1);
      setDeckPos(pos);
      showQuestion(gameMode, selectedLevel, deck[pos]);
    } else {
      showQuestion(gameMode, selectedLevel, getRandomQuestionForLevel(selectedLevel));
    }
  };

  /** Open or close the worked solution; opening it before answering is remembered. */
  const toggleSolution = (show: boolean) => {
    setShowSolution(show);
    if (show && screen === 'game') setSolutionSeen(true);
  };

  const checkSelectedLaw = () => {
    if (!currentQuestion || !selectedLaw) return;

    const isCorrect = selectedLaw === currentQuestion.gasLaw;
    const correctLawInfo = GAS_LAW_INFO[currentQuestion.gasLaw];

    if (isCorrect) {
      setLawFeedback({
        correct: true,
        message: `Rétt! Þetta er ${correctLawInfo.nameIs} (${correctLawInfo.formula})`,
      });
      setTimeout(() => {
        setGameStep('solve');
      }, 1500);
    } else {
      setLawFeedback({
        correct: false,
        message: `Ekki rétt. Þetta verkefni notar ${correctLawInfo.nameIs}: ${correctLawInfo.formula}. ${correctLawInfo.description}.`,
      });
    }
  };

  const skipLawSelection = () => {
    setGameStep('solve');
  };

  // The clock runs only while the question is on screen, and running out ends the question
  // once. It used to act on `timeRemaining === 0` whatever the screen, so leaving the
  // feedback screen re-ran it: the answer was graded again and "Valmynd" bounced back.
  useEffect(() => {
    if (screen !== 'game' || gameMode !== 'challenge' || timeRemaining === null) return;
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    timeUp();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only trigger on screen/mode/timer state changes
  }, [screen, gameMode, timeRemaining]);

  /** Why a parsed answer cannot be graded, or null when it can. */
  const answerProblem = (userNum: number): string | null => {
    if (isNaN(userNum)) return 'Vinsamlegast sláðu inn gilt númer';
    if (userNum < 0) return 'Gildi má ekki vera neikvætt';
    if (userNum === 0) return 'Gildi má ekki vera núll';
    if (userNum > 1_000_000) return 'Gildi er of hátt — athugaðu einingarnar';
    return null;
  };

  /** End the question. `null` means the time ran out before a readable answer was given. */
  const finishQuestion = (userNum: number | null) => {
    if (!currentQuestion) return;

    let isCorrect = false;
    let points = 0;
    let message: string;

    if (userNum === null) {
      message = 'Tíminn rann út!';
    } else {
      isCorrect = checkAnswer(userNum, currentQuestion.answer, currentQuestion.tolerance);
      const error = calculateError(userNum, currentQuestion.answer);
      if (isCorrect) {
        if (gameMode === 'challenge') {
          points = error < 1 ? 150 : 100;
          if (timeRemaining && timeRemaining > 60) points += 50;
        }
        message = error < 1 ? 'Fullkomið! Mjög nákvæmt svar! ⭐' : 'Rétt! Innan vikmarka ✓';
      } else {
        message =
          error < 5 ? 'Næstum rétt! Reyndu aftur.' : 'Ekki rétt. Athugaðu útreikninga þína.';
      }
    }

    if (gameMode === 'challenge') {
      const next: GameStats = {
        questionsAnswered: run.questionsAnswered + 1,
        correctAnswers: isCorrect ? run.correctAnswers + 1 : run.correctAnswers,
        streak: isCorrect ? run.streak + 1 : 0,
        bestStreak: isCorrect ? Math.max(run.bestStreak, run.streak + 1) : run.bestStreak,
        score: run.score + points,
        hintsUsed: run.hintsUsed + showHint,
      };
      setRun(next);
      updateProgress({
        challengeBest: {
          ...progress.challengeBest,
          [selectedLevel]: Math.max(progress.challengeBest?.[selectedLevel] ?? 0, next.score),
        },
        challengeBestStreak: Math.max(progress.challengeBestStreak ?? 0, next.bestStreak),
      });
    } else {
      const counted = isCorrect && !solutionSeen;
      const nextRound = { correct: round.correct + (counted ? 1 : 0), total: round.total + 1 };
      setRound(nextRound);
      if (nextRound.total >= deck.length) {
        setRoundResult(nextRound);
        // The best round is kept, as a count of right answers out of the level's questions.
        const best = progress.practice?.[selectedLevel];
        if (!best || best.total !== nextRound.total || nextRound.correct >= best.correct) {
          updateProgress({ practice: { ...progress.practice, [selectedLevel]: nextRound } });
        }
      }
    }
    setFeedback({
      isCorrect,
      message,
      points,
      userAnswer: userNum,
      correctAnswer: currentQuestion.answer,
      difference: userNum === null ? null : Math.abs(userNum - currentQuestion.answer),
      explanation: currentQuestion.solution.steps.join(' → '),
    });
    setValidationError(null);
    setScreen('feedback');
  };

  const checkUserAnswer = () => {
    if (!currentQuestion) return;

    const userNum = parseStudentNumber(userAnswer);
    const problem = answerProblem(userNum);
    if (problem) {
      setValidationError(problem);
      return;
    }
    finishQuestion(userNum);
  };

  // Time is up: grade what is in the field if it can be read, otherwise record the question
  // as unanswered. Only showing the validation message left the question open at 0 s forever.
  const timeUp = () => {
    const userNum = parseStudentNumber(userAnswer);
    finishQuestion(answerProblem(userNum) ? null : userNum);
  };

  // Each screen opens at its top, at every width, as it always has. On a phone "Athuga Svar"
  // and "Næsta spurning" sit far down a long page, and the next screen used to open at that
  // same scroll offset: past the verdict banner, or past the new question's scenario.
  useLayoutEffect(() => {
    revealTop(document.documentElement, { anyWidth: true, always: true, gap: 0, instant: true });
  }, [screen, currentQuestion]);

  // Focus follows each screen swap, since the button that caused it has gone with the old
  // screen and focus would otherwise fall to <body>: a new question focuses its question (the
  // law step's while the law is still being chosen), the feedback screen its verdict (design
  // P3), and back on the menu the level being played, with the level choice and that mode's
  // start button brought on screen on a phone. Nothing on the initial load.
  //
  // The screens fade (FadePresence), which mounts the new one a render after `screen`
  // changes, so this usually runs as the new screen's root attaches. A screen shown again
  // before its fade-out ended never unmounted, so the swap itself runs it for that one.
  type Screen = typeof screen;
  const lastShown = useRef<Screen>(screen);
  const shownScreen = useRef<Screen>(screen);
  shownScreen.current = screen;
  const roots = useRef<Partial<Record<Screen, HTMLElement>>>({});
  const shownRef = useRef<(which: Screen, root: HTMLElement) => void>(() => {});
  shownRef.current = (which, root) => {
    if (lastShown.current === which) return;
    lastShown.current = which;
    if (which === 'menu') {
      const chooser = root.querySelector('[data-level-chooser]');
      revealSpan(root.querySelector(`[data-mode-start="${gameMode}"]`), [chooser]);
      focusTarget(chooser?.querySelector<HTMLElement>('[aria-pressed="true"]'));
    } else if (which === 'game') {
      focusTarget(root.querySelector<HTMLElement>('[data-item-start]'));
    } else {
      focusTarget(root.querySelector<HTMLElement>('[data-feedback-verdict]'));
    }
  };
  const attach = useCallback((which: Screen, el: HTMLDivElement | null) => {
    if (!el) {
      delete roots.current[which];
      return;
    }
    roots.current[which] = el;
    if (shownScreen.current === which) shownRef.current(which, el);
  }, []);
  const menuRoot = useCallback((el: HTMLDivElement | null) => attach('menu', el), [attach]);
  const gameRoot = useCallback((el: HTMLDivElement | null) => attach('game', el), [attach]);
  const feedbackRoot = useCallback((el: HTMLDivElement | null) => attach('feedback', el), [attach]);
  useLayoutEffect(() => {
    const root = roots.current[screen];
    if (root) shownRef.current(screen, root);
  }, [screen]);

  const getHint = () => {
    if (!currentQuestion || showHint >= currentQuestion.hints.length) return;
    setShowHint(showHint + 1);
    setSessionHintsUsed(sessionHintsUsed + 1);
  };

  // The window listener reads the handlers through a ref, so it always sees this render's
  // state. It used to be a closure refreshed only when the typed answer changed, and it
  // graded with the clock as it stood at the last keystroke (a stale time bonus).
  const keyHandlers = useRef({
    checkUserAnswer,
    getHint,
    toggleSolution,
    screen,
    gameStep,
    showSolution,
  });
  useLayoutEffect(() => {
    keyHandlers.current = {
      checkUserAnswer,
      getHint,
      toggleSolution,
      screen,
      gameStep,
      showSolution,
    };
  });

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const current = keyHandlers.current;
      if (current.screen !== 'game' || e.ctrlKey || e.metaKey || e.altKey) return;

      const target = e.target instanceof Element ? e.target : null;
      // A key typed into the answer field belongs to the field: H and S are letters there,
      // not shortcuts (S used to be swallowed and to open the worked solution), and Enter
      // submits through the field's own handler, so it must not be checked a second time.
      if (target?.closest('input, textarea, select')) return;

      if (e.key === 'Enter') {
        // Enter on a focused button or link is that control's own action.
        if (target?.closest('button, a')) return;
        // While the law is still being chosen the answer field is disabled.
        if (current.gameStep !== 'solve') return;
        e.preventDefault();
        current.checkUserAnswer();
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        current.getHint();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        current.toggleSolution(!current.showSolution);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <>
      <FadePresence show={screen === 'menu'} exitDuration={200}>
        <MenuScreen
          progress={progress}
          selectedLevel={selectedLevel}
          setSelectedLevel={setSelectedLevel}
          resetProgress={resetProgress}
          onStart={startRun}
          rootRef={menuRoot}
        />
      </FadePresence>
      <FadePresence show={screen === 'game'} exitDuration={200}>
        {currentQuestion && (
          <GameScreen
            currentQuestion={currentQuestion}
            selectedLevel={selectedLevel}
            gameMode={gameMode}
            gameStep={gameStep}
            selectedLaw={selectedLaw}
            setSelectedLaw={setSelectedLaw}
            timeRemaining={timeRemaining}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            showHint={showHint}
            showSolution={showSolution}
            setShowSolution={toggleSolution}
            validationError={validationError}
            lawFeedback={lawFeedback}
            stats={run}
            questionPosition={
              gameMode === 'practice' ? { index: deckPos + 1, total: deck.length } : undefined
            }
            isGameScreenActive={screen === 'game'}
            simulatorShowAnswer={feedback?.isCorrect === true}
            onCheckAnswer={checkUserAnswer}
            onGetHint={getHint}
            onCheckLaw={checkSelectedLaw}
            onSkipLaw={skipLawSelection}
            onBackToMenu={() => setScreen('menu')}
            rootRef={gameRoot}
          />
        )}
      </FadePresence>
      <FadePresence show={screen === 'feedback'} exitDuration={200}>
        {feedback && currentQuestion && (
          <FeedbackScreen
            feedback={feedback}
            currentQuestion={currentQuestion}
            stats={run}
            selectedLevel={selectedLevel}
            roundResult={gameMode === 'practice' ? roundResult : null}
            solutionSeen={gameMode === 'practice' && solutionSeen}
            gameMode={gameMode}
            onNext={nextQuestion}
            onRestart={() => startRun('practice')}
            onBackToMenu={() => setScreen('menu')}
            rootRef={feedbackRoot}
          />
        )}
      </FadePresence>
    </>
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
