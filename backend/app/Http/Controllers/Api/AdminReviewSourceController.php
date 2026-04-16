<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Jobs\SyncExternalReviewsJob;
use App\Models\ReviewSource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * AdminReviewSourceController
 *
 * Clean Architecture Layer: Interface (API)
 * Purpose: Admin CRUD for review sources (Google, Trustpilot) and trigger sync.
 */
class AdminReviewSourceController extends Controller
{
    use BaseApiController;

    /**
     * Format a review source for API (secrets never returned in list/detail).
     */
    private function formatReviewSource(ReviewSource $source): array
    {
        if (! isset($source->visible_reviews_count)) {
            $source->loadCount([
                'externalReviews as visible_reviews_count' => fn ($q) => $q->visible(),
            ]);
            $source->loadAvg([
                'externalReviews as visible_reviews_avg_rating' => fn ($q) => $q->visible()->whereNotNull('rating'),
            ], 'rating');
        }

        return [
            'id' => (string) $source->id,
            'provider' => $source->provider,
            'displayName' => $source->display_name,
            'locationId' => $source->location_id,
            'syncFrequencyMinutes' => $source->sync_frequency_minutes,
            'lastSyncedAt' => $source->last_synced_at?->toIso8601String(),
            'lastSyncAttemptAt' => $source->last_sync_attempt_at?->toIso8601String(),
            'lastSyncReviewCount' => $source->last_sync_review_count,
            'isActive' => (bool) $source->is_active,
            'visibleReviewCount' => (int) ($source->visible_reviews_count ?? 0),
            'averageRating' => $source->visible_reviews_avg_rating !== null ? round((float) $source->visible_reviews_avg_rating, 2) : null,
            'hasApiCredentials' => $source->api_key !== null || $source->api_secret !== null,
            'settings' => $source->settings ?? [],
            'createdAt' => $source->created_at?->toIso8601String(),
            'updatedAt' => $source->updated_at?->toIso8601String(),
        ];
    }

    /**
     * List all review sources.
     * GET /api/v1/admin/review-sources
     */
    public function index(Request $request): JsonResponse
    {
        $query = ReviewSource::query()->withCount([
            'externalReviews as visible_reviews_count' => fn ($q) => $q->visible(),
        ])->withAvg([
            'externalReviews as visible_reviews_avg_rating' => fn ($q) => $q->visible()->whereNotNull('rating'),
        ], 'rating');

        if ($request->filled('provider')) {
            $query->where('provider', $request->string('provider'));
        }
        if ($request->has('is_active')) {
            $active = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($active !== null) {
                $query->where('is_active', $active);
            }
        }

        $sources = $query->orderBy('provider')->orderBy('id')->get();

        return $this->collectionResponse(
            $sources->map(fn (ReviewSource $s) => $this->formatReviewSource($s))
        );
    }

    /**
     * Show a single review source.
     * GET /api/v1/admin/review-sources/{id}
     */
    public function show(string $id): JsonResponse
    {
        $source = ReviewSource::query()->find($id);
        if (! $source) {
            return $this->notFoundResponse('Review source');
        }

        return $this->successResponse($this->formatReviewSource($source));
    }

    /**
     * Create a review source.
     * POST /api/v1/admin/review-sources
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'provider' => ['required', 'string', Rule::in([ReviewSource::PROVIDER_GOOGLE, ReviewSource::PROVIDER_TRUSTPILOT, ReviewSource::PROVIDER_OTHER])],
            'displayName' => ['required', 'string', 'max:255'],
            'locationId' => ['nullable', 'string', 'max:255'],
            'apiKey' => ['nullable', 'string', 'max:2048'],
            'apiSecret' => ['nullable', 'string', 'max:2048'],
            'syncFrequencyMinutes' => ['nullable', 'integer', 'min:60', 'max:10080'],
            'isActive' => ['nullable', 'boolean'],
        ]);

        $source = new ReviewSource();
        $source->provider = $validated['provider'];
        $source->display_name = $validated['displayName'];
        $source->location_id = $validated['locationId'] ?? null;
        $source->api_key = $validated['apiKey'] ?? null;
        $source->api_secret = $validated['apiSecret'] ?? null;
        $source->sync_frequency_minutes = $validated['syncFrequencyMinutes'] ?? 1440;
        $source->is_active = $validated['isActive'] ?? true;
        $source->save();

        return $this->successResponse($this->formatReviewSource($source), 'Review source created.', [], 201);
    }

    /**
     * Update a review source.
     * PUT /api/v1/admin/review-sources/{id}
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $source = ReviewSource::query()->find($id);
        if (! $source) {
            return $this->notFoundResponse('Review source');
        }

        $validated = $request->validate([
            'displayName' => ['sometimes', 'string', 'max:255'],
            'locationId' => ['nullable', 'string', 'max:255'],
            'apiKey' => ['nullable', 'string', 'max:2048'],
            'apiSecret' => ['nullable', 'string', 'max:2048'],
            'syncFrequencyMinutes' => ['nullable', 'integer', 'min:60', 'max:10080'],
            'isActive' => ['nullable', 'boolean'],
        ]);

        if (array_key_exists('displayName', $validated)) {
            $source->display_name = $validated['displayName'];
        }
        if (array_key_exists('locationId', $validated)) {
            $source->location_id = $validated['locationId'];
        }
        if (array_key_exists('apiKey', $validated)) {
            $source->api_key = $validated['apiKey'] ?: null;
        }
        if (array_key_exists('apiSecret', $validated)) {
            $source->api_secret = $validated['apiSecret'] ?: null;
        }
        if (array_key_exists('syncFrequencyMinutes', $validated)) {
            $source->sync_frequency_minutes = $validated['syncFrequencyMinutes'];
        }
        if (array_key_exists('isActive', $validated)) {
            $source->is_active = (bool) $validated['isActive'];
        }
        $source->save();

        return $this->successResponse($this->formatReviewSource($source), 'Review source updated.');
    }

    /**
     * Trigger sync for a review source (or all active sources if id omitted).
     * POST /api/v1/admin/review-sources/{id}/sync
     */
    public function sync(string $id): JsonResponse
    {
        $source = ReviewSource::query()->find($id);
        if (! $source) {
            return $this->notFoundResponse('Review source');
        }

        SyncExternalReviewsJob::dispatch($source->id);

        return $this->successResponse(
            ['message' => 'Sync job dispatched.', 'reviewSourceId' => (string) $source->id],
            'Sync started. Reviews will update shortly.'
        );
    }
}
