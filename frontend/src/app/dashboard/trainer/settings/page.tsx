import { Metadata } from 'next';
import SettingsPageClient from './SettingsPageClient';

export const metadata: Metadata = {
  title: 'Settings - Trainer Dashboard - CAMS Services',
  description: 'Manage your trainer profile, availability, and qualifications',
};

export const dynamic = 'force-dynamic';

export default function TrainerSettingsPage() {
  return <SettingsPageClient />;
}
