import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)", // Default background color
        foreground: "var(--foreground)", // Default foreground color
        green: {
          50: "#E6F4EA", // Light green
          100: "#D0E8D2",
          200: "#A3D1A4",
          300: "#76B77B",
          400: "#4CAF50", // Main green
          500: "#2C6B3F", // Dark green
          600: "#1F4D29",
          700: "#153A1E",
          800: "#102D18",
          900: "#0D2412",
        },
        natural: {
          50: "#F5F5F5", // Light natural color
          100: "#E0E0E0",
          200: "#B0B0B0",
          300: "#808080",
          400: "#4D4D4D",
          500: "#333333", // Dark natural color
          600: "#2A2A2A",
          700: "#1F1F1F",
          800: "#141414",
          900: "#0A0A0A",
        },
      },
    },
  },
  plugins: [],
};

export default config;