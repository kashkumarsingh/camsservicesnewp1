import type { Metadata } from 'next';
import React from 'react';
import { AdminStaffPageClient } from './AdminStaffPageClient';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Staff',
  description: 'Manage internal staff onboarding records, job titles, visa status, and citizenship.',
};

export default function AdminStaffPage() {
  return <AdminStaffPageClient />;
}
