import { redirect } from 'next/navigation';
import { ROUTES } from '@/shared/utils/routes';

/**
 * Redirects notification links (e.g. "Session ending in 30 minutes") to the admin bookings page
 * with the schedule in the side panel. Backend sends /dashboard/admin/booking-schedules?scheduleId=X.
 */
export default async function AdminBookingSchedulesRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const scheduleId = typeof params?.scheduleId === 'string' ? params.scheduleId : undefined;
  if (scheduleId) {
    redirect(`${ROUTES.DASHBOARD_ADMIN_BOOKINGS}?schedule_id=${encodeURIComponent(scheduleId)}`);
  }
  redirect(ROUTES.DASHBOARD_ADMIN_BOOKINGS);
}
