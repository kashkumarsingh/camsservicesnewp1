/**
 * FAQ Domain Events
 * 
 * Domain events for FAQ items.
 */

import { DomainEvent } from '../../shared/DomainEvent';

export class FAQItemCreatedEvent extends DomainEvent {
  constructor(
    public readonly faqId: string,
    public readonly title: string,
    public readonly slug: string
  ) {
    super();
  }
}

export class FAQItemUpdatedEvent extends DomainEvent {
  constructor(
    public readonly faqId: string,
    public readonly changes: {
      title?: string;
      content?: string;
      category?: string;
    }
  ) {
    super();
  }
}

export class FAQItemViewedEvent extends DomainEvent {
  constructor(
    public readonly faqId: string,
    public readonly viewedAt: Date
  ) {
    super();
  }
}


