'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  title: string;
  content: string;
}

interface AccordionProps {
  items: AccordionItem[];
}

const Accordion: React.FC<AccordionProps> = ({ items }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-xl shadow-lg">
      {items.map((item, index) => (
        <div key={index} className="bg-white rounded-lg mb-4 last:mb-0 overflow-hidden">
          <button
            className="w-full flex justify-between items-center py-4 px-6 text-left text-lg font-semibold text-gray-800 hover:bg-gray-50 focus:outline-none transition-colors duration-200"
            onClick={() => toggleItem(index)}
          >
            <span>{item.title}</span>
            <ChevronDown
              className={`w-5 h-5 text-gray-600 transform transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
            />
          </button>
          {openIndex === index && (
            <div className="py-4 px-6 text-gray-600 border-t border-gray-100">
              <p className="leading-relaxed">{item.content}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Accordion;
