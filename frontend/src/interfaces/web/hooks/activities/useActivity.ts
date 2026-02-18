/**
 * useActivity Hook
 * 
 * Hook for fetching a single activity.
 */

'use client';

import { useState, useEffect } from 'react';
import { GetActivityUseCase } from '@/core/application/activities/useCases/GetActivityUseCase';
import { IncrementViewsUseCase } from '@/core/application/activities/useCases/IncrementViewsUseCase';
import { ActivityDTO } from '@/core/application/activities';
import { activityRepository } from '@/infrastructure/persistence/activities';

export function useActivity(idOrSlug: string, incrementViews: boolean = false) {
  const [activity, setActivity] = useState<ActivityDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadActivity = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const getUseCase = new GetActivityUseCase(activityRepository);
        const result = await getUseCase.execute(idOrSlug);
        
        if (!result) {
          setError(new Error('Activity not found'));
          return;
        }

        setActivity(result);

        // Increment views if requested
        if (incrementViews) {
          const incrementUseCase = new IncrementViewsUseCase(activityRepository);
          await incrementUseCase.execute(idOrSlug);
          // Reload to get updated view count
          const updated = await getUseCase.execute(idOrSlug);
          if (updated) {
            setActivity(updated);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load activity'));
      } finally {
        setLoading(false);
      }
    };

    if (idOrSlug) {
      loadActivity();
    }
  }, [idOrSlug, incrementViews]);

  return { activity, loading, error };
}


