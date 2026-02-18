<?php

namespace App\Http\Controllers\Api;

use App\Actions\Activities\GetActivityAction;
use App\Actions\Activities\ListActivitiesAction;
use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Activity Controller (Interface Layer - API)
 * 
 * Clean Architecture: Interface Layer (API Adapter)
 * Purpose: Handles HTTP requests for activities API endpoints
 * Location: backend/app/Http/Controllers/Api/ActivityController.php
 * 
 * This controller:
 * - Receives HTTP requests
 * - Calls Use Cases (Actions) from Application Layer
 * - Formats API responses (JSON) with camelCase keys for frontend compatibility
 * - Handles HTTP-specific concerns (status codes, headers, error handling)
 * 
 * The Interface Layer depends on Application and Domain layers
 * but can be swapped (REST → GraphQL) without changing business logic.
 */
class ActivityController extends Controller
{
    use BaseApiController;

    public function __construct(
        private GetActivityAction $getActivityAction,
        private ListActivitiesAction $listActivitiesAction
    ) {
    }

    /**
     * Format activity for API response (camelCase for frontend).
     *
     * @param Activity $activity
     * @return array
     */
    private function formatActivityResponse(Activity $activity): array
    {
        return [
            'id' => (string) $activity->id,
            'name' => $activity->name,
            'slug' => $activity->slug,
            'category' => $activity->category, // NEW: Activity category for filtering
            'description' => $activity->description,
            'imageUrl' => null, // image_url column removed from activities table
            'duration' => (float) $activity->duration,
            'difficultyLevel' => null, // difficulty_level not on activities table
            'ageGroupMin' => $activity->age_group_min, // camelCase for frontend
            'ageGroupMax' => $activity->age_group_max, // camelCase for frontend
            'ageGroup' => $activity->age_group_string, // Computed attribute
            'isActive' => (bool) $activity->is_active, // camelCase for frontend
            'createdAt' => $activity->created_at->toIso8601String(),
            'updatedAt' => $activity->updated_at->toIso8601String(),
        ];
    }

    /**
     * Get all activities.
     *
     * GET /api/v1/activities
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'category', // NEW: Filter by activity category
            'difficulty',
            'age_group',
            'active',
            'package_id',
            'trainer_id',
            'sort_by',
            'sort_order',
            'with_relations',
        ]);

        $activities = $this->listActivitiesAction->execute($filters);

        // Relationships are already eager loaded in the action to avoid N+1 queries

        return $this->collectionResponse(
            $activities->map(function ($activity) {
                return $this->formatActivityResponse($activity);
            })
        );
    }

    /**
     * Get an activity by slug.
     *
     * GET /api/v1/activities/{slug}
     * 
     * @param string $slug
     * @return JsonResponse
     */
    public function show(string $slug): JsonResponse
    {
        try {
            $activity = $this->getActivityAction->execute($slug);
            
            // Relationships are already eager loaded in the action to avoid N+1 queries

            $response = $this->successResponse($this->formatActivityResponse($activity));

            // Set ETag based on activity updated_at for cache invalidation
            $response->setEtag(md5($activity->id . $activity->updated_at->timestamp));

            return $response;
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Activity');
        }
    }
}

