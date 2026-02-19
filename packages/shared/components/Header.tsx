import React from 'react';

interface HeaderProps {
  /** Optional slot to render authentication UI (e.g., AuthButton from LabReports) */
  authSlot?: React.ReactNode;
  /** Optional callback for info button click */
  onInfoClick?: () => void;
}

/**
 * Unified site-wide header for kvenno.app
 *
 * Renders "Efnafræðivefur Kvennó" logo with "Kennarar" and "Upplýsingar" buttons.
 * Accepts an optional authSlot prop so apps like LabReports can inject their AuthButton.
 */
export const Header: React.FC<HeaderProps> = ({ authSlot, onInfoClick }) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-kvenno-orange shadow-sm">
      <div className="max-w-[1200px] mx-auto px-8 py-4 flex items-center justify-between">
        <a
          href="/"
          className="text-2xl font-bold text-kvenno-orange hover:opacity-80 transition-opacity no-underline"
        >
          Efnafræðivefur Kvennó
        </a>

        <div className="flex items-center gap-3">
          {authSlot}
          <a
            href="/admin"
            className="px-6 py-2 border-2 border-kvenno-orange text-kvenno-orange rounded-lg font-medium hover:bg-kvenno-orange hover:text-white transition-all duration-300 no-underline"
          >
            Kennarar
          </a>
          {onInfoClick ? (
            <button
              onClick={onInfoClick}
              className="px-6 py-2 border-2 border-kvenno-orange text-kvenno-orange rounded-lg font-medium hover:bg-kvenno-orange hover:text-white transition-all duration-300 cursor-pointer"
            >
              Upplýsingar
            </button>
          ) : (
            <a
              href="/info"
              className="px-6 py-2 border-2 border-kvenno-orange text-kvenno-orange rounded-lg font-medium hover:bg-kvenno-orange hover:text-white transition-all duration-300 no-underline"
            >
              Upplýsingar
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
