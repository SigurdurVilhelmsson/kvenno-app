import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/shared/components/**/*.{js,ts,jsx,tsx}',
    '../../packages/shared/styles/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'kvenno-orange': {
          DEFAULT: '#f36b22',
          dark: '#d95a1a',
          light: '#ff8c4d',
        },
        dyr: '#2D6A4F',
        matur: '#E76F51',
        farartaeki: '#264653',
        manneskja: '#7B2CBF',
        stadir: '#C1121F',
        klaednadur: '#F4A261',
      },
      fontFamily: {
        sans: ['Source Sans 3', 'Noto Sans', 'sans-serif'],
        serif: ['Lora', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
