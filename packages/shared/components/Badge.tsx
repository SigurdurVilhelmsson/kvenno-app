import React from 'react';

export type BadgeVariant =
  | 'default'
  | 'orange'
  | 'level1'
  | 'level2'
  | 'level3'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-warm-100 text-warm-700',
  orange: 'bg-kvenno-orange-100 text-kvenno-orange-800',
  level1: 'bg-blue-100 text-blue-800',
  level2: 'bg-green-100 text-green-800',
  level3: 'bg-amber-100 text-amber-800',
  success: 'bg-success-light text-green-800',
  warning: 'bg-warning-light text-amber-800',
  error: 'bg-error-light text-red-800',
  info: 'bg-info-light text-blue-800',
};

export function Badge({
  variant = 'default',
  className = '',
  children,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
