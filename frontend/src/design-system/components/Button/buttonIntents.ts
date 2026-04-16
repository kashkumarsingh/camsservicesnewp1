import type { ButtonProps } from '@/components/ui/Button';

/**
 * Shared intent API for MarketingButton and DashboardButton.
 * Maps to concrete `Button` variants in one place.
 */
export type ButtonIntent = 'primary' | 'secondary' | 'ghost' | 'outline' | 'accent' | 'danger';

export const buttonIntentVariantMap: Record<
  ButtonIntent,
  NonNullable<ButtonProps['variant']>
> = {
  primary: 'primary',
  secondary: 'secondary',
  ghost: 'ghost',
  outline: 'outline',
  accent: 'yellow',
  danger: 'destructive',
};
