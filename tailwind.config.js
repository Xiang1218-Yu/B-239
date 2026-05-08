/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'military-dark': '#1a1f1e',
        'military-green': '#4a5f4d',
        'military-light': '#8b9d8a',
        'hud-amber': '#ffb82e',
        'hud-red': '#ff3333',
      },
      fontFamily: {
        'military': ['Orbitron', 'monospace'],
      }
    },
  },
  plugins: [],
}
