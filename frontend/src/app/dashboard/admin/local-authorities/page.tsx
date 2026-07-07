import type { Metadata } from 'next';
import React from 'react';
import { AdminLocalAuthoritiesPageClient } from './AdminLocalAuthoritiesPageClient';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Local authority agreements',
  description: 'Track signed data sharing agreements with local authorities.',
};

export default function AdminLocalAuthoritiesPage() {
  return <AdminLocalAuthoritiesPageClient />;
}
