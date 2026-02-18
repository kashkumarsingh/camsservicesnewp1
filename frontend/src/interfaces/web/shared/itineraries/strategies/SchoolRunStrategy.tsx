/**
 * School Run Strategy
 * 
 * Handles school run + after-school support
 */

'use client';

import React, { useMemo } from 'react';
import { School, BookOpen } from 'lucide-react';
import { BaseItineraryStrategy } from './BaseItineraryStrategy';
import { ItineraryRenderProps } from './IItineraryStrategy';
import { UniversalItineraryData } from '../services/ItineraryService';
import { ValidationState } from '../shared/useProgressiveDisclosure';
import { ItinerarySection } from '../ItineraryBase';
import { TransportSection } from '../shared/TransportSection';
import { AddressField } from '../shared/AddressField';
import { TimeField } from '../shared/TimeField';
import { useProgressiveDisclosure } from '../shared/useProgressiveDisclosure';

export class SchoolRunStrategy extends BaseItineraryStrategy {
  readonly key = 'school-run-after';
  readonly name = 'School Run + After-School';
  readonly description = 'Morning/afternoon run, homework + activities.';

  getMetadata() {
    return {
      title: 'School run',
      shortDesc: 'Morning/afternoon + homework',
      icon: School,
      badge: 'Weekdays',
      required: ['school_run'],
      popular: true,
    };
  }

  getSections(): string[] {
    return ['school', 'transport', 'options'];
  }

  getSectionOrder(): string[] {
    return ['school', 'transport', 'options'];
  }

  getSectionValidations(data: UniversalItineraryData): ValidationState {
    const schoolAddressVal = data.schoolAddress;
    const schoolAddress = typeof schoolAddressVal === 'string' ? schoolAddressVal : '';
    const schoolValid = !!(schoolAddress.trim() && data.schoolPickupTime && data.schoolEndTime);
    const schoolDropoffAddressVal = data.schoolDropoffAddress;
    const schoolDropoffAddress = typeof schoolDropoffAddressVal === 'string' ? schoolDropoffAddressVal : '';
    const transportValid = schoolValid && !!(schoolDropoffAddress.trim());
    
    return {
      school: schoolValid,
      transport: transportValid,
      options: true,
    };
  }

  calculateDuration(data: UniversalItineraryData, remainingHours: number): number {
    const schoolPickupTimeVal = data.schoolPickupTime;
    const schoolEndTimeVal = data.schoolEndTime;
    const schoolPickupTime = typeof schoolPickupTimeVal === 'string' ? schoolPickupTimeVal : '';
    const schoolEndTime = typeof schoolEndTimeVal === 'string' ? schoolEndTimeVal : '';
    const pickupMin = this.parseTimeToMinutes(schoolPickupTime);
    const endMin = this.parseTimeToMinutes(schoolEndTime);
    if (pickupMin <= 0 || endMin <= pickupMin) return 0;

    let total = (endMin - pickupMin) / 60;
    
    // Add homework time if included
    if (data.includeHomework) {
      total += 1; // Assume 1 hour for homework
    }

    return Math.min(Math.max(0.5, total), Math.max(0.5, remainingHours));
  }

  initializeData(parentAddress?: string): UniversalItineraryData {
    return {
      schoolAddress: '',
      schoolPickupTime: '',
      schoolEndTime: '',
      schoolDropoffAddress: parentAddress || '',
      schoolDropoffSameAsPickup: true,
      includeHomework: false,
      parentAddress,
    };
  }

  render(
    data: UniversalItineraryData,
    onChange: (patch: Partial<UniversalItineraryData>) => void,
    props: ItineraryRenderProps
  ): React.ReactNode {
    return <SchoolRunRenderer data={data} onChange={onChange} props={props} strategy={this} />;
  }
}

