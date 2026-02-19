/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/shared/components/**/*.{js,ts,jsx,tsx}",
    "../../packages/shared/styles/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kvenno-orange': {
          DEFAULT: '#f36b22',
          dark: '#d95a1a',
          light: '#ff8c4d',
        },
      },
    },
  },
  plugins: [],
};
