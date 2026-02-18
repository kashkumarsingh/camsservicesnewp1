import { Suspense } from 'react';
import BookingDetailPageClient from './BookingDetailPageClient';
import { Metadata } from 'next';

interface BookingDetailPageProps {
  params: Promise<{
    reference: string;
  }>;
}

export async function generateMetadata({ params }: BookingDetailPageProps): Promise<Metadata> {
  const { reference } = await params;
  return {
    title: `Booking ${reference} | CAMS Services`,
    description: `Details for booking reference ${reference}`,
  };
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { reference } = await params;
  
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BookingDetailPageClient reference={reference} />
    </Suspense>
  );
}

