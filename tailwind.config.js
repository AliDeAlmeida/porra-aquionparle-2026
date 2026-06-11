/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        nuit: '#0B1437',
        marine: '#16204D',
        marine2: '#1F2C5C',
        or: '#F5B62E',
        espagne: '#E63946',
        france: '#2D6CDF',
        vert: '#2DBE6C',
        craie: '#F7F4ED',
        tribune: '#8E97B8',
      },
      fontFamily: {
        display: ['Archivo Black', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      keyframes: {
        stamp: {
          '0%': { transform: 'scale(1.1)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245,182,46,0.5)' },
          '50%': { boxShadow: '0 0 0 12px rgba(245,182,46,0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-6px)' },
          '75%': { transform: 'translateX(6px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        stamp: 'stamp 0.5s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'pulse-gold': 'pulse-gold 2.5s infinite',
        shake: 'shake 0.3s ease-in-out',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
