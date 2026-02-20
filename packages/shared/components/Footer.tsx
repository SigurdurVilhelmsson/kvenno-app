import React from 'react';

export type FooterVariant = 'default' | 'islenskubraut';

interface FooterProps {
  /** Optional department name (e.g., "Efnafræðideild"). Omit for generic site footer. */
  department?: string;
  /** Visual variant — 'islenskubraut' uses a bordered style with subtitle */
  variant?: FooterVariant;
  /** Optional subtitle for islenskubraut variant */
  subtitle?: string;
}

/**
 * Unified site-wide footer for kvenno.app
 */
export const Footer: React.FC<FooterProps> = ({ department, variant = 'default', subtitle }) => {
  if (variant === 'islenskubraut') {
    return (
      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-slate-500">
            <p className="font-medium">Íslenskubraut — Kvennaskólinn í Reykjavík</p>
            {subtitle && <p className="mt-1">{subtitle}</p>}
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="text-center py-8 text-slate-500 text-sm">
      <p>
        &copy; {new Date().getFullYear()} Kvennaskólinn í Reykjavík
        {department && ` — ${department}`}
      </p>
    </footer>
  );
};
