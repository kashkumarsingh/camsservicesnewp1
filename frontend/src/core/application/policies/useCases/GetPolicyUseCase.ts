/**
 * Get Policy Use Case
 * 
 * Orchestrates getting a single policy by ID or slug.
 */

import { Policy } from '../../../domain/policies/entities/Policy';
import { IPolicyRepository } from '../ports/IPolicyRepository';
import { PolicyMapper } from '../mappers/PolicyMapper';
import { PolicyDTO } from '../dto/PolicyDTO';

export class GetPolicyUseCase {
  constructor(private readonly policyRepository: IPolicyRepository) {}

  async execute(idOrSlug: string): Promise<PolicyDTO | null> {
    // Try to find by ID first
    let policy = await this.policyRepository.findById(idOrSlug);

    // If not found, try by slug
    if (!policy) {
      policy = await this.policyRepository.findBySlug(idOrSlug);
    }

    if (!policy) {
      return null;
    }

    return PolicyMapper.toDTO(policy);
  }
}


