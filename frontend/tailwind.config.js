/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-kid-body)', 'sans-serif'],
        heading: ['var(--font-kid-heading)', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }], // 11px
      },
      borderRadius: {
        card: '30px',
        /** Single source of truth: auth/form and header. Change here to apply everywhere. */
        'form-card': '1.5rem',      // 24px – main login/register card
        'form-input': '0.5rem',     // 8px – input fields
        'form-button': '0.75rem',   // 12px – Sign In / Create Account
        'form-alert': '0.5rem',     // 8px – error/note boxes
        'header-button': '9999px',   // pill – Become a Trainer, Login, Register
      },
      /** Modal/overlay z-index scale. Use these instead of arbitrary z-[999]. Sticky: 40, Dropdown: 50, Overlay/Modal: 1000, Toast: 9999. */
      zIndex: {
        sticky: '40',
        dropdown: '50',
        overlay: '1000',
        toast: '9999',
      },
      colors: {
        primary: '#00AEEF',
        secondary: '#231F20',
        accent: '#FFFFFF',
        'space-blue': '#1A2B4C', // Deep blue for primary elements
        'galaxy-purple': '#5A3D7B', // Complementary purple
        'star-gold': '#FFD700', // Gold for accents
        'nebula-gray': '#3C4A6B', // Darker gray for subtle elements
        'dark-space': '#0A1128', // Very dark blue for backgrounds
        'navy-blue': '#1E3A5F', // Dark border/text
        'primary-blue': '#0080FF', // New color for button gradient
        'light-blue-cyan': '#00D4FF', // New color for button gradient
        'accent-green': '#00FF00', // New color for button gradient
        'dark-gray-text': '#333333', // New color for button text
        'orbital-green': '#7FFF00', // New color for the orbital ring
        'cta-accent-start': '#F59E0B',
        'cta-accent-end': '#10B981',
        'footer-dark': '#102A4C',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.focus-glow': {
          '@apply focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue focus:shadow-lg': {},
          'box-shadow': '0 0 0 3px rgba(0, 128, 255, 0.5)', // Custom glow effect
        },
      });
    },
  ],
}