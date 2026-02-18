<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trainer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

/**
 * Trainer Profile Controller
 * 
 * Clean Architecture: Interface Layer
 * Purpose: Handles trainer profile management operations
 * Location: backend/app/Http/Controllers/Api/TrainerProfileController.php
 */
class TrainerProfileController extends Controller
{
    /**
     * Get trainer profile
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Get trainer model linked to this user
        $trainer = Trainer::where('user_id', $user->id)->first();
        
        if (!$trainer) {
            return response()->json([
                'success' => false,
                'message' => 'Trainer profile not found. Please contact admin.',
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'profile' => [
                    'id' => $trainer->id,
                    'name' => $trainer->name,
                    'slug' => $trainer->slug,
                    'role' => $trainer->role,
                    'bio' => $trainer->bio,
                    'full_description' => $trainer->full_description,
                    'image' => $trainer->image,
                    'rating' => (float) $trainer->rating,
                    'total_reviews' => $trainer->total_reviews,
                    'specialties' => $trainer->specialties ?? [],
                    'certifications' => $trainer->certifications ?? [],
                    'experience_years' => $trainer->experience_years,
                    'availability_notes' => $trainer->availability_notes,
                    'home_postcode' => $trainer->home_postcode,
                    'travel_radius_km' => $trainer->travel_radius_km,
                    'service_area_postcodes' => $trainer->service_area_postcodes ?? [],
                    'preferred_age_groups' => $trainer->preferred_age_groups ?? [],
                    'availability_preferences' => $trainer->availability_preferences ?? [],
                    'is_active' => $trainer->is_active,
                    'created_at' => $trainer->created_at->toIso8601String(),
                    'updated_at' => $trainer->updated_at->toIso8601String(),
                ],
            ],
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ], 200);
    }
    
    /**
     * Update trainer profile
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Get trainer model linked to this user
        $trainer = Trainer::where('user_id', $user->id)->first();
        
        if (!$trainer) {
            return response()->json([
                'success' => false,
                'message' => 'Trainer profile not found. Please contact admin.',
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'role' => ['sometimes', 'string', 'max:100'],
            'bio' => ['sometimes', 'string', 'max:500'],
            'full_description' => ['sometimes', 'nullable', 'string'],
            'specialties' => ['sometimes', 'array'],
            'specialties.*' => ['string', 'max:100'],
            'experience_years' => ['sometimes', 'integer', 'min:0', 'max:50'],
            'availability_notes' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'home_postcode' => ['sometimes', 'nullable', 'string', 'max:12'],
            'travel_radius_km' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:200'],
            'service_area_postcodes' => ['sometimes', 'nullable', 'array'],
            'service_area_postcodes.*' => ['string', 'max:12'],
            'preferred_age_groups' => ['sometimes', 'nullable', 'array'],
            'preferred_age_groups.*' => ['string', 'max:50'],
            'availability_preferences' => ['sometimes', 'nullable', 'array'],
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }
        
        // Update allowed fields
        $allowedFields = [
            'name',
            'role',
            'bio',
            'full_description',
            'specialties',
            'experience_years',
            'availability_notes',
            'home_postcode',
            'travel_radius_km',
            'service_area_postcodes',
            'preferred_age_groups',
            'availability_preferences',
        ];
        
        $updateData = [];
        foreach ($allowedFields as $field) {
            if ($request->has($field)) {
                $updateData[$field] = $request->input($field);
            }
        }
        
        // Update slug if name changed
        if (isset($updateData['name']) && $updateData['name'] !== $trainer->name) {
            $updateData['slug'] = Str::slug($updateData['name']) . '-' . $trainer->id;
        }
        
        $trainer->update($updateData);
        
        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => [
                'profile' => [
                    'id' => $trainer->id,
                    'name' => $trainer->name,
                    'slug' => $trainer->slug,
                    'role' => $trainer->role,
                    'bio' => $trainer->bio,
                    'full_description' => $trainer->full_description,
                    'specialties' => $trainer->specialties ?? [],
                    'experience_years' => $trainer->experience_years,
                    'availability_notes' => $trainer->availability_notes,
                    'home_postcode' => $trainer->home_postcode,
                    'travel_radius_km' => $trainer->travel_radius_km,
                    'service_area_postcodes' => $trainer->service_area_postcodes ?? [],
                    'preferred_age_groups' => $trainer->preferred_age_groups ?? [],
                    'availability_preferences' => $trainer->availability_preferences ?? [],
                    'updated_at' => $trainer->updated_at->toIso8601String(),
                ],
            ],
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ], 200);
    }
    
    /**
     * Upload profile image
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Get trainer model linked to this user
        $trainer = Trainer::where('user_id', $user->id)->first();
        
        if (!$trainer) {
            return response()->json([
                'success' => false,
                'message' => 'Trainer profile not found.',
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'image' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2048'], // 2MB max
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }
        
        // Delete old image if exists
        if ($trainer->image) {
            Storage::disk('public')->delete($trainer->image);
        }
        
        // Store new image
        $imagePath = $request->file('image')->store('trainers', 'public');
        
        // Get the filename from the path (e.g., "trainers/abc123.jpg" -> "abc123.jpg")
        $filename = basename($imagePath);
        
        $trainer->update(['image' => $imagePath]);
        
        // Return full URL for the image
        $imageUrl = url('/storage/trainers/' . $filename);
        
        return response()->json([
            'success' => true,
            'message' => 'Image uploaded successfully',
            'data' => [
                'image' => $imageUrl,
                'image_path' => $imagePath,
            ],
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ], 200);
    }
    
    /**
     * Upload qualification/certification document
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function uploadQualification(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Get trainer model linked to this user
        $trainer = Trainer::where('user_id', $user->id)->first();
        
        if (!$trainer) {
            return response()->json([
                'success' => false,
                'message' => 'Trainer profile not found.',
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'file' => ['required', 'file', 'mimes:pdf,jpeg,jpg,png', 'max:5120'], // 5MB max
            'name' => ['required', 'string', 'max:100'],
            'year' => ['sometimes', 'nullable', 'integer', 'min:1900', 'max:' . date('Y')],
            'issuer' => ['sometimes', 'nullable', 'string', 'max:100'],
            'expiry_date' => ['sometimes', 'nullable', 'date', 'date_format:Y-m-d'],
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }
        
        // Store file
        $filePath = $request->file('file')->store('trainers/qualifications', 'public');
        
        // Get the filename from the path
        $filename = basename($filePath);
        
        // Get existing certifications
        $certifications = $trainer->certifications ?? [];
        
        // Return full URL for the file
        $fileUrl = url('/storage/trainers/qualifications/' . $filename);
        
        // Add new certification
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
        
        return response()->json([
            'success' => true,
            'message' => 'Qualification uploaded successfully',
            'data' => [
                'certification' => end($certifications),
                'certifications' => $certifications,
            ],
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ], 200);
    }
    
    /**
     * Delete qualification/certification
     * 
     * @param Request $request
     * @param string $certificationId
     * @return JsonResponse
     */
    public function deleteQualification(Request $request, string $certificationId): JsonResponse
    {
        $user = $request->user();
        
        // Get trainer model linked to this user
        $trainer = Trainer::where('user_id', $user->id)->first();
        
        if (!$trainer) {
            return response()->json([
                'success' => false,
                'message' => 'Trainer profile not found.',
            ], 404);
        }
        
        $certifications = $trainer->certifications ?? [];
        
        // Find and remove certification
        $certifications = array_filter($certifications, function ($cert) use ($certificationId) {
            return ($cert['id'] ?? null) !== $certificationId;
        });
        
        // Re-index array
        $certifications = array_values($certifications);
        
        $trainer->update(['certifications' => $certifications]);
        
        return response()->json([
            'success' => true,
            'message' => 'Qualification deleted successfully',
            'data' => [
                'certifications' => $certifications,
            ],
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ], 200);
    }
    
    /**
     * Update availability preferences
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function updateAvailability(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Get trainer model linked to this user
        $trainer = Trainer::where('user_id', $user->id)->first();
        
        if (!$trainer) {
            return response()->json([
                'success' => false,
                'message' => 'Trainer profile not found.',
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'availability_preferences' => ['required', 'array'],
            'availability_notes' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $updateData = [
            'availability_preferences' => $request->input('availability_preferences'),
        ];
        
        if ($request->has('availability_notes')) {
            $updateData['availability_notes'] = $request->input('availability_notes');
        }
        
        $trainer->update($updateData);
        
        return response()->json([
            'success' => true,
            'message' => 'Availability updated successfully',
            'data' => [
                'availability_preferences' => $trainer->availability_preferences ?? [],
                'availability_notes' => $trainer->availability_notes,
            ],
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ], 200);
    }
}

