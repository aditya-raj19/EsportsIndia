/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        eb: {
          bg: '#0B0E14',
          surface: '#141824',
          surface2: '#1B2030',
          border: '#262C3E',
          ink: '#EDEEF2',
          muted: '#8B93A7',
          amber: '#00D9C0', // Changed to Cyan per user preference for dark mode
          cyan: '#00D9C0',
          crimson: '#FF3B5C'
        },
        primary: '#FFB020', // Mapping old primary to amber to avoid breaking other un-refactored pages entirely
        gold: '#FFB020',
      },
    },
  },
  plugins: [],
}
