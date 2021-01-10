module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: "media", // or 'media' or 'class'
  theme: {
    extend: {
      margin: {
        13: "3.25rem",
        "-13": "-3.25rem",
        26: "6.5rem"
      },
      width: {
        '1/9': `${1/9*100}%`
      },
      colors: {
        primary: {
          100: "#f3d9d9",
          200: "#e7b3b3",
          300: "#dc8c8c",
          400: "#d06666",
          500: "#c44040",
          600: "#9d3333",
          700: "#762626",
          800: "#4e1a1a",
          900: "#270d0d"
        },
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
