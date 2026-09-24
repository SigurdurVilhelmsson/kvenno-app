import React from 'react';

import { Home, FlaskConical, BookOpen } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.FC<{ size?: number; className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Heim', href: '/', icon: Home },
  { id: 'efnafraedi', label: 'Efnafræði', href: '/efnafraedi', icon: FlaskConical },
  { id: 'islenskubraut', label: 'Íslenskubraut', href: '/islenskubraut/', icon: BookOpen },
];

/** Clears the home indicator on phones that have one; shared by the bar and its spacer. */
const SAFE_AREA_PADDING = 'pb-[env(safe-area-inset-bottom,0px)]';

export interface BottomNavProps {
  /** Which tab is currently active */
  activeTab?: string;
  /** Additional class names */
  className?: string;
}

/**
 * Mobile bottom tab bar for kvenno.app.
 *
 * Shown only below md: breakpoint (< 768px).
 * Provides thumb-reachable navigation between the 3 main sections.
 *
 * Render it last on the page, after the footer. It brings its own in-flow
 * spacer, the bar's height plus the home-indicator inset, so the last thing
 * on the page (the footer) can always scroll clear of the bar. Padding the
 * page's `<main>` instead does not do this, since the footer comes after it.
 *
 * On a short landscape screen (height ≤ 500px) a fixed bar and the sticky
 * header together would hold a third of the screen, so the bar drops into
 * the flow at the end of the page instead and the spacer goes away.
 */
export function BottomNav({ activeTab, className = '' }: BottomNavProps) {
  return (
    <>
      <div
        aria-hidden="true"
        data-testid="bottom-nav-spacer"
        className={`box-content h-14 ${SAFE_AREA_PADDING} md:hidden [@media(max-height:500px)]:hidden`}
      />
      <nav
        aria-label="Aðalfletting"
        className={`fixed bottom-0 left-0 right-0 z-50 bg-surface-raised border-t border-warm-200 ${SAFE_AREA_PADDING} md:hidden [@media(max-height:500px)]:static ${className}`}
      >
        <div className="flex items-center justify-around h-14">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                href={item.href}
                className={[
                  'flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[44px] px-3 py-1.5 rounded-lg transition-colors no-underline',
                  isActive
                    ? 'text-kvenno-orange bg-kvenno-orange-50'
                    : 'text-warm-500 hover:text-warm-600',
                ].join(' ')}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={22} className={isActive ? 'text-kvenno-orange' : undefined} />
                <span className="text-xs font-medium leading-tight">{item.label}</span>
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}
