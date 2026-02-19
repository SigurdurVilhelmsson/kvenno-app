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
 * Always starts with "Heim" linking to "/".
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4" aria-label="Brauðmolar">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight size={16} className="text-gray-400" />}
          {item.href ? (
            <a href={item.href} className="text-kvenno-orange hover:underline no-underline">
              {item.label}
            </a>
          ) : (
            <span className="text-gray-900 font-medium" aria-current="page">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
