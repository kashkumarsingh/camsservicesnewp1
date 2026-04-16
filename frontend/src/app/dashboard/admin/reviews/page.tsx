import { Metadata } from 'next';
import AdminReviewsPageClient from './AdminReviewsPageClient';

export const metadata: Metadata = {
  title: 'Reviews | Admin Dashboard',
  description: 'Manage Google and Trustpilot review sources and external reviews for the home page.',
};

export default function AdminReviewsPage() {
  return <AdminReviewsPageClient />;
}
