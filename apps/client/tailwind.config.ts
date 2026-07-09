import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'selector',
  theme: {
    extend: {
      colors: {
        bg: { primary: '#F8F9FB', secondary: '#FFFFFF', tertiary: '#F3F4F6', elevated: '#FFFFFF', input: '#F8F9FB', hover: '#F0F2F5' },
        text: { primary: '#111827', secondary: '#6B7280', tertiary: '#9CA3AF' },
        accent: { DEFAULT: '#2563EB', hover: '#1D4ED8', success: '#059669', danger: '#DC2626', warning: '#D97706', purple: '#7C3AED' },
        border: { DEFAULT: '#E5E7EB', light: '#F3F4F6' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'], mono: ['JetBrains Mono', 'Fira Code', 'monospace'] },
      animation: { 'float': 'float 20s ease-in-out infinite', 'spin-slow': 'spin 0.5s linear infinite' },
      keyframes: { float: { '0%,100%': { transform: 'translate(0,0) scale(1)' }, '33%': { transform: 'translate(40px,-20px) scale(1.05)' }, '66%': { transform: 'translate(-20px,15px) scale(0.95)' } } },
    },
  },
  plugins: [],
} satisfies Config;
