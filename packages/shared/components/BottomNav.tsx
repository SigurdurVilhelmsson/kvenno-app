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
 * Pages should add `pb-[72px] md:pb-0` to their content when this is rendered.
 */
export function BottomNav({ activeTab, className = '' }: BottomNavProps) {
  return (
    <nav
      aria-label="Aðalfletting"
      className={`fixed bottom-0 left-0 right-0 z-50 bg-surface-raised border-t border-warm-200 md:hidden ${className}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
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
                  : 'text-warm-400 hover:text-warm-600',
              ].join(' ')}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={22} className={isActive ? 'text-kvenno-orange' : undefined} />
              <span className="text-[11px] font-medium leading-tight">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
