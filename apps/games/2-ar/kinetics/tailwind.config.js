/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-orange': '#f36b22',
        'dark-orange': '#d95a1a',
      },
    },
  },
  plugins: [],
}
