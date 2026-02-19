import { useState, useCallback, useEffect } from 'react';
import {
  Achievement,
  PlayerAchievements,
  AchievementEvent,
  AchievementNotification,
  AchievementProgress,
} from '../types/achievement.types';
import {
  ACHIEVEMENTS,
  loadAchievements,
  saveAchievements,
  checkAchievements,
  getAchievementProgress,
  getUnlockedAchievements,
  getLockedAchievements,
  getUnlockedPercentage,
  resetAchievements as resetAchievementsStorage,
} from '../utils/achievements';

interface UseAchievementsOptions {
  /** Current game ID */
  gameId: string;
  /** Callback when achievement is unlocked */
  onAchievementUnlocked?: (notification: AchievementNotification) => void;
}

interface UseAchievementsReturn {
  /** Current player achievements state */
  achievements: PlayerAchievements;
  /** All available achievements */
  allAchievements: Achievement[];
  /** Unlocked achievements */
  unlockedAchievements: Achievement[];
  /** Locked achievements (excluding secret) */
  lockedAchievements: Achievement[];
  /** Current streak count */
  currentStreak: number;
  /** Best streak ever */
  bestStreak: number;
  /** Total points earned */
  totalPoints: number;
  /** Percentage of achievements unlocked */
  unlockedPercentage: number;
  /** Queue of new achievement notifications to display */
  notifications: AchievementNotification[];
  /** Track a correct answer */
  trackCorrectAnswer: (options?: { firstAttempt?: boolean }) => void;
  /** Track an incorrect answer */
  trackIncorrectAnswer: () => void;
  /** Track level completion */
  trackLevelComplete: (level: 1 | 2 | 3, score: number, maxScore: number, options?: { timeTaken?: number; hintsUsed?: number }) => void;
  /** Track game completion */
  trackGameComplete: () => void;
  /** Dismiss a notification */
  dismissNotification: (achievementId: string) => void;
  /** Clear all notifications */
  clearNotifications: () => void;
  /** Get progress for a specific achievement */
  getProgress: (achievement: Achievement) => AchievementProgress;
  /** Reset all achievements (use with caution) */
  resetAll: () => void;
}

/**
 * Hook for managing achievements in a game
 *
 * @example
 * const {
 *   trackCorrectAnswer,
 *   trackLevelComplete,
 *   notifications,
 *   currentStreak,
 * } = useAchievements({ gameId: 'hess-law' });
 *
 * // When player answers correctly
 * trackCorrectAnswer({ firstAttempt: true });
 *
 * // When level is completed
 * trackLevelComplete(1, score, maxScore, { timeTaken: 45, hintsUsed: 0 });
 */
export function useAchievements({
  gameId,
  onAchievementUnlocked,
}: UseAchievementsOptions): UseAchievementsReturn {
  const [achievements, setAchievements] = useState<PlayerAchievements>(loadAchievements);
  const [notifications, setNotifications] = useState<AchievementNotification[]>([]);

  // Update daily play on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (!achievements.daysPlayed.includes(today)) {
      const updated = {
        ...achievements,
        daysPlayed: [...achievements.daysPlayed, today],
      };
      setAchievements(updated);
      saveAchievements(updated);

      // Check for daily play achievements
      const newNotifications = checkAchievements(updated, {
        type: 'game_start',
        gameId,
      });
      if (newNotifications.length > 0) {
        setNotifications((prev) => [...prev, ...newNotifications]);
        newNotifications.forEach((n) => onAchievementUnlocked?.(n));
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const processEvent = useCallback(
    (event: AchievementEvent) => {
      const current = loadAchievements(); // Get fresh state
      const newNotifications = checkAchievements(current, event);

      if (newNotifications.length > 0) {
        setNotifications((prev) => [...prev, ...newNotifications]);
        newNotifications.forEach((n) => onAchievementUnlocked?.(n));
      }

      // Reload state after check
      setAchievements(loadAchievements());
    },
    [onAchievementUnlocked]
  );

  const trackCorrectAnswer = useCallback(
    (options?: { firstAttempt?: boolean }) => {
      processEvent({
        type: 'answer_correct',
        gameId,
        firstAttempt: options?.firstAttempt,
      });
    },
    [gameId, processEvent]
  );

  const trackIncorrectAnswer = useCallback(() => {
    processEvent({
      type: 'answer_incorrect',
      gameId,
    });
  }, [gameId, processEvent]);

  const trackLevelComplete = useCallback(
    (
      level: 1 | 2 | 3,
      score: number,
      maxScore: number,
      options?: { timeTaken?: number; hintsUsed?: number }
    ) => {
      processEvent({
        type: 'level_complete',
        gameId,
        level,
        score,
        maxScore,
        timeTaken: options?.timeTaken,
        hintsUsed: options?.hintsUsed ?? 0,
      });
    },
    [gameId, processEvent]
  );

  const trackGameComplete = useCallback(() => {
    processEvent({
      type: 'game_complete',
      gameId,
    });
  }, [gameId, processEvent]);

  const dismissNotification = useCallback((achievementId: string) => {
    setNotifications((prev) => prev.filter((n) => n.achievement.id !== achievementId));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const getProgress = useCallback(
    (achievement: Achievement) => {
      return getAchievementProgress(achievements, achievement);
    },
    [achievements]
  );

  const resetAll = useCallback(() => {
    resetAchievementsStorage();
    setAchievements(loadAchievements());
    setNotifications([]);
  }, []);

  return {
    achievements,
    allAchievements: ACHIEVEMENTS,
    unlockedAchievements: getUnlockedAchievements(achievements),
    lockedAchievements: getLockedAchievements(achievements),
    currentStreak: achievements.currentStreak,
    bestStreak: achievements.bestStreak,
    totalPoints: achievements.totalPoints,
    unlockedPercentage: getUnlockedPercentage(achievements),
    notifications,
    trackCorrectAnswer,
    trackIncorrectAnswer,
    trackLevelComplete,
    trackGameComplete,
    dismissNotification,
    clearNotifications,
    getProgress,
    resetAll,
  };
}
