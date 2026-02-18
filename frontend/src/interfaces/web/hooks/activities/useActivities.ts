import { useState, useEffect } from 'react';
import { ActivityDTO } from '@/core/application/activities/dto/ActivityDTO';
import { ListActivitiesUseCase } from '@/core/application/activities/useCases/ListActivitiesUseCase';
import { ApiActivityRepository } from '@/infrastructure/persistence/activities/repositories/ApiActivityRepository';

interface UseActivitiesResult {
  activities: ActivityDTO[];
  loading: boolean;
  error: string | null;
  activitiesByCategory: Record<string, ActivityDTO[]>;
  categoryOrder: string[];
}

/**
 * Hook to fetch all activities grouped by category
 * Used in trainer application form for activity-level exclusions
 * 
 * CLEAN ARCHITECTURE:
 * UI Layer (Hook) -> Application Layer (Use Case) -> Infrastructure Layer (Repository) -> API
 */
export const useActivities = (): UseActivitiesResult => {
  const [activities, setActivities] = useState<ActivityDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Category display order
  const categoryOrder = [
    'water_based',
    'high_intensity',
    'heights',
    'contact_sports',
    'outdoor_extreme',
    'indoor_technical',
    'special_needs',
    'other',
  ];

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);

        // CLEAN ARCHITECTURE: Use case orchestrates business logic
        const repository = new ApiActivityRepository();
        const useCase = new ListActivitiesUseCase(repository);

        // Fetch published (active) activities
        const result = await useCase.execute({ published: true });

        setActivities(result);
      } catch (err) {
        console.error('Failed to fetch activities:', err);
        setError('Failed to load activities. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Group activities by category
  const activitiesByCategory: Record<string, ActivityDTO[]> = {};
  
  categoryOrder.forEach((category) => {
    activitiesByCategory[category] = activities
      .filter((activity) => activity.category === category)
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  return {
    activities,
    loading,
    error,
    activitiesByCategory,
    categoryOrder,
  };
};
