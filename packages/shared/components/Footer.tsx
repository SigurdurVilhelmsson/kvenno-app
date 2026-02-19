import React from 'react';

/**
 * Unified site-wide footer for kvenno.app
 */
export const Footer: React.FC = () => {
  return (
    <footer className="text-center py-8 text-gray-500 text-sm">
      <p>&copy; {new Date().getFullYear()} Kvennaskólinn í Reykjavík - Efnafræðideild</p>
    </footer>
  );
};
