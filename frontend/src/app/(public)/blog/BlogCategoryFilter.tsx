'use client';

import React from 'react';
import { Tag } from 'lucide-react';

interface BlogCategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function BlogCategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}: BlogCategoryFilterProps) {
  return (
    <div className="py-8 bg-white border-y border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Tag className="text-primary-blue" size={20} />
          <span className="font-semibold text-navy-blue mr-2">Filter by Topic:</span>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-primary-blue to-light-blue-cyan text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-navy-blue hover:bg-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

