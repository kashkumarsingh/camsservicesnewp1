/**
 * Static Contact Repository
 * 
 * Infrastructure implementation using in-memory storage.
 * For development/testing purposes.
 */

import { IContactRepository, INewsletterRepository } from '@/core/application/contact/ports/IContactRepository';
import { ContactSubmission } from '@/core/domain/contact/entities/ContactSubmission';
import { NewsletterSubscription } from '@/core/domain/contact/entities/NewsletterSubscription';
import { Email } from '@/core/domain/contact/valueObjects/Email';

export class StaticContactRepository implements IContactRepository {
  private submissions: ContactSubmission[] = [];

  async saveSubmission(submission: ContactSubmission): Promise<void> {
    const index = this.submissions.findIndex(s => s.id === submission.id);
    if (index >= 0) {
      this.submissions[index] = submission;
    } else {
      this.submissions.push(submission);
    }
  }

  async findSubmissionById(id: string): Promise<ContactSubmission | null> {
    return this.submissions.find(s => s.id === id) || null;
  }

  async findSubmissionsByEmail(email: string, limit: number = 10): Promise<ContactSubmission[]> {
    return this.submissions
      .filter(s => s.email.value === email)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async findAllSubmissions(limit: number = 100, offset: number = 0): Promise<ContactSubmission[]> {
    return this.submissions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
  }

  async deleteSubmission(id: string): Promise<void> {
    this.submissions = this.submissions.filter(s => s.id !== id);
  }
}

export class StaticNewsletterRepository implements INewsletterRepository {
  private subscriptions: NewsletterSubscription[] = [];

  async subscribe(subscription: NewsletterSubscription): Promise<NewsletterSubscription> {
    const existing = this.subscriptions.find(s => s.email.value === subscription.email.value);
    if (existing) {
      existing.resubscribe();
      return existing;
    }
    this.subscriptions.push(subscription);
    return subscription;
  }

  async unsubscribe(email: string): Promise<NewsletterSubscription | null> {
    const existing = this.subscriptions.find(s => s.email.value === email);
    if (!existing) {
      return null;
    }
    existing.unsubscribe();
    return existing;
  }
}


