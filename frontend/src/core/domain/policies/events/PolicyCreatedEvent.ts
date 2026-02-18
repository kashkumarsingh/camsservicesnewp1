/**
 * Policy Domain Events
 * 
 * Domain events for policies.
 */

import { DomainEvent } from '../../shared/DomainEvent';

export class PolicyCreatedEvent extends DomainEvent {
  constructor(
    public readonly policyId: string,
    public readonly title: string,
    public readonly type: string,
    public readonly version: string
  ) {
    super();
  }
}

export class PolicyUpdatedEvent extends DomainEvent {
  constructor(
    public readonly policyId: string,
    public readonly version: string,
    public readonly previousVersion: string
  ) {
    super();
  }
}

export class PolicyViewedEvent extends DomainEvent {
  constructor(
    public readonly policyId: string,
    public readonly viewedAt: Date
  ) {
    super();
  }
}

export class PolicyPublishedEvent extends DomainEvent {
  constructor(
    public readonly policyId: string,
    public readonly publishedAt: Date
  ) {
    super();
  }
}


