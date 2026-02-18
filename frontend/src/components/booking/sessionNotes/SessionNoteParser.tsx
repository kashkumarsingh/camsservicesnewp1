/**
 * Session Note Parser Component
 * 
 * Single component that uses the Strategy Factory to parse and format
 * session notes based on the selected mode. Follows Strategy + Factory pattern.
 */

'use client';

import React from 'react';
import { getNoteStrategyFactory } from './factory/registerNoteStrategies';
import { UniversalItineraryData } from '@/interfaces/web/shared/itineraries/services/ItineraryService';
import { ItineraryTemplate } from '@/interfaces/web/shared/itineraries/universal/ItinerarySchema';

interface SessionNoteParserProps {
  modeKey: string | null;
  notes: string;
  template?: ItineraryTemplate;
  onParse: (result: {
    itineraryData: Partial<UniversalItineraryData>;
    additionalNotes: string;
    shouldEnableAutoCalc?: boolean;
  }) => void;
}

/**
 * Parse session notes using the appropriate strategy
 */
export function parseSessionNotes(
  modeKey: string | null,
  notes: string,
  template?: ItineraryTemplate
): {
  itineraryData: Partial<UniversalItineraryData>;
  additionalNotes: string;
  shouldEnableAutoCalc?: boolean;
} {
  if (!modeKey || !notes) {
    return { itineraryData: {}, additionalNotes: notes || '' };
  }
  
  const factory = getNoteStrategyFactory();
  const strategy = factory.get(modeKey);
  
  if (!strategy) {
    return { itineraryData: {}, additionalNotes: notes };
  }
  
  return strategy.parseNotes(notes, template);
}

/**
 * Format itinerary data into session notes using the appropriate strategy
 */
export function formatSessionNotes(
  modeKey: string | null,
  data: UniversalItineraryData,
  additionalNotes?: string
): string {
  if (!modeKey) {
    return additionalNotes || '';
  }
  
  const factory = getNoteStrategyFactory();
  const strategy = factory.get(modeKey);
  
  if (!strategy) {
    return additionalNotes || '';
  }
  
  return strategy.formatNotes(data, additionalNotes);
}

/**
 * Extract additional notes (non-itinerary content)
 */
export function extractAdditionalNotes(
  modeKey: string | null,
  notes: string
): string {
  if (!modeKey || !notes) {
    return notes || '';
  }
  
  const factory = getNoteStrategyFactory();
  const strategy = factory.get(modeKey);
  
  if (!strategy) {
    return notes;
  }
  
  return strategy.extractAdditionalNotes(notes);
}

// Component for React usage (if needed)
export const SessionNoteParser: React.FC<SessionNoteParserProps> = ({
  modeKey,
  notes,
  template,
  onParse,
}) => {
  const result = parseSessionNotes(modeKey, notes, template);
  React.useEffect(() => {
    onParse(result);
  }, [modeKey, notes, template]); // eslint-disable-line react-hooks/exhaustive-deps
  
  return null; // This component doesn't render anything
};

export default SessionNoteParser;

