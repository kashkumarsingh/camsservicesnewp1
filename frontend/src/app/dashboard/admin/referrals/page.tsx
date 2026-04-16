import type { Metadata } from 'next';
import { AdminReferralsPageClient } from './AdminReferralsPageClient';

export const metadata: Metadata = {
  title: 'Referrals | Admin',
  description: 'View referral submissions.',
};

export default function AdminReferralsPage() {
  return <AdminReferralsPageClient />;
}

