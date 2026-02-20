'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BOOKING_DETAIL_HEADER } from './constants';
import type { BookingDetailHeaderProps } from './bookingDetailTypes';

const BookingDetailHeader: React.FC<BookingDetailHeaderProps> = ({
  reference,
  backHref,
}) => (
  <div className="mb-6">
    <Link
      href={backHref}
      className="inline-flex items-center gap-2 text-primary-blue hover:text-primary-blue/90 mb-4"
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="text-sm font-medium">{BOOKING_DETAIL_HEADER.backToDashboard}</span>
    </Link>
    <h1 className="text-3xl font-heading font-bold text-navy-blue mb-2">
      {BOOKING_DETAIL_HEADER.title}
    </h1>
    <p className="text-gray-600">
      {BOOKING_DETAIL_HEADER.referenceLabel}{' '}
      <span className="font-mono font-semibold">{reference}</span>
    </p>
  </div>
);

export default BookingDetailHeader;
