<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Support\Revalidation\RevalidateTag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Admin Public Page Content Controller
 *
 * Content-only management for fixed public pages (about, services, etc.).
 * GET/PUT by slug; no block CRUD. PageObserver revalidates on save.
 */
class AdminPublicPageContentController extends Controller
{
    use BaseApiController;

    /**
     * Allowed slugs for content management (fixed list).
     */
    private const ALLOWED_SLUGS = ['about', 'services', 'packages', 'blog', 'contact', 'faq', 'trainers', 'policies'];

    private function isAllowedSlug(string $slug): bool
    {
        return in_array($slug, self::ALLOWED_SLUGS, true);
    }

    /**
     * GET /admin/public-pages/content/{slug}
     */
    public function show(string $slug): JsonResponse
    {
        if (! $this->isAllowedSlug($slug)) {
            return $this->errorResponse('Page not found.', 'invalid_slug', [], 404);
        }

        $page = Page::where('slug', $slug)->first();
        if (! $page) {
            return $this->successResponse(['content' => []]);
        }

        $content = $page->content;
        if (! is_array($content)) {
            $content = [];
        }

        return $this->successResponse($this->keysToCamelCase(['content' => $content]));
    }

    /**
     * PUT /admin/public-pages/content/{slug}
     */
    public function update(Request $request, string $slug): JsonResponse
    {
        if (! $this->isAllowedSlug($slug)) {
            return $this->errorResponse('Page not found.', 'invalid_slug', [], 404);
        }

        $request->validate([
            'content' => 'required|array',
        ]);

        $page = Page::firstOrCreate(
            ['slug' => $slug],
            [
                'title' => Str::title(Str::replace('-', ' ', $slug)),
                'status' => Page::STATUS_PUBLISHED,
                'meta_title' => null,
                'meta_description' => null,
            ]
        );

        $content = $request->input('content');
        $page->content = is_array($content) ? $content : [];
        $page->save();

        RevalidateTag::dispatch('pages');
        RevalidateTag::dispatch("page:{$slug}");

        return $this->successResponse($this->keysToCamelCase(['content' => $page->content]));
    }
}
