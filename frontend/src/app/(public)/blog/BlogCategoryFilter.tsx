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
    <div className="py-8 bg-gradient-to-r from-blue-50/80 to-purple-50/80 border-y border-primary-blue/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Tag className="text-primary-blue" size={20} />
          <span className="font-heading font-bold text-navy-blue mr-2">Filter by Topic:</span>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-primary-blue to-light-blue-cyan text-white shadow-lg scale-105'
                  : 'bg-white/80 text-navy-blue border-2 border-primary-blue/30 hover:bg-primary-blue/10 hover:border-primary-blue/50'
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

