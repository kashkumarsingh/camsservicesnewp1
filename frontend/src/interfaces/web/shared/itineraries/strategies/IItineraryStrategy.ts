/**
 * Itinerary Strategy Interface
 * 
 * All itinerary types implement this interface, ensuring consistency
 * and enabling the Strategy + Factory pattern.
 */

import React from 'react';
import type { IconComponent } from '@/types/icons';
import { UniversalItineraryData } from '../services/ItineraryService';
import { ValidationState } from '../shared/useProgressiveDisclosure';

export interface ValidationResult {
  valid: boolean;
  missingFields: string[];
  errors?: string[];
}

export interface ItineraryRenderProps {
  parentAddress?: string;
  remainingHours: number;
  parseTimeToMinutes: (t: string) => number;
  [key: string]: any; // Allow additional props
}

export interface ModeMetadata {
  title: string;
  shortDesc: string;
  icon: IconComponent;
  badge: string;
  required: string[]; // Required trainer capabilities
  popular: boolean;
}

export interface IItineraryStrategy {
  // Identity
  readonly key: string;
  readonly name: string;
  readonly description: string;
  
  // Metadata for UI display
  getMetadata(): ModeMetadata;
  
  // Validation
  validate(data: UniversalItineraryData): ValidationResult;
  getSectionValidations(data: UniversalItineraryData): ValidationState;
  
  // Progressive Disclosure
  getSections(): string[];
  getSectionOrder(): string[];
  
  // Rendering
  render(
    data: UniversalItineraryData,
    onChange: (patch: Partial<UniversalItineraryData>) => void,
    props: ItineraryRenderProps
  ): React.ReactNode;
  
  // Calculations
  calculateDuration(data: UniversalItineraryData, remainingHours: number): number;
  getPickupSuggestions(data: UniversalItineraryData): string[];
  getEffectivePickupTime(data: UniversalItineraryData): string | null;
  
  // Preview Rendering
  renderPreview?(
    data: UniversalItineraryData,
    props: SessionPreviewProps
  ): React.ReactNode;
  
  // Initialization
  initializeData(parentAddress?: string): UniversalItineraryData;
}

export interface SessionPreviewProps {
  selectedDate: string;
  effectiveStartTime: string;
  duration: number;
  effectiveDuration?: number;
  autoCalcFromItinerary?: boolean;
  computeSuggestedDuration?: number;
  parseTimeToMinutes: (t: string) => number;
  formatHours: (hrs: number) => string;
  pickupAddress?: string;
  dropoffAddress?: string;
  travelBreakdown?: {
    before: number;
    after: number;
  };
}

