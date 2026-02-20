'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type AccordionSectionProps = {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export default function AccordionSection({ id, title, children, defaultOpen = false }: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section id={id} className="mb-4 md:mb-6">
      <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white hover:border-gray-300 transition-all duration-300">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center py-4 px-6 text-left font-semibold text-navy-blue hover:bg-gray-50 focus:outline-none transition-colors duration-200"
        >
          <span className="text-base md:text-lg">{title}</span>
          <ChevronDown
            className={`w-5 h-5 text-gray-600 flex-shrink-0 transform transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {isOpen && (
          <div className="px-6 pb-4 pt-2 border-t border-gray-100">
            <div className="text-navy-blue leading-relaxed text-sm md:text-base">
              {children}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}


