/**
 * School Run Note Strategy
 * 
 * Handles parsing and formatting notes for school run bookings
 */

import { BaseSessionNoteStrategy } from './BaseSessionNoteStrategy';
import { UniversalItineraryData } from '@/interfaces/web/shared/itineraries/services/ItineraryService';
import { ItineraryTemplate } from '@/interfaces/web/shared/itineraries/universal/ItinerarySchema';
import { formatItineraryAsText } from '@/interfaces/web/shared/itineraries/types';

export class SchoolRunNoteStrategy extends BaseSessionNoteStrategy {
  readonly modeKey = 'school-run-after';
  readonly itineraryHeader = 'SCHOOL RUN DETAILS';
  
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
    
    itineraryLines.forEach((line, idx) => {
      if (line.includes('School Address:') || line.includes('School:')) {
        const nextLine = itineraryLines[idx + 1];
        if (nextLine && !nextLine.includes('⏰')) {
          parsedData.schoolAddress = nextLine.trim();
        }
      } else if (line.includes('Pickup Time')) {
        const time = this.extractValue(line, /Pickup Time.*:\s*(.+)/);
        if (time) parsedData.schoolPickupTime = time;
      } else if (line.includes('School End Time:')) {
        const time = this.extractValue(line, /School End Time:\s*(.+)/);
        if (time) parsedData.schoolEndTime = time;
      } else if (line.includes('Drop-off Address:')) {
        const nextLine = itineraryLines[idx + 1];
        if (nextLine) {
          const dropoff = nextLine.trim();
          if (dropoff.toLowerCase() === 'same as pickup') {
            parsedData.schoolDropoffSameAsPickup = true;
          } else {
            parsedData.schoolDropoffAddress = dropoff;
          }
        }
      } else if (line.includes('Homework Support:') || line.includes('Homework:')) {
        parsedData.includeHomework = line.includes('Yes');
      }
    });
    
    return { itineraryData: parsedData, additionalNotes };
  }
  
  formatNotes(
    data: UniversalItineraryData,
    additionalNotes?: string
  ): string {
    const itineraryData = {
      type: 'school-run' as const,
      pickupAddress: typeof data.parentAddress === 'string' ? data.parentAddress : '',
      pickupTime: typeof data.schoolPickupTime === 'string' ? data.schoolPickupTime : '',
      dropoffAddress: typeof data.schoolDropoffAddress === 'string' ? data.schoolDropoffAddress : '',
      dropoffSameAsPickup: !!data.schoolDropoffSameAsPickup,
      schoolAddress: typeof data.schoolAddress === 'string' ? data.schoolAddress : '',
      schoolPickupTime: typeof data.schoolPickupTime === 'string' ? data.schoolPickupTime : '',
      schoolEndTime: typeof data.schoolEndTime === 'string' ? data.schoolEndTime : '',
      includeHomework: !!data.includeHomework,
    };
    
    const itineraryText = formatItineraryAsText(itineraryData);
    return this.formatWithSeparator(additionalNotes || '', itineraryText);
  }
}

