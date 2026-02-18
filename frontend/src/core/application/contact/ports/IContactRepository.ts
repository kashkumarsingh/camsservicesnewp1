/**
 * Contact Repository Interface
 * 
 * Port (interface) for contact repository.
 */

import { ContactSubmission } from '../../../domain/contact/entities/ContactSubmission';
import { NewsletterSubscription } from '../../../domain/contact/entities/NewsletterSubscription';

export interface IContactRepository {
  saveSubmission(submission: ContactSubmission): Promise<void>;
  findSubmissionById?(id: string): Promise<ContactSubmission | null>;
  findSubmissionsByEmail?(email: string, limit?: number): Promise<ContactSubmission[]>;
  findAllSubmissions?(limit?: number, offset?: number): Promise<ContactSubmission[]>;
  deleteSubmission?(id: string): Promise<void>;
}

export interface INewsletterRepository {
  subscribe(subscription: NewsletterSubscription): Promise<NewsletterSubscription>;
  unsubscribe(email: string): Promise<NewsletterSubscription | null>;
}


