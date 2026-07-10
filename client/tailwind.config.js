/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#4a6741',
          sage:  '#e8f0e4',
          deep:  '#2d4229',
          muted: '#8a9e85',
          light: '#f5f8f3',
        }
      },
      fontFamily: {
        sans: ['Roboto', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 12px rgba(45,66,41,0.08)',
        'card-hover': '0 6px 24px rgba(45,66,41,0.14)',
      }
    },
  },
  plugins: [],
};
