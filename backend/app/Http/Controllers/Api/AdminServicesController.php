<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Admin Services Controller (Interface Layer - API)
 *
 * Clean Architecture Layer: Interface (HTTP Controller)
 * Purpose: Expose CRUD endpoints for services with filtering capabilities
 *          to be consumed by the Next.js admin dashboard.
 *
 * Notes:
 * - This controller is admin-only and lives under /api/v1/admin/services.
 * - Supports full CRUD operations (Create, Read, Update, Delete).
 * - Provides filtering by category, published status, and search.
 */
class AdminServicesController extends Controller
{
    use BaseApiController;

    /**
     * Format a Service model for admin response.
     *
     * All fields are camelCase to align with frontend DTOs.
     */
    private function formatAdminService(Service $service): array
    {
        return [
            'id' => (string) $service->id,
            'title' => $service->title,
            'slug' => $service->slug,
            'summary' => $service->summary,
            'description' => $service->description,
            'body' => $service->body,
            'hero' => $service->hero,
            'contentSection' => $service->content_section,
            'ctaSection' => $service->cta_section,
            'icon' => $service->icon,
            'category' => $service->category,
            'views' => $service->views,
            'published' => (bool) $service->published,
            'publishAt' => optional($service->publish_at)->toIso8601String(),
            'createdAt' => optional($service->created_at)->toIso8601String(),
            'updatedAt' => optional($service->updated_at)->toIso8601String(),
        ];
    }

    /**
     * List services for admin dashboard.
     *
     * Optional query parameters:
     * - category (string)   : filter by category
     * - published (bool)    : filter by published flag
     * - search (string)     : search in title, summary, description
     *
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = Service::query();

        // Filter by category if provided
        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        // Filter by published flag if provided
        if ($request->has('published')) {
            $published = filter_var($request->input('published'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if (! is_null($published)) {
                $query->where('published', $published);
            }
        }

        // Search across title, summary, description
        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                    ->orWhere('summary', 'like', "%{$searchTerm}%")
                    ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }

        // Admin view: order by updated_at desc, then id desc as a stable tie-breaker
        $services = $query
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->get();

        return $this->collectionResponse(
            $services->map(fn (Service $service) => $this->formatAdminService($service))
        );
    }

    /**
     * Get a single service by ID.
     *
     * @param  string  $id
     * @return JsonResponse
     */
    public function show(string $id): JsonResponse
    {
        $service = Service::findOrFail($id);

        return $this->itemResponse($this->formatAdminService($service));
    }

    /**
     * Create a new service.
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:services,slug'],
            'summary' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'body' => ['nullable', 'string'],
            'hero' => ['nullable', 'array'],
            'contentSection' => ['nullable', 'array'],
            'ctaSection' => ['nullable', 'array'],
            'icon' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'published' => ['nullable', 'boolean'],
            'publishAt' => ['nullable', 'date'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors()->toArray());
        }

        $validated = $validator->validated();

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        // Map camelCase to snake_case for database
        $data = [
            'title' => $validated['title'],
            'slug' => $validated['slug'],
            'summary' => $validated['summary'] ?? null,
            'description' => $validated['description'] ?? null,
            'body' => $validated['body'] ?? null,
            'hero' => $validated['hero'] ?? null,
            'content_section' => $validated['contentSection'] ?? null,
            'cta_section' => $validated['ctaSection'] ?? null,
            'icon' => $validated['icon'] ?? null,
            'category' => $validated['category'] ?? null,
            'published' => $validated['published'] ?? false,
            'publish_at' => $validated['publishAt'] ?? null,
        ];

        $service = Service::create($data);

        return $this->itemResponse(
            $this->formatAdminService($service),
            201,
            'Service created successfully'
        );
    }

    /**
     * Update an existing service.
     *
     * @param  Request  $request
     * @param  string  $id
     * @return JsonResponse
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $service = Service::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('services', 'slug')->ignore($service->id)],
            'summary' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'body' => ['nullable', 'string'],
            'hero' => ['nullable', 'array'],
            'contentSection' => ['nullable', 'array'],
            'ctaSection' => ['nullable', 'array'],
            'icon' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'published' => ['nullable', 'boolean'],
            'publishAt' => ['nullable', 'date'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors()->toArray());
        }

        $validated = $validator->validated();

        // Map camelCase to snake_case for database
        $data = [];
        if (isset($validated['title'])) {
            $data['title'] = $validated['title'];
        }
        if (isset($validated['slug'])) {
            $data['slug'] = $validated['slug'];
        }
        if (array_key_exists('summary', $validated)) {
            $data['summary'] = $validated['summary'];
        }
        if (array_key_exists('description', $validated)) {
            $data['description'] = $validated['description'];
        }
        if (array_key_exists('body', $validated)) {
            $data['body'] = $validated['body'];
        }
        if (array_key_exists('hero', $validated)) {
            $data['hero'] = $validated['hero'];
        }
        if (array_key_exists('contentSection', $validated)) {
            $data['content_section'] = $validated['contentSection'];
        }
        if (array_key_exists('ctaSection', $validated)) {
            $data['cta_section'] = $validated['ctaSection'];
        }
        if (array_key_exists('icon', $validated)) {
            $data['icon'] = $validated['icon'];
        }
        if (array_key_exists('category', $validated)) {
            $data['category'] = $validated['category'];
        }
        if (array_key_exists('published', $validated)) {
            $data['published'] = $validated['published'];
        }
        if (array_key_exists('publishAt', $validated)) {
            $data['publish_at'] = $validated['publishAt'];
        }

        $service->update($data);

        return $this->itemResponse(
            $this->formatAdminService($service->fresh()),
            200,
            'Service updated successfully'
        );
    }

    /**
     * Delete a service (soft delete).
     *
     * @param  string  $id
     * @return JsonResponse
     */
    public function destroy(string $id): JsonResponse
    {
        $service = Service::findOrFail($id);
        $service->delete();

        return $this->itemResponse(
            null,
            200,
            'Service deleted successfully'
        );
    }
}
