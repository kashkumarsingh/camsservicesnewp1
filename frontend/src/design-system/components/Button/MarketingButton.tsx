import React from 'react';
import Button, { type ButtonProps } from '@/components/ui/Button';
import { buttonIntentVariantMap, type ButtonIntent } from './buttonIntents';

/** @deprecated Use `ButtonIntent` from `@/design-system/components/Button/buttonIntents` */
export type MarketingButtonIntent = ButtonIntent;

export type MarketingButtonProps = Omit<ButtonProps, 'variant'> & {
  intent?: ButtonIntent;
  /** When set, overrides `intent` mapping (full control). */
  variant?: ButtonProps['variant'];
};

export default function MarketingButton({
  intent = 'primary',
  variant,
  ...props
}: MarketingButtonProps) {
  const resolvedVariant = variant ?? buttonIntentVariantMap[intent];
  return <Button variant={resolvedVariant} {...props} />;
}
