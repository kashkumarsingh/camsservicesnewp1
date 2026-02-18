<?php

declare(strict_types=1);

namespace App\Actions\FAQs;

use App\Models\FAQ;
use Illuminate\Database\Eloquent\Collection;

/**
 * List FAQs Action
 * 
 * Clean Architecture Layer: Application (Use Case)
 * 
 * Fetches FAQs with optional filters (published, category, search) and sorting.
 */
class ListFAQsAction
{
    /**
     * Execute the action.
     *
     * @param array<string, mixed> $filters
     * @return Collection<int, FAQ>
     */
    public function execute(array $filters = []): Collection
    {
        $query = FAQ::query();

        // Filter by published status (default: only published)
        if (isset($filters['published'])) {
            if ($filters['published']) {
                $query->published();
            }
        } else {
            // Default: only published FAQs
            $query->published();
        }

        // Filter by category
        if (!empty($filters['category'])) {
            $query->category($filters['category']);
        }

        // Search in title and content
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'order';
        $sortOrder = $filters['sort_order'] ?? 'asc';

        // Handle special 'order' sorting (order by order field, then title)
        if ($sortBy === 'order') {
            $query->ordered();
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        return $query->get();
    }
}

