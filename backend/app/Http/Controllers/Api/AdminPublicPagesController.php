<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Admin Public Pages Controller.
 *
 * CRUD for pages and bulk save support for page content.
 * System pages (is_system=true) cannot be deleted.
 */
class AdminPublicPagesController extends Controller
{
    use BaseApiController;

    private function formatAdminPage(Page $page): array
    {
        return [
            'id' => (string) $page->id,
            'title' => $page->title,
            'slug' => $page->slug,
            'status' => $page->status,
            'metaTitle' => $page->meta_title,
            'metaDescription' => $page->meta_description,
            'ogImage' => $page->og_image,
            'isSystem' => (bool) $page->is_system,
            'publishedAt' => optional($page->published_at)->toIso8601String(),
            'updatedAt' => optional($page->updated_at)->toIso8601String(),
        ];
    }

    private function formatAdminPageDetail(Page $page): array
    {
        return [
            'id' => (string) $page->id,
            'title' => $page->title,
            'slug' => $page->slug,
            'status' => $page->status,
            'metaTitle' => $page->meta_title,
            'metaDescription' => $page->meta_description,
            'ogImage' => $page->og_image,
            'isSystem' => (bool) $page->is_system,
            'publishedAt' => optional($page->published_at)->toIso8601String(),
            'createdAt' => optional($page->created_at)->toIso8601String(),
            'updatedAt' => optional($page->updated_at)->toIso8601String(),
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $query = Page::query();
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        $pages = $query->orderByDesc('updated_at')->orderByDesc('id')->get();
        return $this->collectionResponse($pages->map(fn (Page $p) => $this->formatAdminPage($p)));
    }

    public function show(int $id): JsonResponse
    {
        $page = Page::findOrFail($id);
        return $this->itemResponse($this->formatAdminPageDetail($page));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:pages,slug',
            'status' => 'nullable|string|in:draft,published',
            'metaTitle' => 'nullable|string|max:255',
            'metaDescription' => 'nullable|string',
            'ogImage' => 'nullable|string|max:500',
        ]);
        $slug = $validated['slug'] ?? Str::slug($validated['title']);
        $status = $validated['status'] ?? Page::STATUS_DRAFT;
        $page = Page::create([
            'title' => $validated['title'],
            'slug' => $slug,
            'status' => $status,
            'meta_title' => $validated['metaTitle'] ?? null,
            'meta_description' => $validated['metaDescription'] ?? null,
            'og_image' => $validated['ogImage'] ?? null,
            'is_system' => false,
            'published_at' => $status === Page::STATUS_PUBLISHED ? now() : null,
        ]);
        return $this->itemResponse($this->formatAdminPageDetail($page->fresh()), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $page = Page::findOrFail($id);
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:pages,slug,' . $id,
            'status' => 'sometimes|string|in:draft,published',
            'metaTitle' => 'nullable|string|max:255',
            'metaDescription' => 'nullable|string',
            'ogImage' => 'nullable|string|max:500',
        ]);
        $data = [];
        if (array_key_exists('title', $validated)) {
            $data['title'] = $validated['title'];
        }
        if (array_key_exists('slug', $validated)) {
            $data['slug'] = $validated['slug'];
        }
        if (array_key_exists('status', $validated)) {
            $data['status'] = $validated['status'];
            $data['published_at'] = $validated['status'] === Page::STATUS_PUBLISHED ? ($page->published_at ?? now()) : null;
        }
        if (array_key_exists('metaTitle', $validated)) {
            $data['meta_title'] = $validated['metaTitle'];
        }
        if (array_key_exists('metaDescription', $validated)) {
            $data['meta_description'] = $validated['metaDescription'];
        }
        if (array_key_exists('ogImage', $validated)) {
            $data['og_image'] = $validated['ogImage'];
        }
        $page->update($data);
        return $this->itemResponse($this->formatAdminPageDetail($page->fresh()));
    }

    public function destroy(int $id): JsonResponse
    {
        $page = Page::findOrFail($id);
        if ($page->isSystem()) {
            return $this->errorResponse('System pages cannot be deleted.', 'system_page', [], 422);
        }
        $page->delete();
        return $this->emptyResponse(204);
    }

    public function publish(int $id): JsonResponse
    {
        $page = Page::findOrFail($id);
        $page->update([
            'status' => Page::STATUS_PUBLISHED,
            'published_at' => $page->published_at ?? now(),
        ]);
        return $this->itemResponse($this->formatAdminPageDetail($page->fresh()));
    }

    public function duplicate(Request $request, int $id): JsonResponse
    {
        $page = Page::findOrFail($id);
        $validated = $request->validate([
            'slug' => 'required|string|max:255|unique:pages,slug',
            'title' => 'nullable|string|max:255',
        ]);
        $newPage = Page::create([
            'title' => $validated['title'] ?? $page->title . ' (copy)',
            'slug' => $validated['slug'],
            'status' => Page::STATUS_DRAFT,
            'meta_title' => $page->meta_title,
            'meta_description' => $page->meta_description,
            'og_image' => $page->og_image,
            'is_system' => false,
            'published_at' => null,
        ]);
        return $this->itemResponse($this->formatAdminPageDetail($newPage), 201);
    }

    public function export(): JsonResponse
    {
        $pages = Page::orderByDesc('updated_at')->orderByDesc('id')->get();
        $csv = [];
        $csv[] = ['ID', 'Title', 'Slug', 'Status', 'Published At', 'Updated At'];
        foreach ($pages as $page) {
            $csv[] = [
                $page->id,
                $page->title,
                $page->slug,
                $page->status,
                optional($page->published_at)->format('Y-m-d H:i:s'),
                optional($page->updated_at)->format('Y-m-d H:i:s'),
            ];
        }
        return $this->successResponse([
            'filename' => 'pages-export-' . now()->format('Y-m-d') . '.csv',
            'content' => $csv,
        ]);
    }

    /**
     * Bulk save: update page settings in one request (single transaction).
     */
    public function saveAll(Request $request, int $id): JsonResponse
    {
        $page = Page::findOrFail($id);
        $validated = $request->validate([
            'page' => 'sometimes|array',
            'page.title' => 'sometimes|string|max:255',
            'page.slug' => 'sometimes|string|max:255|unique:pages,slug,' . $id,
            'page.status' => 'sometimes|string|in:draft,published',
            'page.metaTitle' => 'nullable|string|max:255',
            'page.metaDescription' => 'nullable|string',
            'page.ogImage' => 'nullable|string|max:500',
        ]);

        \DB::transaction(function () use ($page, $validated) {
            $pageData = $validated['page'] ?? [];
            if (! empty($pageData)) {
                $data = [];
                if (array_key_exists('title', $pageData)) {
                    $data['title'] = $pageData['title'];
                }
                if (array_key_exists('slug', $pageData)) {
                    $data['slug'] = $pageData['slug'];
                }
                if (array_key_exists('status', $pageData)) {
                    $data['status'] = $pageData['status'];
                    $data['published_at'] = $pageData['status'] === Page::STATUS_PUBLISHED ? ($page->published_at ?? now()) : null;
                }
                if (array_key_exists('metaTitle', $pageData)) {
                    $data['meta_title'] = $pageData['metaTitle'];
                }
                if (array_key_exists('metaDescription', $pageData)) {
                    $data['meta_description'] = $pageData['metaDescription'];
                }
                if (array_key_exists('ogImage', $pageData)) {
                    $data['og_image'] = $pageData['ogImage'];
                }
                $page->update($data);
            }
        });

        return $this->itemResponse($this->formatAdminPageDetail($page->fresh()));
    }

    /**
     * Legacy: toggle publish (PUT .../publish with body { "published": true|false }).
     * Prefer POST .../publish for publishing; use update with status for draft.
     */
    public function togglePublish(Request $request, int $id): JsonResponse
    {
        $page = Page::findOrFail($id);
        $validated = $request->validate(['published' => 'required|boolean']);
        $page->update([
            'status' => $validated['published'] ? Page::STATUS_PUBLISHED : Page::STATUS_DRAFT,
            'published_at' => $validated['published'] ? ($page->published_at ?? now()) : null,
        ]);
        return $this->itemResponse($this->formatAdminPageDetail($page->fresh()));
    }
}
