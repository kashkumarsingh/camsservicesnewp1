/**
 * Policy Policy
 * 
 * Business rules for policies.
 */

import { Policy } from '../entities/Policy';

export class PolicyPolicy {
  /**
   * Check if policy can be published
   */
  static canBePublished(policy: Policy): boolean {
    return policy.validate() && policy.content.trim().length > 0;
  }

  /**
   * Check if policy requires review
   */
  static requiresReview(policy: Policy): boolean {
    // Business rule: Policies older than 1 year require review
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return policy.lastUpdated < oneYearAgo;
  }

  /**
   * Check if policy is legally required
   */
  static isLegallyRequired(policy: Policy): boolean {
    const requiredTypes: string[] = ['privacy', 'terms-of-service', 'safeguarding'];
    return requiredTypes.includes(policy.type);
  }

  /**
   * Check if policy can be updated
   */
  static canBeUpdated(policy: Policy): boolean {
    return policy.published && policy.isEffective();
  }
}


