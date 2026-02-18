import { Suspense } from 'react';
import BookingPaymentPageClient from './BookingPaymentPageClient';
import { Metadata } from 'next';

interface BookingPaymentPageProps {
  params: Promise<{
    reference: string;
  }>;
}

export async function generateMetadata({ params }: BookingPaymentPageProps): Promise<Metadata> {
  const { reference } = await params;
  return {
    title: `Payment - ${reference} | CAMS Services`,
    description: `Complete payment for booking ${reference}`,
  };
}

export default async function BookingPaymentPage({ params }: BookingPaymentPageProps) {
  const { reference } = await params;
  
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BookingPaymentPageClient reference={reference} />
    </Suspense>
  );
}

