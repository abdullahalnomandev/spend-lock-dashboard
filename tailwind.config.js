/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0E8279',
          hover: '#0B655E',
          ring: '#6CC2BA',
          soft: '#0A2724',
        },
        surface: {
          page: '#ffffff',
          sidebar: '#f9fafb',
          card: '#ffffff',
          elevated: '#f3f4f6',
          input: '#ffffff',
          border: '#e5e7eb',
        },
        accent: {
          pitch: '#16a34a',
          pitchSoft: '#14532d',
          success: '#22c55e',
          danger: '#ef4444',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
