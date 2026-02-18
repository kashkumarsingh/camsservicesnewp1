<?php

namespace App\Actions\Packages;

use App\Models\Package;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * Get Package Action (Application Layer)
 * 
 * Clean Architecture: Application Layer (Use Cases)
 * Purpose: Orchestrates business logic for retrieving packages
 * Location: backend/app/Actions/Packages/GetPackageAction.php
 * 
 * This action handles:
 * - Getting a single package by slug or ID
 * - Business rules (e.g., only active packages)
 * - Data transformation if needed
 * 
 * The Application Layer depends on the Domain Layer (Package model)
 * but is independent of the Interface Layer (Controllers).
 */
class GetPackageAction
{
    /**
     * Execute the action to get a package by slug.
     *
     * @param string $slug
     * @return Package
     * @throws ModelNotFoundException
     */
    public function execute(string $slug): Package
    {
        // Eager load relationships to avoid N+1 queries
        // Note: Trainers are associated with activities, not packages directly (package_trainer table was dropped)
        return Package::where('slug', $slug)
            ->active()
            ->with([
                'activities', // Load activities
                'activities.trainers', // Load activities with their trainers
                'testimonials' => function ($query) {
                    $query->published()->orderBy('package_testimonial.order');
                }
            ])
            ->firstOrFail();
    }

    /**
     * Get a package by ID.
     *
     * @param int $id
     * @return Package
     * @throws ModelNotFoundException
     */
    public function executeById(int $id): Package
    {
        return Package::where('id', $id)
            ->active()
            ->firstOrFail();
    }
}

