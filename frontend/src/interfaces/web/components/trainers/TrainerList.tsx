/**
 * Trainer List Component
 */

'use client';

import { useTrainers } from '../../hooks/trainers/useTrainers';
import TrainerCard from './TrainerCard';
import { TrainerFilterOptions } from '@/core/application/trainers';
import { SKELETON_COUNTS } from '@/utils/skeletonConstants';
import { TrainerSkeleton } from '@/components/ui/Skeleton';

interface TrainerListProps {
  filterOptions?: TrainerFilterOptions;
}

export default function TrainerList({ filterOptions }: TrainerListProps) {
  const { trainers, loading, error } = useTrainers(filterOptions);

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <TrainerSkeleton count={SKELETON_COUNTS.TRAINERS} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error.message}</p>
      </div>
    );
  }

  if (trainers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No trainers found.</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {trainers.map((trainer) => (
        <TrainerCard key={trainer.id} trainer={trainer} />
      ))}
    </div>
  );
}

