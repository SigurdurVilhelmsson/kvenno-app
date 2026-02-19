import type { Config } from 'tailwindcss';

import sharedPreset from '../../packages/shared/styles/tailwind-preset.ts';

const config: Config = {
  presets: [sharedPreset],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/shared/components/**/*.{js,ts,jsx,tsx}',
    '../../packages/shared/styles/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
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
