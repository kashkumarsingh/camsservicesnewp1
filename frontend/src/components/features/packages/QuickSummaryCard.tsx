'use client';

import React, { useState } from 'react';
import { CheckCircle2, Award, ChevronDown, ChevronUp } from 'lucide-react';

interface QuickSummaryCardProps {
  pkg: {
    features: string[];
    perks?: string[];
  };
}

const QuickSummaryCard: React.FC<QuickSummaryCardProps> = ({ pkg }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-blue-100/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-blue flex items-center justify-center">
            <CheckCircle2 className="text-white" size={20} />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-navy-blue">Quick Package Summary</h3>
            <p className="text-xs text-gray-600">Click to see full details</p>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="text-primary-blue" size={24} /> : <ChevronDown className="text-primary-blue" size={24} />}
      </button>
      {isExpanded && (
        <div className="px-5 pb-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <CheckCircle2 className="text-green-600" size={18} />
                What&apos;s Included:
              </h4>
              <ul className="space-y-2">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-blue mt-1.5 flex-shrink-0"></div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            {pkg.perks && pkg.perks.length > 0 && (
              <div className="bg-white rounded-lg p-4 border border-yellow-200">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Award className="text-yellow-600" size={18} />
                  Bonus Perks:
                </h4>
                <ul className="space-y-2">
                  {pkg.perks.map((perk, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickSummaryCard;

