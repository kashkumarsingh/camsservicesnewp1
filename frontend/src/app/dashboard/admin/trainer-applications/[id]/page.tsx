import type { Metadata } from 'next';
import React from 'react';
import { AdminTrainerApplicationDetailPageClient } from './AdminTrainerApplicationDetailPageClient';

export const metadata: Metadata = {
  title: 'Admin · Trainer application',
  description: 'View full trainer application details.',
};

interface AdminTrainerApplicationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminTrainerApplicationDetailPage({ params }: AdminTrainerApplicationDetailPageProps) {
  const { id } = await params;
  return <AdminTrainerApplicationDetailPageClient id={id} />;
}
