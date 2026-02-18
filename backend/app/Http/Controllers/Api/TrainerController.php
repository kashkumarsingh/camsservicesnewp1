<?php

namespace App\Http\Controllers\Api;

use App\Actions\Trainers\GetTrainerAction;
use App\Actions\Trainers\ListTrainersAction;
use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\Trainer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Trainer Controller (Interface Layer - API)
 * 
 * Clean Architecture: Interface Layer (API Adapter)
 * Purpose: Handles HTTP requests for trainers API endpoints
 * Location: backend/app/Http/Controllers/Api/TrainerController.php
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
class TrainerController extends Controller
{
    use BaseApiController;

    public function __construct(
        private GetTrainerAction $getTrainerAction,
        private ListTrainersAction $listTrainersAction
    ) {
    }

    /**
     * Normalize specialties array - handle both formats:
     * - Simple array: ['Specialty 1', 'Specialty 2']
     * - Object array: [{'specialty': 'Specialty 1'}, {'specialty': 'Specialty 2'}]
     *
     * @param mixed $specialties
     * @return array
     */
    private function normalizeSpecialties($specialties): array
    {
        if (empty($specialties) || !is_array($specialties)) {
            return [];
        }

        $normalized = [];
        foreach ($specialties as $specialty) {
            if (is_string($specialty)) {
                $normalized[] = $specialty;
            } elseif (is_array($specialty) && isset($specialty['specialty'])) {
                $normalized[] = $specialty['specialty'];
            } elseif (is_array($specialty) && isset($specialty[0])) {
                // Handle edge case where it's an array with numeric keys
                $normalized[] = is_string($specialty[0]) ? $specialty[0] : (string) $specialty[0];
            }
        }

        return $normalized;
    }

    /**
     * Extract region from UK postcode (simplified version matching frontend logic)
     * Handles both full postcodes (e.g., "AL10 9DA") and postcode prefixes (e.g., "AL10", "WD")
     *
     * @param string $postcode
     * @return string
     */
    private function getRegionFromPostcode(string $postcode): string
    {
        if (empty($postcode)) {
            return 'Unknown';
        }

        $postcode = strtoupper(trim($postcode));
        // Remove spaces and extract letter prefix (handles both "AL10 9DA" and "AL10")
        $postcodeWithoutSpaces = str_replace(' ', '', $postcode);
        $area = preg_replace('/\d.*/', '', $postcodeWithoutSpaces); // Extract letter prefix

        // UK County/Region mapping (matching frontend locationUtils.ts)
        $regionMap = [
            'AL' => 'Hertfordshire',
            'WD' => 'Hertfordshire',
            'SG' => 'Hertfordshire',
            'HP' => 'Hertfordshire',
            'W' => 'Greater London',
            'WC' => 'Greater London',
            'SW' => 'Greater London',
            'SE' => 'Greater London',
            'E' => 'Greater London',
            'EC' => 'Greater London',
            'N' => 'Greater London',
            'NW' => 'Greater London',
            'CM' => 'Essex',
            'SS' => 'Essex',
            'CO' => 'Essex',
            // Add more as needed
        ];

        return $regionMap[$area] ?? 'Other';
    }

    /**
     * Normalize certifications array - handle both formats:
     * - Simple array: ['Certification 1', 'Certification 2']
     * - Object array: [{'name': 'Certification 1', 'year': 2020}, ...]
     *
     * @param mixed $certifications
     * @return array
     */
    private function normalizeCertifications($certifications): array
    {
        if (empty($certifications) || !is_array($certifications)) {
            return [];
        }

        $normalized = [];
        foreach ($certifications as $cert) {
            if (is_string($cert)) {
                $normalized[] = $cert;
            } elseif (is_array($cert) && isset($cert['name'])) {
                // Format: "Certification Name (Year)" or just "Certification Name"
                $certName = $cert['name'];
                if (isset($cert['year']) && $cert['year']) {
                    $normalized[] = $certName . ' (' . $cert['year'] . ')';
                } else {
                    $normalized[] = $certName;
                }
            }
        }

        return $normalized;
    }

