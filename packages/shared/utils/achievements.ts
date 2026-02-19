/**
 * Achievement system utilities and predefined achievements
 */

import {
  Achievement,
  PlayerAchievements,
  AchievementProgress,
  AchievementEvent,
  AchievementNotification,
} from '../types/achievement.types';

const ACHIEVEMENTS_STORAGE_KEY = 'kvenno-chemistry-achievements';

/**
 * Predefined achievements available across all games
 */
export const ACHIEVEMENTS: Achievement[] = [
  // Performance achievements
  {
    id: 'perfect-level-1',
    name: 'Fullkominn byrjandi',
    description: 'Fáðu 100% á stigi 1',
    icon: '🌟',
    category: 'performance',
    rarity: 'uncommon',
    criteria: { type: 'perfect_score', target: 100, level: 1 },
    points: 10,
  },
  {
    id: 'perfect-level-2',
    name: 'Fullkominn framhaldsnemi',
    description: 'Fáðu 100% á stigi 2',
    icon: '⭐',
    category: 'performance',
    rarity: 'rare',
    criteria: { type: 'perfect_score', target: 100, level: 2 },
    points: 20,
  },
  {
    id: 'perfect-level-3',
    name: 'Fullkominn meistari',
    description: 'Fáðu 100% á stigi 3',
    icon: '🏆',
    category: 'performance',
    rarity: 'epic',
    criteria: { type: 'perfect_score', target: 100, level: 3 },
    points: 30,
  },
  {
    id: 'high-scorer',
    name: 'Hámarks stigamaður',
    description: 'Náðu 90+ stigum í einu stigi',
    icon: '📈',
    category: 'performance',
    rarity: 'uncommon',
    criteria: { type: 'high_score', target: 90 },
    points: 15,
  },

  // Streak achievements
  {
    id: 'streak-3',
    name: 'Þrefalt rétt',
    description: '3 rétt svör í röð',
    icon: '🔥',
    category: 'streak',
    rarity: 'common',
    criteria: { type: 'streak', target: 3 },
    points: 5,
  },
  {
    id: 'streak-5',
    name: 'Fimmfalt rétt',
    description: '5 rétt svör í röð',
    icon: '🔥',
    category: 'streak',
    rarity: 'uncommon',
    criteria: { type: 'streak', target: 5 },
    points: 10,
  },
  {
    id: 'streak-10',
    name: 'Óstöðvandi',
    description: '10 rétt svör í röð',
    icon: '💥',
    category: 'streak',
    rarity: 'rare',
    criteria: { type: 'streak', target: 10 },
    points: 25,
  },
  {
    id: 'streak-20',
    name: 'Eldfjall',
    description: '20 rétt svör í röð',
    icon: '🌋',
    category: 'streak',
    rarity: 'epic',
    criteria: { type: 'streak', target: 20 },
    points: 50,
  },

  // Speed achievements
  {
    id: 'speed-demon',
    name: 'Hraðfari',
    description: 'Ljúktu stigi á undir 60 sekúndum',
    icon: '⚡',
    category: 'speed',
    rarity: 'rare',
    criteria: { type: 'speed', target: 60 },
    points: 20,
  },
  {
    id: 'lightning',
    name: 'Eldingur',
    description: 'Ljúktu stigi á undir 30 sekúndum',
    icon: '⚡',
    category: 'speed',
    rarity: 'epic',
    criteria: { type: 'speed', target: 30 },
    points: 40,
  },

  // Mastery achievements
  {
    id: 'first-level-complete',
    name: 'Fyrsta stig lokið',
    description: 'Ljúktu stigi 1 í einhverjum leik',
    icon: '✅',
    category: 'mastery',
    rarity: 'common',
    criteria: { type: 'level_complete', target: 1, level: 1 },
    points: 5,
  },
  {
    id: 'game-complete',
    name: 'Leik lokið',
    description: 'Ljúktu öllum stigum í einum leik',
    icon: '🎮',
    category: 'mastery',
    rarity: 'uncommon',
    criteria: { type: 'game_complete', target: 1 },
    points: 15,
  },
  {
    id: 'five-games',
    name: 'Fimm leikir',
    description: 'Ljúktu 5 leikjum',
    icon: '🎯',
    category: 'mastery',
    rarity: 'rare',
    criteria: { type: 'total_games', target: 5 },
    points: 30,
  },
  {
    id: 'all-games',
    name: 'Allar leikvangur',
    description: 'Ljúktu öllum 18 leikjum',
    icon: '👑',
    category: 'mastery',
    rarity: 'legendary',
    criteria: { type: 'total_games', target: 18 },
    points: 100,
  },

  // Dedication achievements
  {
    id: 'problem-solver-10',
    name: 'Vandamálaleysir',
    description: 'Leystu 10 verkefni',
    icon: '🧩',
    category: 'dedication',
    rarity: 'common',
    criteria: { type: 'total_problems', target: 10 },
    points: 5,
  },
  {
    id: 'problem-solver-50',
    name: 'Duglegur nemandi',
    description: 'Leystu 50 verkefni',
    icon: '📚',
    category: 'dedication',
    rarity: 'uncommon',
    criteria: { type: 'total_problems', target: 50 },
    points: 15,
  },
  {
    id: 'problem-solver-100',
    name: 'Ákafur iðjumaður',
    description: 'Leystu 100 verkefni',
    icon: '🏅',
    category: 'dedication',
    rarity: 'rare',
    criteria: { type: 'total_problems', target: 100 },
    points: 30,
  },
  {
    id: 'problem-solver-500',
    name: 'Efnafræðingur',
    description: 'Leystu 500 verkefni',
    icon: '🔬',
    category: 'dedication',
    rarity: 'epic',
    criteria: { type: 'total_problems', target: 500 },
    points: 75,
  },
  {
    id: 'daily-player-3',
    name: 'Stöðugur nemandi',
    description: 'Spilaðu 3 daga',
    icon: '📅',
    category: 'dedication',
    rarity: 'uncommon',
    criteria: { type: 'daily_play', target: 3 },
    points: 10,
  },
  {
    id: 'daily-player-7',
    name: 'Vikuflakkari',
    description: 'Spilaðu 7 daga',
    icon: '📆',
    category: 'dedication',
    rarity: 'rare',
    criteria: { type: 'daily_play', target: 7 },
    points: 25,
  },

  // Special achievements
  {
    id: 'first-try-master',
    name: 'Rétt í fyrstu',
    description: 'Svaraðu 5 spurningum rétt í fyrstu tilraun',
    icon: '🎯',
    category: 'special',
    rarity: 'rare',
    criteria: { type: 'first_try', target: 5 },
    points: 20,
  },
  {
    id: 'no-hints',
    name: 'Án hjálpar',
    description: 'Ljúktu stigi án þess að nota vísbendingar',
    icon: '💪',
    category: 'special',
    rarity: 'uncommon',
    criteria: { type: 'no_hints', target: 1 },
    points: 15,
  },
  {
    id: 'comeback-king',
    name: 'Aftur á sporin',
    description: 'Batnaðu úr 50% eða lægra í 80%+ í sama stigi',
    icon: '🦅',
    category: 'special',
    rarity: 'rare',
    criteria: { type: 'high_score', target: 80 },
    points: 25,
    secret: true,
  },
];

