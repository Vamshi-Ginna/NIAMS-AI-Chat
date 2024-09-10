/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html",
    ],
    theme: {
      extend: { colors: {
        pinkish: '#ff9ff3',
        custom_blue: "#7dcaeb"
      },},
    },
    plugins: [],
  };  