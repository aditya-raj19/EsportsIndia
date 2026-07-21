/** @type {import('tailwindcss').Config} */
export default {
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
      },
      colors: {
        primary: '#7C3AED',
        gold: '#F59E0B',
      },
    },
  },
  plugins: [],
}
