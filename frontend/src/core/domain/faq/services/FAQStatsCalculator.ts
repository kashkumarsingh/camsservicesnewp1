/**
 * FAQ Stats Calculator
 * 
 * Domain service for calculating FAQ statistics.
 */

import { FAQItem } from '../entities/FAQItem';

export class FAQStatsCalculator {
  static calculateTotalFAQs(faqs: FAQItem[]): number {
    return faqs.length;
  }

  static calculateTotalViews(faqs: FAQItem[]): number {
    return faqs.reduce((total, faq) => total + faq.views, 0);
  }

  static calculateAverageViews(faqs: FAQItem[]): number {
    if (faqs.length === 0) {
      return 0;
    }
    return this.calculateTotalViews(faqs) / faqs.length;
  }

  static findMostViewed(faqs: FAQItem[]): FAQItem | null {
    if (faqs.length === 0) {
      return null;
    }
    return faqs.reduce((mostViewed, faq) => 
      faq.views > mostViewed.views ? faq : mostViewed
    );
  }

  static countByCategory(faqs: FAQItem[]): Record<string, number> {
    const counts: Record<string, number> = {};
    faqs.forEach(faq => {
      const category = faq.category || 'uncategorized';
      counts[category] = (counts[category] || 0) + 1;
    });
    return counts;
  }
}


