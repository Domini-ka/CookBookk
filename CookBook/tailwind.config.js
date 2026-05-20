/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        vanilla:  { 50: "#fdf8f3", 100: "#faeee3", 200: "#f3d9c4" },
        rose:     { 100: "#fde8ec", 200: "#fbc8d4", 300: "#f49ab0", 400: "#e97a98" },
        sky:      { 100: "#dff0fb", 200: "#b8ddf5", 300: "#7ec3ec" },
        mint:     { 100: "#d9f5ec", 200: "#a8e6d3", 300: "#6dcdb5" },
        peach:    { 100: "#fde8d8", 200: "#facbb0", 300: "#f4a47a" },
        sand:     { 200: "#e8d9c8", 300: "#d4bfa8", 400: "#b89880", 500: "#8a6f5e" },
        cocoa:    { 700: "#3d2f2a", 800: "#2b201c" },
      },
      fontFamily: {
        sans:    ["Nunito", "sans-serif"],
        display: ["Playfair Display", "serif"],
      },
      boxShadow: {
        soft:   "0 2px 12px rgba(180,140,120,0.12), 0 1px 3px rgba(180,140,120,0.08)",
        card:   "0 4px 20px rgba(180,140,120,0.15), 0 1px 4px rgba(180,140,120,0.10)",
        hover:  "0 8px 32px rgba(180,140,120,0.22), 0 2px 8px rgba(180,140,120,0.14)",
        inner:  "inset 0 1px 3px rgba(180,140,120,0.15)",
      },
      borderRadius: { "2xl": "1rem", "3xl": "1.5rem" },
    },
  },
  plugins: [],
};