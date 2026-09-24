import { useState, useEffect, useLayoutEffect, useRef } from 'react';

import { ErrorBoundary, FadePresence } from '@shared/components';
import { useGameProgress } from '@shared/hooks';
import { parseStudentNumber } from '@shared/utils';

import { FeedbackScreen } from './components/FeedbackScreen';
import { GameScreen } from './components/GameScreen';
import { MenuScreen } from './components/MenuScreen';
import { getRandomQuestionForLevel, type Level } from './data';
import {
  GasLawQuestion,
  GameMode,
  GameStats,
  QuestionFeedback,
  GasLaw,
  GAS_LAW_INFO,
} from './types';
import { checkAnswer, calculateError } from './utils/gas-calculations';

const DEFAULT_STATS: GameStats = {
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
  const [sessionQuestionsAnswered, setSessionQuestionsAnswered] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const [gameStep, setGameStep] = useState<'select-law' | 'solve'>('select-law');
  const [selectedLaw, setSelectedLaw] = useState<GasLaw | null>(null);
  const [lawFeedback, setLawFeedback] = useState<{ correct: boolean; message: string } | null>(
    null
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const {
    progress: stats,
    updateProgress: updateStats,
    resetProgress: resetStats,
  } = useGameProgress<GameStats>('gas-law-challenge-progress', DEFAULT_STATS);

  // Start new question — draws from the pool for the currently selected level.
  // Level 1 is always ideal gas law so the law-selection step is skipped; Levels 2/3 include
  // multiple laws so the "identify the law first" scaffolding stays in practice mode.
  const startNewQuestion = (mode: GameMode, level: Level = selectedLevel) => {
    const question = getRandomQuestionForLevel(level);
    setGameMode(mode);
    setSelectedLevel(level);
    setCurrentQuestion(question);
    setUserAnswer('');
    setShowHint(0);
    setShowSolution(false);
    setFeedback(null);
    setValidationError(null);
    setTimeRemaining(mode === 'challenge' ? 90 : null);
    const needsLawSelection = mode === 'practice' && level !== 1;
    setGameStep(needsLawSelection ? 'select-law' : 'solve');
    setSelectedLaw(null);
    setLawFeedback(null);
    setScreen('game');
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
        points = 100;
        if (error < 1) points = 150;
        if (gameMode === 'challenge' && timeRemaining && timeRemaining > 60) points += 50;
        message = error < 1 ? 'Fullkomið! Mjög nákvæmt svar! ⭐' : 'Rétt! Innan vikmarka ✓';
      } else {
        message =
          error < 5 ? 'Næstum rétt! Reyndu aftur.' : 'Ekki rétt. Athugaðu útreikninga þína.';
      }
    }

    const newQuestionsAnswered = sessionQuestionsAnswered + 1;
    setSessionQuestionsAnswered(newQuestionsAnswered);

    if (newQuestionsAnswered === 15) {
      setSessionCompleted(true);
    }

    updateStats({
      questionsAnswered: stats.questionsAnswered + 1,
      correctAnswers: isCorrect ? stats.correctAnswers + 1 : stats.correctAnswers,
      streak: isCorrect ? stats.streak + 1 : 0,
      bestStreak: isCorrect ? Math.max(stats.bestStreak, stats.streak + 1) : stats.bestStreak,
      score: stats.score + points,
      hintsUsed: stats.hintsUsed + showHint,
    });
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

  // Each screen opens at its top. On a phone "Athuga Svar" and "Næsta spurning" sit far down
  // a long page, and the next screen used to open at that same scroll offset: past the
  // verdict banner, or past the new question's scenario.
  useEffect(() => {
    if (window.scrollY > 0) window.scrollTo({ top: 0 });
  }, [screen, currentQuestion]);

  const getHint = () => {
    if (!currentQuestion || showHint >= currentQuestion.hints.length) return;
    setShowHint(showHint + 1);
    setSessionHintsUsed(sessionHintsUsed + 1);
  };

  // The window listener reads the handlers through a ref, so it always sees this render's
  // state. It used to be a closure refreshed only when the typed answer changed, and it
  // graded with the clock as it stood at the last keystroke (a stale time bonus).
  const keyHandlers = useRef({ checkUserAnswer, getHint, screen, gameStep, showSolution });
  useLayoutEffect(() => {
    keyHandlers.current = { checkUserAnswer, getHint, screen, gameStep, showSolution };
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
        setShowSolution(!current.showSolution);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <>
      <FadePresence show={screen === 'menu'} exitDuration={200}>
        <MenuScreen
          stats={stats}
          selectedLevel={selectedLevel}
          setSelectedLevel={setSelectedLevel}
          resetStats={resetStats}
          onStart={startNewQuestion}
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
            setShowSolution={setShowSolution}
            validationError={validationError}
            lawFeedback={lawFeedback}
            stats={stats}
            isGameScreenActive={screen === 'game'}
            simulatorShowAnswer={feedback?.isCorrect === true}
            onCheckAnswer={checkUserAnswer}
            onGetHint={getHint}
            onCheckLaw={checkSelectedLaw}
            onSkipLaw={skipLawSelection}
            onBackToMenu={() => setScreen('menu')}
          />
        )}
      </FadePresence>
      <FadePresence show={screen === 'feedback'} exitDuration={200}>
        {feedback && currentQuestion && (
          <FeedbackScreen
            feedback={feedback}
            currentQuestion={currentQuestion}
            stats={stats}
            sessionCompleted={sessionCompleted}
            sessionQuestionsAnswered={sessionQuestionsAnswered}
            gameMode={gameMode}
            onNext={startNewQuestion}
            onBackToMenu={() => setScreen('menu')}
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
