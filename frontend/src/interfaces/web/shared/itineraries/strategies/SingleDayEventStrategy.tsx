/**
 * Single Day Event Strategy
 * 
 * Handles single-day events with travel (pickup → event → drop-off)
 */

'use client';

import React, { useMemo } from 'react';
import moment from 'moment';
import { Calendar as CalendarIcon, CheckCircle, Car } from 'lucide-react';
import { BaseItineraryStrategy } from './BaseItineraryStrategy';
import { IItineraryStrategy, ItineraryRenderProps, SessionPreviewProps } from './IItineraryStrategy';
import { UniversalItineraryData, ItineraryService } from '../services/ItineraryService';
import { ValidationState } from '../shared/useProgressiveDisclosure';
import { ItinerarySection } from '../ItineraryBase';
import { TransportSection } from '../shared/TransportSection';
import { useProgressiveDisclosure } from '../shared/useProgressiveDisclosure';

export class SingleDayEventStrategy extends BaseItineraryStrategy {
  readonly key = 'single-day-event';
  readonly name = 'Single-Day Event';
  readonly description = 'Pickup → Event → Drop-off. Travel included.';

  getMetadata() {
    return {
      title: 'Single-day event',
      shortDesc: 'Event with travel',
      icon: Car,
      badge: 'Most booked',
      required: ['travel_escort'],
      popular: true,
    };
  }

  getSections(): string[] {
    return ['event', 'transport', 'options'];
  }

  getSectionOrder(): string[] {
    return ['event', 'transport', 'options'];
  }

  getSectionValidations(data: UniversalItineraryData): ValidationState {
    const eventAddressVal = data.eventAddress;
    const eventAddress = typeof eventAddressVal === 'string' ? eventAddressVal : '';
    const eventStartTimeVal = data.eventStartTime;
    const eventStartTime = typeof eventStartTimeVal === 'string' ? eventStartTimeVal : '';
    const eventEndTimeVal = data.eventEndTime;
    const eventEndTime = typeof eventEndTimeVal === 'string' ? eventEndTimeVal : '';
    const eventValid = !!(eventAddress.trim() && 
      this.parseTimeToMinutes(eventStartTime) > 0 &&
      this.parseTimeToMinutes(eventEndTime) > this.parseTimeToMinutes(eventStartTime));
    
    const pickupAddressVal = data.pickupAddress;
    const pickupAddress = typeof pickupAddressVal === 'string' ? pickupAddressVal : '';
    const transportValid = !!(pickupAddress.trim() && 
      (data.pickupTime || this.getEffectivePickupTime(data)));
    
    return {
      event: eventValid,
      transport: transportValid,
      options: true, // Options don't block
    };
  }

  calculateDuration(data: UniversalItineraryData, remainingHours: number): number {
    const eventStartTimeVal = data.eventStartTime;
    const eventEndTimeVal = data.eventEndTime;
    const eventStartTime = typeof eventStartTimeVal === 'string' ? eventStartTimeVal : '';
    const eventEndTime = typeof eventEndTimeVal === 'string' ? eventEndTimeVal : '';
    const eventStart = this.parseTimeToMinutes(eventStartTime);
    const eventEnd = this.parseTimeToMinutes(eventEndTime);
    if (eventStart <= 0 || eventEnd <= eventStart) return 0;

    const eventDuration = (eventEnd - eventStart) / 60;
    let total = eventDuration;

    // Travel time
    if (data.includeTravel !== false) {
      const pickupAddressVal = data.pickupAddress;
      const eventAddressVal = data.eventAddress;
      const pickupAddress = typeof pickupAddressVal === 'string' ? pickupAddressVal : '';
      const eventAddress = typeof eventAddressVal === 'string' ? eventAddressVal : '';
      const hasDiff = pickupAddress.trim().toLowerCase() !== eventAddress.trim().toLowerCase();
      
      // Outbound travel (pickup to event)
      const pickupTimeVal = data.pickupTime;
      if (pickupTimeVal && eventStart) {
        const pickupTime = typeof pickupTimeVal === 'string' ? pickupTimeVal : '';
        const pickupMin = this.parseTimeToMinutes(pickupTime);
        if (pickupMin > 0 && eventStart > pickupMin) {
          total += (eventStart - pickupMin) / 60;
        } else {
          total += hasDiff ? 2 : 1;
        }
      } else {
        total += hasDiff ? 2 : 1;
      }

      // Return travel (event to drop-off)
      const dropoffAddressVal = data.dropoffAddress;
      const dropoffAddress = typeof dropoffAddressVal === 'string' ? dropoffAddressVal : '';
      const dropoffSame = data.dropoffSameAsPickup || 
        (dropoffAddress && pickupAddress && 
         dropoffAddress.trim().toLowerCase() === pickupAddress.trim().toLowerCase());
      
      if (dropoffSame && hasDiff) {
        total += 2; // Return to pickup location
      } else if (dropoffAddress && eventAddress && 
                 dropoffAddress.trim().toLowerCase() !== eventAddress.trim().toLowerCase()) {
        total += 1; // Travel to different drop-off
      }
    }

    return Math.min(Math.max(0.5, total), Math.max(0.5, remainingHours));
  }

