import React from 'react';
import { formatHours } from '@/utils/formatHours';

interface ReviewPackageInfoProps {
  packageName: string;
  totalHours: number;
  usedHours: number;
  trainerName: string;
  sessionsCount: number;
}

const ReviewPackageInfo: React.FC<ReviewPackageInfoProps> = ({
  packageName,
  totalHours,
  usedHours,
  trainerName,
  sessionsCount,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-3">
      <div>
        <div className="text-xs text-gray-600 mb-1">Package</div>
        <div className="text-base font-semibold text-[#1E3A5F]">{packageName}</div>
        <div className="text-xs text-gray-600 mt-1">
          {totalHours} total hours{usedHours > 0 ? ` • ${formatHours(usedHours)} booked` : ' • No sessions booked yet'}
        </div>
      </div>
      <div>
        <div className="text-xs text-gray-600 mb-1">Trainer</div>
        <div className="text-base font-semibold text-gray-900">
          {trainerName === 'Auto-assigned' ? (
            <span className="text-gray-600">To be assigned when booking sessions</span>
          ) : (
            trainerName
          )}
        </div>
      </div>
    </div>
    <div className="space-y-3">
      <div>
        <div className="text-xs text-gray-600 mb-1">Sessions</div>
        <div className="text-base font-semibold text-gray-900">
          {sessionsCount} {sessionsCount === 1 ? 'session' : 'sessions'} scheduled
        </div>
      </div>
    </div>
  </div>
);

export default ReviewPackageInfo;

