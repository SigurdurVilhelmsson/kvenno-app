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
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 text-sm text-warm-500 mb-4" aria-label="Brauðmolar">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight size={14} className="text-warm-400 shrink-0" />}
          {item.href ? (
            <a href={item.href} className="text-kvenno-orange-700 hover:text-kvenno-orange hover:underline no-underline transition-colors">
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
