<?php

namespace App\Actions\Activities;

use App\Models\Activity;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * Get Activity Action (Application Layer)
 * 
 * Clean Architecture: Application Layer (Use Cases)
 * Purpose: Orchestrates business logic for retrieving activities
 * Location: backend/app/Actions/Activities/GetActivityAction.php
 * 
 * This action handles:
 * - Getting a single activity by slug or ID
 * - Business rules (e.g., only active activities)
 * - Loading relationships (packages, trainers)
 * 
 * The Application Layer depends on the Domain Layer (Activity model)
 * but is independent of the Interface Layer (Controllers).
 */
class GetActivityAction
{
    /**
     * Execute the action to get an activity by slug.
     *
     * @param string $slug
     * @param bool $loadRelations
     * @return Activity
     * @throws ModelNotFoundException
     */
    public function execute(string $slug, bool $loadRelations = true): Activity
    {
        $query = Activity::where('slug', $slug)->active();

        if ($loadRelations) {
            $query->with(['packages', 'trainers']);
        }

        return $query->firstOrFail();
    }

    /**
     * Get an activity by ID.
     *
     * @param int $id
     * @param bool $loadRelations
     * @return Activity
     * @throws ModelNotFoundException
     */
    public function executeById(int $id, bool $loadRelations = true): Activity
    {
        $query = Activity::where('id', $id)->active();

        if ($loadRelations) {
            $query->with(['packages', 'trainers']);
        }

        return $query->firstOrFail();
    }
}

