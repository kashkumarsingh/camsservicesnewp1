<?php

namespace App\Http\Controllers\Api;

use App\Actions\ExternalReviews\ListExternalReviewsAction;
use App\Actions\Testimonials\ListTestimonialsAction;
use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\ExternalReview;
use App\Models\ReviewSource;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

/**
 * ReviewController
 *
 * Clean Architecture Layer: Interface (API)
 * Purpose: Aggregate testimonials + external reviews (Google/Trustpilot) for UX.
 */
class ReviewController extends Controller
{
    use BaseApiController;

    public function __construct(
        private readonly ListTestimonialsAction $listTestimonialsAction,
        private readonly ListExternalReviewsAction $listExternalReviewsAction
    ) {
    }

    /**
     * Format an external review for API consumers.
     */
    private function formatExternalReviewResponse(ExternalReview $review): array
    {
        return [
            'id' => (string) $review->id,
            'providerReviewId' => $review->provider_review_id,
            'authorName' => $review->author_name,
            'authorAvatarUrl' => $review->author_avatar_url,
            'rating' => $review->rating,
            'content' => $review->content,
            'language' => $review->language,
            'countryCode' => $review->country_code,
            'publishedAt' => optional($review->published_at)->toIso8601String(),
            'permalink' => $review->permalink,
            'provider' => $review->reviewSource?->provider,
            'providerDisplayName' => $review->reviewSource?->display_name,
        ];
    }

    /**
     * Format provider summary metrics (used for Google/Trustpilot badges).
     */
    private function formatProviderSummary(ReviewSource $source): array
    {
        $average = $source->visible_reviews_avg_rating;

        return [
            'id' => (string) $source->id,
            'provider' => $source->provider,
            'displayName' => $source->display_name,
            'locationId' => $source->location_id,
            'isActive' => (bool) $source->is_active,
            'lastSyncedAt' => optional($source->last_synced_at)->toIso8601String(),
            'lastSyncAttemptAt' => optional($source->last_sync_attempt_at)->toIso8601String(),
            'syncFrequencyMinutes' => $source->sync_frequency_minutes,
            'reviewCount' => (int) ($source->visible_reviews_count ?? 0),
            'averageRating' => $average !== null ? round($average, 2) : null,
        ];
    }

    /**
     * Format testimonial response (re-used from TestimonialController).
     */
    private function formatTestimonial(Testimonial $testimonial): array
    {
        return [
            'id' => (string) $testimonial->id,
            'publicId' => $testimonial->public_id,
            'slug' => $testimonial->slug,
            'authorName' => $testimonial->author_name,
            'authorRole' => $testimonial->author_role,
            'quote' => $testimonial->quote,
            'rating' => $testimonial->rating,
            'sourceType' => $testimonial->source_type,
            'sourceLabel' => $testimonial->source_label,
            'sourceUrl' => $testimonial->source_url,
            'locale' => $testimonial->locale,
            'isFeatured' => (bool) $testimonial->is_featured,
            'badges' => $testimonial->badges ?? [],
        ];
    }

    /**
     * Aggregate testimonials + external reviews for UI components.
     *
     * GET /api/v1/reviews/aggregate
     */
    public function aggregate(Request $request): JsonResponse
    {
        $providers = $this->normalizeProviders($request->input('providers'));
        $testimonialLimit = $request->integer('testimonial_limit', 6);
        $externalLimit = $request->integer('external_limit', 12);
        $locale = $request->string('locale')->toString() ?: null;

        /** @var Collection<int, Testimonial> $testimonials */
        $testimonials = $this->listTestimonialsAction->execute([
            'featured' => $request->boolean('featured_only', false),
            'limit' => $testimonialLimit,
            'source_types' => $providers ? array_merge(['manual'], $providers) : null,
            'locale' => $locale,
        ]);

        /** @var Collection<int, ExternalReview> $externalReviews */
        $externalReviews = $this->listExternalReviewsAction->execute([
            'providers' => $providers,
            'limit' => $externalLimit,
            'visible_only' => true,
        ]);

        $providerSummaries = $this->loadProviderSummaries($providers);

        return $this->successResponse([
            'testimonials' => $testimonials->map(fn (Testimonial $testimonial) => $this->formatTestimonial($testimonial)),
            'externalReviews' => $externalReviews->map(fn (ExternalReview $review) => $this->formatExternalReviewResponse($review)),
            'providerSummaries' => $providerSummaries->map(fn (ReviewSource $source) => $this->formatProviderSummary($source)),
        ]);
    }

    /**
     * Normalize provider query param into array.
     *
     * @param mixed $providers
     * @return array<int, string>|null
     */
    private function normalizeProviders(mixed $providers): ?array
    {
        if (empty($providers)) {
            return null;
        }

        if (is_string($providers)) {
            $providers = array_filter(array_map('trim', explode(',', $providers)));
        }

        if (is_array($providers)) {
            return array_unique(array_values($providers));
        }

        return null;
    }

    /**
     * Load provider summaries with aggregated metrics.
     *
     * @param array<int, string>|null $providers
     * @return Collection<int, ReviewSource>
     */
    private function loadProviderSummaries(?array $providers): Collection
    {
        return ReviewSource::query()
            ->where('is_active', true)
            ->when($providers, fn ($query) => $query->whereIn('provider', $providers))
            ->withCount([
                'externalReviews as visible_reviews_count' => fn ($q) => $q->visible(),
            ])
            ->withAvg([
                'externalReviews as visible_reviews_avg_rating' => fn ($q) => $q->visible()->whereNotNull('rating'),
            ], 'rating')
            ->get();
    }
}

