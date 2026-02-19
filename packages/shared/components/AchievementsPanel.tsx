import { useState } from 'react';
import {
  Achievement,
  AchievementCategory,
  PlayerAchievements,
  RARITY_COLORS,
} from '../types/achievement.types';
import { getAchievementProgress } from '../utils/achievements';
import { AchievementBadge } from './AchievementBadge';

interface AchievementsPanelProps {
  achievements: PlayerAchievements;
  allAchievements: Achievement[];
  onClose?: () => void;
  onReset?: () => void;
}

const CATEGORY_LABELS: Record<AchievementCategory, { label: string; icon: string }> = {
  performance: { label: 'Frammistaða', icon: '⭐' },
  streak: { label: 'Röð', icon: '🔥' },
  speed: { label: 'Hraði', icon: '⚡' },
  mastery: { label: 'Leikni', icon: '🎮' },
  dedication: { label: 'Hollusta', icon: '📚' },
  special: { label: 'Sérstök', icon: '🎯' },
};

/**
 * Full achievements panel with categories and progress
 */
export function AchievementsPanel({
  achievements,
  allAchievements,
  onClose,
  onReset,
}: AchievementsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');

  const filteredAchievements =
    selectedCategory === 'all'
      ? allAchievements
      : allAchievements.filter((a) => a.category === selectedCategory);

  const unlockedCount = achievements.unlocked.length;
  const totalCount = allAchievements.filter((a) => !a.secret || achievements.unlocked.includes(a.id)).length;
  const percentage = Math.round((unlockedCount / allAchievements.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                🏆 Afrek
              </h2>
              <p className="text-yellow-100 text-sm mt-1">
                {unlockedCount} / {totalCount} opnuð ({percentage}%)
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white text-2xl transition-colors"
                aria-label="Loka"
              >
                ×
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-3 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/20 rounded-lg p-2">
              <div className="text-2xl font-bold">{achievements.totalPoints}</div>
              <div className="text-xs text-yellow-100">Stig</div>
            </div>
            <div className="bg-white/20 rounded-lg p-2">
              <div className="text-2xl font-bold">{achievements.bestStreak}</div>
              <div className="text-xs text-yellow-100">Besta röð</div>
            </div>
            <div className="bg-white/20 rounded-lg p-2">
              <div className="text-2xl font-bold">{achievements.totalProblemsSolved}</div>
              <div className="text-xs text-yellow-100">Verkefni</div>
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 p-2 bg-gray-100 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-white shadow text-gray-800'
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            Allt
          </button>
          {(Object.keys(CATEGORY_LABELS) as AchievementCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-white shadow text-gray-800'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              {CATEGORY_LABELS[cat].icon} {CATEGORY_LABELS[cat].label}
            </button>
          ))}
        </div>

        {/* Achievements list */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {filteredAchievements.map((achievement) => {
              const progress = getAchievementProgress(achievements, achievement);
              const isUnlocked = achievements.unlocked.includes(achievement.id);

              // Hide secret achievements that aren't unlocked
              if (achievement.secret && !isUnlocked) {
                return null;
              }

              return (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    isUnlocked
                      ? `${RARITY_COLORS[achievement.rarity].bg} ${RARITY_COLORS[achievement.rarity].border}`
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <AchievementBadge
                    achievement={achievement}
                    progress={progress}
                    size="md"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
          <div className="text-sm text-gray-500">
            🔥 Núverandi röð: {achievements.currentStreak}
          </div>
          {onReset && (
            <button
              onClick={() => {
                if (window.confirm('Ertu viss um að þú viljir endurstilla öll afrek?')) {
                  onReset();
                }
              }}
              className="text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              Endurstilla
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface AchievementsButtonProps {
  achievements: PlayerAchievements;
  onClick: () => void;
}

/**
 * Compact button to open achievements panel
 */
export function AchievementsButton({ achievements, onClick }: AchievementsButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 bg-yellow-100 hover:bg-yellow-200 border-2 border-yellow-400 rounded-xl transition-colors"
      title="Skoða afrek"
    >
      <span className="text-lg">🏆</span>
      <span className="font-semibold text-yellow-800">{achievements.totalPoints}</span>
      {achievements.currentStreak > 0 && (
        <span className="flex items-center gap-1 text-sm text-orange-600">
          🔥 {achievements.currentStreak}
        </span>
      )}
    </button>
  );
}
