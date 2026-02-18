/**
 * Service Domain Events
 * 
 * Domain events for services.
 */

import { DomainEvent } from '../../shared/DomainEvent';

export class ServiceCreatedEvent extends DomainEvent {
  constructor(
    public readonly serviceId: string,
    public readonly title: string,
    public readonly slug: string
  ) {
    super();
  }
}

export class ServiceUpdatedEvent extends DomainEvent {
  constructor(
    public readonly serviceId: string,
    public readonly changes: {
      title?: string;
      description?: string;
      icon?: string;
      category?: string;
    }
  ) {
    super();
  }
}

export class ServiceViewedEvent extends DomainEvent {
  constructor(
    public readonly serviceId: string,
    public readonly viewedAt: Date
  ) {
    super();
  }
}


