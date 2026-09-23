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
    // Phone notes. On a short landscape screen the header scrolls away rather
    // than holding 56 of ~360 px. Below `sm` the back link is the bare arrow,
    // so it is widened to a 44 px target and pulled left by the added
    // padding, which leaves the arrow exactly where it was; that padding
    // already spaces the title from the arrow, so the title's own is 4 px.
    // The title drops to 16 px. Together these keep every title that fitted
    // at 320 px beside the three 44 px flags fitting, e.g. Mólhugtakið.
    return (
      <header className="sticky top-0 z-50 bg-surface-raised shadow-sm [@media(max-height:500px)]:static">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <a
              href={backHref ?? '/'}
              className="flex items-center justify-center gap-2 text-sm font-medium text-warm-600 hover:text-kvenno-orange transition-colors min-h-[44px] min-w-[44px] -ml-[13px] sm:ml-0"
              aria-label={backLabel}
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">{backLabel}</span>
            </a>
            {gameTitle && (
              <h1 className="font-heading text-base sm:text-lg font-semibold text-warm-800 truncate px-1 sm:px-4">
                {gameTitle}
              </h1>
            )}
            <div className="flex items-center gap-2">{authSlot}</div>
          </div>
        </div>
      </header>
    );
  }

  // As in the game variant: on a short landscape screen the header scrolls
  // away rather than holding 64 of ~360 px, and on touch the logo link is a
  // 44 px tall target (mouse users keep the snug box and focus ring).
  return (
    <header className="sticky top-0 z-50 bg-surface-raised shadow-sm [@media(max-height:500px)]:static">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Home link */}
          <a
            href="/"
            className="font-heading text-xl font-bold text-kvenno-orange hover:text-kvenno-orange-600 transition-colors no-underline shrink-0 pointer-coarse:flex pointer-coarse:items-center pointer-coarse:min-h-11"
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
