/**
 * Policy Repository Factory
 * 
 * Factory for creating policy repository instances.
 */

import { IPolicyRepository } from '@/core/application/policies/ports/IPolicyRepository';
import { StaticPolicyRepository } from './StaticPolicyRepository';
import { ApiPolicyRepository } from './ApiPolicyRepository';

export type PolicyRepositoryType = 'static' | 'api';

/**
 * Create policy repository based on type
 */
export function createPolicyRepository(type?: PolicyRepositoryType): IPolicyRepository {
  const repoType = type || (process.env.NEXT_PUBLIC_POLICY_REPOSITORY as PolicyRepositoryType) || 'static';

  switch (repoType) {
    case 'api':
      return new ApiPolicyRepository();
    case 'static':
    default:
      return new StaticPolicyRepository();
  }
}

/**
 * Default policy repository instance
 */
export const policyRepository = createPolicyRepository();


