/**
 * Mock Location-Based Trainer and Activity Data
 * This data simulates how trainers and activities vary by region/postcode
 */

export interface LocationTrainer {
  id: number;
  name: string;
  role: string;
  rating: number;
  certifications: string[];
  availableInRegions: string[];
  availablePostcodes?: string[]; // Specific postcodes if available
  serviceRadiusKm?: number; // Service radius from their base location
  baseLocation?: {
    latitude: number;
    longitude: number;
    city: string;
  };
}

export interface LocationActivity {
  id: number;
  name: string;
  description: string;
  duration: number;
  availableInRegions: string[];
  availablePostcodes?: string[];
  trainerIds: number[]; // Which trainers offer this activity
  serviceRadiusKm?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
}

// Location-based trainers
export const locationTrainers: LocationTrainer[] = [
  {
    id: 1,
    name: 'John Doe',
    role: 'Lead SEN Mentor',
    rating: 5,
    certifications: ['Level 3 SEN Support', 'Trauma-Informed Practice', 'First Aid'],
    availableInRegions: ['Hertfordshire', 'Greater London', 'Essex'],
    availablePostcodes: ['AL10', 'AL11', 'AL12', 'WD', 'SG8', 'SG9', 'HP'],
    serviceRadiusKm: 20,
    baseLocation: {
      latitude: 51.7520,
      longitude: -0.2400,
      city: 'Hatfield',
    },
  },
  {
    id: 2,
    name: 'Jane Smith',
    role: 'Trauma-Informed Care Specialist',
    rating: 5,
    certifications: ['Advanced Trauma-Informed Care', 'Child Psychology', 'Safeguarding Lead'],
    availableInRegions: ['Hertfordshire', 'Buckinghamshire', 'Bedfordshire'],
    availablePostcodes: ['AL', 'SG', 'HP', 'MK'],
    serviceRadiusKm: 25,
    baseLocation: {
      latitude: 51.7580,
      longitude: -0.3300,
      city: 'St Albans',
    },
  },
  {
    id: 3,
    name: 'Alex Johnson',
    role: 'Activity Coordinator',
    rating: 4,
    certifications: ['Youth Work Qualification', 'Outdoor Education Leader', 'Sports Coaching'],
    availableInRegions: ['Greater London', 'Hertfordshire', 'Essex'],
    availablePostcodes: ['E', 'N', 'NW', 'AL', 'WD'],
    serviceRadiusKm: 30,
    baseLocation: {
      latitude: 51.5074,
      longitude: -0.1278,
      city: 'London',
    },
  },
  {
    id: 4,
    name: 'Sarah Williams',
    role: 'SEN Specialist - North',
    rating: 5,
    certifications: ['SENCO', 'ASD Specialist', 'Sensory Integration'],
    availableInRegions: ['Greater Manchester', 'Lancashire', 'Merseyside'],
    availablePostcodes: ['M', 'OL', 'BL', 'L'],
    serviceRadiusKm: 35,
    baseLocation: {
      latitude: 53.4808,
      longitude: -2.2426,
      city: 'Manchester',
    },
  },
  {
    id: 5,
    name: 'Michael Brown',
    role: 'Sports & Movement Coach',
    rating: 4,
    certifications: ['Sports Science', 'Adaptive PE', 'DBS Enhanced'],
    availableInRegions: ['West Midlands', 'Warwickshire'],
    availablePostcodes: ['B', 'CV', 'DY'],
    serviceRadiusKm: 40,
    baseLocation: {
      latitude: 52.4862,
      longitude: -1.8904,
      city: 'Birmingham',
    },
  },
];

