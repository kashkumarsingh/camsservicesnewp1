/**
 * Newsletter Subscription Factory
 * 
 * Factory for creating newsletter subscriptions.
 */

import { NewsletterSubscription } from '../../../domain/contact/entities/NewsletterSubscription';
import { CreateNewsletterSubscriptionDTO } from '../dto/CreateNewsletterSubscriptionDTO';
import { IIdGenerator } from '../../faq/ports/IIdGenerator';

export class NewsletterSubscriptionFactory {
  constructor(private readonly idGenerator: IIdGenerator) {}

  create(input: CreateNewsletterSubscriptionDTO): NewsletterSubscription {
    // Generate ID
    const id = this.idGenerator.generate();

    // Create subscription with business rules enforced
    return NewsletterSubscription.create(
      id,
      input.email,
      input.name
    );
  }
}


