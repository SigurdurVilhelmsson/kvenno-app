import { GameProgress } from '@shared/types';

const STORAGE_PREFIX = 'kvenno-chemistry-';

/**
 * Validate that an object has the basic shape of GameProgress
 * This prevents corrupted or tampered localStorage data from crashing the app
 */
const isValidGameProgress = (data: unknown): data is GameProgress => {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  // Check required fields exist and have correct types
  if (typeof obj.currentLevel !== 'number' || obj.currentLevel < 0) {
    return false;
  }
  if (typeof obj.problemsCompleted !== 'number' || obj.problemsCompleted < 0) {
    return false;
  }
  if (typeof obj.lastPlayedDate !== 'string') {
    return false;
  }
  if (typeof obj.totalTimeSpent !== 'number' || obj.totalTimeSpent < 0) {
    return false;
  }

  return true;
};

/**
 * Save game progress to localStorage
 */
export const saveProgress = (gameId: string, progress: GameProgress): void => {
  try {
    const key = `${STORAGE_PREFIX}${gameId}`;
    localStorage.setItem(key, JSON.stringify(progress));
  } catch (error) {
    console.error(`Failed to save progress for ${gameId}:`, error);
  }
};

/**
 * Load game progress from localStorage with validation
 */
export const loadProgress = (gameId: string): GameProgress | null => {
  try {
    const key = `${STORAGE_PREFIX}${gameId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (isValidGameProgress(parsed)) {
        return parsed;
      }
      console.warn(`Invalid progress data for ${gameId}, ignoring`);
    }
  } catch (error) {
    console.error(`Failed to load progress for ${gameId}:`, error);
  }
  return null;
};

/**
 * Clear game progress from localStorage
 */
export const clearProgress = (gameId: string): void => {
  try {
    const key = `${STORAGE_PREFIX}${gameId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to clear progress for ${gameId}:`, error);
  }
};

/**
 * Get all saved game progress keys
 */
export const getAllProgressKeys = (): string[] => {
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keys.push(key.replace(STORAGE_PREFIX, ''));
      }
    }
  } catch (error) {
    console.error('Failed to get progress keys:', error);
  }
  return keys;
};

/**
 * Clear all game progress
 */
export const clearAllProgress = (): void => {
  const keys = getAllProgressKeys();
  keys.forEach(clearProgress);
};

/**
 * Export all progress data as JSON
 */
export const exportAllProgress = (): Record<string, GameProgress> => {
  const allProgress: Record<string, GameProgress> = {};
  const keys = getAllProgressKeys();

  keys.forEach((gameId) => {
    const progress = loadProgress(gameId);
    if (progress) {
      allProgress[gameId] = progress;
    }
  });

  return allProgress;
};
