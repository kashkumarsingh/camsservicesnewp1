<?php

namespace App\Actions\Trainers;

use App\Models\Trainer;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * Get Trainer Action (Application Layer)
 * 
 * Clean Architecture: Application Layer (Use Cases)
 * Purpose: Orchestrates business logic for retrieving trainers
 * Location: backend/app/Actions/Trainers/GetTrainerAction.php
 * 
 * This action handles:
 * - Getting a single trainer by slug or ID
 * - Business rules (e.g., only active trainers)
 * - Loading relationships (packages, user)
 * 
 * The Application Layer depends on the Domain Layer (Trainer model)
 * but is independent of the Interface Layer (Controllers).
 */
class GetTrainerAction
{
    /**
     * Execute the action to get a trainer by slug.
     *
     * @param string $slug
     * @param bool $loadRelations
     * @return Trainer
     * @throws ModelNotFoundException
     */
    public function execute(string $slug, bool $loadRelations = true): Trainer
    {
        $query = Trainer::where('slug', $slug)->active();

        if ($loadRelations) {
            $query->with(['packages', 'user']);
        }

        return $query->firstOrFail();
    }

    /**
     * Get a trainer by ID.
     *
     * @param int $id
     * @param bool $loadRelations
     * @return Trainer
     * @throws ModelNotFoundException
     */
    public function executeById(int $id, bool $loadRelations = true): Trainer
    {
        $query = Trainer::where('id', $id)->active();

        if ($loadRelations) {
            $query->with(['packages', 'user']);
        }

        return $query->firstOrFail();
    }
}

