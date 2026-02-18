import { Suspense } from 'react';
import BookingsCallbackPageClient from './BookingsCallbackPageClient';

export const metadata = {
  title: 'Payment Status | CAMS Services',
  description: 'Payment processing status',
};

export default function BookingsCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BookingsCallbackPageClient />
    </Suspense>
  );
}

