import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  as?: 'button' | 'a';
  href?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-kvenno-orange text-white hover:bg-kvenno-orange-600 active:bg-kvenno-orange-700',
  secondary:
    'border-[1.5px] border-kvenno-orange text-kvenno-orange-700 hover:bg-kvenno-orange-50 active:bg-kvenno-orange-100',
  ghost:
    'text-warm-700 hover:bg-warm-100 active:bg-warm-200',
  outline:
    'border-[1.5px] border-warm-300 text-warm-700 hover:bg-warm-50 hover:border-warm-400 active:bg-warm-100',
  danger:
    'bg-error text-white hover:bg-red-700 active:bg-red-800',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm min-h-[36px]',
  md: 'px-4 py-2.5 text-base min-h-[44px]',
  lg: 'px-6 py-3.5 text-lg min-h-[52px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  as = 'button',
  href,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  const classes = [
    'inline-flex items-center justify-center gap-2 font-medium rounded-btn transition-all duration-200 ease-out',
    variantClasses[variant],
    sizeClasses[size],
    disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (as === 'a' && href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
