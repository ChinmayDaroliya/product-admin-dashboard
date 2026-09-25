import type { Config } from 'tailwindcss';

// Design tokens for the admin dashboard. Chosen deliberately for a data/ops
// product: a quiet sage-neutral surface, a single deep-teal accent used
// sparingly for primary actions/focus, and a monospace face reserved for
// numeric data (prices, ids, counts) so tables read like real data, not prose.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F5F6F3',
        surface: '#FFFFFF',
        border: '#E3E6E0',
        ink: {
          900: '#1B231F',
          700: '#3A443E',
          500: '#5B665F',
          300: '#8C968F',
        },
        accent: {
          DEFAULT: '#2F6F5E',
          hover: '#255A4C',
          soft: '#E6EFEC',
        },
        danger: {
          DEFAULT: '#B3432B',
          soft: '#F6E7E2',
        },
        warn: {
          DEFAULT: '#9A6B08',
          soft: '#F5EEDB',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(27, 35, 31, 0.06)',
        pop: '0 8px 24px rgba(27, 35, 31, 0.12)',
      },
      borderRadius: {
        md: '8px',
        lg: '12px',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.4s linear infinite',
        'fade-in': 'fade-in 0.15s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
