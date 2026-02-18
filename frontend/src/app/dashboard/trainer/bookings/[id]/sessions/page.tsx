import { redirect } from 'next/navigation';

/**
 * Legacy route: session booking was removed (SessionBuilder).
 * Redirect to booking detail. Sessions are managed by parents from the dashboard.
 */
export default async function TrainerSessionBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/dashboard/trainer/bookings/${id}`);
}
