<?php

namespace App\Http\Controllers\Api;

use App\Actions\Pages\GetPageAction;
use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Page Controller (Interface Layer - API)
 * 
 * This is part of the Interface layer in Clean Architecture.
 * Handles HTTP requests for pages API endpoints.
 */
class PageController extends Controller
{
    use BaseApiController;

    public function __construct(
        private GetPageAction $getPageAction
    ) {
    }

    /**
     * Format a page for API response (camelCase + normalized fields).
     *
     * @param Page $page
     * @return array
     */
    private function formatPageResponse(Page $page): array
    {
        $data = [
            'id' => (string) $page->id,
            'title' => $page->title ?? '',
            'slug' => $page->slug ?? '',
            'type' => $page->type ?? 'other',
            'summary' => $page->summary,
            'content' => $page->content ?? '',
            'sections' => $page->sections ?? [],
            'blocks' => $this->formatBlocks($page),
            'lastUpdated' => $this->safeDateToIso8601($page->last_updated),
            'effectiveDate' => $this->safeDateToDateString($page->effective_date),
            'version' => $page->version ?? '1.0.0',
            'views' => (int) ($page->views ?? 0),
            'published' => (bool) $page->published,
        ];

        if ($page->type === 'about') {
            $data['mission'] = $page->mission ?? null;
            $coreValues = $page->core_values ?? [];
            $data['coreValues'] = $coreValues;
            // First item may contain section title/subtitle for the Core Values block
            $data['coreValuesSectionTitle'] = isset($coreValues[0]['sectionTitle']) ? $coreValues[0]['sectionTitle'] : null;
            $data['coreValuesSectionSubtitle'] = isset($coreValues[0]['sectionSubtitle']) ? $coreValues[0]['sectionSubtitle'] : null;
            $data['safeguarding'] = $page->safeguarding ?? null;
        }

        return $data;
    }

    /**
     * Format page blocks for API (id, type, payload, meta per block).
     * Phase 5: id for analytics placeholders; meta for visibility/scheduling.
     *
     * @return array<int, array{id: string, type: string, payload: array, meta: array|null}>
     */
    private function formatBlocks(Page $page): array
    {
        if (! $page->relationLoaded('blocks')) {
            return [];
        }
        return $page->blocks->map(fn ($b) => [
            'id' => (string) $b->id,
            'type' => $b->type ?? 'unknown',
            'payload' => $b->payload ?? [],
            'meta' => $b->meta ?? null,
        ])->values()->all();
    }

    /**
     * Safe date to ISO8601 string (handles null or invalid cast).
     */
    private function safeDateToIso8601(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }
        try {
            return $value instanceof \DateTimeInterface ? $value->format(\DateTimeInterface::ATOM) : null;
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * Safe date to Y-m-d string (handles null or invalid cast).
     */
    private function safeDateToDateString(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }
        try {
            return $value instanceof \DateTimeInterface ? $value->format('Y-m-d') : null;
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * Get a page by slug.
     *
     * @param string $slug
     * @param Request $request
     * @return JsonResponse
     */
    public function show(string $slug, Request $request): JsonResponse
    {
        try {
            $incrementViews = $request->boolean('increment_views', false);
            $page = $this->getPageAction->execute($slug, $incrementViews);
            if ($incrementViews) {
                $page->refresh();
            }

            return $this->successResponse($this->formatPageResponse($page));
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Page');
        } catch (\Throwable $e) {
            Log::error('PageController::show failed for slug ['.$slug.']', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse('Failed to load page.', 500);
        }
    }

    /**
     * Get all published pages.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $filters = [];
        
        if ($request->has('type')) {
            $filters['type'] = $request->input('type');
        }

        $pages = $this->getPageAction->getAll($filters);

        return $this->collectionResponse(
            $pages->map(fn (Page $page) => $this->formatPageResponse($page))
        );
    }
}

