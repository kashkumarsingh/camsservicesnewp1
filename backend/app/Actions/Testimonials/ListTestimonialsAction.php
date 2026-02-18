<?php

namespace App\Actions\Testimonials;

use App\Models\Testimonial;
use Illuminate\Database\Eloquent\Collection;

/**
 * ListTestimonialsAction
 *
 * Clean Architecture Layer: Application (Use Case)
 * Purpose: Provide a single orchestration point for querying testimonials with
 * consistent filtering, ordering, and publication rules.
 */
class ListTestimonialsAction
{
    /**
     * Execute the use case.
     *
     * Supported filters:
     * - featured (bool)
     * - limit (int, default 12, max 50)
     * - source_types (array|string)
     * - locale (string, BCP 47)
     * - include_unpublished (bool, default false)
     *
     * @param array<string, mixed> $filters
     * @return Collection<int, Testimonial>
     */
    public function execute(array $filters = []): Collection
    {
        $query = Testimonial::query();

        if (!($filters['include_unpublished'] ?? false)) {
            $query->published();
        }

        if (!empty($filters['featured'])) {
            $query->where('is_featured', true);
        }

        if (!empty($filters['source_types'])) {
            $sourceTypes = (array) $filters['source_types'];
            $query->whereIn('source_type', $sourceTypes);
        }

        if (!empty($filters['locale'])) {
            $locale = $filters['locale'];
            $language = substr($locale, 0, 2);

            $query->where(function ($builder) use ($locale, $language) {
                $builder->where('locale', $locale)
                    ->orWhere('locale', 'like', $language . '%');
            });
        }

        $limit = (int) ($filters['limit'] ?? 12);
        $limit = max(1, min($limit, 50));

        return $query
            ->orderByDesc('is_featured')
            ->orderBy('display_order')
            ->orderByDesc('published_at')
            ->limit($limit)
            ->get();
    }
}

