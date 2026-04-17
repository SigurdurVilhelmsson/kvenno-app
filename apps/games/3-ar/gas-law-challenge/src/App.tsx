import { useState, useEffect } from 'react';

import { ErrorBoundary, FadePresence } from '@shared/components';
import { useGameI18n, useGameProgress } from '@shared/hooks';

import { FeedbackScreen } from './components/FeedbackScreen';
import { GameScreen } from './components/GameScreen';
import { MenuScreen } from './components/MenuScreen';
import { getRandomQuestionForLevel, type Level } from './data';
import { gameTranslations } from './i18n';
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
  const { language, setLanguage } = useGameI18n({ gameTranslations });
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

  useEffect(() => {
    if (
      screen === 'game' &&
      gameMode === 'challenge' &&
      timeRemaining !== null &&
      timeRemaining > 0
    ) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      checkUserAnswer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only trigger on screen/mode/timer state changes
  }, [screen, gameMode, timeRemaining]);

  const checkUserAnswer = () => {
    if (!currentQuestion) return;

    const userNum = parseFloat(userAnswer);
    if (isNaN(userNum)) {
      setValidationError('Vinsamlegast sláðu inn gilt númer');
      return;
    }
    if (userNum < 0) {
      setValidationError('Gildi má ekki vera neikvætt');
      return;
    }
    if (userNum === 0) {
      setValidationError('Gildi má ekki vera núll');
      return;
    }
    if (userNum > 1_000_000) {
      setValidationError('Gildi er of hátt — athugaðu einingarnar');
      return;
    }
    setValidationError(null);

    const isCorrect = checkAnswer(userNum, currentQuestion.answer, currentQuestion.tolerance);
    const error = calculateError(userNum, currentQuestion.answer);

    let points = 0;
    let message: string;

    if (isCorrect) {
      points = 100;
      if (error < 1) points = 150;
      if (gameMode === 'challenge' && timeRemaining && timeRemaining > 60) points += 50;
      message = error < 1 ? 'Fullkomið! Mjög nákvæmt svar! ⭐' : 'Rétt! Innan vikmarka ✓';
    } else {
      message = error < 5 ? 'Næstum rétt! Reyndu aftur.' : 'Ekki rétt. Athugaðu útreikninga þína.';
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
      difference: Math.abs(userNum - currentQuestion.answer),
      explanation: currentQuestion.solution.steps.join(' → '),
    });
    setScreen('feedback');
  };

  const getHint = () => {
    if (!currentQuestion || showHint >= currentQuestion.hints.length) return;
    setShowHint(showHint + 1);
    setSessionHintsUsed(sessionHintsUsed + 1);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (screen !== 'game') return;

      if (e.key === 'Enter') {
        e.preventDefault();
        checkUserAnswer();
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        getHint();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setShowSolution(!showSolution);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: keyboard handler uses current closure values
  }, [screen, userAnswer, showSolution]);

  return (
    <>
      <FadePresence show={screen === 'menu'} exitDuration={200}>
        <MenuScreen
          stats={stats}
          selectedLevel={selectedLevel}
          setSelectedLevel={setSelectedLevel}
          language={language}
          setLanguage={setLanguage}
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
