'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

interface FAQAccordionProps {
  faqs: FAQItem[];
  title?: string;
  description?: string;
  defaultOpenIndex?: number;
  className?: string;
}

/**
 * FAQ Accordion Component - 2025 UX
 * Reusable, animated FAQ with smooth expand/collapse
 */
const FAQAccordion: React.FC<FAQAccordionProps> = ({
  faqs,
  title = 'Frequently Asked Questions',
  description,
  defaultOpenIndex,
  className = '',
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(
    defaultOpenIndex !== undefined ? defaultOpenIndex : null
  );

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      {(title || description) && (
        <div className="mb-6 text-center">
          {title && (
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <HelpCircle className="text-[#0080FF]" size={28} />
              {title}
            </h2>
          )}
          {description && (
            <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>
          )}
        </div>
      )}

      {/* FAQ List */}
      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={index}
              className={`
                border-2 rounded-xl transition-all duration-300
                ${
                  isOpen
                    ? 'border-[#0080FF] bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
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
                    <span className="inline-block px-3 py-1 bg-[#0080FF] text-white text-xs font-bold rounded-full mb-2">
                      {faq.category}
                    </span>
                  )}
                  {/* Question */}
                  <h3
                    className={`
                      font-bold text-base sm:text-lg
                      ${isOpen ? 'text-[#0080FF]' : 'text-gray-900'}
                    `}
                  >
                    {faq.question}
                  </h3>
                </div>

                {/* Toggle Icon */}
                <div
                  className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                    ${
                      isOpen
                        ? 'bg-[#0080FF] text-white rotate-180'
                        : 'bg-gray-200 text-gray-600'
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
                  ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                `}
              >
                <div className="px-6 pb-4 pt-2">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Still have questions?{' '}
          <a
            href="/contact"
            className="text-[#0080FF] font-bold hover:underline"
          >
            Contact our team
          </a>{' '}
          or call{' '}
          <a
            href="tel:+441234567890"
            className="text-[#0080FF] font-bold hover:underline"
          >
            +44 123 456 7890
          </a>
        </p>
      </div>
    </div>
  );
};

export default FAQAccordion;








