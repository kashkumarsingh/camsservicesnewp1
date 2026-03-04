<?php

namespace App\Http\Controllers\Api;

use App\Actions\FAQs\GetFAQAction;
use App\Actions\FAQs\ListFAQsAction;
use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\FAQ;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * FAQ Controller (Interface Layer - API)
 * 
 * Clean Architecture Layer: Interface (API Adapter)
 * 
 * Handles HTTP requests for FAQ API endpoints.
 */
class FAQController extends Controller
{
    use BaseApiController;

    public function __construct(
        private ListFAQsAction $listFAQsAction,
        private GetFAQAction $getFAQAction
    ) {
    }

    /**
     * Format a FAQ for API response (camelCase).
     *
     * @param \App\Models\FAQ $faq
     * @return array
     */
    private function formatFAQResponse(\App\Models\FAQ $faq): array
    {
        return [
            'id' => (string) $faq->id,
            'title' => $faq->title,
            'content' => $faq->content,
            'slug' => $faq->slug,
            'category' => $faq->category,
            'views' => $faq->views,
            'createdAt' => $faq->created_at->toIso8601String(),
            'updatedAt' => $faq->updated_at->toIso8601String(),
        ];
    }

    /**
     * Get all FAQs.
     *
     * GET /api/v1/faqs
     * Query param `q`: optional search term (uses Meilisearch/Scout when set).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $queryParam = $request->input('q');
        if (is_string($queryParam) && trim($queryParam) !== '' && config('scout.driver') === 'meilisearch') {
            $faqs = FAQ::search($queryParam)
                ->query(fn ($q) => $q->published()->ordered())
                ->take(100)
                ->get();

            return $this->collectionResponse($faqs->map(fn ($faq) => $this->formatFAQResponse($faq)));
        }

        $filters = $request->only([
            'published',
            'category',
            'search',
            'sort_by',
            'sort_order',
        ]);
        if (is_string($queryParam) && trim($queryParam) !== '' && config('scout.driver') !== 'meilisearch') {
            $filters['search'] = $queryParam;
        }

        $faqs = $this->listFAQsAction->execute($filters);

        return $this->collectionResponse(
            $faqs->map(fn ($faq) => $this->formatFAQResponse($faq))
        );
    }

    /**
     * Get a FAQ by slug.
     *
     * GET /api/v1/faqs/{slug}
     * 
     * @param string $slug
     * @param Request $request
     * @return JsonResponse
     */
    public function show(string $slug, Request $request): JsonResponse
    {
        try {
            $incrementViews = $request->boolean('increment_views', false);
            $faq = $this->getFAQAction->execute($slug, $incrementViews);

            $response = $this->successResponse($this->formatFAQResponse($faq));

            // Set ETag based on FAQ updated_at for cache invalidation
            $response->setEtag(md5($faq->id . $faq->updated_at->timestamp));

            return $response;
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('FAQ');
        }
    }
}
