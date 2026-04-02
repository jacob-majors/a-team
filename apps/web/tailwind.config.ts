import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#ebf8fc',
          100: '#cdf0fa',
          200: '#9de3f6',
          300: '#59cdf0',
          400: '#0fb8e3',
          500: '#0898c0',
          600: '#047499',  // primary accent #047499
          700: '#035d7a',
          800: '#034a62',
          900: '#023546',
          950: '#021e2a',
        },
      },
    },
  },
  plugins: [],
}

export default config
