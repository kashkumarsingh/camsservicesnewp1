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
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        heading: ['var(--font-outfit)', 'sans-serif'],
      },
      fontSize: {
        // Dashboard typography: avoid tiny type; keep hierarchy (3xs < 2xs < xs < sm < base)
        '3xs': ['0.6875rem', { lineHeight: '1rem' }],   // 11px – badges, tiny labels only
        '2xs': ['0.75rem', { lineHeight: '1.125rem' }], // 12px – captions, secondary labels
        'dashboard-xs': ['0.8125rem', { lineHeight: '1.25rem' }],  // 13px – compact body
        'dashboard-sm': ['0.9375rem', { lineHeight: '1.375rem' }], // 15px – body secondary
      },
      borderRadius: {
        card: '30px',
        /** Dashboard: cards, panels, modals – single source for admin/parent/trainer. */
        'dashboard': '0.75rem',     // 12px – cards, tables, panels
        'dashboard-lg': '1rem',    // 16px – large cards, modals
        /** Single source of truth: auth/form and header. Change here to apply everywhere. */
        'form-card': '1.5rem',      // 24px – main login/register card
        'form-input': '0.5rem',     // 8px – input fields
        'form-button': '0.75rem',   // 12px – Sign In / Create Account
        'form-alert': '0.5rem',     // 8px – error/note boxes
        'header-button': '9999px',   // pill – Become a Trainer, Login, Register
        'visit-card': '20px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
        'panel': '0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.06)',
      },
      transitionDuration: {
        'dashboard': '200ms',
      },
      /** Z-index scale (single source of truth). Never use raw z-index numbers in className.
       * You only need to raise z-index for things that must sit above their siblings. Header at 1000 is enough for it to sit above all body content — nothing beneath needs a z-index just to be "below" the header (lower or unset already stacks below).
       * base → sticky (0–200): optional; use only when body elements need order among themselves (e.g. dropdown above content, sticky above base).
       * header: 1000. Highest of any body section; everything else stacks beneath it without needing a value.
       * overlay, sidePanel, modal, etc. (1100+): for overlays that must sit above the header when open. Use createPortal(..., document.body) for those. */
      zIndex: {
        base: '0',
        raised: '10',
        content: '20',
        dropdown: '100',
        sidebar: '150',
        sticky: '200',
        header: '1000',
        overlay: '1100',
        sidePanel: '1200',
        modal: '1300',
        popover: '1300',
        toast: '1400',
        critical: '1500',
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
        // Google Calendar–inspired design system (see frontend/src/styles/colors.ts)
        gcal: {
          primary: '#1a73e8',
          'primary-hover': '#1557b0',
          'primary-light': '#e8f0fe',
          destructive: '#d93025',
          'destructive-hover': '#b31412',
        },
        // Alias for design spec: Google blue/red (no raw hex in className)
        google: {
          blue: '#1a73e8',
          'blue-light': '#e8f0fe',
          red: '#d93025',
        },
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