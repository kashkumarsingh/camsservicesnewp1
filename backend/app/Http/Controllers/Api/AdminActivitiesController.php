<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Admin Activities Controller (Interface Layer - API)
 *
 * Clean Architecture Layer: Interface (HTTP Controller)
 * Purpose: Expose CRUD endpoints for activities with simple filtering
 *          to be consumed by the Next.js admin dashboard.
 *
 * Notes:
 * - This controller is admin-only and lives under /api/v1/admin/activities.
 * - Supports full CRUD operations (Create, Read, Update, Delete).
 * - Provides filtering by category, active status, and search.
 */
class AdminActivitiesController extends Controller
{
    use BaseApiController;

    /**
     * Format an Activity model for admin response.
     *
     * All fields are camelCase to align with frontend DTOs.
     */
    private function formatAdminActivity(Activity $activity): array
    {
        return [
            'id' => (string) $activity->id,
            'name' => $activity->name,
            'slug' => $activity->slug,
            'category' => $activity->category,
            'description' => $activity->description,
            'duration' => $activity->duration !== null ? (float) $activity->duration : null,
            'isActive' => (bool) $activity->is_active,
            'createdAt' => optional($activity->created_at)->toIso8601String(),
            'updatedAt' => optional($activity->updated_at)->toIso8601String(),
        ];
    }

    /**
     * List activities for admin dashboard.
     *
     * Optional query parameters:
     * - category (string) : filter by category
     * - isActive (bool)   : filter by active status
     * - search (string)   : search in name, category, description
     *
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = Activity::query();

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->has('isActive')) {
            $isActive = filter_var($request->input('isActive'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if (! is_null($isActive)) {
                $query->where('is_active', $isActive);
            }
        }

        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('category', 'like', "%{$searchTerm}%")
                    ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }

        $activities = $query
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->get();

        return $this->collectionResponse(
            $activities->map(fn (Activity $activity) => $this->formatAdminActivity($activity))
        );
    }

    /**
     * Get a single activity by ID.
     */
    public function show(string $id): JsonResponse
    {
        $activity = Activity::findOrFail($id);

        return $this->itemResponse($this->formatAdminActivity($activity));
    }

    /**
     * Create a new activity.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:activities,slug'],
            'category' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'duration' => ['required', 'numeric', 'min:0.25', 'max:8'],
            'isActive' => ['nullable', 'boolean'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors()->toArray());
        }

        $validated = $validator->validated();

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $data = [
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'category' => $validated['category'] ?? null,
            'description' => $validated['description'] ?? null,
            'duration' => $validated['duration'],
            'is_active' => $validated['isActive'] ?? true,
        ];

        $activity = Activity::create($data);

        return $this->itemResponse(
            $this->formatAdminActivity($activity),
            201,
            'Activity created successfully'
        );
    }

    /**
     * Update an existing activity.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $activity = Activity::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('activities', 'slug')->ignore($activity->id)],
            'category' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'duration' => ['nullable', 'numeric', 'min:0.25', 'max:8'],
            'isActive' => ['nullable', 'boolean'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors()->toArray());
        }

        $validated = $validator->validated();

        $data = [];
        if (isset($validated['name'])) {
            $data['name'] = $validated['name'];
        }
        if (isset($validated['slug'])) {
            $data['slug'] = $validated['slug'];
        }
        if (array_key_exists('category', $validated)) {
            $data['category'] = $validated['category'];
        }
        if (array_key_exists('description', $validated)) {
            $data['description'] = $validated['description'];
        }
        if (array_key_exists('duration', $validated)) {
            $data['duration'] = $validated['duration'];
        }
        if (array_key_exists('isActive', $validated)) {
            $data['is_active'] = $validated['isActive'];
        }

        $activity->update($data);

        return $this->itemResponse(
            $this->formatAdminActivity($activity->fresh()),
            200,
            'Activity updated successfully'
        );
    }

    /**
     * Delete an activity (soft delete).
     */
    public function destroy(string $id): JsonResponse
    {
        $activity = Activity::findOrFail($id);
        $activity->delete();

        return $this->successResponse(null, 'Activity deleted successfully', 204);
    }
}

