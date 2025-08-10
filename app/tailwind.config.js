/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0f172a',
          fg: '#ffffff',
        },
      },
      maxWidth: {
        '5xl': '64rem',
      },
      boxShadow: {
        card: '0 2px 10px rgba(0,0,0,.04)'
      }
    },
  },
  plugins: [],
};
