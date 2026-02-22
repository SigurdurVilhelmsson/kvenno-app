import React from 'react';

import { FlaskConical, BookOpen, ArrowLeft } from 'lucide-react';

export type HeaderVariant = 'default' | 'game';

interface TrackTab {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const TRACKS: TrackTab[] = [
  { id: 'efnafraedi', label: 'Efnafræði', href: '/efnafraedi', icon: <FlaskConical size={18} /> },
  {
    id: 'islenskubraut',
    label: 'Íslenskubraut',
    href: '/islenskubraut/',
    icon: <BookOpen size={18} />,
  },
];

interface HeaderProps {
  /** Header title — defaults to "Námsvefur Kvennó" */
  title?: string;
  /** Optional slot to render authentication UI (e.g., AuthButton from lab-reports) */
  authSlot?: React.ReactNode;
  /** Optional callback for info button click */
  onInfoClick?: () => void;
  /** Visual variant — 'game' uses a slim header with back link */
  variant?: HeaderVariant;
  /** Active track ID for highlighting the current tab */
  activeTrack?: string;
  /** Back link URL (used in game variant) */
  backHref?: string;
  /** Back link label (used in game variant) */
  backLabel?: string;
  /** Game title (shown in center for game variant) */
  gameTitle?: string;
}

/**
 * Unified site-wide header for kvenno.app
 *
 * Default variant: Logo left, track tabs center, utility links right.
 * Game variant: Back link left, game title center, tools right.
 */
export const Header: React.FC<HeaderProps> = ({
  title = 'Námsvefur Kvennó',
  authSlot,
  onInfoClick,
  variant = 'default',
  activeTrack,
  backHref,
  backLabel = 'Til baka',
  gameTitle,
}) => {
  if (variant === 'game') {
    return (
      <header className="sticky top-0 z-50 bg-surface-raised shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <a
              href={backHref ?? '/'}
              className="flex items-center gap-2 text-sm font-medium text-warm-600 hover:text-kvenno-orange transition-colors min-h-[44px]"
              aria-label={backLabel}
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">{backLabel}</span>
            </a>
            {gameTitle && (
              <h1 className="font-heading text-lg font-semibold text-warm-800 truncate px-4">
                {gameTitle}
              </h1>
            )}
            <div className="flex items-center gap-2">{authSlot}</div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-surface-raised shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Home link */}
          <a
            href="/"
            className="font-heading text-xl font-bold text-kvenno-orange hover:text-kvenno-orange-600 transition-colors no-underline shrink-0"
          >
            {title}
          </a>

          {/* Track tabs (hidden on mobile — BottomNav handles it) */}
          <nav aria-label="Svið" className="hidden md:flex items-center gap-1">
            {TRACKS.map((track) => {
              const isActive = activeTrack === track.id;
              return (
                <a
                  key={track.id}
                  href={track.href}
                  className={[
                    'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors no-underline min-h-[44px]',
                    isActive
                      ? 'text-kvenno-orange bg-kvenno-orange-50'
                      : 'text-warm-500 hover:text-warm-700 hover:bg-warm-50',
                  ].join(' ')}
                  aria-current={isActive ? 'true' : undefined}
                >
                  {track.icon}
                  {track.label}
                </a>
              );
            })}
          </nav>

          {/* Utility links */}
          <div className="flex items-center gap-2">
            {authSlot}
            {onInfoClick && (
              <button
                onClick={onInfoClick}
                className="px-3 py-2 text-sm font-medium text-warm-600 hover:text-warm-800 hover:bg-warm-50 rounded-md transition-colors cursor-pointer min-h-[44px]"
              >
                Upplýsingar
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
