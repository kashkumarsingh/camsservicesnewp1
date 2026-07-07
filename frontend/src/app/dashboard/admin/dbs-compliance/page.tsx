import type { Metadata } from 'next';
import React from 'react';
import { AdminDbsCompliancePageClient } from './AdminDbsCompliancePageClient';

export const metadata: Metadata = {
  title: 'Admin Dashboard - DBS compliance',
  description: 'DBS expiry tracking for staff and trainers.',
};

export default function AdminDbsCompliancePage() {
  return <AdminDbsCompliancePageClient />;
}
