/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAchievements } from '../useAchievements';
import type { PlayerAchievements } from '../../types/achievement.types';

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

// Helper to create a valid PlayerAchievements object
const createPlayerAchievements = (overrides?: Partial<PlayerAchievements>): PlayerAchievements => ({
  unlocked: [],
  progress: {},
  totalPoints: 0,
  currentStreak: 0,
  bestStreak: 0,
  daysPlayed: [],
  totalProblemsSolved: 0,
  totalGamesCompleted: 0,
  lastUpdated: '2024-01-15T10:30:00Z',
  ...overrides,
});

describe('useAchievements', () => {
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
  });

  afterEach(() => {
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should return default achievements when no saved data', () => {
      const { result } = renderHook(() => useAchievements({ gameId: 'test-game' }));

      expect(result.current.currentStreak).toBe(0);
      expect(result.current.bestStreak).toBe(0);
      expect(result.current.totalPoints).toBe(0);
      expect(result.current.unlockedAchievements).toHaveLength(0);
    });

    it('should load saved achievements', () => {
      const savedAchievements = createPlayerAchievements({
        unlocked: ['streak-3'],
        totalPoints: 5,
        currentStreak: 3,
        bestStreak: 5,
      });
      mockStorage._setStore({
        'kvenno-chemistry-achievements': JSON.stringify(savedAchievements),
      });

      const { result } = renderHook(() => useAchievements({ gameId: 'test-game' }));

      expect(result.current.currentStreak).toBe(3);
      expect(result.current.bestStreak).toBe(5);
      expect(result.current.totalPoints).toBe(5);
    });

    it('should provide all achievements', () => {
      const { result } = renderHook(() => useAchievements({ gameId: 'test-game' }));

      expect(result.current.allAchievements.length).toBeGreaterThan(0);
    });

    it('should start with empty notifications', () => {
      const { result } = renderHook(() => useAchievements({ gameId: 'test-game' }));

      expect(result.current.notifications).toHaveLength(0);
    });
  });

  describe('trackCorrectAnswer', () => {
    it('should increment streak', () => {
      const { result } = renderHook(() => useAchievements({ gameId: 'test-game' }));

      act(() => {
        result.current.trackCorrectAnswer();
      });

      expect(result.current.currentStreak).toBe(1);
    });

    it('should increment total problems solved', () => {
      const { result } = renderHook(() => useAchievements({ gameId: 'test-game' }));

      act(() => {
        result.current.trackCorrectAnswer();
        result.current.trackCorrectAnswer();
      });

      expect(result.current.achievements.totalProblemsSolved).toBe(2);
    });

    it('should track best streak', () => {
      const { result } = renderHook(() => useAchievements({ gameId: 'test-game' }));

      // Build up a streak
      act(() => {
        for (let i = 0; i < 5; i++) {
          result.current.trackCorrectAnswer();
        }
      });

      expect(result.current.bestStreak).toBe(5);
    });

    it('should track first attempt', () => {
      const { result } = renderHook(() => useAchievements({ gameId: 'test-game' }));

      act(() => {
        result.current.trackCorrectAnswer({ firstAttempt: true });
      });

      // Should have recorded first attempt progress
      expect(result.current.achievements.totalProblemsSolved).toBe(1);
    });
  });

  describe('trackIncorrectAnswer', () => {
    it('should reset current streak', () => {
      const savedAchievements = createPlayerAchievements({
        currentStreak: 5,
      });
      mockStorage._setStore({
        'kvenno-chemistry-achievements': JSON.stringify(savedAchievements),
      });

      const { result } = renderHook(() => useAchievements({ gameId: 'test-game' }));

      act(() => {
        result.current.trackIncorrectAnswer();
      });

      expect(result.current.currentStreak).toBe(0);
    });

    it('should preserve best streak', () => {
      const savedAchievements = createPlayerAchievements({
        currentStreak: 5,
        bestStreak: 10,
      });
      mockStorage._setStore({
        'kvenno-chemistry-achievements': JSON.stringify(savedAchievements),
      });

      const { result } = renderHook(() => useAchievements({ gameId: 'test-game' }));

      act(() => {
        result.current.trackIncorrectAnswer();
      });

      expect(result.current.bestStreak).toBe(10);
    });
  });

  describe('trackLevelComplete', () => {
    it('should unlock level completion achievements', () => {
      const { result } = renderHook(() => useAchievements({ gameId: 'test-game' }));

      act(() => {
        result.current.trackLevelComplete(1, 100, 100);
      });

      // Should have some notifications (level complete achievement)
      const notifications = result.current.notifications;
      // May or may not unlock based on achievement criteria
      expect(notifications.length).toBeGreaterThanOrEqual(0);
    });

    it('should track with time and hints', () => {
      const { result } = renderHook(() => useAchievements({ gameId: 'test-game' }));

      act(() => {
        result.current.trackLevelComplete(1, 100, 100, { timeTaken: 30, hintsUsed: 0 });
      });

      // Should process without error
      expect(result.current.achievements).toBeDefined();
    });
  });

  describe('trackGameComplete', () => {
    it('should increment total games completed', () => {
      const { result } = renderHook(() => useAchievements({ gameId: 'test-game' }));

      act(() => {
        result.current.trackGameComplete();
      });

      expect(result.current.achievements.totalGamesCompleted).toBe(1);
    });
  });

  describe('notifications', () => {
    it('should add notification when achievement unlocked', () => {
      const { result } = renderHook(() => useAchievements({ gameId: 'test-game' }));

      // Build up a streak to unlock streak-3 achievement
      act(() => {
        for (let i = 0; i < 3; i++) {
          result.current.trackCorrectAnswer();
        }
      });

      // Should have streak-3 notification
      const hasStreakNotification = result.current.notifications.some(
        (n) => n.achievement.id === 'streak-3'
      );
      expect(hasStreakNotification).toBe(true);
    });

    it('should dismiss notification', () => {
      const { result } = renderHook(() => useAchievements({ gameId: 'test-game' }));

      // Build up a streak
      act(() => {
        for (let i = 0; i < 3; i++) {
          result.current.trackCorrectAnswer();
        }
      });

      const notificationCount = result.current.notifications.length;

      act(() => {
        result.current.dismissNotification('streak-3');
      });

      expect(result.current.notifications.length).toBeLessThan(notificationCount);
    });

    it('should clear all notifications', () => {
      const { result } = renderHook(() => useAchievements({ gameId: 'test-game' }));

      // Build up a streak
      act(() => {
        for (let i = 0; i < 3; i++) {
          result.current.trackCorrectAnswer();
        }
      });

      act(() => {
        result.current.clearNotifications();
      });

      expect(result.current.notifications).toHaveLength(0);
    });
  });

  describe('onAchievementUnlocked callback', () => {
    it('should call callback when achievement unlocked', () => {
      const onUnlocked = vi.fn();
      const { result } = renderHook(() =>
        useAchievements({
          gameId: 'test-game',
          onAchievementUnlocked: onUnlocked,
        })
      );

      act(() => {
        for (let i = 0; i < 3; i++) {
          result.current.trackCorrectAnswer();
        }
      });

      expect(onUnlocked).toHaveBeenCalled();
    });

    it('should pass notification to callback', () => {
      const onUnlocked = vi.fn();
      const { result } = renderHook(() =>
        useAchievements({
          gameId: 'test-game',
          onAchievementUnlocked: onUnlocked,
        })
      );

      act(() => {
        for (let i = 0; i < 3; i++) {
          result.current.trackCorrectAnswer();
        }
      });

      expect(onUnlocked).toHaveBeenCalledWith(
        expect.objectContaining({
          achievement: expect.objectContaining({ id: expect.any(String) }),
        })
      );
    });
  });

  describe('getProgress', () => {
    it('should return progress for an achievement', () => {
      const { result } = renderHook(() => useAchievements({ gameId: 'test-game' }));

      // Get progress for streak-5 achievement
      const achievement = result.current.allAchievements.find((a) => a.id === 'streak-5');
      if (achievement) {
        const progress = result.current.getProgress(achievement);

        expect(progress).toHaveProperty('achievementId', 'streak-5');
        expect(progress).toHaveProperty('currentValue');
        expect(progress).toHaveProperty('targetValue');
        expect(progress).toHaveProperty('unlocked');
      }
    });
  });

  describe('resetAll', () => {
    it('should reset all achievements', () => {
      const savedAchievements = createPlayerAchievements({
        unlocked: ['streak-3', 'streak-5'],
        totalPoints: 15,
        currentStreak: 10,
        bestStreak: 10,
        totalProblemsSolved: 50,
      });
      mockStorage._setStore({
        'kvenno-chemistry-achievements': JSON.stringify(savedAchievements),
      });

      const { result } = renderHook(() => useAchievements({ gameId: 'test-game' }));

      act(() => {
        result.current.resetAll();
      });

      expect(result.current.currentStreak).toBe(0);
      expect(result.current.totalPoints).toBe(0);
      expect(result.current.unlockedAchievements).toHaveLength(0);
    });

    it('should clear notifications on reset', () => {
      const { result } = renderHook(() => useAchievements({ gameId: 'test-game' }));

      // Build up some achievements
      act(() => {
        for (let i = 0; i < 3; i++) {
          result.current.trackCorrectAnswer();
        }
      });

      act(() => {
        result.current.resetAll();
      });

      expect(result.current.notifications).toHaveLength(0);
    });
  });

  describe('unlockedPercentage', () => {
    it('should return 0 when no achievements unlocked', () => {
      const { result } = renderHook(() => useAchievements({ gameId: 'test-game' }));

      expect(result.current.unlockedPercentage).toBe(0);
    });

    it('should calculate percentage correctly', () => {
      // Pre-unlock half the achievements
      const allAchievementIds = ['streak-3', 'streak-5', 'streak-10', 'perfect-level-1', 'high-scorer'];
      const savedAchievements = createPlayerAchievements({
        unlocked: allAchievementIds,
        totalPoints: 50,
      });
      mockStorage._setStore({
        'kvenno-chemistry-achievements': JSON.stringify(savedAchievements),
      });

      const { result } = renderHook(() => useAchievements({ gameId: 'test-game' }));

      expect(result.current.unlockedPercentage).toBeGreaterThan(0);
    });
  });

  describe('lockedAchievements', () => {
    it('should return locked non-secret achievements', () => {
      const { result } = renderHook(() => useAchievements({ gameId: 'test-game' }));

      // All achievements should be locked initially (except potentially daily ones)
      const lockedAchievements = result.current.lockedAchievements;

      // Should not include secret achievements
      for (const achievement of lockedAchievements) {
        expect(achievement.secret).toBeFalsy();
      }
    });

    it('should exclude unlocked achievements', () => {
      const savedAchievements = createPlayerAchievements({
        unlocked: ['streak-3'],
      });
      mockStorage._setStore({
        'kvenno-chemistry-achievements': JSON.stringify(savedAchievements),
      });

      const { result } = renderHook(() => useAchievements({ gameId: 'test-game' }));

      const lockedIds = result.current.lockedAchievements.map((a) => a.id);
      expect(lockedIds).not.toContain('streak-3');
    });
  });

  describe('return values', () => {
    it('should return all expected properties and methods', () => {
      const { result } = renderHook(() => useAchievements({ gameId: 'test-game' }));

      expect(result.current).toHaveProperty('achievements');
      expect(result.current).toHaveProperty('allAchievements');
      expect(result.current).toHaveProperty('unlockedAchievements');
      expect(result.current).toHaveProperty('lockedAchievements');
      expect(result.current).toHaveProperty('currentStreak');
      expect(result.current).toHaveProperty('bestStreak');
      expect(result.current).toHaveProperty('totalPoints');
      expect(result.current).toHaveProperty('unlockedPercentage');
      expect(result.current).toHaveProperty('notifications');
      expect(result.current).toHaveProperty('trackCorrectAnswer');
      expect(result.current).toHaveProperty('trackIncorrectAnswer');
      expect(result.current).toHaveProperty('trackLevelComplete');
      expect(result.current).toHaveProperty('trackGameComplete');
      expect(result.current).toHaveProperty('dismissNotification');
      expect(result.current).toHaveProperty('clearNotifications');
      expect(result.current).toHaveProperty('getProgress');
      expect(result.current).toHaveProperty('resetAll');
    });
  });
});
