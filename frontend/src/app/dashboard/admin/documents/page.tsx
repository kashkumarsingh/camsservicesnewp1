import type { Metadata } from 'next';
import React from 'react';
import { AdminOperationalDocumentsPageClient } from './AdminOperationalDocumentsPageClient';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Compliance documents',
  description: 'Manage internal policies and procedures for trainers and staff.',
};

export default function AdminOperationalDocumentsPage() {
  return <AdminOperationalDocumentsPageClient />;
}
