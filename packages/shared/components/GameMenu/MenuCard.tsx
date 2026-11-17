import type { ComponentPropsWithRef, ReactNode } from 'react';

/**
 * Where a card sits on a game's menu. The colour follows the position, so a student
 * meets the same colour at the same place in every game: Nærmynd (or the game's own
 * explore step) amber, then the sections blue, green, purple and orange, whatever
 * each game calls them (Stig 1–3, Kanna/Skilja/Æfa/Beita). Siggi's ruling,
 * 2026-11-17: one card look, each game keeps its own section names.
 */
export type MenuCardTone = 'naermynd' | 1 | 2 | 3 | 4;

const TONES: Record<MenuCardTone, { card: string; title: string; subtitle: string }> = {
  naermynd: {
    card: 'border-amber-400 bg-amber-50 hover:bg-amber-100',
    title: 'text-amber-900',
    subtitle: 'text-amber-800',
  },
  1: {
    card: 'border-blue-400 bg-blue-50 hover:bg-blue-100',
    title: 'text-blue-800',
    subtitle: 'text-blue-600',
  },
  2: {
    card: 'border-green-400 bg-green-50 hover:bg-green-100',
    title: 'text-green-800',
    subtitle: 'text-green-700',
  },
  3: {
    card: 'border-purple-400 bg-purple-50 hover:bg-purple-100',
    title: 'text-purple-800',
    subtitle: 'text-purple-600',
  },
  4: {
    card: 'border-orange-400 bg-orange-50 hover:bg-orange-100',
    title: 'text-orange-800',
    subtitle: 'text-orange-700',
  },
};

export interface MenuCardProps extends Omit<ComponentPropsWithRef<'button'>, 'title'> {
  tone: MenuCardTone;
  /** An emoji, shown beside the text and hidden from screen readers. */
  icon: string;
  /** "Stig 1: Skilningur", "Kanna", "Nærmynd". */
  title: ReactNode;
  /** One line under the title. */
  subtitle?: ReactNode;
  /** A sentence or two on what the section does. */
  description?: ReactNode;
  /**
   * The section's result once done — "6 af 8 rétt", or "Lokið" where a section cannot
   * end wrong — shown as a green chip beside the title. Nothing before it is done.
   */
  result?: string | null;
}

/**
 * One section of a game's menu, as pH Títrun draws it: a tinted card with a coloured
 * border, an emoji, the title with its result chip, a subtitle and a description.
 * The whole card is the button that opens the section.
 */
export function MenuCard({
  tone,
  icon,
  title,
  subtitle,
  description,
  result,
  className = '',
  type = 'button',
  ...button
}: MenuCardProps) {
  const t = TONES[tone];
  return (
    <button
      type={type}
      {...button}
      className={`game-card w-full p-4 sm:p-6 phone:p-3 rounded-xl border-4 ${t.card} transition-all text-left cursor-pointer ${className}`}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="text-3xl sm:text-4xl phone:text-2xl" aria-hidden="true">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={`text-xl font-bold phone:text-lg ${t.title}`}>{title}</span>
            {result && (
              <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                ✓ {result}
              </span>
            )}
          </div>
          {subtitle && <div className={`text-sm mt-1 ${t.subtitle}`}>{subtitle}</div>}
          {description && (
            <div className="text-xs text-warm-600 mt-2 phone:mt-1">{description}</div>
          )}
        </div>
      </div>
    </button>
  );
}
