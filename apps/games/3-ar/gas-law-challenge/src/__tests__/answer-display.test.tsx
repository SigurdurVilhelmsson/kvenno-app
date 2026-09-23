import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { parseStudentNumber } from '@shared/utils';

import { FeedbackScreen } from '../components/FeedbackScreen';
import { GameScreen } from '../components/GameScreen';
import { questions } from '../data';
import type { GameStats, GasLawQuestion, QuestionFeedback } from '../types';
import { checkAnswer } from '../utils/gas-calculations';

/**
 * A number the game prints as the answer must be one the game accepts as the answer.
 *
 * **Why this exists.** The practice "Sýna lausn" panel and the feedback screen's
 * "Rétt svar" printed the answer rounded to two decimals. Question 9's answer is
 * 0,083 mol with a tolerance of 0,002, so both showed `0,08 mol` — and a student who
 * typed what the game had just shown them was told "Næstum rétt". The same rounding
 * printed a wrong answer of 0,0805 as `0,08`, beside a "Rétt svar" of `0,08` and a
 * "Mismunur" of `0,00`.
 */

const STATS: GameStats = {
  score: 0,
  questionsAnswered: 0,
  correctAnswers: 0,
  streak: 0,
  bestStreak: 0,
  hintsUsed: 0,
};

const noop = () => {};

function renderSolutionPanel(question: GasLawQuestion) {
  return render(
    <GameScreen
      currentQuestion={question}
      selectedLevel={1}
      gameMode="practice"
      gameStep="solve"
      selectedLaw={null}
      setSelectedLaw={noop}
      timeRemaining={null}
      userAnswer=""
      setUserAnswer={noop}
      showHint={0}
      showSolution={true}
      setShowSolution={noop}
      validationError={null}
      lawFeedback={null}
      stats={STATS}
      isGameScreenActive={false}
      simulatorShowAnswer={false}
      onCheckAnswer={noop}
      onGetHint={noop}
      onCheckLaw={noop}
      onSkipLaw={noop}
      onBackToMenu={noop}
    />
  );
}

function feedbackFor(question: GasLawQuestion, userAnswer: number | null): QuestionFeedback {
  return {
    isCorrect: userAnswer !== null && checkAnswer(userAnswer, question.answer, question.tolerance),
    message: '',
    points: 0,
    userAnswer,
    correctAnswer: question.answer,
    difference: userAnswer === null ? null : Math.abs(userAnswer - question.answer),
    explanation: '',
  };
}

function renderFeedback(question: GasLawQuestion, userAnswer: number | null) {
  return render(
    <FeedbackScreen
      feedback={feedbackFor(question, userAnswer)}
      currentQuestion={question}
      stats={STATS}
      sessionCompleted={false}
      sessionQuestionsAnswered={1}
      gameMode="practice"
      onNext={noop}
      onBackToMenu={noop}
    />
  );
}

/** The first number in a piece of rendered text, read the way the answer field reads it. */
function numberIn(text: string): number {
  const match = text.match(/\d+(?:,\d+)?/);
  expect(match, `no number in "${text}"`).not.toBeNull();
  return parseStudentNumber(match![0]);
}

beforeEach(() => {
  // jsdom has no canvas; the particle simulation copes with a missing context.
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('the answer the game shows is an answer it accepts', () => {
  it.each(questions.map((q) => [q.id, q] as const))(
    'question %i: the solution panel',
    (_id, question) => {
      renderSolutionPanel(question);
      const shown = numberIn(screen.getByText(/^Svar:/).textContent ?? '');
      expect(checkAnswer(shown, question.answer, question.tolerance)).toBe(true);
    }
  );

  it.each(questions.map((q) => [q.id, q] as const))(
    'question %i: the feedback screen',
    (_id, question) => {
      renderFeedback(question, question.answer * 2);
      const shown = numberIn(screen.getByText('Rétt svar:').nextElementSibling?.textContent ?? '');
      expect(checkAnswer(shown, question.answer, question.tolerance)).toBe(true);
    }
  );

  it('prints the answer as the worked solution writes it', () => {
    const q14 = questions.find((q) => q.id === 14)!; // stored as 4.0, written 4,0 mL
    renderFeedback(q14, 5);
    expect(screen.getByText('Rétt svar:').nextElementSibling?.textContent).toBe('4,0 mL');
  });
});

describe('the feedback screen does not round the student’s answer into agreement', () => {
  it('shows a near miss and its difference exactly', () => {
    const q9 = questions.find((q) => q.id === 9)!; // 0,083 mol, tolerance 0,002
    renderFeedback(q9, 0.0805);

    expect(screen.getByText('Þitt svar:').nextElementSibling?.textContent).toBe('0,0805 mol');
    expect(screen.getByText('Rétt svar:').nextElementSibling?.textContent).toBe('0,083 mol');
    expect(screen.getByText('Mismunur:').nextElementSibling?.textContent).toBe(
      '0,0025 mol frá réttu svari'
    );
  });

  it('shows no answer and no difference when the time ran out', () => {
    const q1 = questions.find((q) => q.id === 1)!;
    renderFeedback(q1, null);

    expect(screen.getByText('Þitt svar:').nextElementSibling?.textContent).toBe('—');
    expect(screen.queryByText('Mismunur:')).toBeNull();
  });
});
