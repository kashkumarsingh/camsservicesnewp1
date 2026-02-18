import { Metadata } from 'next';
import AddChildPageClient from './AddChildPageClient';

export const metadata: Metadata = {
  title: 'Add Child - CAMS Services',
  description: 'Add a child to your account',
};

// Force dynamic rendering for authenticated pages
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AddChildPage() {
  return <AddChildPageClient />;
}

