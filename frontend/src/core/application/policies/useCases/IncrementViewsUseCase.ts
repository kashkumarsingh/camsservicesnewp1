/**
 * Increment Views Use Case
 * 
 * Orchestrates incrementing the view count for a policy.
 */

import { Policy } from '../../../domain/policies/entities/Policy';
import { IPolicyRepository } from '../ports/IPolicyRepository';
import { PolicyMapper } from '../mappers/PolicyMapper';
import { PolicyDTO } from '../dto/PolicyDTO';

export class IncrementViewsUseCase {
  constructor(private readonly policyRepository: IPolicyRepository) {}

  async execute(idOrSlug: string): Promise<PolicyDTO | null> {
    // Find policy
    let policy = await this.policyRepository.findById(idOrSlug);
    if (!policy) {
      policy = await this.policyRepository.findBySlug(idOrSlug);
    }

    if (!policy) {
      return null;
    }

    // Increment views
    policy.incrementViews();

    // Save updated policy
    await this.policyRepository.save(policy);

    return PolicyMapper.toDTO(policy);
  }
}


