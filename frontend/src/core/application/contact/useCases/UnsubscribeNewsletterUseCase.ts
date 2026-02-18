/**
 * Unsubscribe Newsletter Use Case
 * 
 * Orchestrates newsletter unsubscription.
 */

import { INewsletterRepository } from '../ports/IContactRepository';
import { ContactMapper } from '../mappers/ContactMapper';
import { NewsletterSubscriptionDTO } from '../dto/NewsletterSubscriptionDTO';

export class UnsubscribeNewsletterUseCase {
  constructor(private readonly newsletterRepository: INewsletterRepository) {}

  async execute(email: string): Promise<NewsletterSubscriptionDTO | null> {
    const result = await this.newsletterRepository.unsubscribe(email);
    return result ? ContactMapper.subscriptionToDTO(result) : null;
  }
}


