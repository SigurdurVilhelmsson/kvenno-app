import { Difficulty, GameMode } from '../types';

export function getPointValue(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      return 10;
    case 'medium':
      return 15;
    case 'hard':
      return 20;
  }
}

export function getHintPenalty(hintLevel: number, gameMode: GameMode): number {
  if (gameMode === 'practice') return 0;

  switch (hintLevel) {
    case 1:
      return 2;
    case 2:
      return 4;
    case 3:
      return 7;
    default:
      return 0;
  }
}

export function getSpeedBonus(timeRemaining: number, timerMode: boolean): number {
  if (!timerMode) return 0;

  if (timeRemaining > 70) return 10;
  if (timeRemaining > 60) return 5;
  return 0;
}

export function getStreakBonus(streak: number): number {
  if (streak === 3) return 5;
  if (streak === 5) return 10;
  return 0;
}

export function getMaxScore(difficulty: Difficulty): number {
  const pointValue = getPointValue(difficulty);
  const problemCount = getProblemCount(difficulty);
  return pointValue * problemCount;
}

export function getProblemCount(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      return 8;
    case 'medium':
      return 10;
    case 'hard':
      return 12;
  }
}

export function getAchievement(
  streak: number,
  problemType: string
): string | null {
  if (streak === 3 && problemType === 'mixing') return 'Fullkomin blöndun! 🧪';
  if (streak === 3 && problemType === 'dilution') return 'Útþynningar sérfræðingur! 💧';
  if (streak === 5) return '5 réttar! 🔥🔥';
  if (streak === 3) return '3 í röð! 🔥';
  return null;
}
