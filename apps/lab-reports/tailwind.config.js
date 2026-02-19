/** @type {import('tailwindcss').Config} */
import sharedPreset from '../../packages/shared/styles/tailwind-preset.ts';

export default {
  presets: [sharedPreset],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/shared/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
