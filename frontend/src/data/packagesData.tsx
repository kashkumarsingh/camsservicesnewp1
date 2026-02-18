export interface Package {
  id: number;
  name: string;
  slug: string;
  description: string;
  hours: number;
  price: number;
  duration: string;
  color: string;
  features: string[];
  activities: Array<{ id: number; name: string; imageUrl: string; duration: number; description: string; trainerIds: number[] }>;
  perks: string[];
  popular?: boolean;
  hoursPerWeek: number;
  spotsRemaining?: number; // Number of spots available
}

export const packages: Package[] = [
  {
    id: 1,
    name: 'Mars',
    slug: 'mars',
    description: 'Blast off on an amazing adventure to Mars! This package is perfect for young explorers ready to discover new skills and make friends. Get ready for exciting missions, creative challenges, and a super supportive crew to guide you every step of the way!',
    hours: 18,
    price: 135,
    duration: '3 hours per week for 6 weeks',
    color: 'from-red-500 to-orange-500',
    features: [
      'Dedicated trained staff',
      'Activity costs included',
      'Healthy snacks provided',
      'Written session reports',
      'Flexible scheduling',
    ],
    activities: [
      { id: 1, name: 'Creative Play', imageUrl: '/images/activities/creative-play.webp', duration: 1, description: 'Engaging activities designed to stimulate imagination and artistic expression.', trainerIds: [1, 3] },
      { id: 2, name: 'Outdoor Exploration', imageUrl: '/images/activities/outdoor-exploration.webp', duration: 1.5, description: 'Guided adventures in nature, fostering curiosity and physical activity.', trainerIds: [2] },
      { id: 3, name: 'Sensory Activities', imageUrl: '/images/activities/sensory-activities.webp', duration: 0.5, description: 'Calming and stimulating activities focused on sensory integration and regulation.', trainerIds: [1, 3] },
    ],
    perks: ['Healthy Snacks Provided', 'Certificate of Completion'],
    hoursPerWeek: 3,
    spotsRemaining: 5, // Mock data - would come from backend
  },
  {
    id: 2,
    name: 'Earth',
    slug: 'earth',
    description: 'The Earth package offers an extended level of support with more hours and a wider range of activities. It is ideal for children who require more intensive support to thrive.',
    hours: 36,
    price: 265,
    duration: '6 hours per week for 6 weeks',
    color: 'from-blue-500 to-green-500',
    popular: true,
    features: [
      'All Mars features',
      'Extended support time',
      'Multiple activities',
      'Progress tracking',
      'Priority booking',
    ],
    activities: [
      { id: 1, name: 'Creative Play', imageUrl: '/images/activities/creative-play.webp', duration: 1, description: 'Engaging activities designed to stimulate imagination and artistic expression.', trainerIds: [1, 3] },
      { id: 2, name: 'Outdoor Exploration', imageUrl: '/images/activities/outdoor-exploration.webp', duration: 1.5, description: 'Guided adventures in nature, fostering curiosity and physical activity.', trainerIds: [2] },
      { id: 3, name: 'Sensory Activities', imageUrl: '/images/activities/sensory-activities.webp', duration: 0.5, description: 'Calming and stimulating activities focused on sensory integration and regulation.', trainerIds: [1, 3] },
      { id: 4, name: 'Skill-Building Games', imageUrl: '/images/activities/skill-building-games.webp', duration: 1.5, description: 'Fun and educational games to develop cognitive and social skills.', trainerIds: [2, 3] },
      { id: 5, name: 'Mindfulness Exercises', imageUrl: '/images/activities/mindfulness-exercises.webp', duration: 1, description: 'Techniques to promote relaxation, focus, and emotional well-being.', trainerIds: [1] },
    ],
    perks: ['Healthy Snacks Provided', 'Free Drink', 'Priority Booking'],
    hoursPerWeek: 6,
    spotsRemaining: 3, // Mock data - would come from backend
  },
  {
    id: 3,
    name: 'Saturn',
    slug: 'saturn',
    description: 'The Saturn package provides our most comprehensive level of support, with the highest number of hours, specialized activities, and a dedicated coordinator to ensure a tailored experience.',
    hours: 54,
    price: 395,
    duration: '9 hours per week for 6 weeks',
    color: 'from-purple-500 to-pink-500',
    features: [
      'All Earth features',
      'Comprehensive support',
      'Specialized activities',
      'Detailed progress reports',
      'Dedicated coordinator',
    ],
    activities: [
      { id: 1, name: 'Creative Play', imageUrl: '/images/activities/creative-play.webp', duration: 1, description: 'Engaging activities designed to stimulate imagination and artistic expression.', trainerIds: [1, 3] },
      { id: 2, name: 'Outdoor Exploration', imageUrl: '/images/activities/outdoor-exploration.webp', duration: 1.5, description: 'Guided adventures in nature, fostering curiosity and physical activity.', trainerIds: [2] },
      { id: 3, name: 'Sensory Activities', imageUrl: '/images/activities/sensory-activities.webp', duration: 0.5, description: 'Calming and stimulating activities focused on sensory integration and regulation.', trainerIds: [1, 3] },
      { id: 4, name: 'Skill-Building Games', imageUrl: '/images/activities/skill-building-games.webp', duration: 1.5, description: 'Fun and educational games to develop cognitive and social skills.', trainerIds: [2, 3] },
      { id: 5, name: 'Mindfulness Exercises', imageUrl: '/images/activities/mindfulness-exercises.webp', duration: 1, description: 'Techniques to promote relaxation, focus, and emotional well-being.', trainerIds: [1] },
      { id: 6, name: 'Therapeutic Art', imageUrl: '/images/activities/therapeutic-art.webp', duration: 2, description: 'Art-based interventions to support emotional expression and healing.', trainerIds: [3] },
      { id: 7, name: 'Social Skills Workshops', imageUrl: '/images/activities/social-skills-workshops.webp', duration: 1.5, description: 'Interactive sessions to develop effective communication and social interaction skills.', trainerIds: [1, 2] },
    ],
    perks: ['Healthy Snacks Provided', 'Free Meal', 'Free Drinks', 'Dedicated Coordinator'],
    hoursPerWeek: 9,
    spotsRemaining: 2, // Mock data - would come from backend
  },
];