// Location-based activities
export const locationActivities: LocationActivity[] = [
  {
    id: 1,
    name: 'Creative Play',
    description: 'Engaging activities designed to stimulate imagination and artistic expression.',
    duration: 1,
    availableInRegions: ['Hertfordshire', 'Greater London', 'Essex'],
    trainerIds: [1, 3],
    serviceRadiusKm: 20,
  },
  {
    id: 2,
    name: 'Outdoor Exploration',
    description: 'Guided adventures in nature, fostering curiosity and physical activity.',
    duration: 1.5,
    availableInRegions: ['Hertfordshire', 'Greater London', 'Essex', 'Buckinghamshire'],
    trainerIds: [2, 3],
    serviceRadiusKm: 25,
  },
  {
    id: 3,
    name: 'Sensory Activities',
    description: 'Calming and stimulating activities focused on sensory integration and regulation.',
    duration: 0.5,
    availableInRegions: ['Hertfordshire', 'Greater London'],
    trainerIds: [1, 2],
    serviceRadiusKm: 15,
  },
  {
    id: 4,
    name: 'Skill-Building Games',
    description: 'Fun and educational games to develop cognitive and social skills.',
    duration: 1.5,
    availableInRegions: ['Greater London', 'Hertfordshire', 'Essex'],
    trainerIds: [2, 3],
    serviceRadiusKm: 20,
  },
  {
    id: 5,
    name: 'Mindfulness Exercises',
    description: 'Techniques to promote relaxation, focus, and emotional well-being.',
    duration: 1,
    availableInRegions: ['Hertfordshire', 'Buckinghamshire', 'Bedfordshire'],
    trainerIds: [1, 2],
    serviceRadiusKm: 18,
  },
  {
    id: 6,
    name: 'Therapeutic Art',
    description: 'Art-based interventions to support emotional expression and healing.',
    duration: 2,
    availableInRegions: ['Greater London', 'Hertfordshire'],
    trainerIds: [3],
    serviceRadiusKm: 25,
  },
  {
    id: 7,
    name: 'Social Skills Workshops',
    description: 'Interactive sessions to develop effective communication and social interaction skills.',
    duration: 1.5,
    availableInRegions: ['Hertfordshire', 'Greater London', 'Essex'],
    trainerIds: [1, 2],
    serviceRadiusKm: 22,
  },
  // Additional Hertfordshire-specific activities for testing
  {
    id: 11,
    name: 'Nature Discovery',
    description: 'Explore local parks and nature reserves, learning about wildlife and ecosystems.',
    duration: 2,
    availableInRegions: ['Hertfordshire'],
    trainerIds: [1, 2],
    serviceRadiusKm: 20,
  },
  {
    id: 12,
    name: 'Science Experiments',
    description: 'Hands-on science activities including simple chemistry and physics experiments.',
    duration: 1.5,
    availableInRegions: ['Hertfordshire', 'Greater London'],
    trainerIds: [1, 3],
    serviceRadiusKm: 18,
  },
  {
    id: 13,
    name: 'Dance & Movement',
    description: 'Creative dance and movement sessions to improve coordination and expressiveness.',
    duration: 1,
    availableInRegions: ['Hertfordshire', 'Greater London'],
    trainerIds: [2, 3],
    serviceRadiusKm: 22,
  },
  {
    id: 14,
    name: 'Cooking & Baking',
    description: 'Learn basic cooking skills and create delicious treats together.',
    duration: 1.5,
    availableInRegions: ['Hertfordshire'],
    trainerIds: [1, 2],
    serviceRadiusKm: 20,
  },
  {
    id: 15,
    name: 'Music & Sound',
    description: 'Explore musical instruments, rhythm, and sound through interactive play.',
    duration: 1,
    availableInRegions: ['Hertfordshire', 'Greater London'],
    trainerIds: [3],
    serviceRadiusKm: 25,
  },
  {
    id: 16,
    name: 'Storytelling & Drama',
    description: 'Creative storytelling and role-play activities to boost confidence and communication.',
    duration: 1.5,
    availableInRegions: ['Hertfordshire'],
    trainerIds: [1, 2],
    serviceRadiusKm: 20,
  },
  // Northern activities (Manchester area)
  {
    id: 8,
    name: 'Community Sports',
    description: 'Team-based sports activities in community settings.',
    duration: 1.5,
    availableInRegions: ['Greater Manchester', 'Lancashire'],
    trainerIds: [4],
    serviceRadiusKm: 30,
  },
  {
    id: 9,
    name: 'Urban Exploration',
    description: 'City-based discovery activities and local history tours.',
    duration: 2,
    availableInRegions: ['Greater Manchester', 'Merseyside'],
    trainerIds: [4],
    serviceRadiusKm: 35,
  },
  // Midlands activities
  {
    id: 10,
    name: 'Adventure Sports',
    description: 'High-energy sports activities for active children.',
    duration: 2,
    availableInRegions: ['West Midlands', 'Warwickshire'],
    trainerIds: [5],
    serviceRadiusKm: 40,
  },
];

/**
 * Get trainers available for a given location
 */
export function getTrainersForLocation(
  region?: string,
  postcode?: string,
  latitude?: number,
  longitude?: number
): LocationTrainer[] {
  return locationTrainers.filter(trainer => {
    // Region match
    if (region && trainer.availableInRegions.includes(region)) {
      return true;
    }

    // Postcode match (check prefix)
    if (postcode) {
      const postcodePrefix = postcode.split(' ')[0].substring(0, 2).toUpperCase();
      if (trainer.availablePostcodes?.some(pc => postcodePrefix.startsWith(pc))) {
        return true;
      }
    }

    // Distance-based (if coordinates available)
    if (latitude && longitude && trainer.baseLocation && trainer.serviceRadiusKm) {
      const distance = calculateDistance(
        latitude,
        longitude,
        trainer.baseLocation.latitude,
        trainer.baseLocation.longitude
      );
      return distance <= trainer.serviceRadiusKm;
    }

    return false;
  });
}

/**
 * Get activities available for a given location
 */
export function getActivitiesForLocation(
  region?: string,
  postcode?: string,
  latitude?: number,
  longitude?: number
): LocationActivity[] {
  return locationActivities.filter(activity => {
    // Region match
    if (region && activity.availableInRegions.includes(region)) {
      return true;
    }

    // Postcode match
    if (postcode) {
      const postcodePrefix = postcode.split(' ')[0].substring(0, 2).toUpperCase();
      if (activity.availablePostcodes?.some(pc => postcodePrefix.startsWith(pc))) {
        return true;
      }
    }

    // Distance-based
    if (latitude && longitude && activity.location && activity.serviceRadiusKm) {
      const distance = calculateDistance(
        latitude,
        longitude,
        activity.location.latitude,
        activity.location.longitude
      );
      return distance <= activity.serviceRadiusKm;
    }

    return false;
  });
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

