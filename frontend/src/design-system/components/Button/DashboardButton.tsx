import React from 'react';
import Button, { type ButtonProps } from '@/components/ui/Button';
import { buttonIntentVariantMap, type ButtonIntent } from './buttonIntents';

/** @deprecated Use `ButtonIntent` from `@/design-system/components/Button/buttonIntents` */
export type DashboardButtonIntent = ButtonIntent;

export type DashboardButtonProps = Omit<ButtonProps, 'variant'> & {
  intent?: ButtonIntent;
  /** When set, overrides `intent` mapping (full control). */
  variant?: ButtonProps['variant'];
};

export default function DashboardButton({
  intent = 'primary',
  variant,
  ...props
}: DashboardButtonProps) {
  const resolvedVariant = variant ?? buttonIntentVariantMap[intent];
  return <Button variant={resolvedVariant} {...props} />;
}
