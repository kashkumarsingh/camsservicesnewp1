/**
 * Single Day Event Note Strategy
 * 
 * Handles parsing and formatting notes for single-day events
 */

import { BaseSessionNoteStrategy } from './BaseSessionNoteStrategy';
import { UniversalItineraryData } from '@/interfaces/web/shared/itineraries/services/ItineraryService';
import { ItineraryTemplate } from '@/interfaces/web/shared/itineraries/universal/ItinerarySchema';
import { formatItineraryAsText } from '@/interfaces/web/shared/itineraries/types';

export class SingleDayEventNoteStrategy extends BaseSessionNoteStrategy {
  readonly modeKey = 'single-day-event';
  readonly itineraryHeader = 'EVENT ITINERARY';
  
  parseNotes(
    notes: string,
    template?: ItineraryTemplate
  ): {
    itineraryData: Partial<UniversalItineraryData>;
    additionalNotes: string;
    shouldEnableAutoCalc?: boolean;
  } {
    const { itineraryLines, additionalNotes } = this.findItinerarySection(notes);
    
    if (itineraryLines.length === 0) {
      return { itineraryData: {}, additionalNotes };
    }
    
    const parsedData: Partial<UniversalItineraryData> = {};
    let shouldEnableAutoCalc = false;
    
    // Use template-based parsing if available
    if (template) {
      const transportSeg = template.segments.find(s => s.type === 'transport') as any;
      const stopSeg = template.segments.find(s => s.type === 'stop') as any;
      
      itineraryLines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.includes('━')) return;
        
        // Pickup Address
        if (this.lineContains(trimmed, '📍', 'Pickup Address:') && transportSeg) {
          const address = this.extractValue(trimmed, /Pickup Address:\s*(.+)/);
          if (address) {
            parsedData[transportSeg.pickupFieldKeys.pickupAddress] = address;
          }
          
          // Check next line for pickup time
          const nextLine = itineraryLines[idx + 1]?.trim();
          if (nextLine && nextLine.startsWith('Time:')) {
            const time = this.extractValue(nextLine, /Time:\s*(.+)/);
            if (time && time !== '—') {
              parsedData[transportSeg.pickupFieldKeys.pickupTime] = time;
            }
          }
        }
        // Event Address
        else if (this.lineContains(trimmed, '🎯', 'Event Address:') && stopSeg) {
          const address = this.extractValue(trimmed, /Event Address:\s*(.+)/);
          if (address) {
            parsedData[stopSeg.addressKey] = address;
          }
          
          // Check next line for event time
          const nextLine = itineraryLines[idx + 1]?.trim();
          if (nextLine && nextLine.startsWith('Time:')) {
            const timeMatch = nextLine.match(/Time:\s*(.+?)\s*–\s*(.+)/);
            if (timeMatch) {
              if (stopSeg.startTimeKey) {
                parsedData[stopSeg.startTimeKey] = timeMatch[1].trim();
              }
              if (stopSeg.endTimeKey) {
                parsedData[stopSeg.endTimeKey] = timeMatch[2].trim();
                shouldEnableAutoCalc = true;
              }
            }
          }
        }
        // Drop-off
        else if (this.lineContains(trimmed, '🚗', 'Drop-off:') && transportSeg) {
          const dropoff = this.extractValue(trimmed, /Drop-off:\s*(.+)/);
          if (dropoff) {
            const lower = dropoff.toLowerCase();
            if (lower.includes('same as pickup') || lower === 'same as pickup') {
              parsedData[transportSeg.dropoffFieldKeys.dropoffSameAsPickup] = true;
            } else {
              parsedData[transportSeg.dropoffFieldKeys.dropoffAddress] = dropoff;
            }
          }
        }
        // Travel included
        else if (this.lineContains(trimmed, '✈️', 'Travel included:')) {
          parsedData.includeTravel = trimmed.includes('Yes');
        }
      });
    } else {
      // Fallback parsing (old system)
      itineraryLines.forEach((line, idx) => {
        if (line.includes('Pickup Address:')) {
          const nextLine = itineraryLines[idx + 1];
          if (nextLine) {
            parsedData.pickupAddress = nextLine.trim();
          }
        } else if (line.includes('Time:') && line.includes('Pickup')) {
          const time = this.extractValue(line, /Time:\s*(.+)/);
          if (time) parsedData.pickupTime = time;
        } else if (line.includes('Event Address:')) {
          const nextLine = itineraryLines[idx + 1];
          if (nextLine) {
            parsedData.eventAddress = nextLine.trim();
          }
        } else if (line.includes('Time:') && line.includes('Event')) {
          const match = line.match(/Time:\s*(.+?)\s*–\s*(.+)/);
          if (match) {
            parsedData.eventStartTime = match[1].trim();
            parsedData.eventEndTime = match[2].trim();
            shouldEnableAutoCalc = true;
          }
        } else if (line.includes('Drop-off Address:')) {
          const nextLine = itineraryLines[idx + 1];
          if (nextLine) {
            const dropoff = nextLine.trim();
            if (dropoff.toLowerCase() === 'same as pickup') {
              parsedData.dropoffSameAsPickup = true;
            } else {
              parsedData.dropoffAddress = dropoff;
            }
          }
        } else if (line.includes('Travel included:')) {
          parsedData.includeTravel = line.includes('Yes');
        }
      });
    }
    
    return {
      itineraryData: parsedData,
      additionalNotes,
      shouldEnableAutoCalc,
    };
  }
  
  formatNotes(
    data: UniversalItineraryData,
    additionalNotes?: string
  ): string {
    const itineraryData = {
      type: 'single-day-event' as const,
      pickupAddress: typeof data.pickupAddress === 'string' ? data.pickupAddress : '',
      pickupTime: typeof data.pickupTime === 'string' ? data.pickupTime : '',
      dropoffAddress: typeof data.dropoffAddress === 'string' ? data.dropoffAddress : '',
      dropoffSameAsPickup: !!data.dropoffSameAsPickup,
      eventAddress: typeof data.eventAddress === 'string' ? data.eventAddress : '',
      eventStartTime: typeof data.eventStartTime === 'string' ? data.eventStartTime : '',
      eventEndTime: typeof data.eventEndTime === 'string' ? data.eventEndTime : '',
      includeTravel: data.includeTravel !== false,
    };
    
    const itineraryText = formatItineraryAsText(itineraryData);
    return this.formatWithSeparator(additionalNotes || '', itineraryText);
  }
}

