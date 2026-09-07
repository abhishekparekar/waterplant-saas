/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0284c7', // Sky Blue 600
          light: '#e0f2fe',
          dark: '#0369a1',
        },
        secondary: {
          DEFAULT: '#00b4d8', // Cyan 500
          light: '#ecfeff',
        }
      }
    },
  },
  plugins: [],
}
