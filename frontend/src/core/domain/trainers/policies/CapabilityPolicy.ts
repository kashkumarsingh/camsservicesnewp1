/**
 * Capability Policy
 *
 * Business rules for trainer capabilities.
 */

import { Trainer } from '../entities/Trainer';
import { TrainerCapability } from '../valueObjects/TrainerCapability';

export class CapabilityPolicy {
  static isSupported(capability: string): boolean {
    return TrainerCapability.allowed().includes(capability as any);
  }

  static hasCapability(trainer: Trainer, capability: string): boolean {
    return trainer.capabilities.includes(capability);
  }

  static hasCapabilities(trainer: Trainer, capabilities: string[]): boolean {
    return capabilities.every(capability => this.hasCapability(trainer, capability));
  }
}

