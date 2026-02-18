/**
 * Activity Domain Events
 * 
 * Domain events for activities.
 */

import { DomainEvent } from '../../shared/DomainEvent';

export class ActivityCreatedEvent extends DomainEvent {
  constructor(
    public readonly activityId: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly category?: string
  ) {
    super();
  }
}

export class ActivityUpdatedEvent extends DomainEvent {
  constructor(
    public readonly activityId: string,
    public readonly changes: {
      name?: string;
      description?: string;
      duration?: number;
      trainerIds?: number[];
    }
  ) {
    super();
  }
}

export class ActivityViewedEvent extends DomainEvent {
  constructor(
    public readonly activityId: string,
    public readonly viewedAt: Date
  ) {
    super();
  }
}

export class ActivityPublishedEvent extends DomainEvent {
  constructor(
    public readonly activityId: string,
    public readonly publishedAt: Date
  ) {
    super();
  }
}


