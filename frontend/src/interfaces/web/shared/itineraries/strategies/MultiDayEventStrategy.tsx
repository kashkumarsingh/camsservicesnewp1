/**
 * Multi-Day Event Strategy
 * 
 * Handles multi-day events/trips with travel
 * Reuses Single-Day Event structure per day
 */

'use client';

import React from 'react';
import { Calendar as CalendarIcon, Calendar } from 'lucide-react';
import { BaseItineraryStrategy } from './BaseItineraryStrategy';
import { ItineraryRenderProps } from './IItineraryStrategy';
import { UniversalItineraryData } from '../services/ItineraryService';
import { ValidationState } from '../shared/useProgressiveDisclosure';
import { SingleDayEventStrategy } from './SingleDayEventStrategy';

export class MultiDayEventStrategy extends BaseItineraryStrategy {
  readonly key = 'multi-day-event';
  readonly name = 'Multi-Day Event/Trip';
  readonly description = 'Multi-day trip, camp, or event with travel.';

  getMetadata() {
    return {
      title: 'Multi-day event',
      shortDesc: 'Multi-day trip/camp with travel',
      icon: Calendar,
      badge: 'Popular',
      required: ['travel_escort', 'overnight'],
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
    // Reuse single-day validation logic
    return (new SingleDayEventStrategy()).getSectionValidations(data);
  }

  calculateDuration(data: UniversalItineraryData, remainingHours: number): number {
    // For multi-day, we calculate per day
    // This is a simplified version - in production, you'd handle multiple days
    return (new SingleDayEventStrategy()).calculateDuration(data, remainingHours);
  }

  initializeData(parentAddress?: string): UniversalItineraryData {
    return {
      eventAddress: '',
      eventStartTime: '',
      eventEndTime: '',
      pickupAddress: parentAddress || '',
      pickupTime: '',
      dropoffAddress: '',
      dropoffSameAsPickup: true,
      includeTravel: true,
      parentAddress,
      // Multi-day specific
      numberOfDays: 1,
    };
  }

  render(
    data: UniversalItineraryData,
    onChange: (patch: Partial<UniversalItineraryData>) => void,
    props: ItineraryRenderProps
  ): React.ReactNode {
    // For now, reuse single-day renderer
    // In production, you'd add day selection UI
    return (
      <div className="mb-3 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <CalendarIcon className="text-[#0080FF]" size={20} />
          <h3 className="text-base font-bold text-[#1E3A5F]">Multi-Day Event Itinerary</h3>
        </div>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            💡 Multi-day event support is coming soon. For now, please book each day separately.
          </p>
        </div>
        {/* Reuse single-day renderer for first day */}
        {(new SingleDayEventStrategy()).render(data, onChange, props)}
      </div>
    );
  }
}

