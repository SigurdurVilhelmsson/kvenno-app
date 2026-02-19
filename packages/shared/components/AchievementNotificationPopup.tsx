import { useEffect, useState } from 'react';
import {
  AchievementNotification,
  RARITY_COLORS,
  RARITY_LABELS,
} from '../types/achievement.types';

interface AchievementNotificationPopupProps {
  notification: AchievementNotification;
  onDismiss: () => void;
  autoDismissMs?: number;
}

/**
 * Popup notification for newly unlocked achievement
 */
export function AchievementNotificationPopup({
  notification,
  onDismiss,
  autoDismissMs = 5000,
}: AchievementNotificationPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const { achievement } = notification;
  const colors = RARITY_COLORS[achievement.rarity];

  useEffect(() => {
    // Animate in
    const showTimer = setTimeout(() => setIsVisible(true), 50);

    // Auto dismiss
    const dismissTimer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(onDismiss, 300);
    }, autoDismissMs);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [autoDismissMs, onDismiss]);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div
        className={`
          ${colors.bg} ${colors.border}
          border-2 rounded-xl shadow-2xl p-4 max-w-sm
          backdrop-blur-sm
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎉</span>
            <span className={`font-bold ${colors.text}`}>Afrek opnað!</span>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Loka"
          >
            ×
          </button>
        </div>

        {/* Achievement */}
        <div className="flex items-center gap-4">
          <div
            className={`
              w-16 h-16 ${colors.bg} ${colors.border}
              border-2 rounded-full flex items-center justify-center text-3xl
              animate-bounce
            `}
          >
            {achievement.icon}
          </div>
          <div className="flex-1">
            <div className={`font-bold text-lg ${colors.text}`}>
              {achievement.name}
            </div>
            <div className="text-sm text-gray-600">
              {achievement.description}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-sm font-semibold ${colors.text}`}>
                +{achievement.points} stig
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                {RARITY_LABELS[achievement.rarity]}
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar animation */}
        <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-1000`}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
}

interface AchievementNotificationsContainerProps {
  notifications: AchievementNotification[];
  onDismiss: (achievementId: string) => void;
}

/**
 * Container for multiple achievement notifications
 */
export function AchievementNotificationsContainer({
  notifications,
  onDismiss,
}: AchievementNotificationsContainerProps) {
  // Only show the first notification at a time
  const currentNotification = notifications[0];

  if (!currentNotification) {
    return null;
  }

  return (
    <AchievementNotificationPopup
      key={currentNotification.achievement.id}
      notification={currentNotification}
      onDismiss={() => onDismiss(currentNotification.achievement.id)}
    />
  );
}
