/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          dark: '#030712',
          card: '#0b1120',
          border: '#1e293b',
          accent: '#10b981',
          accentHover: '#059669',
          danger: '#f43f5e'
        }
      }
    },
  },
  plugins: [],
}