<?php

namespace App\Actions\Activities;

use App\Models\Activity;
use Illuminate\Database\Eloquent\Collection;

/**
 * List Activities Action (Application Layer)
 * 
 * Clean Architecture: Application Layer (Use Cases)
 * Purpose: Orchestrates business logic for listing activities
 * Location: backend/app/Actions/Activities/ListActivitiesAction.php
 * 
 * This action handles:
 * - Filtering activities (active, difficulty, age group)
 * - Sorting activities
 * - Business rules for activity visibility
 * 
 * The Application Layer depends on the Domain Layer (Activity model)
 * but is independent of the Interface Layer (Controllers).
 */
class ListActivitiesAction
{
    /**
     * Execute the action to get all activities with optional filters.
     *
     * @param array $filters
     * @return Collection
     */
    public function execute(array $filters = []): Collection
    {
        $query = Activity::query()->active();

        // Filter by category (NEW: water_based, high_intensity, heights, etc.)
        if (isset($filters['category']) && $filters['category']) {
            $query->where('category', $filters['category']);
        }

        // Filter by difficulty level
        if (isset($filters['difficulty']) && $filters['difficulty']) {
            $query->byDifficulty($filters['difficulty']);
        }

        // Filter by age group (age must be within min/max range)
        if (isset($filters['age_group'])) {
            $age = (int) $filters['age_group'];
            $query->byAgeGroup($age);
        }

        // Filter by active status (frontend uses 'active', backend uses 'is_active')
        if (isset($filters['active'])) {
            $query->where('is_active', $filters['active']);
        }

        // Filter by package (activities assigned to a specific package)
        if (isset($filters['package_id'])) {
            $query->whereHas('packages', function ($q) use ($filters) {
                $q->where('packages.id', $filters['package_id']);
            });
        }

        // Filter by trainer (activities assigned to a specific trainer)
        if (isset($filters['trainer_id'])) {
            $query->whereHas('trainers', function ($q) use ($filters) {
                $q->where('trainers.id', $filters['trainer_id']);
            });
        }

        // Load relationships if requested (optimized to prevent N+1 queries)
        if (isset($filters['with_relations']) && $filters['with_relations']) {
            $query->with(['packages', 'trainers']);
        }

        // Default sorting (use indexed column for better performance)
        $sortBy = $filters['sort_by'] ?? 'name';
        $sortOrder = $filters['sort_order'] ?? 'asc';

        $query->orderBy($sortBy, $sortOrder);

        // Optimize: Use select to only fetch needed columns (reduces data transfer)
        // Note: We still need all columns for the model, so this is optional
        // return $query->select(['id', 'name', 'slug', 'description', 'image_url', 'duration', 'is_active'])->get();
        
        return $query->get();
    }
}

