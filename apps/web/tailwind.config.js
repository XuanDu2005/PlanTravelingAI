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
          '"Plus Jakarta Sans"',
          '"Outfit"',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        outfit: ['"Outfit"', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      fontWeight: {
        // Bump every weight by one step so the whole app feels thicker
        // and consistent without changing any markup.
        thin: '200',
        extralight: '300',
        light: '400',
        normal: '500',
        medium: '600',
        semibold: '700',
        bold: '800',
        extrabold: '900',
        black: '900',
      },
      boxShadow: {
        card: '0 10px 30px -10px rgba(20, 40, 90, 0.18)',
        cardDark: '0 10px 30px -10px rgba(0, 0, 0, 0.6)',
      },
      keyframes: {
        'toast-slide-in': {
          '0%': { opacity: '0', transform: 'translateY(16px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'toast-slide-in': 'toast-slide-in 320ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};