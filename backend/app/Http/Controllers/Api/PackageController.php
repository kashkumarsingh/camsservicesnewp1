<?php

namespace App\Http\Controllers\Api;

use App\Actions\Packages\CalculatePackageMetricsAction;
use App\Actions\Packages\GetPackageAction;
use App\Actions\Packages\ListPackagesAction;
use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Package Controller (Interface Layer - API)
 * 
 * Clean Architecture: Interface Layer (API Adapter)
 * Purpose: Handles HTTP requests for packages API endpoints
 * Location: backend/app/Http/Controllers/Api/PackageController.php
 * 
 * This controller:
 * - Receives HTTP requests
 * - Calls Use Cases (Actions) from Application Layer
 * - Formats API responses (JSON) with camelCase keys for frontend compatibility
 * - Handles HTTP-specific concerns (status codes, headers)
 * 
 * The Interface Layer depends on:
 * - Application Layer (Actions)
 * - Domain Layer (Models - indirectly through Actions)
 * 
 * This layer can be swapped (REST → GraphQL) without changing
 * business logic in Application/Domain layers.
 */
class PackageController extends Controller
{
    use BaseApiController;

    public function __construct(
        private GetPackageAction $getPackageAction,
        private ListPackagesAction $listPackagesAction,
        private CalculatePackageMetricsAction $calculatePackageMetricsAction
    ) {
    }


    /**
     * Format package for API response (camelCase for frontend).
     *
     * @param Package $package
     * @return array
     */
    private function formatPackageResponse(Package $package): array
    {
        // Calculate hours per week if not set
        $hoursPerWeek = $package->hours_per_week ?? $package->calculateHoursPerWeek();

        // Ensure relationships are loaded via Eloquent (no direct DB queries here)
        if (! $package->relationLoaded('activities')) {
            $package->load('activities.trainers');
        }

        // Handle null relationships gracefully (activities)
        $activities = ($package->activities && $package->activities->isNotEmpty())
            ? $package->activities->map(function ($activity) {
                return [
                    'id' => (string) $activity->id,
                    'name' => $activity->name,
                    'slug' => $activity->slug,
                    'imageUrl' => null,
                    'duration' => (float) $activity->duration,
                    'description' => $activity->description,
                    'order' => $activity->pivot?->order ?? 0,
                    'trainers' => ($activity->trainers && $activity->trainers->isNotEmpty())
                        ? $activity->trainers->map(function ($trainer) {
                            return [
                                'id' => (string) $trainer->id,
                                'name' => $trainer->name,
                                'slug' => $trainer->slug,
                                'avatarUrl' => $trainer->image,
                                'role' => $trainer->role,
                                'rating' => $trainer->rating ? (float) $trainer->rating : null,
                                'totalReviews' => $trainer->total_reviews,
                                'specialties' => $trainer->specialties ?? [],
                            ];
                        })->values()->toArray()
                        : [],
                ];
            })->values()->toArray()
            : [];

        // Note: Trainers are associated with activities, not packages directly
        // Get unique trainers from all activities in this package
        $trainers = collect();
        if ($package->activities && $package->activities->isNotEmpty()) {
            foreach ($package->activities as $activity) {
                if ($activity->trainers && $activity->trainers->isNotEmpty()) {
                    $trainers = $trainers->merge($activity->trainers);
                }
            }
        }
        $trainers = $trainers->unique('id')->map(function ($trainer) {
            return [
                'id' => (string) $trainer->id,
                'name' => $trainer->name,
                'slug' => $trainer->slug,
                'avatarUrl' => $trainer->image,
                'role' => $trainer->role,
                'rating' => $trainer->rating ? (float) $trainer->rating : null,
                'totalReviews' => $trainer->total_reviews,
                'specialties' => $trainer->specialties ?? [],
                'experienceYears' => $trainer->experience_years ?? null,
                'isFeatured' => $trainer->is_featured ?? false,
            ];
        })->values()->toArray();

        // Testimonials (already eager loaded in actions)
        $testimonials = ($package->testimonials && $package->testimonials->isNotEmpty())
            ? $package->testimonials->map(function ($testimonial) {
            return [
                'id' => (string) $testimonial->id,
                'publicId' => $testimonial->public_id,
                'slug' => $testimonial->slug,
                'authorName' => $testimonial->author_name,
                'authorRole' => $testimonial->author_role,
                'authorAvatarUrl' => $testimonial->author_avatar_url,
                'quote' => $testimonial->quote,
                'rating' => $testimonial->rating,
                'sourceLabel' => $testimonial->source_label,
                'sourceType' => $testimonial->source_type,
                'sourceUrl' => $testimonial->source_url,
            ];
        })->values()->toArray()
            : [];

        // Use normalized accessors from Package model (Domain layer handles normalization)
        $features = $package->normalized_features;
        $requirements = $package->normalized_requirements;

        // Single API contract: camelCase only. Frontend types and uses only these keys.
        return [
            'id' => (string) $package->id,
            'name' => $package->name,
            'slug' => $package->slug,
            'description' => $package->description,
            'price' => (float) $package->price,
            'hours' => $package->hours,
            'duration' => $package->getDurationString(),
            'durationWeeks' => $package->duration_weeks,
            'hoursPerWeek' => $hoursPerWeek,
            'hoursPerActivity' => (float) ($package->hours_per_activity ?? 3.0),
            'calculatedActivities' => $package->calculated_activities ?? 0,
            'allowActivityOverride' => (bool) ($package->allow_activity_override ?? true),
            'ageGroup' => $package->age_group,
            'difficultyLevel' => $package->difficulty_level,
            'maxParticipants' => $package->max_participants,
            'spotsRemaining' => $package->spots_remaining,
            'totalSpots' => $package->total_spots,
            'features' => $features,
            'perks' => $package->perks ?? [],
            'activities' => $activities,
            'trainers' => $trainers,
            'whatToExpect' => $package->what_to_expect,
            'requirements' => $requirements,
            'image' => $package->image,
            'color' => $package->color,
            'popular' => $package->is_popular,
            'isActive' => (bool) $package->is_active,
            'views' => $package->views ?? 0,
            'canBeBooked' => $package->canBeBooked(),
            'hasAvailableSpots' => $package->hasAvailableSpots(),
            'isFullyBooked' => $package->isFullyBooked(),
            'availabilityPercentage' => $package->getAvailabilityPercentage(),
            'testimonials' => $testimonials,
            'trustIndicators' => $package->trust_indicators ?? [],
            'metrics' => [
                'activityCount' => count($activities),
                'trainerCount' => count($trainers),
                'pricePerHour' => $package->hours > 0 ? round($package->price / $package->hours, 2) : null,
                'spotsRemaining' => $package->spots_remaining,
                'totalSpots' => $package->total_spots,
            ],
            'createdAt' => $package->created_at->toIso8601String(),
            'updatedAt' => $package->updated_at->toIso8601String(),
        ];
    }

