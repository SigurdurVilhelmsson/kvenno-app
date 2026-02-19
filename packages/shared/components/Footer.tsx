import React from 'react';

interface FooterProps {
  /** Optional department name (e.g., "Efnafræðideild"). Omit for generic site footer. */
  department?: string;
}

/**
 * Unified site-wide footer for kvenno.app
 */
export const Footer: React.FC<FooterProps> = ({ department }) => {
  return (
    <footer className="text-center py-8 text-gray-500 text-sm">
      <p>
        &copy; {new Date().getFullYear()} Kvennaskólinn í Reykjavík
        {department && ` — ${department}`}
      </p>
    </footer>
  );
};
