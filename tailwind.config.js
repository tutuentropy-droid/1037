/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        accent: {
          purple: '#a855f7',
          amber: '#f59e0b',
          emerald: '#10b981',
          rose: '#f43f5e',
          cyan: '#06b6d4',
        }
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        retro: ['"VT323"', 'monospace'],
      },
      animation: {
        'tile-appear': 'tileAppear 0.3s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.4s ease-out backwards',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'breathe': 'breathe 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
