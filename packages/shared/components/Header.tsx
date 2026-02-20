import React from 'react';

export type HeaderVariant = 'default' | 'islenskubraut';

interface HeaderProps {
  /** Header title — defaults to "Námsvefur Kvennó" */
  title?: string;
  /** Optional slot to render authentication UI (e.g., AuthButton from LabReports) */
  authSlot?: React.ReactNode;
  /** Optional callback for info button click */
  onInfoClick?: () => void;
  /** Visual variant — 'islenskubraut' uses a subtler style */
  variant?: HeaderVariant;
  /** Optional subtitle for islenskubraut variant */
  subtitle?: string;
}

/**
 * Unified site-wide header for kvenno.app
 *
 * Renders logo text with nav buttons.
 * Accepts an optional authSlot prop so apps like LabReports can inject their AuthButton.
 * Use variant="islenskubraut" for the Íslenskubraut app's subtler header style.
 */
export const Header: React.FC<HeaderProps> = ({
  title = 'Námsvefur Kvennó',
  authSlot,
  onInfoClick,
  variant = 'default',
  subtitle,
}) => {
  if (variant === 'islenskubraut') {
    return (
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/islenskubraut/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <span className="text-2xl">📚</span>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs text-slate-500 leading-tight">
                    {subtitle}
                  </p>
                )}
              </div>
            </a>
            <nav aria-label="Fletting" className="flex items-center gap-4">
              {authSlot}
              <a
                href="/islenskubraut/"
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Allir flokkar
              </a>
              <a
                href="/"
                className="text-sm text-kvenno-orange hover:opacity-80 transition-opacity"
              >
                Námsvefur Kvennó
              </a>
            </nav>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-kvenno-orange shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <a
          href="/"
          className="text-2xl font-bold text-kvenno-orange hover:opacity-80 transition-opacity no-underline"
        >
          {title}
        </a>

        <div className="flex items-center gap-3">
          {authSlot}
          <a
            href="/admin"
            className="px-4 py-2 border-2 border-kvenno-orange text-kvenno-orange rounded-btn font-medium hover:bg-kvenno-orange hover:text-white transition-all duration-300 no-underline"
          >
            Kennarar
          </a>
          {onInfoClick ? (
            <button
              onClick={onInfoClick}
              className="px-4 py-2 border-2 border-kvenno-orange text-kvenno-orange rounded-btn font-medium hover:bg-kvenno-orange hover:text-white transition-all duration-300 cursor-pointer"
            >
              Upplýsingar
            </button>
          ) : (
            <a
              href="/info"
              className="px-4 py-2 border-2 border-kvenno-orange text-kvenno-orange rounded-btn font-medium hover:bg-kvenno-orange hover:text-white transition-all duration-300 no-underline"
            >
              Upplýsingar
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
