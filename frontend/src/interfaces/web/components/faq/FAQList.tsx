/**
 * FAQ List Component
 * 
 * Displays a list of FAQ items as an accordion.
 */

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useFAQ } from '../../hooks/faq/useFAQ';
import { FAQFilterOptions } from '@/core/application/faq';
import { SKELETON_COUNTS } from '@/utils/skeletonConstants';
import { FAQSkeleton } from '@/components/ui/Skeleton';
import { EMPTY_STATE } from '@/utils/emptyStateConstants';
import { renderHtml } from '@/utils/htmlRenderer';

interface FAQListProps {
  filterOptions?: FAQFilterOptions;
}

export default function FAQList({ filterOptions }: FAQListProps) {
  const { faqs, loading, error } = useFAQ(filterOptions);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <FAQSkeleton count={SKELETON_COUNTS.FAQS} />
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

  if (faqs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-navy-blue/80">{EMPTY_STATE.NO_FAQS_FOUND.title}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={faq.id}
            className={`
              border-2 rounded-xl transition-all duration-300
              ${
                isOpen
                  ? 'border-primary-blue bg-primary-blue/10 shadow-card'
                  : 'border-primary-blue/20 bg-white hover:border-primary-blue/30 hover:shadow-card'
              }
            `}
          >
            {/* Question Button */}
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full px-6 py-4 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex-1 pr-4">
                {/* Category Badge (if provided) */}
                {faq.category && (
                  <span className="inline-block px-3 py-1 bg-primary-blue text-white text-xs font-bold rounded-full mb-2">
                    {faq.category}
                  </span>
                )}
                {/* Question */}
                <h3
                  className={`
                    font-bold text-base sm:text-lg
                    ${isOpen ? 'text-primary-blue' : 'text-navy-blue'}
                  `}
                >
                  {faq.title}
                </h3>
              </div>

              {/* Toggle Icon */}
              <div
                className={`
                  flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                  ${
                    isOpen
                      ? 'bg-primary-blue text-white rotate-180'
                      : 'bg-primary-blue/20 text-navy-blue'
                  }
                `}
              >
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>

            {/* Answer */}
            <div
              className={`
                overflow-hidden transition-all duration-300 ease-in-out
                ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
              `}
            >
              <div className="px-6 pb-4 pt-2">
                <div className="prose prose-sm max-w-none text-navy-blue/80">
                  {renderHtml(faq.content)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


