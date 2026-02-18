/**
 * Hospital Appointment Note Strategy
 * 
 * Handles parsing and formatting notes for hospital appointments
 */

import { BaseSessionNoteStrategy } from './BaseSessionNoteStrategy';
import { UniversalItineraryData } from '@/interfaces/web/shared/itineraries/services/ItineraryService';
import { ItineraryTemplate } from '@/interfaces/web/shared/itineraries/universal/ItinerarySchema';
import { formatItineraryAsText } from '@/interfaces/web/shared/itineraries/types';

export class HospitalAppointmentNoteStrategy extends BaseSessionNoteStrategy {
  readonly modeKey = 'hospital-appointment';
  readonly itineraryHeader = 'HOSPITAL APPOINTMENT DETAILS';
  
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
      const waitSeg = template.segments.find(s => s.type === 'wait') as any;
      
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
        // Hospital Address
        else if ((line.includes('Hospital/Clinic Address:') || line.includes('Hospital:')) && stopSeg) {
          const nextLine = itineraryLines[idx + 1];
          if (nextLine && !nextLine.includes('⏰')) {
            parsedData[stopSeg.addressKey] = nextLine.trim();
          }
        }
        // Appointment Time
        else if (line.includes('Appointment Time:') && stopSeg) {
          const time = this.extractValue(line, /Appointment Time:\s*(.+)/);
          if (time && stopSeg.startTimeKey) {
            parsedData[stopSeg.startTimeKey] = time;
          }
        }
        // Waiting Room Duration
        else if (line.includes('Waiting Room Duration:') && waitSeg) {
          const duration = this.extractValue(line, /Waiting Room Duration:\s*(.+?)\s*hour/);
          if (duration && waitSeg.durationKey) {
            parsedData[waitSeg.durationKey] = duration;
          }
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
        // Medical Notes
        else if (line.includes('Medical Notes:')) {
          const nextLine = itineraryLines[idx + 1];
          if (nextLine) {
            parsedData.medicalNotes = nextLine.trim();
          }
        }
      });
    } else {
      // Fallback parsing
      itineraryLines.forEach((line, idx) => {
        if (line.includes('Pickup Address:') || line.includes('Pickup:')) {
          const nextLine = itineraryLines[idx + 1];
          if (nextLine && !nextLine.includes('⏰') && !nextLine.includes('Time:')) {
            parsedData.hospitalPickupAddress = nextLine.trim();
          }
        } else if (line.includes('Hospital/Clinic Address:') || line.includes('Hospital:')) {
          const nextLine = itineraryLines[idx + 1];
          if (nextLine && !nextLine.includes('⏰')) {
            parsedData.hospitalAddress = nextLine.trim();
          }
        } else if (line.includes('Appointment Time:')) {
          const time = this.extractValue(line, /Appointment Time:\s*(.+)/);
          if (time) parsedData.appointmentTime = time;
        } else if (line.includes('Waiting Room Duration:')) {
          const duration = this.extractValue(line, /Waiting Room Duration:\s*(.+?)\s*hour/);
          if (duration) parsedData.waitingRoomDuration = duration;
        } else if (line.includes('Drop-off Address:')) {
          const nextLine = itineraryLines[idx + 1];
          if (nextLine) {
            const dropoff = nextLine.trim();
            if (dropoff.toLowerCase() === 'same as pickup') {
              parsedData.hospitalDropoffSameAsPickup = true;
            } else {
              parsedData.hospitalDropoffAddress = dropoff;
            }
          }
        } else if (line.includes('Medical Notes:')) {
          const nextLine = itineraryLines[idx + 1];
          if (nextLine) parsedData.medicalNotes = nextLine.trim();
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
      type: 'hospital-appointment' as const,
      pickupAddress: typeof data.hospitalPickupAddress === 'string' ? data.hospitalPickupAddress : '',
      pickupTime: typeof data.hospitalPickupTime === 'string' ? data.hospitalPickupTime : '',
      dropoffAddress: typeof data.hospitalDropoffAddress === 'string' ? data.hospitalDropoffAddress : '',
      dropoffSameAsPickup: !!data.hospitalDropoffSameAsPickup,
      hospitalAddress: typeof data.hospitalAddress === 'string' ? data.hospitalAddress : '',
      appointmentTime: typeof data.appointmentTime === 'string' ? data.appointmentTime : '',
      waitingRoomDuration: typeof data.waitingRoomDuration === 'string' || typeof data.waitingRoomDuration === 'number' ? String(data.waitingRoomDuration) : '0',
      medicalNotes: typeof data.medicalNotes === 'string' ? data.medicalNotes : '',
    };
    
    const itineraryText = formatItineraryAsText(itineraryData);
    return this.formatWithSeparator(additionalNotes || '', itineraryText);
  }
}

