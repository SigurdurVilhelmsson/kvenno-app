/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useProgress } from '../useProgress';
import type { GameProgress } from '../../types';

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

describe('useProgress', () => {
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

  describe('initial state', () => {
    it('should return default progress when no saved progress exists', () => {
      const { result } = renderHook(() => useProgress({ gameId: 'test-game' }));

      expect(result.current.progress.currentLevel).toBe(3);
      expect(result.current.progress.problemsCompleted).toBe(0);
      expect(result.current.progress.totalTimeSpent).toBe(0);
      expect(result.current.progress.levelProgress).toEqual({});
    });

    it('should load saved progress from localStorage', () => {
      const savedProgress = createValidProgress({
        currentLevel: 2,
        problemsCompleted: 25,
      });
      mockStorage._setStore({
        'kvenno-chemistry-test-game': JSON.stringify(savedProgress),
      });

      const { result } = renderHook(() => useProgress({ gameId: 'test-game' }));

      expect(result.current.progress.currentLevel).toBe(2);
      expect(result.current.progress.problemsCompleted).toBe(25);
    });

    it('should apply initial progress overrides', () => {
      const { result } = renderHook(() =>
        useProgress({
          gameId: 'test-game',
          initialProgress: { currentLevel: 1, problemsCompleted: 5 },
        })
      );

      expect(result.current.progress.currentLevel).toBe(1);
      expect(result.current.progress.problemsCompleted).toBe(5);
    });

    it('should prioritize loaded progress over initial progress', () => {
      const savedProgress = createValidProgress({
        currentLevel: 2,
        problemsCompleted: 25,
      });
      mockStorage._setStore({
        'kvenno-chemistry-test-game': JSON.stringify(savedProgress),
      });

      const { result } = renderHook(() =>
        useProgress({
          gameId: 'test-game',
          initialProgress: { currentLevel: 1, problemsCompleted: 0 },
        })
      );

      expect(result.current.progress.currentLevel).toBe(2);
      expect(result.current.progress.problemsCompleted).toBe(25);
    });

    it('should update lastPlayedDate on mount', async () => {
      const { result } = renderHook(() => useProgress({ gameId: 'test-game' }));

      // Wait for the effect to run
      await waitFor(() => {
        const lastPlayed = new Date(result.current.progress.lastPlayedDate);
        const now = new Date();
        // Should be within last few seconds
        expect(now.getTime() - lastPlayed.getTime()).toBeLessThan(5000);
      });
    });
  });

  describe('updateProgress', () => {
    it('should update specific fields', () => {
      const { result } = renderHook(() => useProgress({ gameId: 'test-game' }));

      act(() => {
        result.current.updateProgress({ problemsCompleted: 15 });
      });

      expect(result.current.progress.problemsCompleted).toBe(15);
    });

    it('should preserve unchanged fields', () => {
      const savedProgress = createValidProgress({
        currentLevel: 2,
        problemsCompleted: 25,
        totalTimeSpent: 1200,
      });
      mockStorage._setStore({
        'kvenno-chemistry-test-game': JSON.stringify(savedProgress),
      });
      const { result } = renderHook(() => useProgress({ gameId: 'test-game' }));

      act(() => {
        result.current.updateProgress({ problemsCompleted: 30 });
      });

      expect(result.current.progress.currentLevel).toBe(2);
      expect(result.current.progress.problemsCompleted).toBe(30);
      expect(result.current.progress.totalTimeSpent).toBe(1200);
    });

    it('should update lastPlayedDate on each update', () => {
      const { result } = renderHook(() => useProgress({ gameId: 'test-game' }));
      const beforeUpdate = result.current.progress.lastPlayedDate;

      act(() => {
        result.current.updateProgress({ problemsCompleted: 1 });
      });

      // LastPlayedDate should be updated (or at least not older)
      expect(new Date(result.current.progress.lastPlayedDate).getTime()).toBeGreaterThanOrEqual(
        new Date(beforeUpdate).getTime()
      );
    });

    it('should update levelProgress', () => {
      const { result } = renderHook(() => useProgress({ gameId: 'test-game' }));

      act(() => {
        result.current.updateProgress({
          levelProgress: {
            level1: {
              questionsAnswered: 15,
              questionsCorrect: 15,
              explanationsProvided: 10,
              explanationScores: [100, 95, 100],
              mastered: true,
            },
          },
        });
      });

      expect(result.current.progress.levelProgress.level1).toEqual({
        questionsAnswered: 15,
        questionsCorrect: 15,
        explanationsProvided: 10,
        explanationScores: [100, 95, 100],
        mastered: true,
      });
    });
  });

  describe('resetProgress', () => {
    it('should reset progress to defaults', () => {
      const savedProgress = createValidProgress({
        currentLevel: 2,
        problemsCompleted: 50,
        totalTimeSpent: 5000,
      });
      mockStorage._setStore({
        'kvenno-chemistry-test-game': JSON.stringify(savedProgress),
      });
      const { result } = renderHook(() => useProgress({ gameId: 'test-game' }));

      act(() => {
        result.current.resetProgress();
      });

      expect(result.current.progress.currentLevel).toBe(3);
      expect(result.current.progress.problemsCompleted).toBe(0);
      expect(result.current.progress.totalTimeSpent).toBe(0);
      expect(result.current.progress.levelProgress).toEqual({});
    });

    it('should apply initial progress on reset', () => {
      const savedProgress = createValidProgress({
        currentLevel: 2,
        problemsCompleted: 50,
      });
      mockStorage._setStore({
        'kvenno-chemistry-test-game': JSON.stringify(savedProgress),
      });
      const { result } = renderHook(() =>
        useProgress({
          gameId: 'test-game',
          initialProgress: { currentLevel: 1 },
        })
      );

      act(() => {
        result.current.resetProgress();
      });

      expect(result.current.progress.currentLevel).toBe(1);
    });

    it('should save reset progress to localStorage', () => {
      const savedProgress = createValidProgress();
      mockStorage._setStore({
        'kvenno-chemistry-test-game': JSON.stringify(savedProgress),
      });
      const { result } = renderHook(() => useProgress({ gameId: 'test-game' }));

      act(() => {
        result.current.resetProgress();
      });

      // Should have called setItem with the reset progress
      const calls = mockStorage.setItem.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0]).toBe('kvenno-chemistry-test-game');
      const parsed = JSON.parse(lastCall[1]);
      expect(parsed.problemsCompleted).toBe(0);
    });
  });

  describe('incrementProblems', () => {
    it('should increment problemsCompleted by 1', () => {
      const { result } = renderHook(() => useProgress({ gameId: 'test-game' }));

      act(() => {
        result.current.incrementProblems();
      });

      expect(result.current.progress.problemsCompleted).toBe(1);
    });

    it('should increment from existing value', () => {
      const savedProgress = createValidProgress({
        problemsCompleted: 10,
      });
      mockStorage._setStore({
        'kvenno-chemistry-test-game': JSON.stringify(savedProgress),
      });
      const { result } = renderHook(() => useProgress({ gameId: 'test-game' }));

      act(() => {
        result.current.incrementProblems();
      });

      expect(result.current.progress.problemsCompleted).toBe(11);
    });

    it('should update lastPlayedDate', () => {
      const { result } = renderHook(() => useProgress({ gameId: 'test-game' }));

      act(() => {
        result.current.incrementProblems();
      });

      const lastPlayed = new Date(result.current.progress.lastPlayedDate);
      const now = new Date();
      expect(now.getTime() - lastPlayed.getTime()).toBeLessThan(5000);
    });
  });

  describe('setLevel', () => {
    it('should set current level', () => {
      const { result } = renderHook(() => useProgress({ gameId: 'test-game' }));

      act(() => {
        result.current.setLevel(2);
      });

      expect(result.current.progress.currentLevel).toBe(2);
    });

    it('should update lastPlayedDate', () => {
      const { result } = renderHook(() => useProgress({ gameId: 'test-game' }));

      act(() => {
        result.current.setLevel(1);
      });

      const lastPlayed = new Date(result.current.progress.lastPlayedDate);
      const now = new Date();
      expect(now.getTime() - lastPlayed.getTime()).toBeLessThan(5000);
    });
  });

  describe('auto-save', () => {
    it('should auto-save progress on changes', async () => {
      const { result } = renderHook(() => useProgress({ gameId: 'test-game' }));

      act(() => {
        result.current.updateProgress({ problemsCompleted: 5 });
      });

      // Wait for effect to run
      await waitFor(() => {
        const calls = mockStorage.setItem.mock.calls;
        const hasCorrectCall = calls.some((call) => {
          return call[0] === 'kvenno-chemistry-test-game' && call[1].includes('"problemsCompleted":5');
        });
        expect(hasCorrectCall).toBe(true);
      });
    });

    it('should save to correct key based on gameId', async () => {
      const { result } = renderHook(() => useProgress({ gameId: 'different-game' }));

      act(() => {
        result.current.updateProgress({ problemsCompleted: 1 });
      });

      await waitFor(() => {
        const calls = mockStorage.setItem.mock.calls;
        const hasCorrectKey = calls.some((call) => call[0] === 'kvenno-chemistry-different-game');
        expect(hasCorrectKey).toBe(true);
      });
    });
  });

  describe('different game IDs', () => {
    it('should maintain separate progress for different games', () => {
      const progress1 = createValidProgress({ problemsCompleted: 10 });
      const progress2 = createValidProgress({ problemsCompleted: 20 });
      mockStorage._setStore({
        'kvenno-chemistry-game1': JSON.stringify(progress1),
        'kvenno-chemistry-game2': JSON.stringify(progress2),
      });

      const { result: result1 } = renderHook(() => useProgress({ gameId: 'game1' }));
      const { result: result2 } = renderHook(() => useProgress({ gameId: 'game2' }));

      expect(result1.current.progress.problemsCompleted).toBe(10);
      expect(result2.current.progress.problemsCompleted).toBe(20);
    });
  });

  describe('return values', () => {
    it('should return all expected functions', () => {
      const { result } = renderHook(() => useProgress({ gameId: 'test-game' }));

      expect(result.current).toHaveProperty('progress');
      expect(result.current).toHaveProperty('updateProgress');
      expect(result.current).toHaveProperty('resetProgress');
      expect(result.current).toHaveProperty('incrementProblems');
      expect(result.current).toHaveProperty('setLevel');
      expect(typeof result.current.updateProgress).toBe('function');
      expect(typeof result.current.resetProgress).toBe('function');
      expect(typeof result.current.incrementProblems).toBe('function');
      expect(typeof result.current.setLevel).toBe('function');
    });
  });
});