/**
 * Get default player achievements state
 */
export function getDefaultPlayerAchievements(): PlayerAchievements {
  return {
    unlocked: [],
    progress: {},
    totalPoints: 0,
    currentStreak: 0,
    bestStreak: 0,
    daysPlayed: [],
    totalProblemsSolved: 0,
    totalGamesCompleted: 0,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Load player achievements from localStorage
 */
export function loadAchievements(): PlayerAchievements {
  try {
    const saved = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate basic structure
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.unlocked)) {
        return {
          ...getDefaultPlayerAchievements(),
          ...parsed,
        };
      }
    }
  } catch (error) {
    console.error('Failed to load achievements:', error);
  }
  return getDefaultPlayerAchievements();
}

/**
 * Save player achievements to localStorage
 */
export function saveAchievements(achievements: PlayerAchievements): void {
  try {
    achievements.lastUpdated = new Date().toISOString();
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(achievements));
  } catch (error) {
    console.error('Failed to save achievements:', error);
  }
}

/**
 * Get an achievement by ID
 */
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

/**
 * Check if an achievement is unlocked
 */
export function isAchievementUnlocked(achievements: PlayerAchievements, achievementId: string): boolean {
  return achievements.unlocked.includes(achievementId);
}

/**
 * Get progress for an achievement
 */
export function getAchievementProgress(
  achievements: PlayerAchievements,
  achievement: Achievement
): AchievementProgress {
  const existing = achievements.progress[achievement.id];
  if (existing) {
    return existing;
  }

  return {
    achievementId: achievement.id,
    currentValue: 0,
    targetValue: achievement.criteria.target,
    unlocked: isAchievementUnlocked(achievements, achievement.id),
  };
}

/**
 * Calculate which achievements should be unlocked based on an event
 */
