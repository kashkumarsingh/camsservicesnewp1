/**
 * Base Itinerary Strategy
 * 
 * Abstract base class providing common functionality for all itinerary strategies.
 * Implements shared logic to reduce duplication (DRY principle).
 */

import React from 'react';
import moment from 'moment';
import { Calendar as CalendarIcon } from 'lucide-react';
import { IItineraryStrategy, ValidationResult, ItineraryRenderProps, SessionPreviewProps, ModeMetadata } from './IItineraryStrategy';
import { UniversalItineraryData } from '../services/ItineraryService';
import { ValidationState } from '../shared/useProgressiveDisclosure';
import { getSuggestedPickupOptions } from '../shared/pickupUtils';

export abstract class BaseItineraryStrategy implements IItineraryStrategy {
  abstract readonly key: string;
  abstract readonly name: string;
  abstract readonly description: string;
  
  // Abstract methods - must be implemented by subclasses
  abstract getMetadata(): ModeMetadata;
  abstract getSections(): string[];
  abstract getSectionOrder(): string[];
  abstract render(
    data: UniversalItineraryData,
    onChange: (patch: Partial<UniversalItineraryData>) => void,
    props: ItineraryRenderProps
  ): React.ReactNode;
  abstract initializeData(parentAddress?: string): UniversalItineraryData;
  
  // Default validation - can be overridden
  validate(data: UniversalItineraryData): ValidationResult {
    const sectionValidations = this.getSectionValidations(data);
    const missingFields: string[] = [];
    
    // Check if all required sections are valid
    const sections = this.getSectionOrder();
    for (const section of sections) {
      if (!sectionValidations[section]) {
        missingFields.push(section);
      }
    }
    
    return {
      valid: missingFields.length === 0,
      missingFields,
    };
  }
  
  // Default section validations - can be overridden
  getSectionValidations(data: UniversalItineraryData): ValidationState {
    // Default: all sections require validation
    const state: ValidationState = {};
    const sections = this.getSections();
    sections.forEach(section => {
      state[section] = false; // Default to invalid
    });
    return state;
  }
  
  // Default duration calculation - can be overridden
  calculateDuration(data: UniversalItineraryData, remainingHours: number): number {
    // Default: return 0, must be overridden
    return 0;
  }
  
  // Default pickup suggestions - can be overridden
  getPickupSuggestions(data: UniversalItineraryData): string[] {
    // Try to get from pickupSuggestions if available
    const eventTimeVal = data.eventStartTime || data.appointmentTime || data.examTime;
    const fromAddressVal = data.pickupAddress || data.parentAddress;
    const toAddressVal = data.eventAddress || data.hospitalAddress || data.examVenue;
    
    const eventTime = typeof eventTimeVal === 'string' ? eventTimeVal : '';
    const fromAddress = typeof fromAddressVal === 'string' ? fromAddressVal : '';
    const toAddress = typeof toAddressVal === 'string' ? toAddressVal : '';
    
    if (eventTime && fromAddress && toAddress) {
      return getSuggestedPickupOptions({
        eventTime,
        fromAddress,
        toAddress,
        minStartHHMM: '06:00',
      });
    }
    
    return [];
  }
  
  // Default effective pickup time - can be overridden
  getEffectivePickupTime(data: UniversalItineraryData): string | null {
    // First try explicit pickup time
    const pickupTimeVal = data.pickupTime;
    if (pickupTimeVal && typeof pickupTimeVal === 'string') {
      return pickupTimeVal;
    }
    
    // Then try suggestions
    const suggestions = this.getPickupSuggestions(data);
    return suggestions[0] || null;
  }
  
  // Helper: Parse time to minutes
  protected parseTimeToMinutes(t: string): number {
    if (!t) return 0;
    const [hh, mm] = t.split(':').map(Number);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return 0;
    return hh * 60 + mm;
  }
  
  // Helper: Format hours
  protected formatHours(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }
  
  // Default preview rendering - can be overridden
  renderPreview(
    data: UniversalItineraryData,
    props: SessionPreviewProps
  ): React.ReactNode {
    const { selectedDate, effectiveStartTime, duration, autoCalcFromItinerary, computeSuggestedDuration, parseTimeToMinutes, formatHours } = props;
    
    if (!effectiveStartTime) {
      return (
        <div className="text-xs text-gray-500 italic">Complete itinerary to see session preview</div>
      );
    }
    
    const currentDuration = autoCalcFromItinerary && computeSuggestedDuration ? computeSuggestedDuration : duration;
    const [h, m] = effectiveStartTime.split(':').map(Number);
    const start = moment().hours(h).minutes(m);
    const end = start.clone().add(currentDuration, 'hours');
    
    const startMinutes = parseTimeToMinutes(effectiveStartTime);
    const endMinutes = parseTimeToMinutes(end.format('HH:mm'));
    const displayDuration = Math.max(0, (endMinutes - startMinutes) / 60);
    
    return (
      <div className="pt-4 border-t-2 border-amber-200">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-[#0080FF]">
          <div className="flex items-center gap-2 mb-3">
            <CalendarIcon className="text-[#0080FF]" size={18} />
            <span className="text-sm font-bold text-[#1E3A5F]">Session Preview</span>
          </div>
          <div className="space-y-3">
            <div className="text-base font-semibold text-gray-900">
              {moment(selectedDate).format('dddd, MMM D, YYYY')}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#0080FF] font-bold text-base">{effectiveStartTime}</span>
              <span className="text-gray-400">→</span>
              <span className="text-[#0080FF] font-bold text-base">{end.format('HH:mm')}</span>
              <span className="ml-2 px-2 py-1 bg-white rounded-lg border border-[#0080FF]/30 text-xs font-semibold text-[#0080FF]">
                {formatHours(displayDuration)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

