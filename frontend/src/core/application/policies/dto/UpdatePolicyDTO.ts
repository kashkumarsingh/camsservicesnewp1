/**
 * Update Policy DTO
 * 
 * Input DTO for updating policies.
 * All fields are optional.
 */

import { PolicyType } from '../../../domain/policies/entities/Policy';

export interface UpdatePolicyDTO {
  title?: string;
  type?: PolicyType;
  content?: string;
  effectiveDate?: string;
  version?: string;
  summary?: string;
  published?: boolean;
}


