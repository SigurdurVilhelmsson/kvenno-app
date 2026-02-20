/**
 * Shared Tailwind CSS preset for the kvenno.app design system.
 * All apps extend this preset in their tailwind.config.js.
 */
export default {
  theme: {
    extend: {
      colors: {
        'kvenno-orange': {
          DEFAULT: '#f36b22',
          dark: '#c55113',
          light: '#ff8c4d',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          "'Segoe UI'",
          'Arial',
          'sans-serif',
        ],
      },
      maxWidth: {
        container: '1200px',
      },
      borderRadius: {
        btn: '8px',
        card: '12px',
      },
      boxShadow: {
        card: '0 2px 4px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 12px rgba(243, 107, 34, 0.3)',
      },
      transitionDuration: {
        DEFAULT: '300ms',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
};
