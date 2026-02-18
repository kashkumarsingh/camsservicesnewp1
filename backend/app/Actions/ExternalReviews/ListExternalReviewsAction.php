<?php

namespace App\Actions\ExternalReviews;

use App\Models\ExternalReview;
use Illuminate\Database\Eloquent\Collection;

/**
 * ListExternalReviewsAction
 *
 * Clean Architecture Layer: Application (Use Case)
 * Purpose: Provide a single orchestration point for querying external reviews
 * across providers (Google, Trustpilot, etc.) with consistent filtering rules.
 */
class ListExternalReviewsAction
{
    /**
     * Execute the use case.
     *
     * Supported filters:
     * - providers (array|string) → filter by review_sources.provider
     * - review_source_ids (array|string)
     * - limit (int, default 12, max 100)
     * - visible_only (bool, default true)
     *
     * @param array<string, mixed> $filters
     * @return Collection<int, ExternalReview>
     */
    public function execute(array $filters = []): Collection
    {
        $query = ExternalReview::query()->with('reviewSource');

        if ($filters['visible_only'] ?? true) {
            $query->visible();
        }

        if (!empty($filters['providers'])) {
            $providers = (array) $filters['providers'];
            $query->whereHas('reviewSource', function ($builder) use ($providers) {
                $builder->whereIn('provider', $providers);
            });
        }

        if (!empty($filters['review_source_ids'])) {
            $sourceIds = (array) $filters['review_source_ids'];
            $query->whereIn('review_source_id', $sourceIds);
        }

        $limit = (int) ($filters['limit'] ?? 12);
        $limit = max(1, min($limit, 100));

        return $query
            ->orderByDesc('published_at')
            ->orderByDesc('synced_at')
            ->limit($limit)
            ->get();
    }
}

