import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  saveProgress,
  loadProgress,
  clearProgress,
  getAllProgressKeys,
  clearAllProgress,
  exportAllProgress,
} from '../storage';
import type { GameProgress } from '@shared/types';

// Mock localStorage
const createMockLocalStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    get length() {
      return Object.keys(store).length;
    },
    _getStore: () => store,
    _setStore: (newStore: Record<string, string>) => {
      store = newStore;
    },
  };
};

// Valid GameProgress fixture
const createValidProgress = (overrides?: Partial<GameProgress>): GameProgress => ({
  currentLevel: 1,
  problemsCompleted: 10,
  lastPlayedDate: '2024-01-15T10:30:00Z',
  totalTimeSpent: 3600,
  levelProgress: {
    level1: {
      questionsAnswered: 10,
      questionsCorrect: 8,
      explanationsProvided: 5,
      explanationScores: [80, 90, 85],
      mastered: true,
    },
  },
  ...overrides,
});

describe('storage', () => {
  let mockStorage: ReturnType<typeof createMockLocalStorage>;
  let originalLocalStorage: Storage;

  beforeEach(() => {
    mockStorage = createMockLocalStorage();
    originalLocalStorage = global.localStorage;
    Object.defineProperty(global, 'localStorage', {
      value: mockStorage,
      writable: true,
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
    vi.restoreAllMocks();
  });

  describe('saveProgress', () => {
    it('should save progress with correct key prefix', () => {
      const progress = createValidProgress();
      saveProgress('test-game', progress);

      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'kvenno-chemistry-test-game',
        JSON.stringify(progress)
      );
    });

    it('should handle different game IDs', () => {
      const progress = createValidProgress();

      saveProgress('molmassi', progress);
      saveProgress('vsepr-geometry', progress);
      saveProgress('lewis-structures', progress);

      expect(mockStorage.setItem).toHaveBeenCalledTimes(3);
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'kvenno-chemistry-molmassi',
        expect.any(String)
      );
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'kvenno-chemistry-vsepr-geometry',
        expect.any(String)
      );
    });

    it('should serialize progress to JSON', () => {
      const progress = createValidProgress({
        currentLevel: 2,
        problemsCompleted: 25,
      });
      saveProgress('test-game', progress);

      const savedValue = mockStorage.setItem.mock.calls[0][1];
      const parsed = JSON.parse(savedValue);

      expect(parsed.currentLevel).toBe(2);
      expect(parsed.problemsCompleted).toBe(25);
    });

    it('should handle localStorage errors gracefully', () => {
      mockStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      // Should not throw
      expect(() => saveProgress('test-game', createValidProgress())).not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('loadProgress', () => {
    it('should load valid progress data', () => {
      const progress = createValidProgress();
      mockStorage._setStore({
        'kvenno-chemistry-test-game': JSON.stringify(progress),
      });

      const loaded = loadProgress('test-game');

      expect(loaded).toEqual(progress);
    });

    it('should return null for non-existent game', () => {
      const loaded = loadProgress('non-existent-game');

      expect(loaded).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      mockStorage._setStore({
        'kvenno-chemistry-test-game': 'not-valid-json{',
      });

      const loaded = loadProgress('test-game');

      expect(loaded).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('should return null and warn for invalid progress structure', () => {
      mockStorage._setStore({
        'kvenno-chemistry-test-game': JSON.stringify({ foo: 'bar' }),
      });

      const loaded = loadProgress('test-game');

      expect(loaded).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        'Invalid progress data for test-game, ignoring'
      );
    });

    it('should reject progress with missing currentLevel', () => {
      const invalidProgress = {
        problemsCompleted: 10,
        lastPlayedDate: '2024-01-15',
        totalTimeSpent: 100,
      };
      mockStorage._setStore({
        'kvenno-chemistry-test-game': JSON.stringify(invalidProgress),
      });

      expect(loadProgress('test-game')).toBeNull();
    });

    it('should reject progress with negative currentLevel', () => {
      const invalidProgress = {
        currentLevel: -1,
        problemsCompleted: 10,
        lastPlayedDate: '2024-01-15',
        totalTimeSpent: 100,
      };
      mockStorage._setStore({
        'kvenno-chemistry-test-game': JSON.stringify(invalidProgress),
      });

      expect(loadProgress('test-game')).toBeNull();
    });

    it('should reject progress with non-number problemsCompleted', () => {
      const invalidProgress = {
        currentLevel: 1,
        problemsCompleted: 'ten',
        lastPlayedDate: '2024-01-15',
        totalTimeSpent: 100,
      };
      mockStorage._setStore({
        'kvenno-chemistry-test-game': JSON.stringify(invalidProgress),
      });

      expect(loadProgress('test-game')).toBeNull();
    });

    it('should reject progress with negative problemsCompleted', () => {
      const invalidProgress = {
        currentLevel: 1,
        problemsCompleted: -5,
        lastPlayedDate: '2024-01-15',
        totalTimeSpent: 100,
      };
      mockStorage._setStore({
        'kvenno-chemistry-test-game': JSON.stringify(invalidProgress),
      });

      expect(loadProgress('test-game')).toBeNull();
    });

    it('should reject progress with non-string lastPlayedDate', () => {
      const invalidProgress = {
        currentLevel: 1,
        problemsCompleted: 10,
        lastPlayedDate: 12345,
        totalTimeSpent: 100,
      };
      mockStorage._setStore({
        'kvenno-chemistry-test-game': JSON.stringify(invalidProgress),
      });

      expect(loadProgress('test-game')).toBeNull();
    });

    it('should reject progress with negative totalTimeSpent', () => {
      const invalidProgress = {
        currentLevel: 1,
        problemsCompleted: 10,
        lastPlayedDate: '2024-01-15',
        totalTimeSpent: -100,
      };
      mockStorage._setStore({
        'kvenno-chemistry-test-game': JSON.stringify(invalidProgress),
      });

      expect(loadProgress('test-game')).toBeNull();
    });

    it('should reject null data', () => {
      mockStorage._setStore({
        'kvenno-chemistry-test-game': JSON.stringify(null),
      });

      expect(loadProgress('test-game')).toBeNull();
    });

    it('should reject primitive data', () => {
      mockStorage._setStore({
        'kvenno-chemistry-test-game': JSON.stringify('string-data'),
      });

      expect(loadProgress('test-game')).toBeNull();
    });

    it('should accept progress with zero values', () => {
      const progress = createValidProgress({
        currentLevel: 0,
        problemsCompleted: 0,
        totalTimeSpent: 0,
      });
      mockStorage._setStore({
        'kvenno-chemistry-test-game': JSON.stringify(progress),
      });

      const loaded = loadProgress('test-game');

      expect(loaded).toEqual(progress);
    });

    it('should handle localStorage errors gracefully', () => {
      mockStorage.getItem.mockImplementation(() => {
        throw new Error('SecurityError');
      });

      const loaded = loadProgress('test-game');

      expect(loaded).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('clearProgress', () => {
    it('should remove progress for specified game', () => {
      mockStorage._setStore({
        'kvenno-chemistry-test-game': JSON.stringify(createValidProgress()),
      });

      clearProgress('test-game');

      expect(mockStorage.removeItem).toHaveBeenCalledWith('kvenno-chemistry-test-game');
    });

    it('should not throw for non-existent game', () => {
      expect(() => clearProgress('non-existent')).not.toThrow();
      expect(mockStorage.removeItem).toHaveBeenCalledWith('kvenno-chemistry-non-existent');
    });

    it('should handle localStorage errors gracefully', () => {
      mockStorage.removeItem.mockImplementation(() => {
        throw new Error('SecurityError');
      });

      expect(() => clearProgress('test-game')).not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getAllProgressKeys', () => {
    it('should return empty array when no progress saved', () => {
      const keys = getAllProgressKeys();

      expect(keys).toEqual([]);
    });

    it('should return game IDs without prefix', () => {
      mockStorage._setStore({
        'kvenno-chemistry-molmassi': JSON.stringify(createValidProgress()),
        'kvenno-chemistry-vsepr-geometry': JSON.stringify(createValidProgress()),
        'kvenno-chemistry-lewis-structures': JSON.stringify(createValidProgress()),
      });

      const keys = getAllProgressKeys();

      expect(keys).toHaveLength(3);
      expect(keys).toContain('molmassi');
      expect(keys).toContain('vsepr-geometry');
      expect(keys).toContain('lewis-structures');
    });

    it('should ignore non-chemistry keys', () => {
      mockStorage._setStore({
        'kvenno-chemistry-molmassi': JSON.stringify(createValidProgress()),
        'other-app-data': 'some-data',
        'user-preferences': 'prefs',
      });

      const keys = getAllProgressKeys();

      expect(keys).toHaveLength(1);
      expect(keys).toContain('molmassi');
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock length to return a value that will trigger the loop
      Object.defineProperty(mockStorage, 'length', { value: 1, configurable: true });
      mockStorage.key.mockImplementation(() => {
        throw new Error('SecurityError');
      });

      const keys = getAllProgressKeys();

      // The function catches errors and returns what it has collected so far
      expect(keys).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('clearAllProgress', () => {
    it('should clear all chemistry game progress', () => {
      mockStorage._setStore({
        'kvenno-chemistry-molmassi': JSON.stringify(createValidProgress()),
        'kvenno-chemistry-vsepr-geometry': JSON.stringify(createValidProgress()),
        'other-data': 'preserved',
      });

      clearAllProgress();

      expect(mockStorage.removeItem).toHaveBeenCalledWith('kvenno-chemistry-molmassi');
      expect(mockStorage.removeItem).toHaveBeenCalledWith('kvenno-chemistry-vsepr-geometry');
    });

    it('should not throw when no progress exists', () => {
      expect(() => clearAllProgress()).not.toThrow();
    });
  });

  describe('exportAllProgress', () => {
    it('should export all valid progress data', () => {
      const progress1 = createValidProgress({ currentLevel: 1 });
      const progress2 = createValidProgress({ currentLevel: 2 });

      mockStorage._setStore({
        'kvenno-chemistry-molmassi': JSON.stringify(progress1),
        'kvenno-chemistry-vsepr-geometry': JSON.stringify(progress2),
      });

      const exported = exportAllProgress();

      expect(exported).toEqual({
        molmassi: progress1,
        'vsepr-geometry': progress2,
      });
    });

    it('should return empty object when no progress exists', () => {
      const exported = exportAllProgress();

      expect(exported).toEqual({});
    });

    it('should skip invalid progress entries', () => {
      const validProgress = createValidProgress();

      mockStorage._setStore({
        'kvenno-chemistry-valid-game': JSON.stringify(validProgress),
        'kvenno-chemistry-invalid-game': JSON.stringify({ invalid: true }),
      });

      const exported = exportAllProgress();

      expect(Object.keys(exported)).toHaveLength(1);
      expect(exported['valid-game']).toEqual(validProgress);
      expect(exported['invalid-game']).toBeUndefined();
    });

    it('should handle corrupted JSON gracefully', () => {
      const validProgress = createValidProgress();

      mockStorage._setStore({
        'kvenno-chemistry-valid-game': JSON.stringify(validProgress),
        'kvenno-chemistry-corrupted': 'not-json{{{',
      });

      const exported = exportAllProgress();

      expect(Object.keys(exported)).toHaveLength(1);
      expect(exported['valid-game']).toEqual(validProgress);
    });
  });

  describe('integration', () => {
    it('should round-trip save and load correctly', () => {
      const progress = createValidProgress({
        currentLevel: 3,
        problemsCompleted: 42,
        lastPlayedDate: '2024-06-15T14:30:00Z',
        totalTimeSpent: 7200,
        levelProgress: {
          level1: {
            questionsAnswered: 15,
            questionsCorrect: 15,
            explanationsProvided: 10,
            explanationScores: [100, 95, 100],
            mastered: true,
          },
          level2: {
            problemsCompleted: 20,
            predictionsMade: 18,
            predictionsCorrect: 16,
            finalAnswersCorrect: 18,
            mastered: true,
          },
          level3: {
            problemsCompleted: 5,
            compositeScores: [75, 80],
            achievements: ['quick-thinker'],
            mastered: false,
            hintsUsed: 2,
          },
        },
      });

      saveProgress('integration-test', progress);
      const loaded = loadProgress('integration-test');

      expect(loaded).toEqual(progress);
    });

    it('should handle save, load, clear workflow', () => {
      const progress = createValidProgress();

      // Save
      saveProgress('workflow-test', progress);
      expect(loadProgress('workflow-test')).toEqual(progress);

      // Clear
      clearProgress('workflow-test');
      expect(loadProgress('workflow-test')).toBeNull();
    });

    it('should handle multiple games independently', () => {
      const progress1 = createValidProgress({ currentLevel: 1 });
      const progress2 = createValidProgress({ currentLevel: 2 });
      const progress3 = createValidProgress({ currentLevel: 3 });

      saveProgress('game1', progress1);
      saveProgress('game2', progress2);
      saveProgress('game3', progress3);

      expect(loadProgress('game1')).toEqual(progress1);
      expect(loadProgress('game2')).toEqual(progress2);
      expect(loadProgress('game3')).toEqual(progress3);

      clearProgress('game2');

      expect(loadProgress('game1')).toEqual(progress1);
      expect(loadProgress('game2')).toBeNull();
      expect(loadProgress('game3')).toEqual(progress3);
    });
  });
});
