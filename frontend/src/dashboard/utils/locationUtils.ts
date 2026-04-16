/**
 * Location Utilities
 * UK Postcode validation, location services, and map links.
 * Single source of truth for all location-related helpers (no duplicated logic in components).
 */

/**
 * Google Maps search URL for an address or place name.
 * Use wherever a session/venue location should open in Google Maps.
 * Centralised so behaviour and URL format stay consistent across the app.
 */
export function getGoogleMapsSearchUrl(location: string): string {
  const query = location?.trim();
  if (!query) return 'https://www.google.com/maps';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Google Maps URL for a precise location (lat/lng), e.g. trainer at clock-in.
 * Use wherever we have coordinates and want to show "where is the trainer" on the map.
 * Centralised so behaviour and URL format stay consistent across the app.
 */
export function getGoogleMapsUrlForCoordinates(latitude: number, longitude: number): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(String(latitude))},${encodeURIComponent(String(longitude))}`;
}

/** Options for optional device geolocation (e.g. trainer clock-in). */
const DEFAULT_GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 60_000,
};

/**
 * Reverse geocode coordinates to a short address string (e.g. "High Street, London").
 * Uses OpenStreetMap Nominatim (no API key). Returns null on failure.
 * Use for filling location from "use my position" so trainer doesn't have to type.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('lat', String(latitude));
    url.searchParams.set('lon', String(longitude));
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'en',
        'User-Agent': 'CAMS-Trainer-App/1.0 (location-from-device)',
      },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      address?: {
        road?: string;
        suburb?: string;
        neighbourhood?: string;
        village?: string;
        town?: string;
        city?: string;
        county?: string;
        state?: string;
        postcode?: string;
        country?: string;
      };
      display_name?: string;
    };
    const a = data?.address;
    if (!a) return data?.display_name ?? null;
    const parts: string[] = [];
    if (a.road) parts.push(a.road);
    if (a.suburb && a.suburb !== a.road) parts.push(a.suburb);
    if (a.neighbourhood && !parts.includes(a.neighbourhood)) parts.push(a.neighbourhood);
    if (a.village && !parts.includes(a.village)) parts.push(a.village);
    if (a.town && !parts.includes(a.town)) parts.push(a.town);
    if (a.city && !parts.includes(a.city)) parts.push(a.city);
    if (a.county && !parts.includes(a.county)) parts.push(a.county);
    if (parts.length > 0) return parts.slice(0, 3).join(', ');
    if (a.postcode) return a.postcode + (a.country ? `, ${a.country}` : '');
    return data?.display_name ?? null;
  } catch {
    return null;
  }
}

/**
 * Get current device position (GPS) if available. Resolves with null if denied, unavailable or error.
 * Use for clock-in location, etc. Centralised so timeout/options and error handling are consistent.
 */
export function getCurrentPositionOptional(
  options: PositionOptions = DEFAULT_GEOLOCATION_OPTIONS
): Promise<{ latitude: number; longitude: number } | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => resolve(null),
      options
    );
  });
}

// UK Postcode regex pattern
const UK_POSTCODE_REGEX = /^([A-Z]{1,2}\d{1,2}[A-Z]?)\s*(\d[A-Z]{2})$/i;

/**
 * Validate UK postcode format
 */
export function validateUKPostcode(postcode: string): boolean {
  if (!postcode) return false;
  return UK_POSTCODE_REGEX.test(postcode.trim());
}

/**
 * Format UK postcode (add space if missing)
 */
export function formatUKPostcode(postcode: string): string {
  if (!postcode) return '';
  
  const trimmed = postcode.trim().toUpperCase().replace(/\s+/g, '');
  
  // Extract outward and inward parts
  const match = trimmed.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)(\d[A-Z]{2})$/);
  
  if (match) {
    return `${match[1]} ${match[2]}`;
  }
  
  return postcode; // Return as-is if doesn't match
}

/**
 * Extract county/region from postcode (UK county-based mapping)
 * For production, use an API like postcodes.io
 */
export function getRegionFromPostcode(postcode: string): string {
  if (!postcode) return 'Unknown';
  
  const formatted = formatUKPostcode(postcode);
  const area = formatted.split(' ')[0].replace(/\d+/g, ''); // Extract letter prefix
  
  // UK County/Region mapping (based on postcode areas)
  const regionMap: Record<string, string> = {
    // Greater London
    'W': 'Greater London',
    'WC': 'Greater London',
    'SW': 'Greater London',
    'SE': 'Greater London',
    'E': 'Greater London',
    'EC': 'Greater London',
    'N': 'Greater London',
    'NW': 'Greater London',
    'IG': 'Greater London',
    'RM': 'Greater London',
    'EN': 'Greater London',
    'HA': 'Greater London',
    'UB': 'Greater London',
    'TW': 'Greater London',
    'KT': 'Greater London',
    'SM': 'Greater London',
    'CR': 'Greater London',
    'BR': 'Greater London',
    'DA': 'Greater London',
    
    // Hertfordshire
    'AL': 'Hertfordshire',
    'WD': 'Hertfordshire',
    'SG': 'Hertfordshire',
    'HP': 'Hertfordshire', // Parts of Herts/Bucks
    
    // Essex
    'CM': 'Essex',
    'SS': 'Essex',
    'CO': 'Essex',
    
    // Kent
    'ME': 'Kent',
    'CT': 'Kent',
    'TN': 'Kent',
    
    // Surrey
    'GU': 'Surrey',
    'RH': 'Surrey',
    
    // Berkshire
    'RG': 'Berkshire',
    'SL': 'Berkshire',
    
    // Buckinghamshire
    'MK': 'Buckinghamshire',
    
    // Bedfordshire
    'LU': 'Bedfordshire',
    
    // Cambridgeshire
    'CB': 'Cambridgeshire',
    'PE': 'Cambridgeshire',
    
    // Norfolk
    'NR': 'Norfolk',
    
    // Suffolk
    'IP': 'Suffolk',
    
    // Oxfordshire
    'OX': 'Oxfordshire',
    
    // Greater Manchester
    'M': 'Greater Manchester',
    'OL': 'Greater Manchester',
    'BL': 'Greater Manchester',
    'SK': 'Greater Manchester',
    'WA': 'Greater Manchester',
    
    // West Midlands
    'B': 'West Midlands',
    'CV': 'West Midlands',
    'WS': 'West Midlands',
    'WV': 'West Midlands',
    'DY': 'West Midlands',
    
    // West Yorkshire
    'LS': 'West Yorkshire',
    'BD': 'West Yorkshire',
    'HX': 'West Yorkshire',
    'HD': 'West Yorkshire',
    'WF': 'West Yorkshire',
    
    // South Yorkshire
    'S': 'South Yorkshire',
    'DN': 'South Yorkshire',
    
    // Merseyside
    'L': 'Merseyside',
    'CH': 'Merseyside',
    
    // Lancashire
    'PR': 'Lancashire',
    'BB': 'Lancashire',
    'FY': 'Lancashire',
    
    // Cheshire
    'CW': 'Cheshire',
    
    // Derbyshire
    'DE': 'Derbyshire',
    
    // Nottinghamshire
    'NG': 'Nottinghamshire',
    
    // Leicestershire
    'LE': 'Leicestershire',
    
    // Staffordshire
    'ST': 'Staffordshire',
    
    // Shropshire
    'SY': 'Shropshire',
    'TF': 'Shropshire',
    
    // Worcestershire
    'WR': 'Worcestershire',

    // Northamptonshire
    'NN': 'Northamptonshire',
    
    // Lincolnshire
    'LN': 'Lincolnshire',
    
    // Hampshire
    'SO': 'Hampshire',
    'PO': 'Hampshire',
    
    // Sussex (BN covers both West and East, RH is Surrey/West Sussex, TN is Kent/East Sussex)
    'BN': 'Sussex',
    
    // Dorset
    'BH': 'Dorset',
    'DT': 'Dorset',
    
    // Somerset
    'BA': 'Somerset',
    'TA': 'Somerset',
    
    // Devon
    'EX': 'Devon',
    'TQ': 'Devon',
    'PL': 'Devon',
    
    // Cornwall
    'TR': 'Cornwall',
    
    // Bristol
    'BS': 'Bristol',
    
    // Gloucestershire
    'GL': 'Gloucestershire',
    
    // Wiltshire
    'SN': 'Wiltshire',
    'SP': 'Wiltshire',
    
    // Scotland
    'G': 'Glasgow',
    'EH': 'Edinburgh',
    'AB': 'Aberdeenshire',
    'DD': 'Dundee',
    'FK': 'Falkirk',
    'KY': 'Fife',
    'PA': 'Argyll',
    'PH': 'Perth',
    'IV': 'Inverness',
    
    // Wales
    'CF': 'Cardiff',
    'SA': 'Swansea',
    'NP': 'Newport',
    'LD': 'Powys',
    'LL': 'North Wales',
    
    // Northern Ireland
    'BT': 'Northern Ireland',
  };
  
  return regionMap[area] || 'Other';
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Real geocoding function using postcodes.io API
 * Returns accurate coordinates, city, and region data
 */
export async function geocodePostcode(postcode: string): Promise<{
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  county?: string;
  adminDistrict?: string;
} | null> {
  if (!validateUKPostcode(postcode)) {
    return null;
  }
  
  try {
    const formattedPostcode = formatUKPostcode(postcode).replace(/\s+/g, '');
    
    // Use postcodes.io API (free, no key required)
    const response = await fetch(
      `https://api.postcodes.io/postcodes/${formattedPostcode}`
    );

    if (!response.ok) {
      // Fallback to static map if API fails
      const region = getRegionFromPostcode(postcode);
      return {
        latitude: 51.5074, // Default to London coordinates
        longitude: -0.1278,
        city: region,
        region: region,
      };
    }

    const data = await response.json();
    const result = data.result;

    if (!result) {
      // Fallback to static map if no result
      const region = getRegionFromPostcode(postcode);
      return {
        latitude: 51.5074,
        longitude: -0.1278,
        city: region,
        region: region,
      };
    }

    // Extract real data from API
    const county = result.admin_district || result.county || result.admin_county || '';
    const city = result.admin_ward || result.parish || result.admin_district || county;
    const region = getRegionFromPostcode(postcode); // Use our region map for consistency

    return {
      latitude: result.latitude,
      longitude: result.longitude,
      city: city || region,
      region: region,
      county: county,
      adminDistrict: result.admin_district,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    // Fallback to static map on error
    const region = getRegionFromPostcode(postcode);
    return {
      latitude: 51.5074,
      longitude: -0.1278,
      city: region,
      region: region,
    };
  }
}

