import React from 'react';

import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * Unified breadcrumb navigation for kvenno.app
 *
 * Takes an array of items. The last item (without href) is the current page.
 * Link color uses orange-700 for WCAG AA compliance on white backgrounds.
 *
 * Phones: the trail wraps rather than overflowing, and each link's tap area is
 * padded out to 44px tall (and 12px wider) with an equal negative margin, so the
 * target grows while the line keeps its 20px height and nothing shifts. md:
 * takes the padding off again, since it is also the box the keyboard focus ring
 * is drawn around, and on desktop that ring should stay snug to the word.
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav
      className="flex flex-wrap items-center gap-2 text-sm text-warm-500 mb-4"
      aria-label="Brauðmolar"
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight size={14} className="text-warm-400 shrink-0" />}
          {item.href ? (
            <a
              href={item.href}
              className="inline-flex items-center min-h-[44px] -my-3 px-1.5 -mx-1.5 md:min-h-0 md:my-0 md:px-0 md:mx-0 text-kvenno-orange-700 hover:text-kvenno-orange hover:underline no-underline transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-warm-800 font-medium" aria-current="page">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
