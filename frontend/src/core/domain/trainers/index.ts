/**
 * Trainers Domain - Barrel Exports
 */

export { Trainer, type TrainerImage } from './entities/Trainer';
export { TrainerSlug } from './valueObjects/TrainerSlug';
export { TrainerRating } from './valueObjects/TrainerRating';
export { TrainerCapability } from './valueObjects/TrainerCapability';
export { TrainerStatsCalculator } from './services/TrainerStatsCalculator';
export { TrainerRankingService, type TrainerRankingCriteria } from './services/TrainerRankingService';
export { TrainerMatchingService, type TrainerRequirements } from './services/TrainerMatchingService';
export { AvailabilityPolicy } from './policies/AvailabilityPolicy';
export { CapabilityPolicy } from './policies/CapabilityPolicy';
export {
  TrainerCreatedEvent,
  TrainerUpdatedEvent,
  TrainerAvailabilityChangedEvent
} from './events/TrainerEvents';

