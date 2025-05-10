/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // allow scanning CSS files for @apply directives
    "./src/**/*.css",
  ],
  theme: {
    extend: {
      colors: {
        tuik: {
          50: '#e6f0ff',
          100: '#cce0ff',
          500: '#3b82f6',
          600: '#1e40af',
          700: '#1e3a8a',
        },
        enag: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        ito: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}