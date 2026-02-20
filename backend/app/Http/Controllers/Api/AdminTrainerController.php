<?php

namespace App\Http\Controllers\Api;

use App\Actions\TrainerAvailability\GetTrainerAvailabilityDatesAction;
use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\Trainer;
use App\Models\TrainerAbsenceRequest;
use App\Models\TrainerAvailability;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

/**
 * Admin Trainer Controller (Interface Layer - API)
 *
 * Clean Architecture: Interface Layer (API Adapter)
 * Purpose: Provides admin-only endpoints for managing all trainers
 * Guards: Protected by auth:sanctum + admin middleware (see routes/api.php)
 */
class AdminTrainerController extends Controller
{
    use BaseApiController;

    public function __construct(
        private readonly GetTrainerAvailabilityDatesAction $getTrainerAvailabilityDates
    ) {
    }

    /**
     * List all trainers for the admin dashboard.
     *
     * GET /api/v1/admin/trainers
     *
     * Supported query parameters:
     * - is_active: filter by active status (true/false)
     * - has_certifications: filter trainers with certifications (true/false)
     * - service_region: filter by service region
     * - search: search by name or email
     * - limit: max number of records to return (default: 100, max: 200)
     * - offset: offset for pagination (default: 0)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Trainer::query()
                ->with(['user', 'activities']);

            // Filter by active status
            if ($isActive = $request->query('is_active')) {
                $query->where('is_active', filter_var($isActive, FILTER_VALIDATE_BOOLEAN));
            }

            // Filter by certifications
            if ($hasCertifications = $request->query('has_certifications')) {
                if (filter_var($hasCertifications, FILTER_VALIDATE_BOOLEAN)) {
                    $query->whereNotNull('certifications')
                        ->whereRaw('JSON_LENGTH(certifications) > 0');
                } else {
                    $query->whereNull('certifications')
                        ->orWhereRaw('JSON_LENGTH(certifications) = 0');
                }
            }

            // Filter by service region
            if ($region = $request->query('service_region')) {
                $query->whereJsonContains('service_area_postcodes', $region);
            }

            // Search by name or email
            if ($search = $request->query('search')) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhereHas('user', function ($userQuery) use ($search) {
                          $userQuery->where('email', 'LIKE', "%{$search}%");
                      });
                });
            }

            $limit = max(1, min($request->integer('limit', 100), 200));
            $offset = max(0, $request->integer('offset', 0));

            $totalCount = (clone $query)->count();

            $trainers = $query
                ->orderBy('name', 'asc')
                ->skip($offset)
                ->take($limit)
                ->get();

            $formatted = $trainers->map(function (Trainer $trainer) {
                $user = $trainer->user;
                $activities = $trainer->activities->map(function ($activity) {
                    return [
                        'id' => (string) $activity->id,
                        'name' => $activity->name,
                        'isPrimary' => (bool) $activity->pivot->is_primary,
                    ];
                });

                return [
                    'id' => (string) $trainer->id,
                    'userId' => $user ? (string) $user->id : null,
                    'name' => $trainer->name,
                    'slug' => $trainer->slug,
                    'email' => $user?->email,
                    'role' => $trainer->role,
                    'bio' => $trainer->bio,
                    'fullDescription' => $trainer->full_description,
                    'image' => $trainer->image
                        ? (str_starts_with($trainer->image, 'http')
                            ? $trainer->image
                            : url('/storage/' . ltrim($trainer->image, '/')))
                        : null,
                    'rating' => (float) $trainer->rating,
                    'totalReviews' => $trainer->total_reviews,
                    'specialties' => $trainer->specialties ?? [],
                    'certifications' => $trainer->certifications ?? [],
                    'experienceYears' => $trainer->experience_years,
                    'homePostcode' => $trainer->home_postcode,
                    'travelRadiusKm' => $trainer->travel_radius_km,
                    'serviceAreaPostcodes' => $trainer->service_area_postcodes ?? [],
                    'preferredAgeGroups' => $trainer->preferred_age_groups ?? [],
                    'isActive' => (bool) $trainer->is_active,
                    'isFeatured' => (bool) $trainer->is_featured,
                    'views' => $trainer->views,
                    'activities' => $activities,
                    'userApprovalStatus' => $user?->approval_status,
                    'createdAt' => $trainer->created_at?->toIso8601String(),
                    'updatedAt' => $trainer->updated_at?->toIso8601String(),
                ];
            });

            return $this->collectionResponse(
                $formatted,
                null,
                [
                    'limit' => $limit,
                    'offset' => $offset,
                    'total_count' => $totalCount,
                ]
            );
        } catch (\Exception $e) {
            Log::error('Error listing admin trainers', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to retrieve trainers for admin dashboard.');
        }
    }

    /**
     * Get a single trainer by ID with full details.
     *
     * GET /api/v1/admin/trainers/{id}
     */
    public function show(string $id): JsonResponse
    {
        try {
            $trainer = Trainer::with([
                'user',
                'activities',
                'availability',
                'emergencyContacts',
            ])->findOrFail($id);

            $user = $trainer->user;
            $activities = $trainer->activities->map(function ($activity) {
                return [
                    'id' => (string) $activity->id,
                    'name' => $activity->name,
                    'slug' => $activity->slug,
                    'isPrimary' => (bool) ($activity->pivot?->is_primary ?? false),
                ];
            });

            $data = [
                'id' => (string) $trainer->id,
                'userId' => $user ? (string) $user->id : null,
                'name' => $trainer->name,
                'slug' => $trainer->slug,
                'email' => $user?->email,
                'role' => $trainer->role,
                'bio' => $trainer->bio,
                'fullDescription' => $trainer->full_description,
                'image' => $trainer->image
                    ? (str_starts_with($trainer->image, 'http')
                        ? $trainer->image
                        : url('/storage/' . ltrim($trainer->image, '/')))
                    : null,
                'rating' => (float) $trainer->rating,
                'totalReviews' => $trainer->total_reviews,
                'specialties' => $trainer->specialties ?? [],
                'excludedActivityIds' => $trainer->excluded_activity_ids ?? [],
                'exclusionReason' => $trainer->exclusion_reason,
                'certifications' => $trainer->certifications ?? [],
                'experienceYears' => $trainer->experience_years,
                'availabilityNotes' => $trainer->availability_notes,
                'homePostcode' => $trainer->home_postcode,
                'travelRadiusKm' => $trainer->travel_radius_km,
                'serviceAreaPostcodes' => $trainer->service_area_postcodes ?? [],
                'preferredAgeGroups' => $trainer->preferred_age_groups ?? [],
                'availabilityPreferences' => $trainer->availability_preferences ?? [],
                'isActive' => (bool) $trainer->is_active,
                'isFeatured' => (bool) $trainer->is_featured,
                'views' => $trainer->views,
                'activities' => $activities,
                'userApprovalStatus' => $user?->approval_status,
                'createdAt' => $trainer->created_at?->toIso8601String(),
                'updatedAt' => $trainer->updated_at?->toIso8601String(),
            ];

            return $this->successResponse($data);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Trainer');
        } catch (\Exception $e) {
            Log::error('Error retrieving admin trainer', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to retrieve trainer.');
        }
    }

    /**
     * Create a new trainer.
     *
     * POST /api/v1/admin/trainers
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:8',
                'role' => 'nullable|string|max:100',
                'bio' => 'nullable|string',
                'full_description' => 'nullable|string',
                'image' => 'nullable|url',
                'specialties' => 'nullable|array',
                'certifications' => 'nullable|array',
                'experience_years' => 'nullable|integer|min:0',
                'home_postcode' => 'nullable|string|max:20',
                'travel_radius_km' => 'nullable|integer|min:0',
                'service_area_postcodes' => 'nullable|array',
                'preferred_age_groups' => 'nullable|array',
                'is_active' => 'nullable|boolean',
                'activity_ids' => 'nullable|array',
                'activity_ids.*' => 'exists:activities,id',
            ]);

            DB::beginTransaction();

            // Create user account (User model uses 'name', not first_name/last_name)
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'trainer',
                'approval_status' => 'approved', // Admin-created trainers are auto-approved
                'approved_at' => now(),
                'approved_by' => auth()->id(),
            ]);

            // Create trainer profile
            $trainer = Trainer::create([
                'user_id' => $user->id,
                'name' => $validated['name'],
                'slug' => Str::slug($validated['name']),
                'role' => $validated['role'] ?? null,
                'bio' => $validated['bio'] ?? null,
                'full_description' => $validated['full_description'] ?? null,
                'image' => $validated['image'] ?? null,
                'specialties' => $validated['specialties'] ?? [],
                'certifications' => $validated['certifications'] ?? [],
                'experience_years' => $validated['experience_years'] ?? null,
                'home_postcode' => $validated['home_postcode'] ?? null,
                'travel_radius_km' => $validated['travel_radius_km'] ?? null,
                'service_area_postcodes' => $validated['service_area_postcodes'] ?? [],
                'preferred_age_groups' => $validated['preferred_age_groups'] ?? [],
                'is_active' => $validated['is_active'] ?? true,
                'rating' => 0.0,
                'total_reviews' => 0,
            ]);

            // Attach activities
            if (isset($validated['activity_ids'])) {
                $trainer->activities()->attach($validated['activity_ids']);
            }

            DB::commit();

            // Reload relationships
            $trainer->load(['user', 'activities']);

            $data = [
                'id' => (string) $trainer->id,
                'userId' => (string) $user->id,
                'name' => $trainer->name,
                'slug' => $trainer->slug,
                'email' => $user->email,
                'isActive' => (bool) $trainer->is_active,
            ];

            return $this->successResponse($data, 'Trainer created successfully.', [], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating trainer', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to create trainer.');
        }
    }

    /**
     * Update a trainer.
     *
     * PUT /api/v1/admin/trainers/{id}
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $trainer = Trainer::findOrFail($id);

            $validated = $request->validate([
                'name' => 'nullable|string|max:255',
                'role' => 'nullable|string|max:100',
                'bio' => 'nullable|string',
                'full_description' => 'nullable|string',
                'image' => 'nullable|url',
                'specialties' => 'nullable|array',
                'certifications' => 'nullable|array',
                'experience_years' => 'nullable|integer|min:0',
                'home_postcode' => 'nullable|string|max:20',
                'travel_radius_km' => 'nullable|integer|min:0',
                'service_area_postcodes' => 'nullable|array',
                'preferred_age_groups' => 'nullable|array',
                'is_active' => 'nullable|boolean',
                'is_featured' => 'nullable|boolean',
                'activity_ids' => 'nullable|array',
                'activity_ids.*' => 'exists:activities,id',
            ]);

            DB::beginTransaction();

            // Update trainer
            $trainer->update(array_filter([
                'name' => $validated['name'] ?? $trainer->name,
                'slug' => isset($validated['name']) ? Str::slug($validated['name']) : $trainer->slug,
                'role' => $validated['role'] ?? $trainer->role,
                'bio' => $validated['bio'] ?? $trainer->bio,
                'full_description' => $validated['full_description'] ?? $trainer->full_description,
                'image' => $validated['image'] ?? $trainer->image,
                'specialties' => $validated['specialties'] ?? $trainer->specialties,
                'certifications' => $validated['certifications'] ?? $trainer->certifications,
                'experience_years' => $validated['experience_years'] ?? $trainer->experience_years,
                'home_postcode' => $validated['home_postcode'] ?? $trainer->home_postcode,
                'travel_radius_km' => $validated['travel_radius_km'] ?? $trainer->travel_radius_km,
                'service_area_postcodes' => $validated['service_area_postcodes'] ?? $trainer->service_area_postcodes,
                'preferred_age_groups' => $validated['preferred_age_groups'] ?? $trainer->preferred_age_groups,
                'is_active' => $validated['is_active'] ?? $trainer->is_active,
                'is_featured' => $validated['is_featured'] ?? $trainer->is_featured,
            ], fn($value) => $value !== null));

            // Sync activities
            if (isset($validated['activity_ids'])) {
                $trainer->activities()->sync($validated['activity_ids']);
            }

            DB::commit();

            // Reload relationships
            $trainer->load(['user', 'activities']);

            $data = [
                'id' => (string) $trainer->id,
                'name' => $trainer->name,
                'slug' => $trainer->slug,
                'isActive' => (bool) $trainer->is_active,
                'isFeatured' => (bool) $trainer->is_featured,
                'updatedAt' => $trainer->updated_at?->toIso8601String(),
            ];

            return $this->successResponse($data, 'Trainer updated successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Trainer');
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating trainer', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to update trainer.');
        }
    }

    /**
     * Upload or replace a trainer's profile image (admin-managed).
     *
     * POST /api/v1/admin/trainers/{id}/image
     */
    public function uploadImage(Request $request, string $id): JsonResponse
    {
        try {
            $trainer = Trainer::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'image' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2048'],
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            // Delete old image if present
            if ($trainer->image) {
                Storage::disk('public')->delete($trainer->image);
            }

            // Store new image
            $imagePath = $request->file('image')->store('trainers', 'public');
            $filename = basename($imagePath);

            $trainer->update(['image' => $imagePath]);

            $imageUrl = url('/storage/trainers/' . $filename);

            return $this->successResponse([
                'image' => $imageUrl,
                'image_path' => $imagePath,
            ], 'Trainer image uploaded successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Trainer');
        } catch (\Exception $e) {
            Log::error('Error uploading trainer image (admin)', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to upload trainer image.');
        }
    }

    /**
     * Upload a qualification/certification document for a trainer (admin-managed).
     *
     * POST /api/v1/admin/trainers/{id}/qualifications
     */
    public function uploadQualification(Request $request, string $id): JsonResponse
    {
        try {
            $trainer = Trainer::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'file' => ['required', 'file', 'mimes:pdf,jpeg,jpg,png', 'max:5120'],
                'name' => ['required', 'string', 'max:100'],
                'year' => ['sometimes', 'nullable', 'integer', 'min:1900', 'max:' . date('Y')],
                'issuer' => ['sometimes', 'nullable', 'string', 'max:100'],
                'expiry_date' => ['sometimes', 'nullable', 'date', 'date_format:Y-m-d'],
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            // Store file
            $filePath = $request->file('file')->store('trainers/qualifications', 'public');
            $filename = basename($filePath);

            // Existing certifications (array of objects)
            $certifications = $trainer->certifications ?? [];

            $fileUrl = url('/storage/trainers/qualifications/' . $filename);

            $certifications[] = [
                'id' => Str::uuid()->toString(),
                'name' => $request->input('name'),
                'year' => $request->input('year'),
                'issuer' => $request->input('issuer'),
                'file_path' => $filePath,
                'file_url' => $fileUrl,
                'uploaded_at' => now()->toIso8601String(),
                'expiry_date' => $request->input('expiry_date'),
            ];

            $trainer->update(['certifications' => $certifications]);

            return $this->successResponse([
                'certification' => end($certifications),
                'certifications' => $certifications,
            ], 'Qualification uploaded successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Trainer');
        } catch (\Exception $e) {
            Log::error('Error uploading trainer qualification (admin)', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to upload qualification.');
        }
    }

    /**
     * Delete a qualification/certification (admin-managed).
     *
     * DELETE /api/v1/admin/trainers/{id}/qualifications/{certificationId}
     */
    public function deleteQualification(Request $request, string $id, string $certificationId): JsonResponse
    {
        try {
            $trainer = Trainer::findOrFail($id);

            $certifications = $trainer->certifications ?? [];

            // Optionally delete underlying file
            foreach ($certifications as $cert) {
                if (($cert['id'] ?? null) === $certificationId && !empty($cert['file_path'])) {
                    Storage::disk('public')->delete($cert['file_path']);
                    break;
                }
            }

            // Filter out the removed certification
            $certifications = array_values(array_filter($certifications, function ($cert) use ($certificationId) {
                return ($cert['id'] ?? null) !== $certificationId;
            }));

            $trainer->update(['certifications' => $certifications]);

            return $this->successResponse([
                'certifications' => $certifications,
            ], 'Qualification deleted successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Trainer');
        } catch (\Exception $e) {
            Log::error('Error deleting trainer qualification (admin)', [
                'id' => $id,
                'certificationId' => $certificationId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to delete qualification.');
        }
    }

    /**
     * Delete a trainer.
     *
     * DELETE /api/v1/admin/trainers/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $trainer = Trainer::findOrFail($id);

            // Check if trainer has any bookings
            $bookingCount = $trainer->bookingSchedules()->count();
            if ($bookingCount > 0) {
                return $this->errorResponse(
                    "Cannot delete trainer with {$bookingCount} booking(s). Please reassign or cancel bookings first.",
                    'TRAINER_HAS_BOOKINGS',
                    ['booking_count' => $bookingCount],
                    400
                );
            }

            DB::beginTransaction();

            // Detach activities
            $trainer->activities()->detach();

            // Delete trainer (soft delete if implemented)
            $trainer->delete();

            DB::commit();

            return $this->successResponse(null, 'Trainer deleted successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Trainer');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting trainer', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to delete trainer.');
        }
    }

    /**
     * Activate/deactivate a trainer.
     *
     * PUT /api/v1/admin/trainers/{id}/activate
     */
    public function activate(Request $request, string $id): JsonResponse
    {
        try {
            $trainer = Trainer::findOrFail($id);

            $validated = $request->validate([
                'is_active' => 'required|boolean',
            ]);

            $trainer->is_active = $validated['is_active'];
            $trainer->save();

            $data = [
                'id' => (string) $trainer->id,
                'name' => $trainer->name,
                'isActive' => (bool) $trainer->is_active,
                'updatedAt' => $trainer->updated_at?->toIso8601String(),
            ];

            $message = $validated['is_active']
                ? 'Trainer activated successfully.'
                : 'Trainer deactivated successfully.';

            return $this->successResponse($data, $message);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Trainer');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Error activating/deactivating trainer', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to update trainer status.');
        }
    }

    /**
     * Export trainers to CSV.
     *
     * GET /api/v1/admin/trainers/export
     */
    public function export(Request $request)
    {
        try {
            $query = Trainer::query()
                ->with(['user', 'activities']);

            // Apply same filters as index
            if ($isActive = $request->query('is_active')) {
                $query->where('is_active', filter_var($isActive, FILTER_VALIDATE_BOOLEAN));
            }
            if ($hasCertifications = $request->query('has_certifications')) {
                if (filter_var($hasCertifications, FILTER_VALIDATE_BOOLEAN)) {
                    $query->whereNotNull('certifications')
                        ->whereRaw('JSON_LENGTH(certifications) > 0');
                } else {
                    $query->whereNull('certifications')
                        ->orWhereRaw('JSON_LENGTH(certifications) = 0');
                }
            }
            if ($region = $request->query('service_region')) {
                $query->whereJsonContains('service_area_postcodes', $region);
            }
            if ($search = $request->query('search')) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhereHas('user', function ($userQuery) use ($search) {
                          $userQuery->where('email', 'LIKE', "%{$search}%");
                      });
                });
            }

            $trainers = $query->orderBy('name', 'asc')->get();

            // Build CSV content
            $csvData = [];
            $csvData[] = [
                'ID',
                'Name',
                'Email',
                'Role',
                'Experience Years',
                'Certifications',
                'Specialties',
                'Home Postcode',
                'Travel Radius (km)',
                'Service Regions',
                'Preferred Age Groups',
                'Activities',
                'Is Active',
                'Is Featured',
                'Rating',
                'Total Reviews',
                'Views',
                'Created At',
            ];

            foreach ($trainers as $trainer) {
                $user = $trainer->user;
                $activities = $trainer->activities->pluck('name')->join(', ');
                $certifications = is_array($trainer->certifications)
                    ? implode('; ', $trainer->certifications)
                    : '';
                $specialties = is_array($trainer->specialties)
                    ? implode(', ', $trainer->specialties)
                    : '';
                $serviceRegions = is_array($trainer->service_area_postcodes)
                    ? implode(', ', $trainer->service_area_postcodes)
                    : '';
                $ageGroups = is_array($trainer->preferred_age_groups)
                    ? implode(', ', $trainer->preferred_age_groups)
                    : '';

                $csvData[] = [
                    $trainer->id,
                    $trainer->name,
                    $user?->email ?? 'N/A',
                    $trainer->role ?? 'N/A',
                    $trainer->experience_years ?? 'N/A',
                    $certifications,
                    $specialties,
                    $trainer->home_postcode ?? 'N/A',
                    $trainer->travel_radius_km ?? 'N/A',
                    $serviceRegions,
                    $ageGroups,
                    $activities,
                    $trainer->is_active ? 'Yes' : 'No',
                    $trainer->is_featured ? 'Yes' : 'No',
                    $trainer->rating,
                    $trainer->total_reviews,
                    $trainer->views,
                    $trainer->created_at?->toIso8601String() ?? 'N/A',
                ];
            }

            // Generate CSV
            $filename = 'trainers-export-' . now()->format('Y-m-d') . '.csv';
            $handle = fopen('php://temp', 'r+');
            
            foreach ($csvData as $row) {
                fputcsv($handle, $row);
            }
            
            rewind($handle);
            $csv = stream_get_contents($handle);
            fclose($handle);

            return response($csv, 200)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");

        } catch (\Exception $e) {
            Log::error('Error exporting trainers', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to export trainers.');
        }
    }

    /**
     * Get trainer availability for a date range (for admin schedule timeline).
     * GET /api/v1/admin/trainers/availability?date_from=Y-m-d&date_to=Y-m-d
     * Returns which trainers are available when, so admin can assign sessions.
     * If trainer_availabilities table does not exist yet, returns empty slots (no error).
     */
    public function availability(Request $request): JsonResponse
    {
        $request->validate([
            'date_from' => ['required', 'date'],
            'date_to' => ['required', 'date', 'after_or_equal:date_from'],
        ]);

        $dateFrom = Carbon::parse($request->date_from)->startOfDay();
        $dateTo = Carbon::parse($request->date_to)->endOfDay();

        // Cap range to avoid excessive work (e.g. 93 days ~ 3 months)
        $maxDays = 93;
        if ($dateFrom->diffInDays($dateTo, false) > $maxDays) {
            $dateTo = $dateFrom->copy()->addDays($maxDays);
        }

        $trainers = Trainer::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $availabilities = collect();
        if (Schema::hasTable('trainer_availabilities')) {
            try {
                $availabilities = TrainerAvailability::whereIn('trainer_id', $trainers->pluck('id'))
                    ->get();
            } catch (\Throwable $e) {
                Log::warning('Trainer availability query failed; returning empty slots', [
                    'message' => $e->getMessage(),
                ]);
            }
        }

        $result = $trainers->map(function (Trainer $trainer) use ($availabilities, $dateFrom, $dateTo) {
            $trainerAvail = $availabilities->where('trainer_id', $trainer->id);
            $slots = [];

            foreach ($trainerAvail as $av) {
                if ($av->specific_date !== null) {
                    $d = $av->specific_date->format('Y-m-d');
                    if ($d >= $dateFrom->format('Y-m-d') && $d <= $dateTo->format('Y-m-d')) {
                        $slots[] = [
                            'date' => $d,
                            'startTime' => $av->start_time,
                            'endTime' => $av->end_time,
                            'isAvailable' => $av->is_available,
                        ];
                    }
                } else {
                    $dayOfWeek = (int) $av->day_of_week;
                    $current = $dateFrom->copy();
                    while ($current->lte($dateTo)) {
                        if ($current->dayOfWeek === $dayOfWeek) {
                            $slots[] = [
                                'date' => $current->format('Y-m-d'),
                                'startTime' => $av->start_time,
                                'endTime' => $av->end_time,
                                'isAvailable' => $av->is_available,
                            ];
                        }
                        $current->addDay();
                    }
                }
            }

            return [
                'id' => (string) $trainer->id,
                'name' => $trainer->name,
                'slots' => $slots,
            ];
        });

        return $this->successResponse(
            ['trainers' => $result->values()],
            null,
            [
                'dateFrom' => $dateFrom->format('Y-m-d'),
                'dateTo' => $dateTo->format('Y-m-d'),
            ]
        );
    }

    /**
     * Get availability dates for one trainer (synced from trainer dashboard).
     * GET /api/v1/admin/trainers/{id}/availability-dates?date_from=Y-m-d&date_to=Y-m-d
     * Delegates to GetTrainerAvailabilityDatesAction (same contract as trainer endpoint).
     */
    public function availabilityDates(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'date_from' => ['required', 'date'],
            'date_to' => ['required', 'date', 'after_or_equal:date_from'],
        ]);

        $trainer = Trainer::find($id);
        if (! $trainer) {
            return $this->notFoundResponse('Trainer');
        }

        $result = $this->getTrainerAvailabilityDates->execute(
            (int) $trainer->id,
            Carbon::parse($request->date_from),
            Carbon::parse($request->date_to)
        );

        return $this->successResponse(
            [
                'dates' => $result['dates'],
                'unavailable_dates' => $result['unavailable_dates'],
            ],
            null,
            [
                'date_from' => $result['date_from'],
                'date_to' => $result['date_to'],
            ]
        );
    }

    /**
     * Get absence dates for all active trainers in a range (for admin schedule grid).
     * GET /api/v1/admin/trainers/absence-dates?date_from=Y-m-d&date_to=Y-m-d
     */
    public function absenceDatesBulk(Request $request): JsonResponse
    {
        $request->validate([
            'date_from' => ['required', 'date'],
            'date_to' => ['required', 'date', 'after_or_equal:date_from'],
        ]);

        $dateFrom = Carbon::parse($request->date_from)->startOfDay();
        $dateTo = Carbon::parse($request->date_to)->endOfDay();
        $maxDays = 93;
        if ($dateFrom->diffInDays($dateTo, false) > $maxDays) {
            $dateTo = $dateFrom->copy()->addDays($maxDays);
        }

        $trainers = Trainer::where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $trainerIds = $trainers->pluck('id')->toArray();

        $requests = TrainerAbsenceRequest::whereIn('trainer_id', $trainerIds)
            ->whereIn('status', [TrainerAbsenceRequest::STATUS_APPROVED, TrainerAbsenceRequest::STATUS_PENDING])
            ->where(function ($q) use ($dateFrom, $dateTo) {
                $q->whereBetween('date_from', [$dateFrom, $dateTo])
                    ->orWhereBetween('date_to', [$dateFrom, $dateTo])
                    ->orWhere(function ($q2) use ($dateFrom, $dateTo) {
                        $q2->where('date_from', '<=', $dateFrom)->where('date_to', '>=', $dateTo);
                    });
            })
            ->orderBy('date_from')
            ->get(['trainer_id', 'date_from', 'date_to', 'status']);

        $byTrainer = [];
        foreach ($trainerIds as $tid) {
            $byTrainer[$tid] = ['approved_dates' => [], 'pending_dates' => []];
        }
        foreach ($requests as $req) {
            $start = Carbon::parse($req->date_from);
            $end = Carbon::parse($req->date_to);
            $cursor = $start->copy();
            while ($cursor->lte($end)) {
                $d = $cursor->format('Y-m-d');
                if ($cursor->between($dateFrom, $dateTo)) {
                    if ($req->status === TrainerAbsenceRequest::STATUS_APPROVED) {
                        $byTrainer[$req->trainer_id]['approved_dates'][] = $d;
                    } else {
                        $byTrainer[$req->trainer_id]['pending_dates'][] = $d;
                    }
                }
                $cursor->addDay();
            }
        }

        $result = $trainers->map(function (Trainer $t) use ($byTrainer) {
            $data = $byTrainer[$t->id] ?? ['approved_dates' => [], 'pending_dates' => []];
            return [
                'id' => (string) $t->id,
                'name' => $t->name,
                'approved_dates' => array_values(array_unique($data['approved_dates'])),
                'pending_dates' => array_values(array_unique($data['pending_dates'])),
            ];
        });

        return $this->successResponse(
            ['trainers' => $result->values()],
            null,
            [
                'date_from' => $dateFrom->format('Y-m-d'),
                'date_to' => $dateTo->format('Y-m-d'),
            ]
        );
    }

    /**
     * Get absence dates for one trainer (approved + pending) in a range.
     * Used by admin trainer availability panel so admin calendar matches trainer calendar.
     * GET /api/v1/admin/trainers/{id}/absence-dates?date_from=Y-m-d&date_to=Y-m-d
     */
    public function absenceDates(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'date_from' => ['required', 'date'],
            'date_to' => ['required', 'date', 'after_or_equal:date_from'],
        ]);