    /**
     * Format trainer for API response (matching frontend expectations).
     *
     * @param Trainer $trainer
     * @return array
     */
    private function formatTrainerResponse(Trainer $trainer): array
    {
        // Normalize specialties and certifications to handle both repeater and seeder formats
        $specialties = $this->normalizeSpecialties($trainer->specialties);
        $certifications = $this->normalizeCertifications($trainer->certifications);
        
        // Format image as object with src and alt
        $imageSrc = $trainer->image ?? '/images/team/trainner-1.webp';
        $imageAlt = $trainer->name . ' - ' . $trainer->role;
        
        // Capabilities can be derived from specialties (or stored separately in future)
        $capabilities = $specialties; // Use normalized specialties

        // Derive service regions from postcodes
        $serviceRegions = [];
        if ($trainer->service_area_postcodes && is_array($trainer->service_area_postcodes)) {
            // Extract region from each postcode
            foreach ($trainer->service_area_postcodes as $postcode) {
                $region = $this->getRegionFromPostcode($postcode);
                if ($region && $region !== 'Unknown' && $region !== 'Other') {
                    $serviceRegions[] = $region;
                }
            }
        }
        // If no service_area_postcodes but has home_postcode, derive region from home
        if (empty($serviceRegions) && $trainer->home_postcode) {
            $region = $this->getRegionFromPostcode($trainer->home_postcode);
            if ($region && $region !== 'Unknown' && $region !== 'Other') {
                $serviceRegions[] = $region;
            }
        }
        $serviceRegions = array_unique($serviceRegions); // Remove duplicates

        return [
            'id' => (string) $trainer->id,
            'name' => $trainer->name,
            'slug' => $trainer->slug,
            'role' => $trainer->role,
            'summary' => $trainer->bio, // Frontend expects 'summary', backend has 'bio'
            'description' => $trainer->full_description, // Frontend expects 'description', backend has 'full_description'
            'rating' => (float) $trainer->rating,
            'image' => [
                'src' => $imageSrc,
                'alt' => $imageAlt,
            ],
            'certifications' => $certifications, // Normalized to string array
            'specialties' => $specialties, // Normalized to string array
            'capabilities' => $capabilities, // Frontend required - derived from normalized specialties
            'available' => $trainer->is_active, // Frontend expects 'available', backend has 'is_active'
            'experience_years' => $trainer->experience_years, // Will be camelCased by frontend
            'views' => $trainer->views ?? 0, // Frontend required
            // Location data for filtering
            'home_postcode' => $trainer->home_postcode,
            'travel_radius_km' => $trainer->travel_radius_km,
            'service_area_postcodes' => $trainer->service_area_postcodes ?? [],
            'service_regions' => $serviceRegions, // Frontend expects this for location filtering
            'created_at' => $trainer->created_at->toIso8601String(),
            'updated_at' => $trainer->updated_at->toIso8601String(),
        ];
    }

    /**
     * Get all active trainers.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $filters = [];
        
        if ($request->has('featured')) {
            $filters['featured'] = $request->boolean('featured');
        }

        if ($request->has('min_rating')) {
            $filters['min_rating'] = $request->input('min_rating');
        }

        if ($request->has('min_experience')) {
            $filters['min_experience'] = $request->input('min_experience');
        }

        if ($request->has('package_id')) {
            $filters['package_id'] = $request->input('package_id');
        }

        if ($request->has('available')) {
            // Frontend uses 'available', backend uses 'is_active'
            $filters['available'] = $request->boolean('available');
        }

        if ($request->has('with_relations')) {
            $filters['with_relations'] = $request->boolean('with_relations');
        }

        if ($request->has('sort_by')) {
            $filters['sort_by'] = $request->input('sort_by');
        }

        if ($request->has('sort_order')) {
            $filters['sort_order'] = $request->input('sort_order');
        }

        $trainers = $this->listTrainersAction->execute($filters);

        return $this->collectionResponse(
            $trainers->map(function ($trainer) {
                return $this->formatTrainerResponse($trainer);
            })
        );
    }

    /**
     * Get a trainer by slug.
     *
     * @param string $slug
     * @param Request $request
     * @return JsonResponse
     */
    public function show(string $slug, Request $request): JsonResponse
    {
        try {
            $loadRelations = $request->boolean('with_relations', true);
            $trainer = $this->getTrainerAction->execute($slug, $loadRelations);
            
            // Increment view counter (this happens after cache check, so views are still accurate)
            $trainer->incrementViews();

            $response = $this->formatTrainerResponse($trainer);
            
            // Add additional fields for detail page
            $response['total_reviews'] = $trainer->total_reviews;
            $response['formatted_rating'] = $trainer->getFormattedRating();
            $response['is_highly_rated'] = $trainer->isHighlyRated();
            $response['is_experienced'] = $trainer->isExperienced();
            $response['availability_notes'] = $trainer->availability_notes;
            $response['is_featured'] = $trainer->is_featured;
            
            // Add packages if loaded
            if ($trainer->relationLoaded('packages')) {
                $response['packages'] = $trainer->packages->map(fn($p) => [
                    'id' => (string) $p->id,
                    'name' => $p->name,
                    'slug' => $p->slug,
                    'price' => (float) $p->price,
                    'hours' => $p->hours,
                    'duration_weeks' => $p->duration_weeks,
                ]);
            }
            
            // Add user if loaded
            if ($trainer->relationLoaded('user') && $trainer->user) {
                $response['user'] = [
                    'id' => (string) $trainer->user->id,
                    'name' => $trainer->user->name,
                    'email' => $trainer->user->email,
                ];
            }

            $jsonResponse = $this->successResponse($response);

            // Set ETag based on trainer updated_at for cache invalidation
            $jsonResponse->setEtag(md5($trainer->id . $trainer->updated_at->timestamp));

            return $jsonResponse;
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Trainer');
        }
    }
}
