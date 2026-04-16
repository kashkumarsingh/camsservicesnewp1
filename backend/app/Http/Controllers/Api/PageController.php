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
 * Public page controller.
 */
class PageController extends Controller
{
    use BaseApiController;

    public function __construct(
        private GetPageAction $getPageAction
    ) {
    }

    private function formatPageResponse(Page $page): array
    {
        $data = [
            'id' => (string) $page->id,
            'title' => $page->title ?? '',
            'slug' => $page->slug ?? '',
            'summary' => $page->meta_description,
            'metaTitle' => $page->meta_title,
            'metaDescription' => $page->meta_description,
            'ogImage' => $page->og_image,
            'status' => $page->status,
            'publishedAt' => $page->published_at?->toIso8601String(),
        ];
        $content = $page->content;
        if ($content !== null && is_array($content) && array_key_exists('body', $content)) {
            // Policy document: content is { body, lastUpdated, effectiveDate, version }
            $data['content'] = (string) ($content['body'] ?? '');
            $data['lastUpdated'] = $content['lastUpdated'] ?? null;
            $data['effectiveDate'] = $content['effectiveDate'] ?? null;
            $data['version'] = $content['version'] ?? null;
            $data['type'] = $page->slug;
        } elseif ($content !== null && is_array($content)) {
            $data['content'] = $content;
        }
        return $data;
    }

    public function show(string $slug, Request $request): JsonResponse
    {
        try {
            $page = $this->getPageAction->execute($slug);
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
     * Preview page (draft + all blocks). Admin only.
     * GET /api/v1/pages/{slug}/preview
     */
    public function showPreview(string $slug): JsonResponse
    {
        try {
            $page = $this->getPageAction->executeForPreview($slug);
            return $this->successResponse($this->formatPageResponse($page));
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Page');
        } catch (\Throwable $e) {
            Log::error('PageController::showPreview failed for slug ['.$slug.']', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return $this->errorResponse('Failed to load page preview.', 500);
        }
    }

    public function index(Request $request): JsonResponse
    {
        $pages = $this->getPageAction->getAll();
        return $this->collectionResponse(
            $pages->map(fn (Page $page) => $this->formatPageResponse($page))
        );
    }
}
