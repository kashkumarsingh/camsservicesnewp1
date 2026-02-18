/**
 * Service Policy
 * 
 * Business rules for services.
 * Can be swapped for different policies.
 */

import { Service } from '../entities/Service';

export class ServicePolicy {
  /**
   * Check if service can be published
   */
  static canBePublished(service: Service): boolean {
    return service.validate() && service.title.trim().length > 0 && service.description.trim().length > 0;
  }

  /**
   * Check if service can be edited
   */
  static canBeEdited(service: Service): boolean {
    return service.canBeViewed();
  }

  /**
   * Check if service requires moderation
   */
  static requiresModeration(service: Service): boolean {
    // Business rule: All services require moderation (can be customized)
    return true;
  }
}


