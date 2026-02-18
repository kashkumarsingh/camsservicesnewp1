/**
 * Create Policy DTO
 * 
 * Input DTO for creating policies.
 */

import { PolicyType } from '../../../domain/policies/entities/Policy';

export interface CreatePolicyDTO {
  title: string;
  type: PolicyType;
  content: string;
  effectiveDate: string;
  version: string;
  summary?: string;
  published?: boolean;
}


