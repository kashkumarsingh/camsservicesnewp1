/**
 * Hospital Appointment Strategy
 * 
 * Handles hospital appointments with transport and waiting room support
 */

'use client';

import React, { useMemo } from 'react';
import { Stethoscope, Clock } from 'lucide-react';
import { BaseItineraryStrategy } from './BaseItineraryStrategy';
import { ItineraryRenderProps } from './IItineraryStrategy';
import { UniversalItineraryData } from '../services/ItineraryService';
import { ValidationState } from '../shared/useProgressiveDisclosure';
import { ItinerarySection } from '../ItineraryBase';
import { TransportSection } from '../shared/TransportSection';
import { AddressField } from '../shared/AddressField';
import { TimeField } from '../shared/TimeField';
import { useProgressiveDisclosure } from '../shared/useProgressiveDisclosure';

export class HospitalAppointmentStrategy extends BaseItineraryStrategy {
  readonly key = 'hospital-appointment';
  readonly name = 'Hospital Appointment';
  readonly description = 'Transport + waiting-room support.';

  getMetadata() {
    return {
      title: 'Hospital support',
      shortDesc: 'Transport + waiting-room support',
      icon: Stethoscope,
      badge: '',
      required: ['hospital_support'],
      popular: false,
    };
  }

  getSections(): string[] {
    return ['appointment', 'waiting', 'transport'];
  }

  getSectionOrder(): string[] {
    return ['appointment', 'waiting', 'transport'];
  }

  getSectionValidations(data: UniversalItineraryData): ValidationState {
    const appointmentValid = !!((typeof data.hospitalAddress === "string" ? data.hospitalAddress : "").trim() && data.appointmentTime);
    const waitingValid = appointmentValid && !!data.waitingRoomDuration;
    const transportValid = waitingValid && !!((typeof data.hospitalPickupAddress === "string" ? data.hospitalPickupAddress : "").trim() && 
      (data.hospitalPickupTime || this.getEffectivePickupTime(data)));
    
    return {
      appointment: appointmentValid,
      waiting: waitingValid,
      transport: transportValid,
    };
  }

  calculateDuration(data: UniversalItineraryData, remainingHours: number): number {
    const waitingRoomDurationVal = data.waitingRoomDuration;
    const waitingHours = parseFloat(typeof waitingRoomDurationVal === 'string' || typeof waitingRoomDurationVal === 'number' ? String(waitingRoomDurationVal) : '0');
    const appointmentDuration = 1; // Assume 1 hour for appointment
    let total = waitingHours + appointmentDuration;

    // Travel time
    const pickupAddressVal = data.hospitalPickupAddress;
    const hospitalAddressVal = data.hospitalAddress;
    const pickupAddress = typeof pickupAddressVal === 'string' ? pickupAddressVal : '';
    const hospitalAddress = typeof hospitalAddressVal === 'string' ? hospitalAddressVal : '';
    const hasDiff = pickupAddress.trim().toLowerCase() !== hospitalAddress.trim().toLowerCase();
    
    const hospitalPickupTimeVal = data.hospitalPickupTime;
    const appointmentTimeVal = data.appointmentTime;
    if (hospitalPickupTimeVal && appointmentTimeVal) {
      const hospitalPickupTime = typeof hospitalPickupTimeVal === 'string' ? hospitalPickupTimeVal : '';
      const appointmentTime = typeof appointmentTimeVal === 'string' ? appointmentTimeVal : '';
      const pickupMin = this.parseTimeToMinutes(hospitalPickupTime);
      const appointmentMin = this.parseTimeToMinutes(appointmentTime);
      if (pickupMin > 0 && appointmentMin > pickupMin) {
        total += (appointmentMin - pickupMin) / 60;
      } else {
        total += hasDiff ? 2 : 1;
      }
    } else {
      total += hasDiff ? 2 : 1;
    }

    // Return travel
    const hospitalDropoffAddressVal = data.hospitalDropoffAddress;
    const hospitalDropoffAddress = typeof hospitalDropoffAddressVal === 'string' ? hospitalDropoffAddressVal : '';
    const dropoffSame = data.hospitalDropoffSameAsPickup || 
      (hospitalDropoffAddress && pickupAddress && 
       hospitalDropoffAddress.trim().toLowerCase() === pickupAddress.trim().toLowerCase());
    
    if (dropoffSame && hasDiff) {
      total += 2;
    } else if (hospitalDropoffAddress && hospitalAddress && 
               hospitalDropoffAddress.trim().toLowerCase() !== hospitalAddress.trim().toLowerCase()) {
      total += 1;
    }

    return Math.min(Math.max(0.5, total), Math.max(0.5, remainingHours));
  }

  initializeData(parentAddress?: string): UniversalItineraryData {
    return {
      hospitalAddress: '',
      appointmentTime: '',
      waitingRoomDuration: '1',
      hospitalPickupAddress: parentAddress || '',
      hospitalPickupTime: '',
      hospitalDropoffAddress: '',
      hospitalDropoffSameAsPickup: true,
      parentAddress,
    };
  }

