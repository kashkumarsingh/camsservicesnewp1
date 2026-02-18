<?php

namespace App\Http\Controllers\Api;

use App\Actions\Testimonials\GetTestimonialAction;
use App\Actions\Testimonials\ListTestimonialsAction;
use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

/**
 * TestimonialController
 *
 * Clean Architecture Layer: Interface (API)
 * Handles REST endpoints for curated testimonials.
 */
class TestimonialController extends Controller
{
    use BaseApiController;

    public function __construct(
        private readonly ListTestimonialsAction $listTestimonialsAction,
        private readonly GetTestimonialAction $getTestimonialAction
    ) {
    }

    /**
     * Format a testimonial for API consumers (camelCase keys).
     */
    private function formatTestimonialResponse(Testimonial $testimonial): array
    {
        return [
            'id' => (string) $testimonial->id,
            'publicId' => $testimonial->public_id,
            'slug' => $testimonial->slug,
            'authorName' => $testimonial->author_name,
            'authorRole' => $testimonial->author_role,
            'authorAvatarUrl' => $testimonial->author_avatar_url,
            'quote' => $testimonial->quote,
            'rating' => $testimonial->rating,
            'sourceType' => $testimonial->source_type,
            'sourceLabel' => $testimonial->source_label,
            'sourceUrl' => $testimonial->source_url,
            'locale' => $testimonial->locale,
            'isFeatured' => (bool) $testimonial->is_featured,
            'displayOrder' => $testimonial->display_order,
            'published' => (bool) $testimonial->published,
            'publishedAt' => optional($testimonial->published_at)->toIso8601String(),
            'featuredAt' => optional($testimonial->featured_at)->toIso8601String(),
            'badges' => $testimonial->badges ?? [],
            'metadata' => $testimonial->metadata ?? [],
            'externalReviewId' => $testimonial->external_review_id ? (string) $testimonial->external_review_id : null,
        ];
    }

    /**
     * GET /api/v1/testimonials
     */
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'featured' => $request->boolean('featured'),
            'limit' => $request->integer('limit', 12),
        ];

        if ($request->filled('sourceType')) {
            $filters['source_types'] = array_filter(explode(',', $request->string('sourceType')));
        }

        if ($request->filled('locale')) {
            $filters['locale'] = $request->string('locale');
        }

        /** @var Collection<int, Testimonial> $testimonials */
        $testimonials = $this->listTestimonialsAction->execute($filters);

        return $this->collectionResponse(
            $testimonials->map(fn (Testimonial $testimonial) => $this->formatTestimonialResponse($testimonial))
        );
    }

    /**
     * GET /api/v1/testimonials/{identifier}
     */
    public function show(string $identifier): JsonResponse
    {
        try {
            $testimonial = $this->getTestimonialAction->execute($identifier);

            return $this->successResponse($this->formatTestimonialResponse($testimonial));
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Testimonial');
        }
    }
}

