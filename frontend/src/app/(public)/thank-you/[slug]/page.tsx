import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { GetBookingUseCase } from '@/core/application/booking/useCases/GetBookingUseCase';
import { bookingRepository } from '@/infrastructure/persistence/booking';
import { BookingDetail } from '@/interfaces/web/components/booking';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { getPublicSiteUrl } from '@/marketing/lib/public-site-url';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // Try to get booking by reference (slug is booking reference)
  const getBookingUseCase = new GetBookingUseCase(bookingRepository);
  const booking = await getBookingUseCase.executeByReference(slug);

  if (!booking) {
    return {
      title: 'Thank You for Your Booking - CAMS services',
      description: 'Your booking has been received.',
    };
  }

  const baseUrl = getPublicSiteUrl();

  return {
    ...buildPublicMetadata(
      {
        title: `Thank You for Your Booking ${booking.reference} - CAMS services`,
        description: `Your booking ${booking.reference} has been confirmed.`,
        path: `/thank-you/${booking.reference}`,
        imageAlt: `Booking Confirmation ${booking.reference}`,
      },
      baseUrl
    ),
    robots: { index: false, follow: false },
  };
}

import { withTimeoutFallback } from '@/marketing/utils/promiseUtils';

export default async function ThankYouPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Get booking by reference (slug is booking reference) with timeout
  const getBookingUseCase = new GetBookingUseCase(bookingRepository);
  const booking = await withTimeoutFallback(
    getBookingUseCase.executeByReference(slug),
    3500, // 3.5s timeout – thank-you page can wait a bit, but must not hang
    null
  );

  if (!booking) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto mb-8">
          <BookingSummary booking={booking} />
        </div>

        <div className="max-w-4xl mx-auto mb-8">
          <details className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <summary className="px-6 py-4 cursor-pointer font-semibold text-slate-900 hover:bg-slate-50 transition-colors">
              View full booking details
            </summary>
            <div className="px-6 py-4 border-t border-slate-200">
              <BookingDetail booking={booking} />
            </div>
          </details>
        </div>

        <div className="max-w-4xl mx-auto text-center flex flex-col sm:flex-row justify-center gap-3">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            Return to homepage
          </Link>
          <Link 
            href={`/bookings/${booking.reference}`}
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-slate-900 font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            View booking details
          </Link>
        </div>
      </div>
    </div>
  );
}
