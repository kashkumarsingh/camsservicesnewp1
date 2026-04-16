import type { Metadata } from 'next';
import Link from 'next/link';
import { ROUTES } from '@/shared/utils/routes';
import { ArrowLeft } from 'lucide-react';
import DashboardButton from '@/design-system/components/Button/DashboardButton';
export const metadata: Metadata = {
  title: 'Contact submission | Admin',
  description: 'View contact form submission.',
};

interface ContactSubmissionDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Placeholder page for contact submission detail (linked from admin notification email).
 * Backend does not yet expose GET /admin/contact-submissions/:id; this page prevents 404.
 * When the API is added, replace with a client component that fetches and displays the submission.
 */
export default async function AdminContactSubmissionDetailPage({ params }: ContactSubmissionDetailPageProps) {
  const { id } = await params;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href={ROUTES.DASHBOARD_ADMIN}>
          <DashboardButton variant="bordered" size="sm" className="gap-2">
            <ArrowLeft size={16} />
            Back to admin
          </DashboardButton>
        </Link>
      </div>
      <div className="rounded-card border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-card">
        <h1 className="text-lg font-semibold text-navy-blue dark:text-slate-100 mb-2">
          Contact submission #{id}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Full submission details will appear here once the admin contact-submissions API is connected.
        </p>
      </div>
    </div>
  );
}
