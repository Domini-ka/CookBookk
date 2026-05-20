/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
      extend: {
        colors: {
          ink: {
            50:  "#f5f0eb",
            100: "#e8e4df",
            200: "#c9c3bc",
            300: "#a8a099",
            400: "#7d7570",
            500: "#4a4440",
            600: "#2e2a27",
            700: "#1e1b19",
            800: "#141210",
            900: "#0f0f0f",
          },
          amber: {
            400: "#f4a535",
            500: "#e8932a",
            600: "#d4811e",
          },
        },
        fontFamily: {
          sans:    ["DM Sans", "sans-serif"],
          display: ["DM Serif Display", "serif"],
        },
        boxShadow: {
          card: "0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)",
          "card-hover": "0 4px 12px rgba(0,0,0,0.5), 0 16px 40px rgba(0,0,0,0.4)",
          glow: "0 0 0 3px rgba(244,165,53,0.25)",
        },
        transitionTimingFunction: {
          smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        },
      },
    },
    plugins: [],
  };