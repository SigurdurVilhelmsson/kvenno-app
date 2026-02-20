import React from 'react';

interface FooterProps {
  /** Optional department name (e.g., "Efnafræðideild"). */
  department?: string;
  /** Optional subtitle line below the main text. */
  subtitle?: string;
}

/**
 * Unified site-wide footer for kvenno.app.
 * Single variant — consistent across all apps including Íslenskubraut.
 */
export const Footer: React.FC<FooterProps> = ({ department, subtitle }) => {
  return (
    <footer className="mt-16 border-t border-warm-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-sm text-warm-500">
          <p className="font-medium">
            &copy; {new Date().getFullYear()} Kvennaskólinn í Reykjavík
            {department && ` — ${department}`}
          </p>
          {subtitle && <p className="mt-1">{subtitle}</p>}
        </div>
      </div>
    </footer>
  );
};
