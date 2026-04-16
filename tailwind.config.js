/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0B0B0F',
        surface: '#141418',
        accent: '#7C5CFF',
        accentSoft: '#A493FF',
        paper: '#F8F9FB',
        cardLight: '#FFFFFF',
      },
      boxShadow: {
        glow: '0 24px 80px rgba(124, 92, 255, 0.35)',
        soft: '0 20px 60px rgba(15, 23, 42, 0.12)',
      },
      fontFamily: {
        sans: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 600ms ease-out',
        'pulse-glow': 'pulseGlow 2.2s ease-in-out infinite',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};