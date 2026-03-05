import type { Metadata } from 'next';
import React from 'react';
import ParentPaymentConfirmationPageClient from './ParentPaymentConfirmationPageClient';

export const metadata: Metadata = {
  title: 'Payment confirmation',
  description: 'Your payment has been received. View receipt and invoice summary.',
};

export const dynamic = 'force-dynamic';

export default function ParentPaymentConfirmationPage() {
  return (
    <section className="space-y-4">
      <ParentPaymentConfirmationPageClient />
    </section>
  );
}
