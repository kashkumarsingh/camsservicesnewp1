/**
 * Packages Domain - Barrel Exports
 */

export { Package, type PackageActivity } from './entities/Package';
export { PackageSlug } from './valueObjects/PackageSlug';
export { PackageHours } from './valueObjects/PackageHours';
export { PackagePrice } from './valueObjects/PackagePrice';
export { PackageDuration } from './valueObjects/PackageDuration';
export { PackageCalculator } from './services/PackageCalculator';
export { PackageStatsCalculator } from './services/PackageStatsCalculator';
export { PackagePolicy } from './policies/PackagePolicy';
export { AvailabilityPolicy } from './policies/AvailabilityPolicy';
export { PricingPolicy } from './policies/PricingPolicy';
export { 
  PackageCreatedEvent, 
  PackageUpdatedEvent, 
  PackageViewedEvent,
  PackageAvailabilityChangedEvent
} from './events/PackageCreatedEvent';


