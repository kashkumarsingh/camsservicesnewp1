import type { Metadata } from 'next';
import Link from 'next/link';
import { ROUTES } from '@/utils/routes';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Contact submissions | Admin',
  description: 'View contact form submissions.',
};

/**
 * Placeholder list page for contact submissions.
 * Prevents 404 when navigating to /dashboard/admin/contact-submissions.
 * When the API is added, replace with a client component that lists submissions.
 */
export default function AdminContactSubmissionsPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href={ROUTES.DASHBOARD_ADMIN}>
          <Button variant="bordered" size="sm" className="gap-2">
            <ArrowLeft size={16} />
            Back to admin
          </Button>
        </Link>
      </div>
      <div className="rounded-card border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-card">
        <h1 className="text-lg font-semibold text-navy-blue dark:text-slate-100 mb-2">
          Contact submissions
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          List of contact form submissions will appear here once the admin API is connected.
        </p>
      </div>
    </div>
  );
}
