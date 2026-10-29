/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#F7F5EF',
        ink: '#171717',
        cobalt: '#3F51FF',
        lime: '#D9FF45',
        coral: '#FF765F',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        offset: '6px 6px 0 0 #171717',
        'offset-sm': '3px 3px 0 0 #171717',
        'offset-cobalt': '6px 6px 0 0 #3F51FF',
      },
    },
  },
  plugins: [],
}
