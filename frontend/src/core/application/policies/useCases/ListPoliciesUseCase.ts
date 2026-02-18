/**
 * List Policies Use Case
 * 
 * Orchestrates listing policies with filters.
 */

import { Policy } from '../../../domain/policies/entities/Policy';
import { IPolicyRepository } from '../ports/IPolicyRepository';
import { PolicyMapper } from '../mappers/PolicyMapper';
import { PolicyDTO } from '../dto/PolicyDTO';
import { PolicyType } from '../../../domain/policies/entities/Policy';

export interface PolicyFilterOptions {
  type?: PolicyType;
  published?: boolean;
  effective?: boolean;
  sortBy?: 'title' | 'lastUpdated' | 'effectiveDate' | 'views' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export class ListPoliciesUseCase {
  constructor(private readonly policyRepository: IPolicyRepository) {}

  async execute(options?: PolicyFilterOptions): Promise<PolicyDTO[]> {
    // Get all policies
    let policies: Policy[];

    if (options?.type) {
      policies = await this.policyRepository.findByType(options.type);
    } else {
      policies = await this.policyRepository.findAll();
    }

    // Apply published filter
    if (options?.published !== undefined) {
      policies = policies.filter(p => p.published === options.published);
    }

    // Apply effective filter
    if (options?.effective !== undefined) {
      policies = policies.filter(p => 
        options.effective ? p.isEffective() : !p.isEffective()
      );
    }

    // Apply sorting
    if (options?.sortBy) {
      const sortOrder = options.sortOrder || 'asc';
      policies.sort((a, b) => {
        let comparison = 0;
        
        switch (options.sortBy) {
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'lastUpdated':
            comparison = a.lastUpdated.getTime() - b.lastUpdated.getTime();
            break;
          case 'effectiveDate':
            comparison = a.effectiveDate.getTime() - b.effectiveDate.getTime();
            break;
          case 'views':
            comparison = a.views - b.views;
            break;
          case 'createdAt':
            comparison = a.createdAt.getTime() - b.createdAt.getTime();
            break;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    // Return DTOs
    return PolicyMapper.toDTOs(policies);
  }
}


