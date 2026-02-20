/**
 * kvenno.app design system tokens — TypeScript exports
 *
 * See DESIGN_SYSTEM.md for full specification.
 */

export const colors = {
  // Brand orange scale
  orange: {
    50: '#fff7f0',
    100: '#ffead8',
    200: '#ffd4b0',
    300: '#ffb678',
    400: '#ff9545',
    500: '#f36b22', // THE brand color
    600: '#d35a15',
    700: '#b04510', // WCAG AA compliant for text on white
    800: '#8c370d',
    900: '#6a2a0a',
  },

  // Warm neutrals (replaces cold slate)
  warm: {
    50: '#faf9f7',
    100: '#f5f3f0',
    200: '#e8e4df',
    300: '#d4cec7',
    400: '#a69d93',
    500: '#7a7168',
    600: '#5c534a',
    700: '#443d36',
    800: '#2e2823',
    900: '#1c1813',
  },

  // Semantic colors
  success: '#16a34a',
  successLight: '#dcfce7',
  warning: '#d97706',
  warningLight: '#fef3c7',
  error: '#dc2626',
  errorLight: '#fee2e2',
  info: '#2563eb',
  infoLight: '#dbeafe',

  // Surfaces
  surface: {
    page: '#faf9f7',
    raised: '#ffffff',
    sunken: '#f5f3f0',
  },

  // Legacy aliases
  primary: '#f36b22',
  primaryDark: '#d35a15',
  primaryLight: '#ff8c4d',
  white: '#ffffff',
  black: '#000000',

  // High contrast mode
  highContrast: {
    bg: '#000000',
    text: '#ffffff',
    border: '#ffff00',
    focus: '#ffff00',
  },
};

/** Íslenskubraut category colors */
export const categoryColors = {
  dyr: '#2d6a4f',
  matur: '#92400e',
  fartaeki: '#1e40af',
  manneskja: '#9a3412',
  stadir: '#5b21b6',
  klaednadur: '#0e7490',
} as const;

export type CategoryId = keyof typeof categoryColors;

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
  sm: '6px',
  md: '10px', // buttons, inputs
  lg: '14px', // cards, modals
  xl: '20px', // large feature cards
  full: '9999px', // pills, avatars
};

export const fontSize = {
  small: {
    xs: '0.625rem',
    sm: '0.75rem',
    base: '0.875rem',
    lg: '1rem',
    xl: '1.125rem',
    '2xl': '1.25rem',
  },
  medium: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
  },
  large: {
    xs: '0.875rem',
    sm: '1rem',
    base: '1.125rem',
    lg: '1.25rem',
    xl: '1.5rem',
    '2xl': '1.875rem',
  },
};

export const shadows = {
  sm: '0 1px 2px rgba(28, 24, 19, 0.06)',
  md: '0 2px 8px rgba(28, 24, 19, 0.08)',
  lg: '0 4px 16px rgba(28, 24, 19, 0.10)',
  xl: '0 8px 24px rgba(28, 24, 19, 0.12)',
  orange: '0 4px 14px rgba(243, 107, 34, 0.20)',
  inner: 'inset 0 2px 4px rgba(28, 24, 19, 0.06)',
};

export const transitions = {
  fast: '100ms ease-out',
  normal: '200ms ease-out',
  slow: '300ms ease-out',
};

/**
 * Year-based accent color themes
 *
 * Year 1 (1-ar): Orange — Kvennaskólinn brand identity
 * Year 2 (2-ar): Teal — Fresh, progressing
 * Year 3 (3-ar): Violet — Advanced, sophisticated
 */
export const yearThemes = {
  '1-ar': {
    gradient: 'bg-gradient-to-br from-kvenno-orange-50 to-kvenno-orange-100',
    gradientFrom: 'from-kvenno-orange-50',
    gradientTo: 'to-kvenno-orange-100',
    primary: 'orange',
    accent: '#f36b22',
    accentLight: '#fff7f0',
    primaryBg: 'bg-kvenno-orange',
    primaryBgHover: 'hover:bg-kvenno-orange-600',
    primaryText: 'text-kvenno-orange',
    primaryTextDark: 'text-kvenno-orange-700',
    primaryBorder: 'border-kvenno-orange-400',
    primaryBorderHover: 'hover:border-kvenno-orange',
    primaryLight: 'bg-kvenno-orange-50',
    primaryLightHover: 'hover:bg-kvenno-orange-100',
    pedagogicalBg: 'bg-kvenno-orange-50',
    pedagogicalBorder: 'border-kvenno-orange-200',
    pedagogicalText: 'text-kvenno-orange-900',
    pedagogicalTitle: 'text-kvenno-orange-800',
  },
  '2-ar': {
    gradient: 'bg-gradient-to-br from-teal-50 to-cyan-100',
    gradientFrom: 'from-teal-50',
    gradientTo: 'to-cyan-100',
    primary: 'teal',
    accent: '#0d9488',
    accentLight: '#f0fdfa',
    primaryBg: 'bg-teal-600',
    primaryBgHover: 'hover:bg-teal-700',
    primaryText: 'text-teal-600',
    primaryTextDark: 'text-teal-800',
    primaryBorder: 'border-teal-400',
    primaryBorderHover: 'hover:border-teal-500',
    primaryLight: 'bg-teal-50',
    primaryLightHover: 'hover:bg-teal-100',
    pedagogicalBg: 'bg-teal-50',
    pedagogicalBorder: 'border-teal-200',
    pedagogicalText: 'text-teal-900',
    pedagogicalTitle: 'text-teal-800',
  },
  '3-ar': {
    gradient: 'bg-gradient-to-br from-violet-50 to-indigo-100',
    gradientFrom: 'from-violet-50',
    gradientTo: 'to-indigo-100',
    primary: 'violet',
    accent: '#7c3aed',
    accentLight: '#f5f3ff',
    primaryBg: 'bg-violet-600',
    primaryBgHover: 'hover:bg-violet-700',
    primaryText: 'text-violet-600',
    primaryTextDark: 'text-violet-800',
    primaryBorder: 'border-violet-400',
    primaryBorderHover: 'hover:border-violet-500',
    primaryLight: 'bg-violet-50',
    primaryLightHover: 'hover:bg-violet-100',
    pedagogicalBg: 'bg-violet-50',
    pedagogicalBorder: 'border-violet-200',
    pedagogicalText: 'text-violet-900',
    pedagogicalTitle: 'text-violet-800',
  },
} as const;

export type YearTheme = keyof typeof yearThemes;

/**
 * Level colors for consistent level distinction within games
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
  categoryColors,
  spacing,
  borderRadius,
  fontSize,
  shadows,
  transitions,
  yearThemes,
  levelColors,
};

export default theme;
