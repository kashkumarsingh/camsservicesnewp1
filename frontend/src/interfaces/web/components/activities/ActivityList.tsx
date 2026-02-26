/**
 * Activity List Component
 * 
 * Displays a list of activities.
 */

'use client';

import { useActivities } from '../../hooks/activities/useActivities';
import ActivityCard from './ActivityCard';
import { EMPTY_STATE } from '@/utils/emptyStateConstants';

// No props needed - hook fetches all activities
export default function ActivityList() {
  const { activities, loading, error } = useActivities();

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-navy-blue/80">Loading activities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-navy-blue/80">{EMPTY_STATE.NO_ACTIVITIES_FOUND.title}</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  );
}


