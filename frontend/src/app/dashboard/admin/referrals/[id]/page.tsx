import type { Metadata } from 'next';
import { AdminReferralDetailPageClient } from './AdminReferralDetailPageClient';

export const metadata: Metadata = {
  title: 'Referral detail | Admin',
  description: 'View referral details.',
};

interface ReferralDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminReferralDetailPage({ params }: ReferralDetailPageProps) {
  const { id } = await params;
  return <AdminReferralDetailPageClient id={id} />;
}

