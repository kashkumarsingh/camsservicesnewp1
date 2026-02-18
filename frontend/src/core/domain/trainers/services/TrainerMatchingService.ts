/**
 * Trainer Matching Service
 *
 * Matches trainers to booking requirements.
 */

import { Trainer } from '../entities/Trainer';

export interface TrainerRequirements {
  requiredCapabilities?: string[];
  preferredSpecialties?: string[];
  requireAvailability?: boolean;
}

export class TrainerMatchingService {
  static match(trainers: Trainer[], requirements: TrainerRequirements = {}): Trainer[] {
    const { requiredCapabilities = [], preferredSpecialties = [], requireAvailability = true } = requirements;

    return trainers.filter((trainer) => {
      if (requireAvailability && !trainer.available) {
        return false;
      }

      const hasRequiredCapabilities = requiredCapabilities.every(capability => trainer.capabilities.includes(capability));
      if (!hasRequiredCapabilities) {
        return false;
      }

      if (preferredSpecialties.length === 0) {
        return true;
      }

      return trainer.specialties.some(specialty => preferredSpecialties.includes(specialty));
    });
  }
}

