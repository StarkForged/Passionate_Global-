/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand guide
        navy: '#01152D',
        ocean: '#1679E0',
        brand: '#0361DB',
        ice: '#EFF4F9',
        // Derived
        deep: '#000915',
        sky: '#5AA5FF',
        ink: '#0A1A30',
        muted: '#5A6A80',
        line: 'rgba(1,21,45,0.08)',
      },
      fontFamily: {
        display: ['"Helvetica Now Display"', '"Inter Tight Variable"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        sans: ['"Inter Tight Variable"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      maxWidth: { site: '1240px' },
      borderRadius: { '4xl': '2rem', '5xl': '2.5rem' },
      boxShadow: {
        soft: '0 1px 2px rgba(1,21,45,.04), 0 12px 32px -12px rgba(1,21,45,.14)',
        lift: '0 2px 4px rgba(1,21,45,.04), 0 30px 60px -24px rgba(1,21,45,.28)',
        blue: '0 18px 40px -14px rgba(3,97,219,.6)',
        glow: '0 0 0 1px rgba(140,190,255,.15), 0 30px 80px -30px rgba(3,97,219,.6)',
      },
      backgroundImage: {
        grad: 'linear-gradient(135deg,#1679E0 0%,#0361DB 55%,#0245A8 100%)',
      },
    },
  },
  plugins: [],
};
