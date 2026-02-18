import React from 'react';
import Link from 'next/link';
import { faqItems } from '@/data/faqData';

interface FAQCardProps {
  faq: typeof faqItems[0]; // Type for a single FAQ item
}

const FAQCard: React.FC<FAQCardProps> = ({ faq }) => {
  return (
    <div key={faq.slug} className={`mb-6 p-6 rounded-lg shadow-md transition-all duration-300 transform-gpu hover:rotate-x-10
      bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-galaxy-purple/10 to-[#00D4FF]/10
      text-center
    `}>
      <Link href={`/faq/${faq.slug}`} className="text-xl font-semibold text-indigo-600 hover:text-indigo-800 font-heading">
        {faq.title}
      </Link>
      {/* Optionally, display a short answer or excerpt here */}
      {/* <p className="mt-2 text-gray-700 font-sans">{faq.content.substring(0, 150)}...</p> */}
    </div>
  );
};

export default FAQCard;


