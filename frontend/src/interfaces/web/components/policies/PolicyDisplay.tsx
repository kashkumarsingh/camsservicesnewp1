"use client";

/**
 * Policy Display Component
 * 
 * Displays a single policy document.
 */

import { usePolicy } from '../../hooks/policies/usePolicy';
import ReactMarkdown from 'react-markdown';

interface PolicyDisplayProps {
  slug: string;
  incrementViews?: boolean;
}

export default function PolicyDisplay({ slug, incrementViews = true }: PolicyDisplayProps) {
  const { policy, loading, error } = usePolicy(slug, incrementViews);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading policy...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error.message}</p>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Policy not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <article className="prose lg:prose-xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-navy-blue mb-4">
            {policy.title}
          </h1>
          {policy.summary && (
            <p className="text-xl text-gray-700 mb-4">{policy.summary}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span>Last Updated: {new Date(policy.lastUpdated).toLocaleDateString()}</span>
            <span>Effective Date: {new Date(policy.effectiveDate).toLocaleDateString()}</span>
            <span>Version: {policy.version}</span>
          </div>
        </header>

        <div className="prose prose-lg max-w-none">
          <ReactMarkdown>{policy.content}</ReactMarkdown>
        </div>

        <footer className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            If you have questions about this policy, please contact us at{' '}
            <a href="mailto:info@camsservices.co.uk" className="text-primary-blue hover:underline">
              info@camsservices.co.uk
            </a>
          </p>
        </footer>
      </article>
    </div>
  );
}

