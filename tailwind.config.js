/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#13b6ec',
        'background-light': '#f6f8f8',
        'background-dark': '#111827',
        'card-dark': '#1f2937',
        'border-dark': '#374151',
        'input-focus': '#13b6ec',
      },
      fontFamily: {
        display: ['Lexend', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
      },
      boxShadow: {
        glow: '0 0 15px rgba(19, 182, 236, 0.2)',
      },
      keyframes: {
        'ws-correct-pop': {
          '0%': { transform: 'scale(1)', filter: 'brightness(1)' },
          '40%': { transform: 'scale(1.04)', filter: 'brightness(1.15)' },
          '100%': { transform: 'scale(1)', filter: 'brightness(1)' },
        },
      },
      animation: {
        'ws-correct-pop': 'ws-correct-pop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
