'use client';

import { useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';

interface BookingButtonWithChildIdProps {
  packageSlug: string;
  variant?: 'primary' | 'yellow' | 'outline' | 'outlineWhite';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  withArrow?: boolean;
  children: React.ReactNode;
}

export default function BookingButtonWithChildId({
  packageSlug,
  variant = 'primary',
  size = 'lg',
  className,
  withArrow,
  children,
}: BookingButtonWithChildIdProps) {
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId');
  const bookingUrl = childId ? `/book/${packageSlug}?childId=${childId}` : `/book/${packageSlug}`;

  return (
    <Button
      href={bookingUrl}
      variant={variant}
      size={size}
      className={className}
      withArrow={withArrow}
    >
      {children}
    </Button>
  );
}
