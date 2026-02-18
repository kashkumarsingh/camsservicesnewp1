/**
 * Static Policy Repository
 * 
 * Infrastructure implementation using static data.
 */

import { IPolicyRepository } from '@/core/application/policies/ports/IPolicyRepository';
import { Policy } from '@/core/domain/policies/entities/Policy';
import { PolicySlug } from '@/core/domain/policies/valueObjects/PolicySlug';
import { policiesData } from '@/data/policiesData';

export class StaticPolicyRepository implements IPolicyRepository {
  private policiesList: Policy[] = [];

  constructor() {
    // Initialize from static data
    this.policiesList = policiesData.map((item) => {
      const slug = PolicySlug.fromString(item.slug);
      
      return Policy.create(
        item.id,
        item.title,
        item.type,
        item.content,
        new Date(item.effectiveDate),
        item.version,
        slug,
        item.summary,
        item.published
      );
    });
  }

  async save(policy: Policy): Promise<void> {
    const index = this.policiesList.findIndex(p => p.id === policy.id);
    if (index >= 0) {
      this.policiesList[index] = policy;
    } else {
      this.policiesList.push(policy);
    }
  }

  async findById(id: string): Promise<Policy | null> {
    return this.policiesList.find(p => p.id === id) || null;
  }

  async findBySlug(slug: string): Promise<Policy | null> {
    return this.policiesList.find(p => p.slug.toString() === slug) || null;
  }

  async findByType(type: string): Promise<Policy[]> {
    return this.policiesList.filter(p => p.type === type);
  }

  async findAll(): Promise<Policy[]> {
    return [...this.policiesList];
  }

  async delete(id: string): Promise<void> {
    this.policiesList = this.policiesList.filter(p => p.id !== id);
  }
}


