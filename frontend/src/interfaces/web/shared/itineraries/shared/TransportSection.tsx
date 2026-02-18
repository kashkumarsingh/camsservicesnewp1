'use client';

import React from 'react';
import { Car } from 'lucide-react';
import { ItinerarySection } from '../ItineraryBase';
import { AddressField } from './AddressField';
import { TimeField } from './TimeField';

interface TransportSectionProps {
  parentAddress?: string;
  // Pickup
  pickupAddress: string;
  onPickupAddressChange: (address: string) => void;
  pickupTime: string;
  onPickupTimeChange: (time: string) => void;
  pickupTimeOverridden?: boolean;
  pickupTimeSuggested?: string | null;
  pickupTimeOptions?: string[];
  onPickupTimeOverride?: () => void;
  pickupTimeHelperText?: string;
  // Drop-off
  dropoffAddress: string;
  dropoffSameAsPickup: boolean;
  onDropoffAddressChange: (address: string) => void;
  onDropoffSameAsPickupChange: (same: boolean) => void;
  compact?: boolean;
  collapsed?: boolean;
  disabled?: boolean;
  onToggle?: () => void;
}

export const TransportSection: React.FC<TransportSectionProps> = ({
  parentAddress,
  pickupAddress,
  onPickupAddressChange,
  pickupTime,
  onPickupTimeChange,
  pickupTimeOverridden = false,
  pickupTimeSuggested,
  pickupTimeOptions = [],
  onPickupTimeOverride,
  pickupTimeHelperText,
  dropoffAddress,
  dropoffSameAsPickup,
  onDropoffAddressChange,
  onDropoffSameAsPickupChange,
  compact = false,
  collapsed = false,
  disabled = false,
  onToggle,
}) => {
  const pickupTimeOptionList = pickupTimeOptions.map((opt) => ({
    value: opt,
    label: `${opt}${opt === pickupTimeSuggested ? ' (Suggested)' : ''}`,
    isSuggested: opt === pickupTimeSuggested,
  }));

  const pickupSummary = pickupAddress
    ? `${pickupAddress}${pickupTime ? ` • ${pickupTime}` : ''}`
    : 'Add pickup details';
  const dropoffSummary = dropoffSameAsPickup
    ? 'Drop-off same as pickup'
    : dropoffAddress
    ? dropoffAddress
    : 'Add drop-off';
  const summary = `${pickupSummary} → ${dropoffSummary}`;

  return (
    <ItinerarySection
      title="Transport Details"
      icon={<Car className="text-white" size={16} />}
      color="purple"
      collapsed={collapsed}
      disabled={disabled}
      onToggle={onToggle}
      summary={summary}
    >
      <div className={compact ? 'space-y-3' : 'space-y-4'}>
        {/* Pickup Address and Time - Side by side on larger screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AddressField
            label="Pickup Address"
            required
            value={pickupAddress}
            onChange={onPickupAddressChange}
            placeholder="Pickup address or postcode"
            parentAddress={parentAddress}
            onUseParentAddress={() => parentAddress && onPickupAddressChange(parentAddress)}
            compact={compact}
          />

          <TimeField
            label="Pickup Time"
            required
            value={pickupTime}
            onChange={onPickupTimeChange}
            suggestedOptions={pickupTimeOptionList}
            suggestedValue={pickupTimeSuggested}
            onOverride={onPickupTimeOverride}
            overridden={pickupTimeOverridden}
            helperText={pickupTimeHelperText}
            compact={compact}
          />
        </div>

        {/* Drop-off - Compact inline */}
        <div className={`${compact ? 'pt-2' : 'pt-3'} border-t border-gray-200`}>
          <AddressField
            label="Drop-off Address"
            value={dropoffSameAsPickup ? '' : dropoffAddress}
            onChange={(value) => {
              onDropoffAddressChange(value);
            }}
            placeholder="Drop-off address or postcode"
            parentAddress={parentAddress}
            onUseParentAddress={() => {
              if (parentAddress) {
                onDropoffAddressChange(parentAddress);
                onDropoffSameAsPickupChange(false);
              }
            }}
            compact={compact}
            disabled={dropoffSameAsPickup}
          />
          <div className={`flex items-center ${compact ? 'mt-1.5' : 'mt-2'}`}>
            <label
              className={`inline-flex items-center gap-1.5 ${compact ? 'text-[10px]' : 'text-xs'} text-gray-700 cursor-pointer`}
            >
              <input
                type="checkbox"
                className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-[#0080FF] rounded border-gray-300 focus:ring-[#0080FF]`}
                checked={dropoffSameAsPickup}
                onChange={(e) => onDropoffSameAsPickupChange(e.target.checked)}
              />
              Same as pickup
            </label>
          </div>
        </div>
      </div>
    </ItinerarySection>
  );
};


