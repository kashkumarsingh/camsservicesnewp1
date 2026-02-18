// Main components
export { default as ItineraryRenderer } from './ItineraryRenderer';

// Services
export { ItineraryService } from './services/ItineraryService';
export type { UniversalItineraryData } from './services/ItineraryService';

// Hooks
export { useUniversalItinerary } from './universal/useUniversalItinerary';

// Types
export type { ItineraryTemplate, Segment } from './universal/ItinerarySchema';
export type { IItineraryStrategy, ItineraryRenderProps, SessionPreviewProps, ModeMetadata } from './strategies/IItineraryStrategy';

// Factory
export { getStrategyFactory } from './factory/registerStrategies';

// Templates
export { getTemplateForMode } from './universal/templateRegistry';

// Utils
export { getSuggestedPickupOptions } from './shared/pickupUtils';

// Types from types.ts
export type * from './types';
