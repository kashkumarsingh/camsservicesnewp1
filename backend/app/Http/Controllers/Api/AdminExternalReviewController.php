<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\ExternalReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * AdminExternalReviewController
 *
 * Clean Architecture Layer: Interface (API)
 * Purpose: Admin list and update external reviews (Google/Trustpilot); visibility toggle.
 */
class AdminExternalReviewController extends Controller
{
    use BaseApiController;

    /**
     * Format an external review for API.
     */
    private function formatExternalReview(ExternalReview $review): array
    {
        $review->loadMissing('reviewSource');

        return [
            'id' => (string) $review->id,
            'providerReviewId' => $review->provider_review_id,
            'authorName' => $review->author_name,
            'authorAvatarUrl' => $review->author_avatar_url,
            'rating' => $review->rating,
            'content' => $review->content,
            'language' => $review->language,
            'countryCode' => $review->country_code,
            'publishedAt' => $review->published_at?->toIso8601String(),
            'permalink' => $review->permalink,
            'isVisible' => (bool) $review->is_visible,
            'syncedAt' => $review->synced_at?->toIso8601String(),
            'provider' => $review->reviewSource?->provider,
            'providerDisplayName' => $review->reviewSource?->display_name,
            'reviewSourceId' => $review->review_source_id ? (string) $review->review_source_id : null,
            'hasTestimonial' => $review->testimonial()->exists(),
            'createdAt' => $review->created_at?->toIso8601String(),
            'updatedAt' => $review->updated_at?->toIso8601String(),
        ];
    }

    /**
     * List external reviews (paginated).
     * GET /api/v1/admin/external-reviews
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = max(1, min(50, $request->integer('per_page', 15)));
        $query = ExternalReview::query()->with('reviewSource');

        if ($request->filled('provider')) {
            $query->whereHas('reviewSource', fn ($q) => $q->where('provider', $request->string('provider')));
        }
        if ($request->filled('review_source_id')) {
            $query->where('review_source_id', $request->integer('review_source_id'));
        }
        if ($request->has('is_visible')) {
            $visible = filter_var($request->input('is_visible'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($visible !== null) {
                $query->where('is_visible', $visible);
            }
        }
        if ($request->filled('search')) {
            $term = $request->string('search')->toString();
            $query->where(function ($q) use ($term) {
                $q->where('author_name', 'like', '%' . $term . '%')
                    ->orWhere('content', 'like', '%' . $term . '%');
            });
        }

        $query->orderByDesc('published_at')->orderByDesc('synced_at');
        $paginator = $query->paginate($perPage);
        $paginator->getCollection()->transform(fn (ExternalReview $r) => $this->formatExternalReview($r));

        return $this->paginatedResponse($paginator);
    }

    /**
     * Show a single external review.
     * GET /api/v1/admin/external-reviews/{id}
     */
    public function show(string $id): JsonResponse
    {
        $review = ExternalReview::query()->with('reviewSource')->find($id);
        if (! $review) {
            return $this->notFoundResponse('External review');
        }

        return $this->successResponse($this->formatExternalReview($review));
    }

    /**
     * Update an external review (e.g. visibility).
     * PATCH /api/v1/admin/external-reviews/{id}
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $review = ExternalReview::query()->find($id);
        if (! $review) {
            return $this->notFoundResponse('External review');
        }

        $validated = $request->validate([
            'isVisible' => ['sometimes', 'boolean'],
        ]);

        if (array_key_exists('isVisible', $validated)) {
            $review->is_visible = (bool) $validated['isVisible'];
        }
        $review->save();

        return $this->successResponse($this->formatExternalReview($review->fresh(['reviewSource'])), 'Review updated.');
    }
}
