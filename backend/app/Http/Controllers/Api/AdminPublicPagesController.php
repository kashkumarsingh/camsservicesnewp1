<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Admin Public Pages Controller (Interface Layer - API)
 *
 * Clean Architecture Layer: Interface (HTTP Controller)
 * Purpose: Expose a lightweight listing endpoint for public pages (home, about, policies)
 *          to be consumed by the Next.js admin dashboard.
 *
 * Notes:
 * - This controller is admin-only and lives under /api/v1/admin/public-pages.
 * - It intentionally returns a minimal DTO for dashboard use (no large content payloads).
 */
class AdminPublicPagesController extends Controller
{
    use BaseApiController;

    /**
     * Format a Page model for admin listing response.
     *
     * All fields are camelCase to align with frontend DTOs.
     */
    private function formatAdminPage(Page $page): array
    {
        return [
            'id' => (string) $page->id,
            'title' => $page->title,
            'slug' => $page->slug,
            'type' => $page->type,
            'published' => (bool) $page->published,
            'lastUpdated' => optional($page->last_updated)->toIso8601String(),
            'effectiveDate' => optional($page->effective_date)->toDateString(),
            'version' => $page->version,
            'views' => $page->views,
        ];
    }

    /**
     * Format a Page model for detailed admin response (includes content and blocks).
     */
    private function formatAdminPageDetail(Page $page): array
    {
        $data = [
            'id' => (string) $page->id,
            'title' => $page->title,
            'slug' => $page->slug,
            'type' => $page->type,
            'content' => $page->content,
            'summary' => $page->summary,
            'published' => (bool) $page->published,
            'lastUpdated' => optional($page->last_updated)->toIso8601String(),
            'effectiveDate' => optional($page->effective_date)->toDateString(),
            'version' => $page->version,
            'views' => $page->views,
            'createdAt' => optional($page->created_at)->toIso8601String(),
            'updatedAt' => optional($page->updated_at)->toIso8601String(),
            'blocks' => $this->formatAdminBlocks($page),
        ];

        if ($page->type === 'home') {
            $data['sections'] = $page->sections ?? [];
        }

        if ($page->type === 'about') {
            $data['mission'] = $page->mission ?? null;
            $coreValues = $page->core_values ?? [];
            $data['coreValues'] = $coreValues;
            $data['coreValuesSectionTitle'] = isset($coreValues[0]['sectionTitle']) ? $coreValues[0]['sectionTitle'] : null;
            $data['coreValuesSectionSubtitle'] = isset($coreValues[0]['sectionSubtitle']) ? $coreValues[0]['sectionSubtitle'] : null;
            $data['safeguarding'] = $page->safeguarding ?? null;
        }

        return $data;
    }

    /**
     * Format page blocks for admin (id, sortOrder, type, payload).
     *
     * @return array<int, array{id: string, sortOrder: int, type: string, payload: array}>
     */
    private function formatAdminBlocks(Page $page): array
    {
        if (! $page->relationLoaded('blocks')) {
            $page->load('blocks');
        }
        return $page->blocks->map(fn ($b) => [
            'id' => (string) $b->id,
            'sortOrder' => (int) $b->sort_order,
            'type' => $b->type,
            'payload' => $b->payload ?? [],
        ])->values()->all();
    }

