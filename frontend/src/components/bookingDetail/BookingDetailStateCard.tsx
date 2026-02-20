'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import Card from '@/components/ui/Card/Card';
import Button from '@/components/ui/Button';
import type { BookingDetailStateCardProps } from './bookingDetailTypes';

const BookingDetailStateCard: React.FC<BookingDetailStateCardProps> = ({
  title,
  message,
  variant,
  onGoBack,
  goBackLabel,
  goToDashboardHref,
  goToDashboardLabel,
}) => {
  const isError = variant === 'error';
  const isNotFound = variant === 'notFound';
  const isLoading = variant === 'loading';

  return (
    <Card
      className={`p-8 text-center ${isError ? 'bg-red-50 border-red-200' : ''}`}
    >
      {isLoading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue mx-auto mb-4" />
      )}
      {(isError || isNotFound) && (
        <AlertCircle
          className={isError ? 'text-red-600 mx-auto mb-4' : 'text-gray-400 mx-auto mb-4'}
          size={isNotFound ? 48 : 32}
        />
      )}
      <h3
        className={`text-xl font-semibold mb-2 ${
          isError ? 'text-red-800' : isNotFound ? 'text-navy-blue' : 'text-gray-600'
        }`}
      >
        {title}
      </h3>
      <p
        className={`text-sm mb-4 ${
          isError ? 'text-red-700' : isNotFound ? 'text-gray-600' : 'text-gray-600'
        }`}
      >
        {message}
      </p>
      {!isLoading && (
        <div className="flex gap-3 justify-center">
          {onGoBack && <Button onClick={onGoBack}>{goBackLabel}</Button>}
          <Link href={goToDashboardHref}>
            <Button variant="outline">{goToDashboardLabel}</Button>
          </Link>
        </div>
      )}
    </Card>
  );
};

export default BookingDetailStateCard;
