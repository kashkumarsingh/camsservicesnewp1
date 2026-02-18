<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Admin Packages Controller (Interface Layer - API)
 *
 * Clean Architecture Layer: Interface (HTTP Controller)
 * Purpose: Expose CRUD endpoints for packages with filtering capabilities
 *          to be consumed by the Next.js admin dashboard.
 *
 * Notes:
 * - This controller is admin-only and lives under /api/v1/admin/packages.
 * - Supports full CRUD operations (Create, Read, Update, Delete).
 * - Provides filtering by age group, difficulty level, active status, and search.
 */
class AdminPackagesController extends Controller
{
    use BaseApiController;

    /**
     * Format a Package model for admin response.
     *
     * All fields are camelCase to align with frontend DTOs.
     */
    private function formatAdminPackage(Package $package): array
    {
        return [
            'id' => (string) $package->id,
            'name' => $package->name,
            'slug' => $package->slug,
            'description' => $package->description,
            'price' => (float) $package->price,
            'hours' => $package->hours,
            'durationWeeks' => $package->duration_weeks,
            'hoursPerWeek' => $package->hours_per_week,
            'hoursPerActivity' => (float) $package->hours_per_activity,
            'calculatedActivities' => $package->calculated_activities,
            'allowActivityOverride' => (bool) $package->allow_activity_override,
            'ageGroup' => $package->age_group,
            'difficultyLevel' => $package->difficulty_level,
            'maxParticipants' => $package->max_participants,
            'spotsRemaining' => $package->spots_remaining,
            'totalSpots' => $package->total_spots,
            'features' => $package->features ?? [],
            'perks' => $package->perks ?? [],
            'whatToExpect' => $package->what_to_expect,
            'requirements' => $package->requirements ?? [],
            'image' => $package->image,
            'color' => $package->color,
            'trustIndicators' => $package->trust_indicators ?? [],
            'isActive' => (bool) $package->is_active,
            'isPopular' => (bool) $package->is_popular,
            'views' => $package->views,
            'createdAt' => optional($package->created_at)->toIso8601String(),
            'updatedAt' => optional($package->updated_at)->toIso8601String(),
        ];
    }

    /**
     * List packages for admin dashboard.
     *
     * Optional query parameters:
     * - ageGroup (string)        : filter by age group
     * - difficultyLevel (string) : filter by difficulty level
     * - isActive (bool)          : filter by active status
     * - isPopular (bool)         : filter by popular status
     * - search (string)          : search in name, description
     *
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = Package::query();

        // Filter by age group if provided
        if ($request->filled('ageGroup')) {
            $query->where('age_group', $request->input('ageGroup'));
        }

        // Filter by difficulty level if provided
        if ($request->filled('difficultyLevel')) {
            $query->where('difficulty_level', $request->input('difficultyLevel'));
        }

        // Filter by active status if provided
        if ($request->has('isActive')) {
            $isActive = filter_var($request->input('isActive'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if (! is_null($isActive)) {
                $query->where('is_active', $isActive);
            }
        }

        // Filter by popular status if provided
        if ($request->has('isPopular')) {
            $isPopular = filter_var($request->input('isPopular'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if (! is_null($isPopular)) {
                $query->where('is_popular', $isPopular);
            }
        }

        // Search across name, description
        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }

        // Admin view: order by updated_at desc, then id desc as a stable tie-breaker
        $packages = $query
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->get();

        return $this->collectionResponse(
            $packages->map(fn (Package $package) => $this->formatAdminPackage($package))
        );
    }

    /**
     * Get a single package by ID.
     *
     * @param  string  $id
     * @return JsonResponse
     */
    public function show(string $id): JsonResponse
    {
        $package = Package::findOrFail($id);

        return $this->itemResponse($this->formatAdminPackage($package));
    }

