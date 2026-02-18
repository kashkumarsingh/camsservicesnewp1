/**
 * Policy Stats Calculator
 * 
 * Domain service for calculating policy statistics.
 */

import { Policy } from '../entities/Policy';

export class PolicyStatsCalculator {
  static calculateTotalPolicies(policies: Policy[]): number {
    return policies.length;
  }

  static calculatePublishedPolicies(policies: Policy[]): number {
    return policies.filter(p => p.published).length;
  }

  static calculateTotalViews(policies: Policy[]): number {
    return policies.reduce((total, policy) => total + policy.views, 0);
  }

  static calculateAverageViews(policies: Policy[]): number {
    if (policies.length === 0) {
      return 0;
    }
    return this.calculateTotalViews(policies) / policies.length;
  }

  static findMostViewed(policies: Policy[]): Policy | null {
    if (policies.length === 0) {
      return null;
    }
    return policies.reduce((mostViewed, policy) => 
      policy.views > mostViewed.views ? policy : mostViewed
    );
  }

  static findPoliciesByType(policies: Policy[], type: string): Policy[] {
    return policies.filter(p => p.type === type);
  }

  static findEffectivePolicies(policies: Policy[]): Policy[] {
    return policies.filter(p => p.isEffective());
  }
}


