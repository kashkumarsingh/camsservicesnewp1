import type { Metadata } from 'next';
import { AdminAbsenceRequestsPageClient } from './AdminAbsenceRequestsPageClient';

export const metadata: Metadata = {
  title: 'Absence requests – Admin',
  description: 'Approve or reject trainer absence requests.',
};

export default function AdminAbsenceRequestsPage() {
  return <AdminAbsenceRequestsPageClient />;
}
