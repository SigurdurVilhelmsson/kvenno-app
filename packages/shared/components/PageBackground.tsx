import React from 'react';

import { yearThemes, type YearTheme } from '../styles/theme';

export type PageBackgroundVariant = 'default' | 'subtle' | YearTheme;

export interface PageBackgroundProps {
  variant?: PageBackgroundVariant;
  className?: string;
  children: React.ReactNode;
}

const staticVariants: Record<string, string> = {
  default: 'bg-slate-50',
  subtle: 'bg-gradient-to-br from-slate-50 to-slate-100',
};

export function PageBackground({
  variant = 'default',
  className = '',
  children,
}: PageBackgroundProps) {
  const bgClass =
    staticVariants[variant] ??
    yearThemes[variant as YearTheme]?.gradient ??
    staticVariants.default;

  return (
    <div className={`min-h-screen ${bgClass} ${className}`}>
      {children}
    </div>
  );
}
