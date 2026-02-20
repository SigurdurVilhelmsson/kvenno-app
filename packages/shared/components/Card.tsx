import React from 'react';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'interactive';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  children: React.ReactNode;
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-surface-raised rounded-card shadow-md',
  elevated: 'bg-surface-raised rounded-card shadow-lg',
  outlined: 'bg-surface-raised rounded-card border-[1.5px] border-warm-200',
  interactive:
    'bg-surface-raised rounded-card shadow-md hover:shadow-orange hover:-translate-y-0.5 transition-all duration-200 ease-out cursor-pointer',
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
