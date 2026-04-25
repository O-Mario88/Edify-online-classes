/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Maple brand — kept consistent with the web app's #0F2A45 navy.
        maple: {
          50:  '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#486581',
          700: '#334E68',
          800: '#1F3A5F',
          900: '#0F2A45',
        },
        accent: {
          warning: '#F59E0B',
          success: '#10B981',
          danger:  '#EF4444',
          info:    '#6366F1',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
