/**
 * Kvennaskólinn brand colors and theme configuration
 */

export const colors = {
  // Primary brand colors
  primary: '#f36b22',
  primaryDark: '#c55113',
  primaryLight: '#ff8c4d',

  // Semantic colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Neutral colors
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  black: '#000000',

  // High contrast mode
  highContrast: {
    bg: '#000000',
    text: '#ffffff',
    border: '#ffff00',
    focus: '#ffff00',
  },
};

export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
};

export const borderRadius = {
  none: '0',
  sm: '0.125rem', // 2px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  full: '9999px',
};

export const fontSize = {
  small: {
    xs: '0.625rem', // 10px
    sm: '0.75rem', // 12px
    base: '0.875rem', // 14px
    lg: '1rem', // 16px
    xl: '1.125rem', // 18px
    '2xl': '1.25rem', // 20px
  },
  medium: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
  },
  large: {
    xs: '0.875rem', // 14px
    sm: '1rem', // 16px
    base: '1.125rem', // 18px
    lg: '1.25rem', // 20px
    xl: '1.5rem', // 24px
    '2xl': '1.875rem', // 30px
  },
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '300ms ease-in-out',
  slow: '500ms ease-in-out',
};

/**
 * Generate CSS variables for theme
 */
export const generateCSSVariables = (): string => {
  return `
    :root {
      --color-primary: ${colors.primary};
      --color-primary-dark: ${colors.primaryDark};
      --color-primary-light: ${colors.primaryLight};

      --color-success: ${colors.success};
      --color-warning: ${colors.warning};
      --color-error: ${colors.error};
      --color-info: ${colors.info};

      --spacing-xs: ${spacing.xs};
      --spacing-sm: ${spacing.sm};
      --spacing-md: ${spacing.md};
      --spacing-lg: ${spacing.lg};
      --spacing-xl: ${spacing.xl};

      --radius-sm: ${borderRadius.sm};
      --radius-md: ${borderRadius.md};
      --radius-lg: ${borderRadius.lg};

      --transition-fast: ${transitions.fast};
      --transition-normal: ${transitions.normal};
      --transition-slow: ${transitions.slow};
    }

    .high-contrast {
      --bg-primary: ${colors.highContrast.bg};
      --bg-secondary: ${colors.white};
      --text-primary: ${colors.highContrast.text};
      --text-secondary: ${colors.black};
      --border-color: ${colors.highContrast.border};
      --focus-color: ${colors.highContrast.focus};
    }

    .reduced-motion * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  `;
};

/**
 * Year-based color themes for consistent styling across games
 *
 * Year 1 (1-ar): Orange/Amber - Kvennaskólinn brand identity
 * Year 2 (2-ar): Teal/Cyan - Distinct from Year 1, fresh and engaging
 * Year 3 (3-ar): Purple/Indigo - Advanced, sophisticated appearance
 */
export const yearThemes = {
  '1-ar': {
    // Background gradient: from-orange-50 to-amber-100
    gradient: 'bg-gradient-to-br from-orange-50 to-amber-100',
    gradientFrom: 'from-orange-50',
    gradientTo: 'to-amber-100',
    // Primary accent color
    primary: 'orange',
    primaryBg: 'bg-orange-500',
    primaryBgHover: 'hover:bg-orange-600',
    primaryText: 'text-orange-600',
    primaryTextDark: 'text-orange-800',
    primaryBorder: 'border-orange-400',
    primaryBorderHover: 'hover:border-orange-500',
    primaryLight: 'bg-orange-50',
    primaryLightHover: 'hover:bg-orange-100',
    // Pedagogical section
    pedagogicalBg: 'bg-orange-50',
    pedagogicalBorder: 'border-orange-200',
    pedagogicalText: 'text-orange-900',
    pedagogicalTitle: 'text-orange-800',
  },
  '2-ar': {
    // Background gradient: from-teal-50 to-cyan-100
    gradient: 'bg-gradient-to-br from-teal-50 to-cyan-100',
    gradientFrom: 'from-teal-50',
    gradientTo: 'to-cyan-100',
    // Primary accent color
    primary: 'teal',
    primaryBg: 'bg-teal-500',
    primaryBgHover: 'hover:bg-teal-600',
    primaryText: 'text-teal-600',
    primaryTextDark: 'text-teal-800',
    primaryBorder: 'border-teal-400',
    primaryBorderHover: 'hover:border-teal-500',
    primaryLight: 'bg-teal-50',
    primaryLightHover: 'hover:bg-teal-100',
    // Pedagogical section
    pedagogicalBg: 'bg-teal-50',
    pedagogicalBorder: 'border-teal-200',
    pedagogicalText: 'text-teal-900',
    pedagogicalTitle: 'text-teal-800',
  },
  '3-ar': {
    // Background gradient: from-purple-50 to-indigo-100
    gradient: 'bg-gradient-to-br from-purple-50 to-indigo-100',
    gradientFrom: 'from-purple-50',
    gradientTo: 'to-indigo-100',
    // Primary accent color
    primary: 'purple',
    primaryBg: 'bg-purple-500',
    primaryBgHover: 'hover:bg-purple-600',
    primaryText: 'text-purple-600',
    primaryTextDark: 'text-purple-800',
    primaryBorder: 'border-purple-400',
    primaryBorderHover: 'hover:border-purple-500',
    primaryLight: 'bg-purple-50',
    primaryLightHover: 'hover:bg-purple-100',
    // Pedagogical section
    pedagogicalBg: 'bg-purple-50',
    pedagogicalBorder: 'border-purple-200',
    pedagogicalText: 'text-purple-900',
    pedagogicalTitle: 'text-purple-800',
  },
} as const;

export type YearTheme = keyof typeof yearThemes;

/**
 * Level colors for consistent level distinction within games
 * These are used across all years for level 1, 2, 3 buttons
 */
export const levelColors = {
  level1: {
    bg: 'bg-blue-50',
    bgHover: 'hover:bg-blue-100',
    border: 'border-blue-400',
    borderHover: 'hover:border-blue-500',
    text: 'text-blue-600',
    textDark: 'text-blue-800',
    badge: 'bg-blue-500',
  },
  level2: {
    bg: 'bg-green-50',
    bgHover: 'hover:bg-green-100',
    border: 'border-green-400',
    borderHover: 'hover:border-green-500',
    text: 'text-green-600',
    textDark: 'text-green-800',
    badge: 'bg-green-500',
  },
  level3: {
    bg: 'bg-amber-50',
    bgHover: 'hover:bg-amber-100',
    border: 'border-amber-400',
    borderHover: 'hover:border-amber-500',
    text: 'text-amber-600',
    textDark: 'text-amber-800',
    badge: 'bg-amber-500',
  },
} as const;

export const theme = {
  colors,
  spacing,
  borderRadius,
  fontSize,
  shadows,
  transitions,
  yearThemes,
  levelColors,
};

export default theme;
