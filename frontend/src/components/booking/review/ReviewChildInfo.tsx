import React from 'react';
import { User, Calendar, AlertCircle } from 'lucide-react';
import type { ChildDetails } from '../types';

interface ReviewChildInfoProps {
  child?: ChildDetails;
}

const ReviewChildInfo: React.FC<ReviewChildInfoProps> = ({ child }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 text-sm">
      <User className="w-4 h-4 text-gray-500" />
      <span className="font-semibold text-gray-700">Name:</span>
      <span className="text-gray-900">{child?.name || '-'}</span>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <Calendar className="w-4 h-4 text-gray-500" />
      <span className="font-semibold text-gray-700">Age:</span>
      <span className="text-gray-900">{child?.age ? `${child.age} years old` : '-'}</span>
    </div>
    {child?.medicalInfo && (
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-yellow-700 mt-0.5" />
          <div className="text-xs font-semibold text-gray-900">Medical Requirements</div>
        </div>
        <div className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">{child.medicalInfo}</div>
      </div>
    )}
  </div>
);

export default ReviewChildInfo;

