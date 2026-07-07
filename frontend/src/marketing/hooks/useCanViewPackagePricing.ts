"use client";

import { useAuth } from "@/interfaces/web/hooks/auth/useAuth";

export function useCanViewPackagePricing(): {
  canViewPackagePricing: boolean;
  pricingGateLoading: boolean;
} {
  const { isAuthenticated, loading } = useAuth();

  return {
    canViewPackagePricing: !loading && isAuthenticated,
    pricingGateLoading: loading
  };
}
