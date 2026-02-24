<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\ExternalReview;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Validation\Rule;

/**
 * AdminTestimonialController
 *
 * Clean Architecture Layer: Interface (API)
 * Purpose: Admin CRUD for testimonials (manual + promoted from external reviews).
 */
class AdminTestimonialController extends Controller
{
    use BaseApiController;

    private function formatTestimonial(Testimonial $testimonial): array
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
            'publishedAt' => $testimonial->published_at?->toIso8601String(),
            'featuredAt' => $testimonial->featured_at?->toIso8601String(),
            'badges' => $testimonial->badges ?? [],
            'metadata' => $testimonial->metadata ?? [],
            'externalReviewId' => $testimonial->external_review_id ? (string) $testimonial->external_review_id : null,
            'createdAt' => $testimonial->created_at?->toIso8601String(),
            'updatedAt' => $testimonial->updated_at?->toIso8601String(),
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = max(1, min(50, $request->integer('per_page', 15)));
        $query = Testimonial::query()->withTrashed();

        if ($request->filled('source_type')) {
            $query->where('source_type', $request->string('source_type'));
        }
        if ($request->has('published')) {
            $published = filter_var($request->input('published'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($published !== null) {
                $query->where('published', $published);
            }
        }
        if ($request->filled('search')) {
            $term = $request->string('search')->toString();
            $query->where(function ($q) use ($term) {
                $q->where('author_name', 'like', '%' . $term . '%')
                    ->orWhere('quote', 'like', '%' . $term . '%')
                    ->orWhere('slug', 'like', '%' . $term . '%');
            });
        }

        $query->orderByDesc('updated_at')->orderByDesc('id');
        $paginator = $query->paginate($perPage);
        $paginator->getCollection()->transform(fn (Testimonial $t) => $this->formatTestimonial($t));

        return $this->paginatedResponse($paginator);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'author_name' => ['required', 'string', 'max:255'],
            'author_role' => ['nullable', 'string', 'max:255'],
            'quote' => ['required', 'string', 'max:65535'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'source_type' => ['nullable', 'string', Rule::in([Testimonial::SOURCE_MANUAL, Testimonial::SOURCE_OTHER])],
            'source_label' => ['nullable', 'string', 'max:255'],
            'source_url' => ['nullable', 'string', 'url', 'max:2048'],
            'locale' => ['nullable', 'string', 'max:20'],
            'published' => ['nullable', 'boolean'],
        ]);

        $testimonial = new Testimonial();
        $testimonial->author_name = $validated['author_name'];
        $testimonial->author_role = $validated['author_role'] ?? null;
        $testimonial->quote = $validated['quote'];
        $testimonial->rating = $validated['rating'] ?? null;
        $testimonial->source_type = $validated['source_type'] ?? Testimonial::SOURCE_MANUAL;
        $testimonial->source_label = $validated['source_label'] ?? null;
        $testimonial->source_url = $validated['source_url'] ?? null;
        $testimonial->locale = $validated['locale'] ?? null;
        $testimonial->published = $validated['published'] ?? true;
        $testimonial->save();

        return $this->successResponse($this->formatTestimonial($testimonial), 'Testimonial created.', [], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $testimonial = Testimonial::withTrashed()->find($id);
        if (! $testimonial) {
            return $this->notFoundResponse('Testimonial');
        }

        $validated = $request->validate([
            'author_name' => ['sometimes', 'string', 'max:255'],
            'author_role' => ['nullable', 'string', 'max:255'],
            'quote' => ['sometimes', 'string', 'max:65535'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'source_label' => ['nullable', 'string', 'max:255'],
            'source_url' => ['nullable', 'string', 'url', 'max:2048'],
            'locale' => ['nullable', 'string', 'max:20'],
            'published' => ['nullable', 'boolean'],
        ]);

        if (array_key_exists('author_name', $validated)) {
            $testimonial->author_name = $validated['author_name'];
        }
        $testimonial->author_role = $validated['author_role'] ?? $testimonial->author_role;
        if (array_key_exists('quote', $validated)) {
            $testimonial->quote = $validated['quote'];
        }
        $testimonial->rating = array_key_exists('rating', $validated) ? $validated['rating'] : $testimonial->rating;
        $testimonial->source_label = $validated['source_label'] ?? $testimonial->source_label;
        $testimonial->source_url = $validated['source_url'] ?? $testimonial->source_url;
        $testimonial->locale = $validated['locale'] ?? $testimonial->locale;
        if (array_key_exists('published', $validated)) {
            $testimonial->published = (bool) $validated['published'];
            if ($testimonial->published && ! $testimonial->published_at) {
                $testimonial->published_at = now();
            }
        }
        $testimonial->save();

        return $this->successResponse($this->formatTestimonial($testimonial), 'Testimonial updated.');
    }

    public function destroy(string $id): JsonResponse
    {
        $testimonial = Testimonial::withTrashed()->find($id);
        if (! $testimonial) {
            return $this->notFoundResponse('Testimonial');
        }
        $testimonial->delete();

        return $this->emptyResponse(204);
    }

    /**
     * Promote external review (id = external_review id) to a new testimonial.
     */
    public function promote(string $externalReviewId): JsonResponse
    {
        $externalReview = ExternalReview::query()->find($externalReviewId);
        if (! $externalReview) {
            return $this->notFoundResponse('External review');
        }
        if ($externalReview->testimonial()->exists()) {
            return $this->errorResponse('This review has already been promoted to a testimonial.', 'ALREADY_PROMOTED', [], 422);
        }

        $source = $externalReview->reviewSource;
        $provider = $source ? $source->provider : Testimonial::SOURCE_OTHER;
        $sourceType = in_array($provider, [Testimonial::SOURCE_GOOGLE, Testimonial::SOURCE_TRUSTPILOT], true)
            ? $provider
            : Testimonial::SOURCE_OTHER;

        $testimonial = new Testimonial();
        $testimonial->author_name = $externalReview->author_name;
        $testimonial->author_role = null;
        $testimonial->author_avatar_url = $externalReview->author_avatar_url;
        $testimonial->quote = $externalReview->content ?? '';
        $testimonial->rating = $externalReview->rating;
        $testimonial->source_type = $sourceType;
        $testimonial->source_review_id = $externalReview->provider_review_id;
        $testimonial->source_url = $externalReview->permalink;
        $testimonial->source_label = $source ? $source->display_name : null;
        $testimonial->external_review_id = $externalReview->id;
        $testimonial->locale = $externalReview->language ? substr($externalReview->language, 0, 20) : null;
        $testimonial->published = true;
        $testimonial->published_at = now();
        $testimonial->save();

        return $this->successResponse($this->formatTestimonial($testimonial), 'Review promoted to testimonial.', [], 201);
    }
}
