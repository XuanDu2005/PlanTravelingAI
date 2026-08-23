/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7ff',
          100: '#d9ecff',
          200: '#bcdeff',
          300: '#8ec8ff',
          400: '#59a8ff',
          500: '#2f87ff',
          600: '#1867f0',
          700: '#1552d6',
          800: '#1845ad',
          900: '#193e89',
        },
        ink: {
          900: '#0c1424',
          800: '#16203a',
          700: '#1f2a4a',
          500: '#3a4b75',
          300: '#7a8bb6',
          100: '#e5ecf8',
        },
        surface: {
          0: '#ffffff',
          50: '#f7f9fc',
          100: '#1a2138',
          200: '#11182c',
          300: '#0a1020',
          400: '#070c1a',
        },
      },
      fontFamily: {
        sans: [
          '"Segoe UI"',
          '"Segoe UI Semibold"',
          'system-ui',
          '-apple-system',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 10px 30px -10px rgba(20, 40, 90, 0.18)',
        cardDark: '0 10px 30px -10px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
};