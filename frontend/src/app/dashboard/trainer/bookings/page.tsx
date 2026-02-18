import { Metadata } from 'next';
import BookingsListPageClient from './BookingsListPageClient';

export const metadata: Metadata = {
  title: 'My Bookings - Trainer Dashboard - CAMS Services',
  description: 'View and manage your assigned bookings',
};

export const dynamic = 'force-dynamic';

export default function TrainerBookingsPage() {
  return <BookingsListPageClient />;
}
