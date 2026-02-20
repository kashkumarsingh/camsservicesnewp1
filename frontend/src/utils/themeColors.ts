/**
 * Theme colour values for use in inline styles (e.g. third-party calendar, style={{}}).
 * Must match frontend/tailwind.config.js theme.extend.colors — single source of truth for hex.
 * For Tailwind classes, use tokens directly: text-primary-blue, border-navy-blue, etc.
 */

export const themeColors = {
  primaryBlue: '#0080FF',
  primaryBlueAlpha20: '#0080FF20',
  navyBlue: '#1E3A5F',
  lightBlueCyan: '#00D4FF',
} as const;
