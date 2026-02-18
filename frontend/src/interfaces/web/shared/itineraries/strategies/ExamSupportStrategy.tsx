/**
 * Exam Support Strategy
 * 
 * Handles exam support with transport and exam duration
 */

'use client';

import React, { useMemo } from 'react';
import { BookOpen, Clock } from 'lucide-react';
import { BaseItineraryStrategy } from './BaseItineraryStrategy';
import { ItineraryRenderProps } from './IItineraryStrategy';
import { UniversalItineraryData } from '../services/ItineraryService';
import { ValidationState } from '../shared/useProgressiveDisclosure';
import { ItinerarySection } from '../ItineraryBase';
import { TransportSection } from '../shared/TransportSection';
import { AddressField } from '../shared/AddressField';
import { TimeField } from '../shared/TimeField';
import { useProgressiveDisclosure } from '../shared/useProgressiveDisclosure';

export class ExamSupportStrategy extends BaseItineraryStrategy {
  readonly key = 'exam-support';
  readonly name = 'Exam Support';
  readonly description = 'Calm prep + in-exam support.';

  getMetadata() {
    return {
      title: 'Exam support',
      shortDesc: 'Calm prep + in-exam support',
      icon: BookOpen,
      badge: '',
      required: ['exam_support'],
      popular: false,
    };
  }

  getSections(): string[] {
    return ['exam', 'transport'];
  }

  getSectionOrder(): string[] {
    return ['exam', 'transport'];
  }

  getSectionValidations(data: UniversalItineraryData): ValidationState {
    const examVenueVal = data.examVenue;
    const examVenue = typeof examVenueVal === 'string' ? examVenueVal : '';
    const examPickupAddressVal = data.examPickupAddress;
    const examPickupAddress = typeof examPickupAddressVal === 'string' ? examPickupAddressVal : '';
    const examValid = !!(examVenue.trim() && data.examTime && data.examDuration);
    const transportValid = examValid && !!(examPickupAddress.trim() && 
      (data.examPickupTime || this.getEffectivePickupTime(data)));
    
    return {
      exam: examValid,
      transport: transportValid,
    };
  }

  calculateDuration(data: UniversalItineraryData, remainingHours: number): number {
    const examDurationVal = data.examDuration;
    const examDuration = parseFloat(typeof examDurationVal === 'string' || typeof examDurationVal === 'number' ? String(examDurationVal) : '0');
    let total = examDuration;

    // Travel time
    const pickupAddressVal = data.examPickupAddress;
    const examAddressVal = data.examVenue;
    const pickupAddress = typeof pickupAddressVal === 'string' ? pickupAddressVal : '';
    const examAddress = typeof examAddressVal === 'string' ? examAddressVal : '';
    const hasDiff = pickupAddress.trim().toLowerCase() !== examAddress.trim().toLowerCase();
    
    const examPickupTimeVal = data.examPickupTime;
    const examTimeVal = data.examTime;
    if (examPickupTimeVal && examTimeVal) {
      const examPickupTime = typeof examPickupTimeVal === 'string' ? examPickupTimeVal : '';
      const examTime = typeof examTimeVal === 'string' ? examTimeVal : '';
      const pickupMin = this.parseTimeToMinutes(examPickupTime);
      const examMin = this.parseTimeToMinutes(examTime);
      if (pickupMin > 0 && examMin > pickupMin) {
        total += (examMin - pickupMin) / 60;
      } else {
        total += hasDiff ? 2 : 1;
      }
    } else {
      total += hasDiff ? 2 : 1;
    }

    // Return travel
    const examDropoffAddressVal = data.examDropoffAddress;
    const examDropoffAddress = typeof examDropoffAddressVal === 'string' ? examDropoffAddressVal : '';
    const dropoffSame = data.examDropoffSameAsPickup || 
      (examDropoffAddress && pickupAddress && 
       examDropoffAddress.trim().toLowerCase() === pickupAddress.trim().toLowerCase());
    
    if (dropoffSame && hasDiff) {
      total += 2;
    } else if (examDropoffAddress && examAddress && 
               examDropoffAddress.trim().toLowerCase() !== examAddress.trim().toLowerCase()) {
      total += 1;
    }

    return Math.min(Math.max(0.5, total), Math.max(0.5, remainingHours));
  }

  initializeData(parentAddress?: string): UniversalItineraryData {
    return {
      examVenue: '',
      examTime: '',
      examDuration: '2',
      examPickupAddress: parentAddress || '',
      examPickupTime: '',
      examDropoffAddress: '',
      examDropoffSameAsPickup: true,
      parentAddress,
    };
  }

