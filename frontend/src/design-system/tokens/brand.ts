export const brandTokens = {
  colors: {
    primary: '#0066ff',
    secondary: '#00d4ff',
    accent: '#ccff00',
    dark: '#0f172a',
    soft: '#f8fafc',
    ink: '#0f172a',
    inkSecondary: '#334155',
    inkTertiary: '#64748b',
  },
  radius: {
    button: '0.75rem',
    pill: '9999px',
  },
} as const;

export type BrandTokens = typeof brandTokens;
