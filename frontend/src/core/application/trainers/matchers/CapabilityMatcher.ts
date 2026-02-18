/**
 * Capability Matcher
 * 
 * Matches trainers based on specific capabilities and skills.
 * Pure matching logic - no filtering or ranking.
 */

import { Trainer } from '../types/TrainerTypes';

export class CapabilityMatcher {
  /**
   * Check if trainer has a specific capability
   * @param trainer - Trainer to check
   * @param capability - Capability to check for
   * @returns True if trainer has the capability
   * @example
   * const hasCap = CapabilityMatcher.hasCapability(trainer, 'travel_escort');
   */
  static hasCapability(trainer: Trainer, capability: string): boolean {
    const capabilities = (trainer as any)?.capabilities;
    if (!Array.isArray(capabilities)) {
      return false;
    }
    return capabilities.includes(capability);
  }

  /**
   * Check if trainer has all required capabilities
   * @param trainer - Trainer to check
   * @param capabilities - Array of required capabilities
   * @returns True if trainer has all capabilities
   * @example
   * const hasAll = CapabilityMatcher.hasAllCapabilities(trainer, ['travel_escort', 'overnight']);
   */
  static hasAllCapabilities(trainer: Trainer, capabilities: string[]): boolean {
    if (!capabilities.length) {
      return true;
    }

    const trainerCaps = (trainer as any)?.capabilities;
    if (!Array.isArray(trainerCaps)) {
      return false;
    }

    return capabilities.every(cap => trainerCaps.includes(cap));
  }

  /**
   * Check if trainer has any of the required capabilities
   * @param trainer - Trainer to check
   * @param capabilities - Array of capabilities
   * @returns True if trainer has at least one capability
   * @example
   * const hasAny = CapabilityMatcher.hasAnyCapability(trainer, ['travel_escort', 'school_run']);
   */
  static hasAnyCapability(trainer: Trainer, capabilities: string[]): boolean {
    if (!capabilities.length) {
      return true;
    }

    const trainerCaps = (trainer as any)?.capabilities;
    if (!Array.isArray(trainerCaps)) {
      return false;
    }

    return capabilities.some(cap => trainerCaps.includes(cap));
  }

  /**
   * Get capability match score (0-100)
   * @param trainer - Trainer to score
   * @param required - Array of required capabilities
   * @returns Score from 0 to 100
   * @example
   * const score = CapabilityMatcher.getCapabilityScore(trainer, ['travel_escort', 'overnight']);
   * // Returns: 100 if has all, 50 if has one, 0 if has none
   */
  static getCapabilityScore(trainer: Trainer, required: string[]): number {
    if (!required.length) {
      return 100; // No requirements = perfect match
    }

    const trainerCaps = (trainer as any)?.capabilities;
    if (!Array.isArray(trainerCaps)) {
      return 0;
    }

    const matched = required.filter(cap => trainerCaps.includes(cap)).length;
    return (matched / required.length) * 100;
  }

  /**
   * Compare two trainers by capability match
   * @param trainer1 - First trainer
   * @param trainer2 - Second trainer
   * @param required - Array of required capabilities
   * @returns Positive if trainer1 is better, negative if trainer2 is better, 0 if equal
   * @example
   * const comparison = CapabilityMatcher.compareCapabilities(trainer1, trainer2, ['travel_escort']);
   */
  static compareCapabilities(
    trainer1: Trainer,
    trainer2: Trainer,
    required: string[]
  ): number {
    const score1 = this.getCapabilityScore(trainer1, required);
    const score2 = this.getCapabilityScore(trainer2, required);
    return score1 - score2;
  }

  /**
   * Get missing capabilities for a trainer
   * @param trainer - Trainer to check
   * @param required - Array of required capabilities
   * @returns Array of missing capabilities
   * @example
   * const missing = CapabilityMatcher.getMissingCapabilities(trainer, ['travel_escort', 'overnight']);
   */
  static getMissingCapabilities(trainer: Trainer, required: string[]): string[] {
    const trainerCaps = (trainer as any)?.capabilities || [];
    return required.filter(cap => !trainerCaps.includes(cap));
  }
}

