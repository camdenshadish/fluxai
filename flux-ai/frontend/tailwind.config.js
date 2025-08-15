/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        light: {
          bg: '#ffffff',
          accent: '#38bdf8',
          highlight: '#1e3a8a'
        },
        dark: {
          bg: '#000000',
          accent: '#3b82f6',
          highlight: '#14b8a6'
        }
      }
    }
  },
  plugins: []
};


