import type { Metadata } from 'next';
import { AdminTrainerApplicationsPageClient } from './AdminTrainerApplicationsPageClient';

export const metadata: Metadata = {
  title: 'Trainer Applications – Admin',
  description: 'Review and manage trainer applications.',
};

export default function TrainerApplicationsPage() {
  return <AdminTrainerApplicationsPageClient />;
}
