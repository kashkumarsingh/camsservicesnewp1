import type { Metadata } from 'next';
import React from 'react';
import { AdminIncidentsPageClient } from './AdminIncidentsPageClient';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Incident reports',
  description: 'Review and triage incident reports from trainers and staff.',
};

export default function AdminIncidentsPage() {
  return <AdminIncidentsPageClient />;
}
