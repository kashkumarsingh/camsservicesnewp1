/**
 * Trainer Domain Events
 */

import { DomainEvent } from '../../shared/DomainEvent';

export class TrainerCreatedEvent extends DomainEvent {
  constructor(
    public readonly trainerId: string,
    public readonly name: string,
    public readonly slug: string
  ) {
    super();
  }
}

export class TrainerUpdatedEvent extends DomainEvent {
  constructor(
    public readonly trainerId: string,
    public readonly changes: {
      name?: string;
      role?: string;
      rating?: number;
      capabilities?: string[];
    }
  ) {
    super();
  }
}

export class TrainerAvailabilityChangedEvent extends DomainEvent {
  constructor(
    public readonly trainerId: string,
    public readonly available: boolean
  ) {
    super();
  }
}