// Renderer component
const SchoolRunRenderer: React.FC<{
  data: UniversalItineraryData;
  onChange: (patch: Partial<UniversalItineraryData>) => void;
  props: ItineraryRenderProps;
  strategy: SchoolRunStrategy;
}> = ({ data, onChange, props, strategy }) => {
  const { parentAddress } = props;
  
  const validations = useMemo(() => strategy.getSectionValidations(data), [data, strategy]);
  const { isSectionOpen, isSectionEnabled, toggleSection } = useProgressiveDisclosure({
    sections: ['school', 'transport', 'options'],
    validations,
    autoExpand: true,
  });

  return (
    <div className="mb-3 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <School className="text-[#0080FF]" size={20} />
        <h3 className="text-base font-bold text-[#1E3A5F]">School Run Details</h3>
      </div>

      {/* School Information */}
      <ItinerarySection
        title="School Information"
        icon={<School className="text-white" size={16} />}
        color="blue"
        collapsed={!isSectionOpen('school')}
        onToggle={() => toggleSection('school')}
      >
        <div className="space-y-3">
          <AddressField
            label="School Address"
            required
            value={typeof data.schoolAddress === 'string' ? data.schoolAddress : ''}
            onChange={(v) => onChange({ schoolAddress: v })}
            placeholder="School name or postcode"
            parentAddress={parentAddress}
            onUseParentAddress={() => parentAddress && onChange({ schoolAddress: parentAddress })}
          />
          <div className="grid grid-cols-2 gap-3">
            <TimeField
              label="Pickup Time (from home)"
              required
              value={typeof data.schoolPickupTime === 'string' ? data.schoolPickupTime : ''}
              onChange={(v) => onChange({ schoolPickupTime: v })}
            />
            <TimeField
              label="School End Time"
              required
              value={typeof data.schoolEndTime === 'string' ? data.schoolEndTime : ''}
              onChange={(v) => onChange({ schoolEndTime: v })}
            />
          </div>
        </div>
      </ItinerarySection>

      {/* Transport Details */}
      <TransportSection
        parentAddress={parentAddress}
        pickupAddress={parentAddress || ''}
        onPickupAddressChange={() => {}}
        pickupTime={typeof data.schoolPickupTime === 'string' ? data.schoolPickupTime : ''}
        onPickupTimeChange={(v) => onChange({ schoolPickupTime: v })}
        pickupTimeOverridden={false}
        pickupTimeSuggested={null}
        pickupTimeOptions={[]}
        onPickupTimeOverride={undefined}
        pickupTimeHelperText={undefined}
        dropoffAddress={typeof data.schoolDropoffAddress === 'string' ? data.schoolDropoffAddress : ''}
        dropoffSameAsPickup={data.schoolDropoffSameAsPickup !== false}
        onDropoffAddressChange={(v) => onChange({ schoolDropoffAddress: v })}
        onDropoffSameAsPickupChange={(v) => onChange({ schoolDropoffSameAsPickup: v })}
        compact
        disabled={!isSectionEnabled('transport')}
        collapsed={!isSectionOpen('transport')}
        onToggle={() => toggleSection('transport')}
      />

      {/* Additional Options */}
      <ItinerarySection
        title="Additional Options"
        icon={<BookOpen className="text-white" size={16} />}
        color="green"
        collapsed={!isSectionOpen('options')}
        onToggle={() => toggleSection('options')}
        disabled={!isSectionEnabled('options')}
      >
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 transition-colors">
            <input
              type="checkbox"
              className="h-5 w-5 text-[#0080FF] rounded border-gray-300 focus:ring-[#0080FF]"
              checked={data.includeHomework === true}
              onChange={(e) => onChange({ includeHomework: e.target.checked })}
            />
            <div className="flex-1">
              <span className="text-sm font-semibold text-gray-900">Include homework support</span>
              <p className="text-xs text-gray-600 mt-0.5">Trainer will help with homework after school</p>
            </div>
          </label>
        </div>
      </ItinerarySection>
    </div>
  );
};