  initializeData(parentAddress?: string): UniversalItineraryData {
    return {
      eventAddress: parentAddress || '', // Default to parent address
      eventStartTime: '',
      eventEndTime: '',
      pickupAddress: parentAddress || '', // Default to parent address
      pickupTime: '',
      dropoffAddress: '',
      dropoffSameAsPickup: true,
      includeTravel: true,
      parentAddress,
    };
  }
  
  renderPreview(
    data: UniversalItineraryData,
    props: SessionPreviewProps
  ): React.ReactNode {
    const pickup = (typeof props.pickupAddress === 'string' ? props.pickupAddress : null) 
      || (typeof data.parentAddress === 'string' ? data.parentAddress : null) 
      || 'Pending address';
    const dropoff = (typeof props.dropoffAddress === 'string' ? props.dropoffAddress : null)
      || (typeof props.pickupAddress === 'string' ? props.pickupAddress : null)
      || (typeof data.parentAddress === 'string' ? data.parentAddress : null)
      || 'Pending address';
    const travelBefore = props.travelBreakdown?.before ?? 0;
    const travelAfter = props.travelBreakdown?.after ?? 0;
    const eventDuration =
      typeof data.eventStartTime === 'string' && typeof data.eventEndTime === 'string'
        ? Math.max(0, (this.parseTimeToMinutes(data.eventEndTime) - this.parseTimeToMinutes(data.eventStartTime)) / 60)
        : 0;

    if (!props.effectiveStartTime) {
      return (
        <div className="text-xs text-gray-500 italic">Complete itinerary to see session preview</div>
      );
    }
    
    return (
      <div className="pt-4 border-t-2 border-amber-200">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-[#0080FF] space-y-3 text-xs text-gray-700">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <CalendarIcon className="text-[#0080FF]" size={18} />
            <span>Door-to-door overview</span>
            {props.effectiveDuration && (
              <span className="ml-auto text-[#0080FF]">{props.formatHours(props.effectiveDuration)}</span>
            )}
          </div>
          <div className="text-base font-semibold text-gray-900">
            {moment(props.selectedDate).format('dddd, MMM D, YYYY')}
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-xs text-gray-700">
            <div className="space-y-1">
              <div className="text-[11px] uppercase text-gray-500 tracking-wide">Pickup</div>
              <div className="font-semibold">{pickup}</div>
              <div>{props.effectiveStartTime || 'Pending time'}</div>
              {travelBefore > 0 && (
                <div className="text-[11px] text-gray-500 mt-0.5">
                  Includes ~{travelBefore.toFixed(1)}h travel
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="text-[11px] uppercase text-gray-500 tracking-wide">Drop-off</div>
              <div className="font-semibold">{dropoff}</div>
              <div>
                {(() => {
                  if (!data.eventEndTime || typeof data.eventEndTime !== 'string') return 'Pending time';
                  const endMoment = moment(data.eventEndTime, 'HH:mm');
                  return endMoment.clone().add(travelAfter, 'hours').format('HH:mm');
                })()}
              </div>
              {travelAfter > 0 && (
                <div className="text-[11px] text-gray-500 mt-0.5">
                  Includes ~{travelAfter.toFixed(1)}h travel
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="text-[11px] uppercase text-gray-500 tracking-wide">Event</div>
              <div className="font-semibold">{typeof data.eventAddress === 'string' ? data.eventAddress : 'Pending destination'}</div>
              <div>
                {data.eventStartTime && data.eventEndTime
                  ? `${data.eventStartTime} – ${data.eventEndTime}`
                  : 'Pending times'}
              </div>
              {eventDuration > 0 && (
                <div className="text-[11px] text-gray-500 mt-0.5">
                  {eventDuration.toFixed(1)}h on-site
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="text-[11px] uppercase text-gray-500 tracking-wide">What’s included</div>
              <div>✅ Transport escort & supervision</div>
              <div>✅ Specialist support during the event</div>
              <div>✅ Parent recap after drop-off</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render(
    data: UniversalItineraryData,
    onChange: (patch: Partial<UniversalItineraryData>) => void,
    props: ItineraryRenderProps
  ): React.ReactNode {
    return <SingleDayEventRenderer data={data} onChange={onChange} props={props} strategy={this} />;
  }
}

// Renderer component
const SingleDayEventRenderer: React.FC<{
  data: UniversalItineraryData;
  onChange: (patch: Partial<UniversalItineraryData>) => void;
  props: ItineraryRenderProps;
  strategy: SingleDayEventStrategy;
}> = ({ data, onChange, props, strategy }) => {
  const { parseTimeToMinutes, remainingHours, parentAddress } = props;
  
  const validations = useMemo(() => strategy.getSectionValidations(data), [data, strategy]);
  const { isSectionOpen, isSectionEnabled, toggleSection } = useProgressiveDisclosure({
    sections: ['event', 'transport', 'options'],
    validations,
    autoExpand: true,
  });

  const pickupSuggestions = strategy.getPickupSuggestions(data);
  const effectivePickupTime = strategy.getEffectivePickupTime(data);

  return (
    <div className="mb-3 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <CalendarIcon className="text-[#0080FF]" size={20} />
        <h3 className="text-base font-bold text-[#1E3A5F]">Event Itinerary</h3>
      </div>

      {/* Event Details */}
      <ItinerarySection
        title="Event Details"
        icon={<CalendarIcon className="text-white" size={16} />}
        color="blue"
        collapsed={!isSectionOpen('event')}
        onToggle={() => toggleSection('event')}
        summary={
          data.eventAddress
            ? `${data.eventAddress}${
                data.eventStartTime && data.eventEndTime ? ` • ${data.eventStartTime}-${data.eventEndTime}` : ''
              }`
            : 'Add address & times'
        }
      >
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Address <span className="text-xs font-normal text-gray-500">(required)</span>
            </label>
            <input
              className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 text-sm focus:border-[#0080FF] focus:outline-none"
              value={typeof data.eventAddress === 'string' ? data.eventAddress : ''}
              onChange={(e) => onChange({ eventAddress: e.target.value })}
              placeholder="e.g., MK31 4VN or Manchester Arena"
              disabled={typeof data.eventAddress === 'string' && data.eventAddress === parentAddress}
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Just a postcode or venue name is enough
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event Start <span className="text-xs font-normal text-gray-500">(when event begins)</span>
              </label>
              <input
                type="time"
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 text-sm focus:border-[#0080FF] focus:outline-none"
                value={typeof data.eventStartTime === 'string' ? data.eventStartTime : ''}
                onChange={(e) => onChange({ eventStartTime: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event End <span className="text-xs font-normal text-gray-500">(when event finishes)</span>
              </label>
              <input
                type="time"
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 text-sm focus:border-[#0080FF] focus:outline-none"
                value={typeof data.eventEndTime === 'string' ? data.eventEndTime : ''}
                onChange={(e) => onChange({ eventEndTime: e.target.value })}
              />
            </div>
          </div>
        </div>
      </ItinerarySection>

      {/* Transport Details */}
      <TransportSection
        parentAddress={parentAddress}
        pickupAddress={typeof data.pickupAddress === 'string' ? data.pickupAddress : ''}
        onPickupAddressChange={(v) => onChange({ pickupAddress: v })}
        pickupTime={typeof data.pickupTime === 'string' ? data.pickupTime : ''}
        onPickupTimeChange={(v) => onChange({ pickupTime: v })}
        pickupTimeOverridden={false}
        pickupTimeSuggested={effectivePickupTime}
        pickupTimeOptions={validations.event ? pickupSuggestions : []}
        onPickupTimeOverride={undefined}
        pickupTimeHelperText={validations.event ? 
          (() => {
            const eventStartTime = typeof data.eventStartTime === 'string' ? data.eventStartTime : '';
            const pickupAddress = typeof data.pickupAddress === 'string' ? data.pickupAddress : '';
            const eventAddress = typeof data.eventAddress === 'string' ? data.eventAddress : '';
            return `From ${eventStartTime} - ${pickupAddress && eventAddress && 
              pickupAddress.trim().toLowerCase() !== eventAddress.trim().toLowerCase() ? '2h' : '1h'} travel`;
          })() : 
          'Fill event details first'}
        dropoffAddress={typeof data.dropoffAddress === 'string' ? data.dropoffAddress : ''}
        dropoffSameAsPickup={data.dropoffSameAsPickup !== false}
        onDropoffAddressChange={(v) => onChange({ dropoffAddress: v })}
        onDropoffSameAsPickupChange={(v) => onChange({ dropoffSameAsPickup: v })}
        compact
        disabled={!isSectionEnabled('transport')}
        collapsed={!isSectionOpen('transport')}
        onToggle={() => toggleSection('transport')}
      />

      {/* Additional Options */}
      <ItinerarySection
        title="Additional Options"
        icon={<CheckCircle className="text-white" size={16} />}
        color="green"
        collapsed={!isSectionOpen('options')}
        onToggle={() => toggleSection('options')}
        disabled={!isSectionEnabled('options')}
        summary={data.includeTravel === false ? 'Travel excluded' : 'Travel included'}
      >
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 transition-colors">
            <input
              type="checkbox"
              className="h-5 w-5 text-[#0080FF] rounded border-gray-300 focus:ring-[#0080FF]"
              checked={data.includeTravel !== false}
              onChange={(e) => onChange({ includeTravel: e.target.checked })}
            />
            <div className="flex-1">
              <span className="text-sm font-semibold text-gray-900">Travel time included in total hours</span>
              <p className="text-xs text-gray-600 mt-0.5">Estimated travel time is included in your session duration</p>
            </div>
          </label>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-900 font-medium">
              💙 CAMS provides full support (travel, meals, supervision). Receipts can be provided if required.
            </p>
          </div>
        </div>
      </ItinerarySection>
    </div>
  );
};

