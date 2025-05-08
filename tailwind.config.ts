import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "droppable-fade":
          "linear-gradient(var(--color-dark),var(--color-main))",
        "light-droppable-fade":
          "linear-gradient(var(--color-secondary),var(--color-main))",
        "radial-light":
          "radial-gradient(circle, rgba(62, 62, 64) 0%, rgb(46, 46, 48) 100%)",
      },
      screens: {
        xs: "380px",
      },
      colors: {
        main: "var(--color-main)",
        secondary: "var(--color-secondary)",
        dark: "var(--color-dark)",
        darker: "var(--color-darker)",
        darkest: "var(--color-darkest)",
        twhite: "var(--color-twhite)",
        tbright: "var(--color-tbright)",
        tmid: "var(--color-tmid)",
        tdark: "var(--color-tdark)",
        tblack: "var(--color-tblack)",
        tblackAF: "var(--color-tblackAF)",
        titles: "var(--color-titles)",
        labels: "var(--color-labels)",
        icons: "var(--color-icons)",

        // Theme color variants
        primary: {
          DEFAULT: "var(--color-primary)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
        },
        success: {
          DEFAULT: "var(--color-success)",
          100: "var(--color-success-100)",
          200: "var(--color-success-200)",
          300: "var(--color-success-300)",
          400: "var(--color-success-400)",
          500: "var(--color-success)",
          600: "var(--color-success-600)",
          700: "var(--color-success-700)",
          800: "var(--color-success-800)",
          900: "var(--color-success-900)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          100: "var(--color-warning-100)",
          200: "var(--color-warning-200)",
          300: "var(--color-warning-300)",
          400: "var(--color-warning-400)",
          500: "var(--color-warning)",
          600: "var(--color-warning-600)",
          700: "var(--color-warning-700)",
          800: "var(--color-warning-800)",
          900: "var(--color-warning-900)",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          100: "var(--color-danger-100)",
          200: "var(--color-danger-200)",
          300: "var(--color-danger-300)",
          400: "var(--color-danger-400)",
          500: "var(--color-danger)",
          600: "var(--color-danger-600)",
          700: "var(--color-danger-700)",
          800: "var(--color-danger-800)",
          900: "var(--color-danger-900)",
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities }: { addUtilities: Function }) {
      const newUtilities = {
        ".desktop-grid": {
          display: "grid",
          gridTemplateColumns: "repeat(12, 92px)",
          gap: "16px",
          width: "fit-content",
          margin: "auto",
        },
        ".mobile-grid": {
          display: "grid",
          gridTemplateColumns: "repeat(4, 92px)",
          gap: "16px",
          width: "fit-content",
          margin: "auto",
        },
        ".bg-primary-opacity-80": {
          backgroundColor: "rgba(38, 132, 255, 0.5)", // Your primary color with opacity
        },
        ".bg-warning-opacity-80": {
          backgroundColor: "rgba(243, 156, 18, 0.5)", // Your warning color with opacity
        },
      };

      addUtilities(newUtilities, ["responsive", "hover"]);
    },
  ],
};

export default config;