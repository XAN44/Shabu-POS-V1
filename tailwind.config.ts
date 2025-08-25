/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    screens: {
      xs: "319px",
      sm: "640px",
      // => @media (min-width: 640px) { ... }
      "xs-plus": "636px", // Breakpoint ใหม่ที่เพิ่มเข้ามา

      md: "768px",
      // => @media (min-width: 768px) { ... }

      lg: "1024px",
      // => @media (min-width: 1024px) { ... }

      xl: "1280px",
      // => @media (min-width: 1280px) { ... }

      "2xl": "1536px",
      // => @media (min-width: 1536px) { ... }
    },
  },
};
