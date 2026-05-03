/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        mono:  ['DM Mono', 'monospace'],
      },
      colors: {
        void:   '#080808',
        ash:    '#111111',
        smoke:  '#1a1a1a',
        ember:  '#c9a84c',
        wax:    '#d4502a',
        feather:'#7eb89a',
        bone:   '#e8e0d0',
        mist:   '#666666',
      },
      animation: {
        'flicker': 'flicker 3s ease-in-out infinite',
        'rise':    'rise 0.6s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: 1 },
          '50%':      { opacity: 0.85 },
        },
        rise: {
          '0%':   { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}