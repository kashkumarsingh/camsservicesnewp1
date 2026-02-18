<?php

namespace App\Actions\Packages;

use App\Models\Package;
use Illuminate\Database\Eloquent\Collection;

/**
 * List Packages Action (Application Layer)
 * 
 * Clean Architecture: Application Layer (Use Cases)
 * Purpose: Orchestrates business logic for listing packages
 * Location: backend/app/Actions/Packages/ListPackagesAction.php
 * 
 * This action handles:
 * - Filtering packages (active, popular, difficulty, age group)
 * - Sorting packages
 * - Business rules for package visibility
 * 
 * The Application Layer depends on the Domain Layer (Package model)
 * but is independent of the Interface Layer (Controllers).
 */
class ListPackagesAction
{
    /**
     * Execute the action to get all packages with optional filters.
     *
     * @param array $filters
     * @return Collection
     */
    public function execute(array $filters = []): Collection
    {
        $query = Package::query()->active();

        // Filter by popular
        if (isset($filters['popular']) && $filters['popular']) {
            $query->popular();
        }

        // Filter by difficulty level
        if (isset($filters['difficulty_level'])) {
            $query->byDifficulty($filters['difficulty_level']);
        }

        // Filter by age group
        if (isset($filters['age_group'])) {
            $query->byAgeGroup($filters['age_group']);
        }

        // Filter by price range
        if (isset($filters['price_min'])) {
            $query->where('price', '>=', $filters['price_min']);
        }

        if (isset($filters['price_max'])) {
            $query->where('price', '<=', $filters['price_max']);
        }

        // Filter by available spots
        if (isset($filters['has_spots']) && $filters['has_spots']) {
            $query->where('spots_remaining', '>', 0);
        }

        // Default sorting
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';

        // Eager load ALL relationships to avoid N+1 queries
        // CRITICAL: Missing testimonials was causing N+1 queries (37+ second response time!
        // Note: Trainers are associated with activities, not packages directly (package_trainer table was dropped)
        // Optimize: Only select needed columns and limit relationships
        return $query->with([
            // Load activities - simple eager load
            'activities',
            'activities.trainers:id,name,slug,image,role,rating,total_reviews,specialties',
            'testimonials' => function ($query) {
                $query->published()
                    ->select('testimonials.id', 'testimonials.public_id', 'testimonials.slug', 
                             'testimonials.author_name', 'testimonials.author_role', 'testimonials.author_avatar_url',
                             'testimonials.quote', 'testimonials.rating', 'testimonials.source_label',
                             'testimonials.source_type', 'testimonials.source_url')
                    ->orderBy('package_testimonial.order');
            }
        ])
            ->select('packages.*') // Select all package columns
            ->orderBy($sortBy, $sortOrder)
            ->get();
    }
}

