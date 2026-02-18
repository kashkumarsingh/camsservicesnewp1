'use client';

import React from 'react';
import { Car } from 'lucide-react';

interface ItinerarySectionProps {
  title: string;
  icon: React.ReactNode;
  color: 'blue' | 'purple' | 'green' | 'red' | 'amber';
  children: React.ReactNode;
  collapsed?: boolean;
  disabled?: boolean;
  onToggle?: () => void;
  summary?: React.ReactNode;
}

export const ItinerarySection: React.FC<ItinerarySectionProps> = ({
  title,
  icon,
  color,
  children,
  collapsed = false,
  disabled = false,
  onToggle,
  summary,
}) => {
  const colorConfig = {
    blue: {
      bg: 'from-blue-50 to-cyan-50',
      border: 'border-blue-200',
      iconBg: 'bg-[#0080FF]',
    },
    purple: {
      bg: 'from-purple-50 to-pink-50',
      border: 'border-purple-200',
      iconBg: 'bg-purple-500',
    },
    green: {
      bg: 'from-green-50 to-emerald-50',
      border: 'border-green-200',
      iconBg: 'bg-green-500',
    },
    red: {
      bg: 'from-red-50 to-pink-50',
      border: 'border-red-200',
      iconBg: 'bg-red-500',
    },
    amber: {
      bg: 'from-amber-50 to-orange-50',
      border: 'border-amber-200',
      iconBg: 'bg-amber-500',
    },
  };

  const config = colorConfig[color];
  const isCollapsed = collapsed;
  const isDisabled = disabled;

  return (
    <div className={`bg-gradient-to-br ${config.bg} rounded-xl border-2 ${config.border} ${isDisabled ? 'opacity-60' : ''} transition-all`}>
      <button
        type="button"
        onClick={onToggle}
        disabled={isDisabled && !isCollapsed}
        className={`w-full flex items-center justify-between gap-2 p-4 ${isDisabled && !isCollapsed ? 'cursor-not-allowed' : 'cursor-pointer'} ${!isCollapsed ? 'border-b-2 ' + config.border : ''}`}
      >
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
            <div className="text-white">{icon}</div>
          </div>
          <h4 className={`text-sm font-bold ${isDisabled && !isCollapsed ? 'text-gray-400' : 'text-[#1E3A5F]'}`}>
            {title}
          </h4>
          {isDisabled && !isCollapsed && (
            <span className="text-xs text-gray-500 ml-2">(Complete previous section)</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-right ml-4">
          {summary && (
            <span className="text-[11px] text-gray-600 hidden sm:block max-w-[200px] truncate">
              {summary}
            </span>
          )}
          {onToggle && (
            <svg
              className={`w-5 h-5 transition-transform ${isCollapsed ? '' : 'rotate-180'} ${isDisabled && !isCollapsed ? 'text-gray-400' : 'text-gray-600'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </button>
      {!isCollapsed && (
        <div className="p-4">
          {isDisabled ? (
            <div className="text-xs text-gray-500 italic text-center py-2">
              Please complete the previous section to continue
            </div>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
};

interface DropoffSectionProps {
  parentAddress?: string;
  dropoffAddress: string;
  dropoffSameAsPickup: boolean;
  onDropoffAddressChange: (address: string) => void;
  onDropoffSameAsPickupChange: (same: boolean) => void;
}

export const DropoffSection: React.FC<DropoffSectionProps> = ({
  parentAddress,
  dropoffAddress,
  dropoffSameAsPickup,
  onDropoffAddressChange,
  onDropoffSameAsPickupChange,
}) => {
  return (
    <ItinerarySection title="Drop-off" icon={<Car className="text-white" size={16} />} color="purple">
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-700">Drop-off Address</label>
          <label className="inline-flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 text-[#0080FF] rounded border-gray-300 focus:ring-[#0080FF]"
              checked={dropoffSameAsPickup}
              onChange={(e) => onDropoffSameAsPickupChange(e.target.checked)}
            />
            Same as pickup
          </label>
        </div>
        {!dropoffSameAsPickup && (
          <div className="flex flex-wrap gap-2 mb-2">
            {parentAddress && (
              <button
                type="button"
                onClick={() => onDropoffAddressChange(parentAddress)}
                className="px-3 py-1 rounded-full text-xs bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 font-medium"
              >
                Use child's address
              </button>
            )}
          </div>
        )}
        <input
          className={`w-full px-4 py-2.5 rounded-lg border-2 text-sm focus:outline-none ${
            dropoffSameAsPickup
              ? 'border-gray-200 bg-gray-100 cursor-not-allowed'
              : 'border-gray-200 focus:border-[#0080FF]'
          }`}
          value={dropoffAddress}
          onChange={(e) => onDropoffAddressChange(e.target.value)}
          placeholder={dropoffSameAsPickup ? 'Same as pickup' : 'Specify drop-off address'}
          disabled={dropoffSameAsPickup}
        />
      </div>
    </ItinerarySection>
  );
};

