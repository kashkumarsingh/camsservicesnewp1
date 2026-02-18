/**
 * Availability Policy
 *
 * Business rules related to trainer availability.
 */

import { Trainer } from '../entities/Trainer';

export class AvailabilityPolicy {
  /**
   * Check if trainer is available for new assignments.
   */
  static isAvailable(trainer: Trainer): boolean {
    return trainer.available;
  }

  /**
   * Check if trainer can accept a booking with required capabilities.
   */
  static canAcceptBooking(trainer: Trainer, requiredCapabilities: string[] = []): boolean {
    if (!this.isAvailable(trainer)) {
      return false;
    }

    if (requiredCapabilities.length === 0) {
      return true;
    }

    return requiredCapabilities.every(capability => trainer.capabilities.includes(capability));
  }
}

