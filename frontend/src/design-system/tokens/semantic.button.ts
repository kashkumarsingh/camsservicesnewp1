export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'bordered'
  | 'ghost'
  | 'outline'
  | 'outlineNavy'
  | 'outlineWhite'
  | 'purple'
  | 'yellow'
  | 'superPlayful'
  | 'destructive'
  | 'destructive-outline'
  /** Marketing hero / high-contrast CTAs (cams token palette) */
  | 'ctaPrimary'
  | 'ctaSecondary';

type VariantClassMap = Record<ButtonVariant, string>;

export const buttonSemanticTokens = {
  base: 'font-semibold transition-all duration-200 inline-flex items-center justify-center space-x-2',
  disabledState: 'opacity-40 cursor-not-allowed pointer-events-none select-none',
  enabledState: 'cursor-pointer',
  size: {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  },
  variant: {
    enabled: {
      primary:
        'bg-gradient-to-r from-primary-blue to-navy-blue text-white shadow-md hover:shadow-lg hover:from-primary-blue hover:to-light-blue-cyan active:shadow-md transition-all duration-200 ring-0',
      secondary:
        'bg-navy-blue text-white shadow-md hover:bg-gray-800 hover:shadow-lg transition-all duration-200 ring-0',
      bordered:
        'border-2 border-primary-blue text-primary-blue bg-white shadow-sm hover:bg-primary-blue hover:text-white hover:shadow-md transition-all duration-200',
      ghost:
        'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200 hover:border-gray-400 transition-all duration-200',
      outline:
        'border-2 border-primary-blue bg-white text-primary-blue shadow-sm hover:bg-primary-blue hover:text-white hover:shadow-md transition-all duration-200',
      outlineNavy:
        'rounded-full border-2 border-navy-blue bg-white text-navy-blue ring-0 shadow-none hover:bg-navy-blue hover:text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200',
      outlineWhite:
        'border-2 border-white bg-white/15 text-white shadow-md hover:bg-white hover:text-primary-blue hover:shadow-lg transition-all duration-200',
      purple:
        'bg-gradient-to-r from-primary-blue to-light-blue-cyan text-white border-0 shadow-md hover:shadow-lg hover:brightness-105 transition-all duration-200',
      yellow:
        'bg-gradient-to-r from-star-gold to-cta-accent-start text-navy-blue border-0 shadow-md hover:shadow-lg hover:brightness-105 active:shadow-md transition-all duration-200',
      superPlayful:
        'bg-gradient-to-r from-primary-blue to-light-blue-cyan text-white border-0 shadow-md hover:shadow-lg hover:brightness-105 transition-all duration-200',
      destructive:
        'bg-rose-600 text-white border-0 shadow-md hover:bg-rose-700 hover:shadow-lg focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all duration-200',
      'destructive-outline':
        'bg-white text-rose-600 border border-rose-300 shadow-sm hover:bg-rose-50 hover:text-rose-700 hover:border-rose-400 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all duration-200',
      ctaPrimary:
        'bg-white text-cams-primary shadow-md hover:bg-blue-50/95 ring-0 border-0',
      ctaSecondary:
        'border-2 border-white/95 bg-transparent text-white shadow-none hover:bg-white/15 ring-0',
    } satisfies VariantClassMap,
    disabled: {
      primary: 'bg-gradient-to-r from-primary-blue to-navy-blue text-white ring-0 shadow-md opacity-90',
      secondary: 'bg-navy-blue text-white ring-0 shadow-md',
      bordered: 'border-2 border-primary-blue text-primary-blue bg-white',
      ghost: 'bg-gray-100 text-gray-700 border border-gray-300',
      outline: 'border-2 border-primary-blue bg-white text-primary-blue',
      outlineNavy: 'rounded-full border-2 border-navy-blue bg-white text-navy-blue ring-0 shadow-none',
      outlineWhite: 'border-2 border-white bg-white/10 text-white',
      purple: 'bg-gradient-to-r from-primary-blue to-light-blue-cyan text-white border-0 shadow-md',
      yellow: 'bg-gradient-to-r from-star-gold to-cta-accent-start text-navy-blue border-0 shadow-md',
      superPlayful: 'bg-gradient-to-r from-primary-blue to-light-blue-cyan text-white border-0 shadow-md',
      destructive: 'bg-rose-600 text-white ring-0 shadow-md',
      'destructive-outline': 'border border-rose-300 text-rose-600 bg-white',
      ctaPrimary: 'bg-white text-cams-primary shadow-md opacity-90 ring-0 border-0',
      ctaSecondary: 'border-2 border-white/60 bg-transparent text-white/90 ring-0',
    } satisfies VariantClassMap,
  },
  arrowIcon: {
    primary:
      'ml-2 w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-white hover:bg-white/40 transition-colors duration-200',
    secondary:
      'ml-2 w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-white hover:bg-white/40 transition-colors duration-200',
    bordered:
      'ml-2 w-6 h-6 rounded-full bg-primary-blue/10 flex items-center justify-center text-primary-blue group-hover:bg-primary-blue group-hover:text-white transition-colors duration-200',
    ghost:
      'ml-2 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 group-hover:bg-gray-300 group-hover:text-gray-900 transition-colors duration-200',
    outline:
      'ml-2 w-6 h-6 rounded-full bg-primary-blue/10 flex items-center justify-center text-primary-blue group-hover:bg-white group-hover:text-primary-blue transition-colors duration-200',
    outlineNavy:
      'ml-2 w-6 h-6 rounded-full bg-navy-blue/10 flex items-center justify-center text-navy-blue group-hover:bg-white/20 group-hover:text-white transition-colors duration-300',
    outlineWhite:
      'ml-2 w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-white hover:bg-white/40 transition-colors duration-200',
    purple:
      'ml-2 w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-white hover:bg-white/40 transition-colors duration-200',
    yellow:
      'ml-2 w-6 h-6 rounded-full bg-navy-blue/15 flex items-center justify-center text-navy-blue hover:bg-navy-blue/25 transition-colors duration-200',
    superPlayful:
      'ml-2 w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-white hover:bg-white/40 transition-colors duration-200',
    destructive:
      'ml-2 w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-white hover:bg-white/40 transition-colors duration-200',
    'destructive-outline':
      'ml-2 w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 hover:bg-rose-200 transition-colors duration-200',
    ctaPrimary:
      'ml-2 w-6 h-6 rounded-full bg-cams-primary/15 flex items-center justify-center text-cams-primary hover:bg-cams-primary/25 transition-colors duration-200',
    ctaSecondary:
      'ml-2 w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-white hover:bg-white/40 transition-colors duration-200',
  } satisfies VariantClassMap,
} as const;
