import React from 'react';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'interactive';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  children: React.ReactNode;
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-white rounded-xl shadow-card',
  elevated: 'bg-white rounded-xl shadow-elevated',
  outlined: 'bg-white rounded-xl border-2 border-slate-200',
  interactive:
    'bg-white rounded-xl shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer',
};

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  variant = 'default',
  padding = 'md',
  className = '',
  children,
  ...rest
}: CardProps) {
  return (
    <div className={`${variantClasses[variant]} ${paddingClasses[padding]} ${className}`} {...rest}>
      {children}
    </div>
  );
}
