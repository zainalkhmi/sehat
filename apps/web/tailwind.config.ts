import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0284c7',
          hover: '#0369a1',
          light: '#e0f2fe',
        },
        clinical: {
          slate: '#0f172a',
          emerald: '#059669',
          amber: '#d97706',
          rose: '#e11d48',
          bg: '#f8fafc',
          border: '#e2e8f0',
        },
      },
    },
  },
  plugins: [],
};

export default config;

