/**
 * Services Domain - Barrel Exports
 */

export { Service } from './entities/Service';
export { ServiceSlug } from './valueObjects/ServiceSlug';
export { ServiceStatsCalculator } from './services/ServiceStatsCalculator';
export { ServicePolicy } from './policies/ServicePolicy';
export { 
  ServiceCreatedEvent, 
  ServiceUpdatedEvent, 
  ServiceViewedEvent 
} from './events/ServiceCreatedEvent';


