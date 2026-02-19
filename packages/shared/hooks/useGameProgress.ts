import { useState, useEffect, useCallback } from 'react';

/**
 * Generic hook for managing game progress with localStorage persistence.
 * Replaces the repeated loadProgress/saveProgress/getDefaultProgress pattern
 * found in game App.tsx files.
 *
 * @param storageKey - localStorage key for persisting progress
 * @param defaultProgress - default/initial progress state
 * @returns progress state with update and reset helpers
 */
export function useGameProgress<T>(
  storageKey: string,
  defaultProgress: T
): {
  progress: T;
  updateProgress: (updates: Partial<T>) => void;
  resetProgress: () => void;
} {
  const [progress, setProgress] = useState<T>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved) as T;
      } catch {
        return defaultProgress;
      }
    }
    return defaultProgress;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [storageKey, progress]);

  const updateProgress = useCallback((updates: Partial<T>) => {
    setProgress(prev => ({ ...prev, ...updates }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(defaultProgress);
    localStorage.setItem(storageKey, JSON.stringify(defaultProgress));
  }, [storageKey, defaultProgress]);

  return { progress, updateProgress, resetProgress };
}
