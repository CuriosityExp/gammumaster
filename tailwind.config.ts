/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      keyframes: {
        "scan-line": {
          "0%": { top: "0%" },
          "100%": { top: "95%" }, // A little padding from the bottom
        },
      },
      animation: {
        scan: "scan-line 3s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}