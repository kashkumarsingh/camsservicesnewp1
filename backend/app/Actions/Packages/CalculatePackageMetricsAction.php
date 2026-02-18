<?php

namespace App\Actions\Packages;

use App\Models\Package;
use Illuminate\Database\Eloquent\Collection;

/**
 * Calculate Package Metrics Action (Application Layer)
 *
 * Computes aggregated metrics required by the packages page.
 */
class CalculatePackageMetricsAction
{
    /**
     * Build aggregated metrics for a collection of packages.
     *
     * @param Collection<int, Package> $packages
     * @return array<string, mixed>
     */
    public function execute(Collection $packages): array
    {
        // Optimize: Calculate metrics in single pass (O(n) instead of multiple iterations)
        $totalPackages = $packages->count();
        
        if ($totalPackages === 0) {
            return [
                'totalPackages' => 0,
                'popularPackages' => 0,
                'totalSpots' => 0,
                'spotsRemaining' => 0,
                'averageAvailability' => 0.0,
                'averagePrice' => 0.0,
                'averageHoursPerWeek' => 0.0,
                'uniqueActivities' => 0,
                'uniqueTrainers' => 0,
            ];
        }

        // Single pass calculation (more efficient)
        $totalSpots = 0;
        $spotsRemaining = 0;
        $totalPrice = 0;
        $totalHoursPerWeek = 0;
        $popularCount = 0;
        $totalAvailability = 0;
        $activityIds = collect();
        $trainerIds = collect();

        foreach ($packages as $package) {
            $totalSpots += $package->total_spots ?? 0;
            $spotsRemaining += $package->spots_remaining ?? 0;
            $totalPrice += $package->price ?? 0;
            $totalHoursPerWeek += $package->hours_per_week ?? 0;
            $totalAvailability += $package->getAvailabilityPercentage();
            
            if ($package->is_popular) {
                $popularCount++;
            }

            // Use already loaded relationships (eager loaded in ListPackagesAction)
            // Check both that relationship is loaded AND that it's not null
            if ($package->relationLoaded('activities') && $package->activities !== null) {
                $activityIds = $activityIds->merge($package->activities->pluck('id'));
                
                // Get trainers from activities (trainers are associated with activities, not packages directly)
                foreach ($package->activities as $activity) {
                    if ($activity->relationLoaded('trainers') && $activity->trainers !== null) {
                        $trainerIds = $trainerIds->merge($activity->trainers->pluck('id'));
                    }
                }
            }
        }

        return [
            'totalPackages' => $totalPackages,
            'popularPackages' => $popularCount,
            'totalSpots' => $totalSpots,
            'spotsRemaining' => $spotsRemaining,
            'averageAvailability' => round($totalAvailability / $totalPackages, 1),
            'averagePrice' => round($totalPrice / $totalPackages, 2),
            'averageHoursPerWeek' => round($totalHoursPerWeek / $totalPackages, 1),
            'uniqueActivities' => $activityIds->filter()->unique()->count(),
            'uniqueTrainers' => $trainerIds->filter()->unique()->count(),
        ];
    }
}


