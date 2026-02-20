/**
 * FAQ Item Component
 * 
 * Displays a single FAQ item in detail.
 * CMS rich-text content is rendered via RichTextBlock (sanitised).
 */

'use client';

import { useFAQItem } from '../../hooks/faq/useFAQItem';
import { RichTextBlock } from '@/components/shared/public-page';

interface FAQItemProps {
  slug: string;
  incrementViews?: boolean;
}

export default function FAQItem({ slug, incrementViews = true }: FAQItemProps) {
  const { faq, loading, error } = useFAQItem(slug, incrementViews);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading FAQ...</p>
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

  if (!faq) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">FAQ not found.</p>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-navy-blue">{faq.title}</h1>
      <RichTextBlock
        content={faq.content}
        proseClassName="prose lg:prose-xl max-w-none text-navy-blue"
      />
    </article>
  );
}