/**
 * Check if activity is available in location
 */
export function isActivityAvailableInLocation(
  activity: {
    available_in_regions?: string[];
    available_postcodes?: string[];
    service_radius_km?: number;
    location?: {
      latitude?: number;
      longitude?: number;
    };
    latitude?: number;
    longitude?: number;
  },
  childLocation: {
    postcode?: string;
    region?: string;
    latitude?: number;
    longitude?: number;
  }
): boolean {
  // If no location restrictions, activity is available everywhere
  if (
    !activity.available_in_regions &&
    !activity.available_postcodes &&
    !activity.service_radius_km
  ) {
    return true;
  }
  
  // Check region match (county-based)
  if (activity.available_in_regions && childLocation.region) {
    if (activity.available_in_regions.includes(childLocation.region)) {
      return true;
    }
  }
  
  // Check postcode match (specific postcodes)
  if (activity.available_postcodes && childLocation.postcode) {
    if (activity.available_postcodes.includes(childLocation.postcode)) {
      return true;
    }
  }
  
  // Check radius if lat/lng available (distance-based filtering)
  if (activity.service_radius_km && 
      childLocation.latitude && 
      childLocation.longitude) {
    // Get activity location coordinates
    const activityLat = activity.latitude || activity.location?.latitude;
    const activityLng = activity.longitude || activity.location?.longitude;
    
    if (activityLat && activityLng) {
      const distance = calculateDistance(
        childLocation.latitude,
        childLocation.longitude,
        activityLat,
        activityLng
      );
      
      // Activity is available if within service radius
      if (distance <= activity.service_radius_km) {
        return true;
      }
    }
  }
  
  // Default to not available if restrictions exist but no match found
  return false;
}

/**
 * Get distance label for display
 */
export function getDistanceLabel(distanceKm: number): string {
  if (distanceKm < 1) {
    return 'Less than 1 km away';
  } else if (distanceKm < 5) {
    return `${distanceKm} km away (nearby)`;
  } else if (distanceKm < 20) {
    return `${distanceKm} km away`;
  } else {
    return `${distanceKm} km away (distant)`;
  }
}

