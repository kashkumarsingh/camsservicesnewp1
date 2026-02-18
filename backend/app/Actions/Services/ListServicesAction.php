<?php

declare(strict_types=1);

namespace App\Actions\Services;

use App\Models\Service;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * List Services Action
 *
 * Clean Architecture Layer: Application
 * Purpose: Encapsulates business logic for fetching services with filters/sorting.
 */
class ListServicesAction
{
    public function __construct(private readonly Service $service)
    {
    }

    /**
     * Execute the action.
     *
     * @param array{
     *     published?: bool|null,
     *     category?: string|null,
     *     search?: string|null,
     *     paginate?: int|null,
     *     sort?: string|null,
     *     direction?: 'asc'|'desc'|null
     * } $filters
     */
    public function execute(array $filters = []): Collection|LengthAwarePaginator
    {
        $query = $this->service->newQuery();

        if (array_key_exists('published', $filters)) {
            $query->when($filters['published'], fn ($q) => $q->published());
        } else {
            $query->published();
        }

        if (!empty($filters['category'])) {
            $query->category($filters['category']);
        }

        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($subQuery) use ($search) {
                $subQuery->where('title', 'like', "%{$search}%")
                    ->orWhere('summary', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $sortColumn = $filters['sort'] ?? 'title';
        $sortDirection = $filters['direction'] ?? 'asc';
        $query->orderBy($sortColumn, $sortDirection);

        if (!empty($filters['paginate'])) {
            return $query->paginate((int) $filters['paginate'])->withQueryString();
        }

        return $query->get();
    }
}


