'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Dice6, ExternalLink } from 'lucide-react';
import { OriginalTrainer } from '@/components/features/booking/types';
import { TrainerService } from '@/core/application/trainers/services';

interface TrainerPickerProps {
  trainers: OriginalTrainer[];
  packageActivities: Array<{ id: number; name: string; trainerIds: number[] }>;
  selectedTrainerId: number | null;
  onTrainerSelect: (trainerId: number | null) => void;
  locationRegion?: string | null;
  stats?: {
    total: number;
    matched: number;
    locationLabel?: string;
  };
}

const TrainerPicker: React.FC<TrainerPickerProps> = ({
  trainers,
  packageActivities,
  selectedTrainerId,
  onTrainerSelect,
  locationRegion,
  stats,
}) => {
  // Get activities count for each trainer
  const getTrainerActivitiesCount = (trainerId: number) => {
    return TrainerService.getActivityCount(trainerId, packageActivities);
  };

  // Capability filter (reduce typing; quick tap chips)
  const [capFilter, setCapFilter] = React.useState<string>('all');
  const friendlyLabels: Record<string, string> = {
    'travel_escort': 'Travel escort',
    'school_run': 'School run',
    'respite': 'Weekend respite',
    'escort': 'Club/Class escort',
    'therapy_companion': 'Therapy companion',
    'exam_support': 'Exam support',
    'hospital_support': 'Hospital support',
  };
  const capabilityKeys = Object.keys(friendlyLabels);
  const filtered = React.useMemo(() => {
    if (capFilter === 'all') {
      return trainers;
    }

    const matchesPrimary = trainers.filter(
      (t) => Array.isArray(t.capabilities) && t.capabilities.includes(capFilter)
    );

    // If strict filter removes everyone, fall back to showing all trainers but keep the filter info
    if (matchesPrimary.length === 0) {
      return trainers;
    }

    return matchesPrimary;
  }, [trainers, capFilter]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0080FF] to-[#00D4FF] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Star className="text-white fill-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Choose a Trainer</h2>
              <p className="text-sm text-blue-100 mt-0.5">
                These trainers are matched to your child&apos;s needs and area. Pick who you&apos;d like to lead the sessions.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {stats && (
            <div className="mb-4 text-xs text-gray-600">
              {stats.matched > 0
                ? `${stats.matched} of ${stats.total} trainers currently serve ${stats.locationLabel ?? 'your area'}.`
                : stats.total > 0
                ? `No one is published exactly in ${stats.locationLabel ?? 'this area'} yet. Showing our closest trainers who can often travel.`
                : `No trainers are published for this area yet. Choose "No preference" and we'll automatically match the best trainer based on location and availability.`}
            </div>
          )}
          
          {/* Only show capability filters if there are trainers available */}
          {trainers.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Filter by capability</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCapFilter('all')}
                  className={`px-4 py-2 rounded-full border-2 text-xs font-semibold transition-all ${
                    capFilter==='all' 
                      ? 'border-[#0080FF] text-[#0080FF] bg-blue-50 shadow-md' 
                      : 'border-gray-200 text-gray-700 hover:border-[#0080FF] hover:bg-gray-50'
                  }`}
                >
                  All Trainers
                </button>
                {capabilityKeys.map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => setCapFilter(cap)}
                    className={`px-4 py-2 rounded-full border-2 text-xs font-semibold transition-all ${
                      capFilter===cap 
                        ? 'border-[#0080FF] text-[#0080FF] bg-blue-50 shadow-md' 
                        : 'border-gray-200 text-gray-700 hover:border-[#0080FF] hover:bg-gray-50'
                    }`}
                  >
                    {friendlyLabels[cap]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Only show "confirming availability" message if there ARE trainers but filter removed them all */}
          {trainers.length > 0 && filtered.length === 0 && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              No trainers match the selected capability filter. Try a different filter or select "No Preference" below.
            </div>
          )}
        {/* Only show trainer grid if there are trainers to display */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {filtered.map((trainer) => {
            const isSelected = selectedTrainerId === trainer.id;
            const activitiesCount = getTrainerActivitiesCount(trainer.id);

            return (
              <div
                key={trainer.id}
                role="radio"
                tabIndex={0}
                aria-checked={isSelected}
                onClick={() => onTrainerSelect(trainer.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTrainerSelect(trainer.id); } }}
                className={`relative border-2 rounded-[30px] overflow-hidden transition-all duration-300 cursor-pointer shadow-md hover:shadow-2xl card-hover-lift md:hover:rotate-3 ${
                  isSelected
                    ? 'border-[#0080FF] scale-105'
                    : 'border-gray-200 hover:border-[#0080FF]'
                }`}
              >
                {/* Trainer Image */}
                <div className="relative w-full h-64 bg-gray-100">
                  <Image
                    src={trainer.imageSrc}
                    alt={trainer.imageAlt}
                    fill
                    className="object-cover"
                  />
                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-1.5 shadow-lg border-2 border-[#FFD700]">
                    <Star className="text-[#FFD700] fill-[#FFD700]" size={18} />
                    <span className="font-bold text-[#1E3A5F] text-base">Rating: {trainer.rating}/5</span>
                  </div>
                </div>

                {/* Trainer Info */}
                <div className="p-5 bg-white">
                  <h3 className="text-2xl font-bold text-[#1E3A5F] mb-2">{trainer.title}</h3>
                  <p className="text-base font-semibold text-gray-700 mb-4">{trainer.role}</p>

                  {/* Capability chips (if provided) */}
                  {Array.isArray(trainer.capabilities) && trainer.capabilities.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-600 mb-1 font-semibold">Supported modes</div>
                      <div className="flex flex-wrap gap-2">
                        {trainer.capabilities.slice(0, 5).map((cap: string, idx: number) => {
                          const friendlyLabels: Record<string, string> = {
                            'travel_escort': 'Travel escort',
                            'school_run': 'School run',
                            'respite': 'Weekend respite',
                            'escort': 'Club/Class escort',
                            'therapy_companion': 'Therapy companion',
                            'exam_support': 'Exam support',
                            'hospital_support': 'Hospital support',
                          };
                          const label = friendlyLabels[cap] || cap.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                          return (
                            <span key={idx} className="px-2 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-base text-[#1E3A5F]">
                      <span className="font-bold">{trainer.certifications.length} Certifications</span>
                    </div>
                    {activitiesCount > 0 ? (
                      <div className="flex items-center gap-2 text-base text-[#1E3A5F]">
                        <span className="font-bold">{activitiesCount} activities in this package</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Custom plan support available</span>
                      </div>
                    )}
                  </div>

                  {/* View Profile Link */}
                  <div className="mb-3 pt-2 border-t border-gray-200">
                    <Link
                      href={`/trainers/${trainer.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0080FF] hover:text-[#0069cc] transition-colors"
                    >
                      View Profile
                      <ExternalLink size={12} />
                    </Link>
                  </div>

                  {/* Radio-like selector footer */}
                  <div className="flex items-center justify-between pt-2">
                    <div className={`w-5 h-5 rounded-full border-2 ${isSelected ? 'border-[#0080FF]' : 'border-gray-300'} flex items-center justify-center`}>
                      <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-[#0080FF]' : 'bg-transparent'}`}/>
                    </div>
                    {isSelected && (
                      <span className="px-3 py-1 rounded-full bg-[#0080FF] text-white text-xs font-semibold">Selected</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}

        {/* No Preference Option - Only show if no trainers available OR user explicitly wants it */}
        {/* Only show if there are no trainers, or if trainers exist but user hasn't selected one yet */}
        {(filtered.length === 0 || trainers.length === 0) && (
        <div
          role="radio"
          tabIndex={0}
          aria-checked={selectedTrainerId === null}
          onClick={() => onTrainerSelect(null)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTrainerSelect(null); } }}
          className={`relative border-2 rounded-[30px] overflow-hidden transition-all duration-300 cursor-pointer shadow-md hover:shadow-2xl card-hover-lift md:hover:rotate-3 ${
            selectedTrainerId === null
              ? 'border-gray-200 ring-2 ring-[#0080FF] bg-blue-50'
              : 'border-gray-200 hover:ring-2 hover:ring-[#0080FF] hover:bg-gray-50'
          }`}
        >
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Dice6 className="text-white" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">🎲 No Preference</h3>
                <p className="text-sm text-gray-600">Auto-assign based on availability</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full border-2 ${selectedTrainerId === null ? 'border-[#0080FF]' : 'border-gray-300'} flex items-center justify-center`}>
                <div className={`w-3 h-3 rounded-full ${selectedTrainerId === null ? 'bg-[#0080FF]' : 'bg-transparent'}`}/>
              </div>
              {selectedTrainerId === null && (
                <span className="px-3 py-1 bg-[#0080FF] text-white rounded-full text-xs font-semibold">Selected</span>
              )}
            </div>
          </div>
        </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default TrainerPicker;

