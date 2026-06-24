/** @type {import('tailwindcss').Config} */

// ============================================================================
// CLIENT THEME — the single source of truth for THIS client's visual identity.
// To re-skin the whole product for a new client, edit only this block:
//   • brand      → primary palette (50–900)
//   • fonts      → typography identity
//   • radius     → shape language (soft / sharp / pill)
//   • shadow     → elevation style
//   • motion     → animation personality
// Keep `brand[600]` and the status colors in sync with theme/tokens.ts
// (those are the same values used outside Tailwind, e.g. map markers).
// ============================================================================
const clientTheme = {
  // Almedhyaf Alarabi — maroon #801212, gold #F8C15D, ink #1D1D1B
  brand: {
    50: '#fbf3f3',
    100: '#f6e0e0',
    200: '#eec2c2',
    300: '#e09a9a',
    400: '#cf6a6a',
    500: '#b23e3e',
    600: '#801212', // primary
    700: '#6d0f0f',
    800: '#590d0d',
    900: '#480b0b',
  },
  // Gold — the secondary brand color (full scale; 500 = the logo gold #F8C15D)
  secondary: {
    50: '#fef9ee',
    100: '#fdf0d2',
    200: '#fbe0a4',
    300: '#f9d07b',
    400: '#f8c869',
    500: '#F8C15D',
    600: '#e0a23b',
    700: '#ba7f28',
    800: '#946120',
    900: '#79501f',
  },
  status: {
    success: '#2ECC71',
    warning: '#F39C12',
    info: '#3B82F6',
  },
  surfaces: {
    pageBg: '#FAF7F2',
    cardBg: '#FFFFFF',
    textPrimary: '#1D1D1B',
    textSecondary: '#6B7280',
  },
  fonts: {
    // Alexandria covers both Arabic and Latin — one family across the whole product.
    sans: ['Alexandria', 'sans-serif'],
    display: ['Alexandria', 'sans-serif'],
  },
  radius: {
    card: '1rem', // 16px — soft. Drop to e.g. '0.25rem' for a sharper identity.
    control: '0.75rem', // buttons / inputs
    pill: '9999px',
  },
  shadow: {
    card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    elevated: '0 10px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.08)',
    brand: '0 8px 20px -6px rgba(232,41,76,0.45)',
  },
};

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  safelist: [
    // Full brand + secondary scales (used dynamically in the design-system styleguide)
    { pattern: /(bg|text|border)-(brand|secondary)-(50|100|200|300|400|500|600|700|800|900)/ },
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: clientTheme.fonts.sans,
        cairo: clientTheme.fonts.sans,
        display: clientTheme.fonts.display,
      },
      colors: {
        brand: clientTheme.brand,
        secondary: clientTheme.secondary,
        accent: {
          light: clientTheme.secondary[200],
          DEFAULT: clientTheme.secondary[500],
          dark: clientTheme.secondary[600],
        },
        success: clientTheme.status.success,
        warning: clientTheme.status.warning,
        info: clientTheme.status.info,
        pageBg: clientTheme.surfaces.pageBg,
        cardBg: clientTheme.surfaces.cardBg,
        ink: clientTheme.surfaces.textPrimary,
        textPrimary: clientTheme.surfaces.textPrimary,
        textSecondary: clientTheme.surfaces.textSecondary,
      },
      borderRadius: {
        card: clientTheme.radius.card,
        control: clientTheme.radius.control,
      },
      boxShadow: {
        card: clientTheme.shadow.card,
        elevated: clientTheme.shadow.elevated,
        brand: clientTheme.shadow.brand,
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'fade-in-down': 'fade-in-down 0.5s ease-out both',
        'fade-in-up': 'fade-in-up 0.5s ease-out both',
        'slide-up': 'slide-up 0.3s ease-out both',
        marquee: 'marquee 32s linear infinite',
      },
    },
  },
  plugins: [],
};
