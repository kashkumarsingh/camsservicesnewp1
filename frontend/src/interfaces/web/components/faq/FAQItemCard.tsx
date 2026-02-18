/**
 * FAQ Item Card Component
 * 
 * Reusable card component for displaying FAQ summary.
 */

'use client';

import Link from 'next/link';
import { FAQItemDTO } from '@/core/application/faq';

interface FAQItemCardProps {
  faq: FAQItemDTO;
}

export default function FAQItemCard({ faq }: FAQItemCardProps) {
  return (
    <div className={`mb-6 p-6 rounded-lg shadow-md transition-all duration-300 transform-gpu hover:rotate-x-10
      bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-galaxy-purple/10 to-[#00D4FF]/10
      text-center
    `}>
      <Link 
        href={`/faq/${faq.slug}`} 
        className="text-xl font-semibold text-indigo-600 hover:text-indigo-800 font-heading"
      >
        {faq.title}
      </Link>
    </div>
  );
}


