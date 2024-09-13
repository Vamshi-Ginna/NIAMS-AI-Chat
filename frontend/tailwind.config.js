/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html",
    ],
    theme: {
      extend: {
         colors: {
        pinkish: '#d0b8f9',
        pinkish_dark:"#7128eb",
        custom_blue: "#c4d5fb"
      },
    },
    },
    plugins: [],
  };  