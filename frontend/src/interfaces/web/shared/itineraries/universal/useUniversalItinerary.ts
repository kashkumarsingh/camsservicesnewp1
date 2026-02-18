/**
 * Universal Itinerary Hook
 * 
 * Manages itinerary data in a completely universal way,
 * independent of mode-specific implementations.
 */

import { useState, useEffect, useMemo } from 'react';
import { ItineraryTemplate } from './ItinerarySchema';
import { ItineraryService, UniversalItineraryData } from '../services/ItineraryService';

interface UseUniversalItineraryOptions {
  template: ItineraryTemplate | null;
  parentAddress?: string;
  remainingHours: number;
  fallbackStartTime?: string;
}

export function useUniversalItinerary({
  template,
  parentAddress,
  remainingHours,
  fallbackStartTime = '09:00',
}: UseUniversalItineraryOptions) {
  // Single universal state object
  const [itineraryData, setItineraryData] = useState<UniversalItineraryData>(() => {
    return template ? ItineraryService.initializeItineraryData(template) : {};
  });

  // Initialize when template changes
  useEffect(() => {
    if (template) {
      setItineraryData(prev => {
        const initialized = ItineraryService.initializeItineraryData(template);
        // Preserve existing values where possible
        return { ...initialized, ...prev };
      });
    }
  }, [template?.name]);

  // Update parentAddress in data
  useEffect(() => {
    if (parentAddress && template) {
      setItineraryData(prev => ({ ...prev, parentAddress }));
    }
  }, [parentAddress, template]);

  // Update a single field
  const updateField = (key: string, value: any) => {
    setItineraryData(prev => ({ ...prev, [key]: value }));
  };

  // Update multiple fields at once
  const updateFields = (patch: Partial<UniversalItineraryData>) => {
    setItineraryData(prev => ({ ...prev, ...patch }));
  };

  // Get a field value
  const getField = (key: string): any => {
    return itineraryData[key];
  };

  // Validation
  const validation = useMemo(() => {
    if (!template) return { valid: false, missingFields: [] };
    return ItineraryService.validateItinerary(template, itineraryData);
  }, [template, itineraryData]);

  // Suggested duration
  const suggestedDuration = useMemo(() => {
    if (!template) return 0;
    return ItineraryService.calculateSuggestedDuration(template, itineraryData, remainingHours);
  }, [template, itineraryData, remainingHours]);

  // Effective pickup time
  const effectivePickupTime = useMemo(() => {
    if (!template) return null;
    return ItineraryService.getEffectivePickupTime(template, itineraryData);
  }, [template, itineraryData]);

  // Pickup time suggestions
  const pickupTimeSuggestions = useMemo(() => {
    if (!template) return [];
    return ItineraryService.getPickupTimeSuggestions(template, itineraryData);
  }, [template, itineraryData]);

  // Effective start time
  const effectiveStartTime = useMemo(() => {
    if (!template) return fallbackStartTime;
    return ItineraryService.getEffectiveStartTime(template, itineraryData, fallbackStartTime);
  }, [template, itineraryData, fallbackStartTime]);

  return {
    itineraryData,
    updateField,
    updateFields,
    getField,
    isValid: validation.valid,
    missingFields: validation.missingFields,
    suggestedDuration,
    effectivePickupTime,
    pickupTimeSuggestions,
    effectiveStartTime,
  };
}


