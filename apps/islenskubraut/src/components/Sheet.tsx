import type { ReactNode } from 'react';

import { Category, Level } from '../data/types';

/** The printed card's pages, in the PDF's order. The tabs and the sheets follow it. */
export const PAGES = ['Orðaforði', 'Setningarammar', 'Spurningaspjald'] as const;
export type PageTitle = (typeof PAGES)[number];

interface SheetProps {
  category: Category;
  level: Level;
  page: PageTitle;
  testId?: string;
  children: ReactNode;
}

/**
 * One A4 page of the printed card, as `server/src/lib/islenskubraut-pdf.tsx` draws it: the
 * coloured header with the level, the page's content, and the footer.
 *
 * The A4 ratio is a minimum, not a box: content that would run past the page grows the sheet
 * rather than scrolling inside it, so the preview never hides what the PDF prints. The build
 * refuses a card that runs onto a fourth page, so in practice each sheet holds its content.
 */
export function Sheet({ category, level, page, testId, children }: SheetProps) {
  const number = PAGES.indexOf(page) + 1;
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Bls. {number} af {PAGES.length} · {page}
      </h3>
      <div
        data-testid={testId}
        className="bg-white rounded-2xl shadow-lg border-2 flex flex-col"
        style={{ borderColor: category.color, aspectRatio: '210/297' }}
      >
        <div
          className="px-6 py-4 text-white rounded-t-xl"
          style={{ backgroundColor: category.color }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl" aria-hidden="true">
                {category.icon}
              </span>
              <h2 className="font-heading text-2xl font-bold uppercase tracking-wide">
                {category.name}
              </h2>
            </div>
            <span
              className="bg-white px-3 py-1 rounded-full text-sm font-bold"
              style={{ color: category.color }}
            >
              {level}
            </span>
          </div>
        </div>

        <div className="p-4 flex-1">{children}</div>

        <p className="px-4 py-2 text-center text-xs text-gray-500 border-t border-gray-100">
          Íslenskubraut — Kvennaskólinn í Reykjavík — {category.name} {level}
        </p>
      </div>
    </div>
  );
}
