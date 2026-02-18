import { Metadata } from 'next';
import SchedulesPageClient from './SchedulesPageClient';

export const metadata: Metadata = {
  title: 'My Schedule - Trainer Dashboard - CAMS Services',
  description: 'View and manage your schedule',
};

export const dynamic = 'force-dynamic';

export default function TrainerSchedulesPage() {
  return <SchedulesPageClient />;
}
