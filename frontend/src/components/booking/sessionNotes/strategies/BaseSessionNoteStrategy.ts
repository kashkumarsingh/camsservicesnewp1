/**
 * Base Session Note Strategy
 * 
 * Provides common utilities for parsing and formatting session notes.
 */

import { ISessionNoteStrategy } from './ISessionNoteStrategy';
import { UniversalItineraryData } from '@/interfaces/web/shared/itineraries/services/ItineraryService';
import { ItineraryTemplate } from '@/interfaces/web/shared/itineraries/universal/ItinerarySchema';

export abstract class BaseSessionNoteStrategy implements ISessionNoteStrategy {
  abstract readonly modeKey: string;
  abstract readonly itineraryHeader: string;
  
  abstract parseNotes(
    notes: string,
    template?: ItineraryTemplate
  ): {
    itineraryData: Partial<UniversalItineraryData>;
    additionalNotes: string;
    shouldEnableAutoCalc?: boolean;
  };
  
  abstract formatNotes(
    data: UniversalItineraryData,
    additionalNotes?: string
  ): string;
  
  /**
   * Extract additional notes (non-itinerary content)
   * Default implementation - can be overridden
   */
  extractAdditionalNotes(notes: string): string {
    if (!notes) return '';
    
    const lines = notes.split('\n');
    const itineraryStart = lines.findIndex(l => 
      l.includes(this.itineraryHeader) || 
      l.includes('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    );
    
    if (itineraryStart >= 0) {
      return lines.slice(0, itineraryStart).join('\n').trim();
    }
    
    return notes.trim();
  }
  
  /**
   * Helper: Find itinerary section in notes
   */
  protected findItinerarySection(notes: string): {
    itineraryLines: string[];
    additionalNotes: string;
  } {
    const lines = notes.split('\n');
    const itineraryStart = lines.findIndex(l => 
      l.includes(this.itineraryHeader) || 
      l.includes('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    );
    
    if (itineraryStart >= 0) {
      const itineraryLines = lines.slice(itineraryStart + 1);
      const additionalNotes = lines.slice(0, itineraryStart).join('\n').trim();
      return { itineraryLines, additionalNotes };
    }
    
    return { itineraryLines: [], additionalNotes: notes.trim() };
  }
  
  /**
   * Helper: Extract value from line using regex
   */
  protected extractValue(line: string, pattern: RegExp, groupIndex: number = 1): string | null {
    const match = line.match(pattern);
    return match && match[groupIndex] ? match[groupIndex].trim() : null;
  }
  
  /**
   * Helper: Check if line contains specific text
   */
  protected lineContains(line: string, ...texts: string[]): boolean {
    return texts.every(text => line.includes(text));
  }
  
  /**
   * Helper: Format notes with separator
   */
  protected formatWithSeparator(additionalNotes: string, itineraryText: string): string {
    const parts = [additionalNotes, itineraryText].filter(Boolean);
    return parts.join('\n\n');
  }
  
  /**
   * Helper: Create separator line
   */
  protected getSeparator(): string {
    return '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  }
}

