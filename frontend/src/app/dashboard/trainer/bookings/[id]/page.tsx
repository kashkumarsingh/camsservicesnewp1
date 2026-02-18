import { Metadata } from 'next';
import BookingDetailPageClient from './BookingDetailPageClient';

export const metadata: Metadata = {
  title: 'Booking Details - Trainer Dashboard - CAMS Services',
  description: 'View booking details and manage schedules',
};

export const dynamic = 'force-dynamic';

export default async function TrainerBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BookingDetailPageClient bookingId={id} />;
}
