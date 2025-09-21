/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  // This is the new, more direct way to solve the issue.
  // It explicitly tells Tailwind CSS *not* to use the modern 'oklch'
  // color format that is incompatible with the html2canvas library.
  features: {
    modernColorFormat: false,
  },
  plugins: [],
}



// /** @type {import('tailwindcss').Config} */
// export const content = [
//     "./src/**/*.{js,jsx,ts,tsx}",
// ];
// export const theme = {
//     extend: {},
// };
// export const plugins = [];

