/**
 * Get Policy Stats Use Case
 * 
 * Orchestrates getting policy statistics.
 */

import { PolicyStatsCalculator } from '../../../domain/policies/services/PolicyStatsCalculator';
import { IPolicyRepository } from '../ports/IPolicyRepository';
import { PolicyStatsDTO } from '../dto/PolicyStatsDTO';

export class GetPolicyStatsUseCase {
  constructor(private readonly policyRepository: IPolicyRepository) {}

  async execute(): Promise<PolicyStatsDTO> {
    // Get all policies
    const policies = await this.policyRepository.findAll();

    // Calculate statistics
    const total = PolicyStatsCalculator.calculateTotalPolicies(policies);
    const published = PolicyStatsCalculator.calculatePublishedPolicies(policies);
    const mostViewed = PolicyStatsCalculator.findMostViewed(policies);
    const totalViews = PolicyStatsCalculator.calculateTotalViews(policies);
    const averageViews = PolicyStatsCalculator.calculateAverageViews(policies);

    return {
      total,
      published,
      mostViewed: mostViewed ? {
        id: mostViewed.id,
        title: mostViewed.title,
        views: mostViewed.views,
      } : undefined,
      totalViews,
      averageViews,
    };
  }
}


