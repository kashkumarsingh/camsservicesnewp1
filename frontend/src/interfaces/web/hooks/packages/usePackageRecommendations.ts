'use client';

/**
 * usePackageRecommendations Hook
 * 
 * Clean Architecture Layer: Interface (Web Hooks)
 * Purpose: Provides package recommendations based on child context
 */

import { useMemo } from 'react';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { useMyBookings } from '@/interfaces/web/hooks/booking/useMyBookings';
import { PackageRecommendationService, PackageRecommendation, PackageRecommendationInput } from '@/core/application/packages/services/PackageRecommendationService';
import { PackageDTO } from '@/core/application/packages';

interface UsePackageRecommendationsOptions {
  childId?: number | null;
  packages: PackageDTO[];
}

export function usePackageRecommendations({ childId, packages }: UsePackageRecommendationsOptions) {
  const { children } = useAuth();
  const { bookings } = useMyBookings();

  // Get child information
  const child = useMemo(() => {
    if (!childId || !children) return null;
    return children.find(c => c.id === childId) || null;
  }, [childId, children]);

  // Get previous bookings for this child
  const previousBookings = useMemo(() => {
    if (!bookings || !childId) return [];
    return bookings.filter(b => {
      // Check if booking has this child as a participant
      return b.participants?.some(p => 
        (typeof p.childId === 'string' ? parseInt(p.childId, 10) : p.childId) === childId
      );
    });
  }, [bookings, childId]);

  // Generate recommendations
  const recommendations = useMemo(() => {
    if (!packages || packages.length === 0) return [];

    const input: PackageRecommendationInput = {
      child: child || undefined,
      childId: childId || undefined,
      previousBookings: previousBookings.length > 0 ? previousBookings : undefined,
      packages,
      location: child ? {
        postcode: child.postcode || undefined,
        region: child.region || undefined,
        city: child.city || undefined,
      } : undefined,
    };

    return PackageRecommendationService.recommend(input);
  }, [packages, child, childId, previousBookings]);

  // Create a map for quick lookup
  const recommendationMap = useMemo(() => {
    const map = new Map<string, PackageRecommendation>();
    recommendations.forEach(rec => {
      map.set(rec.packageId, rec);
    });
    return map;
  }, [recommendations]);

  // Get recommendation for a specific package
  const getRecommendation = useMemo(() => {
    return (packageId: string): PackageRecommendation | null => {
      return recommendationMap.get(packageId) || null;
    };
  }, [recommendationMap]);

  // Check if package is recommended
  const isRecommended = useMemo(() => {
    return (packageId: string, threshold: number = 20): boolean => {
      const rec = recommendationMap.get(packageId);
      return rec ? rec.score >= threshold : false;
    };
  }, [recommendationMap]);

  // Get top recommendations
  const topRecommendations = useMemo(() => {
    return recommendations.slice(0, 3);
  }, [recommendations]);

  return {
    recommendations,
    recommendationMap,
    getRecommendation,
    isRecommended,
    topRecommendations,
    hasRecommendations: recommendations.length > 0 && recommendations[0].score >= 20,
  };
}
