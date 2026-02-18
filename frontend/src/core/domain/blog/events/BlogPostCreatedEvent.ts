/**
 * Blog Domain Events
 * 
 * Domain events for blog posts.
 */

import { DomainEvent } from '../../shared/DomainEvent';

export class BlogPostCreatedEvent extends DomainEvent {
  constructor(
    public readonly postId: string,
    public readonly title: string,
    public readonly slug: string,
    public readonly authorId: string
  ) {
    super();
  }
}

export class BlogPostPublishedEvent extends DomainEvent {
  constructor(
    public readonly postId: string,
    public readonly publishedAt: Date
  ) {
    super();
  }
}

export class BlogPostUpdatedEvent extends DomainEvent {
  constructor(
    public readonly postId: string,
    public readonly changes: {
      title?: string;
      content?: string;
      excerpt?: string;
    }
  ) {
    super();
  }
}

export class BlogPostViewedEvent extends DomainEvent {
  constructor(
    public readonly postId: string,
    public readonly viewedAt: Date
  ) {
    super();
  }
}


