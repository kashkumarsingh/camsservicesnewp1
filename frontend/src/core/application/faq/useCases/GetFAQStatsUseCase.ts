/**
 * Get FAQ Stats Use Case
 * 
 * Orchestrates getting FAQ statistics.
 */

import { FAQStatsCalculator } from '../../../domain/faq/services/FAQStatsCalculator';
import { IFAQRepository } from '../ports/IFAQRepository';
import { FAQStatsDTO } from '../dto/FAQStatsDTO';

export class GetFAQStatsUseCase {
  constructor(private readonly faqRepository: IFAQRepository) {}

  async execute(): Promise<FAQStatsDTO> {
    // Get all FAQs
    const faqs = await this.faqRepository.findAll();

    // Calculate statistics
    const total = FAQStatsCalculator.calculateTotalFAQs(faqs);
    const totalViews = FAQStatsCalculator.calculateTotalViews(faqs);
    const averageViews = FAQStatsCalculator.calculateAverageViews(faqs);
    const mostViewed = FAQStatsCalculator.findMostViewed(faqs);
    const byCategory = FAQStatsCalculator.countByCategory(faqs);

    return {
      total,
      totalViews,
      averageViews,
      mostViewed: mostViewed ? {
        id: mostViewed.id,
        title: mostViewed.title,
        views: mostViewed.views,
      } : undefined,
      byCategory,
    };
  }
}


