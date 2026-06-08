/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: { 50: '#f0f5f3', 100: '#d4e5de', 200: '#a8cbbe', 300: '#6b8f71', 400: '#4a7a56', 500: '#2d6a3f', 600: '#1a5c30', 700: '#1a3c34', 800: '#0f2a22', 900: '#0a1f1a', 950: '#050f0c' },
        gold: { 50: '#fdf8ef', 100: '#f9edd4', 200: '#f0d5a0', 300: '#e5b96b', 400: '#c4a265', 500: '#b8863c', 600: '#a06b2a', 700: '#855224', 800: '#6d4223', 900: '#5a3820' },
        cream: { DEFAULT: '#f9f5ef', 50: '#fdfcfa', 100: '#f9f5ef', 200: '#f5f0eb', 300: '#ede5d8', 400: '#ddd0bc', 500: '#c4b49a' },
        sage: { 50: '#f4f7f5', 100: '#e0ebe3', 200: '#c3d7c8', 300: '#95b59e', 400: '#6b8f71', 500: '#4d7556', 600: '#3b5e44', 700: '#314c38', 800: '#293e2f', 900: '#233428' },
        dark: { 50: '#2a2a2e', 100: '#222226', 200: '#1c1c1f', 300: '#161618', 400: '#111113', 500: '#0c0c0d' },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
