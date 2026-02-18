/**
 * FAQ Policy
 * 
 * Business rules for FAQ items.
 * Can be swapped for different policies.
 */

import { FAQItem } from '../entities/FAQItem';

export class FAQPolicy {
  /**
   * Check if FAQ can be published
   */
  static canBePublished(faq: FAQItem): boolean {
    return faq.validate() && faq.title.trim().length > 0 && faq.content.trim().length > 0;
  }

  /**
   * Check if FAQ can be edited
   */
  static canBeEdited(faq: FAQItem): boolean {
    return faq.canBeEdited();
  }

  /**
   * Check if FAQ requires moderation
   */
  static requiresModeration(faq: FAQItem): boolean {
    // Business rule: All FAQs require moderation (can be customized)
    return true;
  }
}