  render(
    data: UniversalItineraryData,
    onChange: (patch: Partial<UniversalItineraryData>) => void,
    props: ItineraryRenderProps
  ): React.ReactNode {
    return <ExamSupportRenderer data={data} onChange={onChange} props={props} strategy={this} />;
  }
}

// Renderer component
const ExamSupportRenderer: React.FC<{
  data: UniversalItineraryData;
  onChange: (patch: Partial<UniversalItineraryData>) => void;
  props: ItineraryRenderProps;
  strategy: ExamSupportStrategy;
}> = ({ data, onChange, props, strategy }) => {
  const { parentAddress } = props;
  
  const validations = useMemo(() => strategy.getSectionValidations(data), [data, strategy]);
  const { isSectionOpen, isSectionEnabled, toggleSection } = useProgressiveDisclosure({
    sections: ['exam', 'transport'],
    validations,
    autoExpand: true,
  });

  const pickupSuggestions = strategy.getPickupSuggestions(data);
  const effectivePickupTime = strategy.getEffectivePickupTime(data);

  return (
    <div className="mb-3 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="text-[#0080FF]" size={20} />
        <h3 className="text-base font-bold text-[#1E3A5F]">Exam Support Details</h3>
      </div>

      {/* Exam Information */}
      <ItinerarySection
        title="Exam Information"
        icon={<BookOpen className="text-white" size={16} />}
        color="blue"
        collapsed={!isSectionOpen('exam')}
        onToggle={() => toggleSection('exam')}
      >
        <div className="space-y-3">
          <AddressField
            label="Exam Venue"
            required
            value={typeof data.examVenue === 'string' ? data.examVenue : ''}
            onChange={(v) => onChange({ examVenue: v })}
            placeholder="Exam venue or postcode"
            parentAddress={parentAddress}
            onUseParentAddress={() => parentAddress && onChange({ examVenue: parentAddress })}
          />
          <TimeField
            label="Exam Time"
            required
            value={typeof data.examTime === 'string' ? data.examTime : ''}
            onChange={(v) => onChange({ examTime: v })}
          />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Exam Duration <span className="text-xs font-normal text-gray-500">(hours)</span>
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 text-sm focus:border-[#0080FF] focus:outline-none"
              value={typeof data.examDuration === 'string' || typeof data.examDuration === 'number' ? String(data.examDuration) : '2'}
              onChange={(e) => onChange({ examDuration: e.target.value })}
            >
              <option value="1">1 hour</option>
              <option value="1.5">1.5 hours</option>
              <option value="2">2 hours</option>
              <option value="2.5">2.5 hours</option>
              <option value="3">3 hours</option>
            </select>
          </div>
        </div>
      </ItinerarySection>

      {/* Transport Details */}
      <TransportSection
        parentAddress={parentAddress}
        pickupAddress={typeof data.examPickupAddress === 'string' ? data.examPickupAddress : ''}
        onPickupAddressChange={(v) => onChange({ examPickupAddress: v })}
        pickupTime={typeof data.examPickupTime === 'string' ? data.examPickupTime : ''}
        onPickupTimeChange={(v) => onChange({ examPickupTime: v })}
        pickupTimeOverridden={false}
        pickupTimeSuggested={effectivePickupTime}
        pickupTimeOptions={validations.exam ? pickupSuggestions : []}
        onPickupTimeOverride={undefined}
        pickupTimeHelperText={validations.exam ? 
          (() => {
            const examTime = typeof data.examTime === 'string' ? data.examTime : '';
            const examPickupAddress = typeof data.examPickupAddress === 'string' ? data.examPickupAddress : '';
            const examVenue = typeof data.examVenue === 'string' ? data.examVenue : '';
            return `From ${examTime} - ${examPickupAddress && examVenue && 
              examPickupAddress.trim().toLowerCase() !== examVenue.trim().toLowerCase() ? '2h' : '1h'} travel`;
          })() : 
          'Fill exam details first'}
        dropoffAddress={typeof data.examDropoffAddress === 'string' ? data.examDropoffAddress : ''}
        dropoffSameAsPickup={data.examDropoffSameAsPickup !== false}
        onDropoffAddressChange={(v) => onChange({ examDropoffAddress: v })}
        onDropoffSameAsPickupChange={(v) => onChange({ examDropoffSameAsPickup: v })}
        compact
        disabled={!isSectionEnabled('transport')}
        collapsed={!isSectionOpen('transport')}
        onToggle={() => toggleSection('transport')}
      />
    </div>
  );
};

