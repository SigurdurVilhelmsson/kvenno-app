import { useState, useEffect, useCallback } from 'react';

/**
 * Generic hook for managing game progress with localStorage persistence.
 * Replaces the repeated loadProgress/saveProgress/getDefaultProgress pattern
 * found in game App.tsx files.
 *
 * @param storageKey - localStorage key for persisting progress
 * @param defaultProgress - default/initial progress state
 * @param legacyKeys - keys a renamed game used to save under. When `storageKey`
 *   holds nothing, the first legacy key that parses is loaded; the save effect
 *   then writes it under `storageKey` and the legacy keys are removed, so a
 *   student's progress survives the rename.
 * @returns progress state with update and reset helpers
 */
export function useGameProgress<T>(
  storageKey: string,
  defaultProgress: T,
  legacyKeys: readonly string[] = []
): {
  progress: T;
  updateProgress: (updates: Partial<T>) => void;
  resetProgress: () => void;
} {
  const [progress, setProgress] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved) as T;
      }
    } catch {
      // localStorage may be unavailable — ignore silently
    }
    for (const key of legacyKeys) {
      try {
        const legacy = localStorage.getItem(key);
        if (legacy) return JSON.parse(legacy) as T;
      } catch {
        // an unreadable legacy key is skipped, like an unreadable current one
      }
    }
    return defaultProgress;
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(progress));
      // Only once the progress is safely under the new key.
      for (const key of legacyKeys) localStorage.removeItem(key);
    } catch {
      // localStorage may be unavailable — ignore silently
    }
  }, [storageKey, progress, legacyKeys]);

  const updateProgress = useCallback((updates: Partial<T>) => {
    setProgress((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(defaultProgress);
    try {
      localStorage.setItem(storageKey, JSON.stringify(defaultProgress));
    } catch {
      // localStorage may be unavailable — ignore silently
    }
  }, [storageKey, defaultProgress]);

  return { progress, updateProgress, resetProgress };
}
