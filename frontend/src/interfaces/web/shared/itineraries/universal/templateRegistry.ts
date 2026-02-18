/**
 * Template Registry
 * 
 * Central registry mapping mode keys to templates.
 * Add new itinerary types here - no other code changes needed!
 */

import { ItineraryTemplate } from './ItinerarySchema';
import { SingleDayTemplate, HospitalTemplate, ExamTemplate, MultiDayTemplate } from './templates';

export const TEMPLATE_REGISTRY: Record<string, ItineraryTemplate> = {
  'single-day-event': SingleDayTemplate,
  'multi-day-event': MultiDayTemplate,
  'hospital-appointment': HospitalTemplate,
  'exam-support': ExamTemplate,
  // Add more templates here as needed
};

/**
 * Get template for a mode key
 */
export function getTemplateForMode(modeKey: string | null): ItineraryTemplate | null {
  if (!modeKey) return null;
  return TEMPLATE_REGISTRY[modeKey] || null;
}

/**
 * Get all available templates
 */
export function getAllTemplates(): ItineraryTemplate[] {
  return Object.values(TEMPLATE_REGISTRY);
}


