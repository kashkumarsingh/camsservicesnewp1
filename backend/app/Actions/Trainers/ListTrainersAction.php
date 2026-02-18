<?php

namespace App\Actions\Trainers;

use App\Models\Trainer;
use Illuminate\Database\Eloquent\Collection;

/**
 * List Trainers Action (Application Layer)
 * 
 * Clean Architecture: Application Layer (Use Cases)
 * Purpose: Orchestrates business logic for listing trainers
 * Location: backend/app/Actions/Trainers/ListTrainersAction.php
 * 
 * This action handles:
 * - Filtering trainers (active, featured, rating, experience)
 * - Sorting trainers
 * - Business rules for trainer visibility
 * 
 * The Application Layer depends on the Domain Layer (Trainer model)
 * but is independent of the Interface Layer (Controllers).
 */
class ListTrainersAction
{
    /**
     * Execute the action to get all trainers with optional filters.
     *
     * @param array $filters
     * @return Collection
     */
    public function execute(array $filters = []): Collection
    {
        // Start with base query
        $query = Trainer::query();

        // If 'available' filter is explicitly set, use simple is_active check
        // This allows trainers without user accounts (created from applications) to be shown
        if (isset($filters['available'])) {
            if ($filters['available']) {
                // Show active trainers (is_active = true) - includes trainers without user accounts
                $query->where('is_active', true);
            } else {
                // Show inactive trainers
                $query->where('is_active', false);
            }
        } else {
            // Default: Show all active trainers (with or without user accounts)
            // This includes trainers created from approved applications who don't have user accounts yet
            $query->where('is_active', true);
        }

        // Filter by featured
        if (isset($filters['featured']) && $filters['featured']) {
            $query->featured();
        }

        // Filter by minimum rating
        if (isset($filters['min_rating'])) {
            $query->minRating((float) $filters['min_rating']);
        }

        // Filter by minimum experience years
        if (isset($filters['min_experience'])) {
            $query->minExperience((int) $filters['min_experience']);
        }

        // Filter by package (trainers assigned to a specific package)
        if (isset($filters['package_id'])) {
            $query->whereHas('packages', function ($q) use ($filters) {
                $q->where('packages.id', $filters['package_id']);
            });
        }

        // Load relationships if requested
        if (isset($filters['with_relations']) && $filters['with_relations']) {
            $query->with(['packages', 'user']);
        }

        // Default sorting
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';

        // Special sorting for rating
        if ($sortBy === 'rating') {
            $query->orderBy('rating', $sortOrder)
                ->orderBy('total_reviews', 'desc');
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        return $query->get();
    }
}