    /**
     * Get all packages.
     *
     * GET /api/v1/packages
     * Query param `q`: optional search term (uses Meilisearch/Scout when set).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'popular',
            'difficulty_level',
            'age_group',
            'price_min',
            'price_max',
            'has_spots',
            'sort_by',
            'sort_order',
        ]);

        $packages = $this->requestWantsSearch($request, 'q') && config('scout.driver') === 'meilisearch'
            ? $this->searchPackages($request->input('q'), $filters)
            : $this->listPackagesAction->execute($filters);

        // Calculate metrics efficiently (uses already loaded relationships)
        $metrics = $this->calculatePackageMetricsAction->execute($packages);

        $formattedPackages = $packages->map(fn ($package) => $this->formatPackageResponse($package));

        return $this->collectionResponse(
            $formattedPackages,
            null,
            ['metrics' => $metrics]
        );
    }

    /**
     * Search packages via Scout/Meilisearch with same filters and eager loading as list.
     *
     * @param string $query
     * @param array<string, mixed> $filters
     * @return \Illuminate\Database\Eloquent\Collection<int, Package>
     */
    private function searchPackages(string $query, array $filters): \Illuminate\Database\Eloquent\Collection
    {
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';

        $builder = Package::search($query)->query(function ($q) use ($filters, $sortBy, $sortOrder) {
            $q->active();
            if (! empty($filters['popular'])) {
                $q->popular();
            }
            if (! empty($filters['difficulty_level'])) {
                $q->byDifficulty($filters['difficulty_level']);
            }
            if (! empty($filters['age_group'])) {
                $q->byAgeGroup($filters['age_group']);
            }
            if (isset($filters['price_min'])) {
                $q->where('price', '>=', $filters['price_min']);
            }
            if (isset($filters['price_max'])) {
                $q->where('price', '<=', $filters['price_max']);
            }
            if (! empty($filters['has_spots'])) {
                $q->where('spots_remaining', '>', 0);
            }
            $q->with([
                'activities',
                'activities.trainers:id,name,slug,image,role,rating,total_reviews,specialties',
                'testimonials' => fn ($tq) => $tq->published()
                    ->select('testimonials.id', 'testimonials.public_id', 'testimonials.slug',
                        'testimonials.author_name', 'testimonials.author_role', 'testimonials.author_avatar_url',
                        'testimonials.quote', 'testimonials.rating', 'testimonials.source_label',
                        'testimonials.source_type', 'testimonials.source_url')
                    ->orderBy('package_testimonial.order'),
            ])->orderBy($sortBy, $sortOrder);
        });

        return $builder->take(100)->get();
    }

    /**
     * Whether the request has a non-empty search query param.
     *
     * @param Request $request
     * @param string $param
     * @return bool
     */
    private function requestWantsSearch(Request $request, string $param = 'q'): bool
    {
        $value = $request->input($param);

        return is_string($value) && trim($value) !== '';
    }

    /**
     * Get a package by slug.
     *
     * GET /api/v1/packages/{slug}
     * 
     * @param string $slug
     * @return JsonResponse
     */
    public function show(string $slug): JsonResponse
    {
        try {
            $package = $this->getPackageAction->execute($slug);
            
            // Trainers are already eager loaded in the action to avoid N+1 queries
            
            // Increment view counter (this happens after cache check, so views are still accurate)
            $package->incrementViews();

            $response = $this->successResponse(
                $this->formatPackageResponse($package)
            );

            // Set ETag based on package updated_at for cache invalidation
            $response->setEtag(md5($package->id . $package->updated_at->timestamp));

            return $response;
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Package');
        }
    }
}
