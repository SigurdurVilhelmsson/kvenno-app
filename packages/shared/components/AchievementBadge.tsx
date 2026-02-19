import {
  Achievement,
  AchievementProgress,
  RARITY_COLORS,
  RARITY_LABELS,
} from '../types/achievement.types';

interface AchievementBadgeProps {
  achievement: Achievement;
  progress?: AchievementProgress;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  onClick?: () => void;
}

/**
 * Individual achievement badge component
 */
export function AchievementBadge({
  achievement,
  progress,
  size = 'md',
  showProgress = true,
  onClick,
}: AchievementBadgeProps) {
  const isUnlocked = progress?.unlocked ?? false;
  const colors = RARITY_COLORS[achievement.rarity];

  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  const containerClasses = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
  };

  return (
    <div
      className={`flex items-center ${containerClasses[size]} ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* Badge icon */}
      <div
        className={`
          ${sizeClasses[size]}
          ${isUnlocked ? colors.bg : 'bg-gray-200'}
          ${isUnlocked ? colors.border : 'border-gray-300'}
          border-2 rounded-full flex items-center justify-center
          ${isUnlocked ? '' : 'grayscale opacity-50'}
          transition-all
        `}
      >
        <span className={isUnlocked ? '' : 'opacity-30'}>
          {achievement.icon}
        </span>
      </div>

      {/* Badge info */}
      <div className="flex-1 min-w-0">
        <div className={`font-semibold truncate ${isUnlocked ? colors.text : 'text-gray-500'}`}>
          {achievement.secret && !isUnlocked ? '???' : achievement.name}
        </div>
        <div className="text-xs text-gray-500 truncate">
          {achievement.secret && !isUnlocked
            ? 'Leynilegt afrek'
            : achievement.description}
        </div>

        {/* Progress bar */}
        {showProgress && progress && !isUnlocked && (
          <div className="mt-1">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${colors.bg.replace('100', '400')} transition-all`}
                style={{
                  width: `${Math.min(100, (progress.currentValue / progress.targetValue) * 100)}%`,
                }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {progress.currentValue} / {progress.targetValue}
            </div>
          </div>
        )}

        {/* Unlocked info */}
        {isUnlocked && (
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs ${colors.text}`}>
              +{achievement.points} stig
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
              {RARITY_LABELS[achievement.rarity]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
