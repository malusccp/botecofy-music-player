/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        boteco: {
          bg: "#140d0a",
          surface: "#211611",
          card: "#2c1d16",
          amber: "#e8a33d",
          ember: "#d2691e",
          cream: "#f5e9d8",
        },
      },
      fontFamily: {
        display: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
