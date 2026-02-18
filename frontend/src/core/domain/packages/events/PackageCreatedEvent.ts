/**
 * Package Domain Events
 * 
 * Domain events for packages.
 */

import { DomainEvent } from '../../shared/DomainEvent';

export class PackageCreatedEvent extends DomainEvent {
  constructor(
    public readonly packageId: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly price: number
  ) {
    super();
  }
}

export class PackageUpdatedEvent extends DomainEvent {
  constructor(
    public readonly packageId: string,
    public readonly changes: {
      name?: string;
      description?: string;
      price?: number;
      hours?: number;
      spotsRemaining?: number;
    }
  ) {
    super();
  }
}

export class PackageViewedEvent extends DomainEvent {
  constructor(
    public readonly packageId: string,
    public readonly viewedAt: Date
  ) {
    super();
  }
}

export class PackageAvailabilityChangedEvent extends DomainEvent {
  constructor(
    public readonly packageId: string,
    public readonly spotsRemaining: number
  ) {
    super();
  }
}