    /**
     * List public pages for admin dashboard.
     *
     * Optional query parameters:
     * - type (string)     : filter by page type (e.g. 'home', 'about', 'privacy-policy')
     * - published (bool)  : filter by published flag
     *
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = Page::query();

        // Filter by type if provided
        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        // Filter by published flag if provided
        if ($request->has('published')) {
            $published = filter_var($request->input('published'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if (! is_null($published)) {
                $query->where('published', $published);
            }
        }

        // Admin view: order by last_updated desc, then id desc as a stable tie-breaker
        $pages = $query
            ->orderByDesc('last_updated')
            ->orderByDesc('id')
            ->get();

        return $this->collectionResponse(
            $pages->map(fn (Page $page) => $this->formatAdminPage($page))
        );
    }

    /**
     * Show a single page with full details.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $page = Page::findOrFail($id);

        return $this->itemResponse($this->formatAdminPageDetail($page));
    }

    /**
     * Create a new page.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:pages,slug',
            'type' => 'required|string|in:home,about,privacy-policy,terms-of-service,cancellation-policy,cookie-policy,payment-refund-policy,safeguarding-policy,other',
            'content' => [Rule::requiredIf($request->input('type') !== 'home'), 'string'],
            'summary' => 'nullable|string',
            'sections' => 'nullable|array',
            'sections.*.type' => 'nullable|string|max:100',
            'sections.*.data' => 'nullable|array',
            'effective_date' => 'nullable|date',
            'version' => 'nullable|string|max:20',
            'published' => 'nullable|boolean',
            'mission' => 'nullable|array',
            'mission.title' => 'nullable|string|max:255',
            'mission.description' => 'nullable|string',
            'core_values' => 'nullable|array',
            'core_values.*.icon' => 'nullable|string|max:50',
            'core_values.*.title' => 'nullable|string|max:255',
            'core_values.*.description' => 'nullable|string',
            'core_values.0.sectionTitle' => 'nullable|string|max:255',
            'core_values.0.sectionSubtitle' => 'nullable|string|max:500',
            'safeguarding' => 'nullable|array',
            'safeguarding.title' => 'nullable|string|max:255',
            'safeguarding.subtitle' => 'nullable|string|max:500',
            'safeguarding.description' => 'nullable|string',
            'safeguarding.badges' => 'nullable|array',
            'safeguarding.badges.*' => 'nullable|string|max:100',
        ]);

        // Set defaults (home type may have no content; use empty string)
        $validated['last_updated'] = now();
        $validated['effective_date'] = $validated['effective_date'] ?? now()->toDateString();
        $validated['version'] = $validated['version'] ?? '1.0.0';
        $validated['published'] = $validated['published'] ?? false;
        $validated['views'] = 0;
        $validated['content'] = $validated['content'] ?? '';

        $page = Page::create($validated);

        return $this->itemResponse($this->formatAdminPageDetail($page), 201);
    }

    /**
     * Update an existing page.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $page = Page::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:pages,slug,' . $id,
            'type' => 'sometimes|string|in:home,about,privacy-policy,terms-of-service,cancellation-policy,cookie-policy,payment-refund-policy,safeguarding-policy,other',
            'content' => 'sometimes|string',
            'summary' => 'nullable|string',
            'sections' => 'nullable|array',
            'sections.*.type' => 'nullable|string|max:100',
            'sections.*.data' => 'nullable|array',
            'effective_date' => 'nullable|date',
            'version' => 'nullable|string|max:20',
            'published' => 'nullable|boolean',
            'mission' => 'nullable|array',
            'mission.title' => 'nullable|string|max:255',
            'mission.description' => 'nullable|string',
            'core_values' => 'nullable|array',
            'core_values.*.icon' => 'nullable|string|max:50',
            'core_values.*.title' => 'nullable|string|max:255',
            'core_values.*.description' => 'nullable|string',
            'core_values.0.sectionTitle' => 'nullable|string|max:255',
            'core_values.0.sectionSubtitle' => 'nullable|string|max:500',
            'safeguarding' => 'nullable|array',
            'safeguarding.title' => 'nullable|string|max:255',
            'safeguarding.subtitle' => 'nullable|string|max:500',
            'safeguarding.description' => 'nullable|string',
            'safeguarding.badges' => 'nullable|array',
            'safeguarding.badges.*' => 'nullable|string|max:100',
        ]);

        // Update last_updated timestamp
        $validated['last_updated'] = now();

        $page->update($validated);

        return $this->itemResponse($this->formatAdminPageDetail($page->fresh()));
    }

    /**
     * Delete a page (soft delete).
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $page = Page::findOrFail($id);
        $page->delete();

        return $this->emptyResponse(204);
    }

    /**
     * Toggle published status.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function togglePublish(Request $request, int $id): JsonResponse
    {
        $page = Page::findOrFail($id);

        $validated = $request->validate([
            'published' => 'required|boolean',
        ]);

        $page->update([
            'published' => $validated['published'],
            'last_updated' => now(),
        ]);

        return $this->itemResponse($this->formatAdminPageDetail($page->fresh()));
    }

    /**
     * Export pages to CSV.
     *
     * @return JsonResponse
     */
    public function export(): JsonResponse
    {
        $pages = Page::orderByDesc('last_updated')->orderByDesc('id')->get();

        $csv = [];
        $csv[] = ['ID', 'Title', 'Slug', 'Type', 'Published', 'Views', 'Version', 'Last Updated', 'Effective Date'];

        foreach ($pages as $page) {
            $csv[] = [
                $page->id,
                $page->title,
                $page->slug,
                $page->type,
                $page->published ? 'Yes' : 'No',
                $page->views,
                $page->version,
                optional($page->last_updated)->format('Y-m-d H:i:s'),
                optional($page->effective_date)->format('Y-m-d'),
            ];
        }

        $filename = 'pages-export-' . now()->format('Y-m-d') . '.csv';

        return $this->successResponse([
            'filename' => $filename,
            'content' => $csv,
        ]);
    }
}

