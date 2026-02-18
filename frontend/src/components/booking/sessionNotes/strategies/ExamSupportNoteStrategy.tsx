/**
 * Exam Support Note Strategy
 * 
 * Handles parsing and formatting notes for exam support bookings
 */

import { BaseSessionNoteStrategy } from './BaseSessionNoteStrategy';
import { UniversalItineraryData } from '@/interfaces/web/shared/itineraries/services/ItineraryService';
import { ItineraryTemplate } from '@/interfaces/web/shared/itineraries/universal/ItinerarySchema';
import { formatItineraryAsText } from '@/interfaces/web/shared/itineraries/types';

export class ExamSupportNoteStrategy extends BaseSessionNoteStrategy {
  readonly modeKey = 'exam-support';
  readonly itineraryHeader = 'EXAM SUPPORT DETAILS';
  
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
    
    if (template) {
      const transportSeg = template.segments.find(s => s.type === 'transport') as any;
      const stopSeg = template.segments.find(s => s.type === 'stop') as any;
      
      itineraryLines.forEach((line, idx) => {
        // Pickup Address
        if (line.includes('Pickup Address:') || line.includes('Pickup:')) {
          const nextLine = itineraryLines[idx + 1];
          if (nextLine && !nextLine.includes('⏰') && !nextLine.includes('Time:') && transportSeg) {
            parsedData[transportSeg.pickupFieldKeys.pickupAddress] = nextLine.trim();
          }
          
          // Check for pickup time
          const timeLine = itineraryLines.find((l, i) => i > idx && l.includes('Time:'));
          if (timeLine && transportSeg) {
            const time = this.extractValue(timeLine, /Time:\s*(.+)/);
            if (time) parsedData[transportSeg.pickupFieldKeys.pickupTime] = time;
          }
        }
        // Exam Venue
        else if ((line.includes('Exam Venue:') || line.includes('Venue:')) && stopSeg) {
          const nextLine = itineraryLines[idx + 1];
          if (nextLine && !nextLine.includes('⏰')) {
            parsedData[stopSeg.addressKey] = nextLine.trim();
          }
        }
        // Exam Time (handle both "Exam Time:" and "Exam Start Time:")
        else if ((line.includes('Exam Time:') || line.includes('Exam Start Time:')) && stopSeg) {
          const time = this.extractValue(line, /(?:Exam )?(?:Start )?Time:\s*(.+)/);
          if (time && stopSeg.startTimeKey) {
            parsedData[stopSeg.startTimeKey] = time;
          }
        }
        // Exam Duration
        else if (line.includes('Duration:') || line.includes('Exam Duration:')) {
          const duration = this.extractValue(line, /(?:Exam )?Duration:\s*(.+?)\s*hour/);
          if (duration) parsedData.examDuration = duration;
        }
        // Drop-off Address
        else if (line.includes('Drop-off Address:') && transportSeg) {
          const nextLine = itineraryLines[idx + 1];
          if (nextLine) {
            const dropoff = nextLine.trim();
            if (dropoff.toLowerCase() === 'same as pickup') {
              parsedData[transportSeg.dropoffFieldKeys.dropoffSameAsPickup] = true;
            } else {
              parsedData[transportSeg.dropoffFieldKeys.dropoffAddress] = dropoff;
            }
          }
        }
        // Exam Accommodations
        else if (line.includes('Accommodations:')) {
          const nextLine = itineraryLines[idx + 1];
          if (nextLine) {
            parsedData.examAccommodations = nextLine.trim();
          }
        }
      });
    } else {
      // Fallback parsing
      itineraryLines.forEach((line, idx) => {
        if (line.includes('Pickup Address:') || line.includes('Pickup:')) {
          const nextLine = itineraryLines[idx + 1];
          if (nextLine && !nextLine.includes('⏰') && !nextLine.includes('Time:')) {
            parsedData.examPickupAddress = nextLine.trim();
          }
        } else if (line.includes('Exam Venue:') || line.includes('Venue:')) {
          const nextLine = itineraryLines[idx + 1];
          if (nextLine && !nextLine.includes('⏰')) {
            parsedData.examVenue = nextLine.trim();
          }
        } else if (line.includes('Exam Time:') || line.includes('Exam Start Time:')) {
          const time = this.extractValue(line, /(?:Exam )?(?:Start )?Time:\s*(.+)/);
          if (time) parsedData.examTime = time;
        } else if (line.includes('Duration:') || line.includes('Exam Duration:')) {
          const duration = this.extractValue(line, /(?:Exam )?Duration:\s*(.+?)\s*hour/);
          if (duration) parsedData.examDuration = duration;
        } else if (line.includes('Drop-off Address:')) {
          const nextLine = itineraryLines[idx + 1];
          if (nextLine) {
            const dropoff = nextLine.trim();
            if (dropoff.toLowerCase() === 'same as pickup') {
              parsedData.examDropoffSameAsPickup = true;
            } else {
              parsedData.examDropoffAddress = dropoff;
            }
          }
        } else if (line.includes('Accommodations:')) {
          const nextLine = itineraryLines[idx + 1];
          if (nextLine) parsedData.examAccommodations = nextLine.trim();
        }
      });
    }
    
    return { itineraryData: parsedData, additionalNotes };
  }
  
  formatNotes(
    data: UniversalItineraryData,
    additionalNotes?: string
  ): string {
    const itineraryData = {
      type: 'exam-support' as const,
      pickupAddress: typeof data.examPickupAddress === 'string' ? data.examPickupAddress : '',
      pickupTime: typeof data.examPickupTime === 'string' ? data.examPickupTime : '',
      dropoffAddress: typeof data.examDropoffAddress === 'string' ? data.examDropoffAddress : '',
      dropoffSameAsPickup: !!data.examDropoffSameAsPickup,
      examVenue: typeof data.examVenue === 'string' ? data.examVenue : '',
      examTime: typeof data.examTime === 'string' ? data.examTime : '',
      examDuration: typeof data.examDuration === 'string' || typeof data.examDuration === 'number' ? String(data.examDuration) : '0',
      examAccommodations: typeof data.examAccommodations === 'string' ? data.examAccommodations : '',
    };
    
    const itineraryText = formatItineraryAsText(itineraryData);
    return this.formatWithSeparator(additionalNotes || '', itineraryText);
  }
}

