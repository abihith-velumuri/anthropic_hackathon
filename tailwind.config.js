/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fredoka"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        bob: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        droop: {
          '0%, 100%': { transform: 'rotate(-3deg) translateY(2px)' },
          '50%': { transform: 'rotate(-5deg) translateY(4px)' },
        },
        pop: {
          '0%': { transform: 'scale(0.95)' },
          '60%': { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        bob: 'bob 2.2s ease-in-out infinite',
        wiggle: 'wiggle 3s ease-in-out infinite',
        droop: 'droop 4s ease-in-out infinite',
        pop: 'pop 0.4s ease-out',
      },
    },
  },
  plugins: [],
}