        $trainer = Trainer::find($id);
        if (! $trainer) {
            return $this->notFoundResponse('Trainer');
        }

        $dateFrom = Carbon::parse($request->date_from)->startOfDay();
        $dateTo = Carbon::parse($request->date_to)->endOfDay();
        $maxDays = 93;
        if ($dateFrom->diffInDays($dateTo, false) > $maxDays) {
            $dateTo = $dateFrom->copy()->addDays($maxDays);
        }

        $requests = TrainerAbsenceRequest::where('trainer_id', $trainer->id)
            ->whereIn('status', [TrainerAbsenceRequest::STATUS_APPROVED, TrainerAbsenceRequest::STATUS_PENDING])
            ->where(function ($q) use ($dateFrom, $dateTo) {
                $q->whereBetween('date_from', [$dateFrom, $dateTo])
                    ->orWhereBetween('date_to', [$dateFrom, $dateTo])
                    ->orWhere(function ($q2) use ($dateFrom, $dateTo) {
                        $q2->where('date_from', '<=', $dateFrom)->where('date_to', '>=', $dateTo);
                    });
            })
            ->orderBy('date_from')
            ->get(['id', 'date_from', 'date_to', 'status']);

        $approvedDates = [];
        $pendingDates = [];
        foreach ($requests as $req) {
            $start = Carbon::parse($req->date_from);
            $end = Carbon::parse($req->date_to);
            $cursor = $start->copy();
            while ($cursor->lte($end)) {
                $d = $cursor->format('Y-m-d');
                if ($cursor->between($dateFrom, $dateTo)) {
                    if ($req->status === TrainerAbsenceRequest::STATUS_APPROVED) {
                        $approvedDates[] = $d;
                    } else {
                        $pendingDates[] = $d;
                    }
                }
                $cursor->addDay();
            }
        }

        return $this->successResponse(
            [
                'approved_dates' => array_values(array_unique($approvedDates)),
                'pending_dates' => array_values(array_unique($pendingDates)),
            ],
            null,
            [
                'date_from' => $dateFrom->format('Y-m-d'),
                'date_to' => $dateTo->format('Y-m-d'),
            ]
        );
    }
}
