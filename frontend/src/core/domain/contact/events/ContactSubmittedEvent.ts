/**
 * Contact Domain Events
 * 
 * Domain events for contact submissions.
 */

import { DomainEvent } from '../../shared/DomainEvent';

export class ContactSubmittedEvent extends DomainEvent {
  constructor(
    public readonly submissionId: string,
    public readonly email: string,
    public readonly urgency: string,
    public readonly inquiryType: string
  ) {
    super();
  }
}

export class NewsletterSubscribedEvent extends DomainEvent {
  constructor(
    public readonly subscriptionId: string,
    public readonly email: string
  ) {
    super();
  }
}

export class NewsletterUnsubscribedEvent extends DomainEvent {
  constructor(
    public readonly subscriptionId: string,
    public readonly email: string
  ) {
    super();
  }
}


