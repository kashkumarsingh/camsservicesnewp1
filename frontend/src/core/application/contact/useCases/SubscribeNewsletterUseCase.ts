/**
 * Subscribe Newsletter Use Case
 * 
 * Orchestrates newsletter subscription.
 */

import { NewsletterSubscription } from '../../../domain/contact/entities/NewsletterSubscription';
import { INewsletterRepository } from '../ports/IContactRepository';
import { NewsletterSubscriptionFactory } from '../factories/NewsletterSubscriptionFactory';
import { ContactMapper } from '../mappers/ContactMapper';
import { NewsletterSubscriptionDTO } from '../dto/NewsletterSubscriptionDTO';
import { CreateNewsletterSubscriptionDTO } from '../dto/CreateNewsletterSubscriptionDTO';

export class SubscribeNewsletterUseCase {
  constructor(
    private readonly newsletterRepository: INewsletterRepository,
    private readonly subscriptionFactory: NewsletterSubscriptionFactory
  ) {}

  async execute(input: CreateNewsletterSubscriptionDTO): Promise<NewsletterSubscriptionDTO> {
    const subscription = this.subscriptionFactory.create(input);
    const persisted = await this.newsletterRepository.subscribe(subscription);
    return ContactMapper.subscriptionToDTO(persisted);
  }
}


