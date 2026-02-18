/**
 * Activity Filtering Utilities
 * Filter activities based on location and other criteria
 * 
 * Domain-specific utility for activities domain.
 */

import { getRegionFromPostcode } from '@/utils/locationUtils';

interface Activity {
  id: number;
  name: string;
  available_in_regions?: string[];
  available_postcodes?: string[];
  service_radius_km?: number;
  [key: string]: unknown;
}

interface LocationData {
  postcode?: string;
  region?: string;
  city?: string;
}

/**
 * Filter activities based on child's location
 */
export function filterActivitiesByLocation(
  activities: Activity[],
  childLocation: LocationData
): Activity[] {
  if (!childLocation.postcode && !childLocation.region) {
    // No location data, return all activities
    return activities;
  }

  const childRegion = childLocation.region || getRegionFromPostcode(childLocation.postcode || '');

  return activities.filter((activity) => {
    // If activity has no location restrictions, it's available everywhere
    if (
      !activity.available_in_regions &&
      !activity.available_postcodes &&
      !activity.service_radius_km
    ) {
      return true;
    }

    // Check region match
    if (activity.available_in_regions) {
      return activity.available_in_regions.includes(childRegion);
    }

    // Check specific postcode match
    if (activity.available_postcodes && childLocation.postcode) {
      return activity.available_postcodes.includes(childLocation.postcode);
    }

    // Default: allow if no restrictions matched
    return true;
  });
}

/**
 * Get activities summary for location
 */
export function getLocationActivitySummary(
  allActivities: Activity[],
  childLocation: LocationData
): {
  total: number;
  available: number;
  unavailable: number;
  region: string;
} {
  const region = childLocation.region || getRegionFromPostcode(childLocation.postcode || '');
  const available = filterActivitiesByLocation(allActivities, childLocation);

  return {
    total: allActivities.length,
    available: available.length,
    unavailable: allActivities.length - available.length,
    region,
  };
}

