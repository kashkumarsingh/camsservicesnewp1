/**
 * Newsletter Subscription DTO
 * 
 * Data transfer object for newsletter subscriptions.
 */

export interface NewsletterSubscriptionDTO {
  id: string;
  email: string;
  name?: string;
  active: boolean;
  subscribedAt: string;
  unsubscribedAt?: string;
  createdAt: string;
  updatedAt: string;
}


