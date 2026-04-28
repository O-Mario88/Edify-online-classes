/**
 * Maple mobile Tailwind config.
 *
 * Mirrors src/theme/colors.ts so a class like `bg-bronze-200` and
 * `colors.brand.accent` resolve to the same hex. Keep these two files
 * in sync — when a palette token shifts, update both.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Maple navy — primary brand. Tailwind name stays `maple` for
        // backwards-compat with the existing call sites.
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
        bronze: {
          50:  '#FBF5EE',
          100: '#F4E6D6',
          200: '#E8C9A4',
          300: '#DDB078',
          400: '#C99352',
          500: '#B86E3C',
          600: '#9A5A30',
          700: '#7C4724',
          800: '#5E351A',
          900: '#3F2310',
        },
        canvas: {
          DEFAULT: '#F4F6F9',
          warm:    '#FBFAF7',
          cool:    '#E6ECF3',
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
        serif: ['Georgia', 'serif'],
      },
      borderRadius: {
        card:   '16px',
        cardLg: '20px',
        sheet:  '28px',
      },
    },
  },
  plugins: [],
};
