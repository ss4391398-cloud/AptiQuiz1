/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eef6ff', 100: '#d9ecff', 200: '#bcdfff', 300: '#8ecbff',
          400: '#59abff', 500: '#3389fc', 600: '#1d6bf0', 700: '#1654de',
          800: '#1944b4', 900: '#1a3e8e', 950: '#142755',
        },
        accent: {
          50: '#fff8ed', 100: '#ffefd4', 200: '#ffdba8', 300: '#ffc070',
          400: '#ff9a37', 500: '#ff7d11', 600: '#f06208', 700: '#c74a09',
          800: '#9e3a0f', 900: '#7e3110', 950: '#441706',
        },
        success: {
          50: '#edfcf0', 100: '#d3f8db', 200: '#aaf0ba', 300: '#72e289',
          400: '#3ccd56', 500: '#22b43f', 600: '#179232', 700: '#157329',
          800: '#155a25', 900: '#134b22', 950: '#082910',
        },
        warning: {
          50: '#fffbeb', 100: '#fff3c4', 200: '#fce58a', 300: '#fad24b',
          400: '#fabc1f', 500: '#f29a08', 600: '#d57606', 700: '#b0530a',
          800: '#90410e', 900: '#76370f', 950: '#431e04',
        },
        error: {
          50: '#fef3f2', 100: '#fee4e2', 200: '#fecdca', 300: '#fda29b',
          400: '#f97066', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
          800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'pulse-ring': 'pulseRing 1.5s ease-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { '0%': { opacity: '0', transform: 'translateX(24px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        pulseRing: { '0%': { boxShadow: '0 0 0 0 rgba(51,137,252,0.4)' }, '100%': { boxShadow: '0 0 0 20px rgba(51,137,252,0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
};
