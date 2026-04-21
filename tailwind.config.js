/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'void': '#080a0f',
        'abyss': '#0d1017',
        'pit': '#111827',
        'cave': '#1a2235',
        'steel': '#1f2d45',
        'slate': '#263550',
        'crimson': {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        'ember': '#ff6b35',
        'gold': '#fbbf24',
        'neon': '#22d3ee',
        'ghost': '#94a3b8',
        'mist': '#64748b',
      },
      fontFamily: {
        'display': ['"Rajdhani"', 'sans-serif'],
        'body': ['"Exo 2"', 'sans-serif'],
        'mono': ['"Share Tech Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slideIn': 'slideIn 0.3s ease-out',
        'fadeIn': 'fadeIn 0.3s ease-out',
        'scaleIn': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(239,68,68,0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(239,68,68,0.7), 0 0 40px rgba(239,68,68,0.3)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
