import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ACHIEVEMENTS,
  getDefaultPlayerAchievements,
  loadAchievements,
  saveAchievements,
  getAchievementById,
  getAchievementsByCategory,
  isAchievementUnlocked,
  getAchievementProgress,
  checkAchievements,
  getTotalPoints,
  getUnlockedPercentage,
  getUnlockedAchievements,
  getLockedAchievements,
  resetAchievements,
} from '../achievements';
import type { PlayerAchievements, Achievement, AchievementEvent } from '../../types/achievement.types';

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

describe('achievements', () => {
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

  describe('ACHIEVEMENTS constant', () => {
    it('should have at least 20 achievements defined', () => {
      expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(20);
    });

    it('should have unique IDs for all achievements', () => {
      const ids = ACHIEVEMENTS.map((a) => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have required properties on each achievement', () => {
      for (const achievement of ACHIEVEMENTS) {
        expect(achievement).toHaveProperty('id');
        expect(achievement).toHaveProperty('name');
        expect(achievement).toHaveProperty('description');
        expect(achievement).toHaveProperty('icon');
        expect(achievement).toHaveProperty('category');
        expect(achievement).toHaveProperty('rarity');
        expect(achievement).toHaveProperty('criteria');
        expect(achievement).toHaveProperty('points');
        expect(achievement.criteria).toHaveProperty('type');
        expect(achievement.criteria).toHaveProperty('target');
      }
    });

    it('should have valid categories', () => {
      const validCategories = ['performance', 'streak', 'speed', 'mastery', 'dedication', 'special'];
      for (const achievement of ACHIEVEMENTS) {
        expect(validCategories).toContain(achievement.category);
      }
    });

    it('should have valid rarities', () => {
      const validRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
      for (const achievement of ACHIEVEMENTS) {
        expect(validRarities).toContain(achievement.rarity);
      }
    });

    it('should have positive point values', () => {
      for (const achievement of ACHIEVEMENTS) {
        expect(achievement.points).toBeGreaterThan(0);
      }
    });
  });

  describe('getDefaultPlayerAchievements', () => {
    it('should return default state with empty unlocked array', () => {
      const defaults = getDefaultPlayerAchievements();
      expect(defaults.unlocked).toEqual([]);
    });

    it('should return default state with empty progress object', () => {
      const defaults = getDefaultPlayerAchievements();
      expect(defaults.progress).toEqual({});
    });

    it('should return default state with zero counters', () => {
      const defaults = getDefaultPlayerAchievements();
      expect(defaults.totalPoints).toBe(0);
      expect(defaults.currentStreak).toBe(0);
      expect(defaults.bestStreak).toBe(0);
      expect(defaults.totalProblemsSolved).toBe(0);
      expect(defaults.totalGamesCompleted).toBe(0);
    });

    it('should return default state with empty daysPlayed array', () => {
      const defaults = getDefaultPlayerAchievements();
      expect(defaults.daysPlayed).toEqual([]);
    });

    it('should include lastUpdated timestamp', () => {
      const defaults = getDefaultPlayerAchievements();
      expect(defaults.lastUpdated).toBeDefined();
      // Should be a valid ISO string
      expect(() => new Date(defaults.lastUpdated)).not.toThrow();
    });
  });

  describe('loadAchievements', () => {
    it('should return default state when nothing is saved', () => {
      const loaded = loadAchievements();
      expect(loaded.unlocked).toEqual([]);
      expect(loaded.totalPoints).toBe(0);
    });

    it('should load valid saved achievements', () => {
      const saved = createPlayerAchievements({
        unlocked: ['streak-3', 'perfect-level-1'],
        totalPoints: 15,
        currentStreak: 5,
      });
      mockStorage._setStore({
        'kvenno-chemistry-achievements': JSON.stringify(saved),
      });

      const loaded = loadAchievements();

      expect(loaded.unlocked).toEqual(['streak-3', 'perfect-level-1']);
      expect(loaded.totalPoints).toBe(15);
      expect(loaded.currentStreak).toBe(5);
    });

    it('should return default state for invalid JSON', () => {
      mockStorage._setStore({
        'kvenno-chemistry-achievements': 'not-valid-json{',
      });

      const loaded = loadAchievements();

      expect(loaded.unlocked).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });

    it('should return default state when unlocked is not an array', () => {
      mockStorage._setStore({
        'kvenno-chemistry-achievements': JSON.stringify({ unlocked: 'not-array' }),
      });

      const loaded = loadAchievements();

      expect(loaded.unlocked).toEqual([]);
    });

    it('should merge with defaults for partial data', () => {
      mockStorage._setStore({
        'kvenno-chemistry-achievements': JSON.stringify({
          unlocked: ['streak-3'],
          totalPoints: 5,
          // Missing other fields
        }),
      });

      const loaded = loadAchievements();

      expect(loaded.unlocked).toEqual(['streak-3']);
      expect(loaded.totalPoints).toBe(5);
      expect(loaded.currentStreak).toBe(0);
      expect(loaded.daysPlayed).toEqual([]);
    });

    it('should handle localStorage errors gracefully', () => {
      mockStorage.getItem.mockImplementation(() => {
        throw new Error('SecurityError');
      });

      const loaded = loadAchievements();

      expect(loaded.unlocked).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('saveAchievements', () => {
    it('should save achievements to localStorage', () => {
      const achievements = createPlayerAchievements({
        unlocked: ['streak-3'],
        totalPoints: 5,
      });

      saveAchievements(achievements);

      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'kvenno-chemistry-achievements',
        expect.any(String)
      );
    });

    it('should update lastUpdated timestamp on save', () => {
      const achievements = createPlayerAchievements({
        lastUpdated: '2020-01-01T00:00:00Z',
      });

      saveAchievements(achievements);

      const savedValue = mockStorage.setItem.mock.calls[0][1];
      const parsed = JSON.parse(savedValue);
      expect(new Date(parsed.lastUpdated).getTime()).toBeGreaterThan(
        new Date('2020-01-01T00:00:00Z').getTime()
      );
    });

    it('should handle localStorage errors gracefully', () => {
      mockStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      // Should not throw
      expect(() => saveAchievements(createPlayerAchievements())).not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getAchievementById', () => {
    it('should find achievement by ID', () => {
      const achievement = getAchievementById('streak-3');

      expect(achievement).toBeDefined();
      expect(achievement?.id).toBe('streak-3');
      expect(achievement?.name).toBe('Þrefalt rétt');
    });

    it('should return undefined for non-existent ID', () => {
      const achievement = getAchievementById('non-existent-id');

      expect(achievement).toBeUndefined();
    });
  });

  describe('getAchievementsByCategory', () => {
    it('should return all streak achievements', () => {
      const streakAchievements = getAchievementsByCategory('streak');

      expect(streakAchievements.length).toBeGreaterThan(0);
      for (const achievement of streakAchievements) {
        expect(achievement.category).toBe('streak');
      }
    });

    it('should return all performance achievements', () => {
      const performanceAchievements = getAchievementsByCategory('performance');

      expect(performanceAchievements.length).toBeGreaterThan(0);
      for (const achievement of performanceAchievements) {
        expect(achievement.category).toBe('performance');
      }
    });

    it('should return empty array for non-existent category', () => {
      const achievements = getAchievementsByCategory('non-existent' as Achievement['category']);

      expect(achievements).toEqual([]);
    });
  });

  describe('isAchievementUnlocked', () => {
    it('should return true for unlocked achievement', () => {
      const achievements = createPlayerAchievements({
        unlocked: ['streak-3', 'perfect-level-1'],
      });

      expect(isAchievementUnlocked(achievements, 'streak-3')).toBe(true);
      expect(isAchievementUnlocked(achievements, 'perfect-level-1')).toBe(true);
    });

    it('should return false for locked achievement', () => {
      const achievements = createPlayerAchievements({
        unlocked: ['streak-3'],
      });

      expect(isAchievementUnlocked(achievements, 'streak-5')).toBe(false);
    });

    it('should return false when no achievements are unlocked', () => {
      const achievements = createPlayerAchievements();

      expect(isAchievementUnlocked(achievements, 'streak-3')).toBe(false);
    });
  });

  describe('getAchievementProgress', () => {
    it('should return existing progress if available', () => {
      const achievements = createPlayerAchievements({
        progress: {
          'streak-5': {
            achievementId: 'streak-5',
            currentValue: 3,
            targetValue: 5,
            unlocked: false,
          },
        },
      });
      const achievement = getAchievementById('streak-5')!;

      const progress = getAchievementProgress(achievements, achievement);

      expect(progress.currentValue).toBe(3);
      expect(progress.targetValue).toBe(5);
      expect(progress.unlocked).toBe(false);
    });

    it('should return default progress if not available', () => {
      const achievements = createPlayerAchievements();
      const achievement = getAchievementById('streak-5')!;

      const progress = getAchievementProgress(achievements, achievement);

      expect(progress.achievementId).toBe('streak-5');
      expect(progress.currentValue).toBe(0);
      expect(progress.targetValue).toBe(5);
      expect(progress.unlocked).toBe(false);
    });

    it('should mark as unlocked if achievement is in unlocked array', () => {
      const achievements = createPlayerAchievements({
        unlocked: ['streak-5'],
      });
      const achievement = getAchievementById('streak-5')!;

      const progress = getAchievementProgress(achievements, achievement);

      expect(progress.unlocked).toBe(true);
    });
  });

  describe('checkAchievements', () => {
    describe('streak achievements', () => {
      it('should unlock streak-3 after 3 correct answers', () => {
        let achievements = createPlayerAchievements();
        const event: AchievementEvent = { type: 'answer_correct', gameId: 'test-game' };

        // Answer 3 times correctly
        for (let i = 0; i < 3; i++) {
          const notifications = checkAchievements(achievements, event);
          achievements = loadAchievements();
          if (i === 2) {
            expect(notifications.some((n) => n.achievement.id === 'streak-3')).toBe(true);
          }
        }

        expect(achievements.unlocked).toContain('streak-3');
        expect(achievements.currentStreak).toBe(3);
      });

      it('should reset streak on incorrect answer', () => {
        const achievements = createPlayerAchievements({
          currentStreak: 2,
        });
        mockStorage._setStore({
          'kvenno-chemistry-achievements': JSON.stringify(achievements),
        });

        const event: AchievementEvent = { type: 'answer_incorrect', gameId: 'test-game' };
        checkAchievements(achievements, event);

        const loaded = loadAchievements();
        expect(loaded.currentStreak).toBe(0);
      });

      it('should track best streak', () => {
        let achievements = createPlayerAchievements({
          bestStreak: 2,
        });
        mockStorage._setStore({
          'kvenno-chemistry-achievements': JSON.stringify(achievements),
        });

        // Build a new streak
        const event: AchievementEvent = { type: 'answer_correct', gameId: 'test-game' };
        for (let i = 0; i < 4; i++) {
          checkAchievements(achievements, event);
          achievements = loadAchievements();
        }

        expect(achievements.bestStreak).toBe(4);
      });
    });

    describe('perfect_score achievements', () => {
      it('should unlock perfect-level-1 on 100% score', () => {
        const achievements = createPlayerAchievements();
        const event: AchievementEvent = {
          type: 'level_complete',
          gameId: 'test-game',
          level: 1,
          score: 100,
          maxScore: 100,
        };

        const notifications = checkAchievements(achievements, event);

        expect(notifications.some((n) => n.achievement.id === 'perfect-level-1')).toBe(true);
      });

      it('should not unlock perfect-level-1 on 99% score', () => {
        const achievements = createPlayerAchievements();
        const event: AchievementEvent = {
          type: 'level_complete',
          gameId: 'test-game',
          level: 1,
          score: 99,
          maxScore: 100,
        };

        const notifications = checkAchievements(achievements, event);

        expect(notifications.some((n) => n.achievement.id === 'perfect-level-1')).toBe(false);
      });

      it('should unlock level-specific perfect score for correct level', () => {
        const achievements = createPlayerAchievements();
        const event: AchievementEvent = {
          type: 'level_complete',
          gameId: 'test-game',
          level: 2,
          score: 50,
          maxScore: 50,
        };

        const notifications = checkAchievements(achievements, event);

        expect(notifications.some((n) => n.achievement.id === 'perfect-level-2')).toBe(true);
        expect(notifications.some((n) => n.achievement.id === 'perfect-level-1')).toBe(false);
      });
    });

    describe('high_score achievements', () => {
      it('should unlock high-scorer on 90+ score', () => {
        const achievements = createPlayerAchievements();
        const event: AchievementEvent = {
          type: 'level_complete',
          gameId: 'test-game',
          level: 1,
          score: 92,
        };

        const notifications = checkAchievements(achievements, event);

        expect(notifications.some((n) => n.achievement.id === 'high-scorer')).toBe(true);
      });

      it('should not unlock high-scorer on 89 score', () => {
        const achievements = createPlayerAchievements();
        const event: AchievementEvent = {
          type: 'level_complete',
          gameId: 'test-game',
          level: 1,
          score: 89,
        };

        const notifications = checkAchievements(achievements, event);

        expect(notifications.some((n) => n.achievement.id === 'high-scorer')).toBe(false);
      });
    });

    describe('speed achievements', () => {
      it('should unlock speed-demon for level under 60 seconds', () => {
        const achievements = createPlayerAchievements();
        const event: AchievementEvent = {
          type: 'level_complete',
          gameId: 'test-game',
          level: 1,
          timeTaken: 45,
        };

        const notifications = checkAchievements(achievements, event);

        expect(notifications.some((n) => n.achievement.id === 'speed-demon')).toBe(true);
      });

      it('should unlock lightning for level under 30 seconds', () => {
        const achievements = createPlayerAchievements();
        const event: AchievementEvent = {
          type: 'level_complete',
          gameId: 'test-game',
          level: 1,
          timeTaken: 25,
        };

        const notifications = checkAchievements(achievements, event);

        expect(notifications.some((n) => n.achievement.id === 'lightning')).toBe(true);
      });

      it('should not unlock speed achievements for slow completion', () => {
        const achievements = createPlayerAchievements();
        const event: AchievementEvent = {
          type: 'level_complete',
          gameId: 'test-game',
          level: 1,
          timeTaken: 120,
        };

        const notifications = checkAchievements(achievements, event);

        expect(notifications.some((n) => n.achievement.id === 'speed-demon')).toBe(false);
        expect(notifications.some((n) => n.achievement.id === 'lightning')).toBe(false);
      });
    });

    describe('level_complete achievements', () => {
      it('should unlock first-level-complete on level 1 completion', () => {
        const achievements = createPlayerAchievements();
        const event: AchievementEvent = {
          type: 'level_complete',
          gameId: 'test-game',
          level: 1,
        };

        const notifications = checkAchievements(achievements, event);

        expect(notifications.some((n) => n.achievement.id === 'first-level-complete')).toBe(true);
      });
    });

    describe('game_complete achievements', () => {
      it('should unlock game-complete on first game completion', () => {
        const achievements = createPlayerAchievements();
        const event: AchievementEvent = {
          type: 'game_complete',
          gameId: 'molmassi',
        };

        const notifications = checkAchievements(achievements, event);

        expect(notifications.some((n) => n.achievement.id === 'game-complete')).toBe(true);
      });

      it('should track total games completed', () => {
        const achievements = createPlayerAchievements();
        mockStorage._setStore({
          'kvenno-chemistry-achievements': JSON.stringify(achievements),
        });

        const event: AchievementEvent = {
          type: 'game_complete',
          gameId: 'molmassi',
        };

        checkAchievements(achievements, event);
        const loaded = loadAchievements();

        expect(loaded.totalGamesCompleted).toBe(1);
      });
    });

    describe('total_problems achievements', () => {
      it('should unlock problem-solver-10 after 10 correct answers', () => {
        let achievements = createPlayerAchievements({
          totalProblemsSolved: 9,
        });
        mockStorage._setStore({
          'kvenno-chemistry-achievements': JSON.stringify(achievements),
        });

        const event: AchievementEvent = { type: 'answer_correct', gameId: 'test-game' };
        const notifications = checkAchievements(achievements, event);

        expect(notifications.some((n) => n.achievement.id === 'problem-solver-10')).toBe(true);
      });
    });

    describe('daily_play achievements', () => {
      it('should track days played', () => {
        const achievements = createPlayerAchievements();
        mockStorage._setStore({
          'kvenno-chemistry-achievements': JSON.stringify(achievements),
        });

        const event: AchievementEvent = { type: 'answer_correct', gameId: 'test-game' };
        checkAchievements(achievements, event);

        const loaded = loadAchievements();
        const today = new Date().toISOString().split('T')[0];
        expect(loaded.daysPlayed).toContain(today);
      });

      it('should not duplicate days played on multiple events same day', () => {
        const today = new Date().toISOString().split('T')[0];
        const achievements = createPlayerAchievements({
          daysPlayed: [today],
        });
        mockStorage._setStore({
          'kvenno-chemistry-achievements': JSON.stringify(achievements),
        });

        const event: AchievementEvent = { type: 'answer_correct', gameId: 'test-game' };
        checkAchievements(achievements, event);

        const loaded = loadAchievements();
        expect(loaded.daysPlayed.filter((d) => d === today).length).toBe(1);
      });

      it('should unlock daily-player-3 after 3 days played', () => {
        const achievements = createPlayerAchievements({
          daysPlayed: ['2024-01-01', '2024-01-02'],
        });
        mockStorage._setStore({
          'kvenno-chemistry-achievements': JSON.stringify(achievements),
        });

        // Simulate playing on a new day (today)
        const event: AchievementEvent = { type: 'answer_correct', gameId: 'test-game' };
        const notifications = checkAchievements(achievements, event);

        expect(notifications.some((n) => n.achievement.id === 'daily-player-3')).toBe(true);
      });
    });

    describe('no_hints achievements', () => {
      it('should unlock no-hints for level completion without hints', () => {
        const achievements = createPlayerAchievements();
        const event: AchievementEvent = {
          type: 'level_complete',
          gameId: 'test-game',
          level: 1,
          hintsUsed: 0,
        };

        const notifications = checkAchievements(achievements, event);

        expect(notifications.some((n) => n.achievement.id === 'no-hints')).toBe(true);
      });

      it('should not unlock no-hints when hints were used', () => {
        const achievements = createPlayerAchievements();
        const event: AchievementEvent = {
          type: 'level_complete',
          gameId: 'test-game',
          level: 1,
          hintsUsed: 2,
        };

        const notifications = checkAchievements(achievements, event);

        expect(notifications.some((n) => n.achievement.id === 'no-hints')).toBe(false);
      });
    });

    describe('first_try achievements', () => {
      it('should track first try correct answers', () => {
        let achievements = createPlayerAchievements();
        mockStorage._setStore({
          'kvenno-chemistry-achievements': JSON.stringify(achievements),
        });

        const event: AchievementEvent = {
          type: 'answer_correct',
          gameId: 'test-game',
          firstAttempt: true,
        };

        // Answer correctly on first try 5 times
        for (let i = 0; i < 5; i++) {
          const notifications = checkAchievements(achievements, event);
          achievements = loadAchievements();
          if (i === 4) {
            expect(notifications.some((n) => n.achievement.id === 'first-try-master')).toBe(true);
          }
        }
      });

      it('should not count non-first-try answers', () => {
        const achievements = createPlayerAchievements();
        mockStorage._setStore({
          'kvenno-chemistry-achievements': JSON.stringify(achievements),
        });

        const event: AchievementEvent = {
          type: 'answer_correct',
          gameId: 'test-game',
          firstAttempt: false,
        };

        for (let i = 0; i < 10; i++) {
          checkAchievements(achievements, event);
        }

        const loaded = loadAchievements();
        expect(loaded.unlocked).not.toContain('first-try-master');
      });
    });

    describe('general behavior', () => {
      it('should not re-unlock already unlocked achievements', () => {
        const achievements = createPlayerAchievements({
          unlocked: ['streak-3'],
          totalPoints: 5,
        });
        mockStorage._setStore({
          'kvenno-chemistry-achievements': JSON.stringify(achievements),
        });

        // Trigger event that would normally unlock streak-3
        const event: AchievementEvent = { type: 'answer_correct', gameId: 'test-game' };
        for (let i = 0; i < 5; i++) {
          checkAchievements(loadAchievements(), event);
        }

        const loaded = loadAchievements();
        // Should still only have one instance of streak-3
        expect(loaded.unlocked.filter((id) => id === 'streak-3').length).toBe(1);
      });

      it('should add points when unlocking achievements', () => {
        const achievements = createPlayerAchievements();
        mockStorage._setStore({
          'kvenno-chemistry-achievements': JSON.stringify(achievements),
        });

        // Unlock streak-3 which gives 5 points
        const event: AchievementEvent = { type: 'answer_correct', gameId: 'test-game' };
        for (let i = 0; i < 3; i++) {
          checkAchievements(loadAchievements(), event);
        }

        const loaded = loadAchievements();
        expect(loaded.totalPoints).toBeGreaterThanOrEqual(5);
      });

      it('should return notification with isNew flag', () => {
        let achievements = createPlayerAchievements();
        mockStorage._setStore({
          'kvenno-chemistry-achievements': JSON.stringify(achievements),
        });

        const event: AchievementEvent = { type: 'answer_correct', gameId: 'test-game' };
        let notifications: { achievement: Achievement; isNew: boolean }[] = [];
        for (let i = 0; i < 3; i++) {
          notifications = checkAchievements(loadAchievements(), event);
        }

        const streak3Notification = notifications.find(
          (n) => n.achievement?.id === 'streak-3'
        );
        expect(streak3Notification?.isNew).toBe(true);
      });

      it('should save achievements after checking', () => {
        const achievements = createPlayerAchievements();

        const event: AchievementEvent = { type: 'answer_correct', gameId: 'test-game' };
        checkAchievements(achievements, event);

        expect(mockStorage.setItem).toHaveBeenCalled();
      });
    });
  });

  describe('getTotalPoints', () => {
    it('should return total points from achievements', () => {
      const achievements = createPlayerAchievements({
        totalPoints: 150,
      });

      expect(getTotalPoints(achievements)).toBe(150);
    });

    it('should return 0 for default achievements', () => {
      const achievements = createPlayerAchievements();

      expect(getTotalPoints(achievements)).toBe(0);
    });
  });

  describe('getUnlockedPercentage', () => {
    it('should return 0 when no achievements are unlocked', () => {
      const achievements = createPlayerAchievements();

      expect(getUnlockedPercentage(achievements)).toBe(0);
    });

    it('should calculate correct percentage', () => {
      // Unlock half the achievements
      const halfCount = Math.floor(ACHIEVEMENTS.length / 2);
      const unlockedIds = ACHIEVEMENTS.slice(0, halfCount).map((a) => a.id);

      const achievements = createPlayerAchievements({
        unlocked: unlockedIds,
      });

      const percentage = getUnlockedPercentage(achievements);
      expect(percentage).toBe(Math.round((halfCount / ACHIEVEMENTS.length) * 100));
    });

    it('should return 100 when all achievements are unlocked', () => {
      const allIds = ACHIEVEMENTS.map((a) => a.id);
      const achievements = createPlayerAchievements({
        unlocked: allIds,
      });

      expect(getUnlockedPercentage(achievements)).toBe(100);
    });
  });

  describe('getUnlockedAchievements', () => {
    it('should return empty array when no achievements are unlocked', () => {
      const achievements = createPlayerAchievements();

      expect(getUnlockedAchievements(achievements)).toEqual([]);
    });

    it('should return only unlocked achievements', () => {
      const achievements = createPlayerAchievements({
        unlocked: ['streak-3', 'perfect-level-1'],
      });

      const unlocked = getUnlockedAchievements(achievements);

      expect(unlocked.length).toBe(2);
      expect(unlocked.map((a) => a.id)).toContain('streak-3');
      expect(unlocked.map((a) => a.id)).toContain('perfect-level-1');
    });

    it('should return full achievement objects', () => {
      const achievements = createPlayerAchievements({
        unlocked: ['streak-3'],
      });

      const unlocked = getUnlockedAchievements(achievements);

      expect(unlocked[0]).toHaveProperty('id', 'streak-3');
      expect(unlocked[0]).toHaveProperty('name');
      expect(unlocked[0]).toHaveProperty('points');
    });
  });

  describe('getLockedAchievements', () => {
    it('should return all non-secret achievements when none are unlocked', () => {
      const achievements = createPlayerAchievements();

      const locked = getLockedAchievements(achievements);

      // Should include all achievements except secret ones
      const nonSecretCount = ACHIEVEMENTS.filter((a) => !a.secret).length;
      expect(locked.length).toBe(nonSecretCount);
    });

    it('should exclude unlocked achievements', () => {
      const achievements = createPlayerAchievements({
        unlocked: ['streak-3', 'streak-5'],
      });

      const locked = getLockedAchievements(achievements);

      expect(locked.map((a) => a.id)).not.toContain('streak-3');
      expect(locked.map((a) => a.id)).not.toContain('streak-5');
    });

    it('should exclude secret achievements', () => {
      const achievements = createPlayerAchievements();

      const locked = getLockedAchievements(achievements);

      // Verify no secret achievements are included
      for (const achievement of locked) {
        expect(achievement.secret).toBeFalsy();
      }
    });

    it('should include secret achievement after unlocking', () => {
      // Find a secret achievement
      const secretAchievement = ACHIEVEMENTS.find((a) => a.secret);
      if (!secretAchievement) {
        // Skip test if no secret achievements exist
        return;
      }

      const achievements = createPlayerAchievements({
        unlocked: [secretAchievement.id],
      });

      // Secret achievement should now be in unlocked list, not locked
      const unlocked = getUnlockedAchievements(achievements);
      expect(unlocked.map((a) => a.id)).toContain(secretAchievement.id);
    });
  });

  describe('resetAchievements', () => {
    it('should reset all achievements to default state', () => {
      const achievements = createPlayerAchievements({
        unlocked: ['streak-3', 'perfect-level-1'],
        totalPoints: 100,
        currentStreak: 5,
        bestStreak: 10,
        totalProblemsSolved: 50,
      });
      mockStorage._setStore({
        'kvenno-chemistry-achievements': JSON.stringify(achievements),
      });

      resetAchievements();

      const loaded = loadAchievements();
      expect(loaded.unlocked).toEqual([]);
      expect(loaded.totalPoints).toBe(0);
      expect(loaded.currentStreak).toBe(0);
      expect(loaded.bestStreak).toBe(0);
      expect(loaded.totalProblemsSolved).toBe(0);
    });

    it('should save the reset state', () => {
      resetAchievements();

      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'kvenno-chemistry-achievements',
        expect.any(String)
      );
    });
  });

  describe('integration', () => {
    it('should correctly track a full game session', () => {
      let achievements = createPlayerAchievements();
      mockStorage._setStore({
        'kvenno-chemistry-achievements': JSON.stringify(achievements),
      });

      // Player gets 5 correct answers in a row
      for (let i = 0; i < 5; i++) {
        checkAchievements(loadAchievements(), { type: 'answer_correct', gameId: 'test-game' });
      }

      // One wrong answer
      checkAchievements(loadAchievements(), { type: 'answer_incorrect', gameId: 'test-game' });

      // Complete level with good score
      checkAchievements(loadAchievements(), {
        type: 'level_complete',
        gameId: 'test-game',
        level: 1,
        score: 95,
        maxScore: 100,
        timeTaken: 45,
        hintsUsed: 0,
      });

      achievements = loadAchievements();

      // Verify expected state
      expect(achievements.currentStreak).toBe(0); // Reset after wrong answer
      expect(achievements.bestStreak).toBe(5);
      expect(achievements.totalProblemsSolved).toBe(5);
      expect(achievements.unlocked).toContain('streak-3');
      expect(achievements.unlocked).toContain('streak-5');
      expect(achievements.unlocked).toContain('high-scorer');
      expect(achievements.unlocked).toContain('speed-demon');
      expect(achievements.unlocked).toContain('no-hints');
      expect(achievements.unlocked).toContain('first-level-complete');
    });

    it('should persist and reload correctly', () => {
      // Set up some achievements
      const achievements = createPlayerAchievements({
        unlocked: ['streak-3', 'perfect-level-1'],
        totalPoints: 15,
        currentStreak: 2,
        bestStreak: 5,
        totalProblemsSolved: 25,
        daysPlayed: ['2024-01-01', '2024-01-02'],
      });
      mockStorage._setStore({
        'kvenno-chemistry-achievements': JSON.stringify(achievements),
      });

      // Load and verify
      const loaded = loadAchievements();

      expect(loaded.unlocked).toEqual(['streak-3', 'perfect-level-1']);
      expect(loaded.totalPoints).toBe(15);
      expect(loaded.currentStreak).toBe(2);
      expect(loaded.bestStreak).toBe(5);
      expect(loaded.totalProblemsSolved).toBe(25);
      expect(loaded.daysPlayed).toEqual(['2024-01-01', '2024-01-02']);

      // Continue session
      checkAchievements(loaded, { type: 'answer_correct', gameId: 'test-game' });

      // Verify updated
      const reloaded = loadAchievements();
      expect(reloaded.currentStreak).toBe(3);
      expect(reloaded.totalProblemsSolved).toBe(26);
    });
  });
});
