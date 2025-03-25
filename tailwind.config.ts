/* eslint-disable @typescript-eslint/no-unsafe-function-type */
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
      };

      addUtilities(newUtilities, ["responsive", "hover"]);
    },
  ],
};
export default config;