export function checkAchievements(
  current: PlayerAchievements,
  event: AchievementEvent
): AchievementNotification[] {
  const notifications: AchievementNotification[] = [];
  const updated = { ...current };

  // Update daily play
  const today = new Date().toISOString().split('T')[0];
  if (!updated.daysPlayed.includes(today)) {
    updated.daysPlayed = [...updated.daysPlayed, today];
  }

  // Handle different event types
  switch (event.type) {
    case 'answer_correct':
      updated.currentStreak += 1;
      updated.bestStreak = Math.max(updated.bestStreak, updated.currentStreak);
      updated.totalProblemsSolved += 1;
      break;

    case 'answer_incorrect':
      updated.currentStreak = 0;
      break;

    case 'level_complete':
      // Check for level completion achievements
      break;

    case 'game_complete':
      updated.totalGamesCompleted += 1;
      break;
  }

  // Check each achievement
  for (const achievement of ACHIEVEMENTS) {
    // Skip already unlocked
    if (updated.unlocked.includes(achievement.id)) {
      continue;
    }

    let unlocked = false;
    let progressValue = 0;

    switch (achievement.criteria.type) {
      case 'streak':
        progressValue = updated.currentStreak;
        unlocked = updated.currentStreak >= achievement.criteria.target;
        break;

      case 'perfect_score':
        if (event.type === 'level_complete' && event.score !== undefined && event.maxScore) {
          const percentage = (event.score / event.maxScore) * 100;
          if (
            percentage >= 100 &&
            (!achievement.criteria.level || achievement.criteria.level === event.level)
          ) {
            unlocked = true;
            progressValue = 100;
          }
        }
        break;

      case 'high_score':
        if (event.type === 'level_complete' && event.score !== undefined) {
          progressValue = event.score;
          unlocked = event.score >= achievement.criteria.target;
        }
        break;

      case 'speed':
        if (event.type === 'level_complete' && event.timeTaken !== undefined) {
          progressValue = event.timeTaken;
          unlocked = event.timeTaken <= achievement.criteria.target;
        }
        break;

      case 'level_complete':
        if (event.type === 'level_complete') {
          progressValue = 1;
          unlocked =
            !achievement.criteria.level || achievement.criteria.level === event.level;
        }
        break;

      case 'game_complete':
        progressValue = updated.totalGamesCompleted;
        unlocked = updated.totalGamesCompleted >= achievement.criteria.target;
        break;

      case 'total_problems':
        progressValue = updated.totalProblemsSolved;
        unlocked = updated.totalProblemsSolved >= achievement.criteria.target;
        break;

      case 'total_games':
        progressValue = updated.totalGamesCompleted;
        unlocked = updated.totalGamesCompleted >= achievement.criteria.target;
        break;

      case 'daily_play':
        progressValue = updated.daysPlayed.length;
        unlocked = updated.daysPlayed.length >= achievement.criteria.target;
        break;

      case 'no_hints':
        if (event.type === 'level_complete' && event.hintsUsed === 0) {
          unlocked = true;
          progressValue = 1;
        }
        break;

      case 'first_try':
        if (event.type === 'answer_correct' && event.firstAttempt) {
          const firstTryCount = (updated.progress[achievement.id]?.currentValue || 0) + 1;
          progressValue = firstTryCount;
          unlocked = firstTryCount >= achievement.criteria.target;
        }
        break;
    }

    // Update progress
    updated.progress[achievement.id] = {
      achievementId: achievement.id,
      currentValue: progressValue,
      targetValue: achievement.criteria.target,
      unlocked,
      unlockedAt: unlocked ? new Date().toISOString() : undefined,
    };

    // Add notification if newly unlocked
    if (unlocked) {
      updated.unlocked.push(achievement.id);
      updated.totalPoints += achievement.points;
      notifications.push({
        achievement,
        unlockedAt: new Date().toISOString(),
        isNew: true,
      });
    }
  }

  // Save updated state
  saveAchievements(updated);

  return notifications;
}

/**
 * Get player's total achievement points
 */
export function getTotalPoints(achievements: PlayerAchievements): number {
  return achievements.totalPoints;
}

/**
 * Get percentage of achievements unlocked
 */
export function getUnlockedPercentage(achievements: PlayerAchievements): number {
  return Math.round((achievements.unlocked.length / ACHIEVEMENTS.length) * 100);
}

/**
 * Get all unlocked achievements
 */
export function getUnlockedAchievements(achievements: PlayerAchievements): Achievement[] {
  return ACHIEVEMENTS.filter((a) => achievements.unlocked.includes(a.id));
}

/**
 * Get all locked achievements (excluding secret ones)
 */
export function getLockedAchievements(achievements: PlayerAchievements): Achievement[] {
  return ACHIEVEMENTS.filter(
    (a) => !achievements.unlocked.includes(a.id) && !a.secret
  );
}

/**
 * Reset all achievements
 */
export function resetAchievements(): void {
  saveAchievements(getDefaultPlayerAchievements());
}