  render(
    data: UniversalItineraryData,
    onChange: (patch: Partial<UniversalItineraryData>) => void,
    props: ItineraryRenderProps
  ): React.ReactNode {
    return <HospitalAppointmentRenderer data={data} onChange={onChange} props={props} strategy={this} />;
  }
}

// Renderer component
const HospitalAppointmentRenderer: React.FC<{
  data: UniversalItineraryData;
  onChange: (patch: Partial<UniversalItineraryData>) => void;
  props: ItineraryRenderProps;
  strategy: HospitalAppointmentStrategy;
}> = ({ data, onChange, props, strategy }) => {
  const { parentAddress } = props;
  
  const validations = useMemo(() => strategy.getSectionValidations(data), [data, strategy]);
  const { isSectionOpen, isSectionEnabled, toggleSection } = useProgressiveDisclosure({
    sections: ['appointment', 'waiting', 'transport'],
    validations,
    autoExpand: true,
  });

  const pickupSuggestions = strategy.getPickupSuggestions(data);
  const effectivePickupTime = strategy.getEffectivePickupTime(data);

  return (
    <div className="mb-3 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Stethoscope className="text-[#0080FF]" size={20} />
        <h3 className="text-base font-bold text-[#1E3A5F]">Hospital Appointment Details</h3>
      </div>

      {/* Appointment Information */}
      <ItinerarySection
        title="Appointment Information"
        icon={<Stethoscope className="text-white" size={16} />}
        color="blue"
        collapsed={!isSectionOpen('appointment')}
        onToggle={() => toggleSection('appointment')}
      >
        <div className="space-y-3">
          <AddressField
            label="Hospital Address"
            required
            value={typeof data.hospitalAddress === 'string' ? data.hospitalAddress : ''}
            onChange={(v) => onChange({ hospitalAddress: v })}
            placeholder="Hospital name or postcode"
            parentAddress={parentAddress}
            onUseParentAddress={() => parentAddress && onChange({ hospitalAddress: parentAddress })}
          />
          <TimeField
            label="Appointment Time"
            required
            value={typeof data.appointmentTime === 'string' ? data.appointmentTime : ''}
            onChange={(v) => onChange({ appointmentTime: v })}
          />
        </div>
      </ItinerarySection>

      {/* Waiting Room */}
      <ItinerarySection
        title="Waiting Room Duration"
        icon={<Clock className="text-white" size={16} />}
        color="amber"
        collapsed={!isSectionOpen('waiting')}
        onToggle={() => toggleSection('waiting')}
        disabled={!isSectionEnabled('waiting')}
      >
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Expected Waiting Time <span className="text-xs font-normal text-gray-500">(hours)</span>
          </label>
          <select
            className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 text-sm focus:border-[#0080FF] focus:outline-none"
            value={typeof data.waitingRoomDuration === 'string' || typeof data.waitingRoomDuration === 'number' ? String(data.waitingRoomDuration) : '1'}
            onChange={(e) => onChange({ waitingRoomDuration: e.target.value })}
          >
            <option value="0.5">30 minutes</option>
            <option value="1">1 hour</option>
            <option value="1.5">1.5 hours</option>
            <option value="2">2 hours</option>
            <option value="3">3 hours</option>
          </select>
        </div>
      </ItinerarySection>

      {/* Transport Details */}
      <TransportSection
        parentAddress={parentAddress}
        pickupAddress={typeof data.hospitalPickupAddress === 'string' ? data.hospitalPickupAddress : ''}
        onPickupAddressChange={(v) => onChange({ hospitalPickupAddress: v })}
        pickupTime={typeof data.hospitalPickupTime === 'string' ? data.hospitalPickupTime : ''}
        onPickupTimeChange={(v) => onChange({ hospitalPickupTime: v })}
        pickupTimeOverridden={false}
        pickupTimeSuggested={effectivePickupTime}
        pickupTimeOptions={validations.appointment ? pickupSuggestions : []}
        onPickupTimeOverride={undefined}
        pickupTimeHelperText={validations.appointment ? 
          (() => {
            const appointmentTime = typeof data.appointmentTime === 'string' ? data.appointmentTime : '';
            const hospitalPickupAddress = typeof data.hospitalPickupAddress === 'string' ? data.hospitalPickupAddress : '';
            const hospitalAddress = typeof data.hospitalAddress === 'string' ? data.hospitalAddress : '';
            return `From ${appointmentTime} - ${hospitalPickupAddress && hospitalAddress && 
              hospitalPickupAddress.trim().toLowerCase() !== hospitalAddress.trim().toLowerCase() ? '2h' : '1h'} travel`;
          })() : 
          'Fill appointment details first'}
        dropoffAddress={typeof data.hospitalDropoffAddress === 'string' ? data.hospitalDropoffAddress : ''}
        dropoffSameAsPickup={data.hospitalDropoffSameAsPickup !== false}
        onDropoffAddressChange={(v) => onChange({ hospitalDropoffAddress: v })}
        onDropoffSameAsPickupChange={(v) => onChange({ hospitalDropoffSameAsPickup: v })}
        compact
        disabled={!isSectionEnabled('transport')}
        collapsed={!isSectionOpen('transport')}
        onToggle={() => toggleSection('transport')}
      />
    </div>
  );
};