    /**
     * Create a new package.
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:packages,slug'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'hours' => ['required', 'integer', 'min:1'],
            'durationWeeks' => ['nullable', 'integer', 'min:1'],
            'hoursPerWeek' => ['nullable', 'numeric', 'min:0'],
            'hoursPerActivity' => ['nullable', 'numeric', 'min:0.5'],
            'calculatedActivities' => ['nullable', 'integer', 'min:0'],
            'allowActivityOverride' => ['nullable', 'boolean'],
            'ageGroup' => ['nullable', 'string', 'max:100'],
            'difficultyLevel' => ['nullable', 'string', Rule::in(['beginner', 'intermediate', 'advanced'])],
            'maxParticipants' => ['nullable', 'integer', 'min:1'],
            'spotsRemaining' => ['nullable', 'integer', 'min:0'],
            'totalSpots' => ['nullable', 'integer', 'min:0'],
            'features' => ['nullable', 'array'],
            'perks' => ['nullable', 'array'],
            'whatToExpect' => ['nullable', 'string'],
            'requirements' => ['nullable', 'array'],
            'image' => ['nullable', 'string', 'max:500'],
            'color' => ['nullable', 'string', 'max:50'],
            'trustIndicators' => ['nullable', 'array'],
            'isActive' => ['nullable', 'boolean'],
            'isPopular' => ['nullable', 'boolean'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors()->toArray());
        }

        $validated = $validator->validated();

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Map camelCase to snake_case for database
        $data = [
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'hours' => $validated['hours'],
            'duration_weeks' => $validated['durationWeeks'] ?? null,
            'hours_per_week' => $validated['hoursPerWeek'] ?? null,
            'hours_per_activity' => $validated['hoursPerActivity'] ?? 3.0,
            'calculated_activities' => $validated['calculatedActivities'] ?? null,
            'allow_activity_override' => $validated['allowActivityOverride'] ?? false,
            'age_group' => $validated['ageGroup'] ?? null,
            'difficulty_level' => $validated['difficultyLevel'] ?? null,
            'max_participants' => $validated['maxParticipants'] ?? null,
            'spots_remaining' => $validated['spotsRemaining'] ?? 0,
            'total_spots' => $validated['totalSpots'] ?? 0,
            'features' => $validated['features'] ?? [],
            'perks' => $validated['perks'] ?? [],
            'what_to_expect' => $validated['whatToExpect'] ?? null,
            'requirements' => $validated['requirements'] ?? [],
            'image' => $validated['image'] ?? null,
            'color' => $validated['color'] ?? null,
            'trust_indicators' => $validated['trustIndicators'] ?? [],
            'is_active' => $validated['isActive'] ?? false,
            'is_popular' => $validated['isPopular'] ?? false,
        ];

        $package = Package::create($data);

        return $this->itemResponse(
            $this->formatAdminPackage($package),
            201,
            'Package created successfully'
        );
    }

    /**
     * Update an existing package.
     *
     * @param  Request  $request
     * @param  string  $id
     * @return JsonResponse
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $package = Package::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('packages', 'slug')->ignore($package->id)],
            'description' => ['nullable', 'string'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'hours' => ['sometimes', 'integer', 'min:1'],
            'durationWeeks' => ['nullable', 'integer', 'min:1'],
            'hoursPerWeek' => ['nullable', 'numeric', 'min:0'],
            'hoursPerActivity' => ['nullable', 'numeric', 'min:0.5'],
            'calculatedActivities' => ['nullable', 'integer', 'min:0'],
            'allowActivityOverride' => ['nullable', 'boolean'],
            'ageGroup' => ['nullable', 'string', 'max:100'],
            'difficultyLevel' => ['nullable', 'string', Rule::in(['beginner', 'intermediate', 'advanced'])],
            'maxParticipants' => ['nullable', 'integer', 'min:1'],
            'spotsRemaining' => ['nullable', 'integer', 'min:0'],
            'totalSpots' => ['nullable', 'integer', 'min:0'],
            'features' => ['nullable', 'array'],
            'perks' => ['nullable', 'array'],
            'whatToExpect' => ['nullable', 'string'],
            'requirements' => ['nullable', 'array'],
            'image' => ['nullable', 'string', 'max:500'],
            'color' => ['nullable', 'string', 'max:50'],
            'trustIndicators' => ['nullable', 'array'],
            'isActive' => ['nullable', 'boolean'],
            'isPopular' => ['nullable', 'boolean'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors()->toArray());
        }

        $validated = $validator->validated();

        // Map camelCase to snake_case for database
        $data = [];
        if (isset($validated['name'])) {
            $data['name'] = $validated['name'];
        }
        if (isset($validated['slug'])) {
            $data['slug'] = $validated['slug'];
        }
        if (array_key_exists('description', $validated)) {
            $data['description'] = $validated['description'];
        }
        if (isset($validated['price'])) {
            $data['price'] = $validated['price'];
        }
        if (isset($validated['hours'])) {
            $data['hours'] = $validated['hours'];
        }
        if (array_key_exists('durationWeeks', $validated)) {
            $data['duration_weeks'] = $validated['durationWeeks'];
        }
        if (array_key_exists('hoursPerWeek', $validated)) {
            $data['hours_per_week'] = $validated['hoursPerWeek'];
        }
        if (array_key_exists('hoursPerActivity', $validated)) {
            $data['hours_per_activity'] = $validated['hoursPerActivity'];
        }
        if (array_key_exists('calculatedActivities', $validated)) {
            $data['calculated_activities'] = $validated['calculatedActivities'];
        }
        if (array_key_exists('allowActivityOverride', $validated)) {
            $data['allow_activity_override'] = $validated['allowActivityOverride'];
        }
        if (array_key_exists('ageGroup', $validated)) {
            $data['age_group'] = $validated['ageGroup'];
        }
        if (array_key_exists('difficultyLevel', $validated)) {
            $data['difficulty_level'] = $validated['difficultyLevel'];
        }
        if (array_key_exists('maxParticipants', $validated)) {
            $data['max_participants'] = $validated['maxParticipants'];
        }
        if (array_key_exists('spotsRemaining', $validated)) {
            $data['spots_remaining'] = $validated['spotsRemaining'];
        }
        if (array_key_exists('totalSpots', $validated)) {
            $data['total_spots'] = $validated['totalSpots'];
        }
        if (array_key_exists('features', $validated)) {
            $data['features'] = $validated['features'];
        }
        if (array_key_exists('perks', $validated)) {
            $data['perks'] = $validated['perks'];
        }
        if (array_key_exists('whatToExpect', $validated)) {
            $data['what_to_expect'] = $validated['whatToExpect'];
        }
        if (array_key_exists('requirements', $validated)) {
            $data['requirements'] = $validated['requirements'];
        }
        if (array_key_exists('image', $validated)) {
            $data['image'] = $validated['image'];
        }
        if (array_key_exists('color', $validated)) {
            $data['color'] = $validated['color'];
        }
        if (array_key_exists('trustIndicators', $validated)) {
            $data['trust_indicators'] = $validated['trustIndicators'];
        }
        if (array_key_exists('isActive', $validated)) {
            $data['is_active'] = $validated['isActive'];
        }
        if (array_key_exists('isPopular', $validated)) {
            $data['is_popular'] = $validated['isPopular'];
        }

        $package->update($data);

        return $this->itemResponse(
            $this->formatAdminPackage($package->fresh()),
            200,
            'Package updated successfully'
        );
    }

    /**
     * Delete a package.
     *
     * @param  string  $id
     * @return JsonResponse
     */
    public function destroy(string $id): JsonResponse
    {
        $package = Package::findOrFail($id);
        $package->delete();

        return $this->itemResponse(
            null,
            200,
            'Package deleted successfully'
        );
    }
}
