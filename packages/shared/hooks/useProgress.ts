import { useState, useEffect, useCallback } from 'react';
import { GameProgress } from '@shared/types';
import { saveProgress, loadProgress } from '@shared/utils/storage';

interface UseProgressOptions {
  gameId: string;
  initialProgress?: Partial<GameProgress>;
}

/**
 * Hook for managing game progress with automatic localStorage persistence
 *
 * @example
 * const { progress, updateProgress, resetProgress } = useProgress({ gameId: 'dimensional-analysis' });
 * updateProgress({ problemsCompleted: progress.problemsCompleted + 1 });
 */
export const useProgress = ({ gameId, initialProgress = {} }: UseProgressOptions) => {
  const [progress, setProgress] = useState<GameProgress>(() => {
    const loaded = loadProgress(gameId);
    if (loaded) {
      return loaded;
    }

    return {
      currentLevel: 3,
      problemsCompleted: 0,
      lastPlayedDate: new Date().toISOString(),
      totalTimeSpent: 0,
      levelProgress: {},
      ...initialProgress,
    } as GameProgress;
  });

  // Auto-save progress whenever it changes
  useEffect(() => {
    saveProgress(gameId, progress);
  }, [gameId, progress]);

  // Update last played date on mount
  useEffect(() => {
    setProgress((prev) => ({
      ...prev,
      lastPlayedDate: new Date().toISOString(),
    }));
  }, []);

  const updateProgress = useCallback((updates: Partial<GameProgress>) => {
    setProgress((prev) => ({
      ...prev,
      ...updates,
      lastPlayedDate: new Date().toISOString(),
    }));
  }, []);

  const resetProgress = useCallback(() => {
    const fresh: GameProgress = {
      currentLevel: 3,
      problemsCompleted: 0,
      lastPlayedDate: new Date().toISOString(),
      totalTimeSpent: 0,
      levelProgress: {},
      ...initialProgress,
    } as GameProgress;

    setProgress(fresh);
    saveProgress(gameId, fresh);
  }, [gameId, initialProgress]);

  const incrementProblems = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      problemsCompleted: prev.problemsCompleted + 1,
      lastPlayedDate: new Date().toISOString(),
    }));
  }, []);

  const setLevel = useCallback((level: GameProgress['currentLevel']) => {
    setProgress((prev) => ({
      ...prev,
      currentLevel: level,
      lastPlayedDate: new Date().toISOString(),
    }));
  }, []);

  return {
    progress,
    updateProgress,
    resetProgress,
    incrementProblems,
    setLevel,
  };
};
