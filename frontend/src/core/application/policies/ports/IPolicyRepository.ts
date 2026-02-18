/**
 * Policy Repository Interface
 * 
 * Port (interface) for policy repository.
 */

import { Policy } from '../../../domain/policies/entities/Policy';
import { PolicyType } from '../../../domain/policies/entities/Policy';

export interface IPolicyRepository {
  save(policy: Policy): Promise<void>;
  findById(id: string): Promise<Policy | null>;
  findBySlug(slug: string): Promise<Policy | null>;
  findByType(type: PolicyType): Promise<Policy[]>;
  findAll(): Promise<Policy[]>;
  delete(id: string): Promise<void>;
}


