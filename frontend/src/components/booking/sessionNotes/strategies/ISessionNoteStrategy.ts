/**
 * Session Note Strategy Interface
 * 
 * Defines the contract for parsing and formatting session notes
 * for different booking modes.
 */

import { UniversalItineraryData } from '@/interfaces/web/shared/itineraries/services/ItineraryService';
import { ItineraryTemplate } from '@/interfaces/web/shared/itineraries/universal/ItinerarySchema';

export interface ISessionNoteStrategy {
  readonly modeKey: string;
  readonly itineraryHeader: string; // e.g., "EVENT ITINERARY", "HOSPITAL APPOINTMENT DETAILS"
  
  /**
   * Parse notes string into itinerary data
   * @param notes - Full notes string from session
   * @param template - Optional template for universal system
   * @returns Parsed itinerary data and additional notes
   */
  parseNotes(
    notes: string,
    template?: ItineraryTemplate
  ): {
    itineraryData: Partial<UniversalItineraryData>;
    additionalNotes: string;
    shouldEnableAutoCalc?: boolean;
  };
  
  /**
   * Format itinerary data into notes string
   * @param data - Itinerary data to format
   * @param additionalNotes - Additional notes to prepend
   * @returns Formatted notes string
   */
  formatNotes(
    data: UniversalItineraryData,
    additionalNotes?: string
  ): string;
  
  /**
   * Extract additional notes (non-itinerary content)
   * @param notes - Full notes string
   * @returns Additional notes without itinerary section
   */
  extractAdditionalNotes(notes: string): string;
}

