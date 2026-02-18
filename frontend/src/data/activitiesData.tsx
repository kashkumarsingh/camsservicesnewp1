/**
 * Activities Data
 * 
 * Static data for activities.
 * This will be replaced by API data when Laravel backend is ready.
 */

import { ActivityTrainer } from '@/core/domain/activities/entities/Activity';

export interface ActivityData {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  duration: number;
  trainerIds: number[];
  trainers?: ActivityTrainer[];
  category?: string;
  ageRange?: string;
  published: boolean;
  views: number;
}

export const activitiesData: ActivityData[] = [
  {
    id: '1',
    name: 'Creative Play',
    slug: 'creative-play',
    description: 'Engaging activities designed to stimulate imagination and artistic expression.',
    imageUrl: '/images/activities/creative-play.webp',
    duration: 1,
    trainerIds: [1, 3],
    category: 'Creative',
    ageRange: '5-12',
    published: true,
    views: 156,
  },
  {
    id: '2',
    name: 'Outdoor Exploration',
    slug: 'outdoor-exploration',
    description: 'Guided adventures in nature, fostering curiosity and physical activity.',
    imageUrl: '/images/activities/outdoor-exploration.webp',
    duration: 1.5,
    trainerIds: [2],
    category: 'Outdoor',
    ageRange: '6-14',
    published: true,
    views: 203,
  },
  {
    id: '3',
    name: 'Sensory Activities',
    slug: 'sensory-activities',
    description: 'Calming and stimulating activities focused on sensory integration and regulation.',
    imageUrl: '/images/activities/sensory-activities.webp',
    duration: 0.5,
    trainerIds: [1, 3],
    category: 'Therapeutic',
    ageRange: 'All ages',
    published: true,
    views: 189,
  },
  {
    id: '4',
    name: 'Skill-Building Games',
    slug: 'skill-building-games',
    description: 'Fun and educational games to develop cognitive and social skills.',
    imageUrl: '/images/activities/skill-building-games.webp',
    duration: 1.5,
    trainerIds: [2, 3],
    category: 'Educational',
    ageRange: '7-15',
    published: true,
    views: 178,
  },
  {
    id: '5',
    name: 'Mindfulness Exercises',
    slug: 'mindfulness-exercises',
    description: 'Techniques to promote relaxation, focus, and emotional well-being.',
    imageUrl: '/images/activities/mindfulness-exercises.webp',
    duration: 1,
    trainerIds: [1],
    category: 'Therapeutic',
    ageRange: '8+',
    published: true,
    views: 142,
  },
  {
    id: '6',
    name: 'Therapeutic Art',
    slug: 'therapeutic-art',
    description: 'Art-based interventions to support emotional expression and healing.',
    imageUrl: '/images/activities/therapeutic-art.webp',
    duration: 2,
    trainerIds: [3],
    category: 'Creative',
    ageRange: 'All ages',
    published: true,
    views: 167,
  },
  {
    id: '7',
    name: 'Social Skills Workshops',
    slug: 'social-skills-workshops',
    description: 'Interactive sessions to develop effective communication and social interaction skills.',
    imageUrl: '/images/activities/social-skills-workshops.webp',
    duration: 1.5,
    trainerIds: [1, 2],
    category: 'Educational',
    ageRange: '6-16',
    published: true,
    views: 195,
  },
];


