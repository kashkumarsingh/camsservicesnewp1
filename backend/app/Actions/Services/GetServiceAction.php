<?php

declare(strict_types=1);

namespace App\Actions\Services;

use App\Models\Service;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * Get Service Action
 *
 * Clean Architecture Layer: Application
 * Purpose: Fetch a single service by slug and optionally record a view.
 */
class GetServiceAction
{
    public function __construct(private readonly Service $service)
    {
    }

    /**
     * Execute the action.
     *
     * @param string $slug
     * @param bool $incrementViews
     * @return Service
     *
     * @throws ModelNotFoundException
     */
    public function execute(string $slug, bool $incrementViews = false): Service
    {
        $service = $this->service->published()
            ->where('slug', $slug)
            ->first();

        if (!$service) {
            throw new ModelNotFoundException("Service {$slug} not found.");
        }

        if ($incrementViews) {
            $service->recordView();
        }

        return $service->refresh();
    }
}


