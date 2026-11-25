/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#bcd2ff',
          300: '#8fb4ff',
          400: '#5c8dff',
          500: '#3465f6',
          600: '#2247ea',
          700: '#1c37c4',
          800: '#1c319b',
          900: '#1c2e7a'
        }
      }
    }
  },
  plugins: []
};
