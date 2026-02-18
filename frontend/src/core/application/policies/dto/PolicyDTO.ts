/**
 * Policy DTO
 * 
 * Data transfer object for policies.
 */

import { PolicyType } from '../../../domain/policies/entities/Policy';

export interface PolicyDTO {
  id: string;
  title: string;
  slug: string;
  type: PolicyType;
  content: string;
  summary?: string;
  lastUpdated: string;
  effectiveDate: string;
  version: string;
  views: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}


